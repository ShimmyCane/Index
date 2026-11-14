# Rhythm Sticks — Convo v0.9

**Project:** Rhythm Sticks
**Round:** notes read from the family table on 2026-11-14 (ten open notes, version 0.3.0). Nothing is built yet; these are the questions and the plan. Note ids are kept so the table can be updated when you say.

## The ten notes

1. `n-1794543089902-3ejb1` (Echo): "The microphone doesn't seem to work. Could it be that I had another thing that used the microphone and I can't use it, although a text input works fine." Then: "if the microphone isn't used, after another button press it dims itself after 30 seconds, so it doesn't lock up."
   - *My reading:* another app or tab holds the microphone, so the page is silent. And you want the microphone to rest after 30 seconds without sound or touch, and wake on a tap.
   - *Plan:* a 30-second idle rest (the microphone is let go; a dimmed mic mark shows); a tap wakes it. If the browser says the microphone is busy, the page says so in plain words instead of going silent.
2. `n-1794543736705-7c93e` (Dot loop): the new ring should be added outside, not in the middle next to the reset button, and the other rings should be squeezed to a dash and a dot.
   - *Plan:* new rings grow outward; rings not being edited shrink to a small dash-and-dot marker on their track.
3. `n-1794543756478-lzggf` (Dot loop): the middle button should take two taps to reset.
   - *Plan:* the first tap shows a ring of "tap again to clear" for 2 seconds; the second clears.
4. `n-1794543911965-d63z3` (Two fingers): "I don't want what this mode became. I want to form geometric shapes with multiple fingers: triangles and squares mean something. I also want to draw, and have shape trails mean something. Don't split the screen anymore. Volume can still be changed by a second pair of two fingers moving closer or further apart, to make it softer or louder."
   - *This is a new mode, not a tweak.* It replaces the split screen. The volume is now a second pair of fingers (closer = softer, further = louder).
   - *Questions:* see below.
5. `n-1794543927566-172kz` (Two fingers): the range of notes from the left two fingers is very limited, and the colours too.
   - *Plan:* widen the range to about three octaves across the screen; colour follows the note across the full range (a hue wheel, not a few steps).
6. `n-1794543982750-cqrlt` (Two fingers, about the corner card and the ⚙️ panel): "In the settings with the panel of what each mode does, I want it replaced by what this mode does, so it shows only what this specific mode needs."
   - *Plan:* ⚙️ → "What each mode does" shows only the current mode's text, not the whole list.
7. `n-1794544014736-asntq` (Heat): "I don't want the three dots in the upper right. They should only appear for three seconds after using two fingers to switch, then fade."
   - *Plan:* the view dots appear for 3 seconds after a switch and fade.
8. `n-1794544339627-2l2ea` (Ripples): the corner description should be no more than two sentences, and vague.
   - *Plan:* rewrite the Ripples card to two sentences. (Vague: no list of what the up-and-down options do.)
9. `n-1794545351475-z0x5l` (Breathing garden): the blossom countdown is too aggressive; the turning is enough. And the sun moves awkwardly: make it rise and set on a five-minute cycle.
   - *Plan:* remove the countdown arc on the pacer (keep the turning lotus); the sun runs from sunrise to sunset over five minutes, then starts again.
10. `n-1794545430160-qu6gc` (Strings): "Sometimes the audio doesn't work."
    - *Plan:* same family as the audio fixes in 0.3.0. Strings does not wake the sound on its own; check whether the first pluck after a pause or a mode change goes silent, and make every pluck wake the engine. Needs your iPad to confirm.

## Questions

1. **Microphone.** The 30-second rest and tap-to-wake (note 1): yes? And when the browser says the microphone is busy, should the page also name the other app ("another app or tab may be using it")? *(recommended: yes, yes)*
   - Answer:
2. **Dot loop layout.** New rings outside, and the others shrink to a dash-and-dot marker (note 2): yes? Two taps to reset (note 3): yes, with a 2-second "tap again" hint? *(recommended: yes, yes)*
   - Answer:
3. **Two fingers, the new design.** This is a new mode. Shapes with two or more fingers: which shapes mean what? Proposal: a triangle makes a chord-like three-note set, a square a steady four-beat pulse, a circle a long sustained note; a drawn line plays a melody along its height. Trails stay on screen and fade. Which meanings do you want, and is the second pair of fingers (volume) still right with shapes? *(recommended: start with triangle, square and circle, and a drawn line; volume by the second pair)*
   - Answer:
4. **Two fingers, the existing range and colour** (note 5): widen to about three octaves across the screen, and colour across the whole range? *(recommended: yes)*
   - Answer:
5. **What each mode does** (note 6): in ⚙️, show only the current mode's text? *(recommended: yes)*
   - Answer:
6. **Heat view dots** (note 7): show for 3 seconds after a switch, then fade? *(recommended: yes)*
   - Answer:
7. **Ripples card** (note 8): two sentences, vague. Here is the draft: "Tap and ripples spread while a soft note rings. Hold and slide to change the note, and the top and bottom change how it sounds." *(recommended: use this, or tell me the wording)*
   - Answer:
8. **Breathing garden** (note 9): remove the pacer's countdown arc and run the sun on a five-minute sunrise-to-sunset cycle? *(recommended: yes, yes)*
   - Answer:
9. **Strings audio** (note 10): when you hear it go silent, is it the first pluck after a pause, or after changing mode? A note with the time helps. *(recommended: I will make every pluck wake the sound, and you test on the iPad)*
   - Answer:

---
