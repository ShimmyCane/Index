-- Our Family Compass: family tables in the Family project (notes, thoughts, pieces, the palace as JSON) and a private voice bucket.
-- Run after test_001_ofc.sql passed. Safe to re-run.

create table if not exists public.ofc_notes (
  id text primary key,
  text text not null,
  page text not null default 'index.html',
  item text not null default '',
  label text not null default '',
  version text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);

-- A thought is never changed. A change of mind is a new row that names the old one in "revises".
create table if not exists public.ofc_thoughts (
  id text primary key,
  compass text not null default 'main',
  room text not null,
  author text not null default '',
  about text not null default '',
  text text not null,
  revises text,
  piece text,
  voice_path text,
  thought_at timestamptz not null default now()
);

-- A piece (story, question, game...). "data" holds the front and the back. "voice_path" links a recording in the bucket ofc-voice.
-- "entered_by" is for a voice that arrived by email or text and was typed in by someone else.
create table if not exists public.ofc_pieces (
  id text primary key,
  compass text not null default 'main',
  room text not null,
  kind text not null,
  author text not null default '',
  entered_by text not null default '',
  for_whom text not null default '',
  data jsonb not null,
  revises text,
  voice_path text,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

-- The palace itself (rooms, places on the map, connections) as one JSON document per saved version. The newest row is the one in use.
create table if not exists public.ofc_framework (
  id text primary key,
  compass text not null default 'main',
  data jsonb not null,
  note text not null default '',
  saved_at timestamptz not null default now()
);

alter table public.ofc_notes enable row level security;
alter table public.ofc_thoughts enable row level security;
alter table public.ofc_pieces enable row level security;
alter table public.ofc_framework enable row level security;
revoke all on public.ofc_notes from anon;
revoke all on public.ofc_thoughts from anon;
revoke all on public.ofc_pieces from anon;
revoke all on public.ofc_framework from anon;
grant select, insert, update on public.ofc_notes to authenticated;
grant select, insert on public.ofc_thoughts to authenticated;
grant select, insert, update on public.ofc_pieces to authenticated;
grant select, insert on public.ofc_framework to authenticated;

drop policy if exists "Family can add ofc_notes" on public.ofc_notes;
create policy "Family can add ofc_notes" on public.ofc_notes
  for insert to authenticated with check (true);
drop policy if exists "Family can read ofc_notes" on public.ofc_notes;
create policy "Family can read ofc_notes" on public.ofc_notes
  for select to authenticated using (true);
drop policy if exists "Family can update ofc_notes status" on public.ofc_notes;
create policy "Family can update ofc_notes status" on public.ofc_notes
  for update to authenticated using (true) with check (true);

drop policy if exists "Family can add ofc_thoughts" on public.ofc_thoughts;
create policy "Family can add ofc_thoughts" on public.ofc_thoughts
  for insert to authenticated with check (true);
drop policy if exists "Family can read ofc_thoughts" on public.ofc_thoughts;
create policy "Family can read ofc_thoughts" on public.ofc_thoughts
  for select to authenticated using (true);

drop policy if exists "Family can add ofc_pieces" on public.ofc_pieces;
create policy "Family can add ofc_pieces" on public.ofc_pieces
  for insert to authenticated with check (true);
drop policy if exists "Family can read ofc_pieces" on public.ofc_pieces;
create policy "Family can read ofc_pieces" on public.ofc_pieces
  for select to authenticated using (true);
drop policy if exists "Family can update ofc_pieces" on public.ofc_pieces;
create policy "Family can update ofc_pieces" on public.ofc_pieces
  for update to authenticated using (true) with check (true);

drop policy if exists "Family can add ofc_framework" on public.ofc_framework;
create policy "Family can add ofc_framework" on public.ofc_framework
  for insert to authenticated with check (true);
drop policy if exists "Family can read ofc_framework" on public.ofc_framework;
create policy "Family can read ofc_framework" on public.ofc_framework
  for select to authenticated using (true);

-- Private bucket for voice notes: only the signed-in family account can listen or add one.
insert into storage.buckets (id, name, public)
values ('ofc-voice', 'ofc-voice', false)
on conflict (id) do nothing;
drop policy if exists "Family can listen to ofc-voice" on storage.objects;
create policy "Family can listen to ofc-voice" on storage.objects
  for select to authenticated using (bucket_id = 'ofc-voice');
drop policy if exists "Family can add to ofc-voice" on storage.objects;
create policy "Family can add to ofc-voice" on storage.objects
  for insert to authenticated with check (bucket_id = 'ofc-voice');

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values
  ('our-family-compass', 'ofc_notes', 'table', 'owner', 'Our Family Compass (03 Projects/Our Family Compass): feedback notes (family)', 'ShimmyCane/Index'),
  ('our-family-compass', 'ofc_thoughts', 'table', 'owner', 'Our Family Compass (03 Projects/Our Family Compass): dated thoughts by room, append-only; optional recording in the private bucket ofc-voice', 'ShimmyCane/Index'),
  ('our-family-compass', 'ofc_pieces', 'table', 'owner', 'Our Family Compass (03 Projects/Our Family Compass): pieces (stories, questions, games) with an optional recording in the private bucket ofc-voice', 'ShimmyCane/Index'),
  ('our-family-compass', 'ofc_framework', 'table', 'owner', 'Our Family Compass (03 Projects/Our Family Compass): the palace as JSON (rooms, map places, connections), one row per saved version', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
