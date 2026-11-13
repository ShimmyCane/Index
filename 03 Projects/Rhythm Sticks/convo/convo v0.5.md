# Rhythm Sticks — Convo v0.5

**Project:** Rhythm Sticks
**Round:** Jimmy's answers to convo v0.4, and version 0.2.0

## What Jimmy said

1. **Lag.** The microphone registers the sounds (the beads show up), but the game should answer immediately in the games that acknowledge a touch or a sound. Reduce the lag. The earlier fixes were approved ("proceed with all of those").
2. **More games.** Proceed with all five. "Surprise and delight me."
3. **Breathing mode (added mid-session).** The microphone could also be a breathing app that gauges how well you breathe in and out. Add it to settings as a hidden mode, planned around a zen garden, pushing for long breaths: the longer you pace your breaths, the more serene it gets. Three variations inside this one mode.
4. **The settings button** is working well. Left alone.
5. **Merge.**

## Lag: what changed

- **Beads taps act when the finger lands.** Before, a tap waited a third of a second to see whether a second tap followed. Now the first tap starts recording at once, and a second tap within a third of a second wipes and starts again.
- **The microphone is heard on the audio thread.** The clap detector used to run once per screen frame on a 45 ms window. It now runs in blocks of about 3 ms and tells the page the moment it hears a sharp sound. It keeps the old way as a fallback where a browser can't do this.
- **Sound that the app makes is not mistaken for you.** A short window after the noisy drums (snare, hat, click, shaker) is ignored by the detector, so a loop doesn't re-trigger itself through the speaker.
- **The audio engine is built before your first touch** and woken inside it with one silent sound, so the first real sound is not late. It also wakes on touch end and mouse down for browsers that only unlock sound on those.
- **String sounds are ready before you pluck.** Each pitch is computed once, when the Strings mode opens.
- **Ripples start their note in 12 ms instead of 30 ms.**
- **A sound lag check in ⚙️.** It shows what the audio engine reports, and measures a round trip: it plays five clicks and times when the microphone hears them. What it cannot show is Bluetooth lag in a speaker you are not near.
- **What remains is the device.** Microphone input plus speaker output on an iPad is roughly 40–100 ms, and Bluetooth speakers or earbuds add 100–200 ms more. A page cannot remove that.

Checked with a made-up sound (not a real clap): four claps in four are heard, and two slow swells of breath-like noise are not. Not checked on a real iPad.

## Five new games (all wordless; found by playing)

- **Echo.** Clap or tap a short pattern. After a pause the screen answers with it changed: same, faster, climbing, with a beat added, or backwards. Interrupt it any time.
- **Marbles.** Tap or drag along the top. Marbles fall through pegs; each peg is a bell, low on the left and high on the right.
- **Dot loop.** Two rings of dots and a sweeping hand. Tap a dot to wake it: the outer ring cycles kick, snare, hat, off; the inner ring is bells that climb. The middle clears everything. It starts with two kicks awake.
- **Footsteps.** Tap the left and right halves in turn and a small creature walks at your pace, runs when you tap fast, hops if you tap one side twice, and sits and dozes when you stop. Flowers grow where its feet land; every fourth step rings a climbing bell.
- **Hum trail.** Hum or sing and a glowing trail draws the height of your note; a held steady note makes a star. No sound of its own, so the microphone cannot hear itself.

## The breathing garden (hidden)

Reached from ⚙️ → Mode → "Breathing garden" (or `index.html#breathe`). It is never picked at random. Inside it, ⚙️ has a Garden choice and a "Back to the music modes" button.

How it senses: the microphone listens for the sound of breath (it learns the room's quiet level, needs a steady sound above it, and ignores short dips). A warm, low sound is taken as breathing out and a hissier one as breathing in; when it can't tell, breaths take turns. **A finger held on the screen always means "breathing out"**, for quiet breathers, noisy rooms, or no microphone. A small arc fills over 12 seconds while you breathe out, and five stars light for breaths out of 3, 5, 7, 9 and 11 seconds this visit (the longest ever is kept on the device only).

- **Sand rake (karesansui).** Breathing out draws a rake through the sand in a spiral around the stones; the rake lifts while you breathe in. Bells ring at 4, 6, 8 and 10 seconds. A breath of 6 seconds or more sends petals up from the main stone. Long, steady breaths make the sky warm and the rings round the stones deepen.
- **Fountain (shishi-odoshi).** Breathing out pours water into a bamboo tube. When it is full it tips with a wooden knock and a bell, and rings spread across the pond. Each knock asks 0.75 seconds more, up to 12. Lily pads and flowers grow with each knock, and dragonflies come when it is calm. The water only slowly leaks while you breathe in, so it rewards one long breath rather than many short ones.
- **Blossom (paced).** A lotus opens as you breathe in and closes as you breathe out, like a pacer, starting at 4 seconds in and 6 out. Breathe out for most of the lotus's out-breath and the bonsai blossoms and a bell rings; every second success lengthens the pacer (up to 6 in and 10 out). Miss, and it wilts a little and waits. Only the out-breath is checked, because a quiet breath in cannot be heard reliably.

Honest limits: this hears breath sounds only. A quiet nose breath may not register, a noisy room can fool it, and phones differ. It is a calm game, not a medical or diagnostic tool, and it says nothing about health.

## Not tested

A real iPad, real fingers, a real clap or breath into a real microphone, a real lag number, Bluetooth, and whether the pacer lengths feel right to breathe with. The detector and the gardens were tested with made-up sound and a held finger.

## Questions

1. **Lag.** After this round, is the answer fast enough? ⚙️ → Sound lag gives a number: please note it, and what you were listening on.
   - Answer:
2. **Beads sensitivity.** The detector changed. Does a clap register, and does talking stay quiet? (Slider in ⚙️.)
   - Answer:
3. **Breathing.** Which garden do you want to keep working on? Is the length right (3–11 seconds for the stars, 4/6 seconds to start the pacer)? Should the breathing garden get its own shortcut somewhere other than ⚙️ (for example, a long-press on the sun)?
   - Answer:
4. **Which of the new games** is the keeper, and which feels wrong? Use ⚙️ → Notes; each note is tied to the mode.
   - Answer:
5. **The two open notes** (lag, and more games) are both worked on now. Shall I mark them done once you have tried them?
   - Answer:

---
