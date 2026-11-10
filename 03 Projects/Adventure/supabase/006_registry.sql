-- ============================================================================
-- Adventure — link every registry row to this project.
-- repo stays 'ShimmyCane/Index' (owner/repo, like the other nursery apps); each
-- description starts with the app and its folder, so "who owns adv_*?" points
-- straight at 03 Projects/Adventure. Re-runnable; run any time after 001 and 003.
-- The private bucket adv-audio (005_audio.sql) cannot have its own row (the registry
-- only knows tables, views and functions), so it is named on adv_chapters.
-- ============================================================================
insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
select 'adventure', v.object_name, v.object_type, 'owner', 'Adventure (03 Projects/Adventure): ' || v.description, 'ShimmyCane/Index'
from (values
 ('adv_roles',      'table',    'characters the family can play (roles, not players).'),
 ('adv_entries',    'table',    'world bible in short, history, plan, themes, rules, notes and settings (Reckoning, Branch, Voices, World clocks) as text.'),
 ('adv_chapters',   'table',    'story chapters in three lengths, with per-role whispers, an optional voiced script, and its recording in the private storage bucket adv-audio.'),
 ('adv_turns',      'table',    'scenes the family sends: ordered beats by role.'),
 ('adv_runs',       'table',    'nightly storyteller run log.'),
 ('adv_places',     'table',    'places as a tree; each place is a map of its children.'),
 ('adv_notes',      'table',    'append-only journal about characters, places and story notes.'),
 ('adv_history',    'table',    'change log for every adv_ table, used for undo.'),
 ('adv_touch',      'function', 'keeps updated_at current.'),
 ('adv_log_change', 'function', 'trigger that copies every change into adv_history.'),
 ('adv_restore',    'function', 'puts one row back as it was before a logged change.'),
 ('adv_restore_to', 'function', 'undoes every logged change after a time.')
) as v(object_name, object_type, description)
on conflict (app, object_name) do update
   set description = excluded.description, repo = excluded.repo, object_type = excluded.object_type, access = excluded.access;

-- Check: 12 rows, all starting with "Adventure (03 Projects/Adventure):", and nothing adv_ unregistered.
select object_name, repo, left(description, 60) as description
  from public.app_table_registry where app = 'adventure' order by object_name;
select * from public.app_table_unregistered where object_name like 'adv%';
