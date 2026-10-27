# Adventure — AI Brief

**Updated:** 2026-10-27
**Status:** MVP built. Database tables not yet applied.

## Goal

A family story game played like correspondence chess: roles instead of players, spoken scenes built from ordered beats, a nightly Claude storyteller, and Jimmy as dungeon master under the hood with full edit and rollback.

## Architecture

- Plain HTML/CSS/JS, no build. `index.html` (player) and `hood.html` (under the hood) share `style.css`, `js/common.js`, `js/config.js`.
- Supabase **Family** project (shared with Family Habits and others; one auth user, the family login). Tables `adv_roles`, `adv_entries`, `adv_chapters`, `adv_turns`, `adv_runs`, `adv_history`. A trigger logs every change; `adv_restore` and `adv_restore_to` roll back. Registered under app `adventure`.
- Loading: live (8 s timeout) → last good copy in localStorage → `data/fallback.json`. Status pill, error panel behind ⚙️ "Show errors", database check in ⚙️.
- Catch-up length by time since this device last opened the page (localStorage `adv.lastSeen`): ≥12 h long, ≥1 h short, else tiny.
- Speech in: `webkitSpeechRecognition` when present, else typed text (keyboard dictation). Speech out: `speechSynthesis`, one utterance per paragraph.
- The draft scene lives in localStorage until sent, so nothing is lost offline.
- Storyteller: `storyteller.md`, run by Claude with the Supabase connector. Writes as actor `claude`.

## Verified vs. unverified

- Verified in headless Chromium with a stand-in Supabase client that rejects unknown tables and columns: sign-in, catch-up lengths, recap, building a 3-beat scene across two characters, send with confirm, asleep banner, reload → peek; under the hood edit/save, add chapter numbering, history undo calls `adv_restore`. No page errors.
- Not applied: `supabase/001_adventure.sql` and `002_seed.sql`. The `apply_migration` call timed out waiting for a confirmation; nothing was created.
- Unverified: real sign-in, RLS against the live database, the history trigger and rollback functions, the microphone and voices on iPad Safari, the storyteller run end to end.

## Next steps

1. Apply `001_adventure.sql`, then `002_seed.sql`; test RLS and rollback in a rolled-back transaction; check `app_table_unregistered` and the security advisors.
2. Run the storyteller once by hand.
3. Try on the iPad (GitHub Pages).
4. Set up the nightly scheduled task.
