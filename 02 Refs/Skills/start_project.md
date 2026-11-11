# Start Project

When the user asks to initialize a project:

1. Extract the project name from the user's request.
2. If not already there, Create:
   - `03 Projects/<PROJECT NAME>/`
   - `04 AI/<PROJECT NAME>/`
   - `03 Projects/<PROJECT NAME>/convo/`
   - If already present, review project files.
3. Create:
   - `03 Projects/<PROJECT NAME>/schematic.md`
   - `03 Projects/<PROJECT NAME>/CLAUDE.md`: short pointer file (purpose, where the schematic/convo/brief/lessons live, how to run it). See `02 Refs/Skills/claude_review_project.md` step 2.
4. If there's no file already. Create or append to the appropriate `03 Projects/<PROJECT NAME>/convo/convo v#.md`.
5. Review `02 Refs/Workflow/new project workflow.md`, and any project documents from 01 plan or the 03 projects/<PROJECT NAME> folder. Ask the user the clarifying questions required to proceed, use `convo/convo v#.#.md` as a way to record our conversations.
   - For a kids' or web app, ask whether it needs a ⚙️ settings button (options, error panel, database check). If yes, follow `02 Refs/Skills/settings_gear.md`, including the version log panel inside ⚙️ (`js/version.js`).
6. Create a schematic.md file based on the project info. Start it with the project's track (`02 Refs/Skills/project_track.md`): A. Family play or B. Studio design. Use the track's defaults for the screen, ⚙️ and panels. If the project needs a database, plan it with `02 Refs/Skills/supabase_link.md` (the manual paste route).
7. Feedback notes: if the project has a page that the user plays or uses, plan the feedback feature in the schematic. It has three parts:
   - A notes box in the settings (⚙️) panel, labelled "Notes for improvement". Each note is saved with the item it is about (a map, a level, a screen) and the time.
   - A way to read the notes back, in the same panel or on a saved-items page, so the user can review them.
   - Notes are stored with the project's other data (device storage first; a database table only when the data must persist). Notes are never sent anywhere else.
   Add the feedback feature to the project's first increment, so feedback can start on the first build. Build it from `02 Refs/Skills/feedback_notes.md`.
8. Notes in the family database (family-play projects that need notes to persist across devices):
   - Link to the Family project (`twvqvutrcobedvuhnzxq`) and follow `02 Refs/Skills/supabase_link.md`. Plan a table `<prefix>_notes` with `id`, `text`, `page`, `item`, `label`, `version`, `status` (`open` or `done`) and `noted_at`. Reference model: `03 Projects/中文笔画/supabase/001_zhbh_notes.sql` (with its `test_001_` and `verify_001_` files). Change only the prefix, the app slug and the table name.
   - Row-level security on, `anon` revoked, family sign-in may insert, read and update status. Register the table in `app_table_registry` in the same file.
   - Add a 家庭登入 block to ⚙️ (email, password, signed-in status, sign out, 檢查資料庫). Reference: the block in `03 Projects/中文笔画/index.html` and `03 Projects/中文笔画/js/family.js`. Use the publishable key only. Never put an email or password in the repo.
   - Notes stay on the device first. When signed in they are also sent to the family table, with the note's own `id` and time unchanged. Signed out, the database check says "this device only". Notes are sent nowhere else.
   - Test with the rolled-back test, apply by hand or with the migration tool only when Jimmy asks, and record the result in `04 AI/Supabase/brief.md`. Lessons: `04 AI/Supabase/lessons.md`.

8. Version log: if the project has any page, build the version panel inside ⚙️ from `02 Refs/Skills/settings_gear.md` §9 from the first build. Create `js/version.js` with `APP_VERSION` set to `0.1.0` and one `APP_CHANGELOG` entry for the first build (newest first). The panel is closed by default and shows the version in its header. Every later change bumps the version in the same commit.

Rules:
- Do not explain your reasoning.
- Do not infer a project name.
- Do not invent missing paths.
- Do not create files unrelated to these instructions.
- If any required information is unclear, ask the user.
- Execute the steps directly; do not describe hypothetical tool calls.