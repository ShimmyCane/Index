# Rhythm Sticks — brief

**Updated:** 2026-11-12
**Status:** idea. Folders, `context.md`, `schematic.md`, `CLAUDE.md`, `convo v0.1` (answered) and `convo v0.2` (5 questions open) written. No code yet.

## Goal

A wordless web toy that exposes the kids to rhythm and sound. Random mode on load; touch and microphone make sound and picture together. Track A, family play.

## Architecture (planned)

Plain HTML/CSS/JS, Web Audio API synthesis, no build. Small modules: `audio.js`, `mic.js`, one file per mode, `gear.js`, `app.js`. Hidden ⚙️ revealed by a circular stroke in the lower-right, fades after 2 s unless kept visible. First build: Ripples, Beads (beat looper), Shake pads; heat-map mode later. Family database for notes only (`rs_notes`), not applied.

## Verified vs. unverified

Nothing built, so nothing verified. Open: browser behaviour of the onset detector on iPad (speech vs. clap), multi-touch on iPad Safari, audio wake on first tap.

## Next steps

1. Jimmy answers `convo/convo v0.2.md` (beads as a beat looper, loop length, Home link, go for increment 1).
2. Build increment 1 (skeleton + Ripples + hidden gear + notes) after he says go.
3. Add Beads, Shake pads, Strings, Span one at a time; smoke test; iPad test.
