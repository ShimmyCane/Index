# Athena's world — Schematic

**Status:** V2 (2.0.0): Home decor is a 3-D world. Not yet device-tested on iPad.
**Owner:** Jimmy
**Platform:** iPad web app, landscape first (portrait stacks the room above the buttons)
**Conversations:** `convo/convo v0.1.md` (questions), `convo/convo v0.2.md` (visibility answers), `convo/convo v0.3.md` (purpose, MVP, assumptions), `convo/convo v0.4.md` (five houses, ready pop-up, open questions)

## Purpose

A decorating game. Athena picks who a house or workplace is for, then decorates a blank white room with things like a bed, a window, a picture, a sofa and a plant. When a house is finished she moves on to the next one.

## How it plays

- **Left:** the white room. Walls above the line, floor below. A line of hint text sits above it.
- **Right:** "Who is it for?" buttons (locked houses show 🔒, finished ones ⭐). Under it, "Decorate" buttons for the things the chosen house needs (✓ once placed), then ↩️ Undo.
- **Gear ⚙️ (lower right):** sound on or off, and "Empty this house".
- **Placing:** tap a decoration and it appears up top. Tap the room and it moves there straight away. Tap a placed thing to pick it up, tap the room to move it, or tap it again to put it down where it is.
- **Wall things (window, picture)** stay on the wall. **Floor things (bed, sofa, plant)** stay on the floor.
- **Finishing:** when all the listed things are placed, a celebration card appears and the next house unlocks.
- **Five houses** (v0.4.0): Athena's cottage 🏡, Beach hut 🏖️, Treehouse 🌳, City flat 🏙️, Farmhouse 🚜. Each has its own list of things. The workplace shop is no longer a house.
- **Ready pop-up:** after the fifth house, "Are you ready for the next experience?" **Yes** opens Retail therapy (a placeholder screen for now). **Not yet** shows a **Replay** button, which starts again at the first house. Everything decorated stays.
- **Assets** are emoji only (no image files): 4 wall things and 10 floor things, listed in the script.

## Settings, notes and version

- **⚙️ (lower right)** opens the Settings drawer: Sound on or off, "Empty this house", Show errors, Notes for improvement, and About (version and changelog). Follows `02 Refs/Skills/settings_gear.md`.
- **Show errors** is off by default. Errors are always recorded, and turning the switch on shows the bottom panel with any that already happened.
- **Notes for improvement** save on this device only, under `athena.notes`. Each note records the house and the thing picked (for example "Athena's house · bed"), the time and the version. Copy notes puts them on the clipboard. Nothing is sent anywhere. Follows `02 Refs/Skills/feedback_notes.md`.
- **Version** is `VERSION` at the top of the script. Add a line to the changelog in the drawer when it changes.
- **Family sign-in:** the drawer has the family email and password. Signed in, the saved game (unlocked houses and rooms) and the notes go to the Family project's database (`athena_saves`, `athena_notes`). Signed out, everything stays on this device.
- **Sync pill** (top of the play area): `💾 this device`, `☁️ synced`, `☁️ syncing…`, `⚠️ check`. Check database lists each table in the drawer.
- Settings are kept on the device only. The publishable key is in the script; the service-role key is never used.
- The SQL lives in `supabase/`: `test_001` (rolled back, run first), `001_athena_family` (the tables), `verify_001` (read-only, paste the result back). Applied to the Family project on 2026-11-08.

## V2: the 3-D home (2.0.0)

- **V1 is archived** in `v1/` (index.html and content.js as they were) and opens from ⚙️ → Versions. V1 and V2 share credits, the bag, trips, jobs and answers. Each keeps its own houses: V2 saves under `world` in the save data, V1 keeps `rooms` and `unlocked`. Each version keeps the other's fields when it saves.
- **The world:** a cut-away room (10 × 10, walls 5 high) on a little island, drawn with Three.js (r128, vendored in `lib/`, classic scripts so a double-click works). Orthographic camera at an isometric angle.
- **Turning:** drag to turn the world, drag up or down to tip it, pinch (or the mouse wheel) to zoom. Buttons on the scene: ⟲ ⟳ ➕ ➖ 🎯 (back to the first view).
- **Cut-away:** the two walls nearest the camera drop to a low stub, so you always see in, from any side. Things hung on a dropped wall hide with it. Scenery between the camera and the room (trees, the barn) sinks out of the way.
- **Placing:** pick a thing and it floats above the room. Tap the floor (floor things) or a standing wall (wall things) and it drops in with a squash and bounce. Tap a placed thing to pick it up; tap it again to put it down. 🔄 Turn it round turns a floor thing a quarter.
- **Houses (worlds):** Athena's cottage (garden, trees, fence), Farmhouse (with the barn and silo outside), The barn (inside the barn, the farmhouse outside), City apartment (a room on a building roof, neighbours around), Tall tower (top of a tall tower among clouds). Beach hut and Treehouse stay in V1.
- **Things** are chunky cartoon 3-D models built from boxes, balls, cylinders and cones with dark outlines and three flat tones (`models.js`). Sizes are exaggerated on purpose (the big fat mushroom). Buttons show a small picture of each model.
- **New things to buy:** beds (bunk bed, canopy bed, race car bed, hay bed) at the Furniture shop; mushrooms (glow mushroom at the Korean grocery, tall mushroom and mushroom trio at the Garden centre, mushroom stool at the Toy shop); hay bale at the Garden centre.
- **Front page** shows a 3-D picture of the current house.
- Without WebGL the room shows a message and a link to V1.

## Start and cheat mode (v0.9.0)

- A new game starts with 50 credits. Saves from before this version also get the 50 once.
- ⚙️ settings has Cheat mode: 🪙 Add 50 credits, each press.

## The three MVPs (v0.8.0)

- **Learning center:** the first round is about baking desserts. It has 30 questions, 41 points in all: 25 core questions (1 point each), 3 bonus questions (2 points each, harder), and 2 challenge questions (5 points each, where you put several facts together). Questions are multiple choice or true/false, in the Test Bank's JSON shape (`bank/desserts_round1.json`, loaded into `content.js`). A right answer on the first try earns its full points as credits; a right answer after a wrong try earns half, rounded up. Credits show as 🪙 on the front page and in every level.
- **Retail therapy:** 12 shops (`SHOPS` in `content.js`), each selling things by id with a price. Buying puts the thing in the bag, so it becomes a decorate button in every house. A trip home needs every shop visited and 20 credits spent (`TRIP`). Shop names are generic until Jimmy answers convo v0.5.
- **Get a job:** the job board holds all 37 jobs (`JOBS`, from `jobs.md`). Architect, Pilot and Artist have full steps (`JOB_STEPS`): two learn pages, a three-question quiz, a scenario to ask a real worker (with choices and a sentence starter, saved as the answer), a first-pass task, then Hired ⭐. The other 34 show their card; their steps come later.
- Saved on the device, and in `athena_saves` when signed in: credits, the trip, hired jobs, and the challenge answers.

## Front page (v0.7.0)

- The front page is the landing screen. On the left, a small read-only picture of the current house (the home room as it is now). On the right, the sections as tabs: Home decor, Learning center, Retail therapy, Get a job, then Family life, Making friends, Exploring the world (coming soon).
- Home decor opens the full room. The side panel's bottom button, 🏠 Front page, brings you back. Other sections open their own screen with 🏠 Back to front page.
- The sync pill sits at the top of every screen.

## The bag (v0.6.0)

- Things bought in the shops go into the bag with `addToBag(id)`. Each bag item becomes a decorate button in every house, and can be placed in any house.
- The house's own list comes first, then the rest of the bag.
- The bag is saved with the game (on the device, and in `athena_saves` when signed in).
- To add a new thing, add one line to `ITEMS` in the script (emoji, label, zone: `wall` or `floor`). A shop then sells it by its id.
- Example things in v0.6.0: vase 🏺, candle 🕯️, cactus 🌵, balloon 🎈 (floor); rainbow 🌈, kite 🪁 (wall).

## Levels (v0.5.0)

A level menu floats above the home room. Home is always level 1, underneath, and always reachable.

| # | Level | Opens when |
|---|-------|------------|
| 1 | Home decor | Always |
| 2 | Learning center (Test Bank) | Always, so credits can be earned |
| 3 | Retail therapy | The first house is finished |
| 4 | Get a job | All five houses are finished |
| 5 | Family life | Coming soon (locked) |
| 6 | Making friends | Coming soon (locked) |
| 7 | Exploring the world | Coming soon (locked) |

Levels 2–4 open as placeholder screens for now. Lock rules are a suggestion, see convo v0.6.

## Jobs (planned, not built)

- After the houses and the shops, Athena can **buy a job** from the job board. There are 37 jobs (see `jobs.md`).
- Flow: job board → job card → Apply → learn (two or three pages) → quiz → challenge for a real person (scaffolded scenario) → work on it (first pass) → Hired! badge.
- Each job is developed on its own later.

## Files

- `index.html` — the game (HTML, CSS, JS, Web Audio). The house list is at the top of the script.
- `models.js` — the 3-D things (`ITEMS`): emoji, label, zone (`wall` or `floor`) and a build function.
- `world3d.js` — the 3-D world: houses, scenery, cut-away walls, touch, thumbnails and the front-page picture.
- `lib/three.min.js` — Three.js r128 (MIT, licence beside it).
- `v1/` — V1, archived.
- `mockups/` — pages to see the project at a glance: `index.html` (front page with links), `project-map.html` (every file and what it is for), `game-flow.html` (the steps of play, with a picture of the room).
- `jobs.md` — the 37 jobs to explore, with the job flow.
- `convo/` — Q&A history, one file per round, never compacted (convo v0.6 holds the level plan).
- `CLAUDE.md` — pointer for Claude Code.

## Open

- Athena's age and what she can do on her own (convo v0.3, Q4).
- Whether houses and decorations should be saved between visits (Q9). Answered in code: yes, through the family sign-in.
- Whether anyone else plays (Q5).
- What comes next (Q16).
- Retail therapy and the economy: credits from questions, a shop trip of 12+ shops, going home to decorate, and buying a job (convo v0.5, planned, awaiting answers).
- What Replay should go back to (convo v0.4, Q2).

Details go in `convo/` as they are answered. Do not compact old convo files.
