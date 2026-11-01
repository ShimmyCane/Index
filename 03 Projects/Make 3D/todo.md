# Make 3D — To-do

**Purpose of this list:** reach the MVP (v0.1–v0.6 in `schematic.md` §10), one version at a time, checking each before the next.

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Now
- [x] Set up the project folders, `CLAUDE.md`, `schematic.md`, `convo/convo v0.1.md`, `todo.md`.
- [x] Draft the MVP schematic from Jimmy's brief (proposed defaults marked *(Q#)*).
- [x] Jimmy answers `convo/convo v0.1.md`. Recorded in `convo/convo v0.2.md`; `schematic.md` §0 lists what changed.
- [x] Look at Quick Detail as the visual and structural reference (paper and ink palette, tests in Node, code map, `m3d_` cloud pattern).
- [x] Jimmy confirms round 2 in `convo/convo v0.2.md`: history as truth, Quick Detail look, editing a + c, imperial units.
- [?] Jimmy answers `convo/convo v0.3.md`: origin thresholds and weighting (Q1–Q3), units storage and precision (Q4–Q5), table length (Q6).
- [x] Freeze schema 0.1 (`model`, `history`, `world`, in inches) and write the garden planter sample and `worlds/default-world.json`.
- [x] Build v0.1–v0.6 (Jimmy said "proceed with the MVP"). Used the proposed defaults in convo v0.3 Q1–Q6; see the notes in the done log.

## MVP build
- [x] **v0.1** Load JSON and render primitives. Three.js vendored, Z-up conversion, box, cylinder, sphere, cone, group. Test model: the garden planter.
- [x] **v0.2** Interactive viewer, touch first: orbit and zoom (custom, no OrbitControls), Y-up toggle, ground plane with slider, solid / edges / wireframe, Quick Detail look. Tap to select.
- [x] **v0.3** Add / modify / delete via form and paste box (operations). Reject flow: editor stays open, delete offenders, preview. Model name and description are operations too.
- [~] **v0.4** Save / reload bundle, localStorage autosave, unknown fields kept: done. Cloud copy in the architecture database (`m3d_` tables, RLS, `table_index`): **not built, waiting for Jimmy's OK on the SQL.**
- [x] **v0.5** Rules engine: five rules, accept / warn / reject, overlap `mode` (allow by default, flag on model check), results panel. Outlines in the viewer: not done (the selection box only).
- [x] **v0.6** History: replay, scrubber (back to any step, editing only at the latest step). Author and note per operation: author is recorded; the note field is not yet in the UI.
- [x] Node tests (`node tests/test_core.js`, 19 groups) and the browser smoke run (`node tools/smoke.js`, no console errors) pass.
- [ ] Publish on GitHub Pages and check online on iPad and iPhone. (Headless iPad-size screenshot checked; not on a real device.)
- [ ] `/summarize-code` on `index.html`.

## Future (flat list, round 2)
- [ ] Outdoor table test model: 3 ft × 7 ft top on a yellow metal frame (Q-A to confirm the size), with a branching bonsai-style tree and a three-canopy umbrella.
- [ ] Kitchen test model: fridge, counter, stove, corner sink (triple, two faucets), dishwasher, drawers and doors, upper cabinets with a sliding acrylic cup display.
- [ ] Walk mode, section box, measure, PNG export (viewer).
- [ ] Gizmo editing (drag handles).
- [ ] Textures on/off toggle (the model never stores images).
- [ ] Rotation about X and Z.
- [ ] Per-operation author and note.
- [ ] Blocks: link models; import a rebuilt component as a block.
- [ ] Material list beyond colour.
- [ ] Viewer: full orthographic views, hierarchy isolate, and the rest of schematic §6.

## After MVP
- [ ] **v0.7** Import glTF / OBJ / STL as `mesh` objects.
- [ ] **v0.8** Three-view drawings: `drawing.json` format, deterministic generator, `unresolved` items.
- [ ] Extrusions (profile + path).
- [ ] Booleans: pick a kernel (OpenCascade WASM or similar) only when needed.
- [ ] Architectural components: wall, opening, door, window, assembly.
- [ ] Lego-style connection points (studs/sockets) as rule data.
- [ ] Optional LLM helper that writes operations (never a dependency).

## Decisions made while building (please check)
- Origin: used the convo v0.3 proposals: 25% outlier share, 70% trigger, volume-weighted origin. Thresholds still to confirm (v0.3 Q1–Q3).
- Units: inches, displayed as feet and inches to 1/8 in (v0.3 Q4–Q5).
- Rotation: about the model's Y axis, literally. In a Z-up file that is a horizontal axis, so tilting is what you'd see. Confirm whether you meant vertical (Z) for the umbrella and plants.
- Added `set_header` (name and description) as a history operation.
- Viewer: custom orbit controls, no OrbitControls, so the page works from file://.

## Not done yet
- Cloud copy (v0.4): needs the SQL OK.
- Outlines in the viewer for warnings and rejects (v0.5).
- Note field per operation in the UI (v0.6).
- GitHub Pages publish.
- Walk, section, measure, gizmo, orthographic views, hierarchy isolate (future).

## Done log
- 2026-11-01: project started with `/start-project`; schematic and convo v0.1 written.
- 2026-11-01: round 2 answers recorded in convo v0.2; schematic §0 added; Quick Detail reviewed as the reference.
- 2026-11-01: round 2 inline answers recorded in v0.2; convo v0.3 opened with origin, units and table-length questions.
- 2026-11-01: MVP built (v0.1–v0.6 except cloud copy and outlines): engine, viewer, UI, planter sample, 19 test groups, headless smoke run.
