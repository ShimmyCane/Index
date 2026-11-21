# Athena's Piano Companion — todo

- [x] 0.1.0: record loop, library, listen, compose, SQL written
- [ ] Jimmy: paste the SQL (test, 001, verify) in the Family project; paste the verify result back
- [ ] Jimmy: try on the iPad with the digital piano; notes in ⚙️
- [ ] Tune: microphone sensitivity, pause length, stop-note tolerance from real playing
- [ ] Check voice start and stop on iPad Safari
- [ ] MIDI input (laptop Chrome) when asked
- [ ] Compose: beat grid, time-stretch, more than four layers if wanted
- [ ] Smoke test at 390 × 844, 768 × 1024, 1180 × 820 on all four pages with a real session

## Round 2 — notes read from the family table on 2026-11-21 (seven open notes, version 0.1.0)

Source: `pc_notes` (live). Note ids are in `convo/convo v0.3.md`. Nothing below is built yet.

- [x] **Trim the tail** (note 1), built 0.2.0, headless-tested: a pause or voice stop should leave about 2 seconds at most after the music, no long tail. Needs an answer on what "tail" means (convo v0.3 Q1).
- [x] **Ways to start panel** in ⚙️, just before "Ways to stop" (note 2): which start ways exist and which are on. Needs an answer on the wording and the list (Q2).
- [x] **More stop phrases** (note 3): add "stop" and "I'm done". Small. Saved phrase lists on the device must get the new ones too.
- [x] **Delete takes, with a recycle bin** (note 4): confirm pop-up, then a second reminder pop-up; a deleted take is only marked deleted and can be restored; takes deleted over 30 days ago are purged. Needs answers (Q3).
- [x] **Sessions** (note 4): save each sitting as its own entry (date and time), with its takes under it.
- [x] **Browse and promote page** (note 4): the whole database ranked by stars, filter to a quality, rename, promote, delete low quality quickly. Needs answers (Q4).
- [x] **A home page** and a way back to it from every page (note 5). Needs an answer on which file is home (Q5).
- [x] **Compose: quick actions on a picked clip** (note 6): split, delete and duplicate right at the clip; two-finger pinch to zoom the timeline.
- [x] **Players** (notes 7): Athena, Felix, Ying, Jimmy, Guest, chosen by tapping through them in that order, one control instead of the chips. Needs an answer on what "account" means (Q6).
- [x] Database change for the above: `supabase/002_pc_bin_sessions.sql` written with its test and verify; **not applied** (Jimmy pastes). Was:  (a new numbered SQL file, with its test): `deleted_at` on takes, a sessions table, `session_id` on takes, delete rights for the 30-day purge. Written only after the answers.
- [ ] Jimmy: paste `test_002_pc`, `002_pc_bin_sessions`, `verify_002_pc`; paste the verify result back
- [ ] Jimmy: confirm which notes are done, then mark them in `pc_notes`

## Round 3 — notes read from the family table on 2026-11-21 (two new open notes)

Source: `pc_notes` (live). The seven notes from round 2 are built in 0.2.0 but still `open` in the table until Jimmy says which are done. Nothing below is built yet.

- [ ] **The 3, 2, 1 tick hears itself** (note 9, Take 10): the tick sound played with each number of the ending countdown is heard by the microphone as a note, so the pause is cancelled and the take keeps recording. Found in the code (`js/recorder.js` calls `Cues.tick()` on every number). Fix as Jimmy suggests: make the countdown silent (the circle blinks and the big number shows); optional sound only if it can be kept out of the take. Bug, clear.
- [ ] **A take sometimes stops by itself, and a soft reset** (note 8): needs the reason for each ending, and a "restart listening" that does not reload the page. Needs answers (convo v0.5 Q2).
- [ ] **Older files can be served from the browser's cache:** note 9 came from `record.html` but carries version 0.1.0, so the browser used an old `app.js`. Add a version to every script and style link so a new build always loads. Small.
- [ ] **Silent wait, then silent 3-2-1** (note 12): after a gap of about 3 to 4 seconds of quiet, then a silent 3, 2, 1, then stop. This replaces the current rule (the countdown starts 2 seconds into a 5-second pause). Needs an answer on the number (convo v0.6 Q1).
- [ ] **A live card while recording** (note 10): a card appears as soon as recording starts, with a growing picture of the sound and a running time; when it ends it shows "Saving..." for a moment, then settles into the normal take card. Needs an answer (Q2).
- [ ] **A red line moving over the card while it plays** (note 11): the position marker on the card's picture during playback from the Record screen. Needs an answer on other pages (Q3).
