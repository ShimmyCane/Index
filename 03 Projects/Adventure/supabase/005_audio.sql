-- ============================================================================
-- Adventure — recorded chapters
-- The storyteller's chapters are recorded with Kokoro voices (tools/make_voice.py --db)
-- and stored in a private bucket, because chapters grow from the family's scenes and
-- must never go into the public repo. Runs after 004_script.sql. Re-runnable.
--
-- adv_chapters.audio = { "path": "b1c2-<hash>.mp3", "duration": 270.1, "lines": [[start, end], ...],
--                        "source": ["line text", ...], "voices": { "narrator": "bm_fable", ... }, "made": "2026-11-10" }
-- The page plays it only while "source" still matches the chapter's script.
-- ============================================================================
alter table public.adv_chapters add column if not exists audio jsonb;

-- Private bucket: only the signed-in family account can listen. The recorder
-- writes with the project's server credentials, so no write policy is needed.
insert into storage.buckets (id, name, public)
values ('adv-audio', 'adv-audio', false)
on conflict (id) do nothing;

drop policy if exists "Family can listen to adv-audio" on storage.objects;
create policy "Family can listen to adv-audio" on storage.objects
    for select to authenticated using (bucket_id = 'adv-audio');

-- The registry has no row type for buckets; the bucket is noted on the chapters row.
update public.app_table_registry
   set description = 'Story chapters in three lengths, with per-role whispers, an optional script (voiced) and audio (recording in bucket adv-audio).'
 where app = 'adventure' and object_name = 'adv_chapters';

-- Check: should return one row (adv-audio, false) and the two new columns.
select id, public from storage.buckets where id = 'adv-audio';
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'adv_chapters' and column_name in ('script', 'audio');
