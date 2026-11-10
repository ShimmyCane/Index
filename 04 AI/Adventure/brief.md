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

## Verified vs. unverified

- Verified in headless Chromium with a stand-in Supabase client that rejects unknown tables and columns: sign-in, catch-up lengths, recap, building a 3-beat scene across two characters, send with confirm, asleep banner, reload → peek; under the hood edit/save, add chapter numbering, history undo calls `adv_restore`. No page errors.
- World page verified the same way: map drag/resize saves, nested maps, add place, journal append with chapter, plot add/save; no horizontal scroll at phone width.
- Not applied: `supabase/001_adventure.sql`, `003_world.sql`, `002_seed.sql` (in that order). `apply_migration` timed out twice waiting for a confirmation; nothing was created. Fallback: paste them into the Supabase SQL editor.
- 2026-11-10, verified: all four SQL files on local Postgres 16 with stub roles (seed re-runnable, every row logged in `adv_history`); headless Chromium at three sizes on all four pages plus `lore.html`, zero errors, no horizontal scroll; chapter 1 from the offline copy; recorded narration plays with line and word highlight; tap a line jumps there (with a Range-capable server); stale-recording check; director's notes toggle.
- Unverified: how the recording sounds (no listening here), the iPad voice path on Safari, real sign-in, RLS against the live database, the history trigger and rollback functions, the microphone and voices on iPad Safari, the storyteller run end to end.

## Next steps

1. Apply `001_adventure.sql`, `003_world.sql`, then `002_seed.sql`; test RLS and rollback in a rolled-back transaction; check `app_table_unregistered` and the security advisors.
2. Run the storyteller once by hand.
3. Try on the iPad (GitHub Pages).
4. Set up the nightly scheduled task.
