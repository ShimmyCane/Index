# Paper Again: Claude Code pointer

Purpose: one sheet of white paper, ten increments, run as a particle-spring model. Folds set, the paper crumples into a ball, tears, gets wet and mouldy, is cut, burned and nested in. It tumbles between increments. Replaces Growth's 3-D version.

- Design and known limits: `schematic.md`
- Q&A: `convo/` (never compact; start a new version). Answers so far: `convo/convo v0.1.md`
- Research notes: `04 AI/Paper Again/research/paper_behaviour.md`
- AI brief: `04 AI/Paper Again/brief.md`

How to run:
- Open `paper_again.html` in a browser (no server). It loads `data/paper_again_cache.js` when it matches the story; otherwise it builds the ten increments live (about 40 s).
- Tests: `node tests/test_paper_sim.js` (about 2 min).
- Rebuild the cache after changing the story or the engine: `node tools/bake.js`.

Rules:
- The story (`js/paper_story.js`) is the record. The cache and renders are derived; rebuild them, never edit them by hand.
- Same story, same seed, same result. Keep the engine deterministic (seeded random numbers only).
- Public repo: synthetic story only.
