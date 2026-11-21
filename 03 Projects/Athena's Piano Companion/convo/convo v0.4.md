# Athena's Piano Companion — Convo v0.4

**Project:** Athena's Piano Companion
**Round:** the build for the seven notes, version 0.2.0 (2026-11-21), from your answers in v0.3. Headless-tested only. **Nothing is marked done in the notes table yet.** Tell me which notes you consider handled after you try it.

## What changed, note by note

1. **The tail** (note 1): a take now keeps only **2 seconds of pause** after the music ends, however long the quiet was (6 or 7 seconds is trimmed back). "The music ends" is where the sound last rises above about 8% of the take's loudest moment, so a piano's slow fade does not count as music. The last 0.8 s fades out. ⚙️ → Recording → "Pause kept at the end of a take" lets you choose 1, 2 or 3 seconds.
2. **Ways to start** (note 2): a new ⚙️ panel just before "Ways to stop": tap the circle (always on), voice commands and the start phrases (moved here), and optional **start notes** you teach the same way as the stop notes. Stop phrases moved into "Ways to stop".
3. **Stop phrases** (note 3): stop recording, stop recording please, **stop**, **I'm done**. Devices that saved the old list get the new phrases added once.
4. **Delete, sessions, browse page** (note 4):
   - A **🗑 Delete** button on each take in Library and Browse. A pop-up asks "Delete this take?", then a bar at the bottom says it is in the recycle bin for 30 days, with **Undo** for five minutes.
   - Deleted takes are only marked. **Browse → Recycle bin** restores them or deletes them for good. The page removes takes that have sat in the bin for 30 days (and their audio files) the next time it is opened signed in.
   - A **session is one day**. The first take of a new day is **Take 1** again (counted for each player); otherwise numbering continues. Each day has an entry in a new sessions table.
   - **Browse** lists every take, best first, with a "show only ★ 3+" style filter, quick rename, stars to promote, play, delete, tick several and **Delete selected**, and a "By day" view.
5. **Home** (note 5): `index.html` is now the Home page with big buttons (Record is the biggest), a line about today, a list of days, and a "Back to ..." button for where you were. **Record moved to `record.html`.** Every page has a 🏠 button at the top. The nursery tile opens Home.
6. **Compose** (note 6): a small bar right above the picked clip: ✂️ Split, ⧉ Duplicate, 🗑 Delete, ↩️ Undo. Two fingers pinch to zoom the timeline.
7. **Players** (note 7): one button cycling **Athena → Felix → Ying → Jimmy → Guest** and back. Guest asks for a first name the first time (change it in ⚙️ → Take cards). Players are only the name a take is saved under.

## Before the new database parts work

The recycle bin, sessions and the 30-day purge need **`supabase/002_pc_bin_sessions.sql`**. Until it is pasted, the app keeps working: takes sync without the new columns, the sessions sync is skipped, and the bin works on the device only (a bin entry is not copied to other devices, and the purge of audio files in the family bucket will not be allowed).

Paste order, in the Family project's SQL editor:
1. `test_002_pc.sql`: expect an error that starts `RESULT: take_cols=2 sessions=1 bin=1 live=1 delete_policy=1 storage_delete=1 anon_blocked=t registry=1`. That error is the pass (it rolls back).
2. `002_pc_bin_sessions.sql`: expect "Success".
3. `verify_002_pc.sql`: paste the result table back to me.

I have not run any of these against the live database.

## Questions (answer inline)

1. **Delete rights.** The 30-day purge needs the family login to be able to delete takes and their audio files (the SQL grants that). Are you comfortable with every signed-in family account being able to delete? (Deleted takes wait 30 days in the bin first.)
   - Answer:
2. **Start notes.** They only count after a pause of about a second, like the stop notes. Do you want them on by default once taught (as built), or off until you tick them?
   - Answer:
3. **Home first.** Should the nursery tile open Home (as built), or open Record directly with Home one tap away?
   - Answer:
4. **Guest.** One shared "Guest" name, or a name typed each time Guest is chosen?
   - Answer:
5. **Which notes are handled?** After you try it, tell me the ones to mark done. I will mark them in `pc_notes` only on your yes.
   - Answer:
