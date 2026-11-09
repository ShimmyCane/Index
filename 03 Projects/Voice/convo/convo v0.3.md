# Voice — Convo v0.3

**Round:** 3 (2026-11-09). Jimmy's answers from the chat, then what was built and what is open. Earlier open questions stay in `convo v0.2.md`.

## Jimmy's answers (from the chat)

- "Kokoro is great. Let's do v0.3 focused on it." → The database moves to 0.4.
- "Give me an option where it's loaded into the browser for live generation as well." → **Kokoro · live**.
- "Another story, this time with narrative (toggle hidden). An Aesop's with Red Riding Hood. Original version." → Little Red Riding Hood retold from Perrault's original (1697). It ends with the wolf and a moral, like Aesop. The narrative layer (tone, blocking, gestures, thoughts) is hidden behind 📜.
- Merge when done.

## What was built (0.3.0)

- 🧺 Little Red Riding Hood as a script story: a cast of five Kokoro voices (4:27) and a single-narrator version (4:48). Speaker labels on spoken lines. 📜 Show the hidden notes is off by default.
- Kokoro · live in 🎧 Compare voices on English stories: it downloads the model once (Small 92 MB or Fast 326 MB, chosen in ⚙️), makes each line in a background worker and plays it. It shows what it is doing ("Making line 3 of 42…").

## Open questions (round 3)

1. Perrault's ending is dark: the wolf eats Little Red and nobody comes to save her. Keep it for the kids, or add the later happy ending (the woodcutter) as a second version?
2. Do the cast voices fit? (Little Red is `af_sky`, the Wolf `am_onyx`.) Kokoro has no child voice; Sky is the lightest.
3. How fast is Kokoro · live on the iPad with Small, and with Fast? If it pauses between lines, should live be used only to *make* audio for new stories (saved for later), not to play on the spot?
4. Should the hidden notes ever be spoken, for example the thoughts in a whisper by the narrator?
5. Should the fisherman get a cast too (fisherman, wife, goldfish)?
