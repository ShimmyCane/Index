# Athena's Piano Companion — schematic

**Track: A. Family play** (confirmed, `convo/convo v0.1.md` question 1)
**Status: 0.2.0 (2026-11-21). 0.1.0 was tried on a real iPad (the notes show it); 0.2.0 is headless-tested only. SQL 001 applied; SQL 002 written, not applied.** Answers: `convo/convo v0.1.md`, `v0.3.md`. Build notes: `convo/convo v0.2.md`, `v0.4.md`.

## Purpose

A companion that sits beside the digital piano and listens while Athena (and sometimes Felix) plays freely. Her hands stay on the keys; her voice and her playing run the page. It catches takes, saves them with her name and the date, and syncs them to the family database, where other web apps can use them. Away from the piano she can listen, organise and compose with them.

## Track A defaults

| Setting | Value |
|---|---|
| Words on screen | few: the circle's one word, one hint line, take cards |
| Options visible | one big circle; who is playing (two chips); three page buttons |
| ⚙️ holds | everything secondary (count-in, pause, stop ways, voice phrases, card look, database, notes, errors) |
| Panels | collapsible; ⚙️ sections closed except the first |
| Palette | pastel family look (vanilla, sage, peach, mint, coral); 3px ink lines; offset shadows |
| Database | Family project, family login, tables `pc_*`, bucket `pc-takes`; device first |
| Private data | recordings are never committed; they live in the browser and the private bucket |
| Skills | `ipad_website`, `settings_gear`, `feedback_notes`, `project_track`, `supabase_link` |

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | big buttons to every page; today; days; back to where you were |
| Record | `record.html` | hands-free recording loop |
| Listen | `player.html` | albums, artists, ratings, playlists; playback |
| Library | `library.html` | edit take details; playback; download a file; delete |
| Browse | `browse.html` | every take, best first, star filter, bulk delete, recycle bin |
| Compose | `compose.html` | four-layer composer; quick bar on a picked clip; pinch zoom |

Players (a name a take is saved under, not a sign-in): one button cycles Athena, Felix, Ying, Jimmy, Guest. A **session is one day**; the first take of a new day is Take 1 again. Deleted takes are marked (`deleted_at`) and wait 30 days in the recycle bin, then the page removes them (and the audio file) when signed in.

## The recording loop

1. **Wake.** One tap (the browser needs it for the microphone and sound). The microphone is opened with echo cancelling, noise suppression and auto volume **off**, since they chew up piano notes.
2. **First use: learn the stop notes.** Play 3 to 5 notes, wait; play them again to check. Stored on the device (rhythm and a rough pitch for each note). "Skip for now" and "Learn again" in ⚙️.
3. **Waiting.** The circle breathes with the sound. Start by voice (`let's record`, `please record`, `start recording`, `start`; editable) or by tapping the circle.
4. **Count-in.** Four beats 0.7 s apart; the take starts on the fourth (short) one. Six styles in ⚙️: beeps, chimes, wood clicks, drum, voice, lights only.
5. **Recording.** Ends by any of: a **pause** (default 5 s; the circle blinks and a big 3, 2, 1 shows for the last three seconds; playing again cancels), the **stop notes** (only after a pause of about a second; cut from the take), the voice **stop recording / stop recording please** (the page cuts back to the last quiet moment before the words), or a **tap on the circle**. Each of the first three can be switched off in ⚙️.
6. **Trim.** The lead-in before the first note is cut (0.15 s kept). After the music ends (the sound last above about 8% of the take's peak) only **2 s of pause** is kept (1 to 3 s in ⚙️), with a cosine fade over the last 0.8 s. Nothing is saved if no real playing was heard.
7. **Save.** `Take N` (counted per player), player, album (`Free play YYYY-MM` unless set), a colour, a loudness picture, file name `player-date-time-takeN.wav`. 16-bit mono WAV. Saved in the browser (IndexedDB) first.
8. **Ready again** at once. A chime marks the save.

## Data

`pc_takes` (id, name, player, session_id, deleted_at, album, take_no, file_name, file_path, mime, duration_ms, size_bytes, sample_rate, rating 0–5, description, color, peaks, source `recorder`/`composer`, taken_at, updated_at) · `pc_sessions` (one per day) · `pc_playlists` · `pc_playlist_items` (playlist_id, take_id, position) · `pc_projects` (composer pieces as JSON) · `pc_notes`. Audio in the private bucket `pc-takes` at `<take id>.wav`. SQL: `supabase/` (`test_001_pc`, `001_pc_family`, `verify_001_pc`; round 2: `test_002_pc`, `002_pc_bin_sessions`, `verify_002_pc`). Registered under app `piano-companion`.

**Sync** (`js/store.js`): upload audio, then upsert the row; pull other devices' rows. Runs only while the page is waiting (not recording, not playing, 8 s after the last sound) and after sign-in. An unsynced local edit is never overwritten. Status pill: `💾 this device`, `☁️ synced`, `⚠️ check`.

## Compose

Four layers; a clip has `start` (shift), `in`/`out` (snip), `rate` (speed), `reverse`, `gain`, fades, `repeat`, `extend` (loops the clip's last moment). Cut = split at the play position. Drag to move (and between layers); drag an edge to snip. Undo and redo. The mix is made in the page, limited so it never clips, and can be saved as a take (`source = composer`) or downloaded.

## Feedback notes

Notes for improvement in ⚙️ on every page (`02 Refs/Skills/feedback_notes.md`). Each note carries the page and the take or piece on screen, the time and the version. Device first; sent to `pc_notes` when signed in.

## Increments

1. ✅ 0.1.0 — everything above.
2. ✅ 0.2.0 — round 2 from the first notes: 2 s pause trim, Ways to start and start notes, more stop phrases, recycle bin, sessions per day, Browse, Home, player cycle, Compose quick bar and pinch.
3. Next: apply SQL 002; real-piano test of 0.2.0; fixes from new notes.
4. Later: MIDI input (laptop Chrome), beat grid in Compose, time-stretch, a "hold to stop" circle, share a take.

## Risks and limits

- Speech recognition needs internet and may not work in every browser; the circle always works. Voice and microphone capture at the same time can conflict on some iPads (to test).
- The page cannot tell the piano from speech, so voice stop is cut by finding a quiet moment.
- Browser storage can be cleared; sync to the family database is the safety net.
- A three-minute take is about 16 MB (WAV).

## Privacy

No recordings, names beyond first names, or family details in the repo. The database holds recordings; the repo holds only code and SQL.
