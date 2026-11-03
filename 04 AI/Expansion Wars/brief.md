# Expansion Wars — Brief (AI notes)

## Current state

- MVP built as a plain HTML/CSS/JS page in `03 Projects/Expansion Wars/`. No build step, no server, no database.
- Map: grid of about 27 spots (factories and cities) with lakes. Two to four flags start on spread-out factories. Each map is checked for connectivity before use.
- Rules: owned spots produce soldiers; sending half from a spot along a road; fights resolve on arrival; win by owning every spot.
- Computer players: Easy and Normal, both "send half of the strongest spot to the weakest linked neighbor" on a timer.

## Architecture

- `js/map.js` builds the map and exposes `window.ExpansionMap` (generation, distance, road checks).
- `js/game.js` holds the state, the frame loop (`step` then `render`), input (pointer events on the board), computer players and the win check.
- `js/sound.js` synthesizes tones with Web Audio. No sound files.
- Board uses a 1000 × 640 map coordinate space. Nodes are HTML divs, roads and soldier markers are SVG on the same coordinates, so the board scales with the screen.

## Verified vs. unverified

- Verified (headless Chromium, 1024 × 768): page loads with no errors; map has 30 spots and 8 lakes; 2- and 4-player starts appear; a drag to a linked spot launches soldiers and captures it; the 4-player game runs with no page errors.
- Unverified: device feel on iPad (touch dragging, sizes), balance of rates and garrisons, computer difficulty.

## Next steps

1. Jimmy answers `convo/convo v0.1.md`.
2. Play a few games on iPad; note what feels slow, fiddly or unfair.
3. Tune rates and garrisons; then add the next mechanic chosen in the convo.
