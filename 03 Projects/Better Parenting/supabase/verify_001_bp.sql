-- Read-only checks to paste back after 001_bp_family.sql. Changes nothing.
select relname, relrowsecurity as rls_on from pg_class
  where relnamespace = 'public'::regnamespace and relname in ('bp_notes', 'bp_scenarios', 'bp_practice') order by 1;
select tablename, policyname, cmd, roles from pg_policies
  where schemaname = 'public' and tablename in ('bp_notes', 'bp_scenarios', 'bp_practice') order by 1, 2;
select table_name, privilege_type from information_schema.role_table_grants
  where table_schema = 'public' and table_name like 'bp\_%' and grantee = 'anon';
select app, object_name, object_type, access from public.app_table_registry where app = 'better-parenting' order by 2;
select object_name from public.app_table_unregistered where object_name like 'bp\_%';
