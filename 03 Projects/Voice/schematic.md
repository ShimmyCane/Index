# Voice — Schematic

**Track:** A. Family play (stories for the kids on the iPad). The writing and voice-making side is a small grown-up corner inside ⚙️.
**Status:** idea (schematic draft 0.1, 2026-11-09). Questions open in `convo/convo v0.1.md`.

## 1. The idea in one paragraph

A home page with a shelf of stories that Jimmy and Claude write together. Tap a story and it plays in a natural voice, not the robot voice of the browser. The voice is not made live: when a story is saved or changed, a server step sends the text to a voice service once, gets back an audio file and the time of every word, and saves both with the story in the Family database. The iPad only plays the file. When a story is edited, its audio is made again and the old version is kept. A second way to read the story is **Speed read**: one word at a time in a fixed spot, with the focus letter in red, and a speed slider to see how fast you can go.

## 2. Is it feasible? Yes

| Question | Answer |
|---|---|
| Does the iPad's built-in voice sound bad? | The default one does. iPad also has free Enhanced and Premium voices (Settings → Accessibility → Spoken Content → Voices), which are much better, and the page can use them. They are the free fallback, not the main voice. |
| Can we borrow "Claude's voice"? | Not directly. Claude writes the story; the voice in the Claude app cannot be called from a web page. A text-to-speech service makes the audio. |
| Which services make natural audio? | ElevenLabs, OpenAI's speech voices, Google Cloud and Azure neural voices. All take text and return an MP3. ElevenLabs can also return the time of every character, which gives word timings for free. |
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
| 0.1 | Page shell: shelf, story screen, speed read, ⚙️ with notes (device storage), two bundled sample stories read by the iPad voice. | Nothing external. |
| 0.2 | One sample story with a real AI-made MP3 and word timings, bundled, to hear the difference. | A voice service choice and one generation (by Jimmy or a local script). |
| 0.3 | Family database: tables, bucket, sign-in, stories load live, cache on device. | Paste SQL. |
| 0.4 | Edge Function ✨ Make voice, versions and restore in the grown-up corner. | Voice-service key as a secret. |
| 0.5 | Polish: covers, chapter stories, per-reader speed records, character voices. | Feedback notes. |

## 7. Not in scope (for now)

- Live, made-on-the-spot speech for every tap (cost, delay and a key in the browser).
- Cloning a family member's voice. Possible with some services, but it is personal biometric data: only if Jimmy asks, and never in this public repo.
- Speech recognition (reading aloud and being checked).

## 8. Checks before saying it works

- `/smoke-test` at three sizes: zero JS errors, no horizontal scroll, ▶ plays, the slider changes speed, notes survive a reload.
- iPad Safari specifics: audio only starts after a tap; the page must not autoplay. Test on the real device.
- `/privacy-check` before every commit.
