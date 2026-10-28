# Specs 201 — Anatomy of a section

**Level:** section writer
**Written in our own words.** **(verify)** = check the article list against the current *SectionFormat/PageFormat* edition.

## 1. SectionFormat: the three parts

Every section has three parts. Each part holds one kind of information, so a reader always knows where to look.

### Part 1 — General (administrative and procedural)
Typical articles, in order **(verify)**:
1. Summary (what the section covers; related sections; owner-furnished items)
2. Price and Payment Procedures (allowances, unit prices, alternates that touch this section)
3. References (standards cited, with editions, if not in Division 01)
4. Definitions
5. Administrative Requirements (coordination, preinstallation meetings, sequencing, scheduling)
6. Action Submittals (product data, shop drawings, samples)
7. Informational Submittals (certificates, test reports, qualification data, manufacturer's instructions, field reports)
8. Closeout Submittals (maintenance data, warranty documents, record documentation)
9. Maintenance Material Submittals (extra stock)
10. Quality Assurance (qualifications, regulatory requirements, mockups, certifications)
11. Delivery, Storage, and Handling
12. Field (Site) Conditions (weather limits, existing conditions, ambient conditions)
13. Warranty (special warranties beyond the General Conditions)
14. (Commissioning, Maintenance service, as needed)

### Part 2 — Products (what goes in)
1. Owner-Furnished Products
2. Manufacturers (named, with or without substitutions)
3. Description / Systems
4. Performance (or Design) Requirements (including delegated design)
5. Materials
6. Manufactured Units / Equipment / Components / Accessories
7. Mixes (mortar, grout, concrete)
8. Fabrication
9. Finishes
10. Source Quality Control (tests and inspections at the factory)

### Part 3 — Execution (how it's put in on site)
1. Installers
2. Examination (verify conditions are ready)
3. Preparation (protection, surface prep)
4. Installation / Application / Erection (or Repair, Restoration, Reinstallation for existing work)
5. Tolerances
6. Field (Site) Quality Control (tests, inspections, manufacturer's field service)
7. System Startup / Adjusting
8. Cleaning
9. Closeout Activities (demonstration and training)
10. Protection
11. Schedules (e.g. a joint-sealant schedule, a door hardware set list)

**Test of placement:** if it's a procedure or paperwork → Part 1. If it's a thing → Part 2. If it happens at the site → Part 3.

## 2. PageFormat: the look of a page

- **Header/footer:** project name and number, section number and title, page number. Issue date.
- **Numbering:**
  ```
  PART 1 - GENERAL
  1.01 SUMMARY            (article: part number + two digits; some offices use 1.1)
       A. Paragraph
          1. Subparagraph
             a. Subparagraph
                1) Subparagraph
                   a) Subparagraph
  ```
- **End line:** `END OF SECTION 04 01 20`.
- One idea per paragraph. Keep paragraphs short. Avoid going deeper than about three levels.

## 3. Methods of specifying

| Method | You specify… | Good when | Watch out |
|---|---|---|---|
| **Descriptive** | Materials and how they're put together, in detail | No standard covers it; custom work | Long; you own the design risk |
| **Performance** | Results and how they'll be proven (tests, criteria) | Many solutions exist; delegated design | Criteria must be measurable and testable |
| **Reference standard** | Compliance with a published standard | Common materials (ASTM, ANSI, NFPA) | Know what the standard says, including its options; cite editions |
| **Proprietary** | Named products | Matching existing; owner standards; tight control | Competition rules on public work |

**Proprietary variants:**
- **Closed (sole source):** one product, no substitutions.
- **Open:** several named products, plus "or approved substitution" under Division 01 procedures.
- **"Or equal"** without a procedure invites arguments; tie it to `01 25 00 Substitution Procedures`.

Most sections mix methods (e.g. a named manufacturer *and* a reference standard *and* a performance test).

## 4. Section scope

- **Broadscope:** a whole family of work (e.g. `09 30 00 Tiling`). Fewer, longer sections.
- **Mediumscope:** a typical section (e.g. `09 30 13 Ceramic Tiling`).
- **Narrowscope:** one product or a small group (e.g. `07 92 19 Acoustical Joint Sealants` split out of `07 92 00`).
- Choose so that one section matches one trade or one installer where possible, and so that work is not split confusingly.

## 5. Types of specification documents

| Type | Use |
|---|---|
| **Full-length** | Construction documents: all three parts in full |
| **Short-form** | Small projects: same structure, fewer words, more reliance on Division 01 and standards |
| **Outline spec** | Design development: products and key requirements as lists, no procedures |
| **PPD** | Schematic design: by UniFormat element, describes systems and their performance |

## 6. Division 01 is the base

Division 01 states the general rules once (submittals, quality, temporary facilities, product requirements, execution, closeout). Sections in Divisions 02–49 only add what is specific to them and point back to Division 01. If a Part 1 article in a section just repeats Division 01, cut it.

## 7. Practice

- Take one of your issued sections. Tag each paragraph Part 1/2/3; find any that are in the wrong part.
- Rewrite five "Contractor shall…" sentences in imperative or streamlined form.
- For one product, write it four ways: descriptive, performance, reference standard, proprietary.
