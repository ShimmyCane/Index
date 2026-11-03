# Growth: AI brief

**Updated:** 2026-11-03
**Status:** MVP (3-D replay and story). Started with `/start-project growth`.

## Goal

An algorithmic growth engine. A subject carries a history of steps, and rules plus the environment turn that history into a believable state at each age. First subject: a white paper sheet, stepped on, blown, torn, wet, cut and nested in. Views: Increment Viewer (overview), 3-D viewer (one snapshot), database (JSON record, not yet built).

## Current state

- `03 Projects/Growth/`: `schematic.md`, `CLAUDE.md`, `convo/convo v0.1.md` (first answers recorded, §2, §3, §5, §6b, §7b open), `renders/growth_paper_01..10.svg` (placeholder frames).
- 3-D: `paper3d.html` replays the story on a 40 by 52 grid mesh (engine `js/paper_engine.js`, story `js/paper_story.js`). Tests: `node tests/test_paper_engine.js` (piece count 1, 1, 2, 3; tear and holes remove faces; replay is deterministic).
- Frames: `renders/growth_3d_01..10.png` rendered from the page in headless Chromium (swiftshader).
- Test story: `03 Projects/Increment Viewer/data/growth_paper.js`, ten steps, opens with `viewer.html?set=growth_paper`. Linked from the Architecture section of `index.html`.
- Verified: headless Chromium loads the story with ten frames, no missing images and no page errors.
- Unverified: the 3-D look on a real iPad, the database, and the environment rules. The steps are written by hand as operations; the rules are not yet shared with other subjects.

## Next steps

1. Jimmy confirms the open convo items (environment, base sheet size, time slider, story visibility, rules as data).
2. Refine the mesh: denser grid where the damage is (coarse to dense is not built yet).
3. Consolidate the rules into one general engine (paper first, per convo §7a).
4. Plan the database row with `/supabase-project`. Nothing is applied yet.

## Links

- Related: Make 3D (history then replay, `m3d_scenes`), Increment Viewer (review format).
