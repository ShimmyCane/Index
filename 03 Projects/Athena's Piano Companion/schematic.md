# Athena's Piano Companion — schematic

**Track: A. Family play** (proposed; confirm in `convo/convo v0.1.md`, question 1)
**Status: idea (2026-11-20).** Nothing built yet. Questions in `convo/convo v0.1.md`.

## Purpose

A companion page that sits beside the piano and listens while Athena plays freely. Her hands stay on the keys; her voice and her playing run the page. It catches short clips ("takes"), keeps them as a numbered series, and later lets her step away from the piano to play them back and handle them (trim, rename, favourite, layer, loop). Felix can jam the same way. Aim: make free play sustainable, fun and delightful for the player and for a listener.

## Track A defaults

| Setting | Value |
|---|---|
| Words on screen | few, with icons; large status word only (Listening, 3·2·1, Recording, Saved) |
| Options visible | one big state circle; the take strip below it |
| ⚙️ holds | everything secondary: phrases, silence time, sensitivity, stop-key, volume, notes, errors |
| Panels | collapsible, closed on a small screen |
| Palette | light pastel (vanilla, sage, peach, mint, coral), 2.5–3.5px dark lines, offset shadows |
| Database | none at first; device storage only |
| Private data | recordings stay on the device; never committed |
| Skills | `ipad_website`, `settings_gear`, `feedback_notes` |

## The loop (hands-free)

1. **Waiting.** The page listens to the microphone. A quiet breathing circle shows it is awake.
2. **Start.** Athena says a start phrase ("start recording", "I want to record something", "let's record"; list editable in ⚙️). The page answers with a countdown: beep, beep, beep, higher beep (the circle fills three dots, then blooms). Recording begins on the high beep.
3. **Recording.** She plays. The circle pulses with the sound level.
4. **Stop, three ways** (all on at first; each can be turned off in ⚙️):
   - **Silence:** about 3 seconds of quiet. The circle blinks (a visible "I think you're done") for a short grace, then ends the take. Playing again in the grace cancels the stop.
   - **Stop key:** a chosen note or short motif (for example the lowest A pressed three times). The take is trimmed to remove the stop gesture.
   - **Voice:** "stop" (optional, off by default, since she should not have to speak).
5. **Snip.** The take is cut at the end of her last note, so the trailing silence and the stop gesture are removed.
6. **Saved.** A short chime, a new take card appears in the strip, and the page is ready for the next take at once.
7. **Away from the piano.** A take strip (screen) lets her play, trim, rename, star and layer takes by touch.

## Pieces (planned)

- **Listener:** microphone input, level meter, onset and silence detector (`js/listen.js`).
- **Voice commands:** browser speech recognition for the start phrase; falls back to a big touch circle if speech recognition is unavailable (`js/voice.js`).
- **Recorder:** MediaRecorder with a short rolling pre-buffer so the first note is never clipped (`js/record.js`).
- **Takes:** stored on the device in IndexedDB, with a name, time, length and star (`js/takes.js`).
- **Strip and player:** waveform per take, play, loop, trim handles, layer two takes (`js/strip.js`).
- **Sound cues:** Web Audio synthesized beeps and chimes only (`js/cues.js`).
- **Gear:** ⚙️ drawer per `02 Refs/Skills/settings_gear.md` (`js/gear.js`).
- **Notes for improvement:** per `02 Refs/Skills/feedback_notes.md`, saved with the take or screen they are about (`js/notes.js`).

## Increments

1. Listener, level circle, touch start, countdown beeps, silence stop with blink, take strip with playback, ⚙️, notes. (first build, if Jimmy says go)
2. Voice start phrase; stop key; snip of the stop gesture.
3. Trim handles, rename, star, delete with undo, export a take as a file.
4. Layering and looping; metronome-free "loop what I just played".
5. Optional: MIDI keyboard input (more reliable than a microphone), eyes or gestures only if wanted.

## Risks and limits

- Speech recognition in browsers often needs internet and a secure page (https or localhost); iPad Safari support varies. The touch fallback must always work.
- The page hears the piano through the microphone, so the voice phrase must be told apart from piano sound. A MIDI or USB keyboard would be sturdier, if she has one.
- The page cannot hear the voice and the piano equally well from the same microphone; testing on her own piano is needed.
- A recording kept on the device can be lost if browser storage is cleared. An export button is planned.

## Privacy

Recordings, if any, stay on the device in the browser. Nothing is uploaded, and no recording is ever committed to this public repo. Samples in the repo, if any, are synthetic.
