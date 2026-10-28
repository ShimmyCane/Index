# Shimmy Specs — Schematic

**Status:** idea → MVP planned. See `mvp schematic.md` (it supersedes this file where they differ: desktop-first professional look, static MVP, Architecture Supabase, bracket options, flag levels).
**Started:** 2026-10-28 with `/start-project`

## 1. Intent

Specs are written section by section, but the decisions behind them come from the project. Shimmy Specs is a web app that teaches and supports the **process** of writing a specification, not just the finished text:

1. **Know the project first.** A project summary and code analysis (and keynotes, and a PPD) define what the building is and what it has to do.
2. **Pick sections from the project.** The project's drivers (construction type, scope, systems, exposure) suggest which sections belong in the book and which don't, each with a reason. Example: a Type IIB building with CMU bearing walls needs few or no Division 06 sections. But note that noncombustible types still allow fire-retardant-treated blocking and nailers, so `06 10 53 Miscellaneous Rough Carpentry` may stay in as a short section.
3. **Make a schematic for each section.** Before writing, answer that section's questions: what's in it, how it's specified (descriptive, performance, reference standard, proprietary), what's required for submittals, quality and warranty, and what the execution has to deal with (especially existing conditions in repair work).
4. **Record every decision.** Each choice keeps its alternatives and its reason ("chose `.06` because … ; `.03` and `.09` were considered"). Hovering an option explains it. A side panel shows what the choice means for other sections, including sections not yet in the book.
5. **Then draft.** Generate the three-part section (SectionFormat / PageFormat) as editable text with headings. Formatting comes later.

The app is a brain dump of the project and a tutor at the same time. Right now the mode is **"see everything, be methodical"**. Lighter guidance tiers come later.

## 2. Users

- **Now:** Jimmy, an architect working mainly on repair, about six months into serious spec work, studying toward CDT/CCS-level skill.
- **Later (maybe):** other designers in an office who need the same scaffolding.

## 3. Core idea: the four layers

| Layer | What it holds | Where it lives |
|---|---|---|
| **Knowledge** | How specs work: Specs 101–501, standards, specifying methods, writing rules | `knowledge/*.md` → later `data/knowledge.json` |
| **Section library** | One record per section: scope, typical drivers, related sections, the question set ("section schematic"), options with explanations, typical impacts | `data/sections/*.json` |
| **Project** | Summary, code analysis, keynotes, PPD, drivers, chosen sections | project file (JSON), saved in the browser and exported |
| **Book** | For each chosen section: answers, decisions, editor's notes, draft text | inside the project file |

The **knowledge** and **section library** are shared across projects and grow over time ("tweaking lessons later on"). The **project** and **book** are per project and are private by default.

## 4. Workflow (screens)

```
 ┌───────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌───────────────┐   ┌──────────────┐
 │ 1 Project     │ → │ 2 Sections      │ → │ 3 Section        │ → │ 4 Draft       │ → │ 5 Check      │
 │ summary, code │   │ recommended,    │   │ schematic:       │   │ 3-part text,  │   │ coordination │
 │ analysis,     │   │ each with why;  │   │ questions →      │   │ hidden notes, │   │ across the   │
 │ keynotes, PPD │   │ add / reject    │   │ decisions        │   │ editable      │   │ whole book   │
 └───────────────┘   └─────────────────┘   └──────────────────┘   └───────────────┘   └──────────────┘
                                    right panel on every screen: Impacts + Explanations
```

1. **Project.** Fill in or import:
   - Summary: scope type (new / addition / alteration / repair / restoration / historic), use, size, stories, site.
   - Code analysis: code and edition, occupancy, construction type, sprinklers, fire-resistance ratings, energy code and climate zone, accessibility, local programs (e.g. façade inspection ordinances).
   - Delivery: contract type (design-bid-build, CM at risk, design-build), owner standards (institutional guide specs), sustainability targets.
   - Keynotes: paste the keynote legend (`04 22 00.A1  CMU, 8"`), linked to sections.
   - PPD: a Preliminary Project Description organized by UniFormat (A Substructure, B Shell, C Interiors, D Services, E Equipment, F Special Construction, G Building Sitework), each element tied to MasterFormat sections.
2. **Sections.** The recommender turns drivers into a list:
   - *Required* (Division 01 basics, sections named by keynotes), *Likely*, *Consider*, *Unlikely* (with the reason it is unlikely).
   - Jimmy accepts, rejects or adds, with a note. Rejections are kept so the reason is not lost.
3. **Section schematic.** For one section: the questions grouped by Part 1 / 2 / 3. Each answer is an option card (hover = explanation, pros, cons, typical use). The chosen option writes a decision record.
4. **Draft.** The three-part section generated from the decisions, in PageFormat numbering. Editor's notes and decision notes are hidden but available (toggle). Text stays editable; edits are kept apart from generated text so regenerating doesn't wipe them.
5. **Check.** Cross-book checks: sections referenced but not in the book, requirements said twice, keynotes with no section, sections with no keynote, Division 01 items repeated in Divisions 02–49.

**Right panel (always):** for the current item: explanation, alternatives, *impacts on other sections*, sources/standards, and the knowledge-base page it comes from.

## 5. Data model (draft)

```json
{
  "project": {
    "id": "sample-masonry-repair",
    "summary": { "scope": "repair", "use": "R-2", "stories": 6 },
    "code": { "code": "IBC 2021", "construction_type": "IIB", "sprinklered": true },
    "drivers": ["masonry-facade", "existing-building", "occupied", "lead-paint-possible"],
    "keynotes": [{ "key": "04 01 20.A1", "text": "Repoint brick, full depth" }],
    "sections": [{ "number": "04 01 20", "status": "accepted", "why": "keynotes + façade scope" }]
  },
  "decisions": [{
    "id": "d-041",
    "section": "04 01 20",
    "question": "mortar-type",
    "chosen": "type-N-or-O-matched",
    "alternatives": ["type-S", "type-M"],
    "reason": "Mortar softer than the brick; match existing per analysis.",
    "source": "ASTM C270; NPS Preservation Brief 2",
    "impacts": ["01 45 00 testing (mortar analysis)", "01 43 39 mockups"],
    "by": "Jimmy", "date": "2026-11-02"
  }]
}
```

Section library entry (draft):

```json
{
  "number": "04 01 20", "title": "Maintenance of Unit Masonry",
  "drivers": ["masonry-facade", "existing-building"],
  "related": ["01 35 16", "01 43 39", "04 05 13", "07 92 00"],
  "questions": [{
    "id": "mortar-type", "part": 2, "ask": "Which mortar type for repointing?",
    "options": [
      { "id": "type-N-or-O-matched", "label": "Match existing (often N or O)", "explain": "…", "impacts": ["…"] },
      { "id": "type-S", "label": "Type S", "explain": "…" }
    ]
  }]
}
```

## 6. Guidance tiers

| Tier | Shows | When |
|---|---|---|
| **See everything** (MVP) | Every question, every option, every explanation and impact, open by default | Now: learning, methodical |
| **Guided** | Questions in order, explanations on hover, impacts summarized | Once a section has been done a few times |
| **Expert** | Only open questions, conflicts and changes since last time | Later |

## 7. Stack

- Plain HTML/CSS/JS, no build step, GitHub Pages (repo default).
- Save in the browser (localStorage) plus export/import of the project JSON file, so real projects never touch the public repo.
- Optional later: Supabase (only if work must sync between devices), AI drafting help (needs a key decision; see convo).
- **Look:** this is a professional tool, not a kids' game, so the iPad kid style may not fit. Keep the parts that help: gear ⚙️ lower right, errors at the bottom behind a toggle, large targets, stacked +/− panels. Style to be decided (convo).

## 8. Body of knowledge (`knowledge/`)

| File | Level | Covers |
|---|---|---|
| `101 language and documents.md` | Basics | CSI, construction documents, drawings vs specs, MasterFormat structure and numbering, the 4 Cs, writing rules, glossary |
| `201 section anatomy.md` | Section writer | SectionFormat three parts and articles, PageFormat, specifying methods, section scope (broad/medium/narrow), full-length / short-form / outline |
| `301 project manual and phases.md` | Project-level (CDT) | Project manual, Divisions 00 and 01, UniFormat and the PPD, outline specs by phase, drawings–specs coordination, keynotes, owner guide specs |
| `401 specifier practice.md` | CCS-level | Product evaluation, substitutions, reference standards, code-driven specifying, delegated design, allowances/unit prices/alternates, risk, repair and restoration specifying |
| `501 the decision system.md` | Mastery / this app | How a specifier reasons: drivers, decision records, dependencies and impacts, the section schematic method, quality checks |
| `base sections.md` | Catalog | Common base sections by division with the project drivers that bring them in or leave them out |

Every file is written in our own words. Points still to check against a current CSI publication are marked **(verify)**.

## 9. Open questions

Answered in `convo/convo v0.2.md`; five still open at its end.

## 10. Out of scope for the MVP

- Final formatting and `.docx` output.
- Full MasterFormat list or commercial master text (copyright; see `CLAUDE.md`).
- Reading PDF drawing sets automatically.
- Multi-user editing.
