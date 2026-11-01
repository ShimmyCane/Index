# Make 3D — To-do

**Purpose of this list:** reach the MVP (v0.1–v0.6 in `schematic.md` §10), one version at a time, checking each before the next.

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Now
- [x] Set up the project folders, `CLAUDE.md`, `schematic.md`, `convo/convo v0.1.md`, `todo.md`.
- [x] Draft the MVP schematic from Jimmy's brief (proposed defaults marked *(Q#)*).
- [?] Jimmy answers `convo/convo v0.1.md` (24 questions; "ok" is enough for proposed defaults).
- [ ] Record the answers in `convo/convo v0.2.md` and update `schematic.md`.
- [ ] Freeze schema 0.1: `model`, `history`, `world` (§4). Write the three sample models and `worlds/default-world.json`.
- [ ] Prompt Jimmy before building v0.1.

## MVP build
- [ ] **v0.1** Load JSON and render primitives. Vendor Three.js, Z-up conversion, box, cylinder, sphere, cone, group.
- [ ] **v0.2** Interactive viewer: orbit/pan/zoom, persp/ortho + named views, display modes, lights, hierarchy (select/hide/isolate), section box, walk, measure, PNG export.
- [ ] **v0.3** Add / modify / delete via form and paste box (operations).
- [ ] **v0.4** Save / reload bundle, localStorage autosave, unknown fields kept.
- [ ] **v0.5** Rules engine: five rules, accept / warn / reject, results panel, outlines in the viewer.
- [ ] **v0.6** History: replay, scrubber, author + note per operation.
- [ ] Node tests (`test_geometry`, `test_rules`) and the browser smoke run pass.
- [ ] Publish on GitHub Pages and check online (desktop, and iPad if Q2 says so).
- [ ] `/summarize-code` on `index.html`.

## After MVP
- [ ] **v0.7** Import glTF / OBJ / STL as `mesh` objects.
- [ ] **v0.8** Three-view drawings: `drawing.json` format, deterministic generator, `unresolved` items.
- [ ] Extrusions (profile + path).
- [ ] Booleans: pick a kernel (OpenCascade WASM or similar) only when needed.
- [ ] Architectural components: wall, opening, door, window, assembly.
- [ ] Lego-style connection points (studs/sockets) as rule data.
- [ ] Optional LLM helper that writes operations (never a dependency).

## Done log
- 2026-11-01: project started with `/start-project`; schematic and convo v0.1 written.
