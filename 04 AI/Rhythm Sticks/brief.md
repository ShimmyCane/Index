# Rhythm Sticks — brief

**Updated:** 2026-11-12
**Status:** MVP 0.3.1, not device-tested. All six modes built in one pass after `convo v0.2` answers.

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

## Version 0.3.1 (2026-11-13)

All 14 notes of the round were marked done in `rs_notes` (Jimmy's yes; read back to confirm). The Notes panel now pulls the table (`Family.pullNotes` → `AppNotes.merge`): a status set in the table shows on the device, notes from other devices appear, Open hides done notes, All shows them. Pulled on load, after sign-in and each time the filter changes. Checked with a made-up table reply.

## Version 0.3.0 (2026-11-13)

Built from the 14 notes and Jimmy's answers in `convo v0.6` (recorded in `convo v0.7`):
- **Audio sleep fix:** wake on every touch, on `visibilitychange` and `pageshow`; wake from "interrupted" as well as "suspended"; close the engine on `pagehide`; `navigator.audioSession.type = 'playback'`; a crossed-out speaker (drawn by `core.js`) when the engine is not running, and a tap on it wakes it. Cause on the iPad unconfirmed.
- **Error bar** fades after 5 s (opacity, not display), short, tap to pin; list also in ⚙️.
- **Two fingers** rewritten: colours, volume fader, pulse via a tremolo option on `A.voice`.
- **Footsteps** rewritten: desert, six tappable objects, rhythm road (15 rhythms of S/L/pause, half-second beat, window of 0.175 s either side, hold of at least 0.4 s, two clean rounds = solved, the creature plays the next bar by itself, an object unlocks), Free walk kept; progress in local storage.
- **Heat** has heat, pitch and chords views (two-finger tap; chords by harmonic-sieve peak picking on an 8192 FFT, steady over 3 of the last 6 looks).
- **Ripples** up/down choice (`A.voice` now takes filter, vibrato, echo and tremolo), **pads** 15 sounds from a seed (`RS.rng`, `RS.seed`, `RS.setSeed`), **dot loop** eight sliding rings, **echo** four adaptive levels with a sung tone (`A.voiceNote`), mode narratives (`js/info.js`, upper-right card).
- Checked headless (see `convo v0.7`); every sound's peak level measured through `A.meter()`. Not checked on an iPad.

## Version 0.2.0 (2026-11-13)

- **Lag:** beads taps act on touch (a second tap within 330 ms wipes); the clap detector is an AudioWorklet (blocks of ~3 ms, rise-within-12-ms test so slow breath and speech don't fire) with the old analyser detector as fallback; audio engine built at page start and primed inside the first touch; string pitches built once at mode start; `A.maskUntil` makes the detector ignore ~140 ms after noisy drums so loops don't re-trigger themselves; ⚙️ → Sound lag shows engine latencies and a speaker-to-microphone round trip.
- **Five new modes:** echo (taps or claps, answers changed), marbles (pegs as bells), dot loop (two rings, sweeping hand), footsteps (left/right taps, a creature), hum trail (autocorrelation pitch, no sound output).
- **Hidden breathing garden** (`js/modes/breathe.js`, not in `RS.order`, opens from ⚙️ or `#breathe`): breath sensing = adaptive floor, hysteresis, low-sound ratio for out vs in, alternation when unsure; a held finger always means breathing out. Gardens: sand rake, fountain (asks 0.75 s more each knock), blossom (pacer 4/6 s, lengthens to 6/10 on success; only the out-breath is checked). Longest breath kept in local storage only. Calm game, not medical.
- Checked headless (made-up sound through `mic._attachTest`): 4/4 claps heard, 0 slow swells; hum finds 220 Hz within 4%; every new mode and the three gardens respond; full earlier smoke run and the microphone-permission check still pass. Not checked on a real iPad or with real breath or claps.

## Notes round 2026-11-13 (14 open notes read, version 0.2.0; all built in 0.3.0, not yet marked done)

Read 14 open notes from `rs_notes`: 2 already answered by 0.2.0 (lag fixes, five new games), 4 bug reports (errors bar covers the gear; audio goes quiet after a while or after refreshes in three modes, two-fingers can go silent for good), and 8 design requests (two fingers: colours, volume slide, extra beat; footsteps: objects and a 15-rhythm game; heat map: pitch and chord views; ripples: a vertical-axis drop-down; pads: more sounds; dot loop: up to eight tracks; echo: mode narratives and a voice tone). Nothing built or marked done yet. Items in `todo.md`, questions and the proposed footsteps rules in `convo/convo v0.6.md`. Likely audio cause (unconfirmed on the iPad): the engine is only woken from "suspended", not "interrupted"; nothing closes it on refresh.

## Notes round 2026-11-12

Read 2 open notes from `rs_notes` (live on the Family project): lag between tap and sound (cause not yet pinned; sources found in the code are listed in `todo.md`), and a request for more "figure it out as you go along" games like Beads (five proposed). The lag and the new games are now built (0.2.0). The notes are not marked done yet; that waits for Jimmy's yes after he tries it. Questions in `convo v0.4.md` and `convo v0.5.md` (both answered) and `convo v0.6.md`; items in `03 Projects/Rhythm Sticks/todo.md`.

## Next steps

1. Jimmy plays it on the iPad, runs ⚙️ → Sound lag, and leaves notes in ⚙️.
2. Tune the onset detector from real claps and speech.
3. Run the rolled-back SQL test, apply `001_rs_notes.sql` when asked, record in `04 AI/Supabase/brief.md`.
4. `/graduate-project` when ready (the microphone needs https).
