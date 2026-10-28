# Felix Maze — Schematic

**Status:** MVP. Ten printable mazes, a library, an answer page and a doodle-to-maze page. Not yet printed or tried with Felix.
**Owner:** Jimmy
**Platform:** plain HTML/CSS/JS, no build, GitHub Pages. Sheets print on US Letter, landscape, black and white.
**Conversation:** `convo/convo v0.1.md` (answered), `convo/convo v0.2.md` (open)

## Purpose

Felix loves drawing his own free-flowing mazes. Felix Maze makes mazes for him in many different styles (art, nature, systems, music, famous and classical mazes) so he sees how wide the idea of a maze can be, without being boxed in. Felix also draws a few lines and the computer grows mazes from them for him to pick and keep.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: Library, Make a maze, Answers, Print all, and the newest maze |
| `library.html` | Every maze as a card with a picture. Search, plus tag groups: time, theme, how it was made, things in it. Built on the Detail Library's search + tags + cards idea |
| `sheet.html?code=810-001` | One sheet, ready to print. ◀ ▶ through the bank. ⚙️ shows a small answer key (JPEG, downloadable); it never prints |
| `answer.html` | Type a maze number; the right path draws itself and the start character walks it. 🐢 slow, ↻ again |
| `print.html` | All published sheets (or the library's filtered list), one per page |
| `make.html` | Felix draws → 5 spring sprouts → pick 1–2 → bake into summer mazes → try options → save |
| `research/index.html` | Research explainer and maze lab (round 1) |

## The sheet

- Letter landscape, 11 × 8.5 inches; drawing units are 1/100 inch (1100 × 850).
- Top: "Felix Maze #810-001". Bottom: "Felix Maze #810-001 · name · inspired by … · one fun line".
- No answer key, solved-by line, stars or coloring space on the printed sheet.
- Few words: only where they're part of the puzzle.

## Numbering

`family · level · source - counter`, in hex: **810-001** = story world, about 2 minutes, made by the computer, maze 1. Details in `catalog.md`.

## Difficulty by time to solve

| Level | Time | Cell size | Feel |
|---|---|---|---|
| 1 | About 2 minutes | 0.88 in | Long winding halls, no loops |
| 2 | About 5 minutes | 0.64 in | A few short branches |
| 3 | About 10 minutes | 0.48 in | More branches and a few loops |
| 4 | 20 minutes or more | 0.36 in | Busy, with loops |

The bank is a mixed bag, not easy to hard.

## Engine (`js/`)

| File | What it holds |
|---|---|
| `engine.js` | Cell graphs (square grid, hexagons, rings and spokes), shape masks, growing-tree maze growth with doodle hooks (walls to keep, a path to carve, a direction to follow, early stop), braiding (loops), weaving (bridges), solving, entrances |
| `sheet.js` | Levels, families, codes, the ten styles (geometry + look + start/finish + decorations), rendering (walls, hedges, double lines, ribbons and tunnels, subway lines, swirl warp, hand wobble), the worksheet layout |
| `art.js` | The characters and props as simple line drawings (`characters.md`) |
| `doodle.js` | Felix's lines read five ways, each with a theme |
| `common.js` | ⚙️ drawer, error panel, the bank (catalog + this device), JPEG pictures |
| `data/catalog.js` | The published bank: one recipe per maze |

A recipe always rebuilds the same maze, answer and animation, so the bank stores recipes, not pictures.

## Doodle to maze

- Draw with a finger or Apple Pencil. Lines stay on the device as a draft.
- **Spring:** 5 sprouts, each grown about a third of the way. Each reads the lines a different way: walls, the way through, the shape, a river, the direction of the halls. Each gets a different theme: bold, hedges, tunnels, swirls, fine lines.
- **Summer:** pick 1–2 and bake. Each becomes a full maze with options: another try (new seed), another look (theme), answer on/off, a name. Save adds it to the bank with source 1 in its code.
- Saved on the device for now; Supabase later.

## Data (later)

Supabase **Family** project, tables `fmz_mazes`, `fmz_doodles`, `fmz_characters`, app `felix-maze`. SQL is in `supabase/001_felix_maze.sql`, not applied. Plan: live database → this device's copy → `data/catalog.js`, the 3-tier fallback.

## Rules

- Public repo: Felix's first name only. No age, school or photos. Scans of his drawings go in `private/` (not committed).
- Art is "inspired by", never traced. Living artists are style references only. Felix the cat is our own striped kitten, not the cartoon (`characters.md`).
- Every maze passes `qc.md` before it's published.

## Planning files

`inspirations.md` (100 maze types) · `maze_research.md` · `variations.md` · `todo.md` · `characters.md` · `catalog.md` · `qc.md`
