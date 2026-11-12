# Rhythm Sticks — todo

## Round of 2026-11-12 (notes read from `rs_notes`, 2 open notes, both on version 0.1.1)

Nothing here is built yet. Code is not changed until Jimmy answers `convo/convo v0.4.md`.

### Note 1 (saved while in "How the machine hears"): lag between the button and the sound
Type: bug / performance, mode unclear (the heat map makes no sound, so the note is probably about another mode).
- [ ] Find out which mode and which action lags (`convo v0.4`, Q1 and Q2).
- [ ] Beads: the first tap waits 330 ms before it starts recording, so it can feel late and early claps are missed. Start recording on the first tap at once and let a double tap cancel it.
- [ ] Beads and heat: the microphone is read through a 2048-sample window (about 45 ms) and once per screen frame. A smaller window (512) and checking the raw waveform as well would hear a clap sooner.
- [ ] First touch: the audio engine starts on the first tap, so the first sound can arrive late. Start it with a silent sound inside that tap.
- [ ] Strings: the plucked-string sound is computed on every pluck. Compute each pitch once and reuse it.
- [ ] Say plainly in the notes if the rest is the device: Bluetooth speakers or earbuds add 100 to 200 ms that no page can remove.
- [ ] Add a small "sound lag" check in ⚙️ (tap, see how late the sound starts, measured with the audio clock) so lag can be measured on the iPad rather than guessed.

### Note 2 (saved in Beads): "I love how beads work, it's very figure it out as you go along. Can you think of a few more games like this?"
Type: new feature / design question. Not built.
- [ ] Choose which of the proposed "figure it out" modes to build (`convo v0.4`, Q3). Candidates: Echo, Marbles, Dot loop, Footsteps, Hum trail.
- [ ] Keep the rules: wordless, no lessons, every touch makes sound and picture, rules found by playing.

## Carried from the first build
- [ ] Play on the iPad and tune the onset detector with real claps and speech.
- [ ] Real two-finger touch check on the iPad.
- [ ] Real family sign-in check (the table is live and the notes arrive, so sending works; sign-in on a real device is what is still unseen by me).
