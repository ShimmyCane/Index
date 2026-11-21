# Athena's Piano Companion — brief

**State (2026-11-21):** 0.2.0 built from the first seven real notes and Jimmy's answers (convo v0.3, v0.4). 0.1.0 was used on a real iPad (the notes show it). 0.2.0 is headless-tested only. SQL 001 applied; SQL 002 (recycle bin, sessions, delete rights) written with test and verify, **not applied**. Notes not marked done yet (waiting for Jimmy).

**0.2.0 changes:** trim keeps 2 s of pause (setting 1 to 3 s); Ways to start panel and learned start notes; stop phrases add "stop" and "I'm done" (migrated); soft delete with recycle bin, undo bar (5 min), 30-day purge when signed in; sessions = one day, Take N restarts each day; Browse page; Home page (`index.html`), Record at `record.html`, 🏠 on every page; player button cycles five names; Compose quick bar and pinch zoom. Sync keeps working before 002 is applied (new columns are left out).

**Earlier state (2026-11-20):** MVP 0.1.0 built in one round from Jimmy's answers (convo v0.1). Headless-tested.

**What it is:** hands-free recording companion for free piano play (Track A). Record page, Library (edit), Listen (albums, artists, ratings, playlists), Compose (four layers).

**Architecture:** plain HTML/CSS/JS, no build. Microphone → AudioWorklet (ScriptProcessor fallback) → `Listen.feed` (all timing on the audio clock) → level, onsets, rough pitch, capture. `trim.js` and `mixer.js` are pure and node-testable. Takes: IndexedDB (audio included) first, then `store.js` syncs to the Family project (`pc_takes` etc., private bucket `pc-takes`). Cues are synthesized. Speech recognition for voice start/stop, with the big circle as the always-working path.

**Verified (headless Chromium):** wake → learn stop notes (pitch read as 60/64/67) → count-in → pause stop → saved take; stop-note stop trimmed the gesture off; real microphone path through the worklet with a fake device (no errors); library edit/rating/filter/play; player album/playlist/add; compose add/split/repeat/speed/undo/drag move/trim/export; no horizontal scroll at 390 and 768; trim and mixer unit checks in node.
**Verified on a real device (via the database, 2026-11-21):** Jimmy recorded at least four takes with version 0.1.0 and the notes and takes synced. **Unverified:** a real piano through the iPad microphone (threshold, pitch reading); speech recognition on iPad Safari (and with the microphone open at the same time); long takes (memory, upload size); touch drag in Compose on a real finger.

**Round 2 (2026-11-21):** the SQL is **applied** (Jimmy pasted it). Read-only check: five `pc_` tables with RLS on, bucket `pc-takes` private, five registry rows, none unregistered; six takes, all six audio files uploaded (so device-to-family sync works), seven notes, no playlists. Seven open notes read and written up in `convo/convo v0.3.md` and `todo.md`; none built. Notes not yet marked done (waiting for Jimmy's yes).

**Database (original check):** names were free in the Family project (read-only check 2026-11-20). `test_001_pc`, `001_pc_family`, `verify_001_pc` in `03 Projects/Athena's Piano Companion/supabase/`; checked with `sql_paste_check.py` (the only WARN is that the real file has no embedded rollback test; the test is its own file). Not applied; Jimmy pastes by hand.

**Next:** Jimmy's real-piano test and notes; apply SQL; tune thresholds; MIDI later.
