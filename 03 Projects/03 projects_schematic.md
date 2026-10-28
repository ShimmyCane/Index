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
- Athena's world/ — status: MVP (not yet device-tested). A decorating game: a white room, choose a house or workplace, decorate with bed, window, picture, sofa and plant, tap to place and tap to move, then the next house unlocks. Single file `index.html`. Open questions in `convo/convo v0.3.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Chinese Character Sudoku/ — status: MVP (not yet device-tested). Kids' iPad games for two children on the characters they are learning, three games on one page switched from ⚙️: 1.0 grid, 2.0 lines (one word per line), 3.0 stroke-order tracing with an animation. Page `index.html` + `js/` + `css/`, data in `assets/` (the 字库 is 267 characters from three photos; `phrases.json` is where words are added), helpers in `tools/`. Questions in `convo/` (Chinese). (`schematic.md`, `CLAUDE.md`, `convo/`)
- Adventure/ — status: MVP (not yet device-tested). A family story game played like correspondence chess, with a nightly AI storyteller. Player page `index.html`, world tools `world.html`, under-the-hood `hood.html`, storyteller `storyteller.md`, SQL in `supabase/`, `todo.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Felix Maze/ — status: MVP (not yet printed or device-tested), growing to 200 puzzles in batches of 50. Printable maze worksheets for Felix in many styles (Letter landscape, hex-coded like #810-001, levels 1–5 in a bell curve around 2.5), a library, answers animation, ⭐ puzzle of the day, 🏆 top five, 🖨️ double-sided packs of 10, 🚩 flags → 🔧 rework page → `/fix-puzzles` skill (`fmz_flags` live in the Family project), and a doodle-to-maze page. Engine in `js/`, bank in `data/`, checks in `tools/`, `catalog.md`, `characters.md`, `qc.md`, `rubric.md`, research explainer in `research/`. Open questions in `convo/convo v0.4.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)

Notes:
- The root `index.html` lists nursery projects in its Nursery section. Add a tile when a project gets a page.
- This repo is public. Keep private data out of every project. See `CLAUDE.md`.
- When new projects are added, add an entry here describing their intent and location.
