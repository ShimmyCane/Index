-- Rolled-back test for 001_gc_notes.sql. Paste BEFORE 001. Needs platform_is_owner() (live already).
-- It builds the table, acts as the owner and as a stranger, then ends in an error that starts with
-- RESULT. That error is the pass: it rolls everything back. Nothing is left behind.
-- Expected: RESULT: tables=1 rls=1 policies=1 index=1 owner_sees=1 stranger_sees=0 stranger_insert=blocked anon=blocked done_check=blocked
do $$
declare
  v_tables int; v_rls int; v_pol int; v_index int; v_owner int; v_stranger int;
  v_insert text := 'allowed'; v_anon text := 'allowed'; v_done text := 'allowed';
begin
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

  insert into public.platform_owners (user_id, note) values ('00000000-0000-4000-8000-0000000000c1', 'test');
  perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-0000000000c1"}', true);
  set local role authenticated;
  insert into public.gc_notes (id, text, label) values ('n-rollback-1', 'test note', 'test');
  select count(*) into v_owner from public.gc_notes where id = 'n-rollback-1';
  begin
    insert into public.gc_notes (id, text, status) values ('n-rollback-2', 'x', 'archived');
  exception when others then v_done := 'blocked';
  end;
  reset role;

  perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-0000000000c2"}', true);
  set local role authenticated;
  select count(*) into v_stranger from public.gc_notes;
  begin
    insert into public.gc_notes (id, text) values ('n-rollback-3', 'x');
  exception when others then v_insert := 'blocked';
  end;
  reset role;

  set local role anon;
  begin
    perform count(*) from public.gc_notes;
  exception when others then v_anon := 'blocked';
  end;
  reset role;

  select count(*), count(*) filter (where relrowsecurity) into v_tables, v_rls
    from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relname = 'gc\_notes';
  select count(*) into v_pol from pg_policies where schemaname = 'public' and tablename = 'gc_notes';
  select count(*) into v_index from public.table_index where table_name = 'gc_notes';

  raise exception 'RESULT: tables=% rls=% policies=% index=% owner_sees=% stranger_sees=% stranger_insert=% anon=% done_check=%',
    v_tables, v_rls, v_pol, v_index, v_owner, v_stranger, v_insert, v_anon, v_done;
end $$;
