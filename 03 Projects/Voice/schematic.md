# Voice — Schematic

**Track:** A. Family play (stories for the kids on the iPad). The writing and voice-making side is a small grown-up corner inside ⚙️.
**Status:** MVP 0.3.0 (2026-11-09, not yet device-tested). Kokoro-focused: three stories, a script story with a cast of voices and hidden notes, and Kokoro live in the browser. Decisions in `convo/convo v0.3.md`.

## 1. The idea in one paragraph

A home page with a shelf of stories that Jimmy and Claude write together. Tap a story and it plays in a natural voice, not the robot voice of the browser. The voice is not made live: when a story is saved or changed, a server step sends the text to a voice service once, gets back an audio file and the time of every word, and saves both with the story in the Family database. The iPad only plays the file. When a story is edited, its audio is made again and the old version is kept. A second way to read the story is **Speed read**: one word at a time in a fixed spot, with the focus letter in red, and a speed slider to see how fast you can go.

## 2. Is it feasible? Yes

| Question | Answer |
|---|---|
| Does the iPad's built-in voice sound bad? | The default one does. iPad also has free Enhanced and Premium voices (Settings → Accessibility → Spoken Content → Voices), which are much better, and the page can use them. They are the free fallback, not the main voice. |
| Can we borrow "Claude's voice"? | Not directly. Claude writes the story; the voice in the Claude app cannot be called from a web page. A text-to-speech service makes the audio. |
| Is there a free natural voice? | Yes: **Kokoro-82M**, an open voice model (Apache 2.0). It runs on a computer, no account or key, and speaks English and Mandarin. Used for 0.2 (`tools/make_kokoro.py`). Its weights and voices come from npm (`kokoro-q8-shards`, `kokoro-js`), because HuggingFace and GitHub downloads are blocked in the cloud sessions. |
| Which paid services make natural audio? | ElevenLabs, OpenAI's speech voices, Google Cloud and Azure neural voices. All take text and return an MP3. ElevenLabs can also return the time of every character, which gives word timings for free. |
| Cost | A 500-word story is about 3,000 characters, roughly a few cents to make once. Playing it back costs nothing. To confirm with real prices before the first build. |
| Is the key safe? | Only if it never reaches the browser. It lives as a Supabase Edge Function secret (or on Jimmy's computer for a local script). The page asks the function to narrate; the function calls the voice service. |
| Does it work offline? | Yes, once a story was played: audio and text are cached on the device. With no audio at all, the page falls back to the iPad voice. |

Three-tier fallback (Jimmy's preferred pattern):
1. **Live:** story text + audio from the Family database and Storage.
2. **Device cache:** last loaded stories and audio (Cache Storage / localStorage), so it plays on the couch with no Wi-Fi.
3. **Bundled:** one or two sample stories with their MP3 in the repo, so the page always has something to play. Fallback voice: the iPad's best installed voice.

## 3. Screens

### 3.1 Home — the story shelf
- Big cards, one per story: a cover (emoji or a small drawing), the title, a ▶ button, and the length in minutes.
- Newest or most recently changed story first. Old versions fold under the card (only in the grown-up corner).
- Nothing else on screen. ⚙️ in the lower right.

### 3.2 Story — listen and read along
- The story text, large, with the spoken word highlighted as the audio plays (from the word timings).
- Under the text: ▶/⏸, ⟲ back to the start, a time slider. Tap a word to jump the audio there.
- A toggle at the top: **📖 Read along** | **⚡ Speed read**.

### 3.3 Speed read (RSVP)
- One word at a time, always in the same spot. The **focus letter** (about one third into the word: the 2nd letter of a 4–5 letter word, the 3rd of a 6–9 letter word) is red, and lined up under a small red tick above and below, so the eye never moves.
- **Speed slider** you drag: 100 to 600 words a minute (default to confirm). Big readout of the current speed.
- Longer pause on commas and full stops; long words get a little more time.
- ▶/⏸, step back one sentence. The audio is off in this mode: a recording plays at its own pace and cannot follow the slider.
- A small "best speed" record per reader on the device.

### 3.4 ⚙️ Settings drawer (`02 Refs/Skills/settings_gear.md`)
- Voice: Story voice (recorded) | iPad voice, and which iPad voice.
- Text size, highlight on/off, Speed-read default speed.
- **Notes for improvement** (`02 Refs/Skills/feedback_notes.md`): each note saved with the story id, its version, the mode (read along or speed read) and the time.
- **Family sign-in** (the Family login, same as other family apps).
- **Grown-up corner** (signed in only): add or edit a story, ✨ Make voice, see versions and restore one.
- Database check, Show errors (errors at the bottom, opt-in).

## 4. How a story gets its voice

```
Jimmy + Claude write the story (in a chat, or in the grown-up corner)
        │
        ▼
voice_stories row  ──►  new voice_versions row (text, version n, status "waiting")
        │
        ▼   ✨ Make voice (signed in)
Edge Function voice-narrate  (holds the voice-service key as a secret)
        │  sends text + voice choice to the voice service
        ▼
MP3 + word timings  ──►  Storage voice-audio/<story>/<version>.mp3
                        voice_versions.timings (JSON), status "ready"
        │
        ▼
iPad plays the MP3 and highlights words from the timings
```

Claude can also prepare the story text and the speaking notes (pauses, which words to stress, character voices) as part of writing it. Some services read light markup for pauses and emphasis; the text keeps that markup in one field and the plain text in another, so speed read never shows it.

## 5. Data (Family project, prefix `voice_`, manual paste via `/supabase-link`)

| Table / object | Purpose | Who |
|---|---|---|
| `voice_stories` | One row per story: id, title, cover, current version, created/changed time. | Family sign-in reads; family writes. |
| `voice_versions` | One row per version: story id, version number, text, speaking text, voice id, audio path, word timings (JSON), status (waiting / making / ready / failed), note. Never overwritten: version control is a new row. | Family reads; family writes. |
| `voice_notes` | Notes for improvement, same shape as `fish_notes`. | Family insert and read. |
| Storage bucket `voice-audio` | MP3 files, private, signed-in read. | Family read; Edge Function writes. |
| Edge Function `voice-narrate` | Turns a version into audio. Secret: the voice-service key (set by Jimmy in the dashboard). | Signed-in callers only. |

All tables: RLS on, anon revoked, registered in `app_table_registry` under app `voice`.

## 6. Increments

| # | What | Needs |
|---|---|---|
| 0.1 ✅ | Page shell: shelf, story screen, speed read, ⚙️ with notes (device storage), the iPad voice. | Nothing external. |
| 0.2 ✅ | Listening test: The Fisherman and the Goldfish (English) and 狼来了 (Chinese), each with two Kokoro voices (MP3 + estimated word timings) beside the iPad voice, in 🎧 Compare voices. ElevenLabs slot shown, not made (needs a key). | Done with Kokoro, free. |
| 0.3 ✅ | Kokoro focus: Little Red Riding Hood (Perrault's original, with its moral) as a **script story** (cast of five Kokoro voices, tone per line, hidden notes for blocking, gestures and thoughts behind 📜). **Kokoro · live**: the model runs in the browser (worker, kokoro-js), English only. | Nothing external; the live model downloads from huggingface.co once. |
| 0.4 | Family database: tables, bucket, sign-in, stories load live, cache on device. | Paste SQL. |
| 0.5 | ✨ Make voice, versions and restore in the grown-up corner (Kokoro in the browser can make it, no key needed). | — |
| 0.6 | Polish: covers, chapter stories, per-reader speed records, character voices. | Feedback notes. |

## 6b. Listening test (0.2)

| Story | Tracks |
|---|---|
| 🐟 The Fisherman and the Goldfish | Kokoro · Heart (af_heart, 2:38), Kokoro · Fable (bm_fable, 3:35), iPad voice, ElevenLabs (not made) |
| 🐺 狼来了 | Kokoro · 晓晓 (zf_xiaoxiao, 1:31), Kokoro · 云希 (zm_yunxi, 1:22), iPad voice (中文), ElevenLabs (not made) |

Files: `stories/<id>.js` (text, edited by hand), `stories/<id>.audio.js` (made by the script: tokens, word times, the text it was made from), `audio/<id>.<voice>.mp3`. If the text changes and the audio is not remade, the page marks the audio "older than the text" and uses the iPad voice. Word times are estimated: phrase starts are exact, words inside a phrase share its length by their sounds.

## 6c. Script stories and Kokoro live (0.3)

**Script story format** (`stories/red_hood.js`): `cast` maps a speaker to a name, an icon and a Kokoro voice; `script` is a list of lines `{ who, text, tone?, speed?, notes?: [{ kind: blocking | gesture | thought, text }] }`. Each line is one paragraph. The story view shows a speaker label on every spoken line. **📜 Show the hidden notes** (off by default) shows the tone and notes above each line. Notes are never spoken. `tone` is kept for voice services that follow directions; Kokoro only uses `speed`.

The `cast` track reads each line in its speaker's voice: Narrator `bm_fable`, Mother `af_sarah`, Little Red `af_sky`, Wolf `am_onyx`, Grandmother `bf_isabella`. A single-narrator track (`bm_fable`) is there to compare.

**Kokoro · live:** `js/live.js` starts a module worker (`js/live_worker.js`) that loads `lib/kokoro.web.js` (kokoro-js 1.2.1, Apache 2.0, vendored) and the model `onnx-community/Kokoro-82M-v1.0-ONNX` from huggingface.co. The browser keeps the model in its cache after the first time. Engines in ⚙️: Small (WASM, q8, 92 MB) and Fast (WebGPU, fp32, 326 MB). The page makes the line it needs, plays it with Web Audio, and makes three lines ahead. The word highlight is estimated per line. English only, because the kokoro-js phonemizer is English. In the cloud test (4 slow CPUs, one thread) the Small engine made 1.7 s of speech in 4.9 s, so it may pause between lines there. It has not been tested on the iPad.

## 7. Not in scope (for now)

- Live, made-on-the-spot speech for every tap (cost, delay and a key in the browser).
- Cloning a family member's voice. Possible with some services, but it is personal biometric data: only if Jimmy asks, and never in this public repo.
- Speech recognition (reading aloud and being checked).

## 8. Checks before saying it works

- `/smoke-test` at three sizes: zero JS errors, no horizontal scroll, ▶ plays, the slider changes speed, notes survive a reload.
- iPad Safari specifics: audio only starts after a tap; the page must not autoplay. Test on the real device.
- `/privacy-check` before every commit.
