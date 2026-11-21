# Athena's Piano Companion — lessons

- 2026-11-20: Start. Hands-free instrument tools should have a touch fallback for every voice command, because speech recognition support varies (iPad Safari) and piano sound can be mistaken for speech.
- 2026-11-20: **Drive everything from the audio clock.** Counting samples (not wall time) for level, silence and onsets lets a test feed made-up sound instantly with `Listen.feed()`, and the same code runs live from the worklet.
- 2026-11-20: **Turn off echo cancelling, noise suppression and auto gain** in `getUserMedia` for music; they distort piano notes.
- 2026-11-20: **The count-in leaks into the recording** through the speaker. Keep the last beat short and skip the first 0.2 s when finding the first note.
- 2026-11-20: **A learned gesture needs a context guard.** The stop notes only count after a pause (about 0.8 s), so the same few notes in the middle of a tune do not stop the take. Match rhythm within 35% and pitch within a semitone (octave slips allowed), because autocorrelation pitch is rough.
- 2026-11-20: **A voice stop leaks into the take.** Cut back to the last quiet gap before the words; fall back to 2 s.
- 2026-11-20: Playwright's mouse coordinates are viewport-relative; scroll the page to the top and re-measure before dragging on a canvas (a click on a list item had scrolled it away).
- 2026-11-20: A table that a pull replaces must carry `updated_at` on every synced table (the playlist-items table first had only `added_at`, and the shared sync code failed). Give every synced table the same columns.
- 2026-11-21: **Dictated notes carry slips** ("paddle" for panel, "shouldn't" for should, "for" for "four"). Read for intent, say the reading in the convo, and let Jimmy correct it.
- 2026-11-21: **The first real notes arrived within hours of the first build:** seven notes, mostly about ending takes cleanly, deleting, and who is playing. Real use finds the missing delete and home page at once; ship the notes box with the first build every time.
- 2026-11-21: A "no delete" safety choice (takes undeletable) was reversed by the owner within a day. Prefer soft delete with a recycle bin from the start.
- 2026-11-21: **Ship code that survives a database that is one migration behind.** The app drops the new columns and skips the new table when the database says they do not exist, so syncing keeps working until the owner pastes the SQL.
- 2026-11-21: "Trim the tail" meant two different things (the fade, or the quiet). The owner's answer: measure the pause from where the music ends and keep only 2 s of it. Define "the music ends" by a share of the take's own peak, not a fixed low threshold, or a piano's slow fade counts as music.
- 2026-11-21: A re-render on every saved edit steals the cursor from a text box. Re-render lists on explicit events (delete, restore, sync) and not on the save of an edit.
- 2026-11-21: Test pinch and drag with synthetic pointer events and `try/catch` around `setPointerCapture`; a synthetic pointer id is not capturable.
