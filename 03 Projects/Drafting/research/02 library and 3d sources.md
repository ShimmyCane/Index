# Research 02: the library we read from, and the 3-D source

Status: first pass, 2026-11-18. Read from the sibling repos (`Quick-Detail`, `Make-3D`) and their docs. Nothing was changed in them. Database contents were not read (no sign-in here), so row counts and tags are unknown.

---

## 1. Detail library (Quick Detail)

**Where it lives.** Quick Detail saves each drawing as one row in `public.sketch_details` in the **Architecture** Supabase project. The repo's schema file is `docs/supabase-sketch.sql` (applied as migration `sketch_tables_and_table_index`). The owner-only rule in that file compares the signed-in email. The nursery now prefers `public.platform_is_owner()` (see `04 AI/Supabase/brief.md`), so the Drafting page should use that rule for any new policy.

**Columns that matter for Drafting** (from the schema file and `sketch/cloud.js`):

| Column | Use |
|---|---|
| `id` (uuid), `local_id` (text) | Stable id. Use `id` for reads, `local_id` only to match a device copy. |
| `name` | Search by name. |
| `tags` (text[]) | Search by tag. Make-3D reads the tag `make3d` (any letter case). |
| `scale` (text) | Default `3"=1'-0"`. |
| `items` (jsonb) | The sheet itself: the drawing to interpret. |
| `metadata` (jsonb) | Summary written by the app. Not read yet. |
| `parent_id` | A detail can have a parent. Keep it in the tree view. |
| `updated_at` | To show the latest version first. |

Read-only from Drafting. Writes stay in Quick Detail.

**Item kinds in `items`** (from `sketch/core.js`, `sketch/hatch.js`, `sketch/blocks.js`, `sketch/units.js`):

| `kind` | Shape (short) | DXF mapping (proposed) |
|---|---|---|
| `stroke` | `{ id, t0, w, pts: [[x, y, pressure, dt], ...] }`, world inches | `LWPOLYLINE` (drop pressure and dt). Line weight from `w`. |
| `hatch` | `{ pattern, pts: [[x, y], ...] closed, outline }`, world inches | `HATCH` with the pattern name, or a `PAT` pattern (see research 01 §3). |
| `note` | text plus position (check the exact keys in `sketch/annot.js` before mapping) | `TEXT` or `MTEXT`. |
| `dim` | a dimension with two points and an offset (check `sketch/annot.js`) | `DIMENSION` or plain lines and text (open). |
| `block` | `{ id, kind: 'block', sourceId, at: [x, y], k, opacity, print }` | `INSERT` of a `BLOCK` made from the source detail. Maps well. |
| `image` | a background picture | Left out of DXF. Note it in the lint report. |

**Units.** Quick Detail draws in **real inches**. The scale (for example `3"=1'-0"`, factor 4) only sets how big notes and ticks show on paper. So DXF should be written in inches, with the header variable `$INSUNITS` set to inches (open: confirm the code value in the DXF reference). Do not multiply by the scale factor on export.

**Recording.** A detail can also have recordings and snapshots (`sketch_recordings`, `sketch_snapshots`, private bucket `sketch-media`). Drafting does not need them. Leave them out.

**Privacy.** Real project drawings can be in this table. Exports made from a real detail stay out of the repo. Put them in a `private/` folder inside the project, or save them on the device. `.gitignore` already excludes `**/private/`. Synthetic samples can be committed.

---

## 2. 3-D library (Make-3D)

- Make-3D reads Quick Detail's `sketch_details` where a tag is `make3d` (read only). That is the "search by tag" path the request mentions. Name search is the same table, with `name`.
- Make-3D keeps its own saved scenes (`m3d_scenes`, owner only) and a log of every scene version (`m3d_scene_log`), both in the Architecture project. The log is the record of history; `model.json` is build output.
- A Make-3D model is a replayed list of objects with stable ids, in inches (Make-3D `CLAUDE.md`: "Units are inches").
- **Existing export:** IFC4 (`js/core/export_ifc.js`, convo v0.6). It writes real scale and keeps "up is Z". It is the Revit-native route today. Make-3D's schematic says it imports into Revit as placeable elements, not as editable families.
- No DXF export in Make-3D yet. Make-3D's convo v0.4 (question E2) already asks Jimmy the same thing: Revit does not import a plain 3-D mesh as a family, so the route is a DWG or DXF import, or FBX or OBJ to model over. His answer is open.

**Implication for the request** ("generate a 3-D export ... in DXF to use as a family inside Revit"): Drafting would add a **DXF mesh writer** next to the IFC writer. The mesh route gives geometry, not a parametric family. Compare the two in `convo/convo v0.1.md`, question 6.

---

## 3. Shared with the nursery rules

- Track B. Studio design. Paper and ink palette (Quick Detail look). See `02 Refs/Skills/project_track.md`.
- Architecture project data is owner only. Do not add a public read path.
- Architecture sign-ups are open (see `04 AI/Supabase/brief.md`, Generate Clouds update, 2026-11-18). A rule of "any signed-in user" would let anyone with the publishable key read the library after creating an account. Use owner only.
## 4. Code to borrow, not rebuild

- **Quick Detail v1 DXF exporter** (`Quick-Detail/history/v1/js/export.js`, `X.dxf`): R12 (AC1009) text DXF, full size, with `$INSUNITS` from the sheet's units, a `LTYPE` table built from the app's dash arrays (group 49 with alternating signs), a `LAYER` table with pen colours, and `ENTITIES` written from one primitive list. It is the same job as Drafting's 2-D writer. Not tested in AutoCAD here. Copy the pattern, then test it.
- Nursery lessons pool, Quick Detail entries (`04 AI/lessons_pool.md`, lines 79 and 134): one primitive list in real units feeds every output; hand-written R12 DXF is viable offline; validate outputs with an external reader.
- Quick Detail's own backlog (`Quick-Detail/docs/details-todo.md`, site plans): "Export site plans to DXF or DWG with layers ... Manual for now." Same need, so one shared writer could serve both.
- R12 is a good first target: it is the oldest DXF version most tools still read, it has `BLOCK`, `INSERT`, `LTYPE` and `HATCH`, and the old exporter already uses it. The newer versions (R2000 and later) can come after a test.
