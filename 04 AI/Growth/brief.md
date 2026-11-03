# Growth: AI brief

**Updated:** 2026-11-03
**Status:** MVP, planning mode. The Growth page, the world format, two worlds, and `?world=` links in the Increment Viewer. The 3-D run, animation and cloud save are next.

## Goal

A world simulator planned in words and numbers first. Jimmy states the starting object or place, the environment and its variables, how time works, and the AI writes the steps; he tweaks anything. It can be one object (paper decaying) or an ecosystem (a pair of rabbits on a hillside with predators). The environment can be a hillside, a city, a lake, a stomach. Once the plan is right: save to the cloud, run in 3-D, animate (later).

## Current state

- Page `03 Projects/Growth/index.html` (+ `js/app.js`): six sections written like a prompt (start with, the place and its rules, how time works, what happens, ask the AI, then). A chart, story cards with editing folded away, a copy-and-paste AI loop, a ⚙️ drawer, drafts saved on the device.
- World format (schema 2) and two time models in `js/growth_model.js`: `ecosystem` (computed: plants, rabbits, hawks, coyotes by season) and `recorded` (numbers from a run). Worlds in `worlds/`: `rabbits_hillside`, `paper_decay`.
- Increment Viewer: `?world=<id>`, `&step=<n>`, `#draft=…`, state cards. The address follows the step.
- Tests: `node tests/test_growth_model.js`, `node tests/test_paper_engine.js` (first attempt), browser check `node tools/check_pages.js <dir>`. All pass. All 12 existing viewer scenes still load; `adventure_park` has one image missing (`../Make 3D/renders/adventure_park_compact/v16.png`), which was already missing.
- Cloud: `supabase/001_grw_worlds.sql` drafted, NOT applied. Live Architecture project listed read-only: no `grw_` tables yet.
- First attempt kept: `paper3d.html`, `js/paper_engine.js`, `js/paper_story.js`. The 3-D paper is Paper Again.

## Verified vs unverified

- Verified in Node and headless Chromium: the model, the page (editing, chart, AI loop, world switch, drawer, phone width), and the viewer links (set, world, step, draft, bad names).
- Unverified: a real iPad, whether the page reads like a prompt to Jimmy, and the rabbit numbers against real rabbit biology (a simple model, hand-tuned).

## Next steps

1. Jimmy answers `convo/convo v0.2.md` (does it read like a prompt, the chart axes, rabbit rules, time grain, next world, cloud go, 3-D place).
2. Apply the SQL after a go (live schema first, rolled-back test first), then save and load from the page.
3. Run the rabbits in 3-D, then animate (`todo.md`).
4. A second computed time model (lake, city or stomach) to see what the world format is missing.

## Links

Related: Paper Again (recorded numbers, 3-D page), Increment Viewer (review format), Make 3D (cloud tables pattern), `/simulate-decay` (its questions and sign-off match sections 1 to 3).
