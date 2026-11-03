-- Growth: saved worlds. Architecture project (xabgankckrcuhcgdolrg).
-- STATUS: DRAFT. NOT APPLIED. Nothing has been created in the database.
--
-- Checked read-only on 2026-11-03 (list of public tables): no grw_ tables exist, public.table_index exists (17 rows),
-- and public.m3d_scenes / public.m3d_scene_log are the pattern this follows.
-- Re-list the live tables before applying (another session may have changed the project). Apply with /supabase-project:
-- test first in a rolled-back transaction (see the bottom of this file), then apply as migration "grw_worlds".
--
-- Two tables, the same split as Make 3D's m3d_scenes (current) and m3d_scene_log (history):
--   grw_worlds          the current version of each world: the whole world (schema 2) as one jsonb document.
--   grw_world_versions  every saved version of a world: spec, label and note. The log of record.
-- The row holds the world (seed, environment, time rules, steps). The numbers are replayed from it by the time model,
-- so the document stays small and the viewers can never disagree with it.
-- Access: owner only, the same rule the other tables use (the signed-in email must be the owner's). Anon has nothing.

create table if not exists public.grw_worlds (
  id uuid primary key default gen_random_uuid(),
  world_id text not null unique check (world_id ~ '^[a-z0-9_]+$'),   -- the "id" inside the JSON, also used in ?world=<id>
  title text not null,
  kind text not null check (kind in ('growth', 'decay', 'collaboration')),
  version integer not null default 1,
  spec jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grw_world_versions (
  id uuid primary key default gen_random_uuid(),
  world_id text not null references public.grw_worlds (world_id) on delete cascade,
  version integer not null,
  label text not null default '',
  note text not null default '',
  spec jsonb not null,
  created_at timestamptz not null default now(),
  unique (world_id, version)
);

alter table public.grw_worlds enable row level security;
alter table public.grw_world_versions enable row level security;
revoke all on public.grw_worlds from anon;
revoke all on public.grw_world_versions from anon;

create policy "owner full access" on public.grw_worlds for all to authenticated
  using ((auth.jwt() ->> 'email') = 'splusystudio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'splusystudio@gmail.com');

create policy "owner full access" on public.grw_world_versions for all to authenticated
  using ((auth.jwt() ->> 'email') = 'splusystudio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'splusystudio@gmail.com');

insert into public.table_index (table_name, project, purpose) values
  ('grw_worlds', 'Growth', 'Saved worlds: the whole world (seed, environment, time rules, steps) as one jsonb document, one row per world_id'),
  ('grw_world_versions', 'Growth', 'Every saved version of a world, with label and note. The log of record.')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;

-- TEST (run as one statement; the final raise rolls everything back, including the tables):
-- do $$
-- declare owner_n int; other_n int; anon_n text;
-- begin
--   <paste the create table, alter table, revoke and create policy statements above here>
--   perform set_config('request.jwt.claims', '{"role":"authenticated","email":"splusystudio@gmail.com"}', true);
--   set local role authenticated;
--   insert into public.grw_worlds (world_id, title, kind, spec) values ('test_world', 'Test', 'growth', '{}');
--   insert into public.grw_world_versions (world_id, version, spec) values ('test_world', 1, '{}');
--   select count(*) into owner_n from public.grw_worlds;
--   perform set_config('request.jwt.claims', '{"role":"authenticated","email":"someone@example.com"}', true);
--   select count(*) into other_n from public.grw_worlds;
--   reset role;
--   begin
--     set local role anon;
--     select count(*)::text into anon_n from public.grw_worlds;
--   exception when insufficient_privilege then anon_n := 'denied';
--   end;
--   reset role;
--   raise exception 'RESULT: owner_sees=% other_sees=% anon=%', owner_n, other_n, anon_n;
-- end $$;
-- Expected: owner_sees=1 other_sees=0 anon=denied. Then confirm with a query that the tables do not exist.
