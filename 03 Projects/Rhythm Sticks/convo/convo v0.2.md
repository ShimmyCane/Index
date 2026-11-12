# Rhythm Sticks — Convo v0.2

**Project:** Rhythm Sticks
**Round:** Jimmy's answers to convo v0.1 (given as review comments, recorded here)

1. **Track:** A. Family play. Confirmed.

2. **Hidden gear**
   - A "keep visible" toggle inside ⚙️ holds the gear on screen permanently.
   - Otherwise the gear fades about 2 seconds after it appears.
   - The circular stroke in the lower-right always brings it back.

3. **Random mode**
   - Never the same mode twice in a row.
   - Changing mode: from ⚙️ (mode picker), a Home link, or by refreshing the page. No gesture for the child.

4. **First build:** Ripples + Beads (mic) + Shake pads (option a).

5. **Sound:** pentatonic scale for pitched modes; soft sine/triangle ripple note with a long sustain. (Answered "Yes for both".)

6. **Look:** ripples over abstract patterns, randomized each time. Rings that grow and have a bit of brightness / glow. No images.

7. **Microphone / Beads**
   - Mic is only looked at: never played back, stored or sent. Yes.
   - Sensitivity slider in ⚙️. Yes.
   - **Beads are beats.** They beat from the microphone and loop:
     - single tap: record
     - another tap: loop what was recorded
     - further taps overlay more layers
     - double tap: record new, wiping the loop
     - Hints for these controls go in ⚙️, expanded. "Expand on these controls."

8. **Database:** Family project, family login, table `rs_notes`. Confirmed.
   - **Version log:** shows which version the file is, for easier tracking ("see index"). Taken as an Info row at the very bottom of ⚙️ (version plus short changelog), per `settings_gear.md`; the same number is saved with every note.

9. **"How the machine hears":** add it as a mode (later increment).

10. **Publishing:** GitHub Pages, `/graduate-project` when ready. Great.

## Questions

1. **Beads, taken as a beat looper.** I read Q7 as: the mic hears a tap or clap, and each detected hit is recorded as a beat (a time stamp in the loop), shown as a bead that pulses and played back as a short synthesized click or drum, not the mic sound. Is that right, or should the loop play back the *recorded sound*?
   - *(recommended: beats as timestamps, played as synth sounds. That keeps the "mic is never played back or stored" rule.)*
   - Answer:

2. **Loop length.** Should the loop length come from the first recording (record until the second tap) *(recommended)*, or be a fixed bar length?
   - Answer:

3. **Taps on screen vs. clapping.** The single/double-tap controls: are those taps on the screen, with the mic only hearing the beats? *(recommended)* Or should the child control it by clapping too?
   - Answer:

4. **"Home".** Should the ⚙️ Home link go to the nursery home page (`index.html` at the repo root, "All projects")?
   - *(recommended: yes)*
   - Answer:

5. **Go for the first build?** Increment 1 is the skeleton (random mode, hidden gear with fade, ⚙️ Info/version, feedback notes on device, errors) plus Ripples. Shall I build it, then add Beads and Shake pads one at a time?
   - Answer:

---
