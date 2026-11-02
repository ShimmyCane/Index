# Make 3D — MVP Schematic

**Status:** idea, round 2 answered · **Updated:** 2026-11-02
**Based on:** Jimmy's brief, `convo/convo v0.1.md` and `convo/convo v0.2.md`. Where v0.2 differs from the first draft, v0.2 wins (listed in §0). Items marked 🚩 are still open.

## 0. What changed in round 2

- **Project name:** Make 3D (confirmed).
- **Users and devices:** family; iPad and iPhone first (touch).
- **MVP test model:** the garden planter only. The outdoor table and the kitchen are future test models.
- **Position:** the origin is the centre of the **major bounding box** (the bulk of the elements). If most elements are much smaller than the full box, the origin is refined by volume weighting. Big features (a spire, a wing) extend the extent but don't move the origin. A ground plane (opaque, double-sided, green, slider height) clips the model so it sits.
- **Up axis:** Z-up by default, with a Y-up toggle in settings.
- **Clash check** *(round 4)*: `js/core/clash.js` samples each solid through its volume and reports pairs that pass into each other by more than 0.5 in. Parts of the same top-level group are not compared. Used in the tests; not yet shown in the UI.
- **Rotation:** any part turns about all three model axes: `rotation_x`, `rotation_y`, `rotation_z`, in degrees. Order: X first, then Y, then Z. Z is up, so `rotation_z` spins a part on the ground. Missing means 0, and the form writes only non-zero angles.
- **Each object** has a `description` as well as a `name`.
- **Textures:** future. The model never stores images or image mapping.
- **Overlap:** allowed by default; a world rule can turn on a flag for a model check.
- **Reject:** back to the editor, with delete-and-retry and preview.
- **Viewer MVP:** orbit and zoom only. Walk, sections and measure are future.
- **Storage:** local plus cloud. The cloud copy goes in the architecture database (`m3d_` tables), not in the first build.
- **Look:** the Quick Detail paper and ink palette, adapted as needed (confirmed).
- **Units:** imperial. Files store inches; display feet and inches (v0.3 Q4–Q5 to confirm).
- **Built (v0.1–v0.6, MVP):** see `todo.md`. Cloud copy (v0.4 part) is not built: it needs the SQL OK first.
- **Origin:** weighted major bounding box (v0.3 Q1–Q3 to confirm the thresholds).
- **History** is the source of truth (confirmed).
- **Overlap, reject flow, storage:** as listed above (confirmed in v0.2 with A and C for editing).

## 1. Purpose

A machine-readable physical world you can inspect in a browser. The model is not trapped inside Rhino, Revit or an LLM. It is an open, inspectable data structure that grows by adding things to it.

Three things are kept separate:

| Part | Question it answers | File |
|---|---|---|
| **Model** | What physically exists? | `model.json` |
| **Rules** | What is allowed to exist? | `world.json` |
| **Evidence** | How and why was it made? | `history.json` (later `drawing.json`, `drawing.png`) |

The LLM is optional. It may write operations, but nothing needs it to render, inspect or check a model.

## 2. Four engines

```
 ┌───────────────┐   operations   ┌────────────────┐   checked ops   ┌───────────────┐
 │ INPUT ENGINE  │ ─────────────▶ │  RULES ENGINE  │ ──────────────▶ │GEOMETRY ENGINE│
 │ form, pasted  │                │ world.json     │                 │ replay history│
 │ JSON, file,   │ ◀── results ── │ accept / warn /│                 │ → model state │
 │ (later) dwg   │                │ reject         │                 └──────┬────────┘
 └───────────────┘                └────────────────┘                        │ read-only
                                                                            ▼
                                                                   ┌────────────────┐
                                                                   │ VIEWER ENGINE  │
                                                                   │ Three.js scene │
                                                                   └────────────────┘
```

- **Input** turns a form entry, a pasted JSON operation or an opened file into a list of operations. Later it does the same for drawings and imports.
- **Rules** checks each operation against the world and the current model and returns accept, warn or reject, with reasons.
- **Geometry** applies accepted operations and replays the history into model state. It has no DOM and no Three.js, so it runs in plain Node for tests.
- **Viewer** builds a Three.js scene from model state. It only reads the model. Swapping Three.js out later changes nothing else.

## 3. Foundations (decided before code)

1. Every object has a permanent `uuid` and a readable `name` *(Q7)*.
2. Every file carries `schema` (e.g. `"make3d.model/0.1"`).
3. Units and axes are explicit: **inches** (imperial, round 2 Q-E), right-handed, **Z-up**. The viewer can show Y-up instead (a settings toggle, round 2).
4. Changes are operations in `history.json`. Data is never just overwritten *(Q10)*.
5. Rules are independent of geometry.
6. Rendering never modifies the model.
7. Unknown fields are kept, not dropped, so newer files survive older code.

## 4. File formats (draft 0.1)

### 4.1 `model.json`, the replayed result

```json
{
  "schema": "make3d.model/0.1",
  "model_id": "table-001",
  "version": 6,
  "units": "in",
  "up": "z",
  "world": "default-world",
  "materials": {
    "oak":   { "color": "#c8a27a", "opacity": 1 },
    "steel": { "color": "#9aa4ad", "opacity": 1 }
  },
  "objects": [
    {
      "uuid": "6f1c…",
      "name": "top",
      "description": "table top, 3 ft x 7 ft",
      "type": "box",
      "dimensions": [36, 84, 1.5],
      "position": [0, 0, 30],
      "rotation_y": 0,
      "parent": "a91e…",
      "material": "oak",
      "tags": [],
      "allowed_overlap": []
    }
  ]
}
```

- `position` is the **centre of the object's bounding box**, in inches (round 2, Q5). Model origin rule: see §0 (weighted major box, v0.3 Q1–Q3). Ground height is a viewer setting and is never stored.
- `rotation_x`, `rotation_y`, `rotation_z` are in degrees, about the model's X, Y and Z axes (Z up). Applied X, then Y, then Z (round 2, Q6, widened in round 4 chat). Each is stored as one number and is optional (0 when missing). The viewer and the origin maths use the same order.
- `description` is free text, for example "sits on the floor" or "floats 5 ft in the air" (round 2, Q7).
- Materials are named references, colour only. Textures are future, and images or image mapping are never stored in the model (round 2, Q9).
- `parent` is the uuid of a `group` object, or null *(Q8)*.
- `version` equals the number of operations applied.

### 4.2 Primitive types (MVP)

| type | dimensions | notes |
|---|---|---|
| `group` | — | holds children, no geometry |
| `box` | `[x, y, z]` | width, depth, height |
| `cylinder` | `[radius, height]` | optional `segments` |
| `sphere` | `[radius]` | origin at centre |
| `cone` | `[radius, height]` | |

**Tags** *(convo v0.5)*: each object may carry `tags`, a list of purposes from a fixed set in `js/core/schema.js` (`surface`, `frame`, `stand`, `shade`, `ballast`, `plant`, `container`). Tags only describe the part: they don't change geometry or rules. The objects panel shows them as chips, and the bottom bar shows the selected part's name, tags and description next to Check model. Unknown tags are kept but not styled.

Later: `extrusion` (profile + path), `boolean` (union / subtract / intersect, needs a kernel), `mesh` (imported STL/OBJ/glTF), architectural components (wall, door, window).

### 4.3 `history.json`, the source of truth *(Q10)*

```json
{
  "schema": "make3d.history/0.1",
  "model_id": "table-001",
  "operations": [
    { "seq": 1, "op": "add",    "time": "2026-11-01T10:00:00Z", "author": "jimmy", "note": "table top",
      "object": { "uuid": "6f1c…", "name": "top", "type": "box", "dimensions": [36,84,1.5], "position": [0,0,30] } },
    { "seq": 2, "op": "modify", "time": "…", "author": "chat", "note": "thicker top",
      "uuid": "6f1c…", "set": { "dimensions": [36,84,1.75] } },
    { "seq": 3, "op": "delete", "time": "…", "author": "jimmy", "uuid": "…" }
  ]
}
```

- Operations: `add`, `modify` (sets only the listed fields), `delete`, `rename`. Later: `batch` and `import`.
- Replaying operations 1…n gives model version n, so the viewer can step back through time.
- An operation that the rules reject is **not** stored in the history. It is shown in the results panel *(Q15)*.

### 4.4 `world.json`, the rules

```json
{
  "schema": "make3d.world/0.1",
  "world_id": "default-world",
  "units": "in",
  "coordinate_system": "right-handed",
  "up": "z",
  "gravity": [0, 0, -9.81],
  "bounds": { "min": [-10000, -10000, 0], "max": [10000, 10000, 10000] },
  "rules": [
    { "id": "rule-001", "type": "minimum_dimension", "value": 1, "severity": "warning" },
    { "id": "rule-002", "type": "object_overlap", "mode": "allow", "severity": "review" },
    { "id": "rule-003", "type": "within_bounds", "severity": "warning" },
    { "id": "rule-004", "type": "valid_geometry", "severity": "reject" },
    { "id": "rule-005", "type": "valid_coordinates", "severity": "reject" }
  ]
}
```

## 5. Rules engine

| Rule type | Checks | Default severity |
|---|---|---|
| `valid_coordinates` | position and rotation_y are finite numbers | reject |
| `valid_geometry` | known type, all dimensions given and > 0, parent exists and is a group | reject |
| `minimum_dimension` | every dimension ≥ value | warning |
| `within_bounds` | bounding box inside `world.bounds` | warning |
| `object_overlap` | bounding boxes overlap. `mode: allow` (default) passes; `mode: flag` raises a review flag on a model check, not on every edit. Objects may list `allowed_overlap` (Lego-style interlocking) *(round 2, Q13)* | review |

- **Outcome per operation:** `accept`, `accept_with_warnings` (any warning or review), or `reject` (any reject).
- Severities and values come from the world file. The viewer has no hard-coded rules.
- Overlap uses `mode`. Only a **model check** (a button) runs the flag rules, so quick rough modelling isn't slowed down.
- Each rule is one small function `check(op, model, world) → [{rule, severity, message, uuids}]`, so new rules plug in without touching the others.
- Results show in a panel, and the affected objects are outlined in the viewer (amber for warning or review, red for reject).

## 6. Viewer engine (Three.js)

| Feature | MVP behaviour |
|---|---|
| Orbit / zoom | MVP. One-finger orbit, pinch zoom, on touch; mouse and trackpad also work. Pan is later |
| Ground | toggle + vertical slider; opaque, double-sided, green, clips the model *(round 2, Q5)* |
| Up axis | Z-up default; settings toggle for Y-up *(round 2, Q4)* |
| Units | stored in inches; display feet and inches to 1/8 in (round 2 Q-E, v0.3 Q4–Q5) |
| Look | Quick Detail paper and ink palette (🚩 Q-D) |
| Cameras | perspective ⇄ orthographic. Views: top, front, side, iso (later) |
| Display | solid · wireframe · solid + edges (MVP); textures on/off (future) |
| Lights | ambient + one sun. On/off, intensity, sun angle |
| Hierarchy | tree of groups and objects: select, hide, isolate, show all (later) |
| Selection | click in the scene or the tree. Properties panel shows the object's JSON (read-only in v0.2) |
| Section | future |
| Walk | future |
| Measure | future |
| Export | PNG screenshot of the current view (later) |
| Grid & axes | ground grid in feet, axis triad (Z up) |

Axis conversion happens in one place (`viewer/axes.js`): model Z-up → Three.js Y-up.

## 7. Input and storage

- **Form** *(Q16a, v0.3)*: pick a type, enter name, description, dimensions, position, rotation (Y), material and parent → produces an `add` or `modify` operation.
- **Paste operations** *(Q16c)*: a JSON box accepts one operation or a list. Each one is checked, applied or rejected, and the results are shown. This is where an LLM's output plugs in.
- **Reject flow** *(round 2, Q15)*: the editor stays open with the reasons listed. Delete one or more of the offending objects and re-apply, or preview the result without saving.
- **Files** *(Q17)*: open or save a bundle (`model.json` + `history.json` + `world.json`, or one combined `.make3d.json`). Sample models load from `models/`. The last session autosaves to localStorage.
- **Cloud** *(round 2, Q17, v0.4)*: `m3d_scenes` in the architecture database (one row per scene: bundle and replayed model), registered in `table_index`, owner only (RLS). Built 2026-11-02.
- **Library** *(round 3; four built-in scenes from v0.5: garden planter, outdoor table, outdoor table V2, kitchen)*: lower-right button. Lists input scenes (built in, and saved in the cloud). Lists Quick Detail details tagged `make 3-D` as read-only future references. Scenes from an LLM or from drawings come later, linked in as JSON input.
- Drawing and component blocks are future (round 2, Q16 and Q14).

## 8. Page layout (draft)

```
┌──────────────────────────────────────────────────────────────┐
│ Make 3D   [model name ▾]  [Open] [Save] [PNG]   status pill  │
├────────────┬──────────────────────────────────┬──────────────┤
│ Hierarchy  │                                  │ Properties   │
│  ▸ table   │            3D viewport           │ (selected)   │
│    top     │                                  │──────────────│
│    leg-1…4 │                                  │ Add / Paste  │
│            │   [view cube]  [display] [walk]  │ operation    │
├────────────┴──────────────────────────────────┴──────────────┤
│ History ◀ ▮▮▮▮▮▮▮▮▮▮ ▶  v6/6       Rules: 1 warning, 0 reject│
└──────────────────────────────────────────────────────────────┘
                                                   ⚙️ (lower right)
```

- ⚙️ drawer: lights, display defaults, world file, "Show errors" toggle (errors sit at the bottom, opt-in).
- Look and colours wait on Q1 (pastel kid style, or a calm desktop tool).

## 9. Folder layout (as built, v0.1–v0.6 MVP)

```
03 Projects/Make 3D/
  index.html               page shell (open directly, no server)
  css/app.css              Quick Detail paper and ink look, touch-first
  vendor/three/            Three.js r160.0 (three.min.js, LICENSE)
  js/core/                 pure engine, runs in Node and the browser
    units.js               inches; ft-in display; parsing
    schema.js              constants, uuid, defaults
    geometry.js            apply operations, replay history, set_header
    origin.js              major box, weighted origin, ground height
    rules.js               five rules, overlap mode, checkOperation / checkModel
    io.js                  bundles (history + world + model)
  js/viewer/viewer.js      Three.js scene, orbit/zoom, pick, ground, display modes
  js/ui/app.js             the page: panels, reject flow, preview, history, settings
  js/samples.bundle.js     generated by tools/build_samples.js (works from file://)
  models/garden-planter/   history.json (source) and model.json (replayed)
  worlds/default-world.json
  tools/build_samples.js   builds the planter from its operation list
  tools/smoke.js           headless Chromium run of index.html
  tools/living_room.js     living room versions V01–V10 from a photo (inches, one function, defsFor(v))
  tools/render_versions.js headless render of named library scenes to PNG (outside the repo)
  private/                 git-ignored: the source photo (not committed)
  tests/test_core.js       Node tests for the engine
  js/core/motion.js        motion files: poseAt, checkMotion, motionBox (round 7)
  tools/robot_banana.js    robot-with-banana scene and its motion file
  tools/anim_check.js      headless check: autoplay, play bar, pinch zoom
  tests/test_motion.js     Node tests for motion and the robot walk
  schematic.md · todo.md · CLAUDE.md · convo/
```

## 10. Roadmap

| Version | Deliverable | Done when |
|---|---|---|
| v0.1 | Load JSON and render primitives | the garden planter renders from `models/` |
| v0.2 | Interactive viewer | orbit/zoom on touch and mouse; Y-up toggle; ground slider |
| v0.3 | Add, modify, delete objects | form + paste box create operations |
| v0.4 | Save and reload | round-trip with no loss, unknown fields kept |
| v0.5 | World rules and validation | the five rules, results panel, outlines |
| v0.6 | Append instructions + history | history scrubber, replay = saved model |
| — | **MVP line** *(round 2, Q22, confirmed)* | |
| v0.7 | Import external geometry | glTF/OBJ/STL as `mesh` objects |
| v0.8 | Three-view drawing interpretation | §11 |

## 11. Later: drawing → model (not in MVP)

Drawings will be drawn in the app, not imported (round 2, Q23). Quick Detail (`shimmycane/quick-detail`) is the existing 2D sketch app and is the reference for this step.

```
details/detail-0001/
  drawing.json   meaning: views, scale, origin, lines/arcs/circles, dimensions,
                 line classes (visible, hidden, centre, section), cross-view links
  drawing.png    evidence: what the human actually drew
  geometry.json  generated model (same format as model.json)
  rules.json     constraints for this detail
  history.json   provenance
```

- A deterministic generator turns `drawing.json` into geometry. An LLM may help write `drawing.json` from words, but the same generator consumes either source.
- Three views don't always define a unique solid. Ambiguities are kept as `unresolved` items for a human to decide, never silently invented.
- Booleans and reliable solids will need a kernel (e.g. OpenCascade in WebAssembly). The file format should not depend on it.

## 12. Testing

- `node tools/test_geometry.js`: apply/replay, modify only listed fields, delete with children, unknown fields kept.
- `node tools/test_rules.js`: one passing and one failing case per rule, plus the Lego overlap exception.
- `node tools/smoke.js`: headless Chromium (pre-installed Playwright) loads each sample, toggles views, saves a PNG outside the repo.

## 13. Annotation, groups, visibility, export (round 4: designed, not built)

Source: `convo/convo v0.4.md`. Open questions there. Nothing here is built yet.

- **Annotations:** anchored to a surface point (click snaps to the first surface the camera sees). A leader line runs to a label that the user drags out to a distance. The label is screen-facing, with a paper backing and a fixed screen size, so it stays legible as the scene rotates. Kinds: free-floating, attached to an object, or both. Stored in the model as operations (`annotation_add`, `annotation_edit`, `annotation_delete`), so history and undo stay consistent.
- **Undo:** session only, and separate from the model history (proposed, A5).
- **Autosave:** each annotation edit is saved to the cloud on its own. Offline edits queue and send when back online (A6).
- **Groups:** moving an object into a group sets its `parent` (an operation). Nesting to be decided (G1).
- **Visibility:** `hidden` flag on objects and groups. Hiding a group hides its children. Image export leaves hidden items out. 3-D export keeps them, flagged hidden (proposed, G2–G4).
- **Exports:** a PNG of one view, for a background in Quick Detail (E3). A 3-D file for Revit: **IFC** (convo v0.6), built in `js/core/export_ifc.js` and downloaded from the gear panel. Up stays Z (up is up in Revit); units are handled inside the exporter so the model lands at real scale. Imports into Revit as placeable elements, not editable `.rfa` families (editable and parametric families are future).
- **Future:** scene tags (S2); read-only share link (S1).


## 14. Animation (round 7: built A1–A5)

Source: `convo/convo v0.7.md` (answers A–E). Test scene: robot with a banana (`tools/robot_banana.js`, `models/robot-banana/motion.json`).

**Always a loop** (Jimmy, round 7): one `loop_s` per file; every motion repeats a whole number of `cycles` per loop, and a path always closes on itself. Autoplay runs the loop `autoplay.plays` times (2), then pauses at the start pose.

**Files.** Motion is a fourth file, separate from the model:

| Part | Question it answers | File |
|---|---|---|
| Model | What physically exists? | `model.json` |
| Rules | What is allowed to exist? | `world.json` |
| Evidence | How and why was it made? | `history.json` |
| **Motion** | **How does it move?** | **`motion.json`** |

```json
{
  "schema": "make3d.motion/0.1",
  "model_id": "robot-banana",
  "loop_s": 18,
  "autoplay": { "plays": 2 },
  "motions": [
    { "id": "walk", "target": "<robot group uuid>", "kind": "path",
      "points": [[0,0,0],[40,12,0],[80,0,0],[100,34,0],"…"], "face": "tangent",
      "pivot": [0, 0, 0], "cycles": 1 },
    { "id": "left-leg", "target": "<left leg group uuid>", "kind": "swing",
      "pivot": [0, 4, 18], "axis": "y", "from": -25, "to": 25,
      "cycles": 18, "phase": 0 },
    { "id": "right-leg", "target": "<right leg group uuid>", "kind": "swing",
      "pivot": [0, -4, 18], "axis": "y", "from": -25, "to": 25,
      "cycles": 18, "phase": 0.5 }
  ]
}
```

- Units inches, Z up, angles in degrees, same as the model. `pivot` is in model coordinates at rest.
- Kinds: `spin` (whole turns per loop), `swing` (sine between `from` and `to`, about `pivot` and `axis`), `slide` and `bob` (smooth rise from 0 to `distance` / `amount` and back), `path` (closed curve through `points`, constant speed; `face: "tangent"` turns the target to face the way it goes, from `rest_heading_deg`).
- `phase` (0–1) shifts a motion within its cycle: legs half a step apart are phase 0 and 0.5.
- Several motions on one target apply in file order. A motion moves its target's node, so a group carries its children.
- `start`: `"auto"` now. Future (Jimmy, round 7): `"tap:<uuid>"` starts a motion when a part is tapped, and `"then": "<motion id>"` chains one after another (tap the door, the door opens, then the cuckoo comes out).

**Engine.** `js/core/motion.js` (pure, Node and browser):
- `checkMotion(model, motion)`: targets exist, pivots and numbers valid, warns on missing targets.
- `poseAt(model, motion, t)`: returns a per-uuid transform change at time `t`. Used by the viewer, and later by the clash check over time and the render tool.
- `motionBox(model, motion)`: the space the motion covers, so the camera frames the whole walk.

**Viewer.**
- Groups become scene nodes; children inherit their parent's transform (needed so the banana travels with the hand). Still scenes must render exactly as before.
- Each node keeps its rest transform; the pose is applied on top each frame and removed on stop.
- Clock: plays twice on open, then pauses. Redraw every frame only while playing; on touch only while paused (battery).
- Play bar under the scene: ▶/⏸, ⟲ (back to the start), time slider. ⚙️: speed (½×, 1×, 2×) and "play by itself on open" (saved in this browser). The bar shows only for scenes with motion.
- Touch (round 7, E): one finger orbits, two fingers pinch to zoom (touch events, so iPad Safari keeps the gesture; the page's own pinch-zoom is blocked over the canvas), a tap selects. Mouse: drag, wheel, trackpad pinch.
- Editing pauses playback and shows the rest pose (the first frame of the loop is the rest pose).
- Bundles (file, browser save, cloud) carry `motion` as an optional fourth part; scenes without it load as before.

**Library order (round 7, G–H).** One row per project (the scene name without its "V…" label, or the scene's `project`), most recently changed first; older versions fold away, newest first. Each sample bundle carries `listing: { project, created, updated }` from `models/scene_dates.json`, which the build keeps: a new scene takes its dates from git, and a changed history or motion sets `updated` to now.

**Tools.** `render_versions.js` takes a time (or a frame count for a strip) for the Increment Viewer. IFC export uses the rest pose.


## 15. Skeleton meshes: closed lofts and thin sheets (round 8: built, from the hawk)

Boxes, cylinders, spheres and cones give hard, extruded shapes. For things that bend (a wing, a tail, a neck, a blade of grass, a flag) there are two more types. Both are built on a **skeleton line**: a chain of joints that the motion file can bend.

| Type | What it is | Drawn |
|---|---|---|
| `loft` | a **closed** mesh: a smooth tube along the skeleton with end caps. Solid, watertight, outward faces. Bodies, wings, tails, beaks, legs, a mouse. | one side |
| `sheet` | an **open** thin surface along the skeleton. Leaves, blades of grass, flags, ears. | **double sided** |

```json
{ "type": "loft", "dimensions": [..], "position": [..],
  "shape": { "joints": [[x,y,z], ...],   // the skeleton line at rest, absolute model coordinates, 2 or more
             "facing": [0,1,0],          // which way the wide side of the cross-section points
             "rings": [[t, w, h], ...],  // loft: t 0..1 along the line, w half width, h half height (sheet: [t, w])
             "samples": 14, "sides": 12, // cross-sections along the line; points round each (sheet: across, odd)
             "cup": 0.3 } }              // sheet only: how far the middle lifts, as a fraction of the half width
```

- `dimensions` and `position` are the box around the rest mesh, written by the scene tool, so the rules, bounds and origin work as for any part. Lofts and sheets are never rotated (`rotation_*` stay 0); orient them through `joints` and `facing`.
- `sheet` is exempt from the minimum-dimension rule (thin on purpose). The clash check skips lofts and sheets (no volume test yet).
- `attach: { "to": "<loft uuid>", "joint": k }` on any part makes it **ride that joint** of another loft's skeleton: eyes on the head joint, a tail on the rump joint. Same group as the skeleton's owner.
- Motion kind **`bend`**: `{ target: <loft or sheet>, kind: "bend", joint: k, axis: "x|y|z", ... }` turns everything after joint `k` about joint `k`'s rest position, in the frame of the joints before it (so a wing's elbow bends with its shoulder). Angle: `from`/`to`/`cycles`/`phase` (a sine, as `swing`), or `keys: [[t, deg], ...]`. `envelope: [[t, 0..1], ...]` scales the whole angle (a flap that starts and stops).
- `keys` is a closed list: `t` rises from 0 and stays below 1, and after the last key the value eases back to the first key's value at t = 1. `swing` accepts `keys` too.
- A `path` can use **`face: "flight"`**: the nose follows the path, and the up axis leans into turns and pulls (`bank_gain`), so a bird banks and pitches without any roll keys. The up axis keeps a floor so the bird never rolls onto its back; the frame at the start is the rest pose.
- `face: "flight"` options: `gravity` (the world's g in in/s^2; with the speed it sets the bank, default 386.1), `bank_gain` (1 = a coordinated turn), `max_bank_deg` and `half_span` with `ground_z` (a roll cap that shrinks near the ground so the lower wing tip clears it), `step` (chord, as a fraction of the loop, used to read curvature).
- Several `bend`s on one joint add up. For the first frame to be the rest pose, each bend must be 0 at t = 0 (use phase 0, or an offset that cancels it; the envelope multiplies the whole angle).

**Engine.** `js/core/mesh.js` builds the vertices and triangles (the vertex layout depends on the shape only, so a viewer builds triangles once and moves vertices), `meshStats` checks a loft is closed, `shapeIssues` is the rules check. `js/core/motion.js` adds `skinAt` (a matrix per joint), `keyAt`, `flightFrame`, `pathMarks`. The viewer builds one `BufferGeometry` per part, rewrites its vertices each frame only for parts whose joints move, and draws sheets with `DoubleSide`.

**Not yet:** IFC export skips lofts and sheets; the clash check ignores them; no way to add one from the form (they come from a scene tool); a bend's frame is the chain's, so a twist about the line itself is not available.

**Test scene:** `tools/hawk.js` (V01 to V06), `tests/test_mesh.js`. Render stills and frames with `node tools/render_models.js <dir> hawk-v06@19.4 --follow=hawk --zoom=62`.

**Physical flight (hawk V07).** A path's `profile` can come from energy instead of a chosen speed: along the path, `d(v^2/2)/ds = -g sin(slope) - k v^2 + thrust`, with `k` the drag per inch (wings spread, tucked, or flared open as an air brake), `thrust` only while flapping, and rising air (a thermal, or wind pushed up a bluff) holding the soaring speed. The flap thrust is solved by bisection so the speed at the end of the climb equals the soaring speed, so the lap closes with no jump. `tools/hawk_flight.js` does this and writes the constants into the motion file under `physics`; `tests/test_mesh.js` checks the energy balance back from the profile. The scaled world (about a tenth of real size) uses g = 150 in/s^2, so speeds are scaled with it.
