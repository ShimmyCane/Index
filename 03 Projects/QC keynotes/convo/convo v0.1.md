# QC keynotes — convo v0.1

Purpose: first clarifying questions before the first build. Jimmy answers inline under each question.

## Scope and guideline
1. Do you have an existing keynote guideline (a PDF or document from the firm or a client), or should the first version use a synthetic sample guideline that you then refine?
   - Answer: No existing guideline I want to use. I have some ideas, but we create one together from scratch. Set up the framework and let me type it in. Borrow the general concept of bathroom repairs from the prompt.
2. Which scopes go first: restroom, accessibility and barrier removal, existing walls and tile, partitions, faucets and accessories, doors, fire rating? Any others?
   - Answer: All of these.
3. Keynote syntax. Give a few real examples of a correct keynote (demolition and new work) and a few wrong ones. For example: prefix letters or shapes, number format (e.g. `D3`, `N12`), placement (in the drawing or in a legend), text case, maximum words.
   - Answer: Create a framework that will allow us to really go into those details. (Examples to be added in the guideline builder, not here.)
4. Are the drawings exported as vector PDFs (text can be selected) or as scanned images? If scanned, can v1 limit to vector PDFs, and mark scanned pages as "cannot read" (yellow) instead of adding OCR?
   - Answer: Yes, vector PDFs.

## Colours
5. Proposed defaults. Green = matches the format exactly. Yellow = close but questionable: e.g. a synonym, a number out of sequence, a missing scope word. Red = breaks a rule: e.g. wrong prefix, duplicate number, undefined keynote, fire rating missing. Which checks are yellow and which are red?
   - Answer: Ok (proposed defaults accepted).

## General notes
6. Which general-note blocks should be checked (e.g. "GENERAL NOTES", "DEMOLITION NOTES", "FIRE-RATING NOTES")? Should a general note that is not in the guideline be yellow?
   - Answer: Make this a stub to be developed further at a later time.

## Output
7. Export: should the marked-up PDF use highlight and square annotations with a comment (editable in Acrobat or Bluebeam), and should the scan also produce a list of findings (page, keynote, colour, reason)?
   - Answer: Yes.

## Privacy and data
8. The repo is public. Drawings often carry client and project names. Proposed: the uploaded PDF never leaves the browser and is never committed; sample sheets are synthetic. Do you agree, and do you want a sample client name (fictional)?
   - Answer: Yes. Also state on the page that both the guidelines and the drawings are offline only.
9. Should guidelines be saved only in the browser (with export and import as a file), or do they need to persist across devices (Supabase, with the family or firm project)?
   - Answer: Use the architecture database only for feedback and comments. Non-proprietary guidelines are introduced later, so during guideline creation the guideline gets a choice: "safe to cloud" or "keep local and secure". (Jimmy's wording was partly unclear; the reading used is in the schematic, to confirm.)

## Settings
10. Does the page need a ⚙️ settings button (strictness, show errors, guideline choice, export options)? Proposed: yes, lower right, with errors at the bottom behind "Show errors".
    - Answer: Yes. Use the settings button as usual, populated with useful panels, toggles and descriptions.
