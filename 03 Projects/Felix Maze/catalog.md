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
| 1 | Classical labyrinths and history | 1 | Grown from Felix's doodle |
| 2 | Famous mazes and gardens | 2 | Picked and tuned by hand |
| 3 | Art and artists | 3 | |
| 4 | Nature | 4 | |
| 5 | Systems and maps | 5 | |
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

## Batch 10 (the restart, 2026-10-29)

The old bank was deleted (it is in git history) after Jimmy flagged the puzzles as far too easy (2 to 30 seconds). Ten new puzzles, made by the solution-first generator (`build: "path"`: the route is drawn first, then the walls are carved around it, with waypoints and a lure). Levels 2, 4, 5, 6, 7, two each. Historical artists only.

| Code | Maze | Level | Inspired by |
|---|---|---|---|
| 320-009 | Wire Circus | 2 | Alexander Calder (d. 1976), wire sculptures |
| 320-00A | The Kiss | 2 | Gustav Klimt, 1907–08 |
| 340-007 | Victory Boogie | 4 | Piet Mondrian (d. 1944), city grid |
| 340-008 | Fish Magic | 4 | Paul Klee (d. 1940), dot field |
| 350-005 | Day and Night | 5 | M. C. Escher (d. 1972), patchwork |
| 350-006 | Japanese Bridge | 5 | Claude Monet (d. 1926), water garden |
| 360-003 | Floating Stars | 6 | Joan Miró (d. 1983), rings |
| 360-004 | Color Music | 6 | Wassily Kandinsky (d. 1944), sound waves |
| 370-001 | The Dream | 7 | Henri Rousseau (d. 1910), burrow |
| 370-002 | The Snail | 7 | Henri Matisse (d. 1954), patchwork |

Counters restart at 001. Nothing from before batch 10 was printed.

## Adding a maze

1. Pick a style in `js/sheet.js` `STYLES` (or add one), a family and a level.
2. Add a recipe to `data/catalog.js` with the next counter.
3. `node tools/pick_seeds.js <counter>` tries many seeds, rejects any where the answer touches a wall, and lists the best by level fit and joy score. Use the top seed, then look at it (`sheet.html?code=…`).
4. `node tools/check_sheets.js --update`, then the by-eye check in `rubric.md` and `qc.md`.

## Levels
- Levels 1 to 5, no time estimates. Level 6 and 7 puzzles were moved to level 5 when the scale was cut to five.
- Time doubles per level from level 3 on, so effort (which tracks path length and choices) goes up about the same amount per level: the scale is logarithmic in time. Boundaries in `js/score.js` (`levelOf`): 5 → 6 at effort 7.2.
- Level 6 needs big mazes: the generator uses a paper square of 30 with zoom up to 1.2 (a cell of about 25). Its pictures cover more of the page, so its Looking bar is 2.4 and its overall bar 3.0 (see the batch 8 report).

## Retired and why
- `retired: true` keeps the counter. `retiredWhy: "living artist"` marks the four mazes inspired by a living artist (polka dots, 014, 046, 078, 0AA). Counters 0FB onward are replacements (`replaces`) or later batches (batch 7: historical artists, 109–110).
