# Critique Detail — schematic

**Track: B. Studio design.** Status: MVP 0.2.0 (round 2: no AI call in the code, hard gate, CSI rulebook library, proof ideas).

A results page and a small script around a written review of one architectural detail (PDF, PNG or JPEG). The reviewer is Claude in a session, or a person. The script builds the QC list, checks the review, applies the gate, and writes the report and a redlined copy of the drawing.

## Purpose (Jimmy, 2026-11-14)

A page that can review and critique architectural details, and in doing so show that it understands them. The MVP is the framework for that: a front-end GUI, and an adaptive QC list for each type of detail, built from the project's requirements. Later rounds, with Claude or a future version, use that framework to critique better and to improve.

## Track defaults

| Setting | This project |
|---|---|
| Words on screen | full labels and units |
| Panels | collapsible; on a wide screen the drawing stays put and the right column scrolls |
| ⚙️ holds | drawing options, the five ideas to evaluate, a link to project defaults, cloud sign-in and check, notes, Show errors |
| Palette | paper and ink; red for redlines, green for proven, blue for a broken layer |
| Database | Architecture project, owner only |
| Working details | on the computer; saved to the cloud only when asked; never in git |

## Who does what

| Part | Does |
|---|---|
| `run_review.py prepare` | routes the detail to a rulebook, runs the local gate, builds the QC list, writes a packet |
| Reviewer (`reviewer.md`) | looks at the drawing, writes `<detail>.review.json` |
| `run_review.py apply` | checks the review file, applies the hard gate, computes the proof and verdict, writes report, Markdown and redline; `--push` saves to the cloud |
| `index.html` | shows results. It never runs a review and never calls an AI service |

## Rulebooks (`schemas/`, sorted by CSI)

`schemas/div_XX_<division>/<section number>_<detail type>.json`. 57 detail types in divisions 03, 04, 05, 06, 07, 08, 09, 10, 12, 14 and 32. Each has a CSI section and subcategory. 22 are written (6 or 7 items); 35 are **stubs** with an empty checklist. A stub is filled the first time a detail of that type is reviewed: the reviewer writes 6 items, the script saves them and the rulebook becomes active. An unknown detail type is logged in `schemas/_queue.json` and starts a new stub.

An item may carry `when` (a project condition) and `good` (a picture of a correct detail).

## The adaptive QC list

Built for each detail on each project by `build_qc_list`:

1. the rulebook's items for the detail type;
2. minus items whose `when` does not match the project (for example a wildfire item outside a fire hazard zone), plus those that do (origin `condition`);
3. plus the project's mandates that apply to the division (`PM-n`);
4. plus the lessons learned for that rulebook (`L-nnn`).

The sample parapet gets 13 items: 6 rulebook, 1 by condition (seismic design category D), 3 mandates, 3 lessons.

## The five steps

1. **Gate, hard.** The script rejects an image that is too small or blank. The reviewer rejects slop: no material tags, unclear geometry. A rejected drawing gets its reasons, a REJECTED stamp and no audit. A missing scale is a warning. `--gate soft` turns rejections into warnings.
2. **Context.** `project_context.json`: defaults from the 2025 California Building Standards Code, the project's own values, mandates.
3. **Audit, one pass.** The reviewer gives every QC item a result and lists the findings, each with a box.
4. **Priorities.** CRITICAL (water or structure), MAJOR (code or mandate), ADVISORY (lesson or best practice). Sorted and numbered.
5. **Output.** Report `.json` and `.md`, redline `.png` with numbered revision clouds from `[ymin, xmin, ymax, xmax]` (0 to 1000).

## Lean proof ideas (each can be switched off in ⚙️ to evaluate)

| Idea | What it does |
|---|---|
| Verdict line | READY, REVISE, CHECK or REJECTED, from the gate, the findings and the proof |
| Proof ledger | each QC item is a claim: proven (pass with a place on the drawing), claimed (pass, no place), disproven, not shown. The detail is proven when every critical and major claim is proven |
| Control layer trace | water, air, thermal, vapor: continuous, broken or not shown, with the place where a layer stops |
| Good detail pictures | a small picture of a correct detail in each finding (parapet rulebook only, so far) |
| One finding at a time | step through the fixes in order, worst first |

## Page

Left: the drawing with numbered boxes, and the list of details (bundled samples, saved copies, cloud, working files, and the Quick Detail cloud list when signed in). Right: verdict, findings, proof, control layers, the five steps, project defaults, rulebooks by CSI division, how to read. Tapping a number scrolls the right column to that finding.

Project defaults: opened from a link in ⚙️. Filled from the 2025 California code defaults, or from the open review's JSON, editable, and downloadable as `project_context.json`.

Cloud: owner sign-in, kept on the device until Sign out. A working file can be saved to the cloud from the Details panel.

## Database (Architecture, prefix `dc_`)

| Table | Holds |
|---|---|
| `dc_details` | one row per detail; `source_kind` (sample, sketch, own, office, quick_detail, library); `source_ref` to its cloud source; image in private bucket `dc-details` |
| `dc_reviews` | one row per review: reviewer, status (reviewed or rejected), summary, counts, full report JSON |
| `dc_findings` | numbered findings with severity, box, status |
| `dc_schemas` | rulebooks with CSI section and subcategory |
| `dc_lessons` | lessons by rulebook category |
| `dc_notes` | notes for improvement from the page |

Owner only: every policy calls `public.platform_is_owner()`. Reads Quick Detail's `sketch_details` (read only, not ours to change).

## Feedback notes

"Notes for improvement" in ⚙️. A note is saved with the detail, and the finding if one is selected. Device first; also sent to `dc_notes` when signed in.

## Limits

- A review is a second pair of eyes, not a sign-off.
- The sample review is a demonstration: the sample's faults were drawn on purpose by the same hand that reviewed it.
- Box positions are approximate.
- Rulebooks are from general practice. Section numbers need checking against current MasterFormat, and code lines against the adopted 2025 California codes and local amendments.
- Good-detail pictures exist for one rulebook.
