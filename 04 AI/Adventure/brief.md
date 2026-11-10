# Adventure — AI Brief

**Updated:** 2026-11-10
**Status:** MVP, world tools, the world of Ondra (`world/`), Book 1 outline and a voiced chapter 1. Database tables not yet applied.

## Goal

A family story game played like correspondence chess: roles instead of players, spoken scenes built from ordered beats, a nightly Claude storyteller, and Jimmy as dungeon master under the hood with full edit and rollback.

## Architecture

- Plain HTML/CSS/JS, no build. `index.html` (player), `world.html` (map, journal, plot) and `hood.html` (under the hood) share `style.css`, `js/common.js`, `js/config.js`.
- Supabase **Family** project (shared with Family Habits and others; one auth user, the family login). Tables `adv_roles`, `adv_entries`, `adv_chapters` (with `status` planned/published and `plan`), `adv_turns`, `adv_runs`, `adv_places` (tree; each place is a map of its children), `adv_notes` (append-only journal), `adv_history`. A trigger logs every change; `adv_restore` and `adv_restore_to` roll back. Registered under app `adventure`.
- Loading: live (8 s timeout) → last good copy in localStorage → `data/fallback.json`. Status pill, error panel behind ⚙️ "Show errors", database check in ⚙️.
- Catch-up length by time since this device last opened the page (localStorage `adv.lastSeen`): ≥12 h long, ≥1 h short, else tiny.
- Speech in: `webkitSpeechRecognition` when present, else typed text (keyboard dictation). Speech out: `speechSynthesis`, one utterance per paragraph.
- The draft scene lives in localStorage until sent, so nothing is lost offline.
- Storyteller: `storyteller.md`, run by Claude with the Supabase connector. Writes as actor `claude`.

## The world and the voices (2026-11-10)

- World bible in `03 Projects/Adventure/world/` (bible, regions, peoples, creatures, book1); `lore.html` renders it with vendored `lib/marked.min.js`. Short copies live in `adv_entries` via `002_seed.sql`.
- The player is a Seedling: woke in Vael's roots with no memory, the Sun and Moon key and Bristle. Roles: wanderer, bristle, old_lady (Granny Wren), storyteller.
- Voiced chapters: script format from Voice (`cast`, `script` lines with `who`, `text`, `speed`, `sfx`, `notes`). Bundled: `story/b1c1.js` (`window.ADV_SCRIPTS['1.1']`), recording `story/b1c1.audio.js` + `audio/b1c1.cast.mp3` (270 s, line timings, words estimated by length). Database: `adv_chapters.script` (`004_script.sql`). `js/narrate.js` plays the recording if its `source` matches the script, else the iPad voice per line with per-character pitch/rate. `js/sound.js` copied from Voice as `AdvSound`, plus `forest` tune and `hoot`/`hum` effects.
- Baker: `tools/make_voice.py` (kokoro-onnx + npm weights, no misaki needed for English; `misaki[en]` fails to build spacy here).
- Seed generated from the script by a scratch script (not committed): `002_seed.sql` and `data/fallback.json` both carry the same chapter 1.

## Round 2 (2026-11-10, answers in convo v0.4)

- **Athena's story:** role key `athena` (was `wanderer`); she names herself at the Naming Bowl.
- **Reckoning:** manual switch (`setting` "Reckoning": `off` / `on (from chapter N)`), blooms at N + 10; Bloom clock capped at 5/6 while off; 8 teasers scheduled in chapters 1–24 (`world/books.md`). Man-made War of the Broken Concord around it; "Light in the dark" rule (a funny moment every chapter).
- **Ten books** with branches (`2·Lantern/Salt/Iron`, `3·Kept/Broken`), tracked in `setting` "Branch". Athena's other lives unlock after Books 3, 4, 5 and 8.
- **Voices page** `voices.html` + `js/voices.js`: samples from `story/voice_samples.js` baked to `audio/samples/` (23 files, 1.6 MB); picks → `setting` "Voices" JSON `{cast: {role: {voice, speed}}}`. `Adv.signIn({ quiet: true })` lets the page work signed out; the form appears on Save.
- **Recording step:** `make_voice.py --db` reads Voices + published chapters with a script, records those whose `audio.source/voices/speeds` differ, uploads to bucket `adv-audio` (POST storage object, x-upsert), PATCHes `adv_chapters.audio`. Cast speeds now live on the cast (`speed`), lines only override. Player: `scriptOf` attaches `ch.audio`; `narrate` gets a signed URL (3 h) before playing.
- Live database (checked 2026-11-10): 001 and 003 applied, all tables empty; 004, 005 and 002 to paste. `006_registry.sql` applied 2026-11-10: all 12 `adventure` registry rows say "Adventure (03 Projects/Adventure): …", repo `ShimmyCane/Index`, nothing `adv_` unregistered. The bucket `adv-audio` can't have a registry row (types are table/view/function only); it is named on `adv_chapters`. The cloud proxy signs REST and Storage requests to the Family project (bucket listing worked).

## Verified vs. unverified

- Verified in headless Chromium with a stand-in Supabase client that rejects unknown tables and columns: sign-in, catch-up lengths, recap, building a 3-beat scene across two characters, send with confirm, asleep banner, reload → peek; under the hood edit/save, add chapter numbering, history undo calls `adv_restore`. No page errors.
- World page verified the same way: map drag/resize saves, nested maps, add place, journal append with chapter, plot add/save; no horizontal scroll at phone width.
- Not applied: `supabase/001_adventure.sql`, `003_world.sql`, `002_seed.sql` (in that order). `apply_migration` timed out twice waiting for a confirmation; nothing was created. Fallback: paste them into the Supabase SQL editor.
- 2026-11-10, verified: all four SQL files on local Postgres 16 with stub roles (seed re-runnable, every row logged in `adv_history`); headless Chromium at three sizes on all four pages plus `lore.html`, zero errors, no horizontal scroll; chapter 1 from the offline copy; recorded narration plays with line and word highlight; tap a line jumps there (with a Range-capable server); stale-recording check; director's notes toggle.
- Round 2, verified: SQL chain 001 → 003 → 004 → 005 → 002 (twice) on local Postgres with stub roles and a stub storage schema; `--db` against a local stand-in for REST and Storage (uses the Voices pick, uploads, patches, skips when up to date); headless Chromium at three sizes on all six pages with a stand-in client (a bucket recording plays via a signed link; picks save with speed).
- Unverified: the real upload to `adv-audio` from a cloud session (bucket not created yet), how the recording sounds (no listening here), the iPad voice path on Safari, real sign-in, RLS against the live database, the history trigger and rollback functions, the microphone and voices on iPad Safari, the storyteller run end to end.

## Next steps

1. Apply `001_adventure.sql`, `003_world.sql`, then `002_seed.sql`; test RLS and rollback in a rolled-back transaction; check `app_table_unregistered` and the security advisors.
2. Run the storyteller once by hand.
3. Try on the iPad (GitHub Pages).
4. Set up the nightly scheduled task.
