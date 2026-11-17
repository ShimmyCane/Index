# Generate Clouds — convo v0.5 (2026-11-17)

Jimmy's round 5, and what was done (0.5.0). Earlier questions (v0.1 to v0.4) are still open.

## Asked

1. "I've added some comments to database. Archive the existing set as V1 before making changes. Review comments and update."
2. "Link it to the studio database."

## Found

Generate Clouds had no database table. Its notes box saved to the device only, so nothing reached any database. Searching both Supabase projects found no Generate Clouds table and no note mentioning clouds or the sky.

## Done

- Linked to the **Architecture** project (the studio database, owner only). See `schematic.md`, "Database (0.5.0)". Tests with a pretend database pass; the real table is **not created yet** (see `todo.md` for the five steps).
- The notes already on the device will be sent the first time you sign in, with their own ids and times. They carry version 0.4.0, which is the V1 set.

## Questions

1. **The database.** Neither Supabase project is named "splusystudio". I used the Architecture project because Generate Clouds is a studio (Track B) app. Is that the one you meant?
2. **"Archive the existing set as V1".** I read it as: keep the comments you wrote so far as a fixed first set before I change anything. Once they are in the database I will copy them into `convo/` as `notes v1.md` (summarised, no personal details) and mark them done only after you confirm. Is that right, or did you mean a copy of the page itself (the 0.4.0 code is in git, commit `5ff7ef1`)?
3. **Kept map spots.** Should they also be saved to the database (`gc_spots`), so favourites follow you to another device?
4. **Owner row.** Your user id has to be added once in the database (step 4 in `todo.md`). Do you want me to write that as a ready-to-paste file with a placeholder, or do you add it in the dashboard?
