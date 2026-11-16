-- Felix Gear Wars: feedback notes (Notes for improvement) in the Family project.
-- Run after test_001_fgw_notes.sql passed. Safe to re-run.

create table if not exists public.fgw_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.fgw_notes enable row level security;
revoke all on public.fgw_notes from anon;
grant select, insert, update on public.fgw_notes to authenticated;

drop policy if exists "Family can add fgw_notes" on public.fgw_notes;
create policy "Family can add fgw_notes" on public.fgw_notes
  for insert to authenticated with check (true);

drop policy if exists "Family can read fgw_notes" on public.fgw_notes;
create policy "Family can read fgw_notes" on public.fgw_notes
  for select to authenticated using (true);

drop policy if exists "Family can update fgw_notes status" on public.fgw_notes;
create policy "Family can update fgw_notes status" on public.fgw_notes
  for update to authenticated using (true) with check (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values ('felix-gear-wars', 'fgw_notes', 'table', 'owner', 'Felix Gear Wars feedback notes (family)', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
