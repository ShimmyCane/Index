-- Rolled-back test for 001_fc_notes.sql. Run first. It ends in a RESULT message and leaves nothing behind.
do $$
declare
  cnt int; pol int; rls boolean; reg int;
begin
  create table if not exists public.fc_notes (
    id text primary key,
    text text not null,
    page text not null default 'index.html',
    item text not null default '',
    label text not null default '',
    version text not null default '',
    status text not null default 'open' check (status in ('open', 'done')),
    noted_at timestamptz not null default now()
  );
  alter table public.fc_notes enable row level security;
  revoke all on public.fc_notes from anon;
  grant select, insert, update on public.fc_notes to authenticated;
  drop policy if exists "Family can add fc_notes" on public.fc_notes;
  create policy "Family can add fc_notes" on public.fc_notes for insert to authenticated with check (true);
  drop policy if exists "Family can read fc_notes" on public.fc_notes;
  create policy "Family can read fc_notes" on public.fc_notes for select to authenticated using (true);
  drop policy if exists "Family can update fc_notes status" on public.fc_notes;
  create policy "Family can update fc_notes status" on public.fc_notes for update to authenticated using (true) with check (true);
  insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
  values ('felix-continents', 'fc_notes', 'table', 'owner', 'test', 'ShimmyCane/Index')
  on conflict (app, object_name) do nothing;

  insert into public.fc_notes (id, text) values ('test-note-1', 'test');
  select count(*) into cnt from public.fc_notes;
  select count(*) into pol from pg_policies where schemaname = 'public' and tablename = 'fc_notes';
  select relrowsecurity into rls from pg_class where oid = 'public.fc_notes'::regclass;
  select count(*) into reg from public.app_table_registry where app = 'felix-continents' and object_name = 'fc_notes';

  raise exception 'RESULT: rows=% policies=% rls=% registry=%', cnt, pol, rls, reg;
end $$;
