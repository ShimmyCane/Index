-- QC keynotes: rolled-back test. Paste FIRST. Nothing is kept: the block ends in ROLLBACK.
-- Expect: the table is created, one test row reads back (test_rows = 1), then ROLLBACK.
begin;
create table if not exists public.qk_notes (
  id       text primary key,
  text     text not null,
  page     text not null default 'index.html',
  item     text not null default '',
  label    text not null default '',
  version  text not null default '',
  status   text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.qk_notes enable row level security;
revoke all on public.qk_notes from anon;
revoke all on public.qk_notes from authenticated;
grant select, insert, update, delete on public.qk_notes to authenticated;
drop policy if exists "owner full access qk_notes" on public.qk_notes;
create policy "owner full access qk_notes" on public.qk_notes for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

insert into public.qk_notes (id, text, item) values ('test-qk-1', 'test note', 'step 3');
select count(*) as test_rows from public.qk_notes where id = 'test-qk-1';
rollback;
