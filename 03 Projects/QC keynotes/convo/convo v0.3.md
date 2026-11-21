# QC keynotes — convo v0.3

Purpose: follow-up after the four-step build (v0.2.0). Jimmy answers inline.

## Map Photos export
1. The Map Photos PDF export is the reference you want. Its code is not in this repo: the index tile links to its own GitHub Pages site, and this session may only read the index repo. Options: (a) paste or copy the export file into this project folder (e.g. `03 Projects/QC keynotes/reference/map_photos_export.js`, synthetic or no private content), or (b) tell me to add that repo for read access. Which do you want?
   - Answer:

## Blank items from v0.2
2. Questions 1–3 (guideline source, scopes, keynote syntax examples) are left blank for now. Leave them until you are ready, or say what you want next.
   - Answer:

## Database
3. Feedback notes are built and wired to the Architecture database (`qk_notes`), but the table is not applied yet. Paste order: `supabase/test_001_qk.sql` (expect `test_rows = 1`, then rollback), `supabase/001_qk_notes.sql`, `supabase/verify_001_qk.sql` (expect rls_on true, 1 policy, 0 anon grants, 1 registry row). Ask me if you want to paste it yourself or have it applied with the migration tool.
   - Answer:
