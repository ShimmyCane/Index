-- Read-only checks to paste back after 001_gc_notes.sql. Changes nothing.
-- Expect: gc_notes with rls_on = true, one policy, anon_can_read = false, one table_index row.
-- owner_rows tells you whether any sign-in can see data: 0 means nobody yet (add your own row by hand).
select c.relname, c.relrowsecurity as rls_on,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies,
       has_table_privilege('anon', c.oid, 'select') as anon_can_read
from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r' and c.relname = 'gc_notes';
select table_name, project from public.table_index where table_name = 'gc_notes';
select (select count(*) from public.platform_owners) as owner_rows,
       (select count(*) from public.gc_notes) as notes_in_cloud;
