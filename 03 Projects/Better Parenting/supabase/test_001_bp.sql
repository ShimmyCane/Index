-- Rolled-back test for 001_bp_family.sql. Run first. It ends in a RESULT message and leaves nothing behind.
do $$
declare
  tabs int; pol int; rls int; reg int; n1 int; n2 int; n3 int; anon_blocked boolean := false; fam int;
begin
  create table if not exists public.bp_notes (
    id text primary key,
    text text not null,
    page text not null default 'index.html',
    item text not null default '',
    label text not null default '',
    version text not null default '',
    status text not null default 'open' check (status in ('open', 'done')),
    noted_at timestamptz not null default now()
  );

  create table if not exists public.bp_scenarios (
    id text primary key,
    data jsonb not null,
    deleted boolean not null default false,
    updated_at timestamptz not null default now()
  );

  create table if not exists public.bp_practice (
    id text primary key,
    scenario_id text not null,
    rating int not null check (rating between 1 and 3),
    reflection text not null default '',
    practiced_at timestamptz not null default now()
  );

  alter table public.bp_notes enable row level security;
  alter table public.bp_scenarios enable row level security;
  alter table public.bp_practice enable row level security;
  revoke all on public.bp_notes from anon;
  revoke all on public.bp_scenarios from anon;
  revoke all on public.bp_practice from anon;
  grant select, insert, update on public.bp_notes to authenticated;
  grant select, insert, update on public.bp_scenarios to authenticated;
  grant select, insert on public.bp_practice to authenticated;

  drop policy if exists "Family can add bp_notes" on public.bp_notes;
  create policy "Family can add bp_notes" on public.bp_notes
    for insert to authenticated with check (true);
  drop policy if exists "Family can read bp_notes" on public.bp_notes;
  create policy "Family can read bp_notes" on public.bp_notes
    for select to authenticated using (true);
  drop policy if exists "Family can update bp_notes status" on public.bp_notes;
  create policy "Family can update bp_notes status" on public.bp_notes
    for update to authenticated using (true) with check (true);

  drop policy if exists "Family can add bp_scenarios" on public.bp_scenarios;
  create policy "Family can add bp_scenarios" on public.bp_scenarios
    for insert to authenticated with check (true);
  drop policy if exists "Family can read bp_scenarios" on public.bp_scenarios;
  create policy "Family can read bp_scenarios" on public.bp_scenarios
    for select to authenticated using (true);
  drop policy if exists "Family can update bp_scenarios" on public.bp_scenarios;
  create policy "Family can update bp_scenarios" on public.bp_scenarios
    for update to authenticated using (true) with check (true);

  drop policy if exists "Family can add bp_practice" on public.bp_practice;
  create policy "Family can add bp_practice" on public.bp_practice
    for insert to authenticated with check (true);
  drop policy if exists "Family can read bp_practice" on public.bp_practice;
  create policy "Family can read bp_practice" on public.bp_practice
    for select to authenticated using (true);

  insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
  values
    ('better-parenting', 'bp_notes', 'table', 'owner', 'test', 'ShimmyCane/Index'),
    ('better-parenting', 'bp_scenarios', 'table', 'owner', 'Better Parenting (03 Projects/Better Parenting): scenarios the family wrote', 'ShimmyCane/Index'),
    ('better-parenting', 'bp_practice', 'table', 'owner', 'Better Parenting (03 Projects/Better Parenting): practice record (rating and reflection)', 'ShimmyCane/Index')
  on conflict (app, object_name) do nothing;

  insert into public.bp_notes (id, text) values ('test-note-1', 'test');
  insert into public.bp_scenarios (id, data) values ('test-own-1', '{"t":"test"}');
  insert into public.bp_practice (id, scenario_id, rating) values ('test-p-1', 'feel-01', 2);
  -- the same scenario sent again with newer data stays one row
  insert into public.bp_scenarios (id, data) values ('test-own-1', '{"t":"newer"}')
    on conflict (id) do update set data = excluded.data;
  select count(*) into n1 from public.bp_notes;
  select count(*) into n2 from public.bp_scenarios where data->>'t' = 'newer';
  select count(*) into n3 from public.bp_practice;
  select count(*) into tabs from pg_class where relnamespace = 'public'::regnamespace and relname in ('bp_notes', 'bp_scenarios', 'bp_practice');
  select count(*) into rls from pg_class where relnamespace = 'public'::regnamespace and relname in ('bp_notes', 'bp_scenarios', 'bp_practice') and relrowsecurity;
  select count(*) into pol from pg_policies where schemaname = 'public' and tablename in ('bp_notes', 'bp_scenarios', 'bp_practice');
  select count(*) into reg from public.app_table_registry where app = 'better-parenting';

  set local role authenticated;
  select count(*) into fam from public.bp_practice;
  reset role;
  begin
    set local role anon;
    perform 1 from public.bp_scenarios;
  exception when insufficient_privilege then anon_blocked := true;
  end;
  reset role;

  raise exception 'RESULT: tables=% rls_on=% policies=% registry=% notes=% scenarios_newer=% practice=% family_reads=% anon_blocked=%',
    tabs, rls, pol, reg, n1, n2, n3, fam, anon_blocked;
end $$;
