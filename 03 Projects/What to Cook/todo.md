# What to Cook — To do

Items come from the feedback notes in the family database (`wtc_notes`). Notes are marked done only after Jimmy confirms (see `02 Refs/Skills/read_notes_and_update.md`).

## Round 2026-11-07 (from notes read on 2026-11-07)

Status key: **built** (code shows it), **new** (not in code), **question** (needs Jimmy's answer first).

- [x] **Save to the database works for the pantry.** Note from 2026-11-06 23:44 ("I can save to the database at least the pantry"). Confirmed: `wtc_notes` received notes from the device on 2026-11-07, and wtc_items shows the pantry rows.
- [ ] **Fridge life, stamped on entry.** When an item goes into the pantry, stamp the date and estimate how many days it will last in the fridge. (Note 2026-11-06 23:45.) Status: **new**. Question Q1 and Q2 in convo v0.5.
- [ ] **Master list of fridge life.** Keep the estimate in an editable master list, separate from quantities and from whether an item is in the pantry. (Note 2026-11-06 23:45.) Status: **new**. Question Q2 in convo v0.5.
- [ ] **Fridge and kitchen buttons.** In addition to the pantry button, add a fridge button and a kitchen button. Each feeds its items straight into the right groups, such as wet, dry and tools. (Note 2026-11-06 23:46.) Status: **question**. The current app has a place choice (fridge, pantry, freezer, other) and a kind (dry, wet, tool, space) in the database, but no kitchen. Question Q3 in convo v0.5.
- [ ] **Clarify the unbuilt list.** The note from 2026-11-06 23:44 says "a few other things that are not built" but does not name them. Status: **question**. Question Q4 in convo v0.5.
- [ ] **Test note.** "Test note 1 round two" (2026-11-07 00:45) looks like a test, not feedback. Status: **question**. Question Q5 in convo v0.5: leave it open or mark it done.

Notes marked done on 2026-11-07 after Jimmy's confirmation (status done, text prefixed "Done- "). The items above stay open until built or answered.

## Round 2026-11-07, answered in convo v0.6

- [x] Food list page linked from Settings (Pages): `foods.html`, saves to `wtc_foods`. Built, not yet pasted into the database.
- [ ] Paste `supabase/foods_what_to_cook.sql` into the Family SQL editor and send back the one-row check.
- [ ] Auto-stamp fridge days when an item goes in (from the food list). Later build.
- [x] Q3: places tagged and shown by tapping Fridge, Freezer, Pantry or Other.
- [x] Q4 skipped at Jimmy's request.
- [x] Q5: done items are ignored from future review, not deleted.

## Earlier items

See `convo/convo v0.2.md`, `convo v0.3.md` (food journal) and `convo v0.4.md` (pantry behaviour, open items 12–13).
