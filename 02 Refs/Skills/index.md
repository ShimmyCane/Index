## Purpose

Source of truth for nursery skills. Each is wrapped in `.claude/skills/<name>/SKILL.md` and runs as `/name`.

**Working copies** (edited in `04 AI/Skills/`) — stubs stay here:
- `smoke_test`, `summarize_code`, `game_controls`, `settings_gear`, `access_requests`, `monthly_checkup`, `supabase_setup`

---

## Active Skills (23 total)

### Project Initialization & Setup (3)
- **start_project** — Set up a new nursery project: folders, schematic, MVP, project CLAUDE.md, convo/ history
- **ipad_website** — Design guidance for kid-friendly iPad/web apps: pastel colors, bold graphics, large touch targets, minimal menus, everything secondary in ⚙️
- **project_track** — Classify as family play (simple, graphic) or studio design (dense, formal); set defaults and make panels collapsible

### Code Quality & Testing (4)
- **smoke_test** — Headless Chromium check at three screen sizes: zero errors, no horizontal scroll, touch/controls/settings/reload work, print layout correct
- **privacy_check** — Scan staged files for personal emails, secret keys, private folders, photos, phone numbers before commit
- **summarize_code** — Generate visual summary file: system architecture, table of contents with line numbers, reference table of key variables
- **simplify_code** — Break large files into separate css/js/html and simplify logic; runs `summarize_code` after
### Database & Infrastructure (2)
- **supabase_setup** — Set up or update project database: inspect live schema, design tables & policies, apply migration directly (no manual paste). Merged from supabase_link + supabase_project
- **bake_cache** — Precompute slow results into a `<script>` cache with fingerprint, so page opens from file:// and never shows stale result

### UI Components & Patterns (3)
- **settings_gear** — One consistent ⚙️ button/drawer for iPad apps: lower-right gear, segmented options, opt-in errors at bottom, database check. Used by start_project
- **game_controls** — One control scheme for iPad games: center-relative drag (or lower-left joystick), lower-right action buttons, ⚙️ in upper right faded
- **feedback_notes** — In-page "Notes for improvement" box in ⚙️: tied to item on screen, saved to device first, read back, copyable

### Knowledge & Consolidation (4)
- **update_lessons_learned** — Review and log lessons learned across projects, personal preferences, and tools in dated files
- **ai_consolidate** — Consolidate knowledge: log changes, archive outdated facts, condense information across projects
- **claude_review_project** — Bring existing project to current conventions: CLAUDE.md, convo/ folder, brief, lessons; extract reusable patterns
- **remix** — Build nursery version of linked site/repo; combine with another repo; check license; record what was read and reused (seed: "A x B")

### Project Transitions (2)
- **graduate_project** — Move nursery project to standalone public repo with GitHub Pages: ready check, folder prep, copy/repo/Pages steps, registry pointers, home page link, remove from nursery
- **claude_review_project** — Bring existing project to current conventions and extract reusable patterns

### Data & Input (3)
- **ai_json_loop** — Let user draft structured content in any AI chat: page builds prompt, validates pasted JSON, applies with undo. No server, no browser key
- **read_notes_and_update** — Read feedback notes from project's Supabase table; turn into to-do items & convo rounds; mark handled notes as done after user confirms
- **privacy_check** — Scan staged files for emails, secret keys, private folders, photos, phone numbers before commit

### Story/Game-Specific (3 — Adventure project)
- **consider_actions** — Read family notes/scenes/settings; judge past decisions; anticipate next moves; list questions. Read-only analysis
- **update_story** — Run consider_actions first; plan story line & deviations; rewrite chapter titles; write next chapter; hand to family when ready
- **gather_story_lessons_learned** — After each run, log family pacing, plot adherence, role profiles, storyteller guesses; speed up planning

### Specialist/Domain (2)
- **pm_check** — Project Management Check: read Shimmy Specs notes; update PPD, schedule, cost, risk log, items, assumptions; store in `private/pm/`
- **access_requests** — Let new person ask for access with email (no sign-up needed); owner invites; roles decide permissions

### Workflow (1)
- **monthly_checkup** — Monthly review: check project status, track open items, consolidate learnings (runs first of each month or on demand)

---

## Working Copies vs. Stubs

These files have both a **stub in 02 Refs/** and a **working copy in 04 AI/Skills/**. Edit the 04 AI copy; the 02 Refs stub points to it.

| Skill | 02 Refs (stub) | 04 AI (working copy) |
|-------|---|---|
| smoke_test | ✓ | ✓ moved 2026-11-22 |
| summarize_code | ✓ | ✓ moved 2026-11-22 |
| supabase_setup | ✓ | ✓ merged 2026-11-25 |
| game_controls | ✓ | ✓ moved 2026-11-22 |
| settings_gear | ✓ | ✓ moved 2026-11-22 |
| access_requests | ✓ | ✓ working copy |
| monthly_checkup | ✓ | ✓ working copy |

---

## Related Locations

- **Skills architecture:** Thin wrappers in `.claude/skills/<name>/SKILL.md` → reads stub in `02 Refs/` → points to working copy in `04 AI/`
- **Wrapper additions:** When adding a skill, also create `.claude/skills/<name>/SKILL.md`
- **Reusable content:** Lessons in `04 AI/lessons_pool.md`; patterns in `04 AI/patterns.md`; preferences in `04 AI/Personal Preferences/jimmy_preferences.md`
