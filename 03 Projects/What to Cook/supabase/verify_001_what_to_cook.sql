-- ============================================================================
-- What to Cook — read-only checks. Paste after 001 and copy the result back.
-- Expect: every wtc_ table rls = true, policies = 1, anon_grants = 0, and the
-- unregistered list is empty (or shows only other apps' tables).
-- ============================================================================
select c.relname as table_name,
       c.relrowsecurity as rls_on,
       (select count(*) from pg_policy p where p.polrelid = c.oid) as policies,
       (select count(*) from information_schema.role_table_grants g
         where g.table_schema = 'public' and g.table_name = c.relname and g.grantee = 'anon') as anon_grants
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'wtc\_%'
order by 1;

select count(*) as registered_rows from public.app_table_registry where app = 'what-to-cook';

select object_name as unregistered_table from public.app_table_unregistered
where object_name like 'wtc\_%';
