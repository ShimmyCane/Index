-- QC keynotes (03 Projects/QC keynotes): notes for improvement.
-- Database: Architecture (studio, Track B). Paste AFTER test_001_qk.sql passed. Re-runnable.
-- Owner only: the policy calls public.platform_is_owner() (already live in this database).
-- Anon has no access. No email and no user id in this file.
-- The platform_owners row is added by hand (see 000_owner_row.sql in Generate Clouds/supabase).

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

insert into public.table_index (table_name, project, purpose) values
  ('qk_notes', 'QC keynotes', 'Notes for improvement left in the QC keynotes page (text, the part of the page it was about, app version, open or done)')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;
