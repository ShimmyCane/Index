-- Rhythm Sticks: feedback notes (Notes for improvement) in the Family project.
-- Run after test_001_rs_notes.sql passed. Safe to re-run.

create table if not exists public.rs_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.rs_notes enable row level security;
revoke all on public.rs_notes from anon;
grant select, insert, update on public.rs_notes to authenticated;

drop policy if exists "Family can add rs_notes" on public.rs_notes;
create policy "Family can add rs_notes" on public.rs_notes
  for insert to authenticated with check (true);

drop policy if exists "Family can read rs_notes" on public.rs_notes;
create policy "Family can read rs_notes" on public.rs_notes
  for select to authenticated using (true);

drop policy if exists "Family can update rs_notes status" on public.rs_notes;
create policy "Family can update rs_notes status" on public.rs_notes
  for update to authenticated using (true) with check (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values ('rhythm-sticks', 'rs_notes', 'table', 'owner', 'Rhythm Sticks feedback notes (family)', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
