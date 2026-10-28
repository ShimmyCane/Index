# Shimmy Specs — AI Brief

**Updated:** 2026-10-28
**Status:** idea → MVP planned. Round 1 answered (`convo/convo v0.2.md`). MVP design in `mvp schematic.md`; build list for a Haiku session in `mvp tasks.md`. No code yet.

## Goal

A web app that guides the process of writing CSI specifications (architectural sections, Divisions 01–14) for Jimmy, an architect doing mostly repair work who is studying for the CCS. Project facts (an imported, free-flowing project file, a text dump, the survey) set drivers; drivers recommend sections with reasons; each section is worked through questions with bracket options; every decision is recorded by user with reasons; impacts raise flags in the section and on a project board; outputs are the PPD, outline spec and full three-part section.

## Decisions (round 1)

- MVP = the **framework** (any template runs end to end), fully static, no AI. AI ideas tracked in `todo.md` → *AI later*.
- Desktop first, professional look; color only for wayfinding (Parts, flags, division groups).
- Options are **bracket choices** inside paragraphs (`[[qid]]`).
- Flags: auto / review / decision. Hand edits are never overwritten; changes behind them raise a review flag.
- Contracts: assume AIA, pick the variant in the survey.
- Supabase: **Architecture** project (`xabgankckrcuhcgdolrg`), registers tables in `public.table_index (table_name, project, purpose)`; existing tables belong to "Architecture practice" and "Quick Detail (wall sketch)". Shimmy Specs uses an `ss_` prefix; SQL written in phase 2, applied only with Jimmy's OK.
- Never store office project data; only lessons. Sketch and own projects allowed (`kind`).
- Knowledge becomes non-overlapping chapters (map in `mvp schematic.md` §10); 5xx = template specs written together.
- First templates, in order: roofing, firestopping, joint sealants, exterior painting, CMU wall, ladder fall protection, doors and hardware.

## Verified vs. unverified

- Verified: Architecture Supabase project exists and is healthy; its `table_index` layout (read-only query, 2026-10-28).
- Unverified: knowledge **(verify)** marks; AIA variant list in the survey; UniFormat titles; the import file format (the other repo doesn't exist yet).

## Next steps

1. Jimmy answers the five open questions at the end of convo v0.2.
2. Haiku session runs `mvp tasks.md`.
3. Write the roofing template together (501), publish, review online.
