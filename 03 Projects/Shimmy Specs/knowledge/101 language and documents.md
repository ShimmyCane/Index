# Specs 101 — The language and the documents

**Level:** basics (what a CDT candidate must know cold)
**Written in our own words.** Points marked **(verify)** need checking against a current CSI publication.

## 1. Who sets the rules

- **CSI** (Construction Specifications Institute) publishes the formats the US industry uses: **MasterFormat**, **UniFormat**, **SectionFormat / PageFormat**, and the practice guides (*Construction Specifications Practice Guide*, *Project Delivery Practice Guide*). In Canada, **CSC** (Construction Specifications Canada) co-publishes MasterFormat and UniFormat.
- **CDT** (Construction Documents Technology): the entry certificate. It tests the whole life of a project's documents: delivery methods, contracts, drawings and specs, bidding, construction administration, closeout.
- **CCS** (Certified Construction Specifier): built on the CDT. It tests the ability to *write and manage* specifications: choose methods, research products, coordinate, edit masters, manage substitutions and risk.
- Related: **CCCA** (contract administrator), **CCPR** (product representative).

## 2. The construction documents

The **contract documents** are what the owner and contractor sign onto. Typically:

| Part | What it is |
|---|---|
| Agreement | Owner–contractor contract form (e.g. AIA A101) |
| Conditions of the Contract | General Conditions (e.g. AIA A201), Supplementary Conditions |
| Drawings | Graphic: quantity, location, size, relationships |
| Specifications | Written: quality of materials and workmanship, requirements, procedures |
| Addenda (before signing), Modifications (after: change orders, ASIs, construction change directives) | Changes |

**Procurement documents** (invitation, instructions to bidders, bid form) are *not* usually contract documents unless the agreement says so.

The **project manual** is the bound book: procurement and contracting requirements (Division 00) + specifications (Divisions 01–49).

**Drawings vs. specs (the core rule):** drawings show *how much, where, how big, how it fits*; specs say *what quality, what standard, what procedure*. Say each thing once, in the right place. Don't put product names and standards on the drawings; don't describe quantities or locations in the specs.

## 3. MasterFormat (how work is numbered)

- A master list of **numbers and titles** for organizing specs (and cost data, keynotes, filing).
- **50 divisions (00–49)**, some *Reserved for Future Expansion*.
- **Groups and subgroups:**
  - **Procurement and Contracting Requirements Group:** Division 00
  - **Specifications Group:**
    - General Requirements Subgroup: Division 01
    - Facility Construction Subgroup: Divisions 02–19
    - Facility Services Subgroup: Divisions 20–29
    - Site and Infrastructure Subgroup: Divisions 30–39
    - Process Equipment Subgroup: Divisions 40–49
- **Number levels:** `04 22 00` = Level 1 `04` (division) · Level 2 `04 20 00` · Level 3 `04 22 00` · Level 4 adds a decimal: `09 91 23.13`.
- **`xx 01 00` sections** in each division are *Operation and Maintenance of …* (e.g. `04 01 00 Maintenance of Masonry`). Repair work lives here. **`xx 05 00`** are *Common Work Results* (e.g. `04 05 13 Masonry Mortaring`). **`xx 06 00`** are *Schedules* and **`xx 08 00`** *Commissioning* in divisions that use them **(verify per division)**.
- Numbers are fixed; the specifier may add titles in unused numbers but should not reuse a CSI number for something else.
- The old **16-division** format (pre-2004) still shows up in older owner standards. Know how to map it (old 04200 → new 04 20 00).

## 4. Divisions at a glance (common ones)

| Div | Title | | Div | Title |
|---|---|---|---|---|
| 00 | Procurement and Contracting Requirements | | 14 | Conveying Equipment |
| 01 | General Requirements | | 21 | Fire Suppression |
| 02 | Existing Conditions | | 22 | Plumbing |
| 03 | Concrete | | 23 | HVAC |
| 04 | Masonry | | 25 | Integrated Automation |
| 05 | Metals | | 26 | Electrical |
| 06 | Wood, Plastics, and Composites | | 27 | Communications |
| 07 | Thermal and Moisture Protection | | 28 | Electronic Safety and Security |
| 08 | Openings | | 31 | Earthwork |
| 09 | Finishes | | 32 | Exterior Improvements |
| 10 | Specialties | | 33 | Utilities |
| 11 | Equipment | | 34–35 | Transportation; Waterway and Marine |
| 12 | Furnishings | | 40–49 | Process equipment and industry-specific |
| 13 | Special Construction | | | |

## 5. Writing rules (the four Cs and style)

- **Clear, Concise, Correct, Complete.**
- **Imperative mood** for instructions to the contractor: "Install sealant…", not "The Contractor shall install…".
- **Streamlined language** for requirements: "Mortar: ASTM C270, Type N." (colon = "shall be").
- **"Shall"** for the contractor's obligations when indicative mood is needed; **"will"** for the owner's or architect's actions. Never mix them up.
- **Avoid:** "and/or", "etc.", "any", "either", "as necessary", "as required" (unless the requirement is stated), "approved equal" without a procedure, "Contractor shall verify all…", "furnish and install" (use "provide", which the General Conditions or Division 01 define).
- **Defined terms:** use the words the General Conditions define (Owner, Architect, Contractor, Work, Project, provide, install, furnish, indicated, approved) and capitalize them consistently.
- **One requirement in one place.** Repetition causes conflicts.
- **Don't specify the contractor's means and methods** (sequence, crews, equipment) unless the result depends on them; specify the *result*.
- Use numbers for numbers (`2 inches`, `50 percent`), standard abbreviations for standards (`ASTM C270`), and include the edition date in the References article or Division 01.

## 6. Glossary (start)

| Term | Meaning |
|---|---|
| Project manual | The bound volume of procurement/contracting documents and specifications |
| Section | The basic unit of a spec; covers one subject of work |
| Master guide spec | An office or commercial template edited for each project |
| Editor's note | Note to the spec writer in a master; deleted from the issued section |
| Provide | Furnish and install, complete and ready for use |
| Indicated | Shown on the drawings or stated in the specs |
| Submittal | Information the contractor sends for review: product data, shop drawings, samples, etc. |
| Action submittal | Needs the architect's action (approve, reject) |
| Informational submittal | Received for information only (certificates, test reports) |
| Allowance | A sum or quantity carried in the contract for work not fully defined |
| Unit price | A price per unit for work whose quantity is unknown |
| Alternate | A priced change to the base scope the owner may accept |
| Substitution | A product or method the contractor proposes in place of one specified |
| Mockup | A full-size sample assembly used to set the standard of quality |
| Reference standard | A published standard (ASTM, ANSI, NFPA…) cited instead of writing out requirements |
| PPD | Preliminary Project Description: early written description of the project by UniFormat element |
| Outline spec | Short list-form spec used in design development |
