Purpose:
Claude's working folder for the Index nursery. It holds the consolidated lessons, cross-project patterns, preferences, tool notes, and per-project briefs and lessons. The folder layout mirrors `03 Projects`.

Layout:
- 04 ai_schematic.md — this file.
- Skills/ — working copies of the most-used skills, with `index.md`. Their `02 Refs` files are stubs. New 2026-11-23: `access_requests.md`, `monthly_checkup.md`.
- Supabase/access/ — request-only access and roles: plain README, Architecture request table and test, Family roles and test (Family test not yet passed).
- lessons_pool.md — consolidated lessons learned across seed projects, grouped by topic. Read first.
- ai_task_tracker.md — shared list of open work across projects, and open PRs waiting on a decision.
- project_review_2026-11-03.md — review of all six projects: promotion readiness, privacy flags, open items for Jimmy.
- nursery_review_2026-11-22.md — metadata for the seven Nursery-section AI projects, general lessons, and a comparison with ten linked skill repos.
- patterns.md — reusable patterns and template candidates.
- Personal Preferences/jimmy_preferences.md — design and workflow preferences. Auto-loaded through the root `CLAUDE.md`.
- Supabase/ — conventions for Supabase projects: `brief.md` (rules and state), `lessons.md` (generic lessons), `lessons_learned_log.md` (dated log, incl. the 2026-11-06 browser key refusal and its reproduction), `supabase_registry_template.sql` (app-table registry). Skill: `/supabase-project`.
- Tools/artifacts.md — limits of the claude.ai Artifact host.
- Tools/windows_local.md — tool quirks on a local Windows PC.
- Tools/playwright_headless.md — headless Chromium checks: WebGL flags, two-finger touch, hidden controls.
- Make-3D x Construct/scene_craft_lessons.md and model_iteration_lessons.md — lessons for building 3-D scenes (planes, depth cues, lighting, sources) and for iterating on a model (scale, parts, checks after each change). Also in the Make-3D repo under 04 AI/.
- graduations.md — one checklist per project that left the nursery (`/graduate-project`), with what is still manual.
- <Project>/brief.md — current state: goal, architecture, verified vs. unverified, next steps.
- <Project>/lessons.md — project-specific lessons, appended over time.

Projects with notes:
- 中文笔画/ — MVP 0.1.0: stroke-writing game for the worksheet characters, date tabs from `data/batches.json`, answer shown after misses. `brief.md`, `lessons.md`. Questions in `03 Projects/中文笔画/convo/convo v0.2.md`.
- Adventure/ — family story game (Athena's story); world of Ondra, ten-book plan, voiced chapter 1, voices page, recording step (2026-11-10); recording only, no browser voice, story skills (2026-11-10). `brief.md`, `lessons.md`, `story_lessons.md`.
- Living Room Scene/ — project removed 2026-11-22; only `lessons.md` kept (the first AR and vision prompt). Code and renders in git history.
- Shimmy Specs/ — spec-writing process app; MVP built, accounts and cloud saving built (`mvp schematic.md`, `mvp tasks.md`, `convo/convo v0.3.md`). Architecture project tables are indexed in `table_index`. `brief.md`, `lessons.md`.
- QC keynotes/ — v0.2.0: four steps built, notes for improvement, Architecture database table `qk_notes` pending paste. `brief.md`, `lessons.md`. `brief.md`, `lessons.md`. Questions in `03 Projects/QC keynotes/convo/convo v0.1.md`.
- Critique Detail/ — MVP 0.2.0 (2026-11-14): results page and script around a written detail review; CSI rulebook library, adaptive QC list, hard gate, lean proof toggles; no AI call in the code. `brief.md`, `lessons.md`. Questions in `03 Projects/Critique Detail/convo/convo v0.2.md`.
- Better Parenting/ — MVP 0.1.0 (2026-11-16): parenting scenarios and practice for K to grade 5; 144 scenarios, 18 skills, own-scenario AI loop, family tables written. `brief.md`, `lessons.md`. Questions in `03 Projects/Better Parenting/convo/convo v0.1.md`.
- Felix Continents/ — round 2 (2026-11-24): V1 globe with time travel (oldest left), V2 drag the continents, V5 random worlds; family login and `fc_notes` SQL ready, not pasted. `brief.md`, `lessons.md`. Questions in `03 Projects/Felix Continents/convo/convo v0.1.md`.
- Felix Stickers/ — MVP 0.1.0 (2026-11-23): tactile sticker playground, one sheet, peel/move/rotate/press, undo, save on device, notes. `brief.md`, `lessons.md`. Questions in `03 Projects/Felix Stickers/convo/convo v0.1.md`.
- Rhythm Sticks/ — MVP 0.3.1 (2026-11-13): wordless rhythm and sound toy, eleven modes plus a hidden breathing garden, random on load. `brief.md`, `lessons.md`. Questions in `03 Projects/Rhythm Sticks/convo/convo v0.8.md`.
- Generate Clouds/ — MVP 0.6.1 (2026-11-18; Done and Reopen on notes; real Earth picture, fine ground, marine data, notes v1; notes linked to the studio database, SQL not yet applied; ground, sea, map, weather maker, orbit, zoom and sharp redraw, space height, cities by weather): 3-D volumetric sky from weather data for any place and time, time lapse, 360° view, PNG exports. `brief.md`, `lessons.md`. Questions in `03 Projects/Generate Clouds/convo/convo v0.1.md`.
- Felix Gear Wars/ — MVP 0.6.0 (2026-11-16): gear-powered lane defense game for Felix, eight art styles with culture fighters, narrated story cards; rules in a DOM-free sim run by a Node balance bot; five art styles through one colour filter. `brief.md`, `lessons.md`. Questions in `03 Projects/Felix Gear Wars/convo/convo v0.1.md` and `convo v0.2.md`.
- Our Family Compass/ — MVP 0.2.0 (2026-11-17): the framework for a family compass, drawn as a mind palace of nine rooms (rooms, places and connections are data), twelve sample pieces, dated append-only thoughts, voice notes, family sign-in, research notes; structure only in the repo. `brief.md`, `lessons.md`. Questions in `03 Projects/Our Family Compass/convo/convo v0.1.md`.
- Mind Palace/ — 0.3.1 (2026-11-18, latest per schematic; first MVP 0.1.0 on 2026-11-17): a memory palace in 3-D; database, scene description and renderer kept apart; search and walk, two kinds of practice, build and move, undo. Round 3 (0.2.0): Gaussian splat page in plain WebGL 2, palaces per person; Godot project written, not run. `brief.md`, `lessons.md`. Questions in `03 Projects/Mind Palace/convo/convo v0.3.md`.
- Make-3D x Construct/ — V2 (2026-11-18, round 7: home, studio, library, cloud, lofted meshes; MVP 0.3 before it): new version of Make 3D with Construct's processes (checks with fix hints, certainty percent, flags, defect ledger and rounds); plains camp diorama sample; 33 Node tests and headless browser check; SQL not applied. `brief.md`, `lessons.md`. Questions in `03 Projects/Make-3D x Construct/convo/convo v0.2.md`.
- Drafting/ — status: MVP 0.2 (2026-11-18): DXF blocks, .LIN and .PAT text, dimensions, linter, page with line-type and hatch viewers; 19 tests pass. Formats for AutoCAD and Revit (DXF blocks, `.LIN`, `.PAT`, 3-D DXF mesh), library read path, linter and viewer plan. `brief.md`, `lessons.md`. Questions in `03 Projects/Drafting/convo/convo v0.1.md`.
- Athena's Piano Companion/ — 0.2.0 (2026-11-21): hands-free piano recording companion with home, library, browse and recycle bin, player and four-layer composer. `brief.md`, `lessons.md`. Questions in `03 Projects/Athena's Piano Companion/convo/` (`v0.1` to `v0.4`).
- Paper Airplanes x A-10 Warthog/ — MVP 0.1.0 (2026-11-18): remix of remix.ui8.ai/fly (not reachable from the build container; not read), a 1990s floppy A-10 game (to confirm), and Paper Airplanes; TypeScript source compiled to `js/game.js`; flight-model tests in `tools/flight_test.js`; Playwright checks at three sizes. `brief.md`, `lessons.md`. Questions in `03 Projects/Paper Airplanes x A-10 Warthog/convo/convo v0.1.md`.

- Massage Map/ — planned (2026-11-25): brief and lessons started; questions in `03 Projects/Massage Map/convo/convo v0.1.md`. `brief.md`, `lessons.md`.
- Salmon Leap/ — V1 to V5 (2026-11-18): a bronze statue of a leaping Atlantic salmon, built in five versions with a test; references and lessons in `Salmon Leap/lessons.md` and `brief.md`. Questions in `03 Projects/Salmon Leap/convo/convo v0.1.md`.

Notes:
- Graduated to their own repos (removed from the nursery 2026-11-10; history stays in git): Athena's world → `ShimmyCane/Athena-s-world`, Bar Glide → `ShimmyCane/Bar-Glide`, Chinese Character Sudoku → `ShimmyCane/Chinese-Character-Sudoku`, Voice → `ShimmyCane/Voice`, What to Cook → `ShimmyCane/What-to-Cook`. Earlier: Expansion Wars → `ShimmyCane/Expansion-Wars`, Felix Maze → `ShimmyCane/Felix-Maze`, Fishes → `ShimmyCane/Fishes`, Make 3D → `ShimmyCane/Make-3D`, Growth (with Paper Again) → `ShimmyCane/Growth`, Increment Viewer → `ShimmyCane/Increment-Viewer`. Steps for the next one: `/graduate-project`.
- Lessons in this folder come from the private ShimmyAI repo's `04 AI/`. Only generic lessons were carried over. Family and personal details were not.
- Claude controls this folder unless Jimmy adds a file or asks for a specific structure.
- When adding a project folder, use `brief.md` + `lessons.md` and add it to the list above.
