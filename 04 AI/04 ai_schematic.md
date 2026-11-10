Purpose:
Claude's working folder for the Index nursery. It holds the consolidated lessons, cross-project patterns, preferences, tool notes, and per-project briefs and lessons. The folder layout mirrors `03 Projects`.

Layout:
- 04 ai_schematic.md — this file.
- lessons_pool.md — consolidated lessons learned across seed projects, grouped by topic. Read first.
- ai_task_tracker.md — shared list of open work across projects, and open PRs waiting on a decision.
- project_review_2026-11-03.md — review of all six projects: promotion readiness, privacy flags, open items for Jimmy.
- patterns.md — reusable patterns and template candidates.
- Personal Preferences/jimmy_preferences.md — design and workflow preferences. Auto-loaded through the root `CLAUDE.md`.
- Supabase/ — conventions for Supabase projects: `brief.md` (rules and state), `lessons.md` (generic lessons), `lessons_learned_log.md` (dated log, incl. the 2026-11-06 browser key refusal and its reproduction), `supabase_registry_template.sql` (app-table registry). Skill: `/supabase-project`.
- Tools/artifacts.md — limits of the claude.ai Artifact host.
- Tools/windows_local.md — tool quirks on a local Windows PC.
- Tools/playwright_headless.md — headless Chromium checks: WebGL flags, two-finger touch, hidden controls.
- graduations.md — one checklist per project that left the nursery (`/graduate-project`), with what is still manual.
- <Project>/brief.md — current state: goal, architecture, verified vs. unverified, next steps.
- <Project>/lessons.md — project-specific lessons, appended over time.

Projects with notes:
- 中文笔画/ — MVP 0.1.0: stroke-writing game for the worksheet characters, date tabs from `data/batches.json`, answer shown after misses. `brief.md`, `lessons.md`. Questions in `03 Projects/中文笔画/convo/convo v0.2.md`.
- Adventure/ — family story game (Athena's story); world of Ondra, ten-book plan, voiced chapter 1, voices page, recording step (2026-11-10). `brief.md`, `lessons.md`.
- Living Room Scene/ — scene built from a photo over ten versions (V1–V10), render-and-compare loop. `brief.md` (version log), `lessons.md`.
- Shimmy Specs/ — spec-writing process app; MVP planned (`mvp schematic.md`, `mvp tasks.md`). `brief.md`, `lessons.md`.

Notes:
- Graduated to their own repos (removed from the nursery 2026-11-10; history stays in git): Athena's world → `ShimmyCane/Athena-s-world`, Bar Glide → `ShimmyCane/Bar-Glide`, Chinese Character Sudoku → `ShimmyCane/Chinese-Character-Sudoku`, Voice → `ShimmyCane/Voice`, What to Cook → `ShimmyCane/What-to-Cook`. Earlier: Expansion Wars → `ShimmyCane/Expansion-Wars`, Felix Maze → `ShimmyCane/Felix-Maze`, Fishes → `ShimmyCane/Fishes`, Make 3D → `ShimmyCane/Make-3D`, Growth (with Paper Again) → `ShimmyCane/Growth`, Increment Viewer → `ShimmyCane/Increment-Viewer`. Steps for the next one: `/graduate-project`.
- Lessons in this folder come from the private ShimmyAI repo's `04 AI/`. Only generic lessons were carried over. Family and personal details were not.
- Claude controls this folder unless Jimmy adds a file or asks for a specific structure.
- When adding a project folder, use `brief.md` + `lessons.md` and add it to the list above.
