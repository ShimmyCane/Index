# Rhythm Sticks — Convo v0.7

**Project:** Rhythm Sticks
**Round:** Jimmy's answers to convo v0.6, and version 0.3.0

## What Jimmy said, and how it was built

1. **Audio dying:** go ahead. → The audio engine now wakes on every touch and when the page comes back, treats the iPad's "interrupted" state like "suspended", is closed when you leave the page (a refresh no longer piles up engines), and asks Safari to play through the mute switch. A small crossed-out speaker appears at the bottom of the screen whenever the sound is asleep; a tap on it wakes it.
2. **Error bar:** "keep the error bar a little short, or fade it out after 5 seconds." → Both: it is now at most a fifth of the screen high, fades after 5 seconds, and comes back for each new error. Tap the bar to keep it. The ⚙️ Errors panel keeps the full list. The ⚙️ button sits above the bar.
3. **Two fingers:** yes to all three. → The whole screen takes its colour from the note, and brightness from the volume; the finger rings take the note's colour. On the right, one finger slides up for louder and down for quieter, and the level stays where you leave it. Two fingers on the right make the note pulse, faster the farther apart they are. This also removes the bug where the note could go silent for good.
4. **Footsteps:** "Add other objects like birds trees buses cactus or other desert biome. Let them be interactive. Trigger their sounds." → It is now a desert: dunes, a sun, and six objects (cactus, bird, palm, bus, tumbleweed, rock) that you tap to hear and see move. The rhythm road with the 15 rhythms is built, with Free walk kept as a choice (⚙️). Three objects start on the road; solving rhythms adds the others.
5. **Heat map:** "Yes, in that order all of them." → One tap still freezes. Two fingers switch the view: heat map, then pitch (the note you are on, with its name and a sharp-or-flat needle), then chords (up to six notes drawn on a grand staff). Three dots at the top right show which view.
6. **Ripples, up and down:** "The starting one should be none but the other ones should change the sound tone, sustain, attack, timbre — things to do with the sound quality." → A drop-down in ⚙️: None (start), Tone (brightness), Sustain (length), Attack (soft to sharp), Timbre (plain to rich), Vibrato (wobble), Echo.
7. **Shake pads:** "Randomize please. In the setting have a seed number so I can restore it." → Fifteen sounds (five drums and shakers, five arcade, five other interesting ones); each load lays out nine of them from a random seed, always with at least one arcade and one other interesting sound. The seed is shown in ⚙️; type one in and press "Use this seed" to bring a layout back, or "New seed" for another. `?seed=12345` on the address works too. The same seed also decides the Ripples background pattern.
8. **Dot loop:** rings that scroll in and out, up to eight, a ring shows only when the one before has beats. → Eight rings, each with its own sound (kick, snare, hat, tom, clap, click, low bell, high bell), 16 steps each. Tap a dot to switch it on. Tap a shrunken ring and it slides to the front, large and easy to edit, while the others shrink behind it. The middle clears everything. It starts with two kicks, so the second ring is already waiting.
9. **What each mode does:** yes, and show it when I tap the upper-right corner. → A tap in the upper-right corner of the screen shows a card for the mode you are in (tap again, or wait, to hide). ⚙️ → "What each mode does" lists every mode, and "This mode" shows the one you are in.
10. **Echo:** "I can't tell if it's supposed to listen to my echo… the point is to be engaging. Consider how accurate the user is and not progress too far beyond it." → Echo now learns your level:
    - Level 1, tap along: it sings a steady four beats and you tap with them.
    - Level 2, copy me: it sings a short rhythm, then you copy it.
    - Level 3, repeat: it sings the rhythm twice and you play it twice.
    - Level 4, riff: you play anything and it answers with your rhythm changed.
    Two good rounds move up a level; two poor ones move down. The dots at the top left show the level. ⚙️ can fix the level instead of letting it learn. The answers are sung ("ooh") and the first note is longer.
11. **Marking notes done:** "Yes." → Not run yet: see the question below; I need the list of ids you want marked.

## Checked in headless Chromium

(Made-up sound through the microphone path; no real iPad.) Every mode loads at three sizes with no errors and no sideways scroll; the earlier full run still passes. New checks: audio wakes after being put to sleep (by a touch and by a tap on the speaker); all 27 sounds are audible; the error bar shows, is short, fades after 5 seconds, and can be kept; the corner card shows and hides without making a ripple; two fingers (pitch, colour, volume slide, pulse, note stays after lifting, no silent trap); every Ripples up/down choice changes the sound between top and bottom; the same seed brings back the same pad layout, 80 seeds all hold at least one arcade and one other sound, and all 15 sounds appear; Dot loop rings appear, slide, edit, reach eight and clear; the rhythm road scores a clean round as good, an extra tap as a miss, two clean rounds as solved (the next rhythm opens, the creature plays it by itself), a short hold as a miss, a long hold as good; all six objects play their own sound and are not footsteps; the 15 rhythms are all different and fill four or eight beats; Free walk still walks; Heat's two-finger switch, a sung A3 found at 220 Hz, a C-E-G chord and a G7 four-note chord found on the staff; Echo moves up on two good rounds, down on two poor ones, can be fixed at a level, and answers in level 4.

## Not tested

A real iPad, real fingers, real singing, a real piano, sound by ear, and whether the audio problem is really the "interrupted" state (the fix is in, but only your iPad can say). The chord view is the weakest part: a clean synthetic chord works; a real piano in a real room has overtones, noise and decay, and will make mistakes.

## Questions

1. **Audio.** Does it still go quiet? When it does, does the crossed-out speaker appear? (Tap it, and the sound should come back.)
   - Answer:
2. **Which notes to mark done.** This round handles these 14 notes. Shall I mark all of them done in the family table once you have tried 0.3.0? Say which to leave open. The ids are in `convo v0.6.md`.
   - Answer:
3. **Footsteps.** Does the rhythm road feel right to play: the half-second beat, the size of the window (a little under a fifth of a second either side), and the 15 rhythms in that order? Should the window be wider or narrower?
   - Answer:
4. **Echo.** Is level 1 (tap along) too easy as a start, and does the climb from 1 to 4 feel right?
   - Answer:
5. **Heat map chords.** Try a real piano or guitar. How close is it?
   - Answer:

---
