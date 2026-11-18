-- Make 3D x Construct: the scene library in the cloud (Architecture project, xabgankckrcuhcgdolrg).
-- One row per scene version (model_id). The bundle is the source: history (operations), world (rules), model (replayed).
-- Owner only, the same rule as public.m3d_scene_log in Make 3D. NOT APPLIED: Jimmy copies this into the project by hand.
-- Test first in a rolled-back transaction (the TEST at the bottom), then apply.
-- Requires 04 AI/Supabase/platform_owner.sql (public.platform_is_owner(), public.table_index).

create table if not exists public.m3dxc_scenes (
  model_id text primary key,
  name text not null default '',
  description text not null default '',
  version integer not null default 0,
  bundle jsonb not null,
  model jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.m3dxc_scenes enable row level security;
revoke all on public.m3dxc_scenes from anon;

create policy "owner full access" on public.m3dxc_scenes for all to authenticated
  using (public.platform_is_owner())
  with check (public.platform_is_owner());

insert into public.table_index (table_name, project, purpose) values
  ('m3dxc_scenes', 'Make 3D x Construct', 'Scene library: one row per scene version (history, world, model); owner only')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;

-- TEST (run after platform_owner.sql, as one statement; the final raise rolls back the test rows):
-- do $$
-- declare owner_n int; other_n int;
-- begin
--   insert into public.platform_owners (user_id, note) values ('00000000-0000-4000-8000-000000000001', 'test');
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000001"}', true);
--   set local role authenticated;
--   insert into public.m3dxc_scenes (model_id, name, bundle) values ('test-1', 'Test', '{}');
--   select count(*) into owner_n from public.m3dxc_scenes;
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000002"}', true);
--   select count(*) into other_n from public.m3dxc_scenes;
--   reset role;
--   raise exception 'TEST RESULT owner_sees=% other_sees=% (rolled back)', owner_n, other_n;
-- end $$;
