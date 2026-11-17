-- Rolled-back test for 001_ofc_family.sql. Run first. It ends in a RESULT message and leaves nothing behind.
-- Expect: RESULT: tables=4 rls_on=4 policies=10 storage_policies=2 bucket_private=t registry=4 notes=1 thoughts=2 revised=1 pieces_voice=1 framework=1 family_reads=2 family_edit_blocked=t anon_blocked=t
do $$
declare
  tabs int; pol int; spol int; rls int; reg int; n1 int; n2 int; n3 int; n4 int; n5 int; fam int;
  priv boolean; anon_blocked boolean := false; edit_blocked boolean := false;
begin
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

  insert into public.ofc_notes (id, text) values ('test-note-1', 'test');
  insert into public.ofc_thoughts (id, room, text) values ('test-t-1', 'gate', 'first view');
  insert into public.ofc_thoughts (id, room, text, revises) values ('test-t-2', 'gate', 'second view', 'test-t-1');
  insert into public.ofc_pieces (id, room, kind, data, voice_path) values ('test-p-1', 'workshop', 'Moral game', '{"title":"test"}', 'main/test-p-1.m4a');
  insert into public.ofc_framework (id, data) values ('test-f-1', '{"rooms":[]}');
  select count(*) into n1 from public.ofc_notes where id = 'test-note-1';
  select count(*) into n2 from public.ofc_thoughts where id like 'test-t-%';
  select count(*) into n3 from public.ofc_thoughts where revises = 'test-t-1';
  select count(*) into n4 from public.ofc_pieces where voice_path is not null and id = 'test-p-1';
  select count(*) into n5 from public.ofc_framework where id = 'test-f-1';
  select count(*) into tabs from pg_class where relnamespace = 'public'::regnamespace and relname in ('ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework');
  select count(*) into rls from pg_class where relnamespace = 'public'::regnamespace and relname in ('ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework') and relrowsecurity;
  select count(*) into pol from pg_policies where schemaname = 'public' and tablename in ('ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework');
  select count(*) into spol from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%ofc-voice%';
  select not public into priv from storage.buckets where id = 'ofc-voice';
  select count(*) into reg from public.app_table_registry where app = 'our-family-compass';

  set local role authenticated;
  select count(*) into fam from public.ofc_thoughts where id like 'test-t-%';
  begin
    update public.ofc_thoughts set text = 'changed' where id = 'test-t-1';
  exception when insufficient_privilege then edit_blocked := true;
  end;
  reset role;
  begin
    set local role anon;
    perform 1 from public.ofc_thoughts;
  exception when insufficient_privilege then anon_blocked := true;
  end;
  reset role;

  raise exception 'RESULT: tables=% rls_on=% policies=% storage_policies=% bucket_private=% registry=% notes=% thoughts=% revised=% pieces_voice=% framework=% family_reads=% family_edit_blocked=% anon_blocked=%',
    tabs, rls, pol, spol, priv, reg, n1, n2, n3, n4, n5, fam, edit_blocked, anon_blocked;
end $$;
