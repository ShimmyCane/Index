-- ============================================================================
-- Read-only check after 001_athena_family.sql. Paste into the Family project's SQL editor and Run.
-- Copy the result table and paste it back into the chat.
-- Expect two rows, each with rls_on = true, policies = 1, anon_grants = 0, registered = 1.
-- ============================================================================
select c.relname as table_name,
       c.relrowsecurity as rls_on,
       (select count(*) from pg_policy p where p.polrelid = c.oid) as policies,
       (select count(*) from information_schema.role_table_grants g
         where g.table_schema = 'public' and g.table_name = c.relname and g.grantee = 'anon') as anon_grants,
       (select count(*) from public.app_table_registry r
         where r.app = 'athena' and r.object_name = c.relname) as registered
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relname in ('athena_saves', 'athena_notes')
order by c.relname;
