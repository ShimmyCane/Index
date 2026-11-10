-- 中文筆畫: feedback notes (給我們的改進意見) in the Family project.
-- Run after test_001_zhbh_notes.sql passed. Safe to re-run.

create table if not exists public.zhbh_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.zhbh_notes enable row level security;
revoke all on public.zhbh_notes from anon;
grant select, insert, update on public.zhbh_notes to authenticated;

drop policy if exists "Family can add zhbh_notes" on public.zhbh_notes;
create policy "Family can add zhbh_notes" on public.zhbh_notes
  for insert to authenticated with check (true);

drop policy if exists "Family can read zhbh_notes" on public.zhbh_notes;
create policy "Family can read zhbh_notes" on public.zhbh_notes
  for select to authenticated using (true);

drop policy if exists "Family can update zhbh_notes status" on public.zhbh_notes;
create policy "Family can update zhbh_notes status" on public.zhbh_notes
  for update to authenticated using (true) with check (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values ('chinese-strokes', 'zhbh_notes', 'table', 'owner', '中文筆畫 feedback notes (family)', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
