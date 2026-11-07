# What to Cook — Lessons

Project-specific lessons, appended over time. Reusable ones go to `04 AI/lessons_pool.md`.

- (2026-11-06) Started from a single-sentence request with several features. Split them into five increments before any code, so the first build is one useful slice.
- (2026-11-06) When Jimmy says "build it anyway", record his decisions in a new convo version (v0.2) rather than editing v0.1.
- (2026-11-06) Rule-based transcript parsing needs its own test lines. Three bugs showed only on real phrases: a unit after "half a", a trailing "gone" in names, and "and 400 g" not splitting. Test with sample sentences before the page.
- (2026-11-06) A rolled-back test that ends in `raise exception 'RESULT: ...'` works through the Supabase SQL tool too, so it can be checked on the live project without leaving anything behind.
- (2026-11-06) The live Family project's `family_members` is owned by the habits app; this app reads it and stores member names as plain uuids with no foreign key, so the other app's changes cannot touch these rows.
- (2026-11-06) Answers that come as numbered items after a list of questions map to those questions in order. Check the numbering against the last message before recording decisions.
- (2026-11-06) A predicted remaining count reads oddly at 100% right after a feedback reset. Consider hiding the percentage when nothing has been used yet.
- (2026-11-06) Cards far down a list are off-screen in headless tests. Scroll each card into view before a pointer swipe, or the test reports a hidden element.
- (2026-11-07) A headless check at 390 px caught a five-button tab row that pushed the page sideways. Allow tab rows to wrap (`flex-wrap: wrap`) before shipping any new page with a row of buttons.
- (2026-11-07) The first headless run reported "0 cards" because the test added a food on the All tab and then switched to Fridge. The page was right; the test order was wrong. Check the test sequence before changing the code.
- (2026-11-07) Each new table gets its own paste file, and the file that is already applied is never edited. That kept `what_to_cook_setup.sql` unchanged when `wtc_notes` and `wtc_foods` were added.
- (2026-11-07) Feedback notes sit on the device until they sync. Say which copy the user is looking at, because "nothing took" was the device copy, not a failed save.
- (2026-11-07) When a user asks for "delete" on feedback, the read-notes rule is to keep the rows and mark them done. Offer the choice with the trade-off, and delete only on written confirmation.
- (2026-11-07) A page that loads its data with `fetch` will not load from a file opened directly. Test it through a local server (`python3 -m http.server`), the same way GitHub Pages serves it.
- (2026-11-07) Dark mode turned the page text light while panels stayed white, so text was nearly invisible on phones. Give white surfaces their own dark text colour, and check contrast in both light and dark modes in a headless run.
- (2026-11-07) A pantry matched by keyword ("egg" for "Eggs" and "Duck eggs") is quick and good enough for a first pass. Say so on the page, and list the matches to check.
- (2026-11-07) Estimated expiry dates go in the notes with a "?" and are not presented as facts. The "use soon" list is the reminder.
- (2026-11-07) Consolidated the to-do list by who has to act (Jimmy or Claude), with finished items in one short block. Duplicates from earlier rounds were dropped; the convo files keep the history.

