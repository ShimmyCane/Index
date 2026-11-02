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
- [x] **v0.4** Save / reload bundle, localStorage autosave, unknown fields kept. Cloud copy: `m3d_scenes` in the Architecture project (RLS, owner only, registered in `table_index`), applied 2026-11-02 after a rolled-back test. Library → Save this scene to the cloud. Sign-in by email code (owner account only).
- [x] **v0.5** Rules engine: five rules, accept / warn / reject, overlap `mode` (allow by default, flag on model check), results panel. Outlines in the viewer: not done (the selection box only).
- [x] **v0.6** History: replay, scrubber (back to any step, editing only at the latest step). Author and note per operation: author is recorded; the note field is not yet in the UI.
- [x] Node tests (`node tests/test_core.js`, 19 groups) and the browser smoke run (`node tools/smoke.js`, no console errors) pass.
- [ ] Publish on GitHub Pages and check online on iPad and iPhone. (Headless iPad-size screenshot checked; not on a real device.)
- [ ] `/summarize-code` on `index.html`.

## Round 4 (designed in convo v0.4, not built)
- [ ] Annotations in 3-D: click a surface to anchor, drag out a label with a leader line, screen-facing and legible. Autosave to the cloud. Session undo. Delete. Free and part annotations (A1–A6).
- [ ] Groups: drag an object into a group, recorded as an operation (G1).
- [ ] Visibility: hide a group or object; image export leaves hidden items out; 3-D export keeps them flagged hidden (G2–G4). Final choice still to make.
- [ ] Export a PNG of one view as a background for Quick Detail (E3).
- [ ] Export a 3-D file for Revit or other software: target software still open (E1–E2).
- [ ] Tag scenes like Quick Detail details (S2).
- [ ] Read-only share link for presenting (S1).

## Scenes and library (round 3)
- [x] Outdoor table with parasol: 3 ft × 7 ft top on a yellow metal frame, bonsai-style tree, parasol with three canopies (one on the pole, one on each side arm). Table length (7 ft) still to confirm (v0.3 Q6).
- [x] Kitchen: fridge, counter and stove on the left; sink run with a triple sink and two faucets; dishwasher, drawers and a door on the right; upper cabinets with a sliding acrylic cup display.
- [x] Library button (lower right, next to the gear): built-in input scenes, cloud scenes after sign-in, Quick Detail details tagged `make 3-D` (read only, future references).
- [ ] Quick Detail: tag details `make 3-D` before they appear. None have it yet.
- [ ] LLM-made scenes and drawn scenes (linked in as JSON input): future, not built.

## Future (flat list, round 2)
- [ ] Walk mode, section box, measure, PNG export (viewer).
- [ ] Gizmo editing (drag handles).
- [ ] Textures on/off toggle (the model never stores images).
- [ ] Rotation about X and Z.
- [ ] Per-operation author and note.
- [ ] Blocks: link models; import a rebuilt component as a block.
- [ ] Material list beyond colour.
- [ ] Viewer: full orthographic views, hierarchy isolate, and the rest of schematic §6.
- [ ] Editable cloud scenes: versions table (the `m3d_scenes` row is one scene; editing history is kept in its bundle).

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
- Outlines in the viewer for warnings and rejects (v0.5).
- Note field per operation in the UI (v0.6).
- GitHub Pages publish.
- Walk, section, measure, gizmo, orthographic views, hierarchy isolate (future).

## Done log
- 2026-11-01: project started with `/start-project`; schematic and convo v0.1 written.
- 2026-11-01: round 2 answers recorded in convo v0.2; schematic §0 added; Quick Detail reviewed as the reference.
- 2026-11-01: round 2 inline answers recorded in v0.2; convo v0.3 opened with origin, units and table-length questions.
- 2026-11-01: MVP built (v0.1–v0.6 except cloud copy and outlines): engine, viewer, UI, planter sample, 19 test groups, headless smoke run.
- 2026-11-02: outdoor table and kitchen samples; Library button; cloud client (`m3d_scenes`, read-only `sketch_details` by tag); migration applied after a rolled-back test; 8 cloud test groups; smoke run covers the library.
- 2026-11-02: round 4 notes (iPad): paste is the default tab, step counter removed, one gear icon, panels collapse. Annotation, groups, visibility and export designed in convo v0.4 and the schematic §13; not built.

## Living room from a photo (2026-11-02)
- [x] Process logged in `04 AI/Make 3D/lessons.md` before modelling.
- [x] V01 blockout, then V02 to V10 by review of each render against the photo (`tools/living_room.js`, one function, `defsFor(v)`).
- [x] Browser check of each version (`node tools/render_versions.js <dir> "Living room V01" ...`), plus smoke and engine tests.
- [ ] Jimmy checks the sizes against the room (estimates, not measured). Questions in `04 AI/Make 3D/brief.md`.
- [ ] Viewer: a "hide walls" toggle, so the door and the far walls can be checked from any side.
- [ ] Commit and publish when Jimmy agrees (not committed yet).
