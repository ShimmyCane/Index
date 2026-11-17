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
- Adventure/ — family story game (Athena's story); world of Ondra, ten-book plan, voiced chapter 1, voices page, recording step (2026-11-10); recording only, no browser voice, story skills (2026-11-10). `brief.md`, `lessons.md`, `story_lessons.md`.
- Living Room Scene/ — scene built from a photo over ten versions (V1–V10), render-and-compare loop. `brief.md` (version log), `lessons.md`.
- Shimmy Specs/ — spec-writing process app; MVP planned (`mvp schematic.md`, `mvp tasks.md`). `brief.md`, `lessons.md`.
- Critique Detail/ — MVP 0.2.0 (2026-11-14): results page and script around a written detail review; CSI rulebook library, adaptive QC list, hard gate, lean proof toggles; no AI call in the code. `brief.md`, `lessons.md`. Questions in `03 Projects/Critique Detail/convo/convo v0.2.md`.
- Better Parenting/ — MVP 0.1.0 (2026-11-16): parenting scenarios and practice for K to grade 5; 144 scenarios, 18 skills, own-scenario AI loop, family tables written. `brief.md`, `lessons.md`. Questions in `03 Projects/Better Parenting/convo/convo v0.1.md`.
- Rhythm Sticks/ — MVP 0.3.1 (2026-11-13): wordless rhythm and sound toy, eleven modes plus a hidden breathing garden, random on load. `brief.md`, `lessons.md`. Questions in `03 Projects/Rhythm Sticks/convo/convo v0.8.md`.
- Generate Clouds/ — MVP 0.4.0 (2026-11-16; ground, sea, map, weather maker, orbit, zoom and sharp redraw, space height, cities by weather): 3-D volumetric sky from weather data for any place and time, time lapse, 360° view, PNG exports. `brief.md`, `lessons.md`. Questions in `03 Projects/Generate Clouds/convo/convo v0.1.md`.
- Felix Gear Wars/ — MVP 0.6.0 (2026-11-16): gear-powered lane defense game for Felix, eight art styles with culture fighters, narrated story cards; rules in a DOM-free sim run by a Node balance bot; five art styles through one colour filter. `brief.md`, `lessons.md`. Questions in `03 Projects/Felix Gear Wars/convo/convo v0.1.md` and `convo v0.2.md`.
- Our Family Compass/ — MVP 0.2.0 (2026-11-17): the framework for a family compass, drawn as a mind palace of nine rooms (rooms, places and connections are data), twelve sample pieces, dated append-only thoughts, voice notes, family sign-in, research notes; structure only in the repo. `brief.md`, `lessons.md`. Questions in `03 Projects/Our Family Compass/convo/convo v0.1.md`.

Notes:
- Graduated to their own repos (removed from the nursery 2026-11-10; history stays in git): Athena's world → `ShimmyCane/Athena-s-world`, Bar Glide → `ShimmyCane/Bar-Glide`, Chinese Character Sudoku → `ShimmyCane/Chinese-Character-Sudoku`, Voice → `ShimmyCane/Voice`, What to Cook → `ShimmyCane/What-to-Cook`. Earlier: Expansion Wars → `ShimmyCane/Expansion-Wars`, Felix Maze → `ShimmyCane/Felix-Maze`, Fishes → `ShimmyCane/Fishes`, Make 3D → `ShimmyCane/Make-3D`, Growth (with Paper Again) → `ShimmyCane/Growth`, Increment Viewer → `ShimmyCane/Increment-Viewer`. Steps for the next one: `/graduate-project`.
- Lessons in this folder come from the private ShimmyAI repo's `04 AI/`. Only generic lessons were carried over. Family and personal details were not.
- Claude controls this folder unless Jimmy adds a file or asks for a specific structure.
- When adding a project folder, use `brief.md` + `lessons.md` and add it to the list above.
