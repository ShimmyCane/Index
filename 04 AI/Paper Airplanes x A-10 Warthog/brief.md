# Paper Airplanes × A-10 Warthog — Brief

**Status (2026-11-18):** MVP 0.2.0 (chase view, free play, drag or joystick steering, FIRE/BOOST, gear fade) built after convo v0.3. Earlier: MVP 0.1.0 built and checked headless (no console errors, no horizontal scroll at 1180×820, 768×1024, 390×844; flight model tests pass). Not device-tested. Round 1 questions in `03 Projects/Paper Airplanes x A-10 Warthog/convo/convo v0.1.md`.

## Goal

A browser 2.5D pixel-art flight game, built small enough to read, so Jimmy can see how sprite games and a flight model work. Remix of the no-asset game at remix.ui8.ai/fly, a 1990s floppy A-10 flight game, and the Paper Airplanes project.

## What was read (verified and not)

- **Not read:** `remix.ui8.ai/fly`. The fetch subagent got a DNS error; a direct proxy request returned 403 (CONNECT tunnel refused). Only social-post claims are known ("No 3D engine, no polygons, 32 KB of code"). Need the host allowed or its source pasted (convo Q1).
- **A-10 game:** search did not confirm a single title. Working reading: *A-10 Tank Killer* (Dynamix, 1990). Confirm (Q2).
- **Paper Airplanes** `research/topics.md`: the four forces, lift from angle of attack, balance, trim. Used for the flight model and glider mode.

## Reference found (2026-11-18, convo v0.2)

- Repo: https://github.com/LeePillWoo/sprite-stack-fighter. A sprite-stacked jet dogfight, one HTML file, Canvas 2D, views top-down / chase / cockpit. README credits UI8 Forge (https://remix.ui8.ai/fly) as the reference for a new implementation. No licence found, so no code or art is copied. Not confirmed: the 32 KB figure, the 2.1 M views, the roguelite and flight-sim remixes (no sources found).

## Decisions (see schematic)

- TypeScript source compiled to a committed `js/game.js`; the page needs no build. TypeScript pinned at 5.6.3 (`package.json`, dev only). Global `tsc` v6 rejects `outFile`, so use `npx tsc`.
- Sprites are painted rectangles with an auto outline; no images.
- Lift has a camber term (0.22). Without it, a plane with no input sank: the stability term pulled the nose onto the path and lift was zero.
- Flight tests use a trim controller, not a player: they check the model, not the feel. The feel is for Jimmy on a device.
- Hits are side-on; "far" targets are half-size and higher, which is depth by shading, not a real depth axis.

## Checks run

- `node tools/flight_test.js` (via `npm test`): 11 checks pass.
- Playwright (Chromium, file://): firing, flying, ⚙️ drawer, switch to paper glider; zero console or page errors at three sizes; no horizontal scroll. Screenshots reviewed: sprites, HUD, force-free view, drawer. Fixed: "New mission" button overflowed the drawer.

## Not verified

- A real iPad (touch on the five buttons, pinch, the bottom errors panel).
- Balance of difficulty by a real player (targets, shells, ammo).
- The drawer's force arrows (rendered only in a screenshot with the setting off).

## Round 2 (convo v0.3)

- Rebuilt for chase view: 3-D position (X, Z, h) with heading; perspective checkerboard ground; rear-view A-10 and paper glider sprites; free-play targets that keep coming; glider rings across the heading.
- Controls per `game-controls`: drag from the centre (default), joystick lower left (setting), FIRE and BOOST lower right, ⚙️ upper right and faded (jet view).
- Checks: `npm test` (7 groups, incl. turning); Playwright at 1180×820 and 390×844: drag climbs (12 → 43 m), joystick shows, gear fades after 2 s and returns on an upper-right tap, glider view renders, no console errors, no horizontal scroll.
- Not verified: a real iPad touch; difficulty; the flat plane sprite (stacking not built yet).

## Round 3 (convo v0.4)

- Added the phases shown by the reference as new code: camera views (chase, top-down, cockpit), a homing missile, ejection with a parachute, a first-run tutorial.
- Declined: copying fighter-jet-eject's code or sounds, and broadening its licence. That repo is UI8's work with no licence; nothing from it is in the repo.
- Checks: `npm test` (19 checks, incl. missile lock and eject); Playwright views, tutorial, missile label, no console errors.

## Round 4 (convo v0.5)

- Added: family sign-in (publishable key; flights not saved yet), radar, missile stock with auto reload, gun modes (straight vs depressed), safe flight floor, invincibility, first world iteration (15 kinds, sea, biomes, `src/assets/`).
- Checks: 26 flight and rule checks (`npm test`); browser: no page errors; sign-in with a wrong password gives a plain 401 message.
- Known: the HUD is limited to half the screen width so it wraps before the speed readout.
- Next: art iterations 2–3, moving aircraft and ships, railway and roads, saving flights (needs a table SQL and Jimmy's paste).

## Round 5 (convo v0.6)

- Added: notes for improvement (numbered, status, sort, identifier index, copy); closer and larger ground things; general notes SQL (not applied); feedback_notes and settings_gear skills updated.
- Checks: 31 checks (`npm test`); browser: notes save, status change, sort; no page errors.
- Next: sending notes to the general table when signed in (after the SQL is applied); close-up sprite drawings.

## Round 5 (convo v0.7)

- Added: moving vehicles on the road, enemy fighters in waves (about every minute), allied orbiting fighters, lakes, forests, a striped road, clouds, pause while settings are open, four sound sliders with a soft melody, limited and recharging gun ammo, damage marks, and a blink-and-carry-on after a loss (score kept).
- Checks: `npm test` (all pass, incl. pause, ammo, waves, allies, damage marks, blink); browser: pause holds the clock, sliders update, no page errors.
- Open: Q10–Q15 and Q18–Q19 in `convo/convo v0.7.md`.
