# Specs 301 — The project manual, the phases, and the drawings

**Level:** project-level (CDT)
**Written in our own words.** **(verify)** = check against a current CSI publication.

## 1. Project delivery shapes the spec

| Delivery | What changes in the spec |
|---|---|
| **Design-bid-build** | Full, prescriptive book; competition rules on proprietary specs; strong Division 01 |
| **CM at risk** | Bid packages (the book may be split); CM's role in Division 01; early packages (demolition, steel) |
| **Design-build** | Performance-heavy; the owner's criteria document leads; the D-B team writes the construction spec |
| **IPD / alliance** | Shared risk; specs evolve with the team |

Public vs. private owner matters: public work usually limits sole-source specs and needs "or equal" or three named products **(verify per jurisdiction)**.

## 2. Division 00 and Division 01

- **Division 00:** procurement (invitation, instructions to bidders, bid forms, bonds) and contracting (agreement, General Conditions, Supplementary Conditions). Often supplied by the owner or their counsel. The specifier coordinates, doesn't redraft legal terms.
- **Division 01 (General Requirements):** the specifier's rules for the whole project. Key sections:
  - `01 10 00 Summary` (work covered, phasing, owner occupancy, work by owner)
  - `01 21 00 Allowances` · `01 22 00 Unit Prices` · `01 23 00 Alternates`
  - `01 25 00 Substitution Procedures` · `01 26 00 Contract Modification Procedures` · `01 29 00 Payment Procedures`
  - `01 31 00 Project Management and Coordination` · `01 32 00 Construction Progress Documentation` · `01 33 00 Submittal Procedures`
  - `01 35 00 Special Procedures` (e.g. `01 35 16 Alteration Project Procedures`, `01 35 91 Historic Treatment Procedures`)
  - `01 40 00 Quality Requirements` · `01 42 00 References` · `01 43 39 Mockups` **(verify number)** · `01 45 00 Quality Control`
  - `01 50 00 Temporary Facilities and Controls` · `01 60 00 Product Requirements` · `01 73 00 Execution`
  - `01 74 19 Construction Waste Management and Disposal` · `01 77 00 Closeout Procedures` · `01 78 23 Operation and Maintenance Data` · `01 78 39 Project Record Documents` · `01 79 00 Demonstration and Training`
  - `01 91 13 General Commissioning Requirements`
- **The hierarchy:** General Conditions → Supplementary Conditions → Division 01 → technical sections. Each layer adds; none should contradict the one above.

## 3. UniFormat and the PPD

- **UniFormat** organizes a building by **elements** (systems and assemblies) rather than products:
  - **A** Substructure · **B** Shell · **C** Interiors · **D** Services · **E** Equipment and Furnishings · **F** Special Construction and Demolition · **G** Building Sitework · (**Z** General) **(verify letters/titles for current edition)**
  - e.g. `B2010 Exterior Walls`, `B3010 Roof Coverings`, `D3050 Terminal and Package Units`.
- **PPD (Preliminary Project Description):** written at schematic design, by UniFormat element. For each element: what it is, how it must perform, and the likely materials. It supports early cost estimates and records design intent.
- **Why it matters for this app:** a PPD is the bridge from *the project* to *the sections*. Each UniFormat element maps to one or more MasterFormat sections. Example: `B2010 Exterior Walls: brick veneer on CMU backup, cavity insulation, air barrier` → `04 20 00`, `04 05 19` (anchors/reinforcing), `07 21 00`, `07 27 00`, `07 62 00`, `07 92 00`.

## 4. Specs through the phases

| Phase | Document | Detail |
|---|---|---|
| Programming / SD | PPD (UniFormat) | Systems, performance, likely materials |
| DD | Outline spec (MasterFormat) | Section list, products, key standards |
| CD | Full-length or short-form sections | Complete three-part sections |
| Bidding | Addenda | Changes before contract |
| CA | Submittal review, substitutions, RFIs, ASIs, change orders | The spec is tested against reality |
| Closeout | Record documents, O&M | What was built |

A good process carries decisions forward: what was decided in the PPD should show up, unchanged or deliberately changed, in the outline and the CD sections.

## 5. Drawings and specs together

- **Keynotes:** a keynote legend keyed to MasterFormat numbers (`04 22 00.A1 CMU, 8 in.`) ties every drawing note to a section. The National CAD Standard / Uniform Drawing System describe the method **(verify)**. A keynote with no matching section, or a section with no keynote, is a coordination flag.
- **Terminology:** call a thing the same name on drawings and in specs. ("Air barrier" on one, "vapor retarder" on the other is a conflict.)
- **Schedules:** door, finish, hardware and sealant schedules can live on drawings or in Part 3. Pick one home.
- **Order of precedence:** many contracts avoid it on purpose (the documents are complementary). Don't rely on it to fix conflicts.

## 6. Owner guide specs and master specs

- **Commercial masters** (AIA MasterSpec, SpecText, BSD SpecLink) give full sections with editor's notes and evaluations.
- **Institutional guide specs** (universities, agencies, hospitals) layer owner requirements on top: preferred products, warranties, maintenance, campus standards.
- **Office masters:** your edited versions with lessons from past projects.
- Adding your own items is normal. Keep a record of *what* you added and *why*, so the next project inherits the reasoning, not just the words.

## 7. Practice

- Write a one-page PPD for a synthetic small building (A–G).
- Map each PPD element to MasterFormat sections.
- Take a keynote legend and list keynotes with no section and sections with no keynote.
