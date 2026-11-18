# Drafting — convo v0.2 (2026-11-18)

Answers to `convo v0.1.md`, given inline by Jimmy. v0.1 is kept as written. Increment 1 starts from these answers.

## Answers

| # | Question | Answer | What it changes |
|---|---|---|---|
| R1 | "cat" = AutoCAD, "rabbit" = Revit, "litter" = linter | Yes | None |
| Q2 | Own nursery project | Yes | Stays at `03 Projects/Drafting/` |
| Q3 | AutoCAD first, Revit in increment 4 | Yes | Order unchanged |
| Q4 | DXF then save as DWG; no DWG writer; focus on universal formats. Line types and hatch patterns are plain text, so treat them as text files | Yes | `.LIN` and `.PAT` are written as plain text, not as binary. The priority is formats that open everywhere |
| Q5 | Newer DXF version by default; R12 kept as an option | Newer by default | Writer targets a newer version (see Choices); R12 stays selectable |
| Q6 | Revit: imported geometry first, parametric later | Both. The big three already have simple 3-D export, so the parametric version is worth more work | Revit path: imported geometry first, parametric family after. Parameters are a later step, so the viewer leaves room for them |
| Q7 | Library tag: `export`. Add one or two synthetic examples | Tag `export`; generate one or two synthetic examples | Synthetic samples in `samples/`, tagged `export`. Name search across all details, plus any tag |
| Q8 | Items to include | Same as Q7 (lines, hatch, text, dimensions, blocks); images left out | Unchanged from v0.1 |
| Q9 | Score form | Two checks. (1) Validity: a pass or fail, with the reason if it fails. (2) Confidence of accuracy: if below 80%, open the viewer and show how the hatch, line type, or 3-D family renders | Linter has two results, not one number (see Choices) |
| Q10 | Starting thresholds | Yes | `schematic.md` §4 used as written |
| Q11 | Reader | Own small parser; borrow freely. Keep it light; expand later for family parameters | Parser in `js/`, no library |
| Q12 | ezdxf as test-only | Yes | Dev test only, never in the page |
| Q13 | Test files opened in AutoCAD and Revit | Yes | Test set in `tests/` from increment 2 |
| Q14 | Privacy of exports | Real-detail exports can be public in principle. But export files stay on the device for download, never saved to the repo | `schematic.md` §6 and `CLAUDE.md` updated: exports are downloads, not repo files |
| Q15 | Start increment 1 | Yes | Increment 1 starts now |

## Choices made in increment 1 (without asking)

1. **Default DXF version: AC1027 (AutoCAD 2013).** It is the newest version that reads everywhere and keeps the entities we need (`LWPOLYLINE`, `HATCH`). R12 (AC1009) is an alternate in the export settings. The R12 writer uses `POLYLINE`/`VERTEX` because R12 has no `LWPOLYLINE`.
2. **Linter gives two results.** Validity (blocking, pass or fail, with the reason) and confidence (0 to 100%). Below 80% the viewer opens to show how the output renders, as Jimmy asked.
3. **Increment 1 scope:** primitives from `stroke`, `hatch` and `note`. `dim`, `block` and `image` are reported as not yet exported, and their handling goes to increment 2 (`dim`, `block`) or stays out (`image`).
4. **Hatch in R12:** R12 writes the boundary as a closed polyline and no fill. The linter warns about that, so the difference is visible.
5. **Samples:** two synthetic details, tagged `export`, in `samples/`. They are invented, not from the library.

## Open after increment 1

- AutoCAD and Revit do not open test files yet. That is increment 2, on Jimmy's computer.
- Parametric Revit family: a later project step, after imported geometry works.
