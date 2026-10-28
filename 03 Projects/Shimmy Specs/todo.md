# Shimmy Specs — To-do

**Purpose of this list:** reach an MVP of the **framework**: any section template runs end to end (import → survey → sections → section workspace → flags/decisions → PPD, outline, full section). Then write real templates together, one at a time, publish and check them online.

- MVP design: `mvp schematic.md`
- Build steps for a Haiku session: `mvp tasks.md`

Status key: `[ ]` open · `[~]` in progress · `[x]` done · `[?]` waiting on Jimmy

## Now
- [x] Set up the project folders, `CLAUDE.md`, `schematic.md`, `convo/convo v0.1.md`.
- [x] Draft the body of knowledge: `knowledge/` and `base sections.md`.
- [x] Jimmy answered convo v0.1 (recorded in `convo/convo v0.2.md`).
- [x] Write `mvp schematic.md` and `mvp tasks.md`.
- [?] Jimmy answers the five open questions at the end of `convo/convo v0.2.md` (roofing system, ladder scope, doors/hardware split, import file name, users).
- [ ] Haiku session builds the MVP from `mvp tasks.md` (phases 0–5).
- [ ] Publish on GitHub Pages and check online.

## First sections (in order, written together, each a `knowledge/5xx` chapter + `data/sections/<number>.json`)
1. [ ] **Roofing** (501) — system to be picked (convo v0.2 open Q1); e.g. `07 54 23 TPO Roofing` or `07 52 00 Modified Bituminous`, plus `07 01 50 Preparation for Re-Roofing` if re-roof.
2. [ ] **Firestopping** (502) — `07 84 00`.
3. [ ] **Joint sealants** (503) — `07 92 00`.
4. [ ] **Exterior painting** (504) — `09 91 13`.
5. [ ] **CMU wall** (505) — `04 22 00` (with `04 05 13` / `04 05 16` / `04 05 19` folded in or split).
6. [ ] **Ladder fall protection** (506) — `05 51 33 Metal Ladders` and/or a Division 11 fall-protection section **(verify number)**; scope in convo v0.2 open Q2.
7. [ ] **Doors and hardware** (507) — `08 11 13` + `08 71 00` (or one section; convo v0.2 open Q3).

For each: schematic of questions → bracket options with explanations and perspectives (master guide / manufacturer / performance / contractor) → impacts → draft → publish → review online → lessons.

## Learning (Jimmy)
- [ ] Contracts and relationships: owner–contractor–architect under AIA families (A101/A201, A102, A104, A105, A141, CM variants), and how Division 00/01 and the General Conditions divide the work. Becomes `knowledge/301`.
- [ ] CCS study: optional practice questions per chapter, later.

## AI later (not in the MVP; everything that needs or would benefit from AI)
- [ ] Read a free-text project dump and propose drivers (beyond keyword rules).
- [ ] Suggest options and reasons for a bracket choice from project context ("we think it's this because X, Y, Z").
- [ ] Draft or tighten paragraph text in our own words; check against writing rules (imperative, streamlined, no "and/or").
- [ ] Compare perspectives: summarize what a manufacturer guide spec pushes vs. a performance approach.
- [ ] Coordination review across the whole book (conflicts, repetition, missing sections).
- [ ] Turn conversation lessons into section-library lessons (no project details).
- [ ] Read drawing sets / keynote sheets / code-analysis sheets (PDF).
- Needs a decision: where the AI runs (Claude Code session vs. a key in ⚙️ vs. a Supabase edge function).

## Later (non-AI)
- [ ] Guidance tiers: *See everything* → *Guided* → *Expert*.
- [ ] Coordination checks: section referenced but not in the book; requirement stated twice; keynote without a section; section without a keynote.
- [ ] Import the project file from the other repo once it exists (replace the placeholder schema).
- [ ] Supabase (Architecture project): apply `supabase/001_shimmy_specs.sql` via `/supabase-project` (needs Jimmy's OK).
- [ ] Export to `.docx` with an office template.
- [ ] Move to its own repo when grown (Jimmy, by hand).

## To research (Jimmy)
- CSI *Construction Specifications Practice Guide* (CSPG) and *Project Delivery Practice Guide* (PDPG).
- CSI *MasterFormat*, *UniFormat*, *SectionFormat/PageFormat* (latest editions).
- How master guides teach: MasterSpec evaluations and editor's notes; manufacturer guide specs; performance specs.
- AIA contract families and what each changes for the spec.
- Secretary of the Interior's Standards and NPS Preservation Briefs (repair and historic work).
