# Our Family Compass — Claude Code pointer

Purpose: a long project to give the children a way to find their way back to themselves: a family compass made of principles, a library, a village of trusted voices and a workshop for judgment. The framework is drawn as a mind palace the children will walk through. Twelve sample pieces show the kinds; the family's own pieces come later.

Track: A. Family play, used first by a parent (so room sheets carry more words than a child's game). The children's mode comes later and will be short on words.

- Framework in words: `framework.md` · Design of the page: `schematic.md` · To do: `todo.md`
- Research: `research/best_practices.md` (what the research says, strength of evidence, thoughts) and `research/reading.md` (books, mostly unchecked)
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Our Family Compass/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build; classic scripts, works from a file).
Code map: `data/framework.js` (rooms with map places and connections, piece kinds, anatomy, path, risks: all the words on the page), `data/pieces.js` (sample pieces), `js/app.js` (map, room and piece sheets, thoughts, voice notes, ⚙️, notes), `js/family.js` (sign-in, sync, voice upload), `supabase/` (tables, written, not applied), `css/style.css`.

Project rules:
- Public repo. This folder holds the **structure** only: rooms, questions, formats, rules. It never holds a family story, a relative's name or history, a child's answer, or a parent's answer to the Gate questions. Those stay on the device, in a `private/` folder, or later in the family database.
- Convo files are public. Questions go in the convo; Jimmy's personal answers go in the page ("My thinking") or in `private/`, and the convo records only the decision that follows.
- A thought is never overwritten. A change of mind is a new dated entry that points to the old one.
- Every piece, once pieces exist, names its room, level, objective, author and date (see "Anatomy of a piece" in `framework.md`).
- A source is quoted in a piece only after it is opened and checked. Research notes may list sources seen in search results, and must say they were not opened.
- Page text is built with `textContent`; never `innerHTML` (thoughts and notes are typed text).
- The palace is data. Rooms are added or moved in `data/framework.js` (or a newer `ofc_framework` row), never in drawing code. Bump `OFC.updated` when `framework.js` changes.
- Supabase: Family project, tables `ofc_notes`, `ofc_thoughts`, `ofc_pieces`, `ofc_framework`, private bucket `ofc-voice`, publishable key only. Run `test_001_ofc`, then `001_ofc_family`, then `verify_001_ofc`. Thoughts are append-only (no update grant).
- Research notes are general. Anything Claude understands about the family goes in a `private/` folder, never in the repo.
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
