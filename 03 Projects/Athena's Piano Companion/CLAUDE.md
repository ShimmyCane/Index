# Athena's Piano Companion — Claude Code pointer

Purpose: a hands-free companion for free piano play. It listens, starts a take on a spoken phrase after a count-in, ends it by a pause, stop notes, voice or the big circle, trims it, saves it, and syncs it to the family database. Other pages: Library (edit), Listen (albums, artists, ratings, playlists), Compose (four layers).

Track: A. Family play

- Design: `schematic.md` · Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Athena's Piano Companion/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: `python3 -m http.server` in this folder, open `index.html` (Home; Record is `record.html`) (localhost or https; the microphone needs it). No build.
Code map: `js/app.js` (settings, errors, WAV, helpers), `family.js` (sign-in, tables, bucket), `store.js` (IndexedDB + sync), `chrome.js` (⚙️ gear and shared panels), `notes.js`, `cues.js` (count-in sounds), `listen.js` (microphone, onsets, pitch, stop-note match), `trim.js` (pure), `voice.js`, `strip.js` + `recorder.js` (record), `players.js` (who is playing), `bin.js` (delete and recycle bin), `home.js`, `browse.js`, `library.js`, `player.js`, `mixer.js` (pure) + `compose.js`.
Check: headless Chromium; stub `Listen.start` and feed made-up sound with `Listen.feed(Float32Array)` (audio-clock timing, no waiting); `node` can load `js/trim.js` and `js/mixer.js` directly. Keep test scripts out of the repo.

Project rules:
- Public repo. No recordings, surnames, school or place names. First names only.
- Microphone audio is processed in the page; takes are stored on the device and the private bucket `pc-takes` only. Never committed.
- Web Audio synthesis for cues; no audio files in the repo.
- Every voice command has a touch alternative.
- Supabase: Family project, tables `pc_*` and bucket `pc-takes`, publishable key only. SQL in `supabase/` (for each number: `test_`, then the numbered file, then `verify_`, by hand). 001 and 002 are applied (002 checked read-only 2026-11-22: `pc_sessions`, `deleted_at` and `session_id` present).
- A take is never removed at once: delete marks `deleted_at`; the 30-day purge removes it.
