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
12. **Check what is drawn, not the model.** The answer line looked fine against the cell graph but crossed lines drawn on top (Felix's walls, rivers). Record every drawn polyline during rendering and test the answer curve against those. _(round 3)_
13. **Don't warp a child's drawing.** Swirling the maze but not his line made them cross; bending his line would change his drawing. Turn the swirl off where his line is drawn on top. _(round 3)_
14. **Calibrate levels from samples, not guesses.** Level boundaries sit halfway between the typical effort of each level's settings; time labels are targets to tune from Felix's log. _(round 3)_
15. **Scores that all read 5 are useless.** Add measures that vary (ink density, dull stretch) and check the spread over real samples. _(round 3)_
16. **Verify the picture, not only the model.** Render without and with the answer and compare pixels (answer on ink; a shorter white route than the answer). It catches layering bugs the geometry check can't, like an answer drawn over a bridge it passes under. Float32 distances in Dijkstra made duplicates re-expand forever: use Float64. _(round 4)_
17. **Layer by what the solver sees.** Where the answer goes under a bridge, draw the answer, then redraw the bridge on top of it. Where it goes over, leave the answer on top. _(round 4)_
18. **A child's judgement is the calibration.** One "that's a level 2" from Jimmy moved every level boundary. Keep the scale anchored to a named reference maze. _(round 4)_
19. **Keep device-made and published counters apart** (800–FFF vs 001–7FF) so a later batch never collides with something saved on a device. _(round 4)_
20. **Offline isn't an error.** A page that can't reach the database should say "this device only", not add an error to the panel on every load. _(round 4)_

## Generation round (batches 1–4)
- Every tool that builds mazes must load the same files list (`shapes.js`, `designs.js`); `check_sheets.js` silently rebuilt new styles as the wrong style until it loaded them. Keep one list (`tools/lib.js load`).
- Check the answer line first, then level, then joy, then pixels: 0.03% of tries touched a wall, so the wall check is cheap; level misses (~15%) and low joy (~30%) are where tries go.
- Designs that can't reach a level (spirals/wave at 5, checker at 3) should have their `levels` range narrowed in `designs_data.js`; the matcher then gives that level to a design that can.
- Long footer lines squeezed by `textLength` look bad past ~135 characters: wrap to two lines instead.

## Batch 5 (50 new designs)
- Check the whole page, not just the maze: start and finish pictures sit outside the maze, so tall shapes plus zoom pushed them into the title or footer. `tools/check_layout.js` now runs in the generator; zoom is capped by the shape's height (`zoomCap`).
- Small silhouettes cap at level 3 (corridors can't go below the pencil floor); only wide pages (rings, rectangles, waves) reach 4–5. Plan quotas from what shapes can reach.
- Variety came cheaply from shapes (a list of yes/no functions) plus a look (bold, hedge, dots): 36 new silhouettes in `js/shapes.js` preview well on a canvas before any maze is built.
- Replacing a published maze: retire it, give the replacement a new counter (`generate.js --redo n,n,...`, `--level` to change it).

## Round 6 (drive mode, about, prototypes, living artists)
- Drive mode needs no collision geometry: step through the cell graph (BFS toward the pointer, a few steps at most), so a finger can never cross a wall; keep the whole walk so the exploration and a replay come for free.
- 3D without a library is small: yaw/pitch/perspective plus painter's sort covers walls, surfaces wrapped on a sphere/cylinder/torus (with a facing test per wall), cubes and stacked floors. A raycaster is ~40 lines.
- Policy lines (like "no living artists") belong in the data too: `living: true` on a design stops the generator, so the rule can't be forgotten.
- A page of theory is better with a live control (the dials lab uses the real engine).
