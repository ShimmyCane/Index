# Critique Detail — schematic

**Track: B. Studio design.** Status: MVP 0.1.0 (mock run tested; live model run and database not yet tested).

A command-line tool that reviews one architectural detail (PDF, PNG or JPEG) against a CSI-organized rulebook, and a page that shows the result. The review produces a report and a redlined copy of the drawing.

## Purpose (Jimmy, 2026-11-14)

A page that can review and critique architectural details, and in doing so show that it understands them. The MVP is the framework for that: a front-end GUI, and an adaptive QC list for each type of detail, built from the project's requirements. Later rounds, with Claude or a future version, use that framework to critique better and to improve.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | full labels and units |
| Panels | collapsible, open by default; Details, All rulebooks and How to read start closed |
| ⚙️ holds | box and drawing options, database sign-in and check, notes for improvement, Show errors, version |
| Palette | paper and ink; red only for redlines and severity |
| Database | Architecture project, owner only |
| Private data | real details in `inputs/` (ignored by git) or a `private/` folder; never committed |

## Folder map (the brief's `detail_critique_mvp/` is this project folder)

```
run_review.py               main script
project_context.json        project constraints (synthetic sample)
schemas/                    CSI rulebooks, one JSON per detail type; _template.json; _queue.json
library/                    office_typical_details/, manufacturer_standards/ (indexes only), lessons_learned.json
inputs/                     detail_sample.png + its mock fixture; everything else here is ignored by git
outputs/reports/, markups/  report .json and .md, redlined .png; only the sample's are tracked
index.html, css/, js/       the viewer page
supabase/                   SQL to paste by hand
tools/                      make_sample.py (draws the sample), bundle_sample.py (page data)
```

## Phase 1. Intake and routing

1. Intake: one detail file and an optional one-line description. A PDF is rasterized (page 1, 200 dpi).
2. Schema match: keywords of each rulebook are scored against the description and file name.
   - **Fast path:** a rulebook matches; load it.
   - **No keyword match, live run:** the model is shown the drawing and the list of rulebooks, and picks one or says none fits.
   - **Deferred learning path:** the detail type is logged in `schemas/_queue.json`, the model writes a 6-item rulebook from `_template.json`, it is saved in the right `div_XX_*` folder, and the run continues with it. In a mock run the new rulebook is a generic draft (`status: draft`).

## Phase 2. The five steps

1. **Completeness gate, soft.** The script checks resolution, contrast and linework. The model reports scale, material labels and geometry in the same pass as the audit. Anything missing is a warning; the run never stops for it.
2. **Context.** `project_context.json` (code edition, energy code, ASHRAE climate zone, mandates) and the lessons for this rulebook from `library/lessons_learned.json`.
3. **Audit, one pass.** Image + rulebook + constraints go to the vision model once. It returns a result for every checklist item and a list of findings, each with a box.
4. **Priorities.** CRITICAL (water or structure failure), MAJOR (code or mandate), ADVISORY (lesson or best practice). Sorted and numbered.
5. **Output.** `outputs/reports/<name>.json` and `.md`; `outputs/markups/<name>_markup.png` with numbered revision clouds drawn from `[ymin, xmin, ymax, xmax]` (0 to 1000); each finding linked to office and manufacturer details for the same rulebook.

## Model

Claude through the `anthropic` Python package, model `claude-opus-5-5`, structured JSON output, refusal fallback on. `--model` changes it. `--mock` makes no model call.

## Page (`index.html`)

Shows one review: the drawing with numbered boxes, findings by severity with Open / Accepted / Dismissed, the five steps, the rulebook with pass / fail / not shown, all rulebooks and lessons. Data order: database (signed in) → saved copy on the device (reports only, no images) → bundled sample. A report file and its image can also be opened from disk; that stays on the device.

## Database (Architecture, prefix `dc_`)

| Table | Holds |
|---|---|
| `dc_details` | one row per detail; image in private bucket `dc-details` |
| `dc_reviews` | one row per run: mode, summary, counts, full report JSON, markup path |
| `dc_findings` | numbered findings with severity, box, status |
| `dc_schemas` | rulebooks (seed or auto-generated) |
| `dc_lessons` | lessons by rulebook category |
| `dc_notes` | notes for improvement from the page |

Owner only: every policy calls `public.platform_is_owner()`. `run_review.py --push` writes; the page reads, and writes finding status and notes. SQL and paste order: `supabase/` and `CLAUDE.md`.

## Feedback notes

"Notes for improvement" in ⚙️. A note is saved with the detail, and the finding if one is selected. Device first; also sent to `dc_notes` when signed in. Read back in the same panel.

## Limits

- A model review is a second pair of eyes, not a sign-off.
- Box positions come from the model and are approximate.
- The rulebooks were written from general building-science practice. They are not checked against a code edition or an office standard.
- The library holds placeholders only.
