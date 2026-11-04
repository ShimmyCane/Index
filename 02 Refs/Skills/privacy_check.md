# Privacy Check

Purpose
Stop private data and secrets from reaching this public repo. Run it before every commit, before every publish, and before pasting anything into a convo file. The root `CLAUDE.md` has the rules; this skill checks them.

Input
- Optional: `--staged` to check only what is staged for commit (the default before a commit). Without it, all tracked files are checked.

Actions
1. Run the scanner from the repo root:
   `02 Refs/Skills/scripts/privacy_scan.sh --staged` (before a commit), or without `--staged` for a full sweep.
2. Read the output. Every line says what it found, where, and a severity:
   - **BLOCK**: do not commit. Fix it, then run again. Examples: a personal email, a secret key, a `private/` folder tracked by git, a password in code, a private key.
   - **REVIEW**: ask Jimmy before committing. Examples: a photo outside `renders/` or `assets/` (is it a real room or a real person?), a number that looks like a phone number.
   - **INFO**: noted only. A Supabase publishable (`anon`) key in browser code is fine.
3. Do the manual checks the scanner can't do. Read any new or changed convo, brief, lesson, schematic or render note and check for:
   - real names beyond a first name, and family details (ages with names, relationships, health, school or location);
   - financial figures tied to a real person or household;
   - photos or descriptions of a real home, room, family or person;
   - office or client project details (Shimmy Specs and Make 3D keep them in `private/` or out of the repo).
   Summarise instead of quoting. Replace a real detail with a synthetic one.
4. Check the database side when a migration is involved:
   - no sign-in email in SQL. Owner-only policies call `public.platform_is_owner()` (see `04 AI/Supabase/platform_owner.sql`), and the owner's user id is added by hand, never committed.
   - no service-role key anywhere. Only the publishable key may appear in browser code.
5. Report: the counts (BLOCK, REVIEW, INFO), each item with its fix, and anything that needs Jimmy's decision. Do not commit while any BLOCK remains.

Rules
- The scanner finds patterns, not meaning. A clean run does not prove the content is safe; do step 3 as well.
- Never print a secret's value in the report. Give the file and line only.
- If something private was already committed, do not rewrite history without Jimmy's explicit yes. Say what is exposed, where, and the options (remove going forward, rotate, or rewrite). Rewriting is rarely worth it: the data stays in old commits and forks.
- `private/` folders are gitignored (see `.gitignore`). Check that the scanner's `private/` rule still matches the folder name used.

Lessons this comes from
- Sign-in emails appeared in public migrations (Growth, Make 3D) and had to move to an owner table.
- Photos of a real room were kept in `private/` and never committed (Make 3D, Living Room Scene).
- Copies of licensed papers and standards stay out of the repo (Felix Maze, Shimmy Specs).
