# Make 3D — AI Brief

**Updated:** 2026-11-02
**Status:** MVP built (v0.1–v0.6, viewer outlines still open). Four input scenes: garden planter, outdoor table with parasol (V1), outdoor table V2 (round 4, with object tags), kitchen. Library button. Cloud: `m3d_scenes` live in the Architecture project; sign-in by email code. Not yet: GitHub Pages publish, real iPad check, a real sign-in test by Jimmy, Quick Detail details tagged `make 3-D`.

## Goal

A structured, cumulative geometry repository with a visual inspection engine, for Jimmy and his family, used on iPad and iPhone. Three things kept apart:
- **Model**: what exists (`model.json`, objects with stable IDs; replayed from history).
- **Rules**: what is allowed (`worlds/default-world.json`).
- **Evidence**: how it was made (`history.json`, the source of truth; later `drawing.json` + `drawing.png`).

Four engines: input, geometry, rules, viewer. The viewer only reads; the engine has no DOM.

## Decisions

- Round 2 (convo v0.2): family users; iPad and iPhone, touch first; garden planter is the only MVP test model; outdoor table and kitchen are future; Y-up toggle and ground slider in the MVP; rotation about Y only; `description` per object; textures future and never stored; overlap allowed by default with a world mode; reject returns to the editor with delete-and-retry and preview; viewer MVP is orbit and zoom; cloud copy in the architecture database (`m3d_`); drawings drawn in the app; Quick Detail look; imperial units.
- Build choices (not yet confirmed by Jimmy): origin uses 25% outlier share, 70% trigger, volume-weighted origin (convo v0.3 Q1–Q3). Stored in inches (v0.3 Q4). Rotation literal about model Y.

## Architecture (as built)

- `js/core/`: units, schema, geometry (replay), origin (major box), rules, io. Pure, Node-testable.
- `js/viewer/viewer.js`: Three.js r160 classic build (vendored), custom orbit and pick.
- `js/ui/app.js`: the page. Every change goes through `applyOp`: check, record, redraw.
- `tools/build_samples.js` generates the planter and `js/samples.bundle.js`. `tools/smoke.js` runs the page headless.

## Library and cloud (2026-11-02)

- Library (lower right): built-in scenes, cloud scenes after sign-in, Quick Detail `make 3-D` references (read only, future).
- `m3d_scenes` (owner only, RLS). Quick Detail's `sketch_details` read by tag `make 3-D` (exact string).
- Only input scenes for now. LLM and drawn scenes come later, linked in as JSON.

## Open

- Object tags: a fixed set in `js/core/schema.js`. V2 is tagged; the other scenes are not yet.
- Bonsai branches are in the vertical plane only (rotation about Y). Sideways branches need rotation about X and Z.

- Confirm convo v0.3 Q1–Q6. Confirm rotation axis. Confirm history-as-truth is in place (done).
- Cloud copy needs the SQL OK.

## Next steps

1. Jimmy answers convo v0.3 and checks the page on iPad.
2. Publish to GitHub Pages once Jimmy agrees.
3. Viewer outlines for warnings and rejects; per-operation note field; cloud copy.
