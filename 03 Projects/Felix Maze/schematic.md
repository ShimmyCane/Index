# Felix Maze — Schematic

**Status:** MVP plus flags, puzzle of the day, top five and double-sided packs. Ten mazes; the bank grows to 200 in four batches of 50. Not yet printed or tried with Felix.
**Owner:** Jimmy
**Platform:** plain HTML/CSS/JS, no build, GitHub Pages. Sheets print on US Letter, landscape, black and white.
**Conversation:** `convo/convo v0.1.md` (answered), `convo/convo v0.2.md` (open), `convo/convo v0.3.md`, `convo/convo v0.4.md` (this round)

## Purpose

Felix loves drawing his own free-flowing mazes. Felix Maze makes mazes for him in many different styles (art, nature, systems, music, famous and classical mazes) so he sees how wide the idea of a maze can be, without being boxed in. Felix also draws a few lines and the computer grows mazes from them for him to pick and keep.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: Print a pack, Library, Make a maze, Answers, ⭐ puzzle of the day, 🏆 top five, 🔧 to rework |
| `pack.html` | Print a pack: 10 puzzles = 5 sheets, double-sided. Pairs pages front/back, chooses short-edge or long-edge flip (long edge turns the backs upside down for you), a 🧪 test sheet to learn how the printer flips, swap any puzzle, remembers what's printed |
| `rework.html` | Puzzles to rework: flagged by hand (🚩) and ones the generator couldn't finish; copy/download the list for `fix_puzzles`; mark fixed or fine |
| `library.html` | Every maze as a card with a picture (drawn as it scrolls into view). Search, sort (number, joy, level, newest), tag groups: level, theme, how it was made, things in it. Flagged ones are marked 🚩. Built on the Detail Library's search + tags + cards idea |
| `sheet.html?code=810-001` | One sheet, ready to print. ◀ ▶ through the bank. 🚩 Flag. ⚙️ shows a small answer key (JPEG, downloadable), Felix's faces, and scores; none of it prints |
| `play.html` | 🚗 Drive a maze: drag a finger (or arrow keys) along the passages; the line is one color and turns green on reaching the finish. Dead ends and turn-arounds are kept: on a win it shades where you looked, then replays your drive. 💡 hint, ↩ back, ⟲ start over, 🚩 flag. Rules live in `js/play.js` (Driver: steps only through open passages) |
| `about.html` | About: theory of mazes, a live "dials" lab, levels and joy, the art and inspirations (historical artists only), ways to play, an idea box (saved on this device, copy to paste into a chat), references |
| `prototypes.html` | 🧪 Ten digital-only ideas (`js/proto.js`): tabletop, fly-through, globe, drum, donut, cube, shifting maze, spinning rings, tower, flood. Plain canvas with a small 3D projection; not part of the bank |
| `answer.html` | Type a maze number; the right path draws itself and the start character walks it. 🐢 slow, ↻ again |
| `print.html` | Published sheets that aren't flagged (or a list of codes), one per page |
| `make.html` | Felix draws → 5 spring sprouts → pick 1–2 → bake into summer mazes → try options → save |
| `research/index.html` | Research explainer and maze lab (round 1) |

## The sheet

- Letter landscape, 11 × 8.5 inches; drawing units are 1/100 inch (1100 × 850).
- Top: "Felix Maze #810-001". Bottom: "Felix Maze #810-001 · name · inspired by … · one fun line".
- No answer key, solved-by line, stars or coloring space on the printed sheet.
- Few words: only where they're part of the puzzle.

## Numbering

`family · level · source - counter`, in hex: **810-001** = story world, level 1, made by the computer, maze 1. Details in `catalog.md`.

## Difficulty 1–5

| Level | Target time | Cell size | Feel |
|---|---|---|---|
| 1 | About 1 minute | 1.0 in | Warm-up, long winding halls |
| 2 | About 3 minutes | 0.8 in | A few real choices |
| 3 | About 5 minutes | 0.64 in | Several forks, a loop or two |
| 4 | About 10 minutes | 0.5 in | Long wrong turns, more loops |
| 5 | 20 minutes or more | 0.38 in | A big one |

The bank is a mixed bag, not easy to hard. The computer guesses each maze's level from the research measures (`rubric.md`); the sheet's level must match. Felix's faces (😴 😊 😣 in each sheet's ⚙️) set his sweet spot.

## Joy and checks

- `rubric.md`: Looking, Doing, Solving, the three moments of a maze. `js/score.js` gives the computer's guess for each, shown in a sheet's ⚙️.
- The red answer line is checked against every wall as drawn. A maze that fails is never published: the catalog check fails, and baking a doodle keeps only clean versions.
- White space: every maze sits well inside the page, about 7 × 5.5 inches at most.
- Treats along the way (crumbs, drops, leaves, stars, hearts): three on the right path, two at the ends of wrong turns.

## Engine (`js/`)

| File | What it holds |
|---|---|
| `engine.js` | Cell graphs (square grid, hexagons, rings and spokes), shape masks, growing-tree maze growth with doodle hooks (walls to keep, a path to carve, a direction to follow, early stop), braiding (loops), weaving (bridges), solving, entrances |
| `sheet.js` | Levels, families, codes, the ten styles (geometry + look + start/finish + decorations), rendering (walls, hedges, double lines, ribbons and tunnels, subway lines, swirl warp, hand wobble), the worksheet layout |
| `art.js` | The characters and props as simple line drawings (`characters.md`) |
| `doodle.js` | Felix's lines read five ways, each with a theme |
| `score.js` | Difficulty measures, level guess, joy scores (rubric.md) |
| `common.js` | ⚙️ drawer (database sign-in, sync, check), error panel, the bank (catalog + this device, minus retired), flags, picking (puzzle of the day, top five, packs), JPEG pictures drawn on scroll, Felix's log and sweet spot, best-of-several baking |
| `config.js` | The Family project's URL and publishable key (the same ones Adventure ships; RLS protects the data) |
| `data/catalog.js` | The published bank: one recipe per maze |
| `data/scores.js` | Computed scores per maze (written by `tools/score_catalog.js`) |
| `data/rework.js` | Puzzles the generator couldn't finish (for `fix_puzzles`) |

A recipe always rebuilds the same maze, answer and animation, so the bank stores recipes, not pictures.

## Doodle to maze

- Draw with a finger or Apple Pencil. Lines stay on the device as a draft.
- **Spring:** 5 sprouts, each grown about a third of the way. Each reads the lines a different way: walls, the way through, the shape, a river, the direction of the halls. Each gets a different theme: bold, hedges, tunnels, swirls, fine lines.
- **Summer:** pick 1–2 and bake. Each becomes a full maze with options: another try (new seed), another look (theme), answer on/off, a name. Save adds it to the bank with source 1 in its code.
- Saved on the device for now; Supabase later.

## Flags and picking

- **🚩 Flag** on a sheet: pick what's wrong (answer looks wrong, too hard, too easy, doesn't look good, not suitable, other) and add a note. Saved on the device, and in the database (`fmz_flags`) once signed in with the family account in ⚙️.
- A flagged puzzle is **never** picked as the puzzle of the day, in the top five, in a pack, or in "print all". It stays in the library, marked 🚩.
- **`fix_puzzles`** (skill, `02 Refs/Skills/fix_puzzles.md`) reads the open flags and the generator's unfinished list, decides repair vs. replace, re-checks, and closes the flags.
- **Puzzle of the day:** same puzzle all day on every device, chosen from eligible puzzles (passed every check, not flagged, not retired) near Felix's sweet spot.
- **Top five:** eligible puzzles ranked by the computer's joy score.
- **Pack:** 10 puzzles never printed before, levels clustered around Felix's sweet spot, different themes next to each other, never two of the same design.

## Duplex printing

A pack is page 1 (front of sheet 1), page 2 (its back), and so on, one puzzle per page, no blank pages. For a landscape page the printer must flip on the **short edge** (like turning a page) for the back to read upright. If your printer flips on the long edge, pick that on the pack page: the backs are printed rotated 180° so they still read upright. The test sheet is two pages with an arrow pointing to the top, to learn which your printer does.

## Data

Supabase **Family** project, app `felix-maze`, tables prefixed `fmz_`:
- `fmz_flags`: **live** (`supabase/002_flags.sql`, applied 2026-10-28 after a rolled-back test; RLS on, registered).
- `fmz_mazes`, `fmz_doodles`, `fmz_characters`: written, not applied (`supabase/001_felix_maze.sql`).
- Flags are kept on the device first and synced when signed in (the family sign-in from Adventure carries over on the same site). The pages work fully offline.

## Rules

- Public repo: Felix's first name only. No age, school or photos. Scans of his drawings go in `private/` (not committed).
- Art is "inspired by", never traced. Living artists are style references only. Felix the cat is our own striped kitten, not the cartoon (`characters.md`).
- Every maze passes `qc.md` before it's published.

## Planning files

`inspirations.md` (100 maze types) · `maze_research.md` · `variations.md` · `todo.md` · `characters.md` · `catalog.md` · `qc.md` · `rubric.md`
