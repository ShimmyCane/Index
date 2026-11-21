# QC keynotes — lessons

- Answers to convo questions come back inline. Record them in the convo file first, then build.
- A typed guideline needs auto-save and export, or it is lost on reload.
- Keynote lines at the same height as plan callouts merge into one line. Split a line where the horizontal gap is wide.
- Table order and test order can differ: sort by colour in the page and tell rows apart by their reason text in tests.
- A test that appends a large canvas to the page makes it look like a layout overflow. Remove test-only elements.
- Stack the results (preview above the table) on a narrow page; a side-by-side preview is too small to read marks.
- Favicon requests return 404 in headless tests. An empty `<link rel="icon" href="data:,">` silences them.
