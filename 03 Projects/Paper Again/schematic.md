# Paper Again: schematic

Status: MVP (particle model, ten increments). Started 2026-11-03 after feedback on Growth: the 3-D version looked like a mesh with small pieces falling out and tears like mesh holes, not paper. Growth stays as the first attempt.

## Purpose

One sheet of white paper, ten increments of time. Each increment is run physically from the one before: folds, crumples, tears, dirt, damp, mould, cuts, burns and nesting. Then the sheet tumbles and drops, so it lands in a new pose.

## Model

- **Particles on a grid** (24 by 32 cells, 8.5 by 11 in). Springs: structural, shear and bend (two cells apart).
- **Plastic creases:** bend springs past a yield move their rest length toward the bent length. Creases stay after the force is gone.
- **Tears and cuts:** a tear breaks springs along a random walk from the edge, so the edge is jagged. A cut breaks every spring that crosses a line on the flat sheet, then pushes the two sides apart.
- **Self-contact:** particles that are not close on the sheet push each other apart, with friction at contact.
- **Floor and colliders:** a floor at z = 0, and moving spheres for stamps, rollers and gathering.
- **The hold:** while the paper is a ball, a soft shell keeps it together. This is a stand-in for the jamming real crumpled paper has, which the model does not reproduce. It ends at the first cut.
- **Wetness** spreads over the springs and softens them. **Mould** grows where paper stays wet. **Dirt** collects where particles crowd (folds). **Burns** darken and lift the edge they touch.
- **Tumble:** a random turn of the whole sheet, a drop, and a settle. It runs at the end of every increment.

## Files

- `js/paper_sim.js`: the engine (replay, one increment at a time, geometry, stats).
- `js/paper_story.js`: the story. The record: seed, ten increments, each a list of operations.
- `data/paper_again_cache.js`: baked frames. Derived; rebuild with `node tools/bake.js` (about 45 s). The page uses it only when its fingerprint matches the story.
- `paper_again.html`: the 3-D page (drag, pinch, slider, back, play once, next).
- `tests/test_paper_sim.js`: piece counts (1, 1 … 2, 3), tear and holes remove faces, the ball stands up, determinism, cache fingerprint. About 2 minutes.
- `renders/paper_again_01..10.png`: fixed-pose frames for the Increment Viewer (`?set=paper_again`).
- `vendor/three.min.js`: Three.js r160, copied in.

## Known limits (be honest about these)

- The ball is held by a shell, not by its own jamming, so it is more ball-like than a real crumpled sheet.
- Tears and cuts follow the grid (about 0.35 in). Fibre-level edges are not modelled.
- Dirt, mould and burn are simple colour changes. Colours are placeholders.
- The model is slow: about 40 s to replay all ten increments in Node. The page uses the baked cache.
- The sim is tuned by hand (see the constants at the top of `js/paper_sim.js`), not against measured paper.

## Open decisions

See `convo/convo v0.1.md`.
