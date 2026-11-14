# Critique Detail — AI brief

**Updated:** 2026-11-14 · **Status:** MVP 0.1.0 · **Track:** B. Studio design

What it is: `run_review.py` reviews one detail against a CSI rulebook (Claude vision, structured output) and writes a report and a redlined image. `index.html` shows the result. Design: `03 Projects/Critique Detail/schematic.md`.

## Verified (2026-11-14)
- Mock run on the synthetic sample: fast path, 6 findings, report, redline clouds.
- Unseen detail (mock, PDF input): queue entry, draft rulebook written, run continues.
- `--push` request order and shapes against a fake local server (auth, 2 uploads, schema, detail, review, findings).
- Page from `file://` at 1180×820, 768×1024, 390×844: zero console errors, no horizontal scroll, bubbles select findings, filter, status and settings survive reload, notes, signed-out database check, print hides the gear.
- `sql_paste_check.py`: all four SQL files safe to paste.

## Not verified
- Any live model call (no key in the session). The request was only checked against the installed SDK's signature.
- The SQL on the live database. The rolled-back test was sent with the Supabase tool and timed out waiting for a confirmation; a read-only check afterwards showed nothing was left behind.
- Sign-in, storage upload and RLS with the real owner account. Real iPad.

## Database (Architecture, seen read-only 2026-11-14)
- No `dc_*` tables, no `platform_owners`, no `platform_is_owner()`, no `app_table_registry` (this project uses `table_index`, primary key `table_name`). One bucket, `sketch-media`. Existing `lessons_learned` belongs to Architecture practice, so ours is `dc_lessons`.
- `supabase/000_platform_owner.sql` is the shared file minus the `app_table_registry` insert.
- Existing policies there compare the sign-in email; ours call `platform_is_owner()`.

## Open
Questions in `convo/convo v0.1.md`. Work list in `todo.md`.
