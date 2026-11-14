-- Read-only checks to paste back after 002_dc_round2.sql. Changes nothing.
-- Expect 4 new columns, 2 check constraints, and owner_rows = 1 once you have added your owner row.
select table_name, column_name from information_schema.columns
 where table_schema = 'public' and (table_name, column_name) in (('dc_details','source_ref'), ('dc_reviews','status'), ('dc_schemas','csi_section'), ('dc_schemas','subcategory')) order by 1, 2;
select conname, pg_get_constraintdef(oid) from pg_constraint where conname in ('dc_details_source_kind_check', 'dc_reviews_status_check');
select (select count(*) from public.platform_owners) as owner_rows;
