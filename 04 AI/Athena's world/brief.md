# Athena's world — Brief

**Status:** level menu over the home room (v0.5.0); placeholders for levels 2–4, not yet device-tested or database-verified (see `03 Projects/Athena's world/schematic.md`).

## Goal

A decorating game for Athena. A white room, a choice of house or workplace, decoration buttons on the side, tap-to-place with tap-to-move, and the next house after each one is finished.

## Architecture

- One file: `03 Projects/Athena's world/index.html`. Inline CSS and JS, no build step, no server.
- Room items are absolutely positioned in % of the room, so they scale with the screen. They glide with a CSS transition.
- Wall items clamp to the wall zone, floor items to the floor zone. A new item appears at the top of the room (the "tray") until it is tapped into place.
- State per house: `pos` (placed items), `history` (snapshots for Undo), `done`. Only the unlocked house count is saved (`localStorage`, wrapped in try/catch).
- Sound: Web Audio oscillators, no files.

## Database

- Tables, RLS and registry: applied to the Family project on 2026-11-08 (read-only check: both tables RLS on, one policy each, anon revoked, registered under `athena`). SQL in `03 Projects/Athena's world/supabase/`.
- Offline and signed-out paths tested in headless Chromium. A signed-in run with no network shows `⚠️ check` and no crash.
- Not tested: a real family sign-in from the app.

## Verified

- Headless Chromium (Playwright): place, pick up, move, Undo, wall clamping, finishing a house shows the card, next house unlocks. No page errors.
- Screenshot of the landscape layout checked.

## Not verified

- A real iPad (Safari): touch, safe areas, `dvh` sizing, audio on first tap.
- Portrait layout.

## Assumptions to confirm (convo v0.3)

- The finish rule is "all listed things placed", with position up to Athena.
- Three houses in order, and the lists in the script.
- iPad landscape first.

## Next steps

1. Jimmy answers convo v0.3 (age, players, saving, next steps).
2. Device-test on iPad, then update the status in the schematic and the 03 projects schematic.

## v0.4.0 (2026-11-08)

- Five houses with their own things (emoji assets). Finishing all five opens the ready pop-up. Yes opens a Retail therapy placeholder; No offers Replay, which goes to the first house and keeps all progress.
- Tested headless: all five houses, pop-up after the fifth, No → Replay keeps five stars, Yes → Retail therapy and back. No page errors.
- Not verified: iPad layout with five house buttons; the real Retail therapy content (not decided, convo v0.4).

## v0.5.0 (2026-11-08)

- Level menu (dock) floats over the home room: Home decor, Learning center, Retail therapy, Get a job, then Family life, Making friends, Exploring the world (coming soon). Lock rules: learning always open; retail after the first house; jobs after all five houses.
- Tested headless: locks at start, placeholder screens, Home returns from any screen, unlocks after five houses, pop-up Yes → Retail therapy. No page errors. Dock clears the sync pill; no page-level horizontal scroll at 1180 and 390 widths.
- Not verified: iPad touch on the dock; the real content for levels 2–4.

## v0.6.0 (2026-11-08)

- Bag of bought things: `addToBag(id)` adds to the bag; bag items become decorate buttons in every house and persist with the save. Six example things added (vase, candle, cactus, balloon, rainbow, kite).
- Tested headless: bought items appear as buttons, a vase places in a house, the bag survives a reload. No page errors.
- Not yet: the shops that call `addToBag`. The shop prices and the credits are still open (convo v0.5).

## v0.7.0 (2026-11-08)

- Front page: a small read-only picture of the current house beside the sections as tabs. The always-on top menu is gone. Home decor opens the room; Front page buttons return to the front page.
- Tested headless: front page first, Home decor round trip, preview shows a placed item, locks and coming-soon tabs, back from panels. No page errors.
- Stacked on the bag branch (#131), so this PR also carries that work.
- Not verified: iPad layout of the front page.

## v0.8.0 (2026-11-08)

- MVPs of the Learning center (12 questions, credits), Retail therapy (12 generic shops, buy into the bag, trip home), and Get a job (37 listed jobs; Architect, Pilot, Artist have full steps; hired saved).
- Content lives in `content.js` (questions, shops, jobs, job steps), so it can be edited without touching the game code.
- Tested headless end to end: a full round (20 credits), 12 shops and a trip home (bag items appear as decorate buttons), and the Architect job to hired with the challenge answer saved. No page errors.
- Not verified: iPad layout; the real Test Bank (not in this repo; the Learning center uses its own questions); credit amounts and trip rules are first guesses (convo v0.5 Q4–Q5).

## Dessert round (2026-11-08)

- Learning center round 1: baking desserts. 25 core (1 pt), 3 bonus (2 pts), 2 challenge (5 pts). 41 points in all.
- Shape taken from the Test Bank repo (`ShimmyCane/Test-Bank`, `schema for test bank json.md`): array of questions with id, question_type, category, subcategory, topic, difficulty, source_authority, question_text, choices, correct_answer, explanation, traps. Only `multiple_choice` and `true_false` are used. `knowledge_node_ids` are left out, since no knowledge database exists for desserts yet.
- Tested headless: a full round of right answers scores 41 of 41; wrong-then-right scores half. No page errors.
- Not verified: iPad layout; a second round of questions.

## V2, 3-D home (2.0.0, 2026-11-09)

- V1 frozen in `03 Projects/Athena's world/v1/` (linked from ⚙️). V1 now keeps unknown save fields and unknown bag ids, so it never wipes V2 data.
- Home decor is a Three.js (r128, vendored `lib/three.min.js`) cut-away room on an island: `world3d.js` (scene, walls that drop when facing the camera, scenery that sinks when in front, drag/pinch/tap, thumbnails, snapshot) and `models.js` (37 toon models with inverted-hull outlines).
- Save: V2 rooms under `data.world` (`unlocked`, `current`, `rooms[].pos` with `{x,z,rot}` or `{wall,u,v}`); V1 fields kept in `legacy`.
- Tested headless (SwiftShader): place all four things in house 1 by tapping (floor and walls), finish card, drag to turn, pick up and move, Turn, Undo, buy a bunk bed, all five worlds render, front-page picture, V1 opens and keeps V2 data, 390-wide no horizontal scroll. No page errors.
- Not verified: iPad Safari (WebGL performance, pinch), the signed-in sync with the new `world` field.
- Open questions in convo v0.8.

## 2.1.0 (2026-11-09): players, places, outside view

- Players (`PROFILES`): Athena (`athena.save` / save_key `main`, shared with V1), Felix (`athena.save.felix` / `felix`), Guest (`athena.save.guest` / `guest`). The existing `athena_saves` policy allows any save_key, so no SQL change.
- Places (`PLACES`) hold rooms; rooms are saved by id under `data.world.rooms` (v3). 2.0.0's array is migrated by index (cottage, farmhouse, barn, apartment, tower). Unlocking is derived: the next place opens when the one before is done.
- `world3d.js` rewritten around places: several rooms per island, roofs and lifted upper floors, outside view (zoom < 0.62 or 🔭), outside-wall mounts, siding skins, two-finger pan, bigger rooms (half 8).
- Home Depot outside things and siding in `models.js`; shops renamed H Mart, Costco, Target; 37 job people in `content.js` (`JOB_PEOPLE`).
- Database check: `athena_notes` and `athena_saves` both empty on 2026-11-09.
- Tested headless: 2.0.0 save migrates, all six places draw, farm room switch, outside view, bigger room, front door placed on an outside wall by tapping, brick siding, full screen, switching players keeps games apart, job card, 390 wide no sideways scroll. No page errors.
- Not verified: iPad touch for pan and full screen; a signed-in round trip for Felix.

## 2.2.0 (2026-11-09): prices by time

- Prices re-set by time (10 credits ≈ 5 minutes ≈ two small things). Pony 5, windmill 60 with turning sails (`animate`, `loop` on the item; `World3D.frames` for the shop).
- Drawn placeholder faces for the 37 job people (`people.js`).
- Tested headless: the shop shows pictures and the windmill frames change, buying the pony leaves 45 of 50, the windmill turns in a room, all 37 faces draw. No page errors.
