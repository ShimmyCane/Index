# Rhythm Sticks — Claude Code pointer

Purpose: a wordless web toy that exposes young children to rhythm and sound. It picks a random mode on load (ripples, mic beads, strings, shake pads, two-finger span); touch and microphone make sound and picture together.

Track: A. Family play

- Shared background: `context.md` · Design: `schematic.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Rhythm Sticks/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run: open `index.html` (no server or build); `index.html#strings` opens a named mode. The microphone needs https or localhost, so test it from GitHub Pages or `python3 -m http.server`.
Code map: `js/core.js` (settings, errors, canvas, touch, corner-circle gesture), `js/audio.js` (all sound), `js/mic.js` (onset detector), `js/modes/*.js` (one file per mode, each exposes `info()` for tests), `js/gear.js`, `js/notes.js`, `js/family.js`, `js/app.js`.
Check: headless Chromium with `--use-fake-device-for-media-stream`; `RS.mic._fakeOnset()` fires a beat for tests. Keep the test script out of the repo.

Project rules:
- Public repo. No recordings, photos, children's or teachers' names, or locations.
- Microphone audio is analysed in the page only: never stored, sent or played back.
- Web Audio API synthesis only; no audio files.
- Supabase: Family project, table `rs_notes`, publishable key only. SQL is in `supabase/` (run `test_001_`, then `001_`, then `verify_001_`); nothing is applied until Jimmy asks.
- No imitation of living artists' styles.
