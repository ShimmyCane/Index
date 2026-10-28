# Shimmy Specs — To-do

**Purpose of this list:** get to an MVP that proves the core loop on one sample project and one section:
**project → recommended sections (with reasons) → section schematic (questions) → decisions (with alternatives) → three-part draft → impacts on other sections.**

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Now (background, before coding)
- [x] Set up the project folders, `CLAUDE.md`, `schematic.md`, `convo/convo v0.1.md`.
- [x] Draft the body of knowledge: `knowledge/` Specs 101, 201, 301, 401, 501 and `base sections.md`.
- [?] Jimmy answers `convo/convo v0.1.md`.
- [ ] Check the "verify" marks in `knowledge/` against current CSI publications (SectionFormat and PageFormat article lists, MasterFormat edition, UniFormat edition). Jimmy has the books; Claude can't read them from here.
- [ ] Pick the first sample project (synthetic; see convo Q on sample project).
- [ ] Pick the first one to three sections to build deeply (suggestion: `04 01 20 Maintenance of Unit Masonry`, `07 92 00 Joint Sealants`, `01 35 16 Alteration Project Procedures`).

## MVP
- [ ] **Data model** in plain JSON: project, drivers, sections, questions, decisions, options, impacts (see `schematic.md` → Data model).
- [ ] **Project intake page**: summary, code analysis (occupancy, construction type, sprinklers, ratings, energy code), scope type (new / repair / alteration / historic), keynote list paste.
- [ ] **Keynote import**: paste or CSV of `number, text` → linked to sections.
- [ ] **Section recommender**: rules from drivers to sections, each with a "why" and a confidence (required / likely / consider / unlikely), and the option to add or reject with a note.
- [ ] **Section schematic** for the first section: its question set (Part 1/2/3), each answer an option with a hover explanation.
- [ ] **Decision log**: every choice records chosen option, alternatives, reason, source, and who decided. Hidden notes travel with the draft.
- [ ] **Three-part draft view**: SectionFormat/PageFormat numbering, plain-text editor with headings, editor's notes hidden or shown.
- [ ] **Impacts panel (right side)**: what this decision means for other sections, including ones not yet in the book.
- [ ] **Save**: localStorage + export/import JSON file (no server).
- [ ] **Show errors** toggle in ⚙️, errors at the bottom.

## Later
- [ ] Guidance tiers: *See everything* (now) → *Guided* → *Expert* (shows only open questions and conflicts).
- [ ] More section schematics, one at a time, each reviewed by Jimmy.
- [ ] Coordination checks: section referenced but not in the book; requirement stated twice; drawing keynote without a section; section with no keynote.
- [ ] Outline spec / PPD output per phase (SD, DD, CD).
- [ ] Import from a drawing set (sheet index, keynote legend, code analysis sheet) — method to be chosen (see convo).
- [ ] Optional AI drafting help (needs a decision on keys and where it runs).
- [ ] Optional Supabase sync if work must move between devices (`/supabase-project`).
- [ ] Export to `.docx` with an office template.

## To research (Jimmy)
- CSI *Construction Specifications Practice Guide* (CSPG) and *Project Delivery Practice Guide* (PDPG): the CDT/CCS bodies of knowledge.
- CSI *MasterFormat*, *UniFormat*, *SectionFormat/PageFormat* (current editions).
- Commercial master guides to compare how they teach: AIA MasterSpec (Deltek), SpecText, BSD SpecLink (Deltek), and their evaluation / editor's notes.
- Institutional guide specs you use (e.g. a university or agency design standard) and how they layer on top of a master.
- Secretary of the Interior's Standards and NPS Preservation Briefs (repair and historic work).
