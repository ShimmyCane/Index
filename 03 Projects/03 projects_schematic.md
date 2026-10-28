Purpose:
The nursery for small programs. Each one is a seed that starts here. When it matures, Jimmy copies it into its own repo by hand and builds it up there. Projects are independent of each other.

Per-project layout:
- schematic.md — design and requirements
- convo/ — clarifying Q&A, one file per round (`convo vX.Y.md`), never compacted
- CLAUDE.md — short pointer file for Claude Code (added by `/start-project` or `/claude-review-project`)
- the app or code itself
- AI notes live in `04 AI/<Project>/`

Status key (set one per project):
idea → MVP → device-tested → in use → graduated (copied to its own repo) → retired

Schematic:
- Athena's world/ — status: idea. Started with `/start-project`. Awaiting answers in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Chinese Character Sudoku/ — status: MVP (not yet device-tested). A kids' iPad word-grid game: drag characters from a bank so rows and columns make words, using recent lesson words. Game `index.html` + `js/` + `css/`, word data in `assets/` (the 字库 is the 266 characters from three photos; `phrases.json` is where words are added), helpers in `tools/`. Open checks in `convo/convo v0.2.md` (Chinese). (`schematic.md`, `CLAUDE.md`, `convo/`)
- Adventure/ — status: MVP (not yet device-tested). A family story game played like correspondence chess, with a nightly AI storyteller. Player page `index.html`, world tools `world.html`, under-the-hood `hood.html`, storyteller `storyteller.md`, SQL in `supabase/`, `todo.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)

Notes:
- The root `index.html` lists nursery projects in its Nursery section. Add a tile when a project gets a page.
- This repo is public. Keep private data out of every project. See `CLAUDE.md`.
- When new projects are added, add an entry here describing their intent and location.
