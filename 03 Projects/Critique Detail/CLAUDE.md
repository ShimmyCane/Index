# Critique Detail — Claude Code pointer

Purpose: review one architectural detail against a CSI rulebook with a vision model, and show the report and redline on a page.

Track: B. Studio design.

- Design: `schematic.md` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Critique Detail/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run:
- Mock (no key, no network): `python3 run_review.py inputs/detail_sample.png --describe "Exterior low-slope roof parapet detail" --mock`
- Live: `pip install anthropic pillow pymupdf`, set `ANTHROPIC_API_KEY`, drop `--mock`.
- Save to the database: add `--push` with `DC_EMAIL` and `DC_PASSWORD` in the environment (owner sign-in; never in a file).
- Page: open `index.html` (no server). After changing the sample report, `schemas/` or `library/`: `python3 tools/bundle_sample.py`.
- Redraw the sample: `python3 tools/make_sample.py`, then the mock run, then the bundle.

Database (Architecture project, tables `dc_*`, bucket `dc-details`, registered in `public.table_index`). Paste by hand, in order: `supabase/000_platform_owner.sql` → `test_001_dc.sql` (expect an error starting `RESULT:`) → `001_dc_tables.sql` → `verify_001_dc.sql`. Then add the owner row by hand (see the header of `000`).

Project rules:
- Public repo. Only the synthetic sample is tracked in `inputs/` and `outputs/` (see `.gitignore`). Real details, office standards and vendor drawings stay out of git.
- Nothing from an office project in the repo or the database: `--source-kind` is `sample`, `sketch` or `own`.
- A mock result must always say it is a mock (report, markup and page all do).
- Rulebooks and lessons are written in our own words. No copied code text or vendor text.
