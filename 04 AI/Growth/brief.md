# Growth: AI brief

**Updated:** 2026-11-03
**Status:** MVP (story only). Started with `/start-project growth`.

## Goal

An algorithmic growth engine. A subject carries a history of steps, and rules plus the environment turn that history into a believable state at each age. First subject: a white paper sheet, stepped on, blown, torn, wet, cut and nested in. Views: Increment Viewer (overview), 3-D viewer (one snapshot), database (JSON record, not yet built).

## Current state

- `03 Projects/Growth/`: `schematic.md`, `CLAUDE.md`, `convo/convo v0.1.md` (first answers recorded, §2, §3, §5, §6b, §7b open), `renders/growth_paper_01..10.svg` (placeholder frames).
- Test story: `03 Projects/Increment Viewer/data/growth_paper.js`, ten steps, opens with `viewer.html?set=growth_paper`. Linked from the Architecture section of `index.html`.
- Verified: headless Chromium loads the story with ten frames, no missing images and no page errors.
- Unverified: the 3-D model, the database, and the environment rules. The story is placeholder content, not a rule-driven replay yet.

## Next steps

1. Jimmy confirms the open convo items (environment, base sheet size, time slider, story visibility, rules as data).
2. Replace the placeholder SVG frames with 3-D renders of the replayed mesh.
3. Build the mesh engine (coarse to dense), with the steps as the record and the seed fixed.
4. Plan the database row with `/supabase-project`. Nothing is applied yet.

## Links

- Related: Make 3D (history then replay, `m3d_scenes`), Increment Viewer (review format).
