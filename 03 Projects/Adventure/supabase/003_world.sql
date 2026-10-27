-- ============================================================================
-- Adventure — world-building tools
-- Places (a tree; each place is a map of its children), an append-only
-- journal about any character or place, and planned chapters for the plot.
-- Runs after 001_adventure.sql.
-- ============================================================================

-- Places: world → regions → towns → buildings → rooms. Each child sits on its
-- parent's map as a box (x, y, w, h in percent of the map).
create table public.adv_places (
    id          uuid primary key default gen_random_uuid(),
    parent_id   uuid references public.adv_places (id) on delete set null,
    kind        text not null default 'region'
                check (kind in ('world', 'region', 'town', 'building', 'room', 'wild', 'other')),
    name        text not null,
    emoji       text not null default '📍',
    color       text not null default '#CDEFE0',
    summary     text not null default '',
    x           real not null default 10,
    y           real not null default 10,
    w           real not null default 26,
    h           real not null default 20,
    sort        integer not null default 0,
    updated_at  timestamptz not null default now()
);
alter table public.adv_places enable row level security;

-- Journal: notes appended to a character (adv_roles), a place (adv_places)
-- or a story note (adv_entries, e.g. a non-playable character). Newest first.
create table public.adv_notes (
    id            uuid primary key default gen_random_uuid(),
    subject_type  text not null check (subject_type in ('role', 'place', 'entry')),
    subject_id    uuid not null,
    body          text not null,
    chapter_id    uuid references public.adv_chapters (id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);
alter table public.adv_notes enable row level security;
create index adv_notes_subject_idx on public.adv_notes (subject_type, subject_id, created_at desc);

-- Plot: chapters can be planned ahead. The player page shows published ones only.
alter table public.adv_chapters
    add column status text not null default 'published' check (status in ('planned', 'published')),
    add column plan   text not null default '';

create policy "Authenticated can manage adv_places" on public.adv_places for all to authenticated using (true) with check (true);
create policy "Authenticated can manage adv_notes"  on public.adv_notes  for all to authenticated using (true) with check (true);
revoke all on public.adv_places, public.adv_notes from anon;

create trigger adv_places_touch before update on public.adv_places for each row execute function public.adv_touch();
create trigger adv_notes_touch  before update on public.adv_notes  for each row execute function public.adv_touch();
create trigger adv_places_log after insert or update or delete on public.adv_places for each row execute function public.adv_log_change();
create trigger adv_notes_log  after insert or update or delete on public.adv_notes  for each row execute function public.adv_log_change();

-- Let rollback cover the new tables.
create or replace function public.adv_restore(p_history_id bigint) returns text
language plpgsql set search_path = '' as $$
declare
    h      public.adv_history;
    v_set  text;
begin
    select * into h from public.adv_history where id = p_history_id;
    if not found then
        raise exception 'No history entry %', p_history_id;
    end if;
    if h.table_name not in ('adv_roles', 'adv_entries', 'adv_chapters', 'adv_turns', 'adv_places', 'adv_notes') then
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

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('adventure', 'adv_places', 'table', 'owner', 'Places as a tree; each place is a map of its children.', 'ShimmyCane/Index'),
('adventure', 'adv_notes',  'table', 'owner', 'Append-only journal about characters and places.',     'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
