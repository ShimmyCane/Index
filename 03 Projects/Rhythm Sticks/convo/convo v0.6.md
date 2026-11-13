# Rhythm Sticks — Convo v0.6

**Project:** Rhythm Sticks
**Round:** notes read from the family table on 2026-11-13 (14 open notes: 2 from 0.1.1 that 0.2.0 already answers, 12 new)

Nothing here is built yet. Note ids are the first column so the table can be updated later (only after Jimmy says yes). Wording is Jimmy's, kept as written where it is quoted; some notes were dictated and a few words look mistaken, and I say how I read them.

## What the notes ask, grouped

### Already worked on in 0.2.0
1. `n-1794518926699-51y9v` (heat, 0.1.1): lag between the button and the sound. **Fixes are in 0.2.0**; waiting for a measured number from ⚙️ → Sound lag.
2. `n-1794518964297-k7qtc` (beads, 0.1.1): loved Beads; more games like it. **Five were added in 0.2.0.**

### Bugs
3. `n-1794519096104-r8j1i` (pads, 0.1.1): "Errors should not be a full width bottom bar. It hides the settings button." **Bug, small.** The error bar sits above the gear. *My fix:* make the bar leave the lower-right corner free and put the gear above it.
4. Three notes describe **audio that goes quiet**:
   - `n-1794536594293-kxln5` (dot loop): "after a while, audio stops playing."
   - `n-1794537394787-zzb7q` (pads): "after refreshing for a while the volume for audio disappears."
   - `n-1794519951380-2239l` (two fingers): "Audio doesn't seem to work."
   In the code, the audio engine is only woken when the browser says "suspended". iPad Safari can also say "interrupted" (after a screen lock or switching apps), and nothing wakes it from that, so it stays silent until a refresh. Nothing closes the old engine on refresh either. I can't confirm the cause without the iPad. *My fix:* wake it on every touch and when the page comes back, treat "interrupted" like "suspended", close the engine when leaving the page, ask Safari to play through the mute switch, and show a small crossed-out speaker when the engine is not running (tap it to wake). The two-fingers case also has its own cause (see 5).

### Design requests
5. `n-1794519951380-2239l` (two fingers) also asks for:
   - **colours that change as my fingers change** — *my reading:* the whole screen should shift colour with pitch and brightness with loudness, and the finger rings take the colour;
   - **a slide on the right side** — slide up to raise the volume, down to lower it. This replaces the second pair of fingers (the original 2/5 idea), so it replaces the spec rather than adding to it; it also removes a bug where two fingers coming close together drove the loudness to zero and the note stayed silent;
   - **two fingers on the right might be an extra beat or something else** — *ambiguous:* I would make two fingers on the right a pulse whose speed follows how far apart they are (a tremolo beat), and ask you.
6. `n-1794531573399-7lbct` and `n-1794531637879-y0i4y` (footsteps), together:
   - **objects along the road that make different sounds when tapped.** The note says "Batman objects"; *I read it as "background objects"* (a tree, a bird, a frog, a drum stump…).
   - **"boring… three or four beats… repetitive"**, but the animation is "wonderful". Build up a rhythm and then he carries on for a few steps by himself, as if you are trying to hit a certain rhythm.
   - **a rhythm game**: pauses and beats unlock different steps; about 15 rhythms (short beat, long beat, beat-beat-pause…); the road gives a long beat so you can play with rhythms. "Create the rule and add it into the description."
   These fit together. The proposed rules are in the next section.
7. `n-1794531829104-f6qa6` (heat): keep "one click passes and another continues". Two fingers could switch to a different filter: same recording, but on playback it captures the pitch you are on, so it works as a pitched device for seeing how you are singing, with "rough [lines?] for which you can hit different notes" (the words are unclear). A third filter would catch chords: when a piano plays three or more notes, show them on the staff. *My plan:* one tap still freezes. A two-finger tap moves to the next view: **heat map → pitch line (your note over rough note bands, for singing) → chords (notes drawn on a treble staff)**. Chords need a longer listening window and are the hardest to get right: clear piano chords should work, a noisy room or many notes will make mistakes, and low notes are the least reliable.
8. `n-1794532102806-ikb2i` and `n-1794532127936-tsomj` (ripples): love the pitch from left to right; something subtle for top to bottom, a few choices from a drop-down in ⚙️, and "None" is fine too. The note says "X axis"; *I read it as the up-and-down axis*, since left-to-right is already pitch. Options I would offer: None, Brightness, Ring thickness, Ring speed, Sustain (note length), Echo (a faint second ring after a beat), Octave.
9. `n-1794532470057-bbtpy` (pads): more sounds. *I read it as:* a set of arcade-style sounds, plus five more interesting ones. Arcade: coin, laser, jump, power-up, 8-bit beep. Interesting: wood block, glass tink, cowbell, bubble pop, whistle slide.
10. `n-1794536594293-kxln5` (dot loop), the second half: only two tracks is too simple. After each track is filled, another appears and the earlier ones reflow; up to eight tracks, and the dots shrink to fit.
11. `n-1794537158558-5jep1` (echo): in settings, a short narrative of what each mode does. At the moment ⚙️ shows a one-line hint for the mode you are in only.
12. `n-1794537328264-qn4s2` (echo): "I understand this is pitched. Echo tones would be better if it was voice and if the first sound could be a little bit longer so that it is easier to match." *Ambiguous:* I read it as a voice-like tone ("ooh") for the answer instead of bells, and a longer first note. It might also mean the echo should listen for your voice and sing back the pitch you used.

## Proposed rules for the Footsteps rhythm road

*Notation:* **S** = a short tap, **L** = a long press (hold about half a second), **_** = a pause. One beat is half a second (a gentle pulse from the road keeps it, and can be turned off). **S** and **_** last one beat; **L** lasts two. Every rhythm fills four beats (one bar) or eight (two bars).

- The road shows the rhythm as stones: a small round stone for S, a long oval for L, an empty gap for a pause. They roll toward the creature on the beat. No words.
- Tap or hold the left or right half of the screen as each stone arrives. A tap counts if it lands within a quarter of a beat of the stone; an L needs to be held at least 0.4 seconds; a tap during a pause breaks it.
- Play it right twice in a row and it is **solved**: the creature carries on by itself for one more bar (it keeps your rhythm), does a little flourish, and a **roadside object** appears. Tap objects any time to hear their sound (tree = bell, bird = chirp, frog = bloop, drum stump = thud, flower = chime…).
- A mistake never loses anything: the stones fade, the creature stumbles softly, and the same rhythm comes round again. No score, no timer.
- Each rhythm solved unlocks the next one and a new way of walking. Progress is saved on the device only.
- **Free walk** (today's mode) stays as a choice in ⚙️.

The 15 rhythms, in three groups of five:

| # | Name | Beats | | # | Name | Beats |
|---|---|---|---|---|---|---|
| 1 | Walk | S S S S | | 9 | Stumble | S S _ S |
| 2 | Stroll | L L | | 10 | Late step | _ S S S |
| 3 | Skip | S S L | | 11 | Waltz | L S S L S S |
| 4 | Gallop | L S S | | 12 | Parade | S S L S S L |
| 5 | Tiptoe | S _ S _ | | 13 | Rolling | S S S _ S S L |
| 6 | Hop-pause | S S S _ | | 14 | Heartbeat | S S _ L S S _ |
| 7 | Slow-quick | L S _ | | 15 | Stomp | L _ S S L _ |
| 8 | Catch | S _ L | | | | |

Group 1 is rhythms 1–5 (steady), group 2 is 6–10 (pauses and mixes), group 3 is 11–15 (two bars).

## Questions

1. **Audio dying.** Shall I make the fixes in note 4 (wake on every touch, treat "interrupted" like "suspended", close the engine on leaving, play through the mute switch, a crossed-out speaker when asleep)? *(recommended: yes)* When it goes quiet, is the speaker icon in your iPad's control centre or the side mute switch involved, and does a refresh always bring it back?
   - Answer:
2. **Errors bar.** Leave the lower-right corner free and put the gear above it? *(recommended: yes)*
   - Answer:
3. **Two fingers.** (a) Colours follow pitch and brightness follows loudness? (b) The right side becomes a one-finger slide for volume? (c) Two fingers on the right: a pulse whose speed follows how far apart they are? *(recommended: yes to all three, or tell me what the "extra beat" should be)*
   - Answer:
4. **Footsteps.** (a) Is "Batman objects" "background objects"? (b) Build the rhythm road with the rules and 15 rhythms above, keeping Free walk as a choice? (c) Any changes to the rhythms or the rules?
   - Answer:
5. **Heat map.** Build the three views (heat map, pitch line, chords on a staff), switched by a two-finger tap? Chords are the risky one; build them last and say how well they work? *(recommended: yes, in that order)*
   - Answer:
6. **Ripples, up and down.** Which choices do you want in the drop-down, and which should be the starting one? *(recommended list: None, Brightness, Ring thickness, Ring speed, Sustain, Echo, Octave; start on Brightness, since it is subtle)*
   - Answer:
7. **Shake pads.** Add the five arcade sounds and the five "interesting" ones? Should each load pick a mix from all of them, or should ⚙️ let you choose a set (Classic / Arcade / Mixed)? *(recommended: a ⚙️ choice, starting on Mixed)*
   - Answer:
8. **Dot loop.** Eight tracks, each with one fixed sound (kick, snare, hat, tom, clap, click, low bell, high bell), 16 steps each, a tap switches a dot on or off, and a new ring appears once the last one has a dot? *(recommended: yes; today's tap-to-cycle drums go away)*
   - Answer:
9. **Mode narratives.** A "What each mode does" panel in ⚙️, one short paragraph per mode (and the breathing garden), alongside the one-line hint? *(recommended: yes)*
   - Answer:
10. **Echo voice.** Is it a voice-like answer tone, a longer first note, or does the echo listen to your singing and answer in the pitch you used? *(recommended: a voice-like "ooh" for the answer, with a longer first note; singing back your pitch as a later step)*
   - Answer:
11. **Marking notes done.** Notes 1 and 2 can be marked done once you have tried 0.2.0. Which notes should I mark when this round is built?
   - Answer:

---
