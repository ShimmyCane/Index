-- Make 3D x Construct: certainty per part, saved to the Architecture project (xabgankckrcuhcgdolrg).
-- Table prefix m3dxc_ (lowercase). One row per part per model version: the percent the owner sees, sorts and edits.
-- Owner only, the same rule as public.m3d_scene_log (Make-3D supabase/002). NOT APPLIED: test first in a
-- rolled-back transaction (the TEST at the bottom), then apply as migration "m3dxc_certainty" only when Jimmy asks.
-- Requires 04 AI/Supabase/platform_owner.sql (public.platform_is_owner(), public.table_index).

create table if not exists public.m3dxc_certainty (
  id uuid primary key default gen_random_uuid(),
  model_id text not null,                  -- for example plains-diorama-v01
  part_uuid text not null,                 -- the object uuid inside the history
  part_name text not null,
  percent integer not null check (percent between 0 and 100),
  basis text not null check (basis in ('measured', 'cited', 'user', 'inferred', 'placeholder', 'decorative')),
  note text not null default '',
  history_hash text not null,              -- the history this value was read from (see model.history_hash)
  changed_by text not null default 'owner',
  changed_at timestamptz not null default now(),
  unique (model_id, part_uuid, history_hash)
);

create index if not exists m3dxc_certainty_model_idx on public.m3dxc_certainty (model_id, part_name);

alter table public.m3dxc_certainty enable row level security;
revoke all on public.m3dxc_certainty from anon;

create policy "owner full access" on public.m3dxc_certainty for all to authenticated
  using (public.platform_is_owner())
  with check (public.platform_is_owner());

insert into public.table_index (table_name, project, purpose) values
  ('m3dxc_certainty', 'Make 3D x Construct', 'Certainty percent and basis per part, per history hash: sortable, editable, reviewed together')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;

-- TEST (run after platform_owner.sql, as one statement; the final raise rolls back the test rows):
-- do $$
-- declare owner_n int; other_n int;
-- begin
--   insert into public.platform_owners (user_id, note) values ('00000000-0000-4000-8000-000000000001', 'test');
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000001"}', true);
--   set local role authenticated;
--   insert into public.m3dxc_certainty (model_id, part_uuid, part_name, percent, basis, history_hash)
--     values ('test-1', 'p1', 'Test part', 40, 'inferred', 'abc12345');
--   select count(*) into owner_n from public.m3dxc_certainty;
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000002"}', true);
--   select count(*) into other_n from public.m3dxc_certainty;
--   reset role;
--   raise exception 'TEST RESULT owner_sees=% other_sees=% (rolled back)', owner_n, other_n;
-- end $$;
