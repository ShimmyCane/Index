-- ============================================================================
-- Adventure — tables, change log and rollback
-- Family Supabase project. Signed-in users only. Prefix: adv_
-- Every change to roles, entries, chapters and turns is copied into
-- adv_history, so any edit can be rolled back by version or by date.
-- ============================================================================

-- Characters the family can play. Roles, not players.
create table public.adv_roles (
    id          uuid primary key default gen_random_uuid(),
    key         text not null unique,                 -- short id used in beats and whispers: 'bristle'
    name        text not null,
    emoji       text not null default '🙂',
    color       text not null default '#F9C8A8',
    blurb       text not null default '',             -- who they are, shown under the picture
    voice       text not null default '',             -- how they speak, for the storyteller
    active      boolean not null default true,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);
alter table public.adv_roles enable row level security;

-- Everything else the storyteller reads, as plain text: world, history,
-- plan, themes, rules, notes, settings.
create table public.adv_entries (
    id          uuid primary key default gen_random_uuid(),
    kind        text not null check (kind in ('world', 'character', 'history', 'plan', 'theme', 'rule', 'note', 'setting')),
    title       text not null,
    body        text not null default '',
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);
alter table public.adv_entries enable row level security;

-- One row per chapter, written three lengths so the page can fit the catch-up
-- to how long it has been. whispers = { role_key: text only that role hears }.
create table public.adv_chapters (
    id          uuid primary key default gen_random_uuid(),
    book        integer not null default 1,
    number      integer not null,
    title       text not null,
    text_tiny   text not null default '',             -- a couple of sentences
    text_short  text not null default '',             -- about a minute
    text_long   text not null default '',             -- about five minutes read aloud
    whispers    jsonb not null default '{}'::jsonb,
    prompt      text not null default '',             -- the question the chapter ends on
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (book, number)
);
alter table public.adv_chapters enable row level security;

-- A scene the family sends: an ordered list of beats
-- [{ "role": "bristle", "text": "...", "at": "2026-10-27T19:02:11Z" }, ...]
create table public.adv_turns (
    id          uuid primary key default gen_random_uuid(),
    chapter_id  uuid references public.adv_chapters (id) on delete set null,
    beats       jsonb not null check (jsonb_typeof(beats) = 'array'),
    status      text not null default 'waiting' check (status in ('waiting', 'used')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
alter table public.adv_turns enable row level security;

-- Storyteller run log. The page reads it to say "still asleep" or "writing".
create table public.adv_runs (
    id           uuid primary key default gen_random_uuid(),
    started_at   timestamptz not null default now(),
    finished_at  timestamptz,
    status       text not null default 'running' check (status in ('running', 'done', 'failed')),
    turns_used   integer not null default 0,
    note         text not null default ''
);
alter table public.adv_runs enable row level security;

-- Change log. Written only by the trigger below.
create table public.adv_history (
    id          bigint generated always as identity primary key,
    at          timestamptz not null default now(),
    table_name  text not null,
    row_id      uuid not null,
    action      text not null check (action in ('insert', 'update', 'delete')),
    old_row     jsonb,
    new_row     jsonb,
    actor       text not null
);
alter table public.adv_history enable row level security;
create index adv_history_row_idx on public.adv_history (table_name, row_id, id desc);
create index adv_history_at_idx on public.adv_history (at desc);

-- ---------------------------------------------------------------------------
-- Policies: the family account can do everything; history is read-only.
-- ---------------------------------------------------------------------------
create policy "Authenticated can manage adv_roles"    on public.adv_roles    for all to authenticated using (true) with check (true);
create policy "Authenticated can manage adv_entries"  on public.adv_entries  for all to authenticated using (true) with check (true);
create policy "Authenticated can manage adv_chapters" on public.adv_chapters for all to authenticated using (true) with check (true);
create policy "Authenticated can manage adv_turns"    on public.adv_turns    for all to authenticated using (true) with check (true);
create policy "Authenticated can manage adv_runs"     on public.adv_runs     for all to authenticated using (true) with check (true);
create policy "Authenticated can read adv_history"    on public.adv_history  for select to authenticated using (true);

revoke all on public.adv_roles, public.adv_entries, public.adv_chapters,
              public.adv_turns, public.adv_runs, public.adv_history from anon;
revoke insert, update, delete, truncate on public.adv_history from authenticated;

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at, and log every change.
-- actor: 'family' when signed in through the page, 'claude' otherwise
-- (the storyteller works through the database connection), unless a session
-- sets adv.actor itself.
-- ---------------------------------------------------------------------------
create function public.adv_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
    new.updated_at := now();
    return new;
end $$;

create function public.adv_log_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
    v_actor text := coalesce(
        nullif(current_setting('adv.actor', true), ''),
        case when auth.uid() is not null then 'family' else 'claude' end);
begin
    insert into public.adv_history (table_name, row_id, action, old_row, new_row, actor)
    values (
        tg_table_name,
        case when tg_op = 'DELETE' then old.id else new.id end,
        lower(tg_op),
        case when tg_op = 'INSERT' then null else to_jsonb(old) end,
        case when tg_op = 'DELETE' then null else to_jsonb(new) end,
        v_actor);
    return null;
end $$;

revoke execute on function public.adv_touch(), public.adv_log_change() from public, anon, authenticated;

create trigger adv_roles_touch    before update on public.adv_roles    for each row execute function public.adv_touch();
create trigger adv_entries_touch  before update on public.adv_entries  for each row execute function public.adv_touch();
create trigger adv_chapters_touch before update on public.adv_chapters for each row execute function public.adv_touch();
create trigger adv_turns_touch    before update on public.adv_turns    for each row execute function public.adv_touch();

create trigger adv_roles_log    after insert or update or delete on public.adv_roles    for each row execute function public.adv_log_change();
create trigger adv_entries_log  after insert or update or delete on public.adv_entries  for each row execute function public.adv_log_change();
create trigger adv_chapters_log after insert or update or delete on public.adv_chapters for each row execute function public.adv_log_change();
create trigger adv_turns_log    after insert or update or delete on public.adv_turns    for each row execute function public.adv_log_change();

-- ---------------------------------------------------------------------------
-- Rollback.
-- adv_restore(id): put one row back the way it was just before that change
--   (an undone insert deletes the row). The restore is itself logged.
-- adv_restore_to(time, tables): undo every logged change after that time,
--   newest first. Turns are left alone unless named.
-- ---------------------------------------------------------------------------
create function public.adv_restore(p_history_id bigint) returns text
language plpgsql set search_path = '' as $$
declare
    h      public.adv_history;
    v_set  text;
begin
    select * into h from public.adv_history where id = p_history_id;
    if not found then
        raise exception 'No history entry %', p_history_id;
    end if;
    if h.table_name not in ('adv_roles', 'adv_entries', 'adv_chapters', 'adv_turns') then
        raise exception 'Cannot restore table %', h.table_name;
    end if;

    if h.old_row is null then
        execute format('delete from public.%I where id = $1', h.table_name) using h.row_id;
        return 'deleted';
    end if;

    select string_agg(format('%I = excluded.%I', column_name, column_name), ', ')
      into v_set
      from information_schema.columns
     where table_schema = 'public' and table_name = h.table_name and column_name <> 'id';

    execute format(
        'insert into public.%I select * from jsonb_populate_record(null::public.%I, $1) on conflict (id) do update set %s',
        h.table_name, h.table_name, v_set)
    using h.old_row;
    return 'restored';
end $$;

create function public.adv_restore_to(
    p_at     timestamptz,
    p_tables text[] default array['adv_roles', 'adv_entries', 'adv_chapters']
) returns integer
language plpgsql set search_path = '' as $$
declare
    v_ids bigint[];
    v_id  bigint;
begin
    select array_agg(id order by id desc) into v_ids
      from public.adv_history
     where at > p_at and table_name = any (p_tables);
    if v_ids is null then
        return 0;
    end if;
    foreach v_id in array v_ids loop
        perform public.adv_restore(v_id);
    end loop;
    return array_length(v_ids, 1);
end $$;

revoke execute on function public.adv_restore(bigint), public.adv_restore_to(timestamptz, text[]) from public, anon;
grant execute on function public.adv_restore(bigint), public.adv_restore_to(timestamptz, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Registry
-- ---------------------------------------------------------------------------
insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('adventure', 'adv_roles',      'table',    'owner', 'Characters the family can play (roles, not players).',            'ShimmyCane/Index'),
('adventure', 'adv_entries',    'table',    'owner', 'World bible, history, plan, themes, rules, notes, settings as text.', 'ShimmyCane/Index'),
('adventure', 'adv_chapters',   'table',    'owner', 'Story chapters in three lengths, with per-role whispers.',          'ShimmyCane/Index'),
('adventure', 'adv_turns',      'table',    'owner', 'Scenes the family sends: ordered beats by role.',                   'ShimmyCane/Index'),
('adventure', 'adv_runs',       'table',    'owner', 'Nightly storyteller run log.',                                      'ShimmyCane/Index'),
('adventure', 'adv_history',    'table',    'owner', 'Change log for roles, entries, chapters and turns.',                'ShimmyCane/Index'),
('adventure', 'adv_touch',      'function', 'owner', 'Keeps updated_at current.',                                         'ShimmyCane/Index'),
('adventure', 'adv_log_change', 'function', 'owner', 'Trigger that copies every change into adv_history.',                'ShimmyCane/Index'),
('adventure', 'adv_restore',    'function', 'owner', 'Puts one row back as it was before a logged change.',               'ShimmyCane/Index'),
('adventure', 'adv_restore_to', 'function', 'owner', 'Undoes every logged change after a time.',                          'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
