# Felix Maze — Lessons

1. **The algorithm sets the feel of a maze.** Recursive backtracker gives long winding corridors (feels hand-drawn, kind to young kids); Prim's and Kruskal's give many short dead ends; binary tree has an obvious bias. Growing tree tunes between them with one setting. _(research, 2026-10-28)_
2. **Path width matters more than size for young solvers.** Start wide (about ½ inch) and raise difficulty by grid size, not by more easy pages. _(research, unverified with Felix)_
3. **Copies of other people's papers and pages don't go in the public repo.** Link the originals; keep saved copies in `research/private/`. _(2026-10-28)_
4. **Flex columns shrink their children.** In a fixed-height flex column, set `flex-shrink: 0` on the children or text boxes clip. _(research page, 2026-10-28)_
5. **The cloud session's network can block academic hosts** (`cgl.uwaterloo.ca`, `dgp.toronto.edu`); both curl and web fetch failed. Ask Jimmy to allow the host or supply the file. _(2026-10-28)_
6. **Keep a maze as a recipe, not a picture.** Seeded generation means the sheet, answer key, thumbnail and animation all come from one small record. Fingerprint published recipes so engine changes don't silently change printed mazes. _(MVP, 2026-10-28)_
7. **A style's metadata must reach the builder.** `geometry` lived on the style while the builder read the spec, so hex and ring mazes were built as grids and the ring one hung (an empty grid fed the generator). Merge style defaults into the spec in one place. _(MVP)_
8. **Pick the far doorway for ring mazes.** Outer entrance to center is short on few rings; choose the outside cell farthest (by path) from the center. _(MVP)_
9. **SVG `height="auto"` is invalid.** Leave width/height off for fluid SVGs and size with CSS; keep `11in × 8.5in` only for print. _(MVP)_
10. **Seeded preview values can be overwritten by `Object.assign` order.** Put the recipe first and the display overrides last. _(make page)_
11. **Over/under bridges in ribbon mazes:** add the tunnel as an extra edge between the two side cells, draw all ribbons, then redraw the bridge cell's straight segment (black then white) on top. _(Celtic knot)_
