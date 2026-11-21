-- Athena's Piano Companion round 2: recycle bin (deleted_at), sessions (one per day), delete rights for the 30-day purge.
-- Run after 001_pc_family.sql is applied and test_002_pc.sql passed. Safe to re-run.

alter table public.pc_takes add column if not exists session_id text not null default '';
alter table public.pc_takes add column if not exists deleted_at timestamptz;

create index if not exists pc_takes_session_idx on public.pc_takes (session_id);
create index if not exists pc_takes_deleted_idx on public.pc_takes (deleted_at);

create table if not exists public.pc_sessions (
  id text primary key,
  day date not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.pc_sessions enable row level security;
revoke all on public.pc_sessions from anon;
grant select, insert, update, delete on public.pc_sessions to authenticated;

drop policy if exists "Family all pc_sessions" on public.pc_sessions;
create policy "Family all pc_sessions" on public.pc_sessions for all to authenticated using (true) with check (true);

grant delete on public.pc_takes to authenticated;
drop policy if exists "Family removes pc_takes" on public.pc_takes;
create policy "Family removes pc_takes" on public.pc_takes for delete to authenticated using (true);

drop policy if exists "Family removes from pc-takes" on storage.objects;
create policy "Family removes from pc-takes" on storage.objects for delete to authenticated using (bucket_id = 'pc-takes');

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
  ('piano-companion', 'pc_sessions', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): one entry per day of playing', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
