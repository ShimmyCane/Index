# Drafting — AI brief

**Updated:** 2026-11-18
**Status:** idea. Research and schematic done; no code; waiting on `03 Projects/Drafting/convo/convo v0.1.md`.
**Track:** B. Studio design.

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

1. Jimmy answers `convo/convo v0.1.md` (R1 to R14, Q15 gates the build).
2. Increment 1 on approval: R12 writer, DXF reader, linter v0, Node tests with synthetic details.
3. Test file set in `03 Projects/Drafting/tests/` for AutoCAD and Revit checks (increment 2).
4. Research still open: the Revit family DXF question, the 2026 Revit fill-pattern page, DXF `HATCH` group codes.
