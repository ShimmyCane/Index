# Shimmy Specs — MVP Schematic

**Status:** planned (2026-10-28). Built from `convo/convo v0.2.md`.
**Build list:** `mvp tasks.md` (written so a Haiku session can pick it up and execute it).
**Overall design:** `schematic.md`.

## 1. What the MVP is

An MVP of the **framework**, not of one spec. When it's done, the app can take *any* section template we write and run it end to end:

```
Import / text dump  →  Project survey  →  Section list  →  Section workspace  →  Outputs
(project file,         (questions that     (recommended,     (questions, bracket    (PPD, outline,
 placeholders)          set drivers)        with reasons)     choices, decisions,    full 3-part)
                                                              flags, draft)
                         ─────────── Flags (section + project) and Decisions log everywhere ───────────
```

After the MVP, Jimmy and Claude write the first real template (roofing) together, publish on GitHub Pages, and check it online.

**Fully static.** No AI calls. Questions are asked; answers switch content on and off ("classical approach"). Anything that would need or benefit from AI is listed in `todo.md` → *AI later*.

## 2. Rules (apply to every task)

1. **Public repo.** Nothing project-specific is committed or saved to Supabase: no office project names, clients, addresses, drawings or real keynote lists. Only *lessons* from old projects. Exceptions: sketch/test projects and Jimmy's own projects, marked `"kind": "sketch"` or `"kind": "own"`.
2. **No copied text.** Templates, questions and explanations are written in our own words. No MasterSpec, SpecText, SpecLink, manufacturer guide spec or CSI book text. Numbers and titles of common sections are fine.
3. **Plain HTML/CSS/JS, no build, no frameworks, no npm packages in the page.** Works opened from GitHub Pages.
4. **Content vs. code.** The framework (code, schemas, empty or demo data) can be built by anyone. **Spec content** (real questions, options, explanations for a section) is authored by Jimmy with Claude, one section at a time; a Haiku build session does not invent spec content beyond the clearly labeled demo section.
5. **Architectural scope:** Divisions 01–14 (Division 00 only as a survey choice of AIA contract family).
6. Errors show at the bottom, behind *Show errors* in ⚙️. ⚙️ sits lower right.

## 3. Look (professional "Jimmy tools")

- Desktop first, three columns: **left** nav (project, sections by division), **center** work area, **right** panel (explanation, perspectives, impacts, decisions).
- Paper-white background, dark ink text, one neutral UI gray. Clear type: system UI stack for UI, a serif (e.g. Georgia) for spec text.
- **Color only for wayfinding:**
  - Part 1 / Part 2 / Part 3: three muted tints (slate blue / sage / sand) on the article gutter.
  - Flags: auto = gray-blue, review = amber, decision = red.
  - Division badges: one muted tone per division group (01; 02–05; 06–09; 10–14).
- Thin rules, 2px borders on cards, small shadows. Buttons ≥ 36px (desktop). Light and dark theme via CSS variables.

## 4. Files

```
03 Projects/Shimmy Specs/
  index.html                 app shell (single page, hash routes)
  css/app.css                tokens, layout, components
  js/
    store.js                 state, localStorage, export/import JSON, autosave
    data.js                  loads data/*.json (fetch, with bundled fallback)
    import.js                project file + text dump → project facts and drivers
    survey.js                project survey screen
    recommend.js             rules → section list with reasons
    template.js              section template engine: questions, bracket choices, conditions
    draft.js                 renders three-part text in PageFormat numbering
    flags.js                 flag levels, section + project flags
    decisions.js             decision records
    outputs.js               PPD (UniFormat), outline spec, full section, exports (.txt/.md/.json)
    app.js                   router, layout, ⚙️ drawer, errors panel
  data/
    survey.json              project survey questions → drivers
    drivers.json             driver list (id, label, group, explanation)
    keywords.json            text-dump keyword rules → drivers (classical, no AI)
    rules.json               driver → section recommendation rules
    uniformat.json           UniFormat elements used by the PPD (letters, titles)
    sections/index.json      section library list
    sections/_demo.json      DEMO template (fake content; proves the engine)
    import.schema.json       placeholder format for the file from the other repo
  samples/sketch-project.json   synthetic sketch project (kind: sketch)
  tools/smoke.js             Playwright smoke test (headless Chromium)
  supabase/001_shimmy_specs.sql (phase 2; written, applied only with Jimmy's OK)
  knowledge/                 chapters (see §10)
```

## 5. Data model

### 5.1 Project file (import placeholder, free-flowing)

All keys optional. Unknown keys are kept under `extra` and shown, not dropped. Missing values become survey questions.

```json
{
  "format": "shimmy-project/0",
  "kind": "sketch",
  "name": "Sketch: six-story masonry walk-up",
  "summary": { "scope": ["repair", "alteration"], "use": "R-2", "stories": 6, "occupied": true, "notes": "" },
  "code":    { "code": "IBC", "edition": "", "construction_type": "IIB", "sprinklered": true, "ratings": [], "energy_code": "", "climate_zone": "" },
  "contract":{ "family": "AIA", "agreement": "A101", "general_conditions": "A201", "delivery": "design-bid-build" },
  "repair_types": ["masonry", "roofing"],
  "keynotes": [{ "key": "07 54 23.A1", "text": "TPO membrane, fully adhered" }],
  "text_dump": "",
  "extra": {}
}
```

### 5.2 Drivers

A driver is a fact that changes the spec: `{ "id": "construction-type-IIB", "label": "Type IIB", "group": "code", "explain": "…" }`. Drivers come from the survey, the import file, and keyword hits in the text dump (each hit shows the matched words so Jimmy can accept or reject it).

### 5.3 Recommendation rule

```json
{ "section": "06 10 53", "when": { "all": ["construction-type-IIB"] }, "level": "consider",
  "why": "Noncombustible type: wood limited to allowed uses such as FRT blocking; keep only if blocking is in scope." }
```
Levels: `required` · `likely` · `consider` · `unlikely`. Several rules may hit one section; show all reasons. Jimmy accepts / rejects / adds; each action is a decision record.

### 5.4 Section template

```json
{
  "number": "00 00 00", "title": "Demo Section", "demo": true,
  "uniformat": ["B3010"],
  "perspectives": ["master-guide", "manufacturer", "performance", "contractor"],
  "questions": [
    { "id": "thk", "ask": "Membrane thickness?", "level": "decision",
      "options": [
        { "id": "045", "label": "0.045 in.", "explain": "…", "perspectives": { "manufacturer": "…" }, "sets": [] },
        { "id": "060", "label": "0.060 in.", "explain": "…", "default": true },
        { "id": "080", "label": "0.080 in.", "explain": "…", "sets": ["long-life"] }
      ],
      "impacts": [{ "section": "07 62 00", "level": "review", "note": "Flashing membrane to match." }] }
  ],
  "parts": [
    { "part": 2, "articles": [
      { "title": "MATERIALS", "when": null, "paragraphs": [
        { "text": "Membrane: [[thk]] thick, reinforced.", "when": null, "outline": true }
      ] }
    ] }
  ]
}
```
- `[[qid]]` in text = **bracket choice**; it renders the chosen option's label, shown as a chip (hover = explanation; click = open in right panel).
- `when` = condition on drivers and answers: `{ "all": [...], "any": [...], "not": [...] }`, ids are driver ids or `qid=optionId`.
- `outline: true` marks paragraphs used in the outline spec.
- `sets` lets an option switch on more drivers (cascades).

### 5.5 Decision record

```json
{ "id": "d-0007", "at": "2026-11-02T15:04:00Z", "by": "Jimmy",
  "section": "07 54 23", "ref": "2.02.A [[thk]]", "question": "thk",
  "chosen": "060", "alternatives": ["045", "080"],
  "reason": "Typical life-cycle balance for this owner.", "sources": ["ASTM D6878"],
  "kind": "answer" }
```
`kind`: `answer` · `section-accept` · `section-reject` · `section-add` · `edit` · `driver-accept` · `driver-reject`. `by` comes from the name set in ⚙️.

### 5.6 Flags

```json
{ "id": "f-0012", "level": "review", "section": "07 62 00", "from": "d-0007",
  "note": "Flashing membrane to match 0.060 in.", "status": "open" }
```
- **auto**: applied automatically and logged (e.g. a bracket choice changes text the user never edited).
- **review**: check it (e.g. a decision changes a paragraph the user edited by hand → keep the edit, flag it).
- **decision**: a person must decide (impact on a section not in the book; conflicting answers).
- Shown in the section (gutter marker + list) **and** in the project flag board. Status: open / done / dismissed (with note).

### 5.7 Hand edits

Each rendered paragraph has a stable key (`section/part/article/para`). An edit stores `{ key, text, basedOn: hash of generated text }`. On regenerate: if generated text changed and the paragraph has an edit → keep the edit, raise a **review** flag showing old vs new.

## 6. Screens

1. **Start** — new sketch project, import project file, load sample, open recent (localStorage), export/import JSON.
2. **Import** — paste the text dump and/or drop the project file. Shows recognized facts, keyword hits (accept/reject), unknown keys under *extra*.
3. **Survey** — sections of questions from `survey.json` (scope, repair types, use, code, construction type, sprinklers, energy, AIA contract family and variant, delivery). Pre-filled from import. Every answer shows the drivers it sets.
4. **Sections** — grouped by division; each row: number, title, level badge, reasons (expand), accept/reject/add. Rejected stay visible, struck through, with reason.
5. **Section workspace** — center: questions grouped by Part, then the live draft below or in a split. Right panel: explanation of the focused option, perspectives tabs-as-stacked-panels (+/−), impacts, decision history for this section. Flags in the gutter.
6. **Flags** — project board, filter by level and section.
7. **Decisions** — full log, filter by section/kind/user; export.
8. **Outputs** — PPD (by UniFormat element, from accepted sections' `uniformat`), Outline (paragraphs with `outline: true`), Full (all three parts). Copy / download `.txt` and `.md`. Editor's/decision notes hidden by default, toggle to show.
9. **⚙️ drawer** — user name, theme, show decision notes, show errors, export/import, Supabase status (phase 2).

## 7. Draft rendering (PageFormat)

```
SECTION 07 54 23 - THERMOPLASTIC-POLYOLEFIN (TPO) ROOFING
PART 1 - GENERAL
1.01 SUMMARY
  A. Paragraph text.
     1. Subparagraph.
PART 2 - PRODUCTS
...
END OF SECTION 07 54 23
```
Numbering is computed after conditions are applied, so hidden paragraphs never leave gaps.

## 8. Supabase (phase 2, Architecture project)

- Project: **Architecture** (`<project-ref>`). It registers tables in `public.table_index (table_name, project, purpose)`. Prefix tables `ss_`, register them with project `Shimmy Specs` in the same migration, RLS on, signed-in users only.
- Tables (draft): `ss_templates` (section templates JSON, versioned), `ss_lessons` (lessons tied to a section/question), `ss_projects` (sketch/own projects only; `kind` check constraint rejects anything else).
- Office project data never goes to Supabase. Exports stay on Jimmy's machine.
- Write the SQL in `supabase/001_shimmy_specs.sql`; apply only through `/supabase-project` with Jimmy's OK.

## 9. Done when (MVP acceptance)

- Load sample → survey → sections list shows reasons → open the demo section → answer questions → bracket chips change the draft → an impact raises a flag in the section and on the board → hand-edit a paragraph, change the answer → review flag with old/new → outputs show PPD, outline and full text → export JSON, reload, everything restored.
- `node tools/smoke.js` passes (headless Chromium, no console errors).
- Published on GitHub Pages and opened online.

## 10. Knowledge chapter map (non-overlapping)

Each chapter covers one subject only. Today's five files get split into these (move text, don't add new facts while splitting).

| Ch. | Title | From today's file |
|---|---|---|
| 101 | CSI, CDT and CCS | 101 §1 |
| 102 | The construction documents | 101 §2 |
| 103 | MasterFormat | 101 §3–4 |
| 104 | Writing rules and glossary | 101 §5–6 |
| 201 | SectionFormat: the three parts | 201 §1 |
| 202 | PageFormat | 201 §2 |
| 203 | Methods of specifying | 201 §3 |
| 204 | Section scope and document types | 201 §4–5 |
| 205 | Division 01 as the base | 201 §6, 301 §2 (Division 01 part) |
| 301 | Delivery methods and contracts (AIA families) | 301 §1, §2 (Division 00 part) |
| 302 | UniFormat and the PPD | 301 §3 |
| 303 | Specs through the phases | 301 §4 |
| 304 | Drawings, keynotes and coordination | 301 §5 |
| 305 | Master guides and perspectives | 301 §6 + convo v0.2 A.2 |
| 401 | Code analysis to spec | 401 §1–2 |
| 402 | Products and substitutions | 401 §3 |
| 403 | Delegated design | 401 §4 |
| 404 | Allowances, unit prices, alternates | 401 §5 |
| 405 | Quality assurance and control | 401 §6 |
| 406 | Repair and restoration | 401 §7 |
| 407 | Risk and language | 401 §8 |
| 408 | The decision system | 501 (all) |
| 501 | Template: roofing | new, written together |
| 502 | Template: firestopping | new |
| 503 | Template: joint sealants | new |
| 504 | Template: exterior painting | new |
| 505 | Template: CMU walls | new |
| 506 | Template: ladder fall protection | new |
| 507 | Template: doors and hardware | new |
| — | `base sections.md` stays as the catalog | |

Each 5xx chapter is the human-readable side of `data/sections/<number>.json`: the questions, options and reasons in prose.
