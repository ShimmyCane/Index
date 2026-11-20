# QC keynotes — schematic

Status: all four steps built (v0.2.0), notes for improvement built (database table not yet pasted). Tested headless on synthetic data (`test/smoke.js`). Not yet tested on a real iPad or on a real drawing set. Questions answered in `convo/convo v0.1.md`; next questions in `convo/convo v0.2.md`.

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

## Built in v0.2.0
- Step 2: PDF read in memory with pdf.js (vendored), text layer checked per page.
- Step 3: keynote entries (code + words) and callouts (code only) found by line; checks run from the structured guideline; findings table, preview with boxes, page picker.
- Step 4: marked-up PDF with editable Highlight (entries) and Square (undefined callouts, unreadable pages) annotations, each with a comment; findings CSV.
- Synthetic test: `test/make_synthetic.js` makes `test/synthetic_restroom_set.pdf` and `test/synthetic_guideline.json`; `test/smoke.js` checks the colours, counts, export and layout.

## Matching (convo v0.2, Q6)
- Green: the entry text matches an approved phrase exactly (spacing aside; case and punctuation included).
- Yellow: same words, different case or punctuation (`punctCase`); close wording (`nearApproved`); not in the list (`notApproved`); and the other yellow checks.
- Red: wrong prefix, wrong digits, duplicate number, FIRE with no rating, undefined callout.

## Notes and database (convo v0.2, Q4)
- ⚙️ "Notes for improvement": saved on the device with the part of the page and the time; done/reopen.
- ⚙️ "Architecture database": sign-in (password not stored; renewal token kept until sign-out), sync, check. Table `qk_notes` (prefix `qk_`), owner only, through `platform_is_owner()`. SQL in `supabase/` (test, 001, verify). Not pasted yet.
- Guidelines and drawings are never sent to the database, even when marked safe to cloud.

## Reference
- Map Photos (index tile, separate GitHub Pages repo): PDF export is the model for step 4. Not in this repo; see `convo/convo v0.3.md`.

## Known limits (v0.2.0)
- Keynote codes must be letters then digits, no separator (D3, not D-3). A sheet number such as A-101 is not read as a code.
- Keynote text must sit on one line with its code. Text split over several lines is read as separate lines.
- Callouts are found by a bubble that holds only the code.
- General notes are not checked (stub).
- Feedback notes are not built.

## Next
1. Test on a real vector drawing set (Jimmy's own file, kept out of the repo) and adjust the line reading.
2. Feedback notes and the database link (architecture project), feedback and comments only.
3. General-notes checks, when Jimmy is ready.

## Open
See `convo/convo v0.2.md`.
