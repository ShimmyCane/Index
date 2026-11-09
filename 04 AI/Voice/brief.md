# Voice — AI Brief

**Updated:** 2026-11-09
**Status:** MVP 0.2.0, not device-tested. Convo v0.2 open (7 questions).
**Track:** A. Family play.

## Goal
A story shelf for the kids on the iPad. Stories play in a natural AI voice made ahead of time; read along with word highlight; speed read (RSVP, red focus letter, drag speed slider).

## Architecture
- Plain HTML/CSS/JS, no build: `index.html`, `css/style.css`, `js/app.js`.
- Story = `stories/<id>.js` (pushes to `window.VOICE_STORIES`). Audio = `stories/<id>.audio.js` (`window.VOICE_AUDIO[id]['kokoro:<voice>']` = src, duration, words per paragraph `[token, t0, t1]`, and `source` = the paragraphs it was made from) + `audio/<id>.<voice>.mp3` (64 kbps mono).
- The baker owns the tokens (jieba for Chinese), so highlight and speed read use the same split. A track whose `source` differs from the story text is shown as "older than the text" and skipped.
- iPad voice = Web Speech API, paragraph by paragraph, highlight from `onboundary`; voices ranked Premium > Enhanced > other.
- Planned 0.3+: Family Supabase project, `voice_*` tables, bucket `voice-audio`, Edge Function `voice-narrate`.

## Kokoro route (works in the cloud session)
- HuggingFace and GitHub release downloads are blocked; npm and PyPI are not.
- Weights: npm `kokoro-q8-shards` (6 parts → `model_q8.onnx`, sha256 fbae9257…a1478, matches the package README). Voices: npm `kokoro-js` `voices/*.bin` → `voices.npz` (510×1×256 float32 each). Runner: PyPI `kokoro-onnx` 0.6.1. Chinese G2P: `misaki[zh]`; replace Chinese punctuation in the phonemes with ASCII (the vocab lacks `，。`).
- Speed 0.92 (en) / 0.9 (zh). Four tracks took 3 minutes on 4 CPUs.

## Verified vs. unverified
- Verified (headless Chromium, 390/768/1180): zero JS errors, no horizontal scroll, audio plays and the highlight moves, the focus letter sits exactly under the ticks, Chinese speed read, notes survive reload.
- Unverified: nobody has listened to the audio yet (no speech check possible here); the iPad voice (headless has none); real iPad Safari; ElevenLabs.

## Next steps
1. Jimmy listens and answers `convo v0.2.md`.
2. ElevenLabs track if wanted (key via the credential form).
3. 0.3 database.
