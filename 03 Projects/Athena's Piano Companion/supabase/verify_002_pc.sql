-- Read-only checks to paste back after 002_pc_bin_sessions.sql. Changes nothing.
select column_name, data_type from information_schema.columns where table_schema = 'public' and table_name = 'pc_takes' and column_name in ('session_id', 'deleted_at') order by 1;
select relname, relrowsecurity as rls_on from pg_class where relnamespace = 'public'::regnamespace and relname = 'pc_sessions';
select tablename, policyname, cmd from pg_policies where schemaname = 'public' and tablename in ('pc_takes', 'pc_sessions') order by 1, 2;
select policyname, cmd from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%pc-takes%' order by 1;
select app, object_name from public.app_table_registry where app = 'piano-companion' order by 2;
select object_name from public.app_table_unregistered where object_name like 'pc\_%';
