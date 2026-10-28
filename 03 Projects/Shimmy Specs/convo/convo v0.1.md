# Shimmy Specs — Convo v0.1

**Project:** Shimmy Specs
**Round:** 1 of clarifying questions (started by `/start-project`)

Answer inline under each number. Leave a question blank if you don't know yet. Keep real project names, clients and addresses out of this file (public repo).

## What you said (summary)

- You've written plenty of specs. You want to learn by building the **process** of writing one, not another spec.
- Tie it to the project: project summary + code analysis (maybe from another repo), keynotes, PPD → which sections, and what goes in each.
- Each section gets its own schematic of questions before a three-part draft is generated.
- Every decision is recorded with its alternatives; hovering explains an option; a right-side panel shows impacts on other sections, including ones not yet written.
- A web app for now, with simple text editing. Formatting later.
- Right now: "I want to see everything and I want to be methodical." Several tiers of guidance later.
- Background first: a `knowledge/` folder from Specs 101 to 501, CSI/CDT/CCS language, MasterFormat, SectionFormat, PageFormat, base sections.

## A. Terms (to be sure I read you right)

1. **"PPD system":** I read this as CSI's **Preliminary Project Description** (organized by UniFormat, written at schematic design, then grown into outline and full specs). Is that right, or did you mean something else (a firm system, the *Project Delivery Practice Guide*)?
2. **"ST" / "summary guide" and "outline modes":** which product did you mean? My guesses: **SpecText** (CSI-origin, now Deltek), **AIA MasterSpec** (full-length, short-form and outline versions, with evaluations and editor's notes), or **BSD SpecLink**. Which do you use day to day?
3. Which **MasterFormat edition** do your projects follow (2016, 2018, 2020 or later)? And do your clients ever still use the old 16-division format?

## B. Your work

4. Roughly what share of your work is **repair / restoration / alteration** vs. new construction? Which repair types come up most (façade/masonry, roofing, windows, concrete, waterproofing, interiors)?
5. Is there a **local façade program** that drives your work (for example a periodic façade inspection law)? Name the program only, not the city if you'd rather not.
6. Which **institutional or owner guide specs** do you work under, and how do they arrive (Word files, PDFs, a web portal)? How do you usually add your own items to them?
7. Do you write the **whole book** (Divisions 00–49) or mainly architectural sections, with engineers supplying 20s–40s?
8. Which **front-end** documents do your projects use (AIA A201, EJCDC, ConsensusDocs, an owner's own)? Should the app touch Division 00 at all in the MVP?

## C. Project input

9. Where does the project summary and code analysis come from now? A drawing sheet (G-series code sheet), a Word narrative, a spreadsheet, "another repo"? If another repo, which one, and can I see it?
10. **Keynotes:** do you keep a keynote legend keyed to MasterFormat numbers (e.g. `04 22 00.A1`)? Revit keynote file (tab-delimited `.txt`), a sheet, or a list? A synthetic sample would help a lot.
11. Which first approach to project input do you want? (pick one or rank)
    - a) Fill in a project form by hand (fastest to build).
    - b) Paste the keynote legend and the code analysis text; the app sorts it.
    - c) Import the Revit keynote file / sheet index.
    - d) Read a PDF drawing set (hardest; later).
12. Should the app produce a **PPD** and **outline spec** as early outputs, or start straight at full three-part sections?

## D. Section schematics and decisions

13. For the **first one to three sections** to build deeply, my suggestion fits repair work: `04 01 20 Maintenance of Unit Masonry`, `07 92 00 Joint Sealants`, `01 35 16 Alteration Project Procedures`. Change or confirm.
14. In your example "we chose `.06`, other options were `.03` and `.09`": were those **article/paragraph numbers**, **Level 4 section numbers**, or **option numbers** in a master guide? I want the decision record to point at the right thing.
15. Who else should a decision record name? (you, the consultant, the owner, the code official). Should it hold **sources** (code section, standard, manufacturer data, a test report)?
16. When the app says a decision **impacts** another section, what should happen? (a) just a note, (b) a to-do on that section, (c) automatically add or change text there.
17. When you edit generated text by hand, should the app **keep your edit** when the decision behind it changes, or flag it for review?

## E. Knowledge base

18. Please skim `knowledge/101` to `501` and `base sections.md`. Is the split by level right? What's missing for where you are (about six months in)?
19. Are you studying for **CDT or CCS**? If yes, should the knowledge files follow the exam's body of knowledge and add practice questions?
20. Do you have CSI publications (Practice Guides, MasterFormat, SectionFormat/PageFormat) to check the **(verify)** marks? I can't read those books from here.

## F. Tool and look

21. Look and feel: this is a work tool, not a kids' game. Keep the pastel kid style, or use a calm, document-like look (paper white, one accent color, clear type)? Keep ⚙️ lower right and errors at the bottom?
22. Device: desktop browser first (big screen, three columns), or iPad too?
23. **Saving:** browser storage + export to a JSON file is the default so real projects never go in this public repo. OK? Is a `private/` folder in this project enough for any real samples you add?
24. **AI help:** should the MVP call Claude to draft text or explain options? That needs an API key, which can't sit in a public static page. Options: no AI in the MVP; you paste a key into ⚙️ that stays in your browser; or drafting happens here in Claude Code and is saved into the section library.
25. **Copyright:** master guide text (MasterSpec, SpecText, institutional specs) can't be committed to this public repo. OK to build our own question sets and option explanations in our own words, and keep any licensed text in `private/`?

## G. MVP

26. What is the smallest version worth using? My suggestion: one synthetic repair project → section list with reasons → one fully built section schematic → three-part draft → impacts panel → JSON export. Agree?
27. Anything that should never happen in this tool?

---

_Answers go in `convo/convo v0.2.md` once this round is complete (or answer inline here and I'll start v0.2 for the next round)._
