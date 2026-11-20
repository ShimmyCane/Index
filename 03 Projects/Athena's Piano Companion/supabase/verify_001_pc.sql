-- Read-only checks to paste back after 001_pc_family.sql. Changes nothing.
select relname, relrowsecurity as rls_on from pg_class where relnamespace = 'public'::regnamespace and relname like 'pc\_%' and relkind = 'r' order by 1;
select tablename, policyname, cmd from pg_policies where schemaname = 'public' and tablename like 'pc\_%' order by 1, 2;
select policyname, cmd from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%pc-takes%' order by 1;
select id, public from storage.buckets where id = 'pc-takes';
select app, object_name, access from public.app_table_registry where app = 'piano-companion' order by 2;
select object_name from public.app_table_unregistered where object_name like 'pc\_%';
