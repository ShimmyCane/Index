-- Rolled-back test for 001_fs_family.sql. Run first. It ends in a RESULT message and leaves nothing behind.
-- Expect: RESULT: tables=2 rls_on=2 policies=2 anon_blocked=t registry=2
do $$
declare
  n_rls int; n_pol int; anon_ok boolean; reg int;
begin
  execute 'create table if not exists public.fs_creations (id text primary key, sheet_id text not null default '''', sheet_name text not null default '''', version text not null default '''', data jsonb not null default ''{}''::jsonb, saved_at timestamptz not null default now(), updated_at timestamptz not null default now())';
  execute 'create table if not exists public.fs_notes (id text primary key, text text not null, sheet_id text not null default '''', item text not null default '''', label text not null default '''', version text not null default '''', status text not null default ''open'' check (status in (''open'', ''done'')), noted_at timestamptz not null default now())';
  execute 'alter table public.fs_creations enable row level security';
  execute 'alter table public.fs_notes enable row level security';
  execute 'revoke all on public.fs_creations from anon';
  execute 'revoke all on public.fs_notes from anon';
  execute 'drop policy if exists "Family all fs_creations" on public.fs_creations';
  execute 'create policy "Family all fs_creations" on public.fs_creations for all to authenticated using (true) with check (true)';
  execute 'drop policy if exists "Family all fs_notes" on public.fs_notes';
  execute 'create policy "Family all fs_notes" on public.fs_notes for all to authenticated using (true) with check (true)';
  insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
    values ('felix-stickers', 'fs_creations', 'table', 'owner', 'test', 'test'), ('felix-stickers', 'fs_notes', 'table', 'owner', 'test', 'test');

  select count(*) into n_rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('fs_creations', 'fs_notes') and c.relrowsecurity;
  select count(*) into n_pol from pg_policies where schemaname = 'public' and tablename in ('fs_creations', 'fs_notes');
  anon_ok := has_table_privilege('anon', 'public.fs_creations', 'select') or has_table_privilege('anon', 'public.fs_notes', 'select');
  select count(*) into reg from public.app_table_registry where app = 'felix-stickers';

  raise exception 'RESULT: tables=2 rls_on=% policies=% anon_blocked=% registry=%', n_rls, n_pol, (not anon_ok), reg;
end $$;
