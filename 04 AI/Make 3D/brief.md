# Make 3D — AI Brief

**Updated:** 2026-11-02
**Status:** MVP built (v0.1–v0.6, viewer outlines still open). Four input scenes: garden planter, outdoor table with parasol (V1), outdoor table V2 (round 4, with object tags), kitchen. Library button. Cloud: `m3d_scenes` live in the Architecture project; sign-in by email code. IFC export for Revit built (convo v0.6): gear panel button, metres, Z up, placeable elements. Not yet: Revit import check by Jimmy, editable or parametric families (future), GitHub Pages publish, real iPad check, a real sign-in test by Jimmy, Quick Detail details tagged `make 3-D`.

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
- Rotation is about X, Y and Z (Z up). The V2 bonsai is 3-D: a slanting tapered trunk, one main limb arching up in steps, foliage pads on several sides, a leader above the crown.
- Clash check: `js/core/clash.js` (tested; not in the UI). The V2 parasol now stands outside the table end.
- Bonsai reach: the crown no longer reaches over the table. Open for Jimmy.

- Confirm convo v0.3 Q1–Q6. Confirm rotation axis. Confirm history-as-truth is in place (done).
- Cloud copy needs the SQL OK.

## Next steps

1. Jimmy answers convo v0.3 and checks the page on iPad.
2. Publish to GitHub Pages once Jimmy agrees.
3. Viewer outlines for warnings and rejects; per-operation note field; cloud copy.

## Living room from a photo (2026-11-02)

Jimmy gave a photo of a family living room and a rough description. Built in ten versions, each reviewed against the photo before the next (`03 Projects/Make 3D/tools/living_room.js`, one function `defsFor(v)`):

| Version | Change after review |
|---|---|
| V01 | Blockout: room shell, bookcase, TV, plants, sofa, children's table and chairs as boxes |
| V02 | Layout mirrored in x (the first render had the TV on the wrong side). Bookcase split into eight cubbies. Window glass |
| V03 | Books in the cubbies, a basket in the bottom cubby. Door made thicker |
| V04 | Chairs with four legs and backs. Chair 2 moved to the front of the table (chairs can only face along y). Sofa with back, arms and cushions |
| V05 | Plants as leaf clusters instead of single balls |
| V06 | Table: water bottle, dark box, two puzzle sheets. Two shoes on the rug |
| V07 | White trim: window frames, baseboards, light switch |
| V08 | Boxed puzzle on the bookcase. Camera kept; door checked with a zoom-out shot |
| V09 | Door frame and round handle |
| V10 | Objects grouped (room shell, windows, TV wall, plants, children's table, floor items). Layout unchanged |

**Sizes:** visual estimates, scaled from the TV (about 56 in wide) and the bookcase (120 in, four cubes). Not measured. Room about 200 × 144 in, walls 96 in high.

**Known limits:**
- The right wall hides the door and light switch from the default camera. A zoom-out shot shows the room but not behind that wall. A "hide walls" toggle is needed in the viewer.
- Chairs can only face along y, so the photo's chairs are placed to suit.
- Sofa and plants are simplified. No textures.
- All ten versions show in the Library as "Living room V01" to "V10".

**Questions for Jimmy:**
1. Are the room sizes close? Give the TV width, the bookcase length or the room size and I will rescale.
2. Keep all ten versions in the Library, or only V10?
3. Is the table and sofa placement right?

**Privacy:** the photo is in `03 Projects/Make 3D/private/` (git-ignored) and is not committed. The committed model is approximate geometry with no personal details.

## Living room, second look (V11 to V15, 2026-11-02)

Two more photos came in (a TV wall close up, and a view from the near end of the room). They show the room is longer than the first layout, with the TV wall on a side wall. V11 redraws the room in that orientation (`tools/living_room_second_look.js`, final coordinates, no mirror). V12 to V15 are increments on it.

| Version | Change after review |
|---|---|
| V11 | Re-layout: 156 × 216 in room. TV wall on the left, sofa, big window, two narrow windows and front door on the far wall. Bookcase two units of 14 in cubes |
| V12 | Ceiling: cork tiles in a straight grid (photo's tiles are angled, rotation is Y only) and two light panels |
| V13 | Review: cork tiles hid the room from above, so they are see-through. Wall decor from the photos: red paper cut-outs and chart on the TV wall, blue poster and switch on the right wall, white frame round the door, paper lantern |
| V14 | Bookcase contents: printer, storage boxes, bags and 37 upright books with a basket. Wooden chair with a jacket near the camera |
| V15 | Final pass: leaf clusters on the plants, objects grouped into 16 groups |

**Open for Jimmy:** the second photo shows a pink chair near the camera and a fig tree in a blue pot by the door; the fig is a simplified cluster. The chairs and table are estimates. The viewer still has no wall or ceiling hide toggle, so interior checks rely on see-through materials and camera angles.

## Plans and elevations, and V16 (2026-11-02)

Drawings are generated from the model by `03 Projects/Make 3D/tools/drawings.js`, so they cannot drift from the 3-D scene: `node tools/drawings.js <model id> <dir>`. Each set has a plan and one elevation per side of the room (the walls you see standing inside facing that side). Sets are in `drawings/v10`, `drawings/v15` and `drawings/v16`.

**V16 is the merge.** It keeps the V15 layout and restores what V10 had that V15 lost:
- Window frames on every window; baseboards on the walls; the door handle.
- A window on the TV wall, near the far corner (one window, as you noted). Its position is inferred from the blinds beyond the bookcase in the second photo.
- The blue and pink fans and the boxed puzzle on the bookcase top; the water bottle, dark box, two puzzle sheets and the third wooden chair at the table.
- More books in the near unit.

**Changed on purpose:** the V10 bookcase plants cannot stay on the bookcase, because the TV console now sits on the far unit. They moved to the floor by the near end.

**Assumptions to confirm:**
1. The sofa has two windows: one behind it (the big window) and one on its left (the narrow window). The narrow window on the right of the big one is kept from the photo; you did not mention it.
2. The TV wall window sits near the far corner, behind the monstera.
3. The chairs and table are estimates.
