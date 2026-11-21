# Paper Airplanes × A-10 Warthog — Schematic

**Status:** MVP 0.7 (round 6: two modes, targeting with lock time, enemy missiles with a tag and collapsing ring, tight-turn break, chaff, mission objectives and resupply, wisps, dust, flame, stacked plane sized 25–33%. Earlier: round 5: moving vehicles, enemy fighters in waves, allied fighters, lakes, forests, road stripes, clouds, pause while settings are open, four sound sliders, limited recharging ammo, damage marks, blink and carry on. Earlier: round 4: notes for improvement with identifiers and an index, closer and larger things; round 3: family sign-in, radar, missile stock and auto reload, gun modes, safe flight, invincibility, a first world of 15 kinds of target and sea; headless-tested; not device-tested). Questions: `convo/convo v0.5.md`. Track A, family play. Questions and answers: `convo/convo v0.1.md` to `convo v0.3.md`.
**Platform:** TypeScript source (`src/`) compiled to `js/game.js`, which the page runs. Canvas 400 × 225 internal, scaled with no smoothing. No image files, no server, no database.
**Remix:** taken from fighter-jet-eject (a standalone export of the UI8 Forge fighter; no licence file; not copied): the sprite-stacked look as a goal, and the chase camera. From the 1990s A-10 Tank Killer (Jimmy's reference): free play, shooting ground targets. From Paper Airplanes: the four forces, and a paper glider mode.

## Purpose

Learn how a sprite game is made by building a small one: a chase view, a flight that follows the four forces, and controls a child can use on an iPad.

## Pieces

| File | What it is |
|---|---|
| `src/config.ts` | Screen size, scale, palette |
| `src/sprites.ts` | Sprites as painted rectangles; the outline is added by the builder. Rear-view A-10 and paper glider |
| `src/flight.ts` | The four forces, lift, stall, yaw (turning), bank, the ground |
| `src/world.ts` | Ground height (of X, Z), targets, glider rings |
| `src/game.ts` | Guns, shells, hits, crash and respawn, free-play targets, rings |
| `src/render.ts` | Chase camera: sky, perspective checkerboard ground, billboards, rings, the plane |
| `src/audio.ts` | Sounds from the Web Audio API |
| `src/main.ts` | Controls (drag, joystick, keys), action buttons, gear fade, HUD, drawer, errors |
| `js/game.js` | Compiled output (committed) |
| `tools/flight_test.js` | Headless checks: flight model, turning, missions |

## Chase view

- The camera sits 26 m behind and 8 m above the plane, looks down 0.2 rad, and rolls with the bank.
- The ground is a checkerboard of 40 m squares in world space, so turning turns the ground past the plane. Squares fade toward the sky with distance.
- Targets and rings are placed in world space and projected with perspective. Targets are sprites standing on the ground, larger when near.
- The plane is always at the same place on screen (72% down, centred). Its shadow shows on the ground.

## Controls (`game-controls` skill)

- **Default: drag from the middle.** Above the middle: nose up. Left of it: turn left. The further from the centre, the stronger. Keys (arrows or WASD) also steer.
- **Joystick setting:** a pad in the lower left, sized to 22% of the width (120–260 px).
- **Action buttons, lower right:** FIRE (hold) and BOOST (hold).
- **⚙️:** in the jet view it sits in the upper right and fades after two seconds; tapping the upper right corner brings it back. In the glider view it stays in the lower right.

## Rules

- **Jet (free play):** ground targets (tanks, trucks) and anti-aircraft guns appear ahead of the plane as you fly, six at a time, and more come as they are shot. No mission end. Score is shown small. Shells fly up at the plane (12 hull each). Crash or zero hull: back in the air after 2.5 s.
- **Glider:** no engine, no gun. Start at 90 m, 40 m/s. Fly through 24 rings. Touching ground ends the flight ("Landed!").

## The flight model

- Lift = q × cl; q = 0.012 × speed²; cl = camber (0.22) + 4.5 × angle of attack (radians); past 15° lift falls away (stall).
- Drag = q × (0.06 + 0.03 × cl²). Thrust up to 6 along the nose. Weight 9.8 (mass 1).
- The tail pulls the nose toward the flight path (stability 0.5/s).
- Steering turns the heading at up to 1 rad/s and banks the wings up to 0.6 rad.
- Checked in `tools/flight_test.js`: level flight holds height, full power climbs, a steep nose stalls, the glider lands, the ground stops the plane, right steering turns right.

## Settings (⚙️)

Flight: plane (A-10 jet / paper glider), steering (drag / joystick), new flight. Show: force arrows. Sound. How it is built. Errors: opt-in, at the bottom.

## Phases (0.3)

- **Views (V key or ⚙️):** chase (behind, 26 m back, 8 m up), top-down (110 m up, looking down, stays level), cockpit (canopy struts and a dark instrument panel; a horizon gauge that tilts with the bank).
- **Missile (M key or MISSILE button):** locks on to the nearest ground target within 900 m and 0.45 rad of the nose; turns toward it at up to 2.2 rad/s; 3 s reload; HUD pill shows ready or the count.
- **Ejection:** a crash throws the pilot out under a parachute (sinks at 4 m/s) for 3.5 s before the flight restarts.
- **Tutorial:** a card the first time on a device, tap to start (stored in localStorage; if storage fails it simply shows again).
- **Not copied:** no code, sounds or art from fighter-jet-eject (UI8's, unlicensed). See `convo/convo v0.4.md`.

## Later (not in this version)

- The plane drawn as stacked slices (the reference's look). The current plane is a flat rear-view sprite.
- Imported models (Jimmy: "eventually").
- Loop and missile actions in the lower right, as the controls skill allows.
- A feedback box (Notes for improvement) once the game is in family hands.

## Round 3 (0.4)

- **Family database:** sign-in in ⚙️ (publishable key only). Flights are not saved yet.
- **Radar:** top left, heading-up, 1,200 m.
- **Missiles:** six in stock; automatic reload (3 s each) or none (Safety and reload).
- **Gun:** straight when aircraft are within 900 m ahead; depressed toward ground targets within 700 m (with bullet drop).
- **Safe flight** (default on): floor at 30 m; cannot sink below 8 m.
- **Invincible:** no hull loss from shells or missiles; a crash only bounces.
- **World:** `src/assets/` holds the painters (aircraft, vehicles, buildings, naval). Biomes: sea east of 1,300 m, farm, town and army land. Targets come in clusters (army, farm, town, airfield, port, railway). Kinds and hit boxes are in `src/world.ts`.

## Round 4 (0.5)

- **Notes for improvement** (📝 in ⚙️): saved on the device, numbered N-0001…, with project, sub-project, time, item, identifiers and a status (open, done, closed). Sort by time, status or sub-project. The identifier index explains each code. Copy all notes.
- **Identifiers:** HP, TIME, ALT, SPD, AOA, VIEW, PLANE, MISS, GUN, LEFT, SCORE, SAFE, INV (in `src/notes.ts`).
- **Closer things:** near objects grow up to three times larger (inside 220 m); far ones keep at least 7 px; the largest is 150 px.
- **General notes table:** `supabase/001_gen_notes.sql` (with a rollback test). Not applied. Sending to the table is not written yet.

## Round 5 (0.6)

- **World:** moving vehicles on the road; lakes (`isLake`), forests (`isForest`), a main road with stripes (`ROAD_X`), clouds high up. The sea is east of 1,300 m.
- **Air:** enemy fighters come in a wave about every minute (setting 0–6, default 2): they turn toward the plane and fire warning shells. Allied fighters orbit (setting 0–4, default 1) and never fire; hitting one costs points; lost allies are replaced after 40 s.
- **Pause:** opening ⚙️ pauses the game and the music.
- **Sound:** four sliders (music and engine, guns, big turns, incoming warning). A soft looping melody; a rush of air on hard turns.
- **Ammo:** 240 rounds, recharging at 4 per second.
- **Damage:** a smoke mark on the wing for each hit, even when invincible.
- **A loss:** a blink, then a new flight with full health and new targets; the score is kept.
- **Assets:** `src/assets/aircraft.ts` gains the enemy fighter and the ally; `src/assets/decor.ts` holds the tree. Sizes grow when close (up to 3×).

## Round 6 (0.7)

- **Modes:** normal (limited; three hits to down; ⚙️ reload; objectives restock) and Felix (easy; never down; unlimited).
- **Targeting:** hold MISSILE ~1.2 s on a target in front to lock. CHAFF (button or C) drops two decoys.
- **Tag:** an enemy missile shows TAGGED, beeps faster as it closes, and a red ring collapses. A hard turn (held ~0.6 s) breaks its lock.
- **Graphics:** stacked-slice plane (four slices), 25–33% of the screen by turn tightness, wisps at the wing tips, a boost flame, dust near the ground, a cloud trail.
- **Not yet:** moving ships; better sprites; loop; second missile slot; a mission loading screen.

## Round 9 (0.9): a modern 2.5D look

- **Sprite stacking, for real:** every object is a voxel model (`src/assets/models.ts`), baked into layers and drawn stacked and turned to the camera (`src/voxel.ts`). The flat sprites (`src/sprites.ts`, `src/assets/*` painters) are removed.
- **Per-pixel land and sky** (`src/render.ts`): fields, towns, roads, rails, lakes, forests, coast and sea with reflections and glitter, cloud shadows, haze, a sun and mountain ridges. A field cache on an 8 m grid keeps it fast.
- **Light:** a low sun behind-left; shadows the shape of each object; fire, smoke and sparks; missile trails; tracers; lens flare; vignette.
- **Camera roll** follows 40% of the bank, the right way round.
- **Resolution** 480×270; the ground is flat (`groundAt` is 0).
- **Speed:** about 11–13 ms a frame in headless Chromium; slow devices drop to every other ground column on their own.
