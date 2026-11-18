# Drafting — schematic

Status: **MVP 0.1** (increment 1, 2026-11-18): R2013 and R12 DXF writer, DXF reader, linter, one page. Node tests pass (12), ezdxf audit clean (0 errors), headless page check clean. Not device-tested and not opened in AutoCAD or Revit yet. Answers from Jimmy: `convo/convo v0.2.md`. Questions from v0.1 are answered there.
Track: **B. Studio design** (dense, orderly panels, paper and ink palette). Architecture database, owner only. Private drawings in `private/`, never committed.

---

## 1. What it is

An **asset generator** for drawings. It takes a detail (or a 3-D model) from the library, interprets it as a clean 2-D drawing, and exports it in the formats AutoCAD and Revit read:

| Output | Format | Why |
|---|---|---|
| Block | DXF `BLOCK` + `INSERT` (DWG later) | Reuse one detail in many drawings |
| Line type | `.LIN` file and the DXF `LTYPE` table | A dash-dot line the whole office uses |
| Hatch pattern | `.PAT` file and DXF `HATCH` | A material fill (brick, wood, insulation) |
| 3-D asset | DXF mesh, for a Revit family import | Geometry for Revit (not parametric; see §5) |

Two checks come with every output:

- **Linter.** Scans the file before it leaves the page and gives a **legibility confidence** (0 to 100%), with the reasons. Read in plain words: "this file reads cleanly at 3"=1'-0" in AutoCAD" or "two hatch lines are finer than the paper can show."
- **DXF viewer.** An embedded reader that opens the exported file, draws it in 2-D, and rotates a 3-D file (drag, and two-finger pinch on iPad).

The name "litter" in the request is read as **linter**. Confirm in `convo/convo v0.1.md`.

---

## 2. Pipeline

```
Find ──► Interpret ──► Export ──► Lint ──► View
(library)  (2-D model)  (target)  (score)  (DXF reader, rotate)
```

1. **Find.** Search the library by **name** or **tag** (read only). Two sources:
   - Quick Detail details in `sketch_details`, the Architecture project. Name search and any tag.
   - Make-3D models: the tag `make3d` (the same table; Make-3D reads it the same way).
2. **Interpret.** Build one **primitive list** in real inches from the detail's items:
   `stroke` → polyline, `hatch` → closed boundary plus pattern, `note` → text, `dim` → dimension or lines, `block` → insert, `image` → left out and reported.
   One list feeds every output, so the exports match each other (nursery lesson, `04 AI/lessons_pool.md`).
3. **Export.** Pick a target: block, line type, hatch pattern, or 3-D. Output is a file to download. Real-detail exports stay on the device or in `private/`.
4. **Lint.** Check the file (§4). Show the score and the fix hint for each failed check (the "check before build with fix hints" method from Make-3D x Construct).
5. **View.** Open the exported file in the embedded reader, the same way AutoCAD would read it.

---

## 3. Format rules (from research 01)

- **Units.** Real inches. The scale (3"=1'-0", factor 4) only sets the paper size of notes and ticks; do not multiply by it on export. Set `$INSUNITS` to inches.
- **DXF version.** Default **AC1027 (AutoCAD 2013)**, with **R12 (AC1009)** as an alternate setting (convo v0.2, Q5). R12 has no hatch fill in our writer, and the linter says so.
- **Line types and hatch patterns are plain text** (convo v0.2, Q4): `.LIN` and `.PAT` are text files, so they are written as text, not binary. The focus is on formats that open everywhere.
- **Blocks.** Unique names, no self-insert, no empty block. Name = the detail's library id or a slug.
- **Line types.** Dashes positive, gaps negative, dots zero. The `LTYPE` table carries them in the DXF; a `.LIN` file is also written for AutoCAD users.
- **Hatch patterns.** `.PAT` text: header `*NAME, description`, one line per family `angle, x0, y0, dx, dy, dashes...`, a blank line at the end. Revit uses the same format with `;%UNITS=` and `;%TYPE=MODEL` comments (not yet checked against the 2026 help page).
- **3-D.** Mesh faces in real inches, Z up (Revit's up is Z).
- **DWG.** Not written by the page. DXF is saved as DWG inside AutoCAD, or by a converter later (research 01 §1; a DWG writer needs the commercial ODA SDK).

---

## 4. Linter: legibility confidence

Two results (convo v0.2, Q9):

1. **Validity** (blocking): pass or fail per check. A failure says why, and the file cannot be downloaded.
2. **Confidence** (0 to 100%): a score, not a judgement of the design. Each check is **pass**, **warn** or **fail**, with a weight. The score is the weighted share of passes (warn counts as half). Every fail shows a fix hint. **Below 80%, the viewer opens** and shows how the file renders.

Both run on the file as read back, not on the source.

| Check | What it looks for | Initial rule (to tune with Jimmy) |
|---|---|---|
| Parses | Every group code pairs; sections close; file ends with EOF | Any failure is a hard fail (score 0) |
| Units | `$INSUNITS` set; extents between 1 in and 10 000 in | Missing units: warn |
| Clean lines | Zero-length or near-duplicate lines | Under 1/64 in: warn |
| Dash legibility | Dash or gap shorter than the paper can show | Under 1/16 paper inch, converted at the detail's scale (at 3"=1'-0", 1/16 paper inch = 1/4 real inch): warn |
| Hatch spacing | Hatch lines closer than the paper can show | Under 1/32 paper inch: warn |
| Hatch closed | Every hatch boundary closed | Open boundary: fail |
| Text size | Text height at the chosen scale | Under 1/8 paper inch: warn |
| Blocks | Unique names, no self-insert, not empty | Duplicate or self-insert: fail |
| Layers | Every entity on a named layer | Layer 0 only: warn |
| Dropped items | Images, recordings and anything not exported | Listed, not scored |
| 3-D (later) | Closed meshes, consistent face normals, face count under a limit | Open mesh: warn; NaN: fail |

Note on the paper rules: the thresholds are in paper inches, so the linter converts them to real inches with the detail's scale factor (3"=1'-0" is 4 real inches per paper inch; 6"=1'-0" is 2; 1 1/2"=1'-0" is 8). It must not use a fixed number. The thresholds are starting values for Jimmy to tune.

Out of scope for v1: judging whether the drawing is correct.

---

## 5. Revit: what a DXF can and cannot do

- **Revit's native route is IFC.** Make-3D already exports IFC (`js/core/export_ifc.js`). It places elements in a project; it does not make an editable family.
- **DXF gives imported geometry.** A family import of DXF or DWG is not parametric. Each import adds weight, and each placed instance repeats it (research 01 §4c). Revit's own tip is to trace over imports with native lines and regions.
- **A true parametric family** (types, parameters, a family template) is a separate job, in Revit's `.rfa` format. Not in this project's first scope.

Question for Jimmy: is imported geometry enough for the first Revit use, or is a parametric family the goal? (`convo/convo v0.1.md`, question 6.)

---

## 6. Data and access

- **Read-only** from the Architecture project's `sketch_details` (name, tags, items, scale, parent). Needs an owner sign-in on the page. Use `public.platform_is_owner()` in any policy, not an email.
- **No writes** to the library in v1. Exports are files, not rows. A later export log (`drafting_exports`, owner only) can come after Jimmy asks.
- **Exports are downloads only** (convo v0.2, Q14). Export files stay on the device and are never saved to the repo or a database. Real drawings can be public in principle, but they are still not stored by the page. Synthetic samples are the only files in the repo.
- **Supabase work** is not started. When it is, follow `02 Refs/Skills/supabase_link.md` (manual paste route) and `04 AI/Supabase/brief.md`.

---

## 7. Increments

| # | Scope | Done when |
|---|---|---|
| 0 | Research and schematic (this round) | Research 01 and 02, schematic, convo v0.1 |
| 1 | DXF writer (AC1027 default, AC1009 alternate) for strokes, hatch, notes; DXF reader; linter (validity and confidence); one page | **Done (MVP 0.1).** Synthetic samples export; the reader reads them back; the linter scores; 12 Node tests and the ezdxf audit pass; page check clean |
| 2 | Blocks (`BLOCK` + `INSERT`), line types (`.LIN` + `LTYPE`), hatch patterns (`.PAT` + `HATCH`); linter for dashes, hatch spacing, blocks | Round trip: write, read back, same primitives. Test files open in AutoCAD on Jimmy's machine |
| 3 | Library search: name and tag, owner sign-in, read only; map `sketch_details` items to the primitive list | A real detail (kept in `private/`) interprets and exports on Jimmy's device |
| 4 | 3-D: Make-3D model to DXF mesh; 3-D linter checks; viewer rotates and pinches | A Make-3D model imports into Revit as a family geometry test, Jimmy reports the result |
| 5 | Field tests in AutoCAD and Revit; DWG route decided | Results written in `04 AI/Drafting/brief.md` |

Each increment ends with a test, a short note in `04 AI/Drafting/brief.md`, and a review by Jimmy before the next.

---

## 8. Page layout (Track B)

Paper and ink. Panels with a header, icon, name and ▸/▾, collapsible; open on a large screen.

- **Find** (library search, name and tag, sign-in status)
- **Drawing** (the 2-D interpretation, scale, units)
- **Export** (target: block, line type, hatch, 3-D; file name; download)
- **Legibility** (score, checks, fix hints)
- **Viewer** (the DXF reader; rotate for 3-D)

No gear panel needed for v1 (not a kids' app). Revisit if Jimmy asks for options.

---

## 9. Open decisions

Listed in `convo/convo v0.1.md`:
1. "Rabbit" = Revit and "cat" = AutoCAD? Which program first?
2. Which project does Drafting sit in (nursery, or inside Quick Detail or Make-3D)?
3. DWG: DXF then save in AutoCAD, or a DWG writer (ODA SDK, commercial)?
4. DXF version: R12 first, or a newer one?
5. Which library tags to search besides `make3d`?
6. Revit: imported geometry enough, or parametric family?
7. Linter: confirm the checks and thresholds.
8. Embedded reader: write a small parser (no library, matches the zero-build rule) or use a vendored library?
9. Test oracle: is ezdxf (Python, dev only) acceptable for checking our files?
