# Shimmy Specs — AI Brief

**Updated:** 2026-10-28
**Status:** idea. Background set up; no code. Waiting on answers in `03 Projects/Shimmy Specs/convo/convo v0.1.md`.

## Goal

A web app that guides the process of writing CSI specifications for Jimmy (architect, mostly repair work, about six months into serious spec writing). Project facts (summary, code analysis, keynotes, PPD) drive which sections go in the book; each section is worked through a schematic of questions; every decision is recorded with alternatives and impacts; then a three-part draft is generated. Mode now: "see everything, be methodical".

## Architecture (planned)

- Four layers: knowledge (`knowledge/` Specs 101–501, `base sections.md`) → section library (one JSON per section with questions, options, impacts) → project (drivers, keynotes, chosen sections) → book (decisions + drafts).
- Plain HTML/CSS/JS, no build. Save in localStorage + JSON export, so real projects stay out of the public repo.
- Screens: Project → Sections → Section schematic → Draft → Check, with an Impacts/Explanations panel on the right.

## Verified vs. unverified

- Knowledge files are written from general knowledge, not checked against current CSI books. Points marked **(verify)** include SectionFormat/PageFormat article lists, some `xx 01 00` maintenance section numbers, `01 43 39`, `01 45 33`, UniFormat edition letters, and code references.

## Next steps

1. Jimmy answers convo v0.1 (terms: PPD, "ST" product; first sections; input method; look; AI help).
2. Build a synthetic sample project and the data model.
3. MVP: one fully built section schematic end to end.
