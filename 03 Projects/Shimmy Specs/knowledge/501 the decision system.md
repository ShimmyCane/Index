# Specs 501 — The decision system

**Level:** mastery, and the reasoning model this app is built on.

A good specifier does not just edit a master. They work through **why** each paragraph is there, **what else** could have been there, and **what it touches**. This file describes that reasoning so the app can teach it.

## 1. Drivers

A **driver** is a project fact that changes the spec. Drivers come from:
- the **project summary** (new / repair / historic, use, occupied, phasing),
- the **code analysis** (construction type, ratings, sprinklers, energy, accessibility),
- the **site and climate** (exposure, freeze-thaw, coastal, seismic, wind),
- the **owner** (guide specs, preferred products, maintenance staff, warranty demands, budget),
- the **design** (keynotes, PPD elements, details),
- the **delivery** (public bidding, CM, design-build).

Every recommendation the app makes should name its drivers.

## 2. The section schematic method

Before writing a section, answer its schematic:

1. **Scope:** what's in, what's out, which related sections share the boundary.
2. **Drivers:** which project facts touch this section.
3. **Method:** how each key requirement is specified (descriptive, performance, standard, proprietary) and why.
4. **Products:** basis of design, acceptable products, substitution rule.
5. **Standards:** which standards, which options inside them.
6. **Part 1 choices:** submittals, qualifications, mockups, field conditions, warranty.
7. **Part 3 choices:** examination, preparation, installation, tolerances, field QC, protection, cleaning.
8. **Existing conditions** (repair work): survey basis, unknowns, unit prices, compatibility.
9. **Coordination:** keynotes, details, schedules, other sections.
10. **Open questions** and who answers them.

Only once the schematic is answered does the draft get written.

## 3. The decision record

Each choice is stored like this:

| Field | Example |
|---|---|
| Section / article | `07 92 00`, 2.02 |
| Question | Which sealant for masonry control joints? |
| Chosen | Silicone, ASTM C920, Type S, Grade NS, Class 50 |
| Alternatives | Polyurethane (Class 25/35); silyl-terminated polyether |
| Why | Joint movement ±50% expected; UV exposure; long life |
| Drivers | exterior-masonry, high-movement |
| Source | ASTM C920; ASTM C1193 (use guide); manufacturer data |
| Impacts | `01 43 39` mockup; `07 92 00` 3.x adhesion testing (ASTM C1521); coating compatibility in `09 91 13`; staining test on stone |
| Decided by / date | Jimmy, 2026-11-02 |
| Confidence | firm / tentative / needs owner input |

The record stays with the section as a hidden note and can be shown, printed for review, or carried into the next project.

## 4. Impacts and dependencies

Decisions ripple. Typical kinds:

- **Requires:** choosing a mockup requires `01 43 39`; a special inspection requires `01 45 33`-type coverage **(verify number)**.
- **Restricts:** Type IIB restricts combustible materials elsewhere; a coating choice restricts sealant chemistry.
- **Duplicates risk:** a warranty stated in a section and in Division 01.
- **Coordinates:** a door rating drives hardware labels, frame anchors, glazing.
- **Not yet in the book:** an impact can point to a section that doesn't exist yet. That's a signal to add it or confirm it's not needed.

## 5. Quality checks a master specifier runs

- Every section in the table of contents exists, and every section that exists is in the table of contents.
- Every cross-reference points to a section in the book.
- Every keynote has a section; every section has a reason to exist.
- Nothing in 02–49 repeats Division 01.
- Every standard cited has an edition (here or in `01 42 00`).
- Every "or equal" is tied to a substitution procedure.
- Every allowance, unit price and alternate appears in both Division 01 and the affected section.
- Every performance requirement has a test or proof.
- Terms match the drawings.

## 6. Learning loop

After each project: what changed in CA (RFIs, substitutions, change orders) points to a spec gap. Write it as a lesson, attach it to the section library entry, and the next project starts better.
