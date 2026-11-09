# Voice — AI Brief

**Updated:** 2026-11-09
**Status:** idea. Schematic draft 0.1, convo v0.1 open (18 questions).
**Track:** A. Family play.

## Goal
A story shelf for the kids on the iPad. Stories play in a natural AI voice, made ahead of time and stored with the story; a speed-read mode (RSVP, red focus letter, drag speed slider).

## Architecture (planned)
- Plain HTML/CSS/JS, no build, GitHub Pages.
- Family Supabase project: `voice_stories`, `voice_versions` (one row per version, never overwritten), `voice_notes`, private bucket `voice-audio`.
- Edge Function `voice-narrate` holds the voice-service key as a secret; the browser never sees it.
- Three-tier fallback: live → device cache → bundled samples; voice fallback is the iPad's best installed voice (Web Speech API).

## Feasibility notes (from memory, to confirm with live docs and prices before 0.2)
- ElevenLabs has a text-to-speech endpoint that returns character timestamps → word highlight and tap-to-seek.
- OpenAI speech returns audio only; word times would need a second step (a speech-to-text pass with word timestamps).
- Claude's own voice (Claude app) is not callable from a page. Claude writes the text and the speaking notes.
- iPad Safari: audio needs a user tap to start; Enhanced/Premium voices must be downloaded by the user in Settings.

## Verified vs. unverified
- Verified: nothing built yet.
- Unverified: service prices, timestamps format, Safari voice list on the real iPad.

## Next steps
1. Jimmy answers `03 Projects/Voice/convo/convo v0.1.md`.
2. Build 0.1 (no external services).
3. 0.2: one story with real AI audio, side by side with the iPad voice.
