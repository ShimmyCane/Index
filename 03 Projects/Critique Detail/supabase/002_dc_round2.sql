-- Critique Detail, round 2: office and cloud-sourced details, rejected reviews, CSI section on rulebooks.
-- Database: Architecture. Paste AFTER test_002_dc.sql passed. Re-runnable. No policy changes:
-- the owner-only policies from 001 already cover the new columns.

alter table public.dc_details add column if not exists source_ref text not null default '';
alter table public.dc_details drop constraint if exists dc_details_source_kind_check;
alter table public.dc_details add constraint dc_details_source_kind_check
  check (source_kind in ('sample', 'sketch', 'own', 'office', 'quick_detail', 'library'));
alter table public.dc_reviews add column if not exists status text not null default 'reviewed';
alter table public.dc_reviews drop constraint if exists dc_reviews_status_check;
alter table public.dc_reviews add constraint dc_reviews_status_check check (status in ('reviewed', 'rejected'));
alter table public.dc_schemas add column if not exists csi_section text not null default '';
alter table public.dc_schemas add column if not exists subcategory text not null default '';
update public.table_index set purpose = 'One row per reviewed detail (sample, own, office, Quick Detail or library); image in bucket dc-details; source_ref names the cloud source'
  where table_name = 'dc_details';
