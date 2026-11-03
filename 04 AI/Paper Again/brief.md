# Paper Again: AI brief

**Updated:** 2026-11-03
**Status:** MVP (particle model, ten increments, 3-D page, Increment Viewer story). Replaces Growth's 3-D version.

## Goal

A sheet of white paper that is folded, crumpled, torn, wetted, cut, burned and nested in over ten increments. Each increment is run physically from the one before, then the sheet tumbles and drops. Realistic paper, not a cartoon.

## Current state

- Engine `js/paper_sim.js`: particles and springs, plastic creases, tears and cuts on the flat sheet, self-contact with friction, a floor, moving colliders, wetness, mould, dirt and burns, a tumble between increments.
- Story `js/paper_story.js`: ten increments, free choice (see convo v0.1).
- Page `paper_again.html`; cache `data/paper_again_cache.js` (baked, matches the story fingerprint).
- Tests `tests/test_paper_sim.js`: passes (piece counts 1 … 2, 3; tear and holes remove faces; the ball stands up; determinism).
- Renders `renders/paper_again_01..10.png` and the Increment Viewer story `data/paper_again.js` (`?set=paper_again`).

## Verified vs unverified

- Verified in Node: the test suite. Verified in headless Chromium: the page loads from the cache with no errors, and the ten frames render.
- Unverified: a real iPad, the look against a photo of paper, and the grid-level tear and cut edges against real fibre edges.

## Known limits

- The ball is held by a shell (a stand-in for jamming).
- Tears and cuts follow the grid. Dirt, mould and burns are simple colour.
- Replay takes about 40 s in Node; the page uses the cache.

## Next steps

1. Jimmy answers convo v0.1 open items (shell-held ball, tumble animation, environment, story).
2. Compare the frames with photos of crumpled and torn paper; tune the constants at the top of `js/paper_sim.js`.
3. Finer grid at the tear (fibre-scale edges) if the look needs it.
