# Voice — Claude Code pointer

Purpose: a shelf of family stories that are narrated by a natural AI voice. Each story's audio is made ahead of time and saved with the story, then played back on the iPad. A speed-reading mode shows one word at a time with a red focus letter and a speed slider.

- Design: `schematic.md`
- Decisions and open questions: `convo/convo v0.3.md` (older: `v0.2`, `v0.1`). Never compact; start a new version instead.
- AI notes: `04 AI/Voice/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy rules), `04 AI/Supabase/brief.md` (prefix `voice_`, registry)
- Track: A. Family play
- Database: Family project (`twvqvutrcobedvuhnzxq`), tables `voice_*`, storage bucket `voice-audio`. Planned, nothing written or applied yet.

Rules:
- No AI or voice-service key in browser code, ever. Audio is made by a server step (Edge Function or a local script) that holds the key as a secret.
- The publishable Supabase key only in the page.
- Stories stay first-name only. Audio of a real family member's voice is never committed; it lives in Storage.
- Database SQL is pasted by hand (`02 Refs/Skills/supabase_link.md`).

How to run: serve the folder (Kokoro live needs http(s), not file://; the recorded audio works from a file too). Stories in `stories/<id>.js`; add the script tags for a new story (and its `.audio.js`) to `index.html`.
Remake audio after a text change: `python3 -I tools/make_kokoro.py --model <folder with model_q8.onnx and voices.npz> [ids]` (setup in the script header; model files stay outside the repo).
Script stories: `script` + `cast` in the story file (see `stories/red_hood.js` header). Kokoro live: `js/live.js` + `js/live_worker.js` + `lib/kokoro.web.js` (vendored kokoro-js 1.2.1, Apache 2.0; licence in `lib/`).
