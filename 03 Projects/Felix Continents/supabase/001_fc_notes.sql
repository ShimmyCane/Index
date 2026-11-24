-- Felix Continents: feedback notes (notes for improvement) in the Family project.
-- Run after test_001_fc_notes.sql passed. Safe to re-run.

create table if not exists public.fc_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.fc_notes enable row level security;
revoke all on public.fc_notes from anon;
grant select, insert, update on public.fc_notes to authenticated;

drop policy if exists "Family can add fc_notes" on public.fc_notes;
create policy "Family can add fc_notes" on public.fc_notes
  for insert to authenticated with check (true);

drop policy if exists "Family can read fc_notes" on public.fc_notes;
create policy "Family can read fc_notes" on public.fc_notes
  for select to authenticated using (true);

drop policy if exists "Family can update fc_notes status" on public.fc_notes;
create policy "Family can update fc_notes status" on public.fc_notes
  for update to authenticated using (true) with check (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values ('felix-continents', 'fc_notes', 'table', 'owner', 'Felix Continents (03 Projects/Felix Continents): notes for improvement (family)', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
