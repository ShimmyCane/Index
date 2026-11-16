-- Read-only checks to paste back after 001_fgw_notes.sql. Changes nothing.
select relname, relrowsecurity as rls_on from pg_class where oid = 'public.fgw_notes'::regclass;
select policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'fgw_notes' order by 1;
select app, object_name, object_type, access from public.app_table_registry where app = 'felix-gear-wars';
select object_name from public.app_table_unregistered where object_name ilike '%fgw_notes%';
