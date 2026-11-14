# Rhythm Sticks — Convo v0.8

**Project:** Rhythm Sticks
**Round:** Jimmy's answer to convo v0.7

## What Jimmy said

- **Merge** the pull request, and Jimmy will test the other modes. → Merged (version 0.3.0 is on `main`).
- **Mark all the notes as done, "but when I click all, I should still be able to see it."** → Done in two parts:
  1. The 14 notes read in the last round are marked done in the family table (status `done`, "Done- " in front of the text, time and id unchanged). Read back from the table to confirm. Nothing else in the table was touched, and no new notes had arrived since the read.
  2. Version 0.3.1: the Notes panel now reads the family table, so a note marked done there shows as done on this device, and notes saved on another device appear. **Open** shows only open notes; **All** shows every note, done ones with a ✅ and a "Reopen" button. It reads again each time you switch to All, and when the page opens (while signed in).

## Checked

Headless Chromium with a made-up table reply: a note marked done in the table shows as done on the device; a note from another device appears; Open hides the done ones and All shows them; the merged list is kept on the device; no errors. The earlier full runs still pass. The real table was not read by the page in the test; that needs the iPad signed in.

## Question

1. **Notes on the iPad.** When you open Notes → All on the iPad (signed in), do the 14 show as done? If the ✅ list does not appear, the family sign-in may have expired: sign in again in ⚙️ → Family database.
   - Answer:

---
