# Drafting — AI brief

**Updated:** 2026-11-18
**Status:** MVP 0.1 (increment 1, 2026-11-18). DXF writer (AC1027 default, AC1009 alternate), DXF reader, linter (validity and confidence), one page. Answers from Jimmy in `03 Projects/Drafting/convo/convo v0.2.md`.
**Track:** B. Studio design.

## Increment 1: what was built and checked

- Files: `js/primitives.js` (one list in real inches from Quick Detail items), `js/dxf_write.js`, `js/dxf_read.js`, `js/linter.js`, `js/pipeline.js`, `js/app.js`, `index.html`, `js/samples.js`, `samples/` (two synthetic details tagged `export`), `tests/test_dxf.js`.
- Checked: 12 Node tests pass (round trip with coordinates, HATCH and polyline output, R12 behaviour, linter warnings, refused non-finite coordinate, broken file, unknown entity, ezdxf audit). ezdxf (1.4.5, test-only) reports 0 errors and 0 fixes for both versions and both samples. Headless Chromium at iPad and phone widths: no JavaScript errors, no horizontal scroll, download works.
- Not checked: no AutoCAD or Revit open yet. Confidence was 90% on both samples, so the 80% viewer trigger did not fire on the samples; the test checks the rule, not a live case.
- Known gaps: `dim` and `block` are listed as not exported (increment 2); pattern hatches are drawn as outlines (increment 2); R12 has no hatch fill; no 3-D (increment 4).
- Assumptions to verify: a note's `size` is paper inches (confirmed in Quick Detail `noteLayout`: height = size × factor); solid hatch keys are `solid` and `steel` (confirmed in `hatch.js`); the y-axis is flipped on export so the drawing reads upright in CAD (a design decision, to confirm in AutoCAD).

## Goal

Generate 2-D drawing assets from the architecture library (Quick Detail details, Make-3D models) and export them for AutoCAD (DXF blocks, `.LIN` line types, `.PAT` hatch patterns) and Revit (3-D DXF mesh for a family import). Each output gets a linter score and a DXF viewer check.

## Current state (verified vs. unverified)

- **Verified (read in the repos):** the item shapes in `sketch_details` (stroke, hatch, note, dim, block, image), the units (real inches), the tag `make3d` read by Make-3D, and Make-3D's IFC exporter. Sources: `03 Projects/Drafting/research/02 library and 3d sources.md`.
- **Verified (search, Autodesk help pages):** DXF blocks (BLOCK, ENDBLK, INSERT), `.LIN` and `.PAT` syntax, Revit family DWG import, Revit fill pattern import. Sources in `research/01 cad formats.md`.
- **Partly confirmed:** DXF `LTYPE` table, Revit `;%UNITS=` and `;%TYPE=MODEL` comments, R12 suitability. Quick Detail's v1 exporter already writes an R12 DXF with an `LTYPE` table (`Quick-Detail/history/v1/js/export.js`), written by hand and not opened in AutoCAD here.
- **Unverified:** whether the Revit family editor takes DXF (only DWG was seen), whether `.LIN` loads in Revit (not found), custom hatch group codes in DXF `HATCH`, linetype text syntax, the 2026 Revit fill pattern page.
- **Not checked:** the actual rows in `sketch_details` (no sign-in in this session).

## Decisions taken (provisional, see convo v0.1 for the choices)

- R12 (AC1009) DXF first, in real inches with `$INSUNITS`.
- DXF out, DWG by AutoCAD's save. No DWG writer.
- Read-only library, owner sign-in, `platform_is_owner()`.
- Linter is a legibility score with the checks in view. Not a design review.
- Embedded reader: own small parser (proposal; Q11).

## Next steps

1. Jimmy opens a test DXF in AutoCAD (and a Revit family import if he can) and reports what opened and what did not. That is the gate for increment 2.
2. Increment 2: blocks (`BLOCK` + `INSERT`), line types (`.LIN` text + `LTYPE`), hatch patterns (`.PAT` text + `HATCH`), `dim` lines and text. A test set in `tests/` (synthetic, no real drawings).
3. Research still open: the Revit family DXF question (does the family editor take DXF), whether Revit loads a `.LIN` file, the 2026 Revit fill-pattern page, DXF `HATCH` pattern group codes, the linetype text syntax.
4. Parameters for the Revit family export come later (Jimmy: "keep the parser light, expand as needed").
