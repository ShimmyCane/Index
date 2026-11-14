# Rhythm Sticks — schematic

**Track: A. Family play** (confirmed, `convo/convo v0.2.md`)
**Status: MVP 0.3.1 (not yet device-tested).** Written 2026-11-12; first build the same day, all six modes. Shared background: `context.md`. Answers: `convo/convo v0.2.md`, `convo/convo v0.3.md`.

## Purpose

A wordless web toy that shows rhythm and sound to young children. On load it picks a random mode; the mode decides how touch and microphone make sound and picture together.

## Track A defaults

| Setting | Value |
|---|---|
| Words on screen | none on the main screen; icons and motion |
| Options visible | none; the play area fills the screen |
| ⚙️ holds | everything secondary, **hidden** until revealed (see below) |
| Panels | collapsible, closed on a small screen |
| Palette | light pastel: vanilla, sage, peach, mint, coral; 2.5–3.5px dark lines; offset shadows |
| Database | Family project, family login, for the note log only |
| Private data | none expected; `private/` if ever needed |
| Skills | `ipad_website`, `settings_gear`, `feedback_notes` |

## Screen

One full-screen canvas. Nothing else visible. The page loads, waits for the first touch to wake audio (iPad rule), then plays in the chosen mode.

- **Random mode on load.** Pick at random from the built modes, never the same one twice in a row (last mode kept in device storage).
- **Hidden ⚙️.** The gear is lower-right per `settings_gear.md`, but starts invisible. A circular stroke in the lower-right corner shows it, every time. It fades about 2 seconds later, unless the "Keep gear visible" toggle inside ⚙️ is on.
- **Changing mode:** from ⚙️ (mode picker), the Home link (reloads this page for a new random mode), or by refreshing. No gesture for the child. `index.html#<mode>` opens a named mode (`ripples`, `beads`, `pads`, `strings`, `span`, `heat`).
- **Gear panel** (order per `settings_gear.md`): mode picker and Home link, Keep gear visible, microphone sensitivity, volume, scale, show pad outlines (dashed regions for the shake pads), speed of visuals, Beads controls hints, database block, Notes for improvement and note log, Show errors, and at the very bottom Info: the version (also saved with each note) and a short changelog.

## Modes

| # | Mode | Input | Sound | Picture |
|---|---|---|---|---|
| 1 | Ripples | tap | sustained note, pentatonic, pitch from position; soft sine/triangle, long sustain | glowing rings that grow over a randomized abstract pattern, color shifting outward; no images |
| 2 | Beads (beat looper) | microphone hears sharp attacks; screen taps control | each recorded beat plays back as a synthesized click/drum (never the mic sound) | beads pulse on each beat around a loop; speech and steady noise ignored |
| 3 | Strings | drag and release | plucked tone with decay | string bounces, exaggerated; sub-modes: 1, 2 or 3 strings, fret side where pitch rises as you slide |
| 4 | Shake pads | tap, drag | 15 sounds (drums and shakers, arcade, other interesting); nine per layout, chosen from a seed number shown in ⚙️ | hidden 3×3 grid; hint = faint reaction where a pad is; dashed pads only when ⚙️ turns them on |
| 5 | Two fingers | two fingers on the big side (≈ 3/5): the note; on the right (≈ 2/5): one finger slides for volume, two fingers set a pulse | lifting locks the note and the pulse; attack on press, decay while held | the whole screen takes the note's colour and the volume's brightness; sparks and light |

| 6 | How the machine hears | microphone; tap freezes, two fingers change the view | none | three views: heat map; pitch (the note you sing, with name and a sharp/flat needle); chords (up to six notes on a grand staff) |

| 7 | Echo | microphone or taps | a soft tick at once; the answers are sung ("ooh"), the first note longer | four levels that learn you: tap along, copy me, repeat, riff (your rhythm answered changed); two good rounds up, two poor down; faces for your beats below, the echo's above; dots show the level |
| 8 | Marbles | tap or drag along the top | a pop on drop; every peg is a bell, low left to high right | marbles fall through glowing pegs |
| 9 | Dot loop | taps on dots and rings | eight rings, one sound each (kick, snare, hat, tom, clap, click, low bell, high bell), 16 steps, played as the hand sweeps | a ring shows only when the one before has a beat; a tapped ring slides to the front and the rest shrink behind it; centre wipes |
| 10 | Footsteps | taps on left and right halves; taps on objects | thuds, a hop pop, a climbing bell every fourth step; each object has its own sound | a desert; Rhythm road: stones for S (tap), L (hold), pause, 15 rhythms in three groups, solve twice and it plays on by itself and a new object joins; Free walk kept |
| 11 | Hum trail | microphone (pitch) | none | a glowing trail of your note's height, stars for steady notes |
| hidden | Breathing garden | microphone (breath sound) or a held finger = breathing out | bells at long-breath milestones, a bamboo knock | Sand rake, Fountain, Blossom; five stars for 3, 5, 7, 9, 11 s |

The breathing garden is not in the random pool. It opens from ⚙️ → Mode, or `index.html#breathe`. It is a calm game, not a medical tool.

### Other controls in 0.3.0
- **Upper-right corner of the screen:** a card that says what the mode does (tap again to hide). ⚙️ → What each mode does lists them all.
- **Ripples up and down:** a drop-down in ⚙️ (None by default; Tone, Sustain, Attack, Timbre, Vibrato, Echo).
- **Seed:** pads layout and the Ripples pattern come from a seed number shown in ⚙️; type one to bring a layout back; `?seed=N` works.
- **Audio asleep:** a crossed-out speaker shows at the bottom; any touch wakes the sound.
- **Error bar:** short, fades after 5 seconds, tap to keep.

### Beads controls (taps on the screen)

- single tap: start recording beats
- tap again: stop, and loop what was heard
- more taps: overlay another layer on the loop
- double tap: record anew, wiping all layers
- ⚙️ shows these as hints, expanded. Loop length comes from the first recording. Playback is synth drums, never the mic sound (confirmed). Sensitivity slider in ⚙️.

## Shared engine (small modules, Pd-style)

Each module does one job; modes wire them together.

- `audio.js`: audio context, wake on first touch, master gain, envelope helper (attack/decay/sustain/release), oscillator voice, noise voice, scale helper.
- `mic.js`: `getUserMedia`, `AnalyserNode`, onset detector (a sharp rise in energy over a short window, with an adjustable threshold; slow speech-like rises don't count).
- `modes/ripples.js`, `beads.js`, `strings.js`, `pads.js`, `span.js`: each exports `start(canvas, engine)` and `stop()`.
- `app.js`: random mode picker, canvas sizing, pointer events, gear reveal gesture.
- `gear.js`: settings drawer, error panel, feedback notes, database check.
- `css/app.css`

Files stay inside this folder. Classic scripts, no build step. Built as `index.html`, `css/app.css`, `js/core.js`, `audio.js`, `mic.js`, `modes/*.js`, `notes.js`, `family.js`, `gear.js`, `app.js`.

## Feedback notes (first increment)

- A "Notes for improvement" box in ⚙️. Each note is saved with the mode it is about and the time.
- Read back in the same panel as a **note log**.
- Notes stay on the device first. If the family table is linked, they are also sent there with the note's own id and time. Notes go nowhere else.
- Built from `02 Refs/Skills/feedback_notes.md`.

## Database plan (family notes, to confirm)

Link to the Family project (`twvqvutrcobedvuhnzxq`) per `02 Refs/Skills/supabase_link.md`. Table `rs_notes`: `id`, `text`, `page`, `item`, `label`, `version`, `status` (`open` or `done`), `noted_at`. RLS on, `anon` revoked, family sign-in may insert, read and update status. Register in `app_table_registry`. A 家庭登入 block in ⚙️ with the publishable key only; signed out the database check says "this device only". Reference: `03 Projects/中文笔画/`. The SQL files are written in `supabase/` and checked with `sql_paste_check.py`. Nothing is applied until Jimmy asks.

## Increments

0. **Done in 0.2.0:** all six first modes, five new games, the hidden breathing garden, the sound lag check, and the lag fixes (see `convo/convo v0.5.md`).
1. **Skeleton:** page, canvas, audio wake, random mode picker (never twice in a row), hidden gear with circular reveal and 2-second fade, Info/version, feedback notes (device only), error panel. One mode: Ripples.
2. **Beads** (microphone beat looper) with sensitivity and control hints in ⚙️.
3. **Shake pads** with the outline toggle.
4. **Strings** (1 string, then 2–3 and fret).
5. **Two-finger span.**
6. **How the machine hears** heat map.
7. Database link for the note log.
8. Smoke test at three sizes (`smoke_test`) after each increment, then device test on the iPad.

## Privacy and limits

- Microphone audio is analysed in the page and never stored, sent or played back.
- The microphone is asked for as seldom as the browser allows (see `04 AI/Rhythm Sticks/brief.md`): never again after a refusal, silent restart where the browser remembers a yes, one request per visit where it cannot tell.
- Mic needs https or localhost (GitHub Pages works; Artifacts don't).
- No photos or recordings in the repo.

## Open questions

See `convo/convo v0.8.md` (after a first play on the iPad).
