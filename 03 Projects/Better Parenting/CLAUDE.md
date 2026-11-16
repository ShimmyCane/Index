# Better Parenting — Claude Code pointer

Purpose: a page for a parent to practise and refresh parenting skills for children from kindergarten to grade 5: 144 scenarios in 16 topics and 3 stages, 18 named skills, practice with self-rating, a scenario of your own with an AI prompt loop, and a watch and read list.

Track: A. Family play (the user is a parent, so cards carry more words than a child's game)

- Design: `schematic.md` · Sources: `research/sources.md` · To do: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Better Parenting/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build; classic scripts, works from a file).
Code map: `data/core.js` (stages, topics, skills, library), `data/scenarios_1..3.js` (scenarios through `BP.S(...)`), `js/app.js` (everything on screen; `BPApp.info()` for tests), `js/notes.js`, `js/family.js` (sign-in and sync), `css/style.css`.

Project rules:
- Public repo. No children's names, ages, grades, school or family events in any file. The parent's grades, answers and own scenarios live on the device and in the family database only.
- Content is paraphrased from published programmes and names its source. It is general guidance, not medical advice; keep the "talk to the pediatrician" lines.
- New scenarios follow the same shape and use only existing topic, stage and skill ids (the smoke test checks this).
- A video link goes in the library only if it was found by a search, never from memory.
- Page text is built with `textContent`; never `innerHTML` (own scenarios and AI replies are typed or pasted text).
- The page never calls an AI service. The AI loop is copy and paste.
- Supabase: Family project, tables `bp_notes`, `bp_scenarios`, `bp_practice`, publishable key only. Run `test_001_bp`, then `001_bp_family`, then `verify_001_bp`.
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
