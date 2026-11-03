# Growth: Claude Code pointer

Purpose: a world simulator planned in words and numbers first. A page written like a prompt: the starting object or place, the environment and its variables, how time works, and the steps that happen (written by the AI or by hand). Open it in the Increment Viewer by link; later run it in 3-D, animate it and save it to the cloud. First worlds: rabbits on a hillside (computed) and paper decay (recorded from Paper Again).

- Design: `schematic.md`. To-do: `todo.md`.
- Q&A history: `convo/` (never compact; start a new version). Latest: `convo/convo v0.2.md`.
- AI notes: `04 AI/Growth/brief.md`, `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run:
- Open `index.html` in a browser (no server or build). `index.html?world=<id>` picks a world.
- Tests: `node tests/test_growth_model.js` (the model) and `node tests/test_paper_engine.js` (the first attempt).
- Browser check: `node tools/check_pages.js <screenshotDir>` (page and viewer links, headless Chromium).
- Increment Viewer links: `../Increment Viewer/viewer.html?world=<id>&step=<n>`.

Rules:
- A world is one object (schema 2, see `schematic.md`). Add a world as `worlds/<id>.js` and one line in `worlds/index.js`.
- Numbers come from a time model, never from the words. Time models live in `MODELS` in `js/growth_model.js` and are deterministic (no random numbers).
- Tokens like `{rabbits}` keep the story true when a variable changes. An unknown token is left as written.
- The database tables are drafted in `supabase/001_grw_worlds.sql` and NOT applied. Apply only after Jimmy says go, with `/supabase-project` (live schema first, rolled-back test first).
- Public repo: synthetic worlds only.
- The first attempt (`paper3d.html`, `js/paper_engine.js`, `js/paper_story.js`) is kept; the 3-D paper is now Paper Again.
