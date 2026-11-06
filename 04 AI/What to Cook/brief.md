# What to Cook — AI Brief

**Updated:** 2026-11-06
**Status:** idea. Schematic written; clarifying questions open in `03 Projects/What to Cook/convo/convo v0.1.md`.

## Goal

A household web app: capture pantry stock from voice or typed transcripts, keep a recipe book, plan meals (quick or weekly), and build a shopping list from wish-list recipes.

## Architecture (planned)

- Plain HTML/CSS/JS, no build, GitHub Pages (`02 Refs/Skills/ipad_website.md`).
- Capture parsing: rule-based on the device for MVP-2; optional AI JSON loop later (`02 Refs/Skills/ai_json_loop.md`).
- Speech in: `webkitSpeechRecognition` where present, else typed or dictated text.
- Supabase **Family** project, table prefix `wtc_`, applied by hand-pasted SQL (`02 Refs/Skills/supabase_link.md`). Not started.
- Local storage for the cache and for signed-out use; key prefix `wtc.`.
- Feedback notes in ⚙️ from MVP-1 (`02 Refs/Skills/feedback_notes.md`).

## Verified vs. unverified

- Verified: folders and files created for the start-project step.
- Not verified: nothing is built, no SQL written, no database touched.

## Next steps

1. Jimmy answers `convo/convo v0.1.md`.
2. Confirm the track (A. Family play, leaning) and the database (Family).
3. Build MVP-1 (recipe book and feedback box) once the answers are in.
