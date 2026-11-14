-- COPY of 04 AI/Supabase/platform_owner.sql for the ARCHITECTURE project. One change: the
-- app_table_registry insert is left out, because that project indexes tables in
-- public.table_index only (checked read-only 2026-11-14). Paste this ONCE, before 001.
-- ============================================================================
-- Platform owner check: shared by every nursery app that needs owner-only data.
-- Run ONCE per Supabase project, before any app migration that calls
-- public.platform_is_owner(). Re-runnable.
--
-- Why a table and not an email: a public repo must not hold the owner's
-- sign-in email (it stays in git history forever). The owner is identified by
-- the auth user id, which is kept in the database, not in the repo.
--
-- SEEDING (by hand, never committed): after the owner signs in once, copy the
-- user id from Authentication > Users in the Supabase dashboard and run:
--   insert into public.platform_owners (user_id, note) values ('<auth user id>', 'owner');
-- ============================================================================

create table if not exists public.platform_owners (
    user_id    uuid primary key,                 -- auth.users.id of the owner; set by hand
    note       text not null default '',         -- a label only, for example 'owner'
    created_at timestamptz not null default timezone('utc', now())
);

alter table public.platform_owners enable row level security;
revoke all on public.platform_owners from anon;
revoke all on public.platform_owners from authenticated;   -- only the function reads it

create or replace function public.platform_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.platform_owners where user_id = auth.uid());
$$;

revoke execute on function public.platform_is_owner() from anon;
grant execute on function public.platform_is_owner() to authenticated;

insert into public.table_index (table_name, project, purpose) values
  ('platform_owners', 'platform', 'Owner auth user id for owner-only policies (set by hand, never in the repo)')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;

-- TEST (rolled back; the owner row is created and removed inside the block):
-- do $$
-- declare owner_ok boolean; other_ok boolean;
-- begin
--   insert into public.platform_owners (user_id, note) values ('00000000-0000-4000-8000-000000000001', 'test');
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000001"}', true);
--   set local role authenticated;
--   owner_ok := public.platform_is_owner();
--   reset role;
--   perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000002"}', true);
--   set local role authenticated;
--   other_ok := public.platform_is_owner();
--   reset role;
--   raise exception 'RESULT: owner=% other=%', owner_ok, other_ok;
-- end $$;
-- Expected: owner=true other=false.
