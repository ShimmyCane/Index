# Felix Maze — Claude Code pointer

Purpose: printable mazes for Felix in many styles (art, nature, systems, music, famous mazes), a library, an answer page, and a page where he doodles lines and picks a maze grown from them.

- Design: `schematic.md` · Numbering: `catalog.md` · Cast: `characters.md` · Joy rubric: `rubric.md` · Quality check: `qc.md` · Goals and batches: `todo.md`
- Planning: `inspirations.md` (100 maze types), `maze_research.md`, `variations.md`, `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Felix Maze/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy) and `02 Refs/Skills/ipad_website.md`

How to run: open `index.html` (works from the file or GitHub Pages; no server needed). Sheets: `sheet.html?code=810-001`.
New maze: `node tools/pick_seeds.js <counter>` (rejects seeds where the answer touches a wall, ranks by level fit and joy).
Flagged or failed puzzles: `/fix-puzzles` (reads `fmz_flags` in the Family project and `data/rework.js`).
Check the bank: `node tools/verify_raster.js` (pixel check of the picture: answer vs. wall ink, shortcuts) and `node tools/check_sheets.js` (every maze has a way through and matches `tools/fingerprints.json`; `--update` only when a change to a published maze is intended).

Project rules:
- Sheets print black and white on Letter landscape. Every sheet has "Felix Maze #code" at the top and the "inspired by" footer. No answer key on print.
- A maze is a recipe in `data/catalog.js`. Engine changes can change published mazes; `tools/check_sheets.js` must pass before committing.
- Make it a joy, not an exercise: white space around every maze, a story from start to goal, something to find on the way (`rubric.md`).
- New characters go in `js/art.js` and `characters.md`. Run `qc.md` before publishing a maze.
- Felix's first name only. No age, school or photos; scans of his drawings go in `private/`.
- Art is "inspired by", never traced.
- Research: update `research/index.html` (a new "What I was thinking" panel per round) alongside `maze_research.md`. Copies of others' papers or pages go in `research/private/` only.
- A puzzle that fails the answer-line checks is never published: it goes to `data/rework.js`. Flagged puzzles are never picked (puzzle of the day, top five, packs, print all).
- Retire, don't delete: a replaced puzzle gets `retired: true`; its counter is never reused. Counters 001–7FF are the bank; 800–FFF are doodle mazes made on a device.
- Supabase: Family project, app `felix-maze`. `fmz_flags` is live (`supabase/002_flags.sql`); `001_felix_maze.sql` (mazes, doodles, characters) is not applied.
