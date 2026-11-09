# Bar Glide — Claude Code pointer

Purpose: an arcade bar game in the spirit of the early-80s bartender games Jimmy remembers. Pour, slide mugs down the bars, catch the empties, and don't break three glasses or the owner comes in. Original name, characters and art; the mechanics are the genre's.

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- Backlog: `todo.md`
- AI notes: `04 AI/Bar Glide/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules), `04 AI/Supabase/brief.md` (prefix `bglide_`)
- Track: A. Family play (with a late-night arcade mood by default; pastel day room in ⚙️)
- Database: Family project (`twvqvutrcobedvuhnzxq`), tables `bglide_scores`, `bglide_notes`. SQL in `supabase/` (`test_001`, `001`, `verify_001`). Rolled-back test passed 2026-11-09; not applied yet.

How to run: open `index.html` (no build step). Files: `js/config.js` (version, changelog, database URL and publishable key), `js/sprites.js` (pixel sprites, 3x5 font, room themes), `js/sound.js` (Web Audio), `js/game.js` (the game, `window.BarGlide`, debug hooks for tests), `js/app.js` (controls, ⚙️, notes, scores, database), `css/style.css`.

Rules:
- Don't copy the original arcade game's name, characters, art or music. Keep everything drawn here.
- Publishable key only in browser code. Database SQL is pasted by hand (`02 Refs/Skills/supabase_link.md`).
- Bump `BG.VERSION` and add a line to `BG.CHANGES` in `js/config.js` with every change Jimmy will see.
