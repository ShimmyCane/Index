# Athena's Piano Companion — Claude Code pointer

Purpose: a hands-free companion page for free piano play. It listens, starts a take on a spoken phrase after a countdown, ends it after a pause (or a chosen stop note), snips the tail, saves the take and is ready for the next one; takes are handled later away from the piano.

Track: A. Family play (proposed; confirm in convo v0.1)

- Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Athena's Piano Companion/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: not built yet. When built, open `index.html`; the microphone and speech recognition need https or localhost (`python3 -m http.server`, or GitHub Pages).

Project rules:
- Public repo. No recordings, photos, surnames, schools or locations. First names only.
- Microphone audio is processed in the page only; takes stay on the device (IndexedDB). Nothing is uploaded.
- Web Audio synthesis only for cues; no audio files.
- Must work with the touch fallback when speech recognition is unavailable.
