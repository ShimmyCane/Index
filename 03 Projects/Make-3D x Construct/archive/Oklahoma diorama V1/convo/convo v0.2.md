# Make 3D x Construct — Convo v0.2

**Project:** Make 3D x Construct
**Round:** 2. Your answers to round 1 are recorded here, then the MVP built from them, then new questions.

## What you answered (round 1)

1. Scope: c. Implement as much as possible.
2. Judging: c. Both a person and a model critic.
3. Order: doesn't matter. Done in one first increment.
4. Certainty: a percentage on each part, sortable, validated and redefined by you afterwards. Saved to the Architecture database, to look at together later.
5. Unknown values: left out, never `null`, and flagged.
6. Look: paper and ink, your materials.
7. Round limits: your recommendation, with a plain explanation in ⚙️.
8. Units: inches and Z up, as Make 3D.
9. About panel: yes, near the bottom of ⚙️.
10. ⚙️: yes, with Notes for improvement.
11. Storage: prefix `m3dxc_` (lowercase), local first.
12. Start: build fresh here. Sample: an old science diorama, a plains camp, with a research folder.

## What was built (MVP 0.1)

- Page: `03 Projects/Make-3D x Construct/index.html`. Open it in a browser; no server.
- Sample: a generic plains camp in a science-diorama box, 1:24, with placeholder figures and horse (flagged).
- Research: `research/plains-diorama.md`. One lead: the Southern Plains Indian Museum (Anadarko) has a Cheyenne camp-move diorama; its date (1949 or 1950) is unresolved.
- Database: `supabase/001_m3dxc_certainty.sql` written and tested in a rolled-back transaction, not applied.
- Tests: 33 pass in plain Node. A headless browser check loads the page with no errors.

Terms: "planes" is read as "plains". "Indians" is replaced by "Native nations" or the nation's name in the research and in new text.

## Questions

Answer inline under each number.

1. **Generic or specific?** The camp is generic and depicts no specific nation. Should a later version show one Oklahoma nation? If yes, which one, and who are the consultants?
2. **Figures and horse.** They are placeholder forms only and must not stand in for real people. Who reviews them before any display, and how (a written note, a meeting, a visit)?
3. **Percent bands.** The page reads 90+ "checked", 70+ "good", 50+ "estimate", 25+ "guess", below 25 "placeholder". Are these the words you want?
4. **Flags.** Unknown values become flags (🚩 in the Flags panel), and an open flag explains the warning on the part it names. Is that the behaviour you meant?
5. **Round scoring.** The stop rule "every criterion at the top score" needs scores (0–3) for silhouette, proportion, identity and finish. Should the page ask you for them on each round, or should the model critic give them?
6. **Database.** Apply `m3dxc_certainty` now (to the Architecture project, owner only), or after you have tried the page on the iPad?
7. **summarize_code.** Should I write `index_summary.html` for the page now, as the nursery convention asks for core HTML?
8. **Tile.** The nursery home page now has a tile for this project. Keep it there while it is an MVP?

Round 2 decisions are in `schematic.md` §8. Open items are in `todo.md`.
