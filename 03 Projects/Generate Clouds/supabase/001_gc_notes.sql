-- Generate Clouds (03 Projects/Generate Clouds): notes for improvement.
-- Database: Architecture (studio, Track B). Paste AFTER test_001_gc.sql passed. Re-runnable.
-- Owner only: the policy calls public.platform_is_owner() (already live in this database).
-- Anon has no access. No email and no user id in this file.
-- The platform_owners row is added by hand (see 000_platform_owner.sql in Critique Detail/supabase).

create table if not exists public.gc_notes (
  id       text primary key,
  text     text not null,
  page     text not null default 'index.html',
  item     text not null default '',
  label    text not null default '',
  version  text not null default '',
  status   text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.gc_notes enable row level security;
revoke all on public.gc_notes from anon;
revoke all on public.gc_notes from authenticated;
grant select, insert, update, delete on public.gc_notes to authenticated;
drop policy if exists "owner full access gc_notes" on public.gc_notes;
create policy "owner full access gc_notes" on public.gc_notes for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

insert into public.table_index (table_name, project, purpose) values
  ('gc_notes', 'Generate Clouds', 'Notes for improvement left in the sky page (text, the place and moment it was about, app version, open or done)')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;
