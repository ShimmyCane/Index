# Critique Detail — AI brief

**Updated:** 2026-11-14 · **Status:** MVP 0.2.0 · **Track:** B. Studio design

What it is: a results page (`index.html`) and a script (`run_review.py prepare | apply`) around a review written as JSON by Claude in a session or by a person. No AI call in the code. Design: `03 Projects/Critique Detail/schematic.md`; how to review: `reviewer.md`.

## Decisions (Jimmy, 2026-11-14)
- No AI key or AI call in the tool; AI works through the backend in a session.
- Hard gate: slop is rejected and called out.
- Rulebooks for all major CSI divisions, with subcategories; new ones active at once; Jimmy refines.
- Working details are local, saved to the cloud on request; never reference private buckets or files.
- Office details may go in the cloud. Sources: Quick Detail cloud, a detail library cloud (not located yet), and `dc_`.
- Page is static and shows results; stays signed in; defaults from the JSON input or the 2025 California Building Code.
- Wants a lean proof approach; ideas are toggles in ⚙️ to evaluate.

## Verified (2026-11-14)
- `prepare` and `apply` on the sample (REVISE, 7 findings, 1 of 13 proven) and on the slop sample (REJECTED, 3 reasons). A faulty review file lists its problems and writes nothing.
- Page from `file://` at 1180×820, 768×1024, 390×844: zero console errors, no horizontal scroll, bubble scrolls the right column, pictures load, proof and layer taps, five toggles, defaults edit and download, rejected view, print.
- Cloud paths with a faked network: sign-in, list, image, Quick Detail list, database check, session renewal after reload, save to cloud (5 requests in order), sign out.
- Live database, read only: 6 `dc_` tables with RLS on, one policy each, anon blocked; bucket `dc-details` private with one policy; `table_index` rows present. **`platform_owners` has 0 rows.**
- A session can read the Architecture backend over the connected host (REST and storage).

## Not verified
- Anything with the real owner account. `002` on the live database. A review of a real detail. Real iPad.
- Section numbers against current MasterFormat; code lines against the adopted 2025 California codes.

## Open
Questions in `convo/convo v0.2.md`. Work list in `todo.md`.
