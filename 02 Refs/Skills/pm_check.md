# Project Management Check

Purpose
Read everything a Shimmy Specs project has said so far (every text dump and saved text note, plus keynotes, answers, decisions and flags) and bring the project-management tools up to date: PPD, schedule, cost estimate, risk log, open items and next steps, and the smaller tools that fall out of them. Run it after new text is pasted into a project, before a coordination meeting, and at each design phase.

Input
- Optional: a project name. Default: every project on the account.
- Optional: `--tools ppd,schedule,cost,risks,open,assumptions` to update only some tools. Default: all of them.
- Optional: a path to an exported project JSON, for work that exists only on this device (saved text notes are device-first until the project is synced with "Sync to cloud").

Where the outputs go
- `03 Projects/Shimmy Specs/private/pm/<project name>/`. `private/` is gitignored. Real project details never go in the public repo, in a convo file, or in Supabase tables other than the project's own state.
- Files (create the folder and files on first run, update them after that):
  - `ppd.md` — Preliminary Project Description by UniFormat element.
  - `schedule.md` — phases, durations, constraints, critical path.
  - `cost_estimate.md` — line items by UniFormat element, with basis and status.
  - `risk_log.md` — risks with likelihood, impact, owner, mitigation, trigger.
  - `open_items.md` — open questions, who answers, needed by when, and next steps.
  - `assumptions.md` — assumptions and exclusions the other tools rest on.
  - `pm_check_log.md` — one dated entry per run: what changed and what is new.

Actions
1. **Gather.** For each project, read the text dump, the saved text notes (oldest first), keynotes, survey answers, decisions, flags and hand edits. Read the cloud copy (`ss_projects.state` in the Architecture Supabase project, read-only) and any exported JSON the user names. Say which projects and which notes were read, and which could not be read (for example, notes that exist only on the device).
2. **Extract.** From the text, list scope items, constraints, conditions, quantities, dates, requests, and unknowns. Tag each with its source (project, dump or note number and date) and with how it is known: *stated* (the text says it), *inferred* (a reasonable reading), or *research* (from an outside source, with its citation).
3. **Update the tools**, keeping earlier content and marking what changed:
   - **PPD:** one entry per UniFormat element the project touches (what it is, how it must perform, likely materials, linked MasterFormat sections and which of them are in the app's book). Elements the text does not mention are left out, not guessed. Use the chapter on UniFormat and the PPD in `knowledge/302`.
   - **Schedule:** phases (design, procurement, mobilization, demolition, install, closeout), durations as ranges with their basis, weather and seasonal constraints, lead times, and the critical path. Use relative weeks from a start date that the owner gives. Never invent calendar dates.
   - **Cost estimate:** line items by UniFormat element, each with quantity (from the text, or TBD), unit, unit cost and total. Unit costs come only from sources the owner supplies; where none exist, leave the cost blank and mark it *to price*, and say which quantity or quote is needed. Add contingency, allowances, alternates and exclusions as separate lines. Totals include only priced lines and say how many lines are unpriced.
   - **Risk log:** ID, risk, cause, likelihood, impact, score, owner, mitigation, trigger, status, source. Risks come from unknown conditions, hidden work, weather, safety, access, occupied-building constraints, product lead times, and coordination gaps.
   - **Open items and next steps:** every question the text raises or leaves unanswered, with the owner of the answer, who needs it and by when, and what it blocks. End with the next three actions in order.
   - **Assumptions and exclusions:** everything the tools rest on that the text does not state.
   - **Other useful tools** when the text supports them: an RFI or questions list for the design team, a submittal list, a responsibility matrix (who does what), a decision log summary, and a permit and inspection list. Add them to the folder, and list them in `pm_check_log.md`.
4. **Cross-check.** Every scope item should appear in the PPD and the cost estimate; every cost line should trace to a PPD element; every schedule activity should trace to a scope item; every high risk should have a mitigation and an owner; every open item that blocks work should be on the schedule or the risk log. List any gaps.
5. **Log and report.** Append a dated entry to `pm_check_log.md` (what was read, what changed, new items, new risks, gaps). Report in the reply: the counts per tool, the five most important open items, and every number that is an assumption.

Rules
- Private outputs only. The reply may say what the tools contain in general terms; project specifics stay in `private/` unless the owner asks to see them in the reply.
- Never invent facts, prices, quantities, durations from nowhere, codes or standards. Mark anything unverified as *to verify* and say where to check it.
- Use ranges, not single numbers, for anything that is estimated, and say the basis.
- Never copy text from master guide specifications, manufacturer guides, cost databases or CSI manuals. Paraphrase and cite.
- Name roles, not people. No personal names, addresses or client names in files that could leave `private/`.
- Do not overwrite earlier entries silently. Mark changed rows and keep the log.
- Do not send anything to anyone. Drafts of RFIs and letters stay drafts for the owner to send.
- Read-only on the database. Writing project state back is the app's job (Sync to cloud).

Lessons this comes from
- A text dump is the project's memory. Notes saved on every re-read keep earlier instructions from being lost.
- Early cost and schedule numbers go wrong when they hide their assumptions. Each tool lists them.
- Project details belong in `private/`; the public repo keeps only the method.
