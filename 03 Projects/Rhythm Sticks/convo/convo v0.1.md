# Rhythm Sticks — Convo v0.1

**Project:** Rhythm Sticks
**Round:** 1 (started by `/start-project`)

## What we've agreed so far

- **Purpose:** a wordless, lesson-free web toy that exposes the kids to rhythm and sound. Inspired by a warm early-childhood music class: body as instrument, simple objects, voice, small strings.
- **Wordless and open:** raw visualization of sound; microphone and audio on.
- **Random mode on load:** the mode decides how you interact.
- **Modes so far:** Ripples (tap, sustained note), Beads (mic, sharp attacks only), Strings (1 → 3 strings, fretting), Shake pads (hidden 3×3 grid), Two-finger span (distance = pitch, second pair = loudness, release locks).
- **Hidden ⚙️:** appears via a circular stroke in the lower-right corner (or a toggle). Holds version log, note log (database), dashed pad outlines.
- **Parked for a different project:** knobs, dials, modular-synth patching.
- Shared background written in `context.md`.

## Questions

Answer inline under each number. Recommended answers are marked; "go with the recommendation" is a valid answer.

1. **Track.** Family play (track A: no words, everything secondary hidden in ⚙️)?
   - Answer:
   - *(recommended: yes, A)*

2. **The hidden gear.** The circular stroke is a good reveal. What is the "toggle"?
   - (a) A tiny, nearly invisible tap target in the lower-right corner, long-press to show the gear *(recommended)*
   - (b) A URL switch such as `?gear=1`, remembered on that device
   - (c) Both, plus the circular stroke
   - Should the gear stay visible once revealed, or hide itself again after a minute?
   - Answer:

3. **Random mode.**
   - Never the same mode twice in a row? *(recommended)*
   - Can the child change mode without the gear (for example a two-finger swipe), or only by reloading or via ⚙️? *(recommended: reload or ⚙️ only)*
   - Answer:

4. **First build.** Which modes in the first version?
   - (a) Ripples + Beads (mic) + Shake pads *(recommended: covers touch, microphone and discovery)*
   - (b) Ripples only, then add one per round
   - (c) Other mix:
   - Answer:

5. **Sound.**
   - Pitched modes use a pentatonic scale so any tap sounds pleasant *(recommended)*, or all twelve notes?
   - Ripple note: soft sine/triangle with a long sustain *(recommended)*, or something brighter?
   - Answer:

6. **Look.**
   - Ripples as pure color rings on a pastel field *(recommended)*, or a filter over an image? If an image, what kind (abstract, a pattern, a drawing the kids make)? No photos of people.
   - Answer:

7. **Microphone (Beads).**
   - The mic is only looked at, never played back, stored or sent. OK? *(recommended)*
   - Sensitivity slider in ⚙️ so you can tune for the room? *(recommended)*
   - What should beads do: jump on a line, scatter and fall, or pile up as a bar graph over time?
   - Answer:

8. **Database.** For the note log and version log:
   - Use the Family project and the family login, table `rs_notes` as planned in the schematic? *(recommended)*
   - What is the "version log" you picture: a list of app versions with a note on each, or the history of which modes were played?
   - Answer:

9. **"How the machine hears."** The heat map idea (a spectrogram of the mic, as the AI might see it). Add it as a later mode, or keep it out of this project?
   - Answer:

10. **Publishing.** The microphone needs https, so this would live on GitHub Pages. When it is ready to leave the nursery, run `/graduate-project`. Fine, or do you want it to stay in the nursery longer?
   - Answer:

---
