# Rhythm Sticks — Convo v0.3

**Project:** Rhythm Sticks
**Round:** Jimmy's answers to convo v0.2, and the first build

1. **Beads playback:** beats are saved as time stamps and played back as synth drums, never the recorded mic sound. Acceptable for this application.
2. **Loop length:** comes from the first recording (the time between the first and second tap).
3. **Beads controls:** the taps are on the screen; the microphone only hears the beats.
4. **Home:** goes to "this music page". Taken as the music app's own page: Home reloads Rhythm Sticks, which picks a new random mode. It does not go to the nursery home page.
5. **Build:** all at once. Taken as all six modes in one build: Ripples, Beads, Shake pads, Strings, Two fingers, How the machine hears.
6. **Merge:** merge the pull request.

## What was built (version 0.1.0)

- `index.html` with `css/app.css` and `js/` (`core`, `audio`, `mic`, six files in `modes/`, `notes`, `family`, `gear`, `app`). Plain scripts, no build; opens from a file or a server.
- Random mode on load, never the same twice in a row. `index.html#strings` (or any mode name) opens that mode.
- Hidden ⚙️: a circle in the lower-right corner shows it; it fades after about 2 seconds unless "Keep ⚙️ visible" is on. In the drawer: mode picker and Home, sound and look, per-mode options (microphone sensitivity, strings, pad outlines and shuffle, pitch steps or glide, stop the held note, new ripple pattern), Beads how-to, family database sign-in, notes for improvement with note log, show errors, and Info with the version and changelog.
- Notes carry the mode, time and version; they stay on the device and are also sent to the family table when signed in.
- SQL for the family notes table is written in `supabase/` (`test_001_rs_notes.sql`, `001_rs_notes.sql`, `verify_001_rs_notes.sql`). **Nothing has been pasted or applied.** Until then the database block says "this device only" after sign-in fails or while signed out.

## Checked in headless Chromium (fake microphone)

All six modes at 1180×820, 768×1024 and 390×844: no errors and no horizontal scroll. Gear gesture, 2-second fade and keep-visible, random mode, ripples hold and slide, beads record → loop → overlay → double-tap wipe, pads, strings (1 and 3, frets), two-finger span (pitch, loudness, held note), heat map freeze, mode picker, notes saved and reloaded, error panel at the bottom, and loading from `file://`.

## Not tested

Sound by ear on a real iPad; a real finger and real two-finger touch; real clap or speech against the onset detector (the test used the browser's fake microphone and a hand-fired beat); real sign-in; the SQL (not applied).

## Questions after a first play

1. **Beads sensitivity.** Does a clap register and ordinary talking stay quiet at the default? What do you want changed?
   - Answer:
2. **Which mode feels best, and which feels wrong?** Use ⚙️ → Notes for improvement; each note is tied to the mode.
   - Answer:
3. **Database.** Shall I run the rolled-back test, then apply `001_rs_notes.sql`, or will you paste it by hand?
   - Answer:

---
