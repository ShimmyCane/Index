# Supabase Link (set up a project's database by hand)

Purpose
Connect a nursery project to its Supabase database, and create its tables, security rules and test, using the manual paste route. Jimmy copies the SQL from the repo and pastes it into the Supabase dashboard's SQL editor himself. This avoids the migration tool, which times out or stops for a confirmation in remote sessions (see the Adventure and Supabase lessons). The manual route is the default. The migration tool is used only when Jimmy asks for it.

Which database
- **Family** (`twvqvutrcobedvuhnzxq`): family games and activities that share the family login (Fishes, Expansion Wars, Felix Maze, Adventure, Family Habits). Read `04 AI/Supabase/brief.md` first.
- **Architecture** (`xabgankckrcuhcgdolrg`): studio and design work (Make 3D, Shimmy Specs, Growth, Paper Again). Keep its data strict: nothing from a real practice project in the repo.
- If the project's track is not clear, check `project_track.md`, then ask Jimmy. Do not guess.

Input
- Project folder (under `03 Projects/`), and the database it uses.
- The list of tables the project needs (name, purpose, who may read or write). If it is missing, ask.

Steps
1. **Check the live database first, read-only.** Use the Supabase tools (`list_tables`, `execute_sql` with `select` only). Confirm the table names are free, the registry (`app_table_registry`) and `table_index` exist, and no policy already covers the new tables. Record what you saw in the project's `04 AI/<Project>/brief.md`.
2. **Write the paste files** in the project's `supabase/` folder. Keep each one short (under about 150 KB, ideally under 200 lines), numbered in the order they are pasted:
   - `000_platform_owner.sql`: only if the project needs owner-only access and the database does not have `platform_owners` yet. Copy the shared file from `04 AI/Supabase/platform_owner.sql`; do not rewrite it.
   - `001_<app>_<purpose>.sql`: the tables, `enable row level security`, `revoke ... from anon`, `drop policy if exists` then `create policy`, the `table_index` rows, the `app_table_registry` rows, all with `if not exists` or `on conflict`.
   - `test_001_<app>.sql`: the rolled-back test (a `do $$` block that ends in `raise exception 'RESULT: ...'`). Run it before the real file. It leaves nothing behind.
   - `verify_001_<app>.sql`: read-only checks to paste back (see step 5).
3. **Check each file before Jimmy pastes it:**
   `python3 -I "02 Refs/Skills/scripts/sql_paste_check.py" <files>`
   Fix every BLOCK. Fix the WARN lines that would make a second run fail. Never paste a file with a BLOCK.
4. **Give Jimmy the paste order**, in one short list, for example:
   1. Dashboard → project → SQL Editor → New query.
   2. Paste `000_…` (only if listed) → Run. Expect "Success. No rows returned."
   3. Paste `test_001_…` → Run. Expect an error message that starts `RESULT:` with the values listed in the file. That error is the pass, because the block rolls back.
   4. Paste `001_…` → Run. Expect "Success."
   5. Paste `verify_001_…` → Run. Copy the result table and paste it back into the chat.
   Tell him to stop at the first unexpected message and paste that message back. Do not run the next file.
5. **Verify from his paste.** Read the verification output: every new table has `relrowsecurity = true`, each has the policy it should, the registry rows exist, and `app_table_unregistered` is empty. Do not treat the verification as done until he pastes it back.
6. **Wire the app.** Create `js/config.js` (or the project's equivalent) with the project URL and the publishable key only. Get them with `get_project_url` and `get_publishable_keys` (load the tool with ToolSearch first). Never write, print or paste a service-role key or a secret key. Run `privacy_check` before committing.
7. **Test.** Run `smoke_test` on the pages that talk to the database. Check that a database check reports each table, and that a signed-out run says "this device only" rather than showing an error on every load (see `settings_gear.md`).
8. **Record.** Update `04 AI/Supabase/brief.md` (current state: the project, the tables, what was applied and when), the project's `brief.md` (what is verified and what is not), and `lessons.md` if anything surprised you.

What must be said in every report
- The sign-in itself was not tested with a real account, unless Jimmy tested it on a device.
- The tables were created by Jimmy pasting the SQL, not by the migration tool.
- Anything still missing from the live database.

Rules
- The default is paste by hand. Use `apply_migration` only when Jimmy asks for it, and only after the same rolled-back test passed.
- Owner-only rules call `public.platform_is_owner()`. Never put an email or a user id in a file in the repo; Jimmy adds his owner row by hand.
- Re-list the live tables right before Jimmy pastes anything (another session may have changed the database).
- Never change a table that another app owns. Check `app_table_registry` for `owner` and `reads` first.
- Live policies that already exist are changed only in a new paste file with a test, never by editing an old file.

Lessons this comes from
- A migration call timed out without applying anything; checking `pg_class` and then pasting the SQL by hand worked (Adventure, Supabase lessons 8).
- Create tables with RLS enabled in the same step, and revoke anon grants (Supabase lessons 9 and 10).
- Empty results with no error usually mean row-level security (Allowances, Supabase lesson 2).
- Keep the full SQL in the repo, because the migration history can end up incomplete (Supabase lessons 8).
