# Athena's Piano Companion — brief

**State (2026-11-20):** project started. Folders, schematic, pointer file and convo v0.1 written. No code. Waiting on Jimmy's answers (track, device, start phrases, stop gestures, silence length, what takes can do).

**Idea:** hands-free recording companion for free piano play: voice start, countdown, silence-or-gesture stop with a blink, snipped takes saved in a series, handled later away from the piano.

**Architecture (planned):** plain HTML/CSS/JS, no build. Web Audio for cues and level detection, MediaRecorder for takes, IndexedDB for storage, browser speech recognition for the start phrase with a touch fallback.

**Verified:** nothing yet.
**Unverified:** speech recognition on iPad Safari; separating voice from piano in one microphone.

**Next:** read convo v0.1 answers, then build increment 1 on Jimmy's go.
