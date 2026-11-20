-- QC keynotes: check after 001_qk_notes.sql. Read only. Expect: rls_on = true, one owner policy,
-- no anon grant, and one table_index row for qk_notes.
select c.relrowsecurity as rls_on,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = 'qk_notes') as policies,
       (select count(*) from information_schema.role_table_grants g where g.table_schema = 'public' and g.table_name = 'qk_notes' and g.grantee = 'anon') as anon_grants,
       (select count(*) from public.table_index t where t.table_name = 'qk_notes') as registry_rows
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'qk_notes';
