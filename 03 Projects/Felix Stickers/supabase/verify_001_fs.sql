-- Read-only check for 001_fs_family.sql. Paste the result table back into the chat.
select c.relname as table_name, c.relrowsecurity as rls_on,
  (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies,
  has_table_privilege('anon', c.oid, 'select') as anon_can_read
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('fs_creations', 'fs_notes')
union all
select 'registry rows', null, (select count(*) from public.app_table_registry where app = 'felix-stickers'), null;
