-- ============================================================================
-- Supabase app-table registry — template for a new Supabase project
-- See brief.md (same folder) for the rules.
--
-- Run once per Supabase project, then register each app's objects. Re-runnable.
-- The first block creates the registry; the last block is the pattern to copy
-- into every app's own migration.
-- ============================================================================

create table if not exists public.app_table_registry (
    id           uuid primary key default gen_random_uuid(),
    app          text not null,                       -- short slug: 'habits', 'allowances', ...
    object_name  text not null,                       -- table, view or function name in public
    object_type  text not null check (object_type in ('table', 'view', 'function')),
    access       text not null default 'owner'
                 check (access in ('owner', 'reads')), -- owner defines/writes it; reads only reads another app's object
    description  text,
    repo         text,                                -- e.g. 'ShimmyCane/Family-Habits'
    created_at   timestamptz not null default timezone('utc', now()),
    unique (app, object_name)
);

comment on table public.app_table_registry is
    'Index of which app uses which database object. owner = the app defines/writes it; reads = the app only reads a table another app owns. Check public.app_table_unregistered for anything missing.';

alter table public.app_table_registry enable row level security;

-- Adjust if the project is not single-family / signed-in-only.
drop policy if exists "Authenticated can manage app_table_registry" on public.app_table_registry;
create policy "Authenticated can manage app_table_registry"
    on public.app_table_registry for all to authenticated using (true) with check (true);

revoke all on public.app_table_registry from anon;

-- Anything in public that is not listed in the registry. Should be empty.
create or replace view public.app_table_unregistered
with (security_invoker = true) as
select
    c.relname::text as object_name,
    case c.relkind when 'v' then 'view' else 'table' end as object_type
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p', 'v')
  and not exists (
      select 1 from public.app_table_registry r where r.object_name = c.relname::text
  )
order by 1;

revoke all on public.app_table_unregistered from anon;
grant select on public.app_table_unregistered to authenticated;

-- The registry registers itself.
insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('platform', 'app_table_registry',    'table', 'owner', 'This index: which app uses which database object.', null),
('platform', 'app_table_unregistered', 'view',  'owner', 'Public tables and views not yet listed in app_table_registry.', null)
on conflict (app, object_name) do nothing;

-- ----------------------------------------------------------------------------
-- Pattern for every app migration: create the tables, then register them in the
-- same file. Replace <app> and the rows. 'reads' = a table another app owns.
-- ----------------------------------------------------------------------------
-- insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
-- ('<app>', '<app>_things',      'table',    'owner', 'What the table holds.',        'owner/repo'),
-- ('<app>', '<app>_things_view', 'view',     'owner', 'What the view computes.',      'owner/repo'),
-- ('<app>', 'do_thing',          'function', 'owner', 'What the function guarantees.', 'owner/repo'),
-- ('<app>', 'family_members',    'table',    'reads', 'Shared lookup owned by habits.', 'owner/repo')
-- on conflict (app, object_name) do nothing;
--
-- select * from public.app_table_unregistered;   -- must be empty (or only other apps' unclaimed tables)
