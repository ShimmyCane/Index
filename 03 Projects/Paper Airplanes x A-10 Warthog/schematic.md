# Paper Airplanes × A-10 Warthog — Schematic

**Status:** MVP 0.1.0 (headless-tested; not device-tested). Track A, family play. Questions in `convo/convo v0.1.md`.
**Platform:** TypeScript source (`src/`) compiled to `js/game.js`, which the page runs. Canvas 400 × 225 internal, scaled with no smoothing. No image files, no server, no database.
**Remix:** the reference is `remix.ui8.ai/fly` (not reachable from the build container; known only from social posts: "No 3D engine, no polygons, 32 KB of code"), and a 1990s floppy A-10 flight game (probably *A-10 Tank Killer*, to confirm, Q2). Taken: the idea of a tiny game built from code, a flight that teaches the four forces, and the paper-plane lessons. Not copied: any code or art.

## Purpose

Learn how sprite games work by making one small enough to read. Fly the A-10 (or a paper glider) and see the forces that make it fly.

## Pieces

| File | What it is |
|---|---|
| `src/config.ts` | Screen size, scale (pixels per metre), palette |
| `src/sprites.ts` | Sprites as painted rectangles; the outline is added by the builder |
| `src/flight.ts` | The four forces, lift, stall, the ground (pure, testable) |
| `src/world.ts` | Ground height, seeded missions (targets, anti-aircraft guns, rings) |
| `src/game.ts` | Rules: guns, shells, hits, crash, landing, win |
| `src/render.ts` | Drawing: sky, clouds, two hill layers, ground, targets, plane, force arrows |
| `src/audio.ts` | Sounds from the Web Audio API |
| `src/main.ts` | Page: keys and touch buttons, HUD, ⚙️ drawer, errors, frame loop |
| `js/game.js` | Compiled output (committed) |
| `tools/flight_test.js` | Headless check of the flight model and mission seeds |

## Screen

- Top: score, kills, ammo, rings, hull bar.
- Scene: the plane at 30% of the width, the ground as a sage line with scrolling field stripes, two hill layers that move slower (parallax), targets on the ground, shadow under the plane.
- Readout (corner): speed in knots, height above ground, angle of attack, STALL pill.
- Message line under the scene: one plain sentence (what to do next).
- Five big buttons: ▲ nose up, ▼ nose down, − power, + power, FIRE (paper mode hides power and FIRE).
- ⚙️ lower right (family pattern).

## Rules

- **Jet:** 12 targets (tanks 2 hits, trucks 1, far targets worth double) and 4 anti-aircraft guns (quick: 6 and 2). Shells come up at the plane; each hit costs 12 hull. Crash (ground touch) or 0 hull ends the flight. All targets down = mission complete, stars from the hull.
- **Paper glider:** no engine, no gun. Start at 90 m, 40 m/s. Fly through rings (24, or 12 quick). Touching ground ends the glide ("Landed!").
- **Ammo** 240 (quick 160).

## The flight model (what the numbers mean)

- Lift = q × cl; q = 0.012 × speed²; cl = camber (0.22) + 4.5 × angle of attack (radians); past 15° (0.26 rad) lift falls away (stall).
- Drag = q × (0.06 + 0.03 × cl²). Thrust up to 6 along the nose. Weight = 9.8 (mass 1).
- The tail pulls the nose toward the flight path (stability 0.5/s), so a plane with no input drifts toward its path.
- Verified in `tools/flight_test.js`: level flight holds height with the nose; full power climbs; a steep nose stalls; a paper glider glides and lands; the ground stops the plane; the same seed gives the same mission.

## Settings (⚙️)

Flight: plane (A-10 jet / paper glider), mission (full / quick), new mission. Show: force arrows (thrust orange, lift green, drag red, weight blue; length = size). Sound. How it is built (a short explanation). Errors: opt-in, at the bottom.

## Later (not in MVP)

- A behind-the-plane view, or a real depth layer (Q5).
- Best scores per device; a feedback box (Notes for improvement) when the game is in family hands.
- More targets and sprites (the sprite list is the easy part to extend).
- Link to the Paper Airplanes sheets (Q4).
