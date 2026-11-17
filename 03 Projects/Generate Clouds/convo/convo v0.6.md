# Generate Clouds — convo v0.6 (2026-11-17)

Jimmy's answers to `convo v0.5.md`, and the plan. Earlier questions (v0.1 to v0.4) are still open.

## Answers

1. **Database:** the Architecture project. Confirmed.
2. **"Archive the existing set as V1":** yes, keep the comments written so far as a fixed first set. Once they are in the database I copy them, summarised, into `convo/notes v1.md`, and mark them done only after Jimmy confirms which.
3. **Kept map spots in the database (`gc_spots`):** yes.
4. **Owner row:** a ready-to-paste file with a placeholder. Written: `supabase/000_owner_row.sql`.

## Plan

1. **Now:** this branch is merged (0.5.0). Jimmy pastes the SQL by hand, in the order in `todo.md`: test, `001_gc_notes`, verify, then the owner row, and signs in on the page so the notes already on the device are sent.
2. **Next round:** read the saved notes from `gc_notes` (read-only), write `convo/notes v1.md` (a summary, no personal details), review them against the code, and update the page. Mark notes done only on Jimmy's go-ahead, with the usual `Done- ` prefix.
3. **Then:** `gc_spots` (kept map spots follow you to another device), as its own SQL file with a rolled-back test and a verify file.

## Questions for the next round

1. When you paste the verify result, please include `owner_rows` and `notes_in_cloud` so I know the notes arrived.
2. Should `notes v1.md` quote each note in your words (public repo, so nothing personal), or only group and summarise them?
