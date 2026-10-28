# Felix Maze — AI Brief

**Updated:** 2026-10-28
**Status:** MVP, round 4 (flags + rework page + `fmz_flags` live, `fix_puzzles` skill, puzzle of the day, top five, duplex packs, pixel check, levels recalibrated around Jimmy's level-2 reference). Bank grows to 200 in four batches of 50. Not printed or tried with Felix yet. Open questions in `03 Projects/Felix Maze/convo/` v0.2–v0.4.

## Goal

Printed maze worksheets for Felix (US Letter landscape, black and white, "Felix Maze #code" with an "inspired by" footer) in many styles, so he doesn't settle on one idea of a maze. First 10 as a test, then toward 200 (a couple per theme), later more. Felix's own doodles grow into mazes he picks.

## Architecture

- Plain HTML/CSS/JS, no build. Pages: `index.html`, `library.html`, `sheet.html`, `answer.html`, `print.html`, `make.html`, `research/index.html`. Shared `css/app.css`.
- `js/engine.js`: cell graphs (grid, hex, polar with ring doubling), masks + keepLargest, growing tree (mix, forbid, prelink, bias, growth), braid, weave (bridges as extra under-edges), BFS solve, entrances (`side/at`, `angle`, `center`, `near`, `far`).
- `js/sheet.js`: LEVELS (cell size, mix, braid), FAMILIES, SOURCES, hex code, 10 STYLES + doodle, renderers (walls, hedge pattern stroke, double, ribbon/tunnel with chambers, subway, swirl warp, wobble), sheet layout 1100 × 850 (1/100 in).
- `js/art.js` characters and treats; `js/doodle.js` five readings × five themes (walls: proximity forbid + gaps + clear doorways; no swirl when his lines are drawn on top); `js/score.js` measures (path length, choices, traps, confusion ratio, dull stretch) → effort → level guess, and joy scores; `js/common.js` drawer, errors, bank, JPEG, Felix's log/sweet spot, `bestOf` baking.
- `FMZ.sheet.lint(model)`: samples the answer curve and checks distance to every wall polyline as drawn (plus `spec.extraWalls`).
- Bank: `data/catalog.js` recipes + device-saved recipes (`localStorage fmz.saved`). Recipe → same maze every time; `tools/check_sheets.js` fingerprints published mazes.
- Supabase SQL `supabase/001_felix_maze.sql` (fmz_mazes with generated `code`, fmz_doodles, fmz_characters, registry rows). Not applied.

## Round 4 notes

- Flags: localStorage `fmz.flags` + Supabase `fmz_flags` (live; unique (n, created_at), upsert on that key; newest `updated_at` wins). Sign-in is the family account, reusing Adventure's session on the same origin.
- `pack.html`: even number of pages, one puzzle per page; long-edge printers get the backs rotated 180° (`.rot180`), plus a 2-page test sheet.
- Counters: 001–7FF bank, 800–FFF device doodles. `retired: true` hides a puzzle but keeps its counter.
- `tools/verify_raster.js`: pixel overlap + shortcut check; bridge mazes get the ink check only; subway is skipped (the track is the path).

## Verified vs. unverified

- Verified in headless Chromium (1180 × 820): all pages load with no errors; library filters; sheet ⚙️ answer key JPEG; answer animation for `00a`; print view makes 10 Letter-landscape PDF pages with no answers; make page: two drawn strokes → 5 sprouts → pick 2 → bake → save → library shows 11.
- Verified in Node: all ten pass check_sheets (way through, answer clear of walls, level guess = sheet level); 600 catalog-style test mazes with 0 answer-line failures; doodle readings ≤ ~2% raw failures, which baking rejects.
- Unverified: real printing (margins, line weight on paper), path width for Felix, iPad Safari (Apple Pencil, pointer events, JPEG from SVG canvas), the SQL (generated column, policies) against the live database.
- Not read in full: Pedersen–Singh and Xu–Kaplan papers (hosts blocked by the session's network policy).

## Next steps

1. Jimmy prints and tries the ten; answers convo v0.2.
2. QC pass on paper (`qc.md`).
3. Supabase via `/supabase-project` if Jimmy says yes.
4. Next styles toward 200.


## Status after generation round
- Bank: 192 puzzles (batches 1–4, `tools/generate.js --batch N`), levels 40/70/55/21/6, mean 2.39. 8 designs in `data/rework.js` for `/fix-puzzles`. Report: `tools/generation_report.md`.

- Batch 5 (counters 0C9–0FA): 50 new designs from the inspirations log (`tools/designs_data5.js`, 36 new silhouettes). 10 earlier mazes whose pictures hit the title/footer were replaced under new counters (0FB+). Bank now 240 active puzzles. Sources: `tools/designs_sources.md`.
