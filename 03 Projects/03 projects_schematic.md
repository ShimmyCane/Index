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
- Athena's world/ — status: idea. Started with `/start-project`. Awaiting answers in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`). Also holds the Adventure Coaster Park model (`tools/adventure_park.js`, ten increments, renders in `renders/adventure_park/`). Compact and animated V11–V15 in `tools/adventure_park_compact.js` (renders in `renders/adventure_park_compact/`).
- Chinese Character Sudoku/ — status: MVP (not yet device-tested). Kids' iPad games for two children on the characters they are learning, three games on one page switched from ⚙️: 1.0 grid, 2.0 lines (one word per line), 3.0 stroke-order tracing with an animation. Page `index.html` + `js/` + `css/`, data in `assets/` (the 字库 is 267 characters from three photos; `phrases.json` is where words are added), helpers in `tools/`. Questions in `convo/` (Chinese). (`schematic.md`, `CLAUDE.md`, `convo/`)
- Adventure/ — status: MVP (not yet device-tested). A family story game played like correspondence chess, with a nightly AI storyteller. Player page `index.html`, world tools `world.html`, under-the-hood `hood.html`, storyteller `storyteller.md`, SQL in `supabase/`, `todo.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Expansion Wars/ — status: MVP (not yet device-tested). A simple expansion game: flags own fabrication centers (🍄) and cities (🏰), soldiers march along roads, lakes block roads, 2–4 players with Easy/Normal computer opponents. Plain HTML/CSS/JS: `index.html`, `css/style.css`, `js/map.js`, `js/game.js`, `js/sound.js`. Questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Felix Maze/ — status: MVP (not yet printed or device-tested), growing to 200 puzzles in batches of 50. Printable maze worksheets for Felix in many styles (Letter landscape, hex-coded like #810-001, levels 1–5 in a bell curve around 2.5), a library, answers animation, ⭐ puzzle of the day, 🏆 top five, 🖨️ double-sided packs of 10, 🚩 flags → 🔧 rework page → `/fix-puzzles` skill (`fmz_flags` live in the Family project), and a doodle-to-maze page. Engine in `js/`, bank in `data/`, checks in `tools/`, `catalog.md`, `characters.md`, `qc.md`, `rubric.md`, research explainer in `research/`. Open questions in `convo/convo v0.4.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Make 3D/ — status: MVP (not yet device-tested, not published). A browser 3D sandbox where the JSON is the model: objects appended as operations with stable IDs, a separate world file of rules (accept / warn / reject), and a Three.js viewer (orbit, sections, walk, PNG). Closed skeleton meshes and double-sided sheets (hawk). Later: three-view drawings → deterministic geometry. MVP design in `schematic.md`, steps in `todo.md`, questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Living Room Scene/ — status: MVP. A flat, pastel scene rebuilt from one living-room photo over ten iterations (`living_room_v1.html` to `living_room_v10.html`), each with a render in `renders/` and a contact sheet `renders/progress_sheet.png`. The photo is not in the repo. Log in `04 AI/Living Room Scene/`. (`schematic.md`, `CLAUDE.md`, `convo/`, `renders/`)
- Increment Viewer/ — status: MVP (template). A subject-neutral page to review a series of increments: a stacked slideshow plus a scrollable running log of descriptions and changes. Open `viewer.html`; a subject is one data file in `data/` per project (`?set=<name>`), listed once in the drop-down. Split increment files were merged per project; the originals are in `data/archive/`. (`schematic.md`, `CLAUDE.md`, `data/`)
- Shimmy Specs/ — status: idea. A web app that guides the process of writing CSI specs: project summary, code analysis, keynotes and PPD drive the section list; each section gets a schematic of questions; decisions keep their alternatives and impacts; then a three-part draft. Body of knowledge in `knowledge/`, goals in `todo.md`, MVP design in `mvp schematic.md`, build list for a Haiku session in `mvp tasks.md`. Round 1 answered (`convo/convo v0.2.md`); five questions open. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Growth/ — status: MVP (a ten-step paper story replayed in 3-D, `paper3d.html`, and in the Increment Viewer, `?set=growth_paper`). An algorithmic way to age a model: a subject carries a history of steps, and rules plus the environment turn it into a believable state at each age. First subject: a white paper sheet (stepped on, blown, torn, wet, cut, nested in). Links the Increment Viewer (overview), the 3-D viewer (one snapshot) and the database (JSON record, not yet built). Questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Paper Again/ — status: MVP (particle model). One sheet of white paper in ten increments: folds, crumpling, tears, damp and mould, cuts, burns and nesting, with a tumble between increments. Replaces Growth's 3-D version. 3-D page `paper_again.html`, Increment Viewer `?set=paper_again`. Questions in `convo/convo v0.1.md`. (`schematic.md`, `CLAUDE.md`, `convo/`, `js/`, `tests/`)

Notes:
- The root `index.html` lists nursery projects in its Nursery section. Add a tile when a project gets a page.
- This repo is public. Keep private data out of every project. See `CLAUDE.md`.
- When new projects are added, add an entry here describing their intent and location.
