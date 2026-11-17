# Our Family Compass — brief

**Updated:** 2026-11-17
**Status:** MVP 0.2.0. Headless-tested (including a mocked family database and a fake microphone); not device-tested. Family tables written, **not applied**.

## Goal
A long project to give the children a compass, not instructions: principles, a library, a village of trusted voices and a workshop for judgment, delivered as small pieces. The palace is something the children will walk through, play in and read in. Written with the family, not for it; the start is mostly Jimmy's voice, the aim is an even share.

## Architecture
Plain HTML/CSS/JS, classic scripts, no build. `data/framework.js`: nine rooms with map places (`at`) and connections (`links`), eight piece kinds, anatomy, path, risks, `updated` stamp. A newer framework saved from `ofc_framework` is validated and kept on the device (`ofc.framework`), and used on the next opening. `data/pieces.js`: twelve placeholder pieces. `js/app.js`: SVG map from data, room and piece sheets, append-only thoughts (`revises` points to an earlier one), voice notes (MediaRecorder; clips in IndexedDB), seven collapsible panels, ⚙️, notes, save and load a copy. `js/family.js`: family sign-in, pull then push of thoughts and notes, voice upload to the private bucket, `ofc_framework` check. All text through `textContent`.

## Database (seen read-only 2026-11-17)
Family project: no `ofc_*` objects, no `our-family-compass` registry rows, no `ofc` bucket (buckets were `speech-therapy`, `adv-audio`). Registry columns: id, app, object_name, object_type, access, description, repo, created_at. SQL in `03 Projects/Our Family Compass/supabase/` passes `sql_paste_check.py`. The rolled-back test was sent once through the tool; the tool's confirmation got no answer and timed out, so it has not run. Jimmy pastes by hand.

## Privacy line
The repo holds structure only. Thoughts, recordings and family stories stay on the device or in the family database. Research files are general; Claude's understanding of the family would go in `private/`.

## Verified (headless Chromium, 2026-11-17)
Earlier 54 checks plus 74: twelve valid pieces; every room links to real rooms; a piece opens, a choice shows its outcome, the back turns over; an answer is kept with the piece id; room sheet lists pieces and links, a link walks to the next room; voice is off by default, on in ⚙️, records (fake device), stores a clip, shows a Listen button and player; a newer framework is kept, older and invalid ones refused, and a reload draws the new room; signed out says "this device only". Mocked Supabase: sign in, pull a remote thought with a voice path, upload a clip to `main/<id>.m4a`, post the thought row with the compass and voice path, post a note with its label, database check lists four tables, zero errors.

## Not verified
Real iPad or phone; the microphone on a real device; saving and loading a copy on a device; a real sign-in and sync; the SQL on the live database; storage upload limits and the content type with codecs; web fonts (blocked in the test); every research link (seen in search results, not opened).

## Next steps
`03 Projects/Our Family Compass/todo.md` and `convo/convo v0.2.md`.
