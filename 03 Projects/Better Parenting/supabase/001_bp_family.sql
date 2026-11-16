-- Better Parenting: family tables in the Family project (notes, my own scenarios, practice record).
-- Run after test_001_bp.sql passed. Safe to re-run.

create table if not exists public.bp_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

create table if not exists public.bp_scenarios (
  id text primary key,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.bp_practice (
  id text primary key,
  scenario_id text not null,
  rating int not null check (rating between 1 and 3),
  reflection text not null default '',
  practiced_at timestamptz not null default now()
);

alter table public.bp_notes enable row level security;
alter table public.bp_scenarios enable row level security;
alter table public.bp_practice enable row level security;
revoke all on public.bp_notes from anon;
revoke all on public.bp_scenarios from anon;
revoke all on public.bp_practice from anon;
grant select, insert, update on public.bp_notes to authenticated;
grant select, insert, update on public.bp_scenarios to authenticated;
grant select, insert on public.bp_practice to authenticated;

drop policy if exists "Family can add bp_notes" on public.bp_notes;
create policy "Family can add bp_notes" on public.bp_notes
  for insert to authenticated with check (true);
drop policy if exists "Family can read bp_notes" on public.bp_notes;
create policy "Family can read bp_notes" on public.bp_notes
  for select to authenticated using (true);
drop policy if exists "Family can update bp_notes status" on public.bp_notes;
create policy "Family can update bp_notes status" on public.bp_notes
  for update to authenticated using (true) with check (true);

drop policy if exists "Family can add bp_scenarios" on public.bp_scenarios;
create policy "Family can add bp_scenarios" on public.bp_scenarios
  for insert to authenticated with check (true);
drop policy if exists "Family can read bp_scenarios" on public.bp_scenarios;
create policy "Family can read bp_scenarios" on public.bp_scenarios
  for select to authenticated using (true);
drop policy if exists "Family can update bp_scenarios" on public.bp_scenarios;
create policy "Family can update bp_scenarios" on public.bp_scenarios
  for update to authenticated using (true) with check (true);

drop policy if exists "Family can add bp_practice" on public.bp_practice;
create policy "Family can add bp_practice" on public.bp_practice
  for insert to authenticated with check (true);
drop policy if exists "Family can read bp_practice" on public.bp_practice;
create policy "Family can read bp_practice" on public.bp_practice
  for select to authenticated using (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values
  ('better-parenting', 'bp_notes', 'table', 'owner', 'Better Parenting (03 Projects/Better Parenting): feedback notes (family)', 'ShimmyCane/Index'),
  ('better-parenting', 'bp_scenarios', 'table', 'owner', 'Better Parenting (03 Projects/Better Parenting): scenarios the family wrote', 'ShimmyCane/Index'),
  ('better-parenting', 'bp_practice', 'table', 'owner', 'Better Parenting (03 Projects/Better Parenting): practice record (rating and reflection)', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
