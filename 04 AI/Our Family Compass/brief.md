# Our Family Compass — brief

**Updated:** 2026-11-17
**Status:** MVP 0.1.0, the framework only. Headless-tested, not device-tested. No database.

## Goal
A long project to give the children a compass, not instructions: principles, a library, a village of trusted voices and a workshop for judgment, delivered later as small pieces (narrated stories, open questions, readings, plain explanations, moral games). Round 1 is the framework, drawn as a mind palace, and a place for Jimmy to think inside it.

## Architecture
Plain HTML/CSS/JS, classic scripts, no build. `data/framework.js` holds every word (nine rooms, eight piece kinds, anatomy of a piece with one example, two layers, six path steps, ten risks). `js/app.js` draws the SVG map, the room sheet, dated thoughts (append-only; a change of mind points to the old thought with `revises`), six collapsible panels, ⚙️, notes, and save/load a copy. All text through `textContent`. Storage keys `ofc.*`.

## Privacy line
The repo holds structure only. Thoughts, family stories, names and answers stay on the device or in a private store. The convo records decisions, not answers.

## Verified (headless Chromium, 2026-11-17)
Three sizes from `file://`: zero errors, no horizontal scroll. Nine rooms; tap opens a sheet; a thought saves with its question; typed markup stays text; a revision keeps the old thought; badges; reload keeps state; load a copy rejects junk and adds new ids only; panels; path buttons; drawer, text size, note with its context, error panel; print hides the gear. 54 checks passed.

## Not verified
Real iPad or phone; the save-a-copy download and the file picker on a device; web fonts (blocked in the test, fallbacks shown); the reading list.

## Next steps
`03 Projects/Our Family Compass/todo.md` and `convo/convo v0.1.md`.
