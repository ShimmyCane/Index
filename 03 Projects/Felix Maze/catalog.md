# Felix Maze — Catalog and numbering

Every maze has a code like **810-001**. It is printed at the top and in the footer of each sheet, and it is what you type on the Answers page.

```
 8   1   0  -  001
 │   │   │      └── counter: 3 hex digits, one series for every maze (001 … FFF = 4,095 mazes)
 │   │   └── source: how it was made
 │   └── level: time to solve
 └── family: theme
```

Typing only the counter (`001`, `00A`) also works, because the counter alone is unique.

| Digit | Family (theme) | Level (time to solve) | Source (how it was made) |
|---|---|---|---|
| 0 | | | Made by the computer from the catalog |
| 1 | Classical labyrinths and history | About 2 minutes | Grown from Felix's doodle |
| 2 | Famous mazes and gardens | About 5 minutes | Picked and tuned by hand |
| 3 | Art and artists | About 10 minutes | |
| 4 | Nature | 20 minutes or more | |
| 5 | Systems and maps | | |
| 6 | Math and patterns | | |
| 7 | Music and sound | | |
| 8 | Story worlds | | |
| 9–F | Free for later (seasons, holidays, Felix's own themes) | Free for harder levels | Free |

The families follow `inspirations.md`. The levels follow `js/sheet.js` `LEVELS` (path width and branching grow with level).

## Where mazes live

- **Published bank:** `data/catalog.js`. One recipe per maze: counter, family, level, source, style, seed, title, footer text, tags. The recipe rebuilds the maze, its answer key and its animation exactly, so no images are stored.
- **Baked on a device:** mazes saved from **Make a maze** are kept in that browser (`localStorage`, key `fmz.saved`) and appear in the Library marked "this device". To publish one, copy its recipe into `data/catalog.js`.
- **Later:** the Supabase tables in `supabase/001_felix_maze.sql` (`fmz_mazes`, `fmz_doodles`, `fmz_characters`), not applied yet.

## The first ten (a test set, mixed difficulty)

| Code | Maze | Time | Style |
|---|---|---|---|
| 810-001 | Mouse and Cheese | 2 min | Square grid, bold hand-drawn walls |
| 330-002 | Starry Night | 10 min | Square grid bent into swirls, cypress tree |
| 420-003 | Honeycomb | 5 min | Hexagons |
| 140-004 | Chartres Rings | 20+ min | Rings and spokes, double lines |
| 320-005 | Dancing Figure | 5 min | Maze inside a Keith Haring-style figure |
| 510-006 | Subway Map | 2 min | Lines and stations, with loops |
| 230-007 | Hampton Court Hedges | 10 min | Trapezoid hedge maze, goal in the middle |
| 420-008 | Spider Web | 5 min | Rings with straight threads |
| 420-009 | Ant Tunnels | 5 min | Tunnels in dotted earth, rooms at dead ends |
| 330-00A | Celtic Knot | 10 min | Ribbons that cross over and under (bridges) |

## Adding a maze

1. Pick a style in `js/sheet.js` `STYLES` (or add one), a family and a level.
2. Add a recipe to `data/catalog.js` with the next counter and any seed. Open `sheet.html?code=…` and try seeds until the maze looks good.
3. Run the quality check in `qc.md`.
