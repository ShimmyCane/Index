# Project Sync (bring every project to the same standard, and check split-readiness)

Purpose
Every project in `03 Projects/` should run on the same logic: the same pointer file, schematic, convo, 04 AI notes, track, version log, ⚙️ panel, privacy rules and database conventions. This skill checks each project against that standard, fixes what is missing, and says what still needs Jimmy's decision. It also gives the list a project must pass before it leaves the nursery.

Input
- Optional: one project name. With no name, all projects.

Actions
1. **Run the inventory**: `02 Refs/Skills/scripts/project_inventory.sh`. One line per project, ✔ / ✘ / -. Read it before changing anything.
2. **Run the checks** that the inventory does not cover:
   - privacy: `02 Refs/Skills/scripts/privacy_scan.sh` (no BLOCK allowed);
   - database files: `python3 -I 02 Refs/Skills/scripts/sql_paste_check.py <supabase files>` (no BLOCK; WARN lines matter only for the next paste of that file);
   - an `index.html` or other page that is the project's front door: it opens from `file://` (run `smoke_test`).
3. **Fix the standard items that are mechanical** (no judgement needed), in this order:
   a. **04 AI notes**: create `04 AI/<Project>/brief.md` (goal, architecture, verified vs unverified, next steps) and `lessons.md` when either is missing. Write them from the schematic and the convo; mark anything not checked as unverified.
   b. **Pointer file**: `CLAUDE.md` in the project folder (purpose, where the schematic, convo, brief and lessons are, how to run it, the track line).
   c. **Track line**: one line in `CLAUDE.md`: `Track: A. Family play` or `Track: B. Studio design`. If the track is not confirmed by Jimmy, write it with `(proposed, confirm)`. Do not present a proposal as a decision.
   d. **Version log**, for any project with a page: `js/version.js` with `APP_VERSION` and `APP_CHANGELOG` (newest first), and the ⚙️ panel from `settings_gear.md` §9. A project with its own changelog (Fishes' `CHANGELOG.md`, Chinese Character Sudoku's drawer list, Make 3D's `changelog.md`) moves it into `js/version.js` and keeps the old file only as history.
   e. **Folder hygiene**: a `V1/`, `V2/` copy folder is not created by Claude (`CLAUDE.md`). If one exists, do not delete it. Ask Jimmy whether it is a copy to remove, and say what is in it.
4. **Report what needs a decision** (never decide these alone):
   - tracks that are only proposed;
   - feedback boxes (`feedback_notes.md`) for pages people use, when the project has none;
   - folders such as `V1/`;
   - live database policies that differ from the repo;
   - anything the privacy scan flagged as REVIEW.
5. **Update the indexes**: `03 Projects/03 projects_schematic.md` (status and one line per project, all projects listed), `04 AI/04 ai_schematic.md`.
6. **Verify**: run the inventory again; every standard column is ✔ or `-`, and every remaining ✘ is in the decision list. For a project that changed, run `smoke_test` on its pages.
7. **Commit** on a branch, one commit per project where practical, and open a draft PR. Do not merge without Jimmy's word.

Split-readiness (a project may leave the nursery only when every item is ✔)
- Inventory: every column ✔ or `-`, and the track confirmed by Jimmy (not "proposed").
- Status in the projects schematic is `device-tested` or later. An MVP that has not been on a device is not ready to leave.
- `brief.md` lists verified and unverified work, and the unverified items are either done or handed over in the new repo's README.
- `lessons.md` holds the project's lessons; the generic ones are promoted to `lessons_pool.md` and `patterns.md`. Nothing that identifies a private person or a client goes into those files.
- Privacy: no private folder is tracked; photos of real places are in `private/`; no email, key or password in any file or SQL; convo files hold no personal details.
- Database: the project's SQL is in `supabase/`, its tests roll back, its tables are in `table_index` and `app_table_registry`, and the live policies match the repo (checked read-only).
- Version log: the current version is in `js/version.js` and matches the latest entry.
- The copy-out plan: which files go to the new repo, which stay in the nursery as history (convo, schematic, lessons), and what the new repo's first commit contains. Jimmy copies the project by hand; Claude does not create the repo unless asked.

Rules
- Do not change the look or the behaviour of a project to make the inventory pass. The version log and tracks are additions; check the page still works (`smoke_test`).
- Do not edit `index.html` (the home page) except to add a project link after Jimmy confirms it once.
- Do not edit the root `readme.md`.
- Do not move or rename a project's code to satisfy the standard. Ask first.
- Do not delete a `V#` folder, a changelog file or a convo file.
- Keep convo files as they are; add a new version for new questions.

Lessons this comes from
- A project that is not on the same logic as the others takes longer to split out. The checklist before splitting avoids finding the gaps in the new repo.
- Track and version rules applied across apps must be checked in a browser, since a panel that opens in one app can cover a control in another (Make 3D: the gear covered the model-check chip until the footer had room).
