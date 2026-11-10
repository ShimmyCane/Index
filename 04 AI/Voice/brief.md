# Voice — AI Brief

**Updated:** 2026-11-09
**Status:** MVP 0.4.0, not device-tested. Convo v0.4 open (5 questions; earlier rounds still open too).
**Track:** A. Family play.

## Goal
A story shelf for the kids on the iPad. Stories play in natural Kokoro voices, either made ahead of time or made live in the browser. Read along with word highlight, speed read (RSVP), and script stories with a cast and hidden stage notes.

## Architecture
- Plain HTML/CSS/JS, no build: `index.html`, `css/style.css`, `js/app.js`, `js/live.js`, `js/live_worker.js`, `lib/kokoro.web.js`.
- Story = `stories/<id>.js`. Plain stories use `paragraphs`; script stories use `script` (lines: who, text, tone, speed, notes) and `cast` (name, icon, Kokoro voice). Audio = `stories/<id>.audio.js` + `audio/<id>.<voice>.mp3`; the track key `kokoro:cast` means one voice per speaker.
- Baker `tools/make_kokoro.py` (kokoro-onnx, npm weights). It owns the tokens and stores `source` so stale audio is detected.
- Live: a module worker imports the vendored kokoro-js and loads the model from huggingface.co (q8 on WASM, fp32 on WebGPU). The page asks for one line at a time, makes three lines ahead, plays with Web Audio, and estimates the highlight per line. English only.
- Planned: 0.4 Family database, 0.5 make and save audio from the browser (no key).

## 0.4 additions
- Story groups (`group`), translations line by line with `notesFrom`, `paraNotes` for prose stories. Languages: en, zh, ja, fr, es now; the baker also knows it, pt, hi (espeak via kokoro-onnx) and ja (misaki[ja] + fugashi; particles, endings and closing quotes join the word before).
- Director's notes kinds: motivation, acting, sound (+sfx), blocking, gesture, thought; tone shows as Voice. Pop-open via grid-template-rows 0fr→1fr and staggered keyframes.
- `js/sound.js`: 13 synthesized effects, 8 culture tunes (lookahead scheduler, 120 ms tick). The music follows the play state through setPlayIcon; the effect plays when the highlight enters a new line.
- `story_list.md`: 3 on the shelf, 10 planned, with third language, tune and voice support.

## Verified vs. unverified
- Verified (headless Chromium): three sizes, zero errors, no horizontal scroll, the recorded tracks play with highlight, script story labels and notes toggle, Kokoro live end to end. In the live test, HuggingFace and jsDelivr were redirected to local copies: the real kokoro-q8 weights and kokoro-js voices, the ORT wasm from npm @huggingface/transformers 3.5.1, and a **reconstructed** tokenizer.json and config.json (the real ones could not be downloaded here). In the container it made 1.7 s of speech in 4.9 s on one WASM thread.
- Unverified: the real HF tokenizer/config files (the page will use them on the iPad), live speed on the iPad, WebGPU engine, how the audio sounds (no listening possible here).

## Next steps
1. Jimmy listens, tries live on the iPad, answers `convo v0.3.md`.
2. Fisherman cast; 0.4 database.
