# Claude Review Project

Purpose
Bring an existing project in `03 Projects/` up to the current repo conventions so Claude Code picks up its context automatically, and pull out anything reusable. Run it on one project at a time, when that project becomes active again.

Input
- Project name (the folder name in `03 Projects/`). If none is given, ask. Don't guess.

Actions
1. Read the project: `schematic.md` / `plan.md`, the files in `convo/`, and the main code files. Read `04 AI/<Project>/brief.md` and `lessons.md` if they exist.
2. Create `03 Projects/<Project>/CLAUDE.md` if it's missing. Keep it short (about 5–15 lines):
   - one-line purpose
   - pointers to `schematic.md`, `convo/`, and `04 AI/<Project>/brief.md` + `lessons.md`
   - how to run or test it (open `index.html`, run `python app.py`, run tests, etc.)
   - project-specific rules (private data, Supabase tables, files not to touch)
3. Move loose `convo*.md` files into `03 Projects/<Project>/convo/` with `git mv`. If it's unclear which project a convo belongs to, leave it and tell Jimmy.
4. Create or refresh `04 AI/<Project>/brief.md`: current state, architecture, verified vs. unverified, next steps.
5. Make sure `04 AI/<Project>/lessons.md` exists, and add anything learned during the review.
6. Extract reusable patterns (UI patterns, data patterns, setup steps, schemas) into `04 AI/patterns.md`. Where a pattern could become a template or skill, list it as a candidate under "Template candidates" in `04 AI/patterns.md`. Don't write into `02 Refs` without asking.
7. Update the indexes: `03 Projects/03 projects_schematic.md` and `04 AI/04 ai_schematic.md`.
8. Report a short summary: what was added or moved, and anything that needs Jimmy's decision.

Rules
- Add and move only. Don't delete project files or `V#` folders without asking.
- Never touch real private data (Family Accounting data folders, `.env`, databases).
