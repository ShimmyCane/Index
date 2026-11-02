Purpose:
Claude's working folder for the Index nursery. It holds the consolidated lessons, cross-project patterns, preferences, tool notes, and per-project briefs and lessons. The folder layout mirrors `03 Projects`.

Layout:
- 04 ai_schematic.md — this file.
- lessons_pool.md — consolidated lessons learned across seed projects, grouped by topic. Read first.
- patterns.md — reusable patterns and template candidates.
- Personal Preferences/jimmy_preferences.md — design and workflow preferences. Auto-loaded through the root `CLAUDE.md`.
- Supabase/ — conventions for Supabase projects: `brief.md` (rules and state), `lessons.md` (generic lessons), `supabase_registry_template.sql` (app-table registry). Skill: `/supabase-project`.
- Tools/artifacts.md — limits of the claude.ai Artifact host.
- Tools/windows_local.md — tool quirks on a local Windows PC.
- Tools/playwright_headless.md — headless Chromium checks: WebGL flags, two-finger touch, hidden controls.
- <Project>/brief.md — current state: goal, architecture, verified vs. unverified, next steps.
- <Project>/lessons.md — project-specific lessons, appended over time.

Projects with notes:
- Athena's world/ — new seed, awaiting answers in `03 Projects/Athena's world/convo/`.
- Chinese Character Sudoku/ — word-grid game MVP. `brief.md`, `lessons.md`.
- Adventure/ — family story game. `brief.md`, `lessons.md`.
- Felix Maze/ — printable maze worksheets MVP. `brief.md`, `lessons.md`.
- Make 3D/ — JSON-as-model 3D sandbox. MVP built (v0.1–v0.6, engine, viewer, planter sample). Convo v0.3 open. `brief.md`, `lessons.md`. Adventure Coaster Park (V01–V10, 250 to 1,000 pph) and `research/adventure_park.md` added 2026-11-02. Hawk (closed skeleton meshes, V01–V06) and `research/hawk.md` added 2026-11-02.
- Increment Viewer/ — subject-neutral slideshow and running log for reviewing increments. `brief.md`.
- Living Room Scene/ — scene built from a photo over ten versions (V1–V10), render-and-compare loop. `brief.md` (version log), `lessons.md`.
- Shimmy Specs/ — spec-writing process app; MVP planned (`mvp schematic.md`, `mvp tasks.md`). `brief.md`, `lessons.md`.

Notes:
- Lessons in this folder come from the private ShimmyAI repo's `04 AI/`. Only generic lessons were carried over. Family and personal details were not.
- Claude controls this folder unless Jimmy adds a file or asks for a specific structure.
- When adding a project folder, use `brief.md` + `lessons.md` and add it to the list above.
