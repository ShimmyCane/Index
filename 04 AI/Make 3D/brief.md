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

## V2.1 to V2.5 (2026-11-02)

Rebuilt against all three photos. Internal versions 21 to 25; scene ids `living-room-v2-1` to `living-room-v2-5`.
- **V2.1:** one window on the TV wall, at the far corner (the window beside the sofa, above the far end of the bookcase). The far wall keeps the big window behind the sofa and the narrow window by the door.
- **V2.2:** the TV stands on the near unit; the printer, plants and fans sit on the far unit top, near the corner window, as in the first photo. The boxed puzzle sits on the TV console.
- **V2.3:** the narrow window by the door has its sill at 36 in, as the big window does.
- **V2.4:** a pink chair at the near end by the bookcase.
- **V2.5:** a small floor fan by the bookcase.

Drawings: `drawings/v2-1` and `drawings/v2-5`, each with a plan, four elevations and `sheet.svg`, which stitches them on one page.

**Please check:** the TV's position (near unit in V2.2, far unit in V16) is the main conflict between the photos. Sizes are still estimates.

## Scene log in Supabase (2026-11-02)

Each scene version now lives as a row in `public.m3d_scene_log` (Architecture project), not only as JSON in the project folder. The row holds the history (source of truth), the rules it was checked against, the replayed model, a label (V16, V2.1) and a note. Edit a note or label with an UPDATE, with no merge and no rebuild.

- JSON files in `models/` and `js/samples.bundle.js` are build output for the viewer. Rebuild them from `tools/scenes.js` and `tools/living_room*.js`.
- Load or refresh: `node tools/push_scene_log.js` with the owner's session token (script header has the variables). `--dry-run` lists the 25 versions without network.
- Open: the table is empty until the owner runs the loader.

## Status and what is still needed (2026-11-02)

- **Done:** V01 to V16 and V2.1 to V2.5 built, drawn and merged (#40, #41). Scene log table live, with the upload button in the app (#43, #45). Lessons consolidated in `04 AI/lessons_pool.md`.
- **Needs Jimmy:** (1) check the room sizes (156 × 216 in, 14 in cubes, 96 in ceiling); (2) the TV position conflict between the photos (near unit in V2.2, far unit in V16); (3) sign in on the iPad and tap **Save all scenes to the log**, then confirm 25 rows appear.
- **Not acted on yet:** the viewer "hide walls and ceiling" toggle (a viewer change); moving the owner's email out of the public migrations into a config row; the PR #44 loader, which the log button now makes optional.
- **Further work is not queued.** Nothing else will be done until Jimmy answers the items above or asks for a change.

## Kitchen mockup from photos (V01 to V10, 2026-11-02)

Two photos of a display kitchen (not committed). `tools/kitchen_mockup.js`, one function `defsFor(v)`, ten increments in the Library as "Kitchen mockup V01" to "V10". Layout: U of runs, back run with the stove between two tiled counters, sink run on the green left wall, return run on the right with a wood bar outside it. Sizes are visual estimates in inches.

| Version | Increment |
|---|---|
| V01 | Blockout: room shell, base runs as boxes, wood bar |
| V02 | Steel counter tops, checkered tile insets, red patches |
| V03 | Stove: oven door, drawer, handles, knobs, burners |
| V04 | Doors and drawers; fridge door at the sink run |
| V05 | Stainless backsplash, upper cabinets, wood top shelf |
| V06 | Frying pan on the backsplash, hooks |
| V07 | Wood ledge on the wood bar |
| V08 | Double sink bowls, two faucets |
| V09 | Ceiling light, yellow panel above the cabinets |
| V10 | Final pass, objects grouped into seven groups |

**Known limits:** the tile is a flat colour with a few patches, not a checker pattern (no textures in the model). Cylinders stand vertical only, so the stove knobs are spheres. Pan uses `rotation_x` 90. The sink run's position on the left wall is a reading of the photos, not a measurement.

**Version log (kitchen mockup, V01 to V11)**

| Version | Change |
|---|---|
| V01 | Blockout: room shell, base runs as boxes, wood bar |
| V02 | Steel counter tops, checkered tile insets, red patches |
| V03 | Stove: oven door, drawer, handles, knobs, burners |
| V04 | Doors and drawers; fridge door at the sink run |
| V05 | Stainless backsplash, upper cabinets, wood top shelf |
| V06 | Frying pan on the backsplash, hooks |
| V07 | Wood ledge on the wood bar |
| V08 | Double sink bowls, two faucets |
| V09 | Ceiling light, yellow panel above the cabinets |
| V10 | Final pass, objects grouped into seven groups |
| V11 | Left door of the back run becomes an open bay with two wood shelves (first photo). Layout unchanged |

V01 to V10 are unchanged by V11 (checked: their generated files do not change). The Library lists all eleven. The version log is also in each scene's description.

## Adventure Coaster Park (2026-11-02, research mode)

- **Subject:** a family theme park with one adventure roller coaster. Ten increments, V01 to V10, capacity from 250 to 1,000 persons an hour.
- **Mode:** research (outside spec figures and capacity formula). Sources and disagreements: `research/adventure_park.md`.
- **Build:** `03 Projects/Make 3D/tools/adventure_park.js`, one `defsFor(v)`, feet converted to inches. World: `worlds/adventure-park-world.json` (bounds ±360 by ±240 ft, 120 ft high), because the default world is only 40 ft across.
- **Ladder:** V01 250 (Pip's kiddie coaster), V02 350 (Bumble River), V03 450 (teacups), V04 450 safety, V05 850 (Thunder Trail), V06 850 safety, V07 1,000 (Splash Falls), V08 to V10 1,000 (fineness, safety check, finish).
- **Checks run:** build: 10 scenes accept with 0 issues; `tests/test_core.js` passes; ten renders checked (V01, V05, V07, V10 by eye in detail).
- **Viewer:** `Increment Viewer/data/adventure_park.js`, in the drop-down.
- **Open for Jimmy:** (1) Thunder's 60 ft lift is above the traveller-guide examples; 50 ft would fit. (2) Keep the step-by-step ladder, or spread the 1,000 target over V05 to V10. (3) The default camera does not frame the whole park; a fit-to-park view is needed. (4) Is a real ASTM or EN review wanted before any figure is treated as a design?

## Animation, round 7 (2026-11-02)

- **Decisions (convo v0.7):** motion is a separate file (`motion.json`, `make3d.motion/0.1`); every animation is a loop; autoplay twice, then pause; tap-to-start and chained motions are future (door opens, then the cuckoo comes out). Two-finger pinch zoom on the canvas.
- **Built:** `js/core/motion.js` (`poseAt`, `checkMotion`, `motionBox`; kinds path, swing, bob, slide, spin). The viewer now makes a node per object with children inside their group, applies the pose each frame, redraws only while playing or touched, and frames the whole motion. Play bar under the scene; speed and autoplay in ⚙️. Pinch zoom by touch events (one finger orbits, a tap selects).
- **Test scene:** robot with a banana (`tools/robot_banana.js`, `models/robot-banana/`): 62 parts, nine motions, an 18 s loop round a winding closed path of stepping stones.
- **Checks:** `node tests/test_motion.js` (12 groups), `node tools/anim_check.js <dir>`; the existing tests and the smoke run still pass.
- **Open:** Jimmy checks on iPad (walk, pinch). Next: clash check over time (A6), frame strips for the Increment Viewer (A7). The make-3d skill has a motion step (A8, done when Jimmy asked). The Library folds versions by project, newest first.

## Adventure Coaster Park, compact and animated (V11 to V15, 2026-11-02)

- **Build:** `03 Projects/Make 3D/tools/adventure_park_compact.js` (`defsFor(v)` and `motionFor(v, uuid)`), scenes V11 to V15 in the Library under "Adventure park". Renders in `renders/adventure_park_compact/`. Review page `viewer.html?set=adventure_park_compact`.
- **Ladder:** V11 compact footprint (about 300 by 250 ft, was 600 by 400), Thunder Trail lift lowered to 50 ft; V12 Pip and Thunder cars run their tracks; V13 teacups spin, Bumble boats slide, Splash boats bob; V14 Sky Wheel turns (show ride, not counted in capacity), flags wave, balloons bob; V15 plaza fountain wave, so every ride moves.
- **Motion:** one loop of 24 s per version, autoplay twice. Path motions use the car centre (rail + 2 ft) and `M.pathAt` for the second car's start. Checks: `build_samples` motion check accepts each file, `tests/test_motion.js` passes, poses are finite.
- **Open for Jimmy:** (1) Does the Sky Wheel count toward capacity? (2) Keep the 50 ft lift, or go back to 60 ft? (3) Cars move on a smoothed curve through the track points, so they can sit a little off the rails; a straight-segment path would fix that but look less smooth. (4) Motion uses the browser's play bar; the Increment Viewer shows renders only, not the motion.

## Curves, physics speeds, shareable model link (2026-11-02)

- **Curves:** the rails and cars follow a Catmull-Rom spline through the plan points (about 10 ft between samples). Rails are short straight pieces, so the curve reads smooth.
- **Physics (feet, seconds, real time):** the chain lift pulls at 6 ft/s; past the top, energy gives v² = 6² + 2g(zTop − z) − 2·0.015·g·distance (g = 32.2 ft/s², rolling and air resistance 0.015 of g). Thunder Trail: 60 ft lift, top speed about 40 mph, lap about 18 s. Splash Falls boats: lift at 6 ft/s, drop into the pool, top about 28 mph, then a conveyor at 4 ft/s back to the start. Pip runs at a steady speed.
- **Engine change:** `js/core/motion.js` takes an optional `profile` on a path: [[t, s], …] from [0, 0] to [1, 1], mapping loop time to distance along the path. Validated by `checkMotion`; `warpTime` is exported.
- **Shareable link:** `index.html?model=<sample id>` loads that model (it wins over the saved copy). Loading a sample from the picker updates the address. Checked in headless Chromium.
- **Changed in place:** V11 to V15 are rebuilt (60 ft lift, curves, physics). Git keeps the previous merged versions.
- **Open for Jimmy:** (1) the coaster's 40 mph top speed fits the family-coaster range the traveller guides give; keep it or push the drop higher? (2) Splash boats stay level on the slope (they don't pitch); add pitch? (3) the Sky Wheel is still a show ride, not counted.

## Cars on the slope, faster rides, life in the park (V11 to V16, 2026-11-02)

- **Cars flying off the track:** cars turned only in the flat plane, so on the steep drops they stuck out into the air. Now they pitch with the slope: the motion engine has `face: "tangent3d"` (yaw about Z, pitch about Y) with `rest_yaw_deg` and `rest_pitch_deg`. Checked: the car's forward direction matches the track tangent at every point (0° error); the rest pose is the identity at the start.
- **Speed:** the people's loop stays at about 18 s. The rides run for 80% of it and wait at the station for the last 20% (`RIDE_FRAC = 0.8`). That is 1.25× faster than the physical ride (top speed about 40 mph in real time, about 50 mph in the animation). Pip uses the same timing.
- **Steepest slope:** about 80° on the coaster's first drop. Steeper than typical family coasters; open for Jimmy whether to soften it.
- **V16 life in the park:** visitors in and out of the gate (80 ft loop, about 4.4 ft/s) and round the plaza (14 ft ring, about 4.9 ft/s), four vendor stalls with keepers, five birds on a 3-D loop (about 31 ft/s) with a wing-beat bob, three free balloons.
- **Open:** (1) keep the 80° drop, or soften it? (2) keep the ride speed at 1.25× or go back to real time?

## Hawk: closed skeleton meshes (2026-11-02, research mode)

- **Request (Jimmy):** a hawk looping around and diving down before picking back up. Move beyond polygon extrusions to **closed meshes set up with a line** (a skeleton), so animation is more realistic; use **thin double-sided meshes** for leaves, grass and flags. Log it in the lessons. Merge.
- **Mode:** research. Sizes and sources in `research/hawk.md` (Cornell Lab: 17.7 to 25.6 in long, 44.9 to 52.4 in wingspan).
- **Engine (new):** types `loft` (closed) and `sheet` (open, double sided) with a `shape` (joints, facing, rings); `attach` to a joint; motion kind `bend`; `keys`, `envelope`; `face: "flight"`. Schematic §15. Code in `js/core/mesh.js`, `js/core/motion.js`; viewer builds a geometry per part and moves vertices each frame.
- **Build:** `tools/hawk.js`, one `defsFor(v)`, six increments; scenes `hawk-v01` to `hawk-v06`; library project "Hawk". Renders `renders/hawk/`. Review page `viewer.html?set=hawk`.

| Version | Increment |
|---|---|
| V01 | Blockout: body, tail and two wings as closed meshes on straight skeleton lines |
| V02 | Wings with shoulder, elbow, wrist and tip; five-joint body; tail rides the rump joint |
| V03 | Beak, eyes, legs and feet riding body joints |
| V04 | Meadow: 120 grass blades and 6 leaves (double-sided sheets), pennant flag, mouse |
| V05 | Cream breast, eye ridges, smaller eyes set lower |
| V06 | Motion: 23 s loop of circling, stoop, flare, skim and climb; wings bend, head dips, legs drop, grass and flag move |

- **Checks run:** build (six scenes accept, 0 issues); `tests/test_mesh.js` 14 groups (closed meshes, FK bends, keys, rest pose, loop closes, frame is a rotation, lowest point 4.9 in, wings tuck from 49 in to about 3 in); `test_core`, `test_motion`, `test_ifc`, `test_cloud`, `smoke`, `anim_check` still pass; older scenes' generated files unchanged.
- **Open for Jimmy:** (1) "looping around" was built as circling the meadow, then a stoop. Did you mean a vertical loop-the-loop? The flight frame can do one if the up-axis floor is lifted. (2) The talons skim 3.4 in above the mouse rather than touching it. (3) The loop is slow (about 43 in/s at the bottom) so the wing bends can be read. (4) IFC export skips lofts and sheets. (5) Check on iPad (play bar, pinch, speed).

## Grand Ocean Aquarium (2026-11-02)

- **Subject:** a large imagined public aquarium, in the style of the California Science Center kelp tank (Los Angeles): 100 x 60 ft tank, 28 ft deep, a 100 ft round acrylic walk-through tunnel along the floor, a front viewing gallery, entry lobby, exit hall and a pool deck. Sharks, large fish, schools of small fish, kelp and reef plants. Tap an animal to read its name and description.
- **Mode:** research. Sources and estimates in `04 AI/Make 3D/research/aquarium.md` (CSC kelp tank about 188,000 gallons and a 24 ft tunnel; Georgia Aquarium 100 ft tunnel; sand tiger, zebra and bonnethead shark sizes). Our tank is larger than the CSC tank and its layout is an estimate. Manta ray wingspan sources disagree (26 versus 29 ft); not used.
- **Build:** `03 Projects/Make 3D/tools/aquarium.js`, one `defsFor(v)` that returns the objects and the motions. World `worlds/aquarium-world.json` (bounds ±100 by ±75 ft). Test: `tests/test_aquarium.js`. Review: Increment Viewer `?set=aquarium`.

| Version | Objects | Change |
|---|---|---|
| V01 | 102 | Blockout: tank, tunnel, lobby, exit, gallery, deck; 8 animals; 4 kelp; rocks. Still |
| V02 | 159 | Animated: swim loops, tail beats, kelp sway; 8 more animals; fins |
| V03 | 215 | Guest spaces: tunnel ribs, benches, piers, lamps, signs, rails |
| V04 | 525 | Schools (3), kelp forest, reef, moray, 12 more animals, eyes, guests walking the tunnel |
| V05 | 1,028 | 8 schools, 8 jellyfish, a diver, bubble vents, eelgrass, anemones with clownfish, urchins, stars, a crowd, deck lamps |

- **Motion:** one 60 s loop (autoplays twice), 44 motions in V02 up to 150 in V05. Swimmers follow closed organic loops that stay in the water and out of the tunnel (tested at 90 times per loop).
- **Viewer change:** taps now pass through anything with opacity under 0.4 (glass and water), so fish behind a glass wall can be picked. Other scenes are unaffected.

**Open for Jimmy:** the tunnel ribs are straight chords, not a smooth arch; rays, turtles and eels do not beat wings or flippers; fish are boxes and cones; a "hide walls" toggle would help view the gallery; tap-to-start and chained motions are still future.

### Aquarium V06: two storeys and small rooms (2026-11-02)

Jimmy asked for a tank at least two stories tall with multiple small rooms, some with a sunroom view in the low sun, and tunnels and windows where kids can see the fish swim and somewhat interact. V06 (1,178 objects) adds: 8 small rooms on two levels (Reef, Jelly, Shark, Kids' Den; Dive, Quiet, Sunroom, Lookout), kid-height round windows, 3 bubble domes into the tank, a crawl tube, a touch pool with 2 small rays, a low drifting sun with beams, stairs, and a second-floor gallery. The 28 ft tank is read as two 14 ft floors. Interpretation to confirm: "interact" is taken as bubble domes plus a touch pool; "tunnels where kids can see" as the crawl tube and low windows. Open: ramp, doors, room sizes against a child's height.

## Hawk V07: physical flight, larger loop (2026-11-02)

- **Request (Jimmy, after V06):** fly much faster; a larger loop; multiple cycles; more flapping when climbing; less diagrammatic, more real: gravity, friction, a rising air channel, a bluff.
- **Built:** V07 in the same `tools/hawk.js`, with `tools/hawk_flight.js` and `worlds/hawk-world.json` (bounds ±520 by ±420 in, 460 in high). V01 to V06 are unchanged (checked: their generated files do not change).
- **The lap (26 s):** glide, stoop onto the mouse, flared skim, flapping climb, ride the bluff updraft, then 2.5 turns up a thermal with no flapping.
- **Physics:** speed from gravity, drag (spread, tucked, flared) and flap thrust; rising air holds the soaring speed (130 in/s); thrust solved (about 100 in/s²) so the lap closes. Banking from the turn (coordinated turn, g = 150 in/s² in a world about a tenth of real size), capped at 55° and lower near the ground.
- **Numbers:** path about 3,430 in, stoop about 240 in/s at the bottom (about 1.9 times soaring speed), 62 wing beats a lap at 2.4 per second, all in the climb; thermal 2.5 turns, 120 in per turn.
- **Checks:** `tests/test_mesh.js` 26 groups (V06 and V07 rigs; speed constant in rising air; stoop energy balance within 8%; flare sheds speed; arrival at the bluff at soaring speed; flaps only when climbing; lowest point 5.3 in; nose turns under 10 rad/s). Other suites, smoke and anim_check pass.
- **Open for Jimmy:** (1) Is a tenth-scale world right, or should the hawk be scaled down inside a bigger arena? (2) The air is drawn as ribbons, not simulated. (3) Talons skim 4 in above the mouse. (4) ~~Should the mouse react?~~ Answered: Jimmy said the mouse bolts for a hole, and the hawk size is good. Done: burrow 52 in west of the mouse, bolt at about 160 in/s as the hawk flares in, hides underground, walks home before the wrap (`mouseRun` in `tools/hawk_flight.js`).

## Solar System (2026-11-02)

- Subject: Solar System, not to scale (sun, nine planets, orbit lines, asteroid belt, gas giants with bands and rings, Pluto, moons in planet views). Five increments (`tools/solar_system.js`, `solar-system-v01` to `v05`) and one view per planet (`planet-<name>`). Research note: `04 AI/Make 3D/research/solar-system.md`. Mode: research (NASA fact sheet values and a Pluto/Charon page; the live NASA table was not reachable in search, so re-check before public use).
- Linked views toolset: `js/core/linked_views.js` with the page button, zoom/fade transitions, and full screen. Schematic §16. Tests: `tests/test_linked_views.js`.
- Review set: Increment Viewer `?set=solar_system`, renders in `renders/solar-system/`.
- Open: planet views are V01 only; no retrograde spin; orbits are circles; gas-giant bands look stepped.

## Round 9: planets to V03, Earth to V10, true orbits (2026-11-02)

- Solar system V06: true orbits from JPL approximate elements for 2026-11-02, one lap of Pluto (240 s), played once, then held. Date tracker lower right. Research: `research/solar-system-true.md`.
- Planet views: V02 and V03 for the eight planets (textures, more moons). Earth V02 to V10 (continents through a second launch). Earth V10 loop is 480 s.
- Back to the Solar System is a page button (`header.links`), not an object.
- Open: positions past 2050 are extrapolated; the element values were entered from the standard table, to be checked against the JPL page; belt rocks are a fixed pattern, not real asteroids; fast spins alias at one lap per 240 s.

## Coastal Habitat Aquarium (2026-11-02)

Jimmy's note on the Grand Ocean Aquarium: it is a water tank, but "Disneyfied": about the experience of standing in it, not a volume where the plants and animals live. It should be organic and modelled. Asked for a few increments on that, then to import the marine assets and populate the new scene.

- **New subject** (the old one stays as built): `tools/habitat_aquarium.js`, four increments, test `tests/test_habitat_aquarium.js`, review `?set=habitat_aquarium`, world `aquarium-world`.
- **H01** curved, lobed outline (polar function, 40 angled glass panels), sand floor, S-shaped tunnel. **H02** rockwork (four tiers of boulders, ledges, spires, three caves, tide shelf), rolling seabed, front window with frames. **H03** kelp forest (24), eelgrass, reef, anemones, light shafts. **H04** all marine assets from `tools/aquarium.js` (species table and fish shapes; the builders are copied, deliberately, so the old versions stay untouched), 38 large animals, 11 schools, jellies, diver, critters, front gallery and tunnel guests.
- **Object counts:** 254, 615, 908, 1,710.
- **Swim loops** are rejection-sampled against the outline (distance to the wall), the S-tunnel and the floor, and tested at 90 times per loop.
- **Not carried over:** the rooms, sunroom, kids' den, bubble domes and touch pool of Grand Ocean V06. They belonged to the glass box. Open for Jimmy: where should they go (pavilions round the lobed outline?).
- **Open:** rock is made of spheres, so it looks pebbly; plain cones and slabs only help a little. Rays, turtles and eels still glide stiffly.
