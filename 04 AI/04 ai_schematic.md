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
- <Project>/brief.md — current state: goal, architecture, verified vs. unverified, next steps.
- <Project>/lessons.md — project-specific lessons, appended over time.

Projects with notes:
- Athena's world/ — new seed, awaiting answers in `03 Projects/Athena's world/convo/`.
- Chinese Character Sudoku/ — word-grid game MVP. `brief.md`, `lessons.md`.
- Adventure/ — family story game. `brief.md`, `lessons.md`.
- Felix Maze/ — printable maze worksheets MVP. `brief.md`, `lessons.md`.
- Shimmy Specs/ — new seed: spec-writing process app; awaiting answers in convo v0.1. `brief.md`, `lessons.md`.

Notes:
- Lessons in this folder come from the private ShimmyAI repo's `04 AI/`. Only generic lessons were carried over. Family and personal details were not.
- Claude controls this folder unless Jimmy adds a file or asks for a specific structure.
- When adding a project folder, use `brief.md` + `lessons.md` and add it to the list above.
