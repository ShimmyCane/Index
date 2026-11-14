# Critique Detail — convo v0.1 (2026-11-14)

Built from the master schematic in the request. What I assumed is listed first; answer inline under each question.

## Assumptions made to build the MVP

- The brief's `detail_critique_mvp/` folder is this project folder.
- The vision model is Claude (`claude-opus-5-5`) through the `anthropic` Python package.
- Track B (studio design), Architecture database, owner only, table prefix `dc_`.
- The script writes to the database (`--push`); the page reads it.
- Boxes are whole numbers from 0 to 1000, `[ymin, xmin, ymax, xmax]`.
- The sample detail, project context, lessons and library entries are all synthetic.

## Questions

1. **Real details in the database.** Shimmy Specs keeps office projects out of the repo and out of Supabase. I set the same rule here (`sample`, `sketch`, `own` only). Is that right, or should the private database hold office details too?

   Answer:

2. **Which model and key.** Is Claude with your own API key what you want? A live review of one detail is one or two calls (three for an unseen detail type).

   Answer:

3. **Step 1 as a hard gate?** Scale, labels and geometry need the model to look at the drawing, so they are checked in the same pass as the audit and reported as warnings. Do you want a separate first call that can stop a clearly incomplete detail before the full audit?

   Answer:

4. **New rulebooks.** An auto-generated rulebook is saved as active straight away, as the brief says. Would you rather it be saved as a draft that you approve before it is used again?

   Answer:

5. **The rulebooks I wrote** (parapet, below-grade waterproofing, window head and sill, brick veneer base) are from general practice. Do you want to replace them with your office checklists, and which detail types come next?

   Answer:

6. **Library.** The office and manufacturer folders hold an index with placeholders. Real files would sit in `library/.../private/` on your computer only. Should the database hold them too (a second private bucket), so findings can link to them on the page?

   Answer:

7. **Sign-in on the page.** The session is kept in memory, so you sign in again after each reload. Keep it that way, or stay signed in on the device?

   Answer:

8. **Running a review from the page.** The page shows results only; the review runs from the command line. A page that uploads a detail and runs the review would need a small server function to hold the model key. Wanted later?

   Answer:

9. **Units and codes.** The sample uses IBC 2021, IECC 2021 and climate zone 5A, with inches first. What should the defaults be?

   Answer:

## Jimmy, 2026-11-14

Purpose: a page that can review and critique architectural details, and in a way show that it can understand details. The MVP is the framework: set up a front-end GUI, and develop an adaptive QC list based on project requirements for each type of detail. This can then be used with Claude or future versions to critique better and improve.

"I think it is looking good." Answers to the questions come next round. Merged on request.
