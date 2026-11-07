-- ============================================================================
-- Athena's world — the game's save and notes tables (Family project).
-- Paste the whole file into the Family project's SQL editor and press Run.
-- Re-runnable. Prefix athena_. Family project only.
-- Run supabase/test_001_athena_family.sql first.
-- ============================================================================

-- One row for the family's saved game (unlocked houses and the rooms as left).
create table if not exists public.athena_saves (
    save_key        text primary key,                       -- 'main' for the family's one game
    data            jsonb not null default '{}'::jsonb,     -- { unlocked, rooms }
    updated_at      timestamptz not null default timezone('utc', now())
);
alter table public.athena_saves enable row level security;
revoke all on public.athena_saves from anon;
drop policy if exists "Authenticated can manage athena_saves" on public.athena_saves;
create policy "Authenticated can manage athena_saves" on public.athena_saves
    for all to authenticated using (true) with check (true);

-- Notes for improvement typed in the game (text only).
create table if not exists public.athena_notes (
    id              text primary key,                       -- made on the device, never changed
    text            text not null check (length(text) between 1 and 2000),
    house           text not null default '',               -- which house it was typed on
    label           text not null default '',               -- house and thing, as the tester saw it
    version         text not null default '',               -- game version when it was typed
    status          text not null default 'open' check (status in ('open', 'done')),
    noted_at        timestamptz not null default timezone('utc', now()),
    created_by      uuid default auth.uid(),
    created_at      timestamptz not null default timezone('utc', now())
);
alter table public.athena_notes enable row level security;
revoke all on public.athena_notes from anon;
drop policy if exists "Authenticated can manage athena_notes" on public.athena_notes;
create policy "Authenticated can manage athena_notes" on public.athena_notes
    for all to authenticated using (true) with check (true);

-- Registry: this app owns both tables.
insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('athena', 'athena_saves', 'table', 'owner', 'Athena''s world: the family''s saved game (unlocked houses and rooms).', 'ShimmyCane/Index'),
('athena', 'athena_notes', 'table', 'owner', 'Athena''s world: notes for improvement typed in the game.', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;

-- ----------------------------------------------------------------------------
-- Check after Run (or use verify_001_athena_family.sql): expect two rows.
-- rls_on = true, policies = 1, anon_grants = 0, registered = 1 each.
-- ----------------------------------------------------------------------------
select c.relname as table_name,
       c.relrowsecurity as rls_on,
       (select count(*) from pg_policy p where p.polrelid = c.oid) as policies,
       (select count(*) from information_schema.role_table_grants g
         where g.table_schema = 'public' and g.table_name = c.relname and g.grantee = 'anon') as anon_grants,
       (select count(*) from public.app_table_registry r
         where r.app = 'athena' and r.object_name = c.relname) as registered
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relname in ('athena_saves', 'athena_notes')
order by c.relname;
