# Rhythm Sticks — todo

## Round of 2026-11-12 (notes read from `rs_notes`, 2 open notes, both on version 0.1.1)

Built in 0.2.0 after Jimmy's answers (`convo/convo v0.5.md`). "Built" means the code and a headless check; nothing is measured on the iPad yet.

### Note 1 (saved while in "How the machine hears"): lag between the button and the sound
Type: bug / performance, mode unclear (the heat map makes no sound, so the note is probably about another mode).
- [x] Jimmy answered: the beads show but the drum should answer at once; all fixes approved (`convo v0.5`).
- [x] Beads: the first tap waits 330 ms before it starts recording, so it can feel late and early claps are missed. Start recording on the first tap at once and let a double tap cancel it.
- [x] Beads and heat: the microphone is read through a 2048-sample window (about 45 ms) and once per screen frame. A smaller window (512) and checking the raw waveform as well would hear a clap sooner.
- [x] First touch: the audio engine starts on the first tap, so the first sound can arrive late. Start it with a silent sound inside that tap.
- [x] Strings: the plucked-string sound is computed on every pluck. Compute each pitch once and reuse it.
- [x] Say plainly in the notes if the rest is the device: Bluetooth speakers or earbuds add 100 to 200 ms that no page can remove.
- [x] Add a small "sound lag" check in ⚙️ (tap, see how late the sound starts, measured with the audio clock) so lag can be measured on the iPad rather than guessed.

### Note 2 (saved in Beads): "I love how beads work, it's very figure it out as you go along. Can you think of a few more games like this?"
Type: new feature / design question. Not built.
- [x] Build all five: Echo, Marbles, Dot loop, Footsteps, Hum trail.
- [ ] Keep the rules: wordless, no lessons, every touch makes sound and picture, rules found by playing.

## Carried from the first build
- [ ] Play on the iPad and tune the onset detector with real claps and speech.
- [ ] Real two-finger touch check on the iPad.
- [ ] Real family sign-in check (the table is live and the notes arrive, so sending works; sign-in on a real device is what is still unseen by me).

## Round of 2026-11-13 (version 0.2.0)
- [x] Hidden breathing garden with three gardens: Sand rake, Fountain, Blossom (`convo v0.5`).
- [ ] Measure the real lag with ⚙️ → Sound lag on the iPad, and record it.
- [ ] Tune the clap detector with real claps and talk, and the breath detector with real breath.
- [ ] Decide whether the breathing garden needs its own shortcut.
- [x] Marked done with the rest on 2026-11-13.

## Round of 2026-11-13, evening (14 open notes read from `rs_notes`, versions 0.1.1 and 0.2.0)

Nothing below is built yet. Questions are in `convo/convo v0.6.md`. Note ids are in the convo so the table can be updated later.

### Already worked on in 0.2.0 (waiting for Jimmy to try them, then mark done)
- [ ] Lag between tap and sound (heat, 0.1.1): the fixes are in 0.2.0; waiting for the number from ⚙️ → Sound lag.
- [ ] "A few more games like Beads" (beads, 0.1.1): Echo, Marbles, Dot loop, Footsteps, Hum trail are in 0.2.0.

### Bugs
- [ ] **Errors bar hides the ⚙️ button** (pads, 0.1.1). The error panel is full width at the bottom with a higher layer than the gear. Leave the lower-right corner free and put the gear above it.
- [ ] **Audio dies after a while or after many refreshes** (three notes: dot loop "audio stops playing after a while", pads "volume disappears after refreshing for a while", two fingers "audio doesn't seem to work"). In the code: the audio engine is only woken when it reads "suspended" (iPad Safari can also say "interrupted" after a screen lock or a switch of app), it is only woken on a touch, nothing closes the old engine on refresh, and there is no mute-switch setting for the iPad. Proposed fix: wake on every touch and whenever the page comes back, treat "interrupted" like "suspended", close the engine when the page is left, ask Safari to play through the mute switch, and show a small crossed-out speaker when the engine is not running (tap it to wake). Cause on the iPad is not confirmed.
- [ ] **Two fingers can go silent for good** (found while reading the code). If two fingers on the right side ever come close together, the loudness drops to zero, the note stops, and the next note starts at that zero loudness. Fixed by the loudness slider below (a one-finger slider that can't land on zero by accident).

### Design requests (each needs an answer; see the convo)
- [ ] **Two fingers** (span, 0.1.1): colours should change as fingers move; the right side should be a slide up/down for volume; two fingers on the right might add a beat or something else.
- [ ] **Footsteps, objects** (0.2.0): objects along the road that make different sounds when tapped. The note says "Batman objects"; read as "background objects" (to confirm).
- [ ] **Footsteps, rhythm** (0.2.0, two notes): tap to a rhythm and a build-up, then he continues for a few steps on his own; a rhythm game with about 15 rhythms unlocked by beats and pauses; the road gives a long beat. A rule set and 15 rhythms are written out in the convo, ready to build and to add to the mode description.
- [ ] **Heat map** (0.2.0): keep one tap = freeze; two fingers switch to a pitch filter (records the same, plays back what pitch you are on, for singing) and a chord filter (three or more piano notes shown on a music staff).
- [ ] **Ripples, up and down** (0.2.0, two notes): something subtle along the vertical axis, chosen from a drop-down in ⚙️, with "none" as an allowed choice. The note says "X axis"; read as the up-and-down axis, since left-right already sets the note.
- [ ] **Shake pads, more sounds** (0.2.0): a set of arcade-style sounds, plus five more interesting ones.
- [ ] **Dot loop, more tracks** (0.2.0): up to eight tracks; a new one appears after each is filled; the rings reflow and the dots shrink to fit.
- [ ] **Echo, mode descriptions** (0.2.0): a short narrative of what each mode does, in ⚙️.
- [ ] **Echo, voice** (0.2.0): a voice-like tone instead of bells, and a longer first sound that is easier to match.

## Round of 2026-11-13, built in 0.3.0 (answers in `convo/convo v0.7.md`)
- [x] Audio wakes from sleep; crossed-out speaker; engine closed on leaving; mute-switch setting.
- [x] Error bar: short, fades after 5 seconds, tap to keep; gear above it.
- [x] Two fingers: colours, volume slide, pulse; no silent trap.
- [x] Footsteps: desert, six tappable objects, rhythm road with 15 rhythms, Free walk kept.
- [x] Heat map: pitch view and chords view, switched by two fingers.
- [x] Ripples: up/down drop-down (None, Tone, Sustain, Attack, Timbre, Vibrato, Echo).
- [x] Shake pads: 15 sounds, random layout from a seed number, seed in ⚙️.
- [x] Dot loop: up to eight rings that slide to the front for editing.
- [x] What each mode does: the upper-right corner card and a ⚙️ panel.
- [x] Echo: four levels that learn how well you play; sung answers.
- [x] The 14 notes are marked done in the family table (2026-11-13, Jimmy's yes); 0.3.1 shows them under All.
- [ ] Try it on the iPad: audio waking, the rhythm road window, Echo levels, real chords.
- [ ] Ideas not built: Echo singing back the pitch you used; a Footsteps rhythm editor; more Marbles boards.
