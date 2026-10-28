# Felix Maze — Catalog and numbering

Every maze has a code like **810-001**. It is printed at the top and in the footer of each sheet, and it is what you type on the Answers page.

```
 8   1   0  -  001
 │   │   │      └── counter: 3 hex digits, one series for every maze (001 … FFF = 4,095 mazes)
 │   │   └── source: how it was made
 │   └── level: difficulty 1–5
 └── family: theme
```

Typing only the counter (`001`, `00A`) also works, because the counter alone is unique.

| Digit | Family (theme) | Level (time to solve) | Source (how it was made) |
|---|---|---|---|
| 0 | | | Made by the computer from the catalog |
| 1 | Classical labyrinths and history | 1 · about 1 minute | Grown from Felix's doodle |
| 2 | Famous mazes and gardens | 2 · about 3 minutes | Picked and tuned by hand |
| 3 | Art and artists | 3 · about 5 minutes | |
| 4 | Nature | 4 · about 10 minutes | |
| 5 | Systems and maps | 5 · 20 minutes or more | |
| 6 | Math and patterns | | |
| 7 | Music and sound | | |
| 8 | Story worlds | | |
| 9–F | Free for later (seasons, holidays, Felix's own themes) | Free for harder levels | Free |

The families follow `inspirations.md`. The levels follow `js/sheet.js` `LEVELS` (path width and branching grow with level), and the computer's level guess must match (`rubric.md`). Codes changed on 2026-10-28 when levels went from 1–4 to 1–5, before anything was printed.

## Where mazes live

- **Published bank:** `data/catalog.js`. One recipe per maze: counter, family, level, source, style, seed, title, footer text, tags (plus `design`, `batch`, `retired` when they apply). Scores are computed into `data/scores.js`; puzzles the generator couldn't finish are in `data/rework.js`. The recipe rebuilds the maze, its answer key and its animation exactly, so no images are stored.
- **Baked on a device:** mazes saved from **Make a maze** are kept in that browser (`localStorage`, key `fmz.saved`) and appear in the Library marked "this device". To publish one, copy its recipe into `data/catalog.js`.
- **Later:** the Supabase tables in `supabase/001_felix_maze.sql` (`fmz_mazes`, `fmz_doodles`, `fmz_characters`), not applied yet.

## Counter ranges

- `001`–`7FF`: the published bank (`data/catalog.js`). Counters are never reused: a replaced puzzle is marked `retired: true` and its counter stays.
- `800`–`FFF`: mazes baked on a device from Felix's doodles (source 1). They never collide with the bank.

## The first ten (a test set, mixed difficulty)

Codes changed on 2026-10-28 (twice, before anything was printed): levels moved from 1–4 to 1–5, then were recalibrated so Jimmy's reference maze (the old 330-00A, 0.54 in cells) is level 2.

| Code | Maze | Level | Style |
|---|---|---|---|
| 810-001 | Mouse and Cheese | 1 | Square grid, bold hand-drawn walls, crumbs to collect |
| 330-002 | Starry Night | 3 | Square grid bent into swirls, cypress tree, stars |
| 420-003 | Honeycomb | 2 | Hexagons |
| 140-004 | Chartres Rings | 4 | Rings and spokes, double lines |
| 320-005 | Dancing Figure | 2 | Maze inside a Keith Haring-style figure, hearts |
| 510-006 | Subway Map | 1 | Lines and stations, with loops |
| 230-007 | Hampton Court Hedges | 3 | Trapezoid hedge maze, goal in the middle |
| 420-008 | Spider Web | 2 | Rings with straight threads |
| 420-009 | Ant Tunnels | 2 | Tunnels in dotted earth, rooms at dead ends, crumbs |
| 320-00A | Celtic Knot | 2 | Ribbons that cross over and under (bridges) |

## Adding a maze

1. Pick a style in `js/sheet.js` `STYLES` (or add one), a family and a level.
2. Add a recipe to `data/catalog.js` with the next counter.
3. `node tools/pick_seeds.js <counter>` tries many seeds, rejects any where the answer touches a wall, and lists the best by level fit and joy score. Use the top seed, then look at it (`sheet.html?code=…`).
4. `node tools/check_sheets.js --update`, then the by-eye check in `rubric.md` and `qc.md`.

## Retired and why
- `retired: true` keeps the counter. `retiredWhy: "living artist"` marks the four mazes inspired by a living artist (polka dots, 014, 046, 078, 0AA). Counters 0FB onward are replacements (`replaces`) or later batches (batch 7: historical artists, 109–110).
