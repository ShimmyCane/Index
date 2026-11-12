-- Read-only checks to paste back after 001_rs_notes.sql. Changes nothing.
select relname, relrowsecurity as rls_on from pg_class where oid = 'public.rs_notes'::regclass;
select policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'rs_notes' order by 1;
select app, object_name, object_type, access from public.app_table_registry where app = 'rhythm-sticks';
select object_name from public.app_table_unregistered where object_name ilike '%rs_notes%';
