# Critique Detail — Claude Code pointer

Purpose: a page that can review and critique architectural details, and show that it understands them. The framework is a results page plus an adaptive QC list for each detail type, built from the project's requirements. Claude (or a future version) writes the reviews in a session; the code holds no AI key.

Track: B. Studio design.

- Design: `schematic.md` · How to write a review: `reviewer.md` · Open work: `todo.md`
- Q&A history: `convo/` (never compact; start a new version instead)
- AI notes: `04 AI/Critique Detail/brief.md` and `lessons.md`
- Shared conventions: root `CLAUDE.md` (public repo, privacy)

How to run:
- Packet for the reviewer: `python3 run_review.py prepare inputs/detail_sample.png --describe "Exterior low-slope roof parapet detail"`
- Report and redline from a written review: `python3 run_review.py apply inputs/detail_sample.png --describe "Exterior low-slope roof parapet detail"` (reads `inputs/detail_sample.review.json`)
- The rejected sample: `python3 run_review.py apply inputs/detail_slop.png --schema div_07_thermal_moisture/077100_roof_parapet --describe "roof edge"`
- Needs Pillow; PDF input also needs `pip install pymupdf`.
- Page: open `index.html` (no server). After changing a sample report, `schemas/`, `library/` or `project_context.json`: `python3 tools/bundle_sample.py`.
- Redraw the samples and good-detail pictures: `python3 tools/make_sample.py`, then both `apply` lines, then the bundle.
- Save to the cloud: `apply ... --push` with `DC_EMAIL` and `DC_PASSWORD` in the environment, or the Save button on the page. Never put the sign-in in a file.

Cloud (Architecture project, tables `dc_*`, bucket `dc-details`, in `public.table_index`). `000` and `001` are live. Next to paste, in order: `supabase/test_002_dc.sql` (expect an error starting `RESULT:`) → `002_dc_round2.sql` → `verify_002_dc.sql`. The owner row in `platform_owners` is added by hand (header of `000`); until then the page sees no rows.

Project rules:
- Public repo. Only the synthetic samples are tracked in `inputs/` and `outputs/` (see `.gitignore`). Working details stay on the computer until saved to the cloud.
- Office details may go in the cloud (owner only). They never go in the repo, and neither do their reports.
- References to good or standard details link to a cloud detail or to a synthetic picture in `library/good_details/`. Never to a private file or bucket path.
- The code calls no AI service. A review always names its reviewer.
- Rulebooks and lessons are in our own words. Section numbers and code lines need checking against current MasterFormat and the adopted code edition.
