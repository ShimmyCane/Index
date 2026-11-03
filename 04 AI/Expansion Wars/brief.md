# Expansion Wars — Brief (AI notes)

## Current state

- MVP built as a plain HTML/CSS/JS page in `03 Projects/Expansion Wars/`. No build step, no server, no database.
- Map: Voronoi regions. Each spot is a seed point; its region is the cell around it. Land regions that share an edge are linked by a road. Lakes are regions with no roads. Four early levels: 4, 6, 8, 10 elements (lakes included), 2 to 4 flags. Each map is checked for land connectivity before use.
- Every generated map is saved as a record (level, title, description, features, rating 1–5, plays, wins, losses, improvement notes, map geometry). Notes are logged from ⚙️ during play; saved maps are listed from ⚙️ → Saved maps.
- Storage: maps and notes are kept on this device first (`js/store.js`), then written to the Family table `xw_maps` by `js/cloud.js` once the family account signs in (⚙️ → Family database). Pulls newer copies from other devices. Progress and high scores stay on this device. Notes are rows inside `xw_maps.notes` as `{id, at, text, status}`; status is `open` or `done` (set with 'Mark done' in Saved maps). To read feedback: `select title, n->>'text', n->>'status' from public.xw_maps, jsonb_array_elements(notes) n;`. Live read verified 2026-11-03 via Supabase: 18 open notes across 13 map records, mostly Level 4 Valley duplicates. Round 3 items are built in code, but their notes are still `open` until Jimmy confirms (see `todo.md` Round 4).
- Rules: owned spots produce soldiers; sending half from a spot along a road; fights resolve on arrival; win by owning every spot.
- Computer players: Easy and Normal, both "send half of the strongest spot to the weakest linked neighbor" on a timer.

## Architecture

- `js/map.js` builds Voronoi maps and exposes `window.ExpansionMap` (levels, generation, distance).
- `js/store.js` exposes `window.XWStore` (saved maps: add, update, game result, note, rating).
- `js/game.js` holds the state, the frame loop (`step` then `render`), input (pointer events on the board), computer players and the win check.
- `js/sound.js` synthesizes tones with Web Audio. No sound files.
- Board uses a 1000 × 640 map coordinate space. Nodes are HTML divs, roads and soldier markers are SVG on the same coordinates, so the board scales with the screen.

## Verified vs. unverified

- Verified (headless Chromium, 1024 × 768): page loads with no errors; map has 30 spots and 8 lakes; 2- and 4-player starts appear; a drag to a linked spot launches soldiers and captures it; the 4-player game runs with no page errors.
- Unverified: device feel on iPad (touch dragging, sizes), balance of rates and garrisons, computer difficulty.

## Next steps

1. Jimmy answers `convo/convo v0.3.md` (round 4: five more maps, castles, city upgrade unlocks, team setup, avatars, zoom).
2. Build the five-map set once density and scrolling are answered; then confirm the round 3 notes as done.
3. Play a few games on iPad; note what feels slow, fiddly or unfair. Balance pass stays on the todo.
