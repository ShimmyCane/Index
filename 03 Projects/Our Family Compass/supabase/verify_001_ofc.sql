-- Read-only checks to paste back after 001_ofc_family.sql. Changes nothing.
select relname, relrowsecurity as rls_on from pg_class
  where relnamespace = 'public'::regnamespace and relname in ('ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework') order by 1;
select tablename, policyname, cmd, roles from pg_policies
  where schemaname = 'public' and tablename in ('ofc_notes', 'ofc_thoughts', 'ofc_pieces', 'ofc_framework') order by 1, 2;
select policyname, cmd, roles from pg_policies
  where schemaname = 'storage' and tablename = 'objects' and policyname like '%ofc-voice%' order by 1;
select id, public from storage.buckets where id = 'ofc-voice';
select table_name, privilege_type from information_schema.role_table_grants
  where table_schema = 'public' and table_name like 'ofc\_%' and grantee = 'anon';
select app, object_name, object_type, access from public.app_table_registry where app = 'our-family-compass' order by 2;
select object_name from public.app_table_unregistered where object_name like 'ofc\_%';
