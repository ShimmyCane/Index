# Paper Airplanes × A-10 Warthog — Brief

**Status (2026-11-18):** MVP 0.1.0 built and checked headless (no console errors, no horizontal scroll at 1180×820, 768×1024, 390×844; flight model tests pass). Not device-tested. Round 1 questions in `03 Projects/Paper Airplanes x A-10 Warthog/convo/convo v0.1.md`.

## Goal

A browser 2.5D pixel-art flight game, built small enough to read, so Jimmy can see how sprite games and a flight model work. Remix of the no-asset game at remix.ui8.ai/fly, a 1990s floppy A-10 flight game, and the Paper Airplanes project.

## What was read (verified and not)

- **Not read:** `remix.ui8.ai/fly`. The fetch subagent got a DNS error; a direct proxy request returned 403 (CONNECT tunnel refused). Only social-post claims are known ("No 3D engine, no polygons, 32 KB of code"). Need the host allowed or its source pasted (convo Q1).
- **A-10 game:** search did not confirm a single title. Working reading: *A-10 Tank Killer* (Dynamix, 1990). Confirm (Q2).
- **Paper Airplanes** `research/topics.md`: the four forces, lift from angle of attack, balance, trim. Used for the flight model and glider mode.

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
