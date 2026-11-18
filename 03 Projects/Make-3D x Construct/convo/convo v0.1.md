# Make-3D x Construct — Convo v0.1

**Project:** Make-3D x Construct
**Round:** 1 of clarifying questions (started by `/start-project`)

Answer inline under each number. Leave a question blank if you don't know yet. The recommended answer is marked, and it is what gets used if you say "go with your recommendation".

## What you said (summary)

- Start a new version of Make 3D, using the processes in Construct (`rtmandreyev/construct`, Apache-2.0, by Artyom Andreyev). Credit the author properly.
- Make 3D graduated to its own repo (`ShimmyCane/Make-3D`), so this is a new seed in the nursery.
- What was reviewed: Construct's contract, its check-and-repair flow, its provenance and certainty rules, and its masterpiece rounds (a defect ledger, a blind critic, pairwise comparison and stop rules). See `schematic.md` §2 for how each maps to Make 3D.

## A. Scope

1. **How far to take Construct's method?**
   - a) **Ideas only, in JavaScript** (recommended): the checks, certainty, ledger and rounds are ported into Make 3D's vanilla JS. No Python, no build, no model needed to run.
   - b) Also run Construct's Python toolkit beside the viewer as an offline checker.
   - c) Something else (say what).

2. **Who judges each round?**
   - a) **You, from the four-angle snapshot set** (recommended to start). The packet is the renders and the request, the same as Construct's critic packet, so a model critic can be added later.
   - b) A model critic, blind, in the same packet format (costs tokens; not needed to run the app).
   - c) Both.

3. **Which piece first?** (a) the checker with fix hints (P3), (b) certainty and unknown-means-absent (P4, P5), (c) the ledger and rounds (P6, P8), or (d) all of them in one first increment. Recommended: (a) and (b) together, then the ledger.

## B. Processes to keep

4. **Certainty on each part.** Should each part carry `verified`, `user_supplied`, `inferred` or `decorative`, with size and shape given separately where they differ? Or is a plain "measured or guessed" flag enough? Recommended: the four levels, with size and shape separate.

5. **Unknown values.** Left out of the model entirely, never written as `null`. Agree? Recommended: yes.

6. **Look and colour.** Keep the Quick Detail paper and ink look, with materials and colours set by the user as now? Or fix one house palette for every object, as Construct does? Recommended: keep paper and ink, with the user's materials.

7. **Round limits.** Construct's defaults are: at most four defects per round; stop after two rounds that do not beat the best; a round cap; and two hours of active time. Which of these do you want? Recommended: the first two only, and no time cap, since this is a family-paced build.

8. **Units and axes.** Make 3D stores inches and is Z-up; Construct uses metres and Y-up. Keep Make 3D's inches and Z-up so that existing models still open? Recommended: yes.

## C. Settings, storage and attribution

9. **Credit in the app.** Should the new version show an About panel that names Construct, its author (Artyom Andreyev), the Apache-2.0 licence and the repo link? Or only the README and the nursery notes? Recommended: an About line in ⚙️ plus the notes.

10. **⚙️ settings button.** Does the new version need one (options, an error panel at the bottom, a database check)? Recommended: yes, with "Notes for improvement" from the first build.

11. **Storage.** Keep the Architecture project's owner-only `m3d_` tables for the cloud copy, as Make 3D does? Or local storage first, with the cloud copy added later? Recommended: local first, cloud later, after an SQL check.

12. **Starting point.** Start from the Make 3D code in `ShimmyCane/Make-3D` (copy it into this project), or build fresh here and read Make 3D's code only for reference? Recommended: build fresh here, with Make 3D's tests and sample models as the reference.
