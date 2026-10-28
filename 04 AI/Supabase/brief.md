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

## Current state

- Adventure is the first nursery app with a database. It uses the existing **Family** project (shared with the family apps, one family login), tables `adv_*` (roles, entries, chapters, turns, runs, places, notes, history), registered as app `adventure` in the same migration. SQL in `03 Projects/Adventure/supabase/`. Not yet applied as of 2026-10-27.
- Felix Maze plans tables `fmz_mazes`, `fmz_doodles`, `fmz_characters` in the Family project, app `felix-maze`. SQL in `03 Projects/Felix Maze/supabase/001_felix_maze.sql`, written 2026-10-28, not applied.
- Athena's world has no database need yet.
- Private family projects live in ShimmyAI. Their project references and table state are not recorded here.

## Verified vs. unverified

- Verified: the template and conventions were carried over from the ShimmyAI registry, which was used on a live project.
- Unverified in this repo: the template has not been run against a Supabase project from Index.

## Next steps

1. When a nursery project first needs data, follow `/supabase-project`.
2. Run the template once on that project and check that `app_table_unregistered` is empty.
