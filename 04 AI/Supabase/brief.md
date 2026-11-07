# Supabase — AI Brief

**Updated:** 2026-10-26
**What it is:** the nursery's convention for Supabase projects, plus a small registry that makes "which app uses which table?" answerable from inside the database.
**Skill:** `02 Refs/Skills/supabase_project.md` (run as `/supabase-project`).
**Template:** `supabase_registry_template.sql` (this folder).
**Lessons:** `lessons.md` (this folder).

## Why

Several small apps may share one Supabase project. Their tables then sit side by side in `public`, and one app can quietly depend on another's table. Without an index, you cannot tell what a change will break or who a table belongs to.

## Conventions

| Object | Purpose |
|--------|---------|
| `public.app_table_registry` | One row per (app, database object). Columns: `app` (short slug), `object_name`, `object_type` (`table`, `view`, `function`), `access` (`owner` defines and writes it, `reads` only reads another app's object), `description`, `repo`. Unique on (app, object_name). |
| `public.app_table_unregistered` | View listing every table or view in `public` that is not in the registry. It should be empty. |

Both are readable and writable by signed-in users only. Anon has no access.

Rules:
1. Prefix tables with the app slug unless the table is deliberately shared. A shared table has exactly one `owner` row and `reads` rows for the other apps.
2. Register objects in the same migration that creates them.
3. Check `app_table_unregistered` at the end of every schema change.
4. Before changing or dropping a table, check who depends on it in `app_table_registry`.
5. Keep the SQL in the app's repo (`supabase/` folder). The database is the index; the repo is the history.
6. For a new Supabase project, run the template once, then seed the first app.
7. Manual runs are accepted. When the Supabase tools are unavailable, write the migration and its rollback test to the app's `supabase/` folder and hand Jimmy the paths, in the order test, migration, check. Mark the table "not verified" until he pastes back the results. Migrations stay re-runnable.

## Current state

- Adventure is the first nursery app with a database. It uses the existing **Family** project (shared with the family apps, one family login), tables `adv_*` (roles, entries, chapters, turns, runs, places, notes, history), registered as app `adventure` in the same migration. SQL in `03 Projects/Adventure/supabase/`. Not yet applied as of 2026-10-27.
- Felix Maze: `fmz_flags` is **live** in the Family project (applied 2026-10-28 as migration `felix_maze_flags`, tested first in a rolled-back transaction, RLS on, registered under app `felix-maze`; SQL in `03 Projects/Felix Maze/supabase/002_flags.sql`). `fmz_mazes`, `fmz_doodles`, `fmz_characters` are written in `001_felix_maze.sql` and not applied.
- Make 3D scene log (Architecture project, 2026-11-02): `m3d_scene_log` is **live** (migration `m3d_scene_log`; RLS on, anon revoked, owner-only policy, registered in `table_index`; SQL in `03 Projects/Make 3D/supabase/002_m3d_scene_log.sql`). One row per scene version (`model_id`), with history (source), world, replayed model, label and note. It is the log of record; the project's JSON is build output. Load with `node tools/push_scene_log.js` using the owner's session token (see the script header). Table was empty when created; the first load is the owner's step.
- Architecture project registry: this project uses `public.table_index` (table_name, project, purpose), not `app_table_registry`. Check the live project before using the template.
- Unregistered as of 2026-11-02: `sketch_versions` (Quick Detail). Not ours to change; flag to its owner.
- Make 3D (Architecture project, not Family): `m3d_scenes` is **live** (applied 2026-11-02 as migration `m3d_scenes` after a rolled-back test; RLS on, anon revoked, owner-only policy, registered in `table_index`; SQL in `03 Projects/Make 3D/supabase/001_m3d_scenes.sql`). Reads Quick Detail's `sketch_details` by tag `make 3-D`, read only.
- Fishes: `fish_notes` is **live** in Family (applied 2026-11-03 as migration `fishes_fish_notes`, after its rolled-back test; RLS on, anon has no grants, family sign-in can insert and read; registered under app `fishes`; SQL in `03 Projects/Fishes/supabase/001_fish_notes.sql`). Fishes borrows the Family sign-in the same way Expansion Wars does.
- Expansion Wars: `xw_maps` is **live** in Family (applied 2026-11-03 as a manual run of `03 Projects/Expansion Wars/supabase/001_xw_maps.sql`, after its rolled-back test passed). RLS on, anon revoked, family-only policies, registered under app `expansion-wars`. The page is not wired to it yet.
- Athena's world (Family project, prefix `athena_`): `athena_saves` (one row, the family's saved game) and `athena_notes` (notes for improvement) are **written, not applied**. SQL in `03 Projects/Athena's world/supabase/` (`test_001`, `001_athena_family`, `verify_001`). The game signs in with the family login and works offline without it. Not verified until Jimmy pastes the SQL and the verify output comes back.
- Private family projects live in ShimmyAI. Their project references and table state are not recorded here.

## How SQL gets into a database (default: by hand)

- Jimmy pastes the SQL into the dashboard's SQL editor himself. The migration tool times out or waits for a confirmation in remote sessions, so it is used only when Jimmy asks.
- Each project's SQL lives in its `supabase/` folder as short numbered files: `000_` (owner check, once per database), `test_` (rolled-back, run first), `001_` (the real change), `verify_` (read-only, pasted back).
- Check every file first with `python3 -I "02 Refs/Skills/scripts/sql_paste_check.py" <files>`. Fix every BLOCK.
- Process and checklist: `02 Refs/Skills/supabase_link.md` (run as `/supabase-link`).

## Owner-only access (no emails in the repo)

- Owner-only policies call `public.platform_is_owner()`, which checks `public.platform_owners` for `auth.uid()`. The owner's user id is added by hand in the SQL editor and is never committed. Script: `platform_owner.sql` in this folder. Run it once per project before any app migration that uses it.
- The Architecture project still has live `owner full access` policies that compare the sign-in email (projects, proposals, fee milestones, lessons, table index, sketch tables, Make 3D tables). Those are not changed by a repo commit. Changing them needs a seeded owner row, a rolled-back test and Jimmy's go-ahead.
- The Family project's live policies are mostly `true` for any signed-in user. Review before adding more owner-only data there.

## Verified vs. unverified

- Verified: the template and conventions were carried over from the ShimmyAI registry, which was used on a live project.
- Unverified in this repo: the template has not been run against a Supabase project from Index.

## Next steps

1. When a nursery project first needs data, follow `/supabase-project`.
2. Run the template once on that project and check that `app_table_unregistered` is empty.
