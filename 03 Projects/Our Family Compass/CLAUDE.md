# Our Family Compass — Claude Code pointer

Purpose: a long project to give the children a way to find their way back to themselves: a family compass made of principles, a library, a village of trusted voices and a workshop for judgment. This round is the framework only, drawn as a mind palace. The pieces (stories, questions, readings, lessons) come later.

Track: A. Family play, used first by a parent (so room sheets carry more words than a child's game). The children's rooms come later and will be short on words.

- Framework in words: `framework.md` · Design of the page: `schematic.md` · To do: `todo.md`
- Reading list (not yet checked): `research/reading.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Our Family Compass/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build; classic scripts, works from a file).
Code map: `data/framework.js` (rooms, piece kinds, anatomy, path, risks: all the words on the page), `js/app.js` (the palace map, room sheets, thoughts, ⚙️, notes), `css/style.css`.

Project rules:
- Public repo. This folder holds the **structure** only: rooms, questions, formats, rules. It never holds a family story, a relative's name or history, a child's answer, or a parent's answer to the Gate questions. Those stay on the device, in a `private/` folder, or later in the family database.
- Convo files are public. Questions go in the convo; Jimmy's personal answers go in the page ("My thinking") or in `private/`, and the convo records only the decision that follows.
- A thought is never overwritten. A change of mind is a new dated entry that points to the old one.
- Every piece, once pieces exist, names its room, level, objective, author and date (see "Anatomy of a piece" in `framework.md`).
- Sources are listed only after they are checked. The reading list is marked unchecked until then.
- Page text is built with `textContent`; never `innerHTML` (thoughts and notes are typed text).
- Bump `APP_VERSION` and add a `CHANGELOG` line in `js/app.js` for each user-visible change.
