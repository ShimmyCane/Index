-- Read-only checks to paste back after 001_dc_tables.sql. Changes nothing.
-- Expect 6 tables with rls_on = true, one policy each, one private bucket, one storage policy, 6 index rows.
select c.relname, c.relrowsecurity as rls_on,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies,
       has_table_privilege('anon', c.oid, 'select') as anon_can_read
from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relname like 'dc\_%' order by 1;
select id, public from storage.buckets where id = 'dc-details';
select policyname, cmd from pg_policies where schemaname = 'storage' and policyname = 'owner full access dc-details';
select table_name, project from public.table_index where project in ('Critique Detail', 'platform') order by 1;
select (select count(*) from public.platform_owners) as owner_rows;
