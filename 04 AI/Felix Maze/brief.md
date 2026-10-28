# Felix Maze — AI Brief

**Updated:** 2026-10-28
**Status:** idea. Planning files written; awaiting answers in `03 Projects/Felix Maze/convo/convo v0.1.md`.

## Goal

Printed maze worksheets for Felix (11×17, black and white, numbered "Felix Maze #NNN" with an "inspired by" footer) in many styles, so he doesn't settle on one idea of a maze. First 10, then toward 365. Later a doodle-to-maze iPad page and Supabase storage.

## Current state

- `inspirations.md`: 100 types tagged by family, geometry, line, density, mechanic; sorted views; proposed first 10.
- `maze_research.md`: terms, Pullen's axes, algorithm textures, organic and image-guided mazes, young-solver guidance, printing. Sources listed.
- `variations.md`, `todo.md`, `schematic.md`, `CLAUDE.md`.
- `research/index.html` + `research.css` + `research.js`: explainer with a live maze lab (growing tree 0/0.5/1, Kruskal, binary tree, recursive division; braiding; BFS solution; dead-end count; hand-wobbled walls). Verified in headless Chromium at 1180×820 and 390×844: no page errors, no horizontal scroll.
- Source copies not saved: the network policy denied `cgl.uwaterloo.ca` and `dgp.toronto.edu` (convo v0.1 Q26–27).

## Verified vs. unverified

- Unverified: young-solver numbers (path width ⅜–½ inch, 1–2 dead ends) come from one teacher-style page; test with a printed sheet.
- Not read in full: Pedersen–Singh (organic labyrinths) and Xu–Kaplan (image-guided mazes). Read before building the organic engine.

## Next steps

1. Jimmy answers convo v0.1.
2. Build the generator page (reuse the lab's engine from `research/research.js`) (grid engine with growing tree + braiding, SVG at 11×17, recipe JSON) and sheet #001.
3. Print, test with Felix, tune, then #002–#010.
