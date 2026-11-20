# QC keynotes — brief

Current state: v0.2.0. All four steps built: guideline builder (structured, v2), PDF upload (in memory), scan with green/yellow/red findings and a preview, and export of a marked-up PDF (editable annotations) plus a findings CSV. Libraries are vendored (pdf.js 3.11.174, pdf-lib 1.17.1), so nothing loads from the internet.

Verified: `test/smoke.js` in headless Chromium on the synthetic sheet: 4 green, 5 yellow, 4 red (3 entries + 1 undefined callout), 13 annotations in the export, selectable text kept, no horizontal scroll at 390 and 768 px, no console errors, guideline kept after reload. Visual check of the scan layout and the exported page done with screenshots.

Not verified: a real drawing set, a real iPad, Acrobat or Bluebeam opening the export.

Next: Jimmy's answers in `convo/convo v0.2.md`.
