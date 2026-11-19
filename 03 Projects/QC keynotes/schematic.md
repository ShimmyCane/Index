# QC keynotes — schematic

Status: seed (questions open in `convo/convo v0.1.md`). No build yet.

Track: **B. Studio design** (dense but orderly, collapsible panels, precise labels, keyboard and pointer).

## Purpose
A first-pass QC tool for keynotes and general notes on architectural drawing sets (restroom, accessibility and barrier-removal scopes first). It does not replace the reviewer. It flags what breaks the guideline so the reviewer checks less by eye.

## Steps on the start page
1. **Define the keynote guideline**, or pick a saved one.
2. **Upload a PDF** of the drawing set.
3. **Scan and mark**: green = matches the format; yellow = similar but questionable; red = breaks a rule.
4. **Export** a marked-up PDF with unflattened annotations (the markup stays editable).

## Proposed approach (to confirm)
- Single page, plain HTML/CSS/JS, no build step, GitHub Pages. PDF reading with pdf.js and writing annotations with pdf-lib, both from cdnjs at a pinned version.
- Everything runs in the browser. No database in v1. Guidelines are saved in the browser and can be exported and imported as JSON.
- Guideline = a list of rules: keynote number pattern, allowed prefixes (e.g. demolition vs new work), allowed text style, required fire-rating wording, required general notes, and a synonym list for "similar" matches.
- Scan = read the text layer per page, find keynote callouts and note blocks, test each against the rules, and colour the matches.

## Open
See `convo/convo v0.1.md` for the questions to Jimmy: guideline source, keynote syntax, PDF type (vector or scanned), yellow/red rules, export form, privacy, settings gear, and sample client.
