-- ============================================================================
-- Massage Map: read-only checks after 001_mm_family.sql. Changes nothing.
-- Expected results:
--   1. three rows, rls_on = true
--   2. anon_select is false for all three tables; authenticated_insert is false for mm_members
--      (true for mm_flags and mm_ratings: the row rules are in the policies, checked by the test)
--   3. four registry rows for app massage-map
--   4. no rows from the unregistered check (no mm_ table missing from the registry)
--   5. nine policies: one on mm_members, four each on mm_flags and mm_ratings
-- ============================================================================

select c.relname as table_name, c.relrowsecurity as rls_on
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('mm_members', 'mm_flags', 'mm_ratings')
order by 1;

select t.table_name,
       has_table_privilege('anon', 'public.' || t.table_name, 'select') as anon_select,
       has_table_privilege('authenticated', 'public.' || t.table_name, 'insert') as authenticated_insert
from (values ('mm_members'), ('mm_flags'), ('mm_ratings')) as t(table_name)
order by 1;

select app, object_name, object_type, access
from public.app_table_registry
where app = 'massage-map'
order by object_name;

select object_name
from public.app_table_unregistered
where object_name like 'mm\_%';

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('mm_members', 'mm_flags', 'mm_ratings')
order by tablename, policyname;
