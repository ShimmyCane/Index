-- Rolled-back test for 002_pc_bin_sessions.sql. Run first (001 must already be applied). It ends in a RESULT message and leaves nothing behind.
-- Expect: RESULT: take_cols=2 sessions=1 bin=1 live=1 delete_policy=1 storage_delete=1 anon_blocked=t registry=1
do $$
declare
  c int; s int; b int; l int; dp int; sd int; anon_ok boolean; reg int;
begin
  execute 'alter table public.pc_takes add column if not exists session_id text not null default '''';
alter table public.pc_takes add column if not exists deleted_at timestamptz;

create index if not exists pc_takes_session_idx on public.pc_takes (session_id);
create index if not exists pc_takes_deleted_idx on public.pc_takes (deleted_at);

create table if not exists public.pc_sessions (
  id text primary key,
  day date not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text not null default '''',
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
create policy "Family removes from pc-takes" on storage.objects for delete to authenticated using (bucket_id = ''pc-takes'');

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
  (''piano-companion'', ''pc_sessions'', ''table'', ''owner'', ''Athena''''s Piano Companion (03 Projects/Athena''''s Piano Companion): one entry per day of playing'', ''ShimmyCane/Index'')
on conflict (app, object_name) do nothing;
';
  insert into public.pc_takes (id, name, session_id, deleted_at) values ('test-live', 'Live', 's-2026-11-21', null);
  insert into public.pc_takes (id, name, session_id, deleted_at) values ('test-gone', 'Gone', 's-2026-11-21', now());
  insert into public.pc_sessions (id, day) values ('s-2026-11-21', '2026-11-21');
  select count(*) into c from information_schema.columns where table_schema = 'public' and table_name = 'pc_takes' and column_name in ('session_id', 'deleted_at');
  select count(*) into s from public.pc_sessions where id = 's-2026-11-21';
  select count(*) into b from public.pc_takes where deleted_at is not null and id like 'test-%';
  select count(*) into l from public.pc_takes where deleted_at is null and id like 'test-%';
  select count(*) into dp from pg_policies where schemaname = 'public' and tablename = 'pc_takes' and cmd = 'DELETE';
  select count(*) into sd from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Family removes from pc-takes';
  anon_ok := not has_table_privilege('anon', 'public.pc_sessions', 'select');
  select count(*) into reg from public.app_table_registry where app = 'piano-companion' and object_name = 'pc_sessions';
  raise exception 'RESULT: take_cols=% sessions=% bin=% live=% delete_policy=% storage_delete=% anon_blocked=% registry=%', c, s, b, l, dp, sd, anon_ok, reg;
end $$;
