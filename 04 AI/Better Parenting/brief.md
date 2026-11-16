# Better Parenting — brief

**Updated:** 2026-11-16
**Status:** MVP 0.1.0, headless-tested, not device-tested. Family tables written and wired; **not applied**.

## Goal
A parent practises and refreshes parenting skills for children from K to grade 5: many concrete scenarios, the general approach by topic and stage, named skills, and a scenario of your own. Track A, family look, adult reader.

## Architecture
Plain HTML/CSS/JS, classic scripts, no build. Content in `data/` (`core.js`: 3 stages, 16 topics, 18 skills, 31 library links; `scenarios_1..3.js`: 144 scenarios through `BP.S`). `js/app.js` builds every node with `textContent`. Practice is answer, compare, self-rate, with return times of 2, 7 and 30 days. Own scenarios are built from the topic plan plus the stage note; an AI prompt can be copied and the pasted JSON reply is parsed, validated and applied with undo. `js/family.js` signs in to the Family project and syncs `bp_notes`, `bp_scenarios` (merge, newer wins) and `bp_practice` (ignore duplicates).

## Database (seen read-only 2026-11-16)
Family project: no `bp_*` objects existed; `app_table_registry` has columns app, object_name, object_type, access, description, repo; `app_table_unregistered` showed 3 rows that belong to other apps. `supabase/test_001_bp.sql`, `001_bp_family.sql`, `verify_001_bp.sql` pass `sql_paste_check.py`. The rolled-back test was sent through the tool once and the tool's confirmation prompt timed out, so nothing ran.

## Verified (headless Chromium, 2026-11-16)
Three sizes: zero errors, no horizontal scroll, from `file://`. Data ids valid (topics, skills, stages; no duplicate ids; every skill used). Grade, topic, search and Saved filters; scenario sheet; practice save; own scenario; AI reply rejected when not JSON, when invalid, applied when valid, undo; skill sheet; pause; notes; error panel; signed-out database check says "this device only"; reload keeps state; print hides the gear.

## Not verified
Real device; real sign-in and sync; the SQL on the live database; every video link (YouTube is blocked from the sandbox); web fonts (blocked in the test, fallbacks shown).

## Next steps
`03 Projects/Better Parenting/todo.md` and `convo/convo v0.1.md`.
