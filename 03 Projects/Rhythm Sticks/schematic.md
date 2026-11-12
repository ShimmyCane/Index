# Rhythm Sticks — schematic

**Track: A. Family play** (to confirm in `convo/convo v0.1.md`, Q1)
**Status: idea.** Written 2026-11-12. Shared background: `context.md`.

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
- **Hidden ⚙️.** The gear is lower-right per `settings_gear.md`, but starts invisible. It appears after a circular stroke in the lower-right corner, or when the "show gear" toggle is on (where that toggle lives: open question). Once shown, it stays until hidden again.
- **Gear panel:** mode picker, microphone sensitivity, volume, scale, show-pad-outlines (dashed regions for the shake pads), speed of the visuals, Show errors, Notes for improvement, version log, note log, database check.

## Modes

| # | Mode | Input | Sound | Picture |
|---|---|---|---|---|
| 1 | Ripples | tap | sustained note, pentatonic, pitch from position | rings that spread, color shifting outward; maybe a filter over an image |
| 2 | Beads | microphone | none (never plays the mic back) | beads jump or scatter on each sharp attack; speech and steady noise ignored |
| 3 | Strings | drag and release | plucked tone with decay | string bounces, exaggerated; sub-modes: 1, 2 or 3 strings, fret side where pitch rises as you slide |
| 4 | Shake pads | tap, drag | shaker, snare, rattle by region | hidden 3×3 grid; hint = faint reaction where a pad is; dashed pads only when ⚙️ turns them on |
| 5 | Two-finger span | two or more fingers | note from finger distance (big side ≈ 3/5), loudness from the second pair (small side ≈ 2/5); lifting locks the note; attack on press, decay while held | sparks, light and color |

Candidates later: "how the machine hears" heat map (spectrogram of the microphone, shown as AI might see it); drum/clap loop; voice-pitch.

## Shared engine (small modules, Pd-style)

Each module does one job; modes wire them together.

- `audio.js`: audio context, wake on first touch, master gain, envelope helper (attack/decay/sustain/release), oscillator voice, noise voice, scale helper.
- `mic.js`: `getUserMedia`, `AnalyserNode`, onset detector (a sharp rise in energy over a short window, with an adjustable threshold; slow speech-like rises don't count).
- `modes/ripples.js`, `beads.js`, `strings.js`, `pads.js`, `span.js`: each exports `start(canvas, engine)` and `stop()`.
- `app.js`: random mode picker, canvas sizing, pointer events, gear reveal gesture.
- `gear.js`: settings drawer, error panel, feedback notes, database check.
- `css/app.css`

Files stay inside this folder. Classic scripts, no build step.

## Feedback notes (first increment)

- A "Notes for improvement" box in ⚙️. Each note is saved with the mode it is about and the time.
- Read back in the same panel as a **note log**.
- Notes stay on the device first. If the family table is linked, they are also sent there with the note's own id and time. Notes go nowhere else.
- Built from `02 Refs/Skills/feedback_notes.md`.

## Database plan (family notes, to confirm)

Link to the Family project (`twvqvutrcobedvuhnzxq`) per `02 Refs/Skills/supabase_link.md`. Table `rs_notes`: `id`, `text`, `page`, `item`, `label`, `version`, `status` (`open` or `done`), `noted_at`. RLS on, `anon` revoked, family sign-in may insert, read and update status. Register in `app_table_registry`. A 家庭登入 block in ⚙️ with the publishable key only; signed out the database check says "this device only". Reference: `03 Projects/中文笔画/`. Nothing is written until Jimmy asks.

## Increments

1. **Skeleton:** page, canvas, audio wake, random mode picker, hidden gear with circular reveal, feedback notes (device only), error panel. One mode: Ripples.
2. **Beads** (microphone) with sensitivity in ⚙️.
3. **Shake pads** with the outline toggle.
4. **Strings** (1 string, then 2–3 and fret).
5. **Two-finger span.**
6. Database link for the note log and version log.
7. Smoke test at three sizes (`smoke_test`), then device test on the iPad.

## Privacy and limits

- Microphone audio is analysed in the page and never stored, sent or played back.
- Mic needs https or localhost (GitHub Pages works; Artifacts don't).
- No photos or recordings in the repo.

## Open questions

See `convo/convo v0.1.md`.
