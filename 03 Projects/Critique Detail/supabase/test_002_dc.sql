-- Rolled-back test for 002_dc_round2.sql. Paste BEFORE 002. It ends in an error starting RESULT; that is the pass.
-- Expected: RESULT: office=ok bad_kind=blocked rejected=ok bad_status=blocked section=07 71 00 policies=6
do $$
declare
  v_detail uuid; v_office text := 'ok'; v_bad text := 'allowed'; v_rej text := 'ok'; v_badst text := 'allowed'; v_section text; v_pol int;
begin
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

  insert into public.dc_details (slug, title, source_kind, source_ref) values ('rollback_office', 't', 'office', 'sketch_details:test') returning id into v_detail;
  begin
    insert into public.dc_details (slug, title, source_kind) values ('rollback_bad', 't', 'client');
  exception when others then v_bad := 'blocked';
  end;
  insert into public.dc_reviews (detail_id, status) values (v_detail, 'rejected');
  begin
    insert into public.dc_reviews (detail_id, status) values (v_detail, 'maybe');
  exception when others then v_badst := 'blocked';
  end;
  insert into public.dc_schemas (key, csi_division, title, csi_section, subcategory) values ('rollback/test', '07', 't', '07 71 00', 'Roof Specialties');
  select csi_section into v_section from public.dc_schemas where key = 'rollback/test';
  select count(*) into v_pol from pg_policies where schemaname = 'public' and tablename like 'dc\_%';
  raise exception 'RESULT: office=% bad_kind=% rejected=% bad_status=% section=% policies=%', v_office, v_bad, v_rej, v_badst, v_section, v_pol;
end $$;
