# Make 3D — MVP Schematic

**Status:** idea · **Updated:** 2026-11-01
**Based on:** Jimmy's brief (summarised in `convo/convo v0.1.md`). Items marked *(Q#)* are proposed defaults waiting on that convo question. Answers may change them.

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
3. Units and axes are explicit: mm, right-handed, **Z-up** *(Q4)*.
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
  "units": "mm",
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
      "type": "box",
      "dimensions": [1200, 600, 30],
      "position": [0, 0, 720],
      "rotation": [0, 0, 0],
      "parent": "a91e…",
      "material": "oak",
      "tags": [],
      "allowed_overlap": []
    }
  ]
}
```

- `position` is the object's own origin. For a box and a cylinder that is the **centre of the base** *(Q5)*.
- `rotation` is in degrees, Z-Y-X order, about the origin *(Q6)*.
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

Later: `extrusion` (profile + path), `boolean` (union / subtract / intersect, needs a kernel), `mesh` (imported STL/OBJ/glTF), architectural components (wall, door, window).

### 4.3 `history.json`, the source of truth *(Q10)*

```json
{
  "schema": "make3d.history/0.1",
  "model_id": "table-001",
  "operations": [
    { "seq": 1, "op": "add",    "time": "2026-11-01T10:00:00Z", "author": "jimmy", "note": "table top",
      "object": { "uuid": "6f1c…", "name": "top", "type": "box", "dimensions": [1200,600,30], "position": [0,0,720] } },
    { "seq": 2, "op": "modify", "time": "…", "author": "chat", "note": "thicker top",
      "uuid": "6f1c…", "set": { "dimensions": [1200,600,40] } },
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
  "units": "mm",
  "coordinate_system": "right-handed",
  "up": "z",
  "gravity": [0, 0, -9.81],
  "bounds": { "min": [-10000, -10000, 0], "max": [10000, 10000, 10000] },
  "rules": [
    { "id": "rule-001", "type": "minimum_dimension", "value": 1, "severity": "warning" },
    { "id": "rule-002", "type": "object_overlap", "severity": "review" },
    { "id": "rule-003", "type": "within_bounds", "severity": "warning" },
    { "id": "rule-004", "type": "valid_geometry", "severity": "reject" },
    { "id": "rule-005", "type": "valid_coordinates", "severity": "reject" }
  ]
}
```

## 5. Rules engine

| Rule type | Checks | Default severity |
|---|---|---|
| `valid_coordinates` | position, rotation and dimensions are finite numbers of the right length | reject |
| `valid_geometry` | known type, all dimensions given and > 0, parent exists and is a group | reject |
| `minimum_dimension` | every dimension ≥ value | warning |
| `within_bounds` | bounding box inside `world.bounds` | warning |
| `object_overlap` | bounding boxes overlap, unless listed in either object's `allowed_overlap` or sharing a parent marked `interlocking` *(Q13)* | review |

- **Outcome per operation:** `accept`, `accept_with_warnings` (any warning or review), or `reject` (any reject).
- Severities and values come from the world file. The viewer has no hard-coded rules.
- Each rule is one small function `check(op, model, world) → [{rule, severity, message, uuids}]`, so new rules plug in without touching the others.
- Results show in a panel, and the affected objects are outlined in the viewer (amber for warning or review, red for reject).

## 6. Viewer engine (Three.js)

| Feature | MVP behaviour |
|---|---|
| Orbit / pan / zoom | OrbitControls. Mouse, trackpad and touch |
| Cameras | perspective ⇄ orthographic. Views: top, front, side, iso |
| Display | solid · wireframe · solid + edges · "textured" (material colours) *(Q9)* |
| Lights | ambient + one sun. On/off, intensity, sun angle |
| Hierarchy | tree of groups and objects: select, hide, isolate, show all |
| Selection | click in the scene or the tree. Properties panel shows the object's JSON (read-only in v0.2) |
| Section | section box with six faces dragged by sliders *(Q20)* |
| Walk | first-person, eye height 1600 mm *(Q19)* |
| Measure | click two points to read the distance *(Q21)* |
| Export | PNG screenshot of the current view |
| Grid & axes | ground grid in mm, axis triad (Z up) |

Axis conversion happens in one place (`viewer/axes.js`): model Z-up → Three.js Y-up.

## 7. Input and storage

- **Form** *(Q16a)*: pick a type, enter name, dimensions, position, rotation, material and parent → produces an `add` or `modify` operation.
- **Paste operations** *(Q16c)*: a JSON box accepts one operation or a list. Each one is checked, applied or rejected, and the results are shown. This is where an LLM's output plugs in.
- **Files** *(Q17)*: open or save a bundle (`model.json` + `history.json` + `world.json`, or one combined `.make3d.json`). Sample models load from `models/`. The last session autosaves to localStorage.
- No server, no database.

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

## 9. Folder layout (planned)

```
03 Projects/Make 3D/
  index.html           page shell
  css/app.css
  js/
    core/schema.js     defaults, validation of file shape, uuid
    core/geometry.js   apply ops, replay history → model (no DOM)
    core/rules.js      rule functions + runner (no DOM)
    core/io.js         open/save bundles, localStorage
    viewer/axes.js     Z-up → Y-up
    viewer/scene.js    model → Three.js objects
    viewer/controls.js orbit, walk, section, measure
    ui/*.js            hierarchy, properties, forms, history bar, rules panel
    app.js
  vendor/three/        local copy of Three.js + addons (Q18)
  models/              samples: table, brick, wall (Q3), each with model/history/world
  worlds/default-world.json
  tools/               node tests: test_geometry.js, test_rules.js, smoke.js
  schematic.md · todo.md · CLAUDE.md · convo/
```

## 10. Roadmap

| Version | Deliverable | Done when |
|---|---|---|
| v0.1 | Load JSON and render primitives | sample table renders from `models/` |
| v0.2 | Interactive viewer | every row of §6 works on desktop |
| v0.3 | Add, modify, delete objects | form + paste box create operations |
| v0.4 | Save and reload | round-trip with no loss, unknown fields kept |
| v0.5 | World rules and validation | the five rules, results panel, outlines |
| v0.6 | Append instructions + history | history scrubber, replay = saved model |
| — | **MVP line** *(Q22)* | |
| v0.7 | Import external geometry | glTF/OBJ/STL as `mesh` objects |
| v0.8 | Three-view drawing interpretation | §11 |

## 11. Later: drawing → model (not in MVP)

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
