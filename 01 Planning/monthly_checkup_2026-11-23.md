# Monthly checkup, first run (2026-11-23)

This is the first run of the monthly checkup. The steps are in `04 AI/Skills/monthly_checkup.md`. It is written in plain words so anyone can follow it.

## What was done this run
- Architecture: a plan to close sign-up and use a request list instead. Table and test written. Test passed (4 of 4), rolled back.
- Family: a plan to give accounts roles, and to limit withdrawal approval to owner or parent. Table and test written. **The live test did not finish** (the Supabase server asked a question and nobody answered before the time limit). Nothing was pasted into the database.
- Statuses in this repo (Index) brought in line with the live database.
- Lessons pool: new items placed in their topics; the review-flow rule added to the preferences.
- Skills working copies refreshed, and one new skill added (access requests).

## 🚩 Flags (must be fixed; literal flags)
1. 🚩 SECURITY, Architecture: sign-up is open. Turn it off in the dashboard (see `04 AI/Supabase/access/README.md`, step 1). Then paste the request table.
2. 🚩 SECURITY, Family: `approve_allowance_withdrawal` lets any signed-in account approve. Fix is in `04 AI/Supabase/access/family_001_roles.sql`. Test first (not yet passed), then paste.
3. 🚩 SECURITY, Architecture and Family: leaked-password protection is off. Turn it on in the dashboard.
4. 🚩 SECURITY, Shimmy Specs (Architecture): sign-in and save functions can be called without an account, with a token. Each must refuse a bad token. Not tested yet.
5. 🚩 PRIVACY, speech-therapy: schematic states a child's age and daily time. Public repo. Remove or make general.
6. 🚩 PRIVACY, learning-kangaroo: schematic names children with grade levels. Public repo. Keep first names only; make the levels general.
7. 🚩 PRIVACY, map-photos: schematic mentions a campus walk. Check for school or location detail.
8. 🚩 PRIVACY, proposal_drafter: may hold studio client material. Check and remove anything that identifies a client.
9. 🚩 PRIVACY, adventure: family story content in a public repo. Decide: keep it public with first names only, or move it to the private repo.

## Vet list (not critical; revisit later)
- `platform_is_owner()` can be called by anonymous users. Low risk. Revoke anonymous execute when convenient.
- Family sign-up setting: check it too (the advisors did not flag it).
- `storytime_ai_key` (Family): confirm no grant exposes it. RLS is on with no policies, which is right for a secret.
- Allowances: repo SQL does not match the live Family tables. Decide which is current.
- Tables not live: Felix Maze (three), Growth (two), Moment (one: `project_notes`), Family Habits (one: `week_task_snapshots`).
- Make 3D: 844 files in the repo. Check for vendored or generated data that should not be committed.
- Stale statuses in repos (see the list below). Needs a push to each repo.
- Several repos have no schematic status (Coins, Exponents, Multiply, How Far Is It, Allowances, Family Habits, Snake Cube, Felix Checkers). Give each a short plain summary.
- Monthly re-run scheduling: still not set up (permission denied earlier). Run this checkup by hand until it is.

## Status fixes needed in other repos (not pushed yet)
Each needs its own push and merge, one at a time, after Jimmy's go-ahead for each batch.
- What to Cook: schematic says SQL not applied; 15 tables are live.
- Better Parenting: schematic says not applied; `bp_*` tables are live.
- Our Family Compass: schematic says not applied; `ofc_*` tables are live.
- Make 3D: schematic says "idea, round 2"; repo is at MVP 0.x.
- Speech Therapy: schematic says "No code yet"; repo has 36 files.

## How the repo updates will work (plain words)
Think of each repo as a box with a label on it. The label says what is inside and how far along it is. Right now some labels are old. For each old label:
1. Open a copy of the box (clone it).
2. Fix the label so it matches what is really inside.
3. Put the box back with a note saying what changed (a pull request).
4. Look at it on the Pages site, then press merge.

Only the label changes. Nothing inside the box is moved or thrown away. One box at a time, and each one waits for your go-ahead.

## Skill candidates (step 5)
- **Access requests** (new, done today): `04 AI/Skills/access_requests.md`. Promote into any app with sign-in.
- **Security advisor check** (added to `supabase_project`, 2026-11-23). Already promoted.
- **Plain repo summary** (for the repos with no schematic status): candidate. Needs a short template.
- **Pages check after merge** (added to `smoke_test`). Already promoted.

## Lessons logs (step 6)
- Index: `04 AI/lessons_pool.md`, `04 AI/Supabase/lessons.md`. Up to date.
- Each linked repo: most have no lessons log of their own. Plan: a short `lessons.md` in each repo, added when that repo is next updated. Not started.

## Waiting for Jimmy
1. Turn off sign-up and leaked-password protection (dashboard, both projects).
2. Go-ahead to paste the Architecture request table (after the dashboard step).
3. Test or re-run the Family roles test (the live test timed out), then go-ahead to paste it.
4. Decide on the 🚩 PRIVACY items for the public repos.
5. Go-ahead for the first batch of repo status fixes.
