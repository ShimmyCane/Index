# Make 3D — To-do

**Purpose of this list:** reach the MVP (v0.1–v0.6 in `schematic.md` §10), one version at a time, checking each before the next.

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Now
- [x] Set up the project folders, `CLAUDE.md`, `schematic.md`, `convo/convo v0.1.md`, `todo.md`.
- [x] Draft the MVP schematic from Jimmy's brief (proposed defaults marked *(Q#)*).
- [x] Jimmy answers `convo/convo v0.1.md`. Recorded in `convo/convo v0.2.md`; `schematic.md` §0 lists what changed.
- [x] Look at Quick Detail as the visual and structural reference (paper and ink palette, tests in Node, code map, `m3d_` cloud pattern).
- [?] Jimmy confirms the open items in `convo/convo v0.2.md`: 🚩 history as source of truth (C10), look (Q-D), the ❓ questions (Q-A to Q-E).
- [ ] Freeze schema 0.1: `model`, `history`, `world` (§4). Write the garden planter sample and `worlds/default-world.json`.
- [ ] Prompt Jimmy before building v0.1.

## MVP build
- [ ] **v0.1** Load JSON and render primitives. Vendor Three.js, Z-up conversion, box, cylinder, sphere, cone, group. Test model: the garden planter (box, cylinders, sphere and cone for plants).
- [ ] **v0.2** Interactive viewer, touch first: orbit and zoom, Y-up toggle, ground plane with slider, display solid / wireframe / solid + edges, look per Quick Detail palette.
- [ ] **v0.3** Add / modify / delete via form and paste box (operations). Reject flow: editor stays open, delete offenders, preview.
- [ ] **v0.4** Save / reload bundle, localStorage autosave, unknown fields kept. Cloud copy in the architecture database (`m3d_` tables, RLS, `table_index`).
- [ ] **v0.5** Rules engine: five rules, accept / warn / reject, overlap `mode` (allow by default, flag on model check), results panel, outlines in the viewer.
- [ ] **v0.6** History: replay, scrubber, author + note per operation.
- [ ] Node tests (`test_geometry`, `test_rules`) and the browser smoke run pass.
- [ ] Publish on GitHub Pages and check online on iPad and iPhone.
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

## Done log
- 2026-11-01: project started with `/start-project`; schematic and convo v0.1 written.
- 2026-11-01: round 2 answers recorded in convo v0.2; schematic §0 added; Quick Detail reviewed as the reference.
