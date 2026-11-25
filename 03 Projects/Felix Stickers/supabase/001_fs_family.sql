-- Felix Stickers (Family project, prefix fs_): saved creations and notes for improvement.
-- Run after test_001_fs.sql passed. Safe to re-run. Family sign-in only; anon has nothing.

create table if not exists public.fs_creations (
  id text primary key,
  sheet_id text not null default '',
  sheet_name text not null default '',
  version text not null default '',
  data jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fs_notes (
  id text primary key,
  text text not null,
  sheet_id text not null default '',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.fs_creations enable row level security;
alter table public.fs_notes enable row level security;

revoke all on public.fs_creations from anon;
revoke all on public.fs_notes from anon;

grant select, insert, update on public.fs_creations to authenticated;
grant select, insert, update on public.fs_notes to authenticated;

drop policy if exists "Family all fs_creations" on public.fs_creations;
create policy "Family all fs_creations" on public.fs_creations for all to authenticated using (true) with check (true);
drop policy if exists "Family all fs_notes" on public.fs_notes;
create policy "Family all fs_notes" on public.fs_notes for all to authenticated using (true) with check (true);

-- Registry: which app owns these tables (see 04 AI/Supabase/brief.md).
insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
select 'felix-stickers', 'fs_creations', 'table', 'owner', 'Felix Stickers (03 Projects/Felix Stickers): saved creations (sheet, stickers and positions).', 'ShimmyCane/Index'
where not exists (select 1 from public.app_table_registry where app = 'felix-stickers' and object_name = 'fs_creations');
insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
select 'felix-stickers', 'fs_notes', 'table', 'owner', 'Felix Stickers (03 Projects/Felix Stickers): notes for improvement.', 'ShimmyCane/Index'
where not exists (select 1 from public.app_table_registry where app = 'felix-stickers' and object_name = 'fs_notes');
