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
- [ ] Mark the two read notes done once Jimmy has tried the changes (needs his yes).
