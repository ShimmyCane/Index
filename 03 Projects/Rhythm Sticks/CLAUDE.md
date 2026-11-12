# Rhythm Sticks — Claude Code pointer

Purpose: a wordless web toy that exposes young children to rhythm and sound. It picks a random mode on load (ripples, mic beads, strings, shake pads, two-finger span); touch and microphone make sound and picture together.

Track: A. Family play

- Shared background: `context.md` · Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Rhythm Sticks/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: not built yet. When it is, open `index.html` (no server or build). The microphone needs https or localhost, so test on GitHub Pages or `python3 -m http.server`.

Project rules:
- Public repo. No recordings, photos, children's or teachers' names, or locations.
- Microphone audio is analysed in the page only: never stored, sent or played back.
- Web Audio API synthesis only; no audio files.
- Supabase (planned): Family project, table `rs_notes`, publishable key only. Nothing applied until Jimmy asks.
- Only living-artist-free inspiration: no imitation of living artists' styles.
