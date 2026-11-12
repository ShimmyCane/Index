# Rhythm Sticks — brief

**Updated:** 2026-11-12
**Status:** MVP 0.1.1, not device-tested. All six modes built in one pass after `convo v0.2` answers.

## Goal

A wordless web toy that exposes the kids to rhythm and sound. Random mode on load (never the same twice); touch and microphone make sound and picture together. Track A, family play.

## Architecture

Plain HTML/CSS/JS, Web Audio synthesis, no build, no audio files. `js/core.js` owns settings, errors, one full-screen canvas, pointer routing and the corner-circle gesture (the lower-right 120 px is reserved for it, so taps there never reach a mode). `js/audio.js` holds voices, a Karplus-Strong pluck and noise drums. `js/mic.js` is the onset detector: high-band energy, a slow baseline, a sharp-rise test, 140 ms cooldown, sensitivity slider. Each mode in `js/modes/` exposes `start/stop/down/move/up/draw/info`. The microphone starts only in Beads and Heat, is never connected to the speakers, and is released when leaving them.

- Modes: ripples, beads (tap = record, tap = loop, tap = overlay layer, double tap = wipe; synth drums by layer), pads (hidden 3×3, shuffled each load), strings (1–3, frets on the right when 2+), span (3/5 pitch, 2/5 loudness, lock on release), heat (spectrogram, tap freezes).
- Hidden ⚙️ fades after 2 s unless kept. Drawer: mode picker + Home (reload), sound, per-mode options, Beads how-to, family sign-in, notes, errors toggle, Info.
- Family database: `rs_notes` via `supabase/001_rs_notes.sql` (+ test and verify). **Live** (seen 2026-11-12: RLS on, three family policies, no anon grants, registered as `rhythm-sticks`, 2 rows). Applied by Jimmy. `js/family.js` uses the publishable key only; signed out, notes stay on the device.

## Microphone permission (0.1.1)

A page cannot force a browser to remember a yes. It asks as seldom as it can: no new request after a refusal (⚙️ has "Try the microphone again"); where the Permissions API says `granted`, leaving Beads or Heat releases the mic and coming back starts it silently; where it cannot tell (Safari), the stream is kept switched off for the visit so mode changes don't ask again, and it is released on `pagehide`. `rs.micOk` in storage records that a yes was given. Checked with a fake device for all three paths (granted, unknown, refused).

## Verified (headless Chromium, fake mic, 2026-11-12)

Six modes × three sizes: zero errors, no horizontal scroll; gear circle, fade, keep-visible; random never repeats (12 loads); ripples hold/slide; beads record/loop/overlay/wipe; pads 9/9 respond; strings 1 and 3 with frets; span pitch/loudness/lock/stop; heat freeze; mode picker; notes persist across reload; error panel at the bottom; `file://` load.

## Not verified

Sound by ear on iPad; real two-finger touch; clap vs speech against the real onset detector (thresholds are a first guess); real sign-in; the SQL has not been run (checked only with `sql_paste_check.py`).

## Notes round 2026-11-12

Read 2 open notes from `rs_notes` (live on the Family project): lag between tap and sound (cause not yet pinned; sources found in the code are listed in `todo.md`), and a request for more "figure it out as you go along" games like Beads (five proposed). Nothing built or marked done yet. Questions in `03 Projects/Rhythm Sticks/convo/convo v0.4.md`; items in `03 Projects/Rhythm Sticks/todo.md`.

## Next steps

1. Jimmy plays it on the iPad and leaves notes in ⚙️.
2. Tune the onset detector from real claps and speech.
3. Run the rolled-back SQL test, apply `001_rs_notes.sql` when asked, record in `04 AI/Supabase/brief.md`.
4. `/graduate-project` when ready (the microphone needs https).
