# Drafting — convo v0.1 (2026-11-18)

Jimmy's request: a sub-project that reads details from the architecture library and generates 2-D drawings, exports them to AutoCAD (blocks, line types, hatch patterns), exports 3-D models from Make-3D as DXF for a Revit family, and checks each output with a linter and a DXF viewer.

Round 1 is research and a schematic only. Nothing is built yet. Answer inline under each question. Anything left blank keeps the recommended choice.

## Choices made without asking

1. **Track B, studio design.** Paper and ink. Dense panels, all collapsible.
2. **Placed at `03 Projects/Drafting/`** in the nursery, for now. Question 2 can change this.
3. **Research first.** Format research is in `research/01 cad formats.md` and `research/02 library and 3d sources.md`. Each claim is marked confirmed, partly confirmed or open.
4. **Output in real inches.** The scale only sets paper size. `$INSUNITS` is inches.
5. **First DXF target is R12 (AC1009).** The old Quick Detail exporter uses it (`Quick-Detail/history/v1/js/export.js`).
6. **DWG is not written by the page.** DXF is the output. DWG comes from AutoCAD's save, or a converter later.
7. **Library is read only**, owner sign-in, `platform_is_owner()` rule. No writes in v1.
8. **Nothing read from the Architecture database yet.** No sign-in here, so the rows and tags are unknown.
9. **No tile on the home page.** There is no page to open yet. The tile comes with the first build.
10. **Nothing from the sibling repos was changed.** Quick Detail and Make-3D were read only.

## Reading check

"cat" is read as **AutoCAD** and "rabbit" as **Revit**. "Litter" is read as **linter**. Confirm or correct:

**R1.** Is that right? (Recommended: yes.)

## Where it lives

**Q2.** Should Drafting be its own nursery project (`03 Projects/Drafting/`, graduates to its own repo later, as Make-3D did), or a sub-project inside Quick Detail or Make-3D?

Recommended: its own nursery project. Your message said "sub project inside the…", and the part after "inside the" came through unclear.

## What it targets first

**Q3.** AutoCAD or Revit first?

Recommended: **AutoCAD first.** Blocks, line types and hatch patterns are AutoCAD concepts, and Revit reads the same DXF and `.pat` files for imports and fills. Revit comes in increment 4.

**Q4.** DWG: write DXF and save it as DWG inside AutoCAD (no licence), or add a DWG writer later using the Open Design Alliance SDK (commercial)?

Recommended: **DXF now, DWG by AutoCAD's save.** A DWG writer can wait until a real need is clear.

**Q5.** DXF version: R12 first (oldest format most tools read, already written once in the repo), or a newer version (better hatch and text, larger files)?

Recommended: **R12 first**, then test a newer one in increment 5.

## The 3-D path

**Q6.** For Revit, is **imported geometry** enough for the first use (a DXF mesh brought into a family as a CAD import, not editable), or do you want a **parametric family** (types, parameters, a family template)?

Recommended: **imported geometry first**, because it can be tested in a day. A parametric family is a separate project. Note: Make-3D already exports **IFC**, which Revit imports as placeable elements. Make-3D convo v0.4 (E2) asks the same question; answer both there if that is simpler.

## The library

**Q7.** Besides the tag `make3d`, which tags should the library search use? Should name search match everything, or only details with a tag?

Recommended: name search across all details, plus any tag you type. Tags are filters, not required.

**Q8.** Which Quick Detail items should go into a drawing? Current plan: lines, hatch, text, dimensions and blocks. Images (the background picture) are left out and listed in the lint report.

Recommended: as in the plan. Say if an item should be kept or dropped.

## The linter (the "legibility confidence")

**Q9.** Is a percentage score the right form? Or only pass, warn and fail per check, with the fix hint, and no single number?

Recommended: **both**: a score for a quick look, and the list of checks under it for the detail. The score is not a judgement of the design, only whether the file reads cleanly in the software.

**Q10.** Are the starting thresholds in `schematic.md` §4 close enough to start with? You can tune them after the first test.

Recommended: start with them, and change them when a real drawing shows a problem.

## The viewer

**Q11.** For the embedded DXF reader: write a small parser myself (no library, matches the zero-build rule), or use a vendored library (dxf-parser and three.js, saved in the project)?

Recommended: **a small parser of our own**, since the DXF subset we write is small and the linter needs the same parser. The 3-D view uses three.js, saved in the project, not from a CDN.

## Testing

**Q12.** Can we use **ezdxf** (a Python package, MIT licence, checks and reads DXF) as a test-only tool, never shipped in the page? It checks what we write, and it does not need AutoCAD.

Recommended: **yes, test-only.**

**Q13.** Real checks need AutoCAD and Revit. Can you open a test file on your computer for each increment? If yes, I will prepare a small test set in `03 Projects/Drafting/tests/` (synthetic, no real drawings), and you tell me what opened and what did not.

Recommended: yes, from increment 2.

## Privacy

**Q14.** Exports from real details (your practice drawings) should stay on your device or in a `private/` folder, never in the repo. Is that right?

Recommended: **yes.** A later export log in the Architecture database (owner only) can come after you ask for it.

## Next step

**Q15.** Once the answers are in (or the recommendations are fine), should I start **increment 1**: the R12 DXF writer, the DXF reader and linter v0, with synthetic tests?

Recommended: **yes**, after your answers. Nothing is built before then.
