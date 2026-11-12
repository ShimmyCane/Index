# Rhythm Sticks — shared context

Written 2026-11-12 from Jimmy's first description. This is the common ground between Jimmy and Claude: why the project exists, what it borrows from, and what it is not. It is a living file. Add to it; don't rewrite history (decisions go in `convo/`, design in `schematic.md`).

## Why this exists

When the kids were toddlers, a music teacher with a doctorate ran small classes for little ones: the basics of rhythm, voice, singing, playing small stringed instruments. It was warm, physical and unhurried, and it is the model for the whole project. Most places offer something like it; few put a real expert in front of toddlers.

Now Jimmy wants a more musical app of his own: a way to *express musical ideas acoustically, on the computer*, and to hand the kids something that exposes them to rhythm and sound without lessons.

## The idea in one paragraph

A bare, wordless web page. The microphone and speakers are on. On load it picks a **random mode**, and the mode decides how the child plays with the screen: tap and ripples spread, clap and beads jump, pluck a string, find hidden pads, spread two fingers to set a pitch. No lesson, no text, no score. A raw, open visualization of sound where every action makes something you can see *and* hear, and where notes have time (attack, sustain, decay).

## What it borrows from

| Source | What we take | What we leave |
|---|---|---|
| **Body and simple objects as instruments** (voice, hands, a rock, a stick) | The teaching idea: sound starts with you. Clapping, tapping and voice are the first inputs. The name "Rhythm Sticks". | Formal instruction. |
| **Modular analog synths** (Moog-style kits: patch modules, turn dials, pick waveforms) | The *feel* of building a sound from simple parts; waveforms as the raw material. | Dials and patch cables on screen. Saved for a later, more studio-style project. |
| **Digital synths, keypads, Ableton-style software** | Music abstracted into pads, grids and visual time. | Dense panels, menus, jargon. |
| **"Matrix" digital look and live-coded soundscapes** | Sound as a visible, changing field; the sense that code *is* the instrument. | Typing code as the child's activity. |
| **Pure Data (Pd)** | Boxes-and-wires thinking: small objects, each doing one job (an oscillator, an envelope, an onset detector). Pd is a precursor to Grasshopper in Rhino, which Jimmy uses often. | A visual patching editor. The *code* is structured the same way (small modules), the screen isn't. |
| **Two-finger multitouch music tables** (the surface-table era, and a well-known pop-artist game that used it) | Interaction idea only: distance between two fingers sets pitch; a second pair sets loudness; sparks and light as feedback. | Anyone's visual style. Per Jimmy's art rule, no imitation of living artists. |
| **The earlier stuttering-MP3 work** | AI "hears" audio as pictures, such as a spectrogram or heat map, which is very unlike how a person hears it. | Not a mode yet. A candidate later mode: "how the machine hears" (see schematic). |
| **The Momentary repo's randomized process** | Load the page → random mode → the mode defines the interaction. Same trick. (Not read; Jimmy described it.) | |

## Principles

1. **No words, no lessons.** Icons and motion only on the main screen. Anything that needs words lives in the ⚙️ panel.
2. **Every touch makes sound and picture together.** The image answers the sound within a frame or two.
3. **Notes have time.** Sound has an attack (start), sustain (while held) and decay (fade). Ripples keep spreading after the tap; strings keep wobbling after the pluck.
4. **Discoverable, not explained.** Some modes hide their rules (the shake pads). The child finds them by looking. The ⚙️ panel can show dashed pad outlines for the grown-up.
5. **Pleasant by default.** A pentatonic scale for pitched modes, so any tap sounds fine. Pastel palette (soft vanilla, sage, peach, mint, coral); bold 2.5–3.5px dark lines; large touch targets.
6. **The grown-up controls hide.** The ⚙️ gear is not on screen. It appears only after a circular stroke in the lower-right corner (or an on/off toggle; see `convo/`).
7. **Everything on the device.** Plain HTML/CSS/JS, Web Audio API synthesis, no audio files, no build step, no server. The microphone is used for *looking at* sound; it is never played back.
8. **Errors visible but opt-in.** An error panel at the bottom, behind a toggle in ⚙️.

## The modes (first thoughts; details in `schematic.md`)

1. **Ripples.** Tap → a ripple spreads across the screen as rings of changing color; a sustained note rings while it spreads. Maybe a filter over an image later.
2. **Beads (microphone).** Listens for sharp attacks: a clap, a tap, a drum hit. Speech is ignored. Each attack makes beads jump or scatter.
3. **Strings.** One string to pluck, with exaggerated vibration. Sub-modes add two or three strings and a fret side where the pitch changes as you slide up.
4. **Shake pads.** A hidden 3×3 grid. Some cells are a shaker, some a snare, and dragging across others gives a rattle. The child has to look and listen to find them.
5. **Two-finger span.** The screen splits roughly 3/5 and 2/5. On the big side, the distance between two fingers sets the note. On the small side, a second pair sets loudness. Lifting fingers locks the note so it keeps playing. Attack on press, decay while held. Sparks and color as feedback.

Modes still to think about: the "how the machine hears" heat map; drum/clap loop; a voice-pitch mode.

## Plain-words glossary (for the project, not the screen)

- **Attack / decay / sustain / release:** how a note starts, how it falls from its peak, how long it holds, how it ends.
- **Waveform:** the shape of the vibration (sine = smooth, triangle = soft, square = buzzy, sawtooth = bright). Built with Web Audio oscillators.
- **Onset:** the moment a new sound begins. Beads mode is an onset detector.
- **Spectrogram / heat map:** a picture of sound: time across, pitch up, loudness as color.
- **Pentatonic:** five notes per octave that sound good in any order.

## Out of scope for now

- Knobs, dials, patching: a later studio-style project.
- Teaching notation, scores, levels, accounts for children.
- Recording or storing anyone's voice or room sound. Microphone audio never leaves the page.

## Technical anchors

- Sound: Web Audio API (`OscillatorNode`, `GainNode` envelopes, noise buffers for shaker/snare/rattle).
- Microphone: `getUserMedia` + `AnalyserNode`. Needs https or localhost, so it runs on GitHub Pages, not in Artifacts.
- Touch: Pointer Events (multi-touch for two-finger span); canvas for drawing.
- Audio on iPad starts only after a first tap (browser rule), so the first touch must wake the audio.

## Privacy

Public repo. No recordings, no photos, no names of children or teachers, no locations in any file here.
