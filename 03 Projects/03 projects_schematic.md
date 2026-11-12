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
- 中文笔画/ — status: MVP 0.1.0 (not yet device-tested by a child). A kids' iPad game for the worksheet characters: the child sees the pinyin and writes each character stroke by stroke. A wrong stroke is corrected on the spot; after 2 misses the answer is shown and its stroke order plays. Hints match 汉字数独 3.0. Weekly words go in `data/batches.json`, one tab per upload date (newest first). Track A. Traditional Chinese throughout. Questions in `convo/convo v0.1.md` and `convo/convo v0.2.md`. (`index.html`, `js/`, `css/`, `data/`, `tools/`, `schematic.md`, `CLAUDE.md`, `convo/`)
- Adventure/ — status: MVP (not yet device-tested). A family story game played like correspondence chess, with a nightly AI storyteller. Player page `index.html` (voiced chapters with a recorded cast, sound effects and music borrowed from Voice), world tools `world.html`, lore reader `lore.html`, voice test page `voices.html`, under-the-hood `hood.html`, storyteller `storyteller.md`, SQL in `supabase/`, `todo.md`. Athena's story: world bible of Ondra, Book 1 and a ten-book plan in `world/`; chapter 1 voiced in `story/` + `audio/`; recorder `tools/make_voice.py` (also records the storyteller's chapters into a private bucket). (`schematic.md`, `CLAUDE.md`, `convo/`)
- Living Room Scene/ — status: MVP. A flat, pastel scene rebuilt from one living-room photo over ten iterations (`living_room_v1.html` to `living_room_v10.html`), each with a render in `renders/` and a contact sheet `renders/progress_sheet.png`. The photo is not in the repo. Log in `04 AI/Living Room Scene/`. (`schematic.md`, `CLAUDE.md`, `convo/`, `renders/`)
- Shimmy Specs/ — status: idea. A web app that guides the process of writing CSI specs: project summary, code analysis, keynotes and PPD drive the section list; each section gets a schematic of questions; decisions keep their alternatives and impacts; then a three-part draft. Body of knowledge in `knowledge/`, goals in `todo.md`, MVP design in `mvp schematic.md`, build list for a Haiku session in `mvp tasks.md`. Round 1 answered (`convo/convo v0.2.md`); five questions open. (`schematic.md`, `CLAUDE.md`, `convo/`)
- Rhythm Sticks/ — status: MVP 0.1.0 (not yet device-tested). A wordless web toy that exposes the kids to rhythm and sound. A random mode loads each time: ripples, beads (microphone beat looper), hidden shake pads, strings, two-finger span, and "how the machine hears" (a microphone heat map). Hidden ⚙️ opens with a circle in the lower-right. Notes for improvement go to the family table `rs_notes` (SQL written, not applied). Track A. Shared background in `context.md`; questions in `convo/convo v0.3.md`. (`index.html`, `css/`, `js/`, `supabase/`, `context.md`, `schematic.md`, `CLAUDE.md`, `convo/`)

Notes:
- Graduated to their own repos (removed from the nursery 2026-11-10; history stays in git): Athena's world → `ShimmyCane/Athena-s-world`, Bar Glide → `ShimmyCane/Bar-Glide`, Chinese Character Sudoku → `ShimmyCane/Chinese-Character-Sudoku`, Voice → `ShimmyCane/Voice`, What to Cook → `ShimmyCane/What-to-Cook`. Earlier: Expansion Wars → `ShimmyCane/Expansion-Wars`, Felix Maze → `ShimmyCane/Felix-Maze`, Fishes → `ShimmyCane/Fishes`, Make 3D → `ShimmyCane/Make-3D`, Growth (with Paper Again) → `ShimmyCane/Growth`, Increment Viewer → `ShimmyCane/Increment-Viewer`. Steps for the next one: `/graduate-project`.
- The root `index.html` lists nursery projects in its Nursery section. Add a tile when a project gets a page.
- This repo is public. Keep private data out of every project. See `CLAUDE.md`.
- When new projects are added, add an entry here describing their intent and location.
