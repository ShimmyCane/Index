# Felix Maze — To-do

## Goals

1. **A bank of 200 puzzles** with a bell curve of difficulty around level 2.5, a mix of every theme, and every one passing the checks. Built in four batches of 50.
2. **Never an answer line on a wall.** Every puzzle passes the geometry check and the pixel check before it is published; the ones that don't go to rework, not into the bank.
3. **Joy first.** White space, a story from start to goal, something to find on the way (`rubric.md`).
4. **Print with confidence.** A pack of 10, double-sided, comes out the right way up.
5. **Learn Felix's sweet spot.** Faces on each sheet; the level he enjoys sets the puzzle of the day and the packs.

## Level plan for the 200 (mean ≈ 2.5)

| Level | Share | Of 200 | Per batch of 50 |
|---|---|---|---|
| 1 | 20% | 40 | 10 |
| 2 | 35% | 70 | 17–18 |
| 3 | 28% | 56 | 14 |
| 4 | 12% | 24 | 6 |
| 5 | 5% | 10 | 2–3 |

## Done

- [x] Inspirations (100), research, variations, rubric, qc, catalog numbering, characters
- [x] MVP: ten sheets, library, sheet view, answers animation, print all, doodle → spring → summer
- [x] Answer-line check (geometry) and pixel check (`verify_raster.js`); bridges draw over the answer where it goes under
- [x] Levels 1–5, recalibrated on Jimmy's level-2 reference; computer level guess; joy scores
- [x] 🚩 Flag, rework page, flags in the database (`fmz_flags` live), `fix_puzzles` skill
- [x] ⭐ Puzzle of the day, 🏆 top five, 🖨️ pack of 10 with duplex handling and a test sheet

## Batches (50 each, counters in hex but numbered in tens: 1–50 = 001–032)

Each batch: generate → answer-line check first (failures to `data/rework.js`) → pixel check → level fit → joy rank → by-eye QC (`qc.md`) → scores → fingerprints → commit.

- [x] **Batch 1** — #001–#032 (the ten + 40 new)
- [x] **Batch 2** — #033–#064
- [x] **Batch 3** — #065–#096
- [x] **Batch 4** — #097–#0C8
- [ ] After all four: rework list (8 designs, see `data/rework.js`) reviewed with `fix_puzzles`. Result: 192 puzzles, levels 1–5 = 40/70/55/21/6, mean 2.39 (plan 2.5), 0.03% of tries touched a wall. Long footers now wrap to two lines.

## Now

- [ ] Jimmy prints a pack (try the 🧪 test sheet first) and tries a few with Felix: path width, time per level, which styles he likes
- [ ] Jimmy answers `convo/convo v0.4.md`
- [ ] **Quality-control pass on paper** (`qc.md`): sensitive shapes or risky images in walls, swirls and doodle overlays

## Next

- [ ] Supabase: apply `001_felix_maze.sql` (mazes, doodles, characters) when baked doodle mazes should sync across devices; keep this device + `data/catalog.js` as fallbacks
- [ ] Publish button in the library for doodle mazes (needs the database)
- [ ] More styles from `inspirations.md` beyond the first 200
- [ ] True organic mazes (curve growth, Pedersen–Singh) once the papers are read
- [ ] Carry the library improvements back to the Detail Library (tag groups, any-within / all-across, lazy pictures)
- [ ] Save copies of sources to `research/private/` (blocked: network policy denied the paper hosts)

## Back pocket (interactive, not now)

- [ ] Finger-trace on iPad, with a trail and Undo
- [ ] Web Audio sounds: footsteps, a chime at the goal
- [ ] Moving parts: rotating rings, bridges that raise, doors that open with a key
- [ ] Two-player race on one screen
- [ ] Color versions for screen
