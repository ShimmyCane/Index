## Purpose

Source of truth for nursery skills. Each is wrapped in `.claude/skills/<name>/SKILL.md` and runs as `/name`.

Updated 2026-11-25.

**Working copies** (edited in `04 AI/Skills/`; a stub stays here):
`access_requests`, `game_controls`, `monthly_checkup`, `remix`, `settings_gear`, `smoke_test`, `summarize_code`, `supabase_setup`

Every other active file here is the real thing. Claude edits it only when Jimmy asks.

---

## Active skills (21)

### Start and design (6)
- **start_project**: mechanical setup of a new seed (folders, `CLAUDE.md`, schematic scaffold, empty convo). Planning follows `02 Refs/Workflow/new project workflow.md`.
- **ipad_website**: design guidance for family play sites on iPad (Track A).
- **pc_website**: design guidance for formal studio and work sites on PC and iPhone (Track B).
- **settings_gear** *(working copy)*: one ⚙️ button and drawer, opt-in errors at the bottom, database check.
- **game_controls** *(working copy)*: centre-relative drag or lower-left joystick, action buttons lower right.
- **research_topic**: research at a chosen depth (eli5, 101 to 501), saved in the project's research folder.

### Code and quality (5)
- **summarize_code** *(working copy)*: `<file>_summary.html` with architecture, table of contents and tweakable variables.
- **simplify_code**: split large files into css/js/html and simplify; then runs summarize_code.
- **smoke_test** *(working copy)*: headless check at three screen sizes.
- **privacy_check**: scan for private data and secrets before every commit and publish.
- **bake_cache**: precompute slow results into a script-tag cache with a fingerprint.

### Data, feedback and AI (4)
- **supabase_setup** *(working copy)*: inspect the live schema, design tables and policies, apply the migration.
- **access_requests** *(working copy)*: ask-for-access flow without open sign-up; roles.
- **feedback_loop**: capture notes in the page, turn them into work, consolidate. Commands: `/feedback-loop`, `/feedback-notes` (capture), `/review-notes-and-update` (process).
- **ai_json_loop**: draft structured content in any AI chat; the page builds the prompt, checks the pasted JSON and applies it with undo.

### Knowledge and project life (5)
- **ai_consolidate**: take stock, update briefs and lessons, mark superseded facts, compact loose files.
- **claude_review_project**: bring an existing project to current conventions.
- **remix** *(working copy)*: nursery version of a linked site or repo, combined with another ("A x B").
- **graduate_project**: move a project to its own repo, with checklist.
- **monthly_checkup** *(working copy)*: monthly review of status, security, privacy and skills.

### Lives with its project (1)
- **pm_check**: `03 Projects/Shimmy Specs/.claude/skills/pm_check.md`; run from the root as `/pm-check`.

---

## Not skills

- Workflow guides, in `02 Refs/Workflow/`: `new project workflow.md`, `project_track.md` (decision guide and panel code), `family_project_track.md`, `architecture_project_track.md`.
- Tools, in `scripts/`: `privacy_scan.sh` (privacy_check), `sql_paste_check.py` (for SQL pasted by hand), and `anim_capture.js`, `frames_to_gif.py`, `sticker_cut.py` (used only by retired skills; kept).
- Retired skills: `deprecated/index.md`.

## Adding or retiring a skill

- Add: the `.md` here, a wrapper at `.claude/skills/<name>/SKILL.md`, a line above, and the list in the root `CLAUDE.md`.
- Retire: move the `.md` to `deprecated/`, add a row to `deprecated/index.md`, make the wrapper a `[DEPRECATED]` stub (with `disable-model-invocation: true`) or remove it, and fix references.
