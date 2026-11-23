# Monthly checkup (plain words, one run a month)

Purpose
Once a month, look at every project in one go and write one report. Find what is out of date, what is a security or privacy flag, and what is worth turning into a skill. Change nothing in another repo without a go-ahead.

When to use
- The first working day of the month, or when Jimmy asks for a checkup.

Input
- Nothing. Work from the Index repo, the repo clones, and the live Supabase projects (read-only).

Steps
1. **Status matches reality.** For each project, check its status line against its version file and its latest convo round. Note any that say "not applied" for tables that are live (check the live table list).
2. **Database.** Compare each repo's SQL table names with the live table list (Family and Architecture). List tables that are not live.
3. **Security advisors.** Run the advisor for each project. Read each flagged function. Mark it 🚩 SECURITY.
4. **Privacy.** Look for first names only, no ages, no school or location details, no client material. Mark anything in a public repo 🚩 PRIVACY. Do not change it yet.
5. **Skills.** For each project, ask: did this round teach something another project needs? If yes, add it to the skill candidates list, then to a working copy in `04 AI/Skills/` when Jimmy agrees.
6. **Lessons.** For each project, check its lessons log exists and has this month's entry. Repos without one get a short plain one (later).
7. **Vet list.** Add anything not critical to the vet list, with a date to revisit.
8. **Write the report** in `01 Planning/monthly_checkup_<date>.md`, plain words, and put a link on the home page ⚙️ panel only if Jimmy asks.
9. **Merge small changes** the same day (lesson 16 in the lessons pool), so Jimmy sees them on the Pages site.

Rules
- Flags are written literally: 🚩 SECURITY or 🚩 PRIVACY.
- A flag stays until Jimmy says it is done.
- Never put a real email, a key, or a child's details in the report.

Report
- The date, what was checked, the flags, the vet list, the status fixes made, the skill candidates, and what is waiting for a go-ahead.
