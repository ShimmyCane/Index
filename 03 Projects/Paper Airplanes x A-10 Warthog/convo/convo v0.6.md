# Convo v0.6 — closer assets, notes, and the general notes table

Date: 2026-11-18. Follows `convo v0.5.md`.

## Built

- **Closer, bigger things:** ground things grow up to three times larger inside 220 m, and a far thing never shrinks below 7 px tall. The largest is 150 px, so nothing fills the screen. This is a size change on the same drawings; detailed close-up drawings are the next art iteration.
- **Notes for improvement** (📝 in ⚙️): write a note, which is saved with the project name, the sub-project (plane and view), the time, what was on screen, and the identifiers at that moment. Notes are numbered N-0001 … and each has a status (open, done, closed), set with buttons. The list sorts by time, status or sub-project. Identifier index shows what each code means. Copy all notes puts them on the clipboard.
- **Identifiers** (first set): HP health, TIME time played, ALT height, SPD speed, AOA angle of attack, VIEW camera view, PLANE, MISS missiles, GUN gun aim, LEFT targets left, SCORE, SAFE safe flight, INV invincible.
- **Skill updates:** `feedback_notes.md` now describes the general notes table; `settings_gear.md` gets section 7b (notes on every ⚙️ page).
- **Database (not applied):** `supabase/001_gen_notes.sql`, with `test_001_gen_notes_rollback.sql`. Tables `gen_notes` (the notes) and `gen_notes_index` (the identifier index), in the Family project, with the same family-only row security as the other apps.

## Not done yet

- Sending notes to `gen_notes` when signed in. The table is not created yet, so the send is not written.
- Close-up sprite detail (a second, larger drawing for each thing).

## Questions for Jimmy

- **Q16.** Should the general notes table live in the Family project (as built in the SQL) or the architecture project?
- **Q17.** Should the first identifiers be the ones listed above, or do you want others (for example, the number of kills or the flight time per mission)?
