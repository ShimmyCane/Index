# Paper Airplanes × A-10 Warthog — Schematic

**Status:** MVP 0.2 (chase view; headless-tested; not device-tested). Track A, family play. Questions and answers: `convo/convo v0.1.md` to `convo v0.3.md`.
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

## Later (not in this version)

- The plane drawn as stacked slices (the reference's look). The current plane is a flat rear-view sprite.
- Imported models (Jimmy: "eventually").
- Loop and missile actions in the lower right, as the controls skill allows.
- A feedback box (Notes for improvement) once the game is in family hands.
