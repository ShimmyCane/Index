# Felix Maze — Claude Code pointer

Purpose: printable mazes for Felix in many styles (art, nature, systems, music, famous mazes), a library, an answer page, and a page where he doodles lines and picks a maze grown from them.

- Design: `schematic.md` · Numbering: `catalog.md` · Cast: `characters.md` · Quality check: `qc.md`
- Planning: `inspirations.md` (100 maze types), `maze_research.md`, `variations.md`, `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Felix Maze/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy) and `02 Refs/Skills/ipad_website.md`

How to run: open `index.html` (works from the file or GitHub Pages; no server needed). Sheets: `sheet.html?code=810-001`.
Check the bank: `node tools/check_sheets.js` (every maze has a way through and matches `tools/fingerprints.json`; `--update` only when a change to a published maze is intended).

Project rules:
- Sheets print black and white on Letter landscape. Every sheet has "Felix Maze #code" at the top and the "inspired by" footer. No answer key on print.
- A maze is a recipe in `data/catalog.js`. Engine changes can change published mazes; `tools/check_sheets.js` must pass before committing.
- New characters go in `js/art.js` and `characters.md`. Run `qc.md` before publishing a maze.
- Felix's first name only. No age, school or photos; scans of his drawings go in `private/`.
- Art is "inspired by", never traced.
- Research: update `research/index.html` (a new "What I was thinking" panel per round) alongside `maze_research.md`. Copies of others' papers or pages go in `research/private/` only.
- Supabase: Family project, tables `fmz_*`, app `felix-maze`, SQL in `supabase/` (not applied yet).
