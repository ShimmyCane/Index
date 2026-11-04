Purpose
- This folder will be skills that we work on together.

Skills:
- start_project: Initializes a new project by setting up project folders, creating a schematic, and building an MVP.
- ipad_website: Guides the design of kid-friendly iPad web apps with light pastel colors, bold graphics, large touch targets, and minimal menus.
- settings_gear: One consistent ⚙️ button and drawer for kids' iPad and web apps: lower-right gear, segmented options, opt-in errors at the bottom, database check, hidden in print. Used by start_project.
- smoke_test: Headless Chromium check of a web app at three screen sizes: zero errors, no horizontal scroll, touch and controls, settings and reload, print. Screenshots go to the scratchpad.
- privacy_check: Scans before every commit for personal emails, secret keys, private folders, photos and phone numbers (script in `scripts/privacy_scan.sh`), then the manual checks for private details in notes.
- bake_cache: Precompute slow results with a Node baker into a `<script>` cache with a fingerprint, so a page opens from file:// and never shows a stale result.
- ai_json_loop: Let Jimmy use any AI chat to draft structured content: the page builds the prompt, validates the pasted JSON reply, and applies it with undo. No server, no key in the browser.
- supabase_link: Set up a project's Supabase database by hand: short paste-ready SQL files, checked by `scripts/sql_paste_check.py`, a paste order for Jimmy, verification from his paste, and the publishable key only. The manual route is the default.
- project_sync: Bring every project to the same standard (pointer, schematic, convo, 04 AI notes, track, version log, ⚙️ panel, privacy and database rules) and check split-readiness. Uses `scripts/project_inventory.sh`.
- project_track: Classify a project as family play (simple, graphic, settings in ⚙️) or studio design (dense, formal), set its defaults, and make every panel collapsible.
- feedback_notes: The in-page "Notes for improvement" box in ⚙️: notes tied to the item on screen, saved device first, read back, copyable. Pulled into work by read_notes_and_update.
- summarize_code: Generates a visual summary file that maps out the main code structure and explains key variables.
- update_lessons_learned: Reviews and logs lessons learned across projects, personal preferences, and tools.
- simplify_code: Breaks large files into separate css/js/html and simplifies logic, then runs summarize_code.
- ai_consolidate: Pauses to consolidate knowledge, log recent changes, archive outdated notes, and condense information.
- claude_review_project: Brings an existing project up to current conventions (project CLAUDE.md, convo/ folder, brief, lessons) and extracts reusable patterns.
- supabase_project: Sets up or changes a Supabase project: inspects the live schema, prefixes and registers tables, enables RLS, and tests in a rolled-back transaction. Conventions in `04 AI/Supabase/`.
- fix_puzzles: Reviews puzzles flagged for rework (and ones the generator left unfinished): another seed, another setting, a root fix, or a replacement; re-checks them and closes the flags in the database. Run now and then.
- make_3d: Builds a 3-D test model from a concept, a photo or other assets, in five increments, and sets up a review in the Increment Viewer. Asks for research mode (outside sources, recorded) or assets-only mode (only what is provided). Photos of real places or people stay in `private/`.

Claude Code:
- These files are the source of truth. Each one has a thin wrapper in `.claude/skills/<name-with-hyphens>/SKILL.md`, so it can be run as `/start-project`, `/ai-consolidate`, etc.
- When adding a skill here, also add its wrapper (or ask Claude to).
- simulate_decay: Builds a physics-based model of an object that changes over increments (folds, tears, damp, mould, dirt, burns), from research and a story, with a 3-D page and Increment Viewer review. Asks questions first.
