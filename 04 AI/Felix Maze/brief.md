# Felix Maze — AI Brief

**Updated:** 2026-10-28
**Status:** MVP. Ten mazes, library, sheet view, answer animation, print all, doodle → spring → summer. Not printed or tried with Felix yet. Open questions in `03 Projects/Felix Maze/convo/convo v0.2.md`.

## Goal

Printed maze worksheets for Felix (US Letter landscape, black and white, "Felix Maze #code" with an "inspired by" footer) in many styles, so he doesn't settle on one idea of a maze. First 10 as a test, then toward 200 (a couple per theme), later more. Felix's own doodles grow into mazes he picks.

## Architecture

- Plain HTML/CSS/JS, no build. Pages: `index.html`, `library.html`, `sheet.html`, `answer.html`, `print.html`, `make.html`, `research/index.html`. Shared `css/app.css`.
- `js/engine.js`: cell graphs (grid, hex, polar with ring doubling), masks + keepLargest, growing tree (mix, forbid, prelink, bias, growth), braid, weave (bridges as extra under-edges), BFS solve, entrances (`side/at`, `angle`, `center`, `near`, `far`).
- `js/sheet.js`: LEVELS (cell size, mix, braid), FAMILIES, SOURCES, hex code, 10 STYLES + doodle, renderers (walls, hedge pattern stroke, double, ribbon/tunnel with chambers, subway, swirl warp, wobble), sheet layout 1100 × 850 (1/100 in).
- `js/art.js` characters; `js/doodle.js` five readings × five themes; `js/common.js` drawer, errors, bank, JPEG.
- Bank: `data/catalog.js` recipes + device-saved recipes (`localStorage fmz.saved`). Recipe → same maze every time; `tools/check_sheets.js` fingerprints published mazes.
- Supabase SQL `supabase/001_felix_maze.sql` (fmz_mazes with generated `code`, fmz_doodles, fmz_characters, registry rows). Not applied.

## Verified vs. unverified

- Verified in headless Chromium (1180 × 820): all pages load with no errors; library filters; sheet ⚙️ answer key JPEG; answer animation for `00a`; print view makes 10 Letter-landscape PDF pages with no answers; make page: two drawn strokes → 5 sprouts → pick 2 → bake → save → library shows 11.
- Verified in Node: all ten have a solution; fingerprints stored.
- Unverified: real printing (margins, line weight on paper), path width for Felix, iPad Safari (Apple Pencil, pointer events, JPEG from SVG canvas), the SQL (generated column, policies) against the live database.
- Not read in full: Pedersen–Singh and Xu–Kaplan papers (hosts blocked by the session's network policy).

## Next steps

1. Jimmy prints and tries the ten; answers convo v0.2.
2. QC pass on paper (`qc.md`).
3. Supabase via `/supabase-project` if Jimmy says yes.
4. Next styles toward 200.
