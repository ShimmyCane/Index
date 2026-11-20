-- Athena's Piano Companion (Family project): takes, playlists, compositions, notes, and the private bucket pc-takes.
-- Run after test_001_pc.sql passed. Safe to re-run. Family sign-in only; anon has nothing.

create table if not exists public.pc_takes (
  id text primary key,
  name text not null,
  player text not null default 'Athena',
  album text not null default '',
  take_no int not null default 0,
  file_name text not null default '',
  file_path text not null default '',
  mime text not null default 'audio/wav',
  duration_ms int not null default 0,
  size_bytes int not null default 0,
  sample_rate int not null default 44100,
  rating int not null default 0 check (rating between 0 and 5),
  description text not null default '',
  color text not null default '',
  peaks jsonb not null default '[]'::jsonb,
  source text not null default 'recorder' check (source in ('recorder', 'composer')),
  taken_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_playlists (
  id text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_playlist_items (
  id text primary key,
  playlist_id text not null references public.pc_playlists (id) on delete cascade,
  take_id text not null references public.pc_takes (id) on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_projects (
  id text primary key,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

alter table public.pc_takes enable row level security;
alter table public.pc_playlists enable row level security;
alter table public.pc_playlist_items enable row level security;
alter table public.pc_projects enable row level security;
alter table public.pc_notes enable row level security;

revoke all on public.pc_takes from anon;
revoke all on public.pc_playlists from anon;
revoke all on public.pc_playlist_items from anon;
revoke all on public.pc_projects from anon;
revoke all on public.pc_notes from anon;

grant select, insert, update on public.pc_takes to authenticated;
grant select, insert, update, delete on public.pc_playlists to authenticated;
grant select, insert, update, delete on public.pc_playlist_items to authenticated;
grant select, insert, update, delete on public.pc_projects to authenticated;
grant select, insert, update on public.pc_notes to authenticated;

drop policy if exists "Family reads pc_takes" on public.pc_takes;
create policy "Family reads pc_takes" on public.pc_takes for select to authenticated using (true);
drop policy if exists "Family adds pc_takes" on public.pc_takes;
create policy "Family adds pc_takes" on public.pc_takes for insert to authenticated with check (true);
drop policy if exists "Family edits pc_takes" on public.pc_takes;
create policy "Family edits pc_takes" on public.pc_takes for update to authenticated using (true) with check (true);

drop policy if exists "Family all pc_playlists" on public.pc_playlists;
create policy "Family all pc_playlists" on public.pc_playlists for all to authenticated using (true) with check (true);
drop policy if exists "Family all pc_playlist_items" on public.pc_playlist_items;
create policy "Family all pc_playlist_items" on public.pc_playlist_items for all to authenticated using (true) with check (true);
drop policy if exists "Family all pc_projects" on public.pc_projects;
create policy "Family all pc_projects" on public.pc_projects for all to authenticated using (true) with check (true);

drop policy if exists "Family reads pc_notes" on public.pc_notes;
create policy "Family reads pc_notes" on public.pc_notes for select to authenticated using (true);
drop policy if exists "Family adds pc_notes" on public.pc_notes;
create policy "Family adds pc_notes" on public.pc_notes for insert to authenticated with check (true);
drop policy if exists "Family edits pc_notes" on public.pc_notes;
create policy "Family edits pc_notes" on public.pc_notes for update to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('pc-takes', 'pc-takes', false)
on conflict (id) do nothing;

drop policy if exists "Family listens to pc-takes" on storage.objects;
create policy "Family listens to pc-takes" on storage.objects for select to authenticated using (bucket_id = 'pc-takes');
drop policy if exists "Family adds to pc-takes" on storage.objects;
create policy "Family adds to pc-takes" on storage.objects for insert to authenticated with check (bucket_id = 'pc-takes');
drop policy if exists "Family replaces in pc-takes" on storage.objects;
create policy "Family replaces in pc-takes" on storage.objects for update to authenticated using (bucket_id = 'pc-takes') with check (bucket_id = 'pc-takes');

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
  ('piano-companion', 'pc_takes', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): recorded takes; audio in private bucket pc-takes. Other apps may read.', 'ShimmyCane/Index'),
  ('piano-companion', 'pc_playlists', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): playlists', 'ShimmyCane/Index'),
  ('piano-companion', 'pc_playlist_items', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): takes in playlists', 'ShimmyCane/Index'),
  ('piano-companion', 'pc_projects', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): composer projects (layers as JSON)', 'ShimmyCane/Index'),
  ('piano-companion', 'pc_notes', 'table', 'owner', 'Athena''s Piano Companion (03 Projects/Athena''s Piano Companion): feedback notes', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
