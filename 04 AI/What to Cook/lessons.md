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
