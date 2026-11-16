# Felix Gear Wars — Claude Code pointer

Purpose: a gear-powered lane defense game for Felix. A turning heart gear drives the gears he places on a pegboard; each gear makes a fighter, and the fighters drop to the battlefield and fight waves of the Rust Horde before they reach the wall. Campaign: 8 chapters × 3 levels (a new fighter each chapter, a boss on level 3), a free-for-all level, a crown boss gear that makes a random champion, a fun curve that sizes the waves, gear prices that creep up, castles and towers that shoot, shorter maps early, eight cultures (French, Spanish, Aztec, Indian, Japanese, Chinese, Persian, Egyptian) each with a ★ specialty fighter (+25%), their own fighter names, headgear and blades, three storybook looks, narrated story cards.

Track: A. Family play

- Design: `schematic.md` · Story plan: `research/story.md` · Art research: `research/art_styles.md` · Balance: `research/balance.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Felix Gear Wars/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build; works from `file://`).
Code map: `js/data.js` (units, counters, chapters, stories, level builder) · `js/sim.js` (all rules, no DOM; the screen reads `sim.units/gears/proj` and drains `sim.events`) · `js/art.js` (drawing, eight styles through `Art.C()`, cultures: `Art.unitName`, `cultHead`, `blade`) · `js/audio.js` (synth sound, music, `say()` for narration) · `js/audio_manifest.js` (made by `tools/make_voice.py`) · `js/game.js` (layout, input, camera, HUD, map, story, results, ⚙️; `GW.test` has hooks for headless tests) · `js/notes.js`, `js/family.js`.
Narration: `python3 -I tools/make_voice.py --model <dir>` re-records changed story texts (setup in the tool's header; the model stays outside the repo).
Check: `node tools/balance_sim.js all 10` (balance, no browser). Headless Chromium for the page: drive it with `GW.test` (`showStory`, `startLevel`, `sim()`, `cards()`, `cellXY()`, `view()`). Keep test scripts out of the repo.

Project rules:
- Public repo. First names only; no photos, school or location details.
- Original game: our own names, characters and art, drawn in code. Mechanics like other gear games are fine; copying their names, art or levels is not.
- Sound effects and music are Web Audio synthesis only. The one exception: story narration clips in `audio/` (Jimmy asked for them on 2026-11-16), made by `tools/make_voice.py`. No image files.
- Art inspiration from historical artists and traditions only, never a living artist's style.
- Supabase: Family project, table `fgw_notes`, publishable key only. SQL in `supabase/` (run `test_001_`, then `001_`, then `verify_001_`); nothing is applied until Jimmy asks.
- Rules go in `js/sim.js` and `js/data.js` only (so the balance tool sees them). Drawing never changes the rules.
