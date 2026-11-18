# Research 01: CAD formats for AutoCAD and Revit

Status: first pass, 2026-11-18. Each claim is marked:
- **Confirmed**: seen in an Autodesk help page or a spec in the search results below.
- **Partly confirmed**: seen in one source or a third-party page. Check before building on it.
- **Open**: not found. Needs a test file in AutoCAD or Revit, or Jimmy's own check.

Reading of the request: "cat" is AutoCAD (CAD) and "rabbit" is Revit. Please correct me in `convo/convo v0.1.md` if that is wrong.

---

## 1. Blocks (block definitions and their inserts)

| Format | What it is | Open? |
|---|---|---|
| DWG | Autodesk's native drawing file. Holds blocks, linetypes, hatches, layers. | Proprietary. Autodesk does not document it; the Open Design Alliance (ODA) published a reverse-engineered spec (DWG 13 to 2013). |
| DXF | Autodesk's exchange format. Text (ASCII) or binary. Holds the same kinds of things. | Documented by Autodesk. Good target for us. |

**How a block sits in a DXF file (Confirmed, Autodesk DXF reference and ezdxf docs):**
- A `BLOCKS` section holds every block definition. Each one runs from a `BLOCK` entity to an `ENDBLK` entity. Blocks do not nest (a block may hold an `INSERT`, but not another `BLOCK`).
- Block names are unique and not case sensitive. Two definitions with one name merge in AutoCAD, with unpredictable results.
- An `INSERT` entity in `ENTITIES` names the block and gives its insertion point, scale and rotation.
- Avoid a block that inserts itself. AutoCAD can fail to load it.
- Since R13, a block is also a layout, and `ENDBLK` needs the same layer as `BLOCK`. (Partly confirmed: from the ezdxf internals page; check against the Autodesk page.)

**What it means for Drafting:** a detail becomes one `BLOCK` with its linework inside, plus an `INSERT` to place it. The block name should be the detail's library id or a slug, so it can be found again.

**Sources:**
- [Autodesk: About BLOCKS section group codes (DXF, 2020)](https://help.autodesk.com/cloudhelp/2020/ENU/AutoCAD-DXF/files/GUID-9DDFC343-6C87-4AF8-B3B9-77E0AB5A3031.htm)
- [ezdxf: BLOCKS section](https://ezdxf.readthedocs.io/en/stable/dxfinternals/sections/blocks_section.html)
- [ezdxf: block management structures](https://ezdxf.readthedocs.io/en/stable/dxfinternals/block_management.html)
- [ODA specification for .dwg files (PDF)](https://opendesign.com/files/guestdownloads/OpenDesign_Specification_for_.dwg_files.pdf)

**Writing DWG (Open):** Autodesk's own tools write DWG. For us, the open routes are: write DXF and let AutoCAD save it as DWG (Confirmed, it is how DXF is meant to be used), or use a converter built on the ODA SDK. The ODA SDK is commercial, so a DWG writer is a later decision (see `convo/convo v0.1.md`).

---

## 2. Line types (`.LIN`)

**Confirmed (Autodesk custom linetype help, 2015 to 2025):**
- A `.lin` file is plain ASCII text. Lines starting with `;` are comments.
- Each linetype is two lines: a name line `*NAME, description`, then a pattern line that starts with an alignment code, `A`.
- Dash values are numbers: positive is a dash (pen down), negative is a gap (pen up). A zero is a dot.
- Shapes go inside brackets: `[shape_name, shape_file, scale, rotation, x offset, y offset]`. The shape file is required.

**Example (the simple case):**
```
*DASHDOT, Dash dot ____ . ____ .
A,0.5,-0.25,0,-0.25
```

**Partly confirmed:**
- Complex linetypes can carry text as well as shapes. The text syntax was not found in search. Open.

**Inside a DXF (Partly confirmed):** a DXF file has its own `LTYPE` table, so a linetype can travel inside the DXF without a `.LIN` file. Quick Detail's v1 exporter already writes this way (`Quick-Detail/history/v1/js/export.js`, `X.dxf`: group 49 with alternating signs for dash and gap, group 40 for total length). Written by hand, not yet opened in AutoCAD here.

**Sources:**
- [Autodesk: About linetype definitions (2015)](https://help.autodesk.com/cloudhelp/2015/ENU/AutoCAD-LT/files/GUID-5A6E6759-8A9A-4A8A-9AEE-EE9DB72F792D.htm)
- [Autodesk: About simple custom linetypes (2018)](https://help.autodesk.com/cloudhelp/2018/ENU/AutoCAD-LT/files/GUID-EF1DF0A9-2088-487C-8085-16FEE6425405.htm)
- [Autodesk: About shapes in custom linetypes (2025)](https://help.autodesk.com/cloudhelp/2025/ENU/AutoCAD-Customization/files/GUID-AF0613E6-5C8B-47F0-800C-8B2524BF2015.htm)

---

## 3. Hatch patterns (`.PAT`)

**Confirmed (Autodesk help on hatch pattern definitions, 2015 to 2025, and a tutorial that quotes it):**
- Plain ASCII. One file can hold many patterns.
- Header line: `*NAME, description`. Then one line per line family:
  `angle, x-origin, y-origin, delta-x, delta-y, dash-1, dash-2, ...`
- `delta-y` is the spacing between lines, measured across them.
- `delta-x` only matters for dashed lines. It slides the dash sequence along the line. It is how a brick bond is staggered.
- No dash values means a continuous line.
- A blank line must follow the last pattern in the file, or the last pattern is not read.
- The file name and the pattern name should match. Put the file on AutoCAD's support file search path, then use HATCH.

**Example (diagonal dashed lines):**
```
*DIAG-DASH, Diagonal dashed lines
45, 0, 0, 0.25, 0, 0.125, -0.125
135, 0, 0, 0.25, 0, 0.125, -0.125

```

**Partly confirmed:** in a DXF file a hatch can carry its own pattern definition (group codes for angle, origin, offsets and dash lengths), so a custom pattern could ship inside the DXF. Open: confirm group codes in the DXF reference.

**Sources:**
- [Autodesk: About custom hatch patterns and hatch pattern definitions (2018)](https://help.autodesk.com/cloudhelp/2018/ENU/AutoCAD-LT/files/GUID-A6F2E6FF-1717-44B6-A476-0CA817ADD77E.htm)
- [Autodesk: To create a hatch pattern with dashed lines (2018)](https://help.autodesk.com/cloudhelp/2018/ENU/AutoCAD-LT/files/GUID-67150A48-FF70-4CC7-8C6E-21DEF6838C82.htm)
- [Draftsperson blog: creating custom hatch patterns in AutoCAD and using them in Revit](https://blog.draftsperson.net/unlock-your-design-potential-creating-custom-hatch-patterns-in-autocad-and-using-them-in-revit/) (third party; use for the example only)

---

## 4. Revit

### 4a. Fill patterns (`.PAT` again)

**Confirmed (Autodesk Revit help, "About the file format for fill patterns", 2018, and Create a Custom Fill Pattern, 2026):**
- Revit uses the same `.pat` text format as AutoCAD, with two kinds: **drafting** patterns (in paper units, for cut material) and **model** patterns (in model units, for surfaces such as bricks or tiles).
- Revit-only settings sit in comment lines: `;%UNITS=` and `;%TYPE=MODEL`. (Partly confirmed: found on the 2018 page and a Revit support post. Check the 2026 page before we write one.)
- Import: Manage, Additional Settings, Fill Patterns, choose Drafting or Model, New, Custom, Import. A bad line stops the import and Revit names the line.
- Once imported, the pattern lives in the project. It does not depend on the file.

**Sources:**
- [Autodesk: About the file format for fill patterns (2018)](https://help.autodesk.com/cloudhelp/2018/ENU/Revit-Customize/files/GUID-DFDF09AD-443B-4EBC-B47E-12114C9F62CE.htm)
- [Autodesk: Create a custom fill pattern (2026)](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-Customize/files/GUID-1786A20D-1CF8-47FA-9D8F-6089CB8682A3.htm)
- [Arkance: Revit importing custom hatch fill pattern styles](https://emea.support.arkance.world/hc/nl/articles/36465211070866-Revit-Importing-Custom-hatch-fill-Pattern-Styles) (third party)

### 4b. Line styles (linetypes)

**Open.** The search did not show a `.LIN` import path into Revit. From memory (not confirmed by a source here), Revit defines line patterns by hand in its Line Patterns dialog. Treat `.LIN` as AutoCAD-only until a test file proves otherwise.

### 4c. Importing geometry into a family

**Confirmed (Autodesk Revit help on importing CAD, 2014 to 2023, and community posts):**
- A family can **import** DWG. It cannot **link** CAD (linking is for projects only).
- Imported CAD is not parametric. Each imported object adds weight to the model, and every placed instance of the family repeats it. Community guidance: trace over the import with detail lines and filled regions instead.
- Lines can vanish at some view scales, and some only show at Fine detail.
- Units and a scale factor can be set on import.

**Open:**
- Whether the family editor accepts **DXF** as well as DWG. Found only DWG. Test with a file.
- Whether 3-D DXF meshes become usable family geometry, and how they look after import. Test with a file.
- How DWG layers and linetypes map to Revit line styles. Not found.

**Sources:**
- [Autodesk: Importing or linking CAD formats (2014)](https://help.autodesk.com/cloudhelp/2014/ENU/Revit/files/GUID-E8705303-0610-4A82-9118-0C3A742706D2.htm)
- [Autodesk: Create a model family with masking regions from 2D DWG files (2023)](https://help.autodesk.com/cloudhelp/2023/ENU/Revit-DocumentPresent/files/GUID-4EEBB939-6024-4BE9-86E4-7378FFA71F12.htm)
- [Jeremy Tammik: DWG and DWF family creation](https://jeremytammik.github.io/tbc/a/0167_dwf_dwg_family_files.htm) (blog)
- [Autodesk forum: convert lines from DWG to Revit families](https://forum.evolvelab.io/t/convert-lines-from-dwg-to-revit-families/7586) (community)

---

## 5. What this means for the 3-D path (Make-3D to Revit)

- **Revit's native route is IFC.** Make-3D already exports IFC (`js/core/export_ifc.js`, convo v0.6). It imports into Revit as placeable elements, not as editable families (Make-3D `schematic.md`, the exports note). That is a working route today, but not yet tested in Revit by us.
- **DXF is the AutoCAD route and a second Revit route.** A DXF of solids or meshes can go to AutoCAD, and to Revit through a family import. It is not parametric. This is the honest limit to show Jimmy before we build.
- **An editable, parametric Revit family** (types, parameters, a family template) is a separate job. It needs Revit's own family format (`.rfa`), which we cannot write from the browser. Not in this project's first scope.

---

## 6. Test oracle (for our own checks, not for shipping)

- **ezdxf** (Python package) can read and audit DXF files. Use it as a dev-only check on what we write, and never ship it in the page. Licence to confirm before use. [ezdxf docs](https://ezdxf.readthedocs.io/)
- **ODA File Converter** (free app from the Open Design Alliance) can convert DXF to DWG and back, to test that a DXF opens. Licence terms to read before use.
- Real checks still need AutoCAD and Revit on Jimmy's computer. Those are not available in this container.

---

## Open list (answers needed)

1. Which DXF group codes for `HATCH` custom patterns? (DXF reference, 2020 or later.)
2. Does Revit's family editor accept DXF? (Test with a small file.)
3. Does Revit import a `.LIN` file or any line style file? (Test.)
4. The Revit fill pattern format in the 2026 help page. Compare it with the 2018 page.
5. The text syntax for linetypes with text.
