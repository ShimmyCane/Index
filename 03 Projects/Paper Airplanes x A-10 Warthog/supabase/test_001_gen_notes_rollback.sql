-- Test for 001_gen_notes.sql. Runs in one transaction and rolls back, so nothing is kept.
-- Run it first. If every select returns the expected row, paste 001_gen_notes.sql.
begin;

insert into public.gen_notes (identifier, project, sub_project, description, identifiers)
values ('N-TEST-0001', 'Paper Airplanes x A-10 Warthog', 'A-10 jet / chase', 'test note', '{"HP": 72}');

insert into public.gen_notes_index (code, project, name, meaning, unit, sort_order)
values ('HP', 'all', 'Health', 'Hull left, as a share of full', '%', 1);

select identifier, status, identifiers->>'HP' as hp from public.gen_notes where identifier = 'N-TEST-0001';
select code, name from public.gen_notes_index where code = 'HP';

rollback;
