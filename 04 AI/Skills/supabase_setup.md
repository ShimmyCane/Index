# Supabase Setup (streamlined, programmatic)

Purpose
Set up or update a nursery project's Supabase database in one go: inspect → design → apply. No manual SQL paste, no rollback tests. I apply the migration directly and report what was created.

Which database
- **Family** (`twvqvutrcobedvuhnzxq`): family games and activities with shared family login
- **Architecture** (`xabgankckrcuhcgdolrg`): studio and design work, strict data
- If unclear, check `04 AI/Supabase/brief.md` and ask Jimmy

Input
- Project folder name (under `03 Projects/`)
- What the app stores (tables, purpose, who reads/writes)

Steps
1. **Inspect the live project**
   - List current tables: `list_tables` (verbose mode)
   - Check existing policies: `execute_sql` on `pg_policies`
   - Confirm table names are free and no conflicts exist
   - Record findings in `04 AI/<Project>/brief.md`

2. **Design tables**
   - Prefix with app slug (`app_`, `project_`) unless deliberately shared
   - Create with RLS enabled in the same statement
   - Revoke default grants from `anon` on every table
   - Define policies: who can read, who can write, what row-level rules apply

3. **Write and apply the migration**
   - Create migration file: `supabase/<timestamp>_<app>_tables.sql`
   - Include: table definitions, RLS enable, policy revokes, policies, registry rows, `app_table_registry` entries
   - Apply directly: `apply_migration` (no manual paste, no rollback test)
   - Verify with `list_tables` again to confirm it took

4. **Security check (optional, recommended)**
   - Run `get_advisors` (security type) on the project
   - Review any flagged functions or policies
   - Report any security concerns

5. **Report**
   - What tables were created
   - What policies were set up
   - Any warnings from security advisors
   - What is verified (applied) vs not yet tested (real login, production data)

Rules
- Add and migrate only. Don't drop tables, policies or data without asking.
- Never put service-role keys, project refs, or personal data in the repo.
- Migrations must be safe to re-run: `create table if not exists`, `drop policy if exists`, `on conflict do nothing`.
- Full SQL stays in the repo. Migration history alone is not enough.
- Two account settings to check separately (not in the database):
  1. Leaked-password protection (Auth settings)
  2. Sign-ups open/closed (Auth settings)
  - Report both; never change without owner's go-ahead.

What to wire after setup
- Create `js/config.js` (or equivalent) with project URL and publishable key only
- Never store service-role key in browser code
- Use three-tier fallback: live API → localStorage cache → bundled JSON
- Add visible database error panel (failed tables, auth status)
- Run `smoke_test` on pages that talk to the database

Conventions
- See `04 AI/Supabase/brief.md` for database layout, registry schema, and naming
- See `04 AI/Supabase/lessons.md` for common gotchas
- See `02 Refs/Skills/settings_gear.md` for the error panel pattern
