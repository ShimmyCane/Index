# Paper Again: lessons learned

Project-specific lessons, appended over time. Generic lessons are promoted to `04 AI/lessons_pool.md` and `04 AI/patterns.md`.

## 2026-11-03: first build, from the Growth feedback

1. **Name the target look before building.** Growth was built from hand-written dents and looked like a mesh with pieces falling out. The fix was to ask for the target (crumpled ball, realistic paper, physics) in five questions first. Realism is a target to ask about, not a style to assume.
2. **Research the real behaviour, and cite it.** The research note (`04 AI/Paper Again/research/paper_behaviour.md`) gave design rules: plastic creases, fibre-fray tears, water softens and feeds mould. Keep "source says" separate from "design judgement".
3. **A simple particle model needs three things to look like paper:** plastic bend springs (creases stay), self-contact between non-neighbouring particles, and contact friction. Without friction the layers slide and a ball flattens within a second.
4. **Self-contact alone does not hold a ball.** Packed in a container it made a 3 × 3 × 1.8 in ball; released, it spread to about 5 × 6 in. A soft shell (the "hold") keeps it together until the first cut. That is a modelling shortcut, and it must be listed as a limit, not called realistic.
5. **Define cuts on the flat sheet, not in the world.** A cut drawn in world space missed the layers of a crumpled ball and did not separate the paper. Use the grid's own coordinates (material space).
6. **Break every spring that crosses the cut line, including the two-cell bend springs.** Bend springs jump the cut and reconnected both sides; the piece count stayed at 1 until they were broken.
7. **Count pieces by faces, not by particles.** Loose particles left after a cut counted as pieces (10 instead of 2).
8. **Re-centre the paper after each increment.** Cuts and tumbles drifted the sheet off screen.
9. **Bake the frames.** A replay of ten increments took about 40 s in Node, too slow for a page. A cache loaded through a `<script>` tag works from `file://` (`fetch` does not). Check the cache against a fingerprint of the story so a stale cache is never shown.
10. **Smoke-test before writing the story.** Settle on the floor, check for NaN, time one long op, look at one frame. Each tuning step (contact friction, bend stiffness, the hold) was decided by a short script with a bounding box.
11. **Renders need the page chrome hidden and a fixed camera.** Headless Chromium needs `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. Screenshot the canvas only.
12. **Check every frame by eye.** Two problems showed only in pictures: the off-centre frame 10 and the ball that looked flat from the side.
13. **Keep the deterministic rule.** Seeded random numbers only. The story is the record; frames and the cache are derived.

## Known limits (say these with the result)

- The ball is held by a shell until the first cut. Real crumpled paper holds itself by jamming.
- Tears and cuts follow the grid (about 0.35 in), not single fibres.
- Dirt, mould and burns are colour changes with placeholder colours.
- The tumble is a jump between poses in the 3-D viewer; it is not animated.
- The constants are tuned by hand, not against measured paper.

## Next checks

- Compare the frames with photos of real crumpled, torn and damp paper.
- Try a finer grid at the tear if the edge looks too coarse.
