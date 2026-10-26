# Supabase Project

Purpose
Set up or change a Supabase project for a nursery app, so every table has an owner, every table is protected by row-level security, and the database can say which app uses which table. Conventions and the registry are in `04 AI/Supabase/brief.md`. Lessons are in `04 AI/Supabase/lessons.md`.

Input
- Project name (the nursery folder in `03 Projects/`). If none is given, ask. Don't guess.
- What the app stores, and whether the Supabase project is new or shared with another app.

Actions
1. Read the project's `schematic.md` and `04 AI/Supabase/brief.md`.
2. Inspect the live project before writing SQL. Use the Supabase tools if connected (`list_tables`, `list_migrations`, `execute_sql` on `information_schema` and `pg_policies`). If they aren't connected, ask Jimmy for the current table list. Never trust a schema file alone.
3. If the project is new, run `04 AI/Supabase/supabase_registry_template.sql` once to create the registry.
4. Design the tables:
   - Prefix every table with the app slug (`athena_`, `<app>_`) unless it is deliberately shared.
   - Create each table with RLS enabled in the same statement.
   - Revoke default grants from `anon` on every new table.
5. Put the SQL in the project's `supabase/` folder, as a migration file. Add the registry rows in the same file, using the pattern at the bottom of the template.
6. Before applying, re-list migrations and tables. Another session may have changed the project since you last looked. Never touch objects you did not create.
7. Test inside a rolled-back transaction. Fake the role and user id, and return results in an error message so nothing persists. Confirm with a count query afterwards.
8. Check `select * from public.app_table_unregistered;`. It must be empty, or list only other apps' objects.
9. Frontend rules: publishable key only in browser code, never the service-role key. Use the three-tier fallback (live with timeout, then local cache, then bundled JSON) and a visible error panel.
10. Report: what was created, the registry rows added, what was verified against the live project, and what was not verified (for example, a real login).

Rules
- Add and migrate only. Don't drop tables, policies or data without asking.
- Never put keys, project refs or personal data in this repo. Use placeholders such as `<project-ref>`.
- After a timeout, check what was created before retrying. Nothing may have been applied.
- Keep the full SQL in the repo. The migration history alone is not enough.
