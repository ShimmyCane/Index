# QC keynotes — schematic

Status: first build = start page and guideline builder (v0.1.0). Steps 2–4 are placeholders. Questions answered in `convo/convo v0.1.md`; next questions in `convo/convo v0.2.md`.

Track: **B. Studio design** (dense but orderly, collapsible panels, precise labels).

## Purpose
A first-pass QC tool for keynotes and general notes on architectural drawing sets. Scopes: restroom, accessibility and barrier removal, existing walls and tile, partitions, faucets and accessories, doors, fire rating, and others. It does not replace the reviewer.

## Decisions (from convo v0.1)
- **No existing guideline.** The guideline is built together, typed in through a framework. Bathroom repair concepts are the starting point.
- **Vector PDFs only** in v1. Scanned pages are marked "cannot read" (yellow). No OCR.
- **Colours.** Green = matches the format exactly. Yellow = close but questionable (synonym, number out of sequence, missing scope word). Red = breaks a rule (wrong prefix, duplicate number, undefined keynote, fire rating missing).
- **General notes:** a stub for now, to be developed later.
- **Export:** marked-up PDF with editable highlight and square annotations, each with a comment; plus a findings list (page, keynote, colour, reason).
- **Privacy:** drawings and guidelines are offline only. The page says so. The uploaded PDF is never committed. Sample sheets are synthetic.
- **Data:** the architecture database is for feedback and comments only. Guidelines are saved in this browser. Each guideline carries a choice, "keep local and secure" (default) or "safe to cloud". Cloud sync is not built yet.
  (Reading of the answer: "super faces" in the answer was taken to mean the architecture database, Supabase. To confirm.)
- **Settings:** ⚙️ lower right, with strictness, export options, dark mode and an opt-in "Show errors" panel at the bottom.

## Built (v0.1.0)
- `index.html`: title, one-line intro, offline notice, four steps (step 1 open; steps 2–4 "next build").
- Guideline builder: name; cloud choice; scopes checklist; demolition and new-work syntax; examples; rules with colour; general-notes stub; save in the browser (auto-save); export and import as JSON; clear.
- ⚙️ drawer: strictness, export options, dark mode, Show errors.
- Checked headless at 390×844, 768×1024 and 1180×820: no horizontal scroll, drawer opens, rule text persists on reload, no console errors (favicon 404 fixed).
- Home-page tile added to the Nursery list in the root `index.html` (standing exception).

## Next (not built)
1. Step 2: upload a PDF (pdf.js from cdnjs, pinned version), kept in memory only.
2. Step 3: read the text layer per page, find keynotes and note blocks, apply the guideline rules, colour each match.
3. Step 4: export with pdf-lib annotations, plus the findings list.
4. Feedback notes and the database link (architecture project), feedback and comments only.
5. Strictness setting wired into the scan.

## Open
See `convo/convo v0.2.md`.
