# Felix Maze — Schematic

**Status:** idea. Planning files written; awaiting answers in `convo/convo v0.1.md`.
**Owner:** Jimmy
**Platform:** printed worksheets (11×17, black and white) from a browser generator page; a later iPad doodle page
**Conversation:** `convo/convo v0.1.md`

## Purpose

Felix loves drawing his own free-flowing mazes. Felix Maze makes mazes for him in many different styles (art, nature, systems, music, famous and classical mazes) so he sees how wide the idea of a maze can be, without being boxed in. Later, Felix draws a few lines and the computer turns them into mazes he can pick and keep.

## Planning files

| File | What it holds |
|---|---|
| `inspirations.md` | 100 maze types, tagged by family, geometry, line, density and mechanic, with sorted views and a proposed first 10 |
| `maze_research.md` | What makes a good maze: terms, Pullen's seven axes, algorithms and how they feel, non-grid mazes, young solvers, printing |
| `variations.md` | The knobs: geometry, routing, stroke, walls vs. paths, tone, paper mechanisms, characters, composition, worksheet extras, made with Felix |
| `todo.md` | Now, next, later, and the interactive back pocket |

## MVP: the first 10 sheets

- 10 mazes, numbered Felix Maze #001–#010, printed black and white on 11×17.
- Each sheet: title and number, the maze, and a footer snippet (where it's from, who inspired it).
- Variety across sheets: different geometry, line work and source on each.
- Good mazes, not just correct ones: see `maze_research.md` §5–6 (concrete goal, tempting branches, fair difficulty, wide paths for a young solver).

## Proposed build (to confirm in convo)

- `index.html` + `css/` + `js/`: a generator page. Plain HTML/CSS/JS, no build, GitHub Pages.
- One drawing list per maze, rendered as SVG at real size; print CSS sets an 11×17 page; save as PDF from the browser.
- Engines: a grid maze engine (square, hex, polar) with the growing-tree algorithm and braiding; a silhouette clipper; tile mazes; later an organic curve-growth engine.
- Each maze has a **recipe** (style, seed, settings) in `mazes/` as JSON, so any sheet can be remade exactly.
- Kids' iPad style for the screen (pastel, ⚙️ lower right, errors behind a toggle). The printed sheets are black and white.

## Later

- **Doodle to maze** page: Felix draws lines on the iPad; the computer offers about 3 mazes; he picks one and it's saved as the next number.
- **Supabase** (Family project), draft tables, prefix to confirm:
  - `fmz_styles`: the inspirations catalog (name, family, tags, snippet)
  - `fmz_mazes`: number, title, style, recipe JSON, SVG, source (`catalog` or `felix`), created date
  - `fmz_doodles`: Felix's strokes, linked to the mazes made from them
  - Registered as app `felix-maze` per `04 AI/Supabase/brief.md`.
- Grow toward 365 mazes.
- Interactive mazes (back pocket, `todo.md`).

## Rules

- Public repo: Felix's first name only. No age, school or photos unless Jimmy says so. Scans of his drawings go in `private/`.
- Art is "inspired by", never traced. Living artists are style references only. Cultural designs are named with respect and not copied.

## Open

See `convo/convo v0.1.md`: privacy, how he solves, the first 10, sheet layout, build approach, numbering, doodle meaning, Supabase prefix.
