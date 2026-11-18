# Make 3D x Construct — Convo v0.3

**Project:** Make 3D x Construct
**Round:** 3. Your answers to round 2 are recorded here, then what was built, then new questions. Round 2 stays as it was.

## Your answers (round 2)

1. **Generic or specific?** As specific as possible, with a narrative as part of the exhibit. → Built: a Southern Cheyenne camp move on the North Fork of the Canadian, Indian Territory, 1870s. It is a draft for consultation (`exhibit/story.json`, `research/plains-diorama.md` §9).
2. **Figures and horse: who reviews, and how?** Try your best. → Built: a consultation plan with who to ask, the steps, and how each decision is recorded (`research/consultation-plan.md`). A draft letter for you to send (`research/consultation-letter-draft.md`). Nothing is sent by the page.
3. **Percent bands** (checked, good, estimate, guess, placeholder): sure. → Kept as they are.
4. **Flags**: sounds good. → Kept. Added a second kind, *consultation*, for anything that must be reviewed by people outside the project before display.
5. **Round scoring**: identify every item that needs AI or your review and give each a switch in ⚙️. → Built: six switches in ⚙️ → *Reviews*, each with who does it (see below).
6. **Database**: merge first, then you copy it over manually. → Plan: merge the pull request after this round is pushed. I will not apply the SQL.
7. **summarize_code**: yes. → Written: `index_summary.html`.
8. **Tile**: keep it. → Kept.

## The review switches (⚙️ → Reviews)

| Switch | Who does it | Default |
|---|---|---|
| I record each round's verdict (won, lost or tie) | You | on |
| I score the four criteria (0–3) for each round | You | on |
| An AI critic judges each round from the packet (paste reply) | AI | off |
| An AI fact-checks the story claims (paste reply) | AI | off |
| Block display until the consultation flags are closed | People outside the project | on |
| Closing a consultation flag needs a note: who reviewed, role and date | You | on |

With *round scores* off, the stop rule "every criterion at the top score" cannot run. The engine says so in the round messages.

AI reviews use the nursery's copy-and-paste loop. The page never calls an AI service. Each reply is checked before it is applied: a bad choice, a missing score, or a claim the story does not contain is refused, with the reason.

## What was built (round 3)

- The camp move as the sample (48 objects, 8 flags, 5 open for consultation). Placeholders are flagged.
- The story: six steps, each linked to the objects it describes, and seven claims with their sources and certainty. Claims marked *scene choice* are design choices, not sources.
- The display gate: a red header pill while consultation flags are open; ⚙️ → *Display check* lists them.
- Closing a consultation flag asks for a note (role and date, no personal names).
- The summary page `index_summary.html`.
- Tests: 10 new review tests (parsers, prompts, score and flag checks). All Node tests pass. The browser check ran the AI critic paste, a refused reply, the fact-check, the display gate and closing a flag with a note, with no errors.

## Questions

1. **The Cheyenne camp move.** You asked for the most specific version. I chose a Southern Cheyenne camp in the 1870s because the Anadarko museum's diorama is of a Cheyenne camp move. Is that the nation and time you meant? If you want another nation, say which.
2. **Defaults in ⚙️.** Should the AI critic and the AI fact-check start on, or stay off until you want them?
3. **Public repo.** The draft is about a specific nation and will be public once merged. The page blocks display, but the draft text is still visible in the repo. Do you want the story and the sample kept in `private/` until the tribes have reviewed it, or is public draft acceptable?
4. **Consultation.** Do you want to make the first call yourself, or should I draft a call script too?
