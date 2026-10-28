# Shimmy Specs — Convo v0.2

**Project:** Shimmy Specs
**Round:** answers to convo v0.1 (given as PR #21 review comments, 2026-10-28), plus Claude's reading of each

## A. Terms

- **1. PPD:** yes, CSI's Preliminary Project Description.
- **2. "ST" / master guides:** MasterSpec has guidance for each of its sections. Manufacturers publish their own guide specs to steer you to their products. Architects may write performance specs. Contractors have their own view on how things get done. → *Reading:* the app should show these **perspectives** side by side (master guide / manufacturer / performance / contractor) when it explains an option.
- **3. MasterFormat edition:** latest.

## B. Your work

- **4. Repair mix:** the app should handle all of them; ask it in the **project survey** instead.
- **5. Façade program:** ignore.
- **6. Owner guide specs:** ignore for now.
- **7. Scope of the book:** architectural only, Division 02 up to the late teens (with Division 01 as the base).
- **8. Front end:** contracts and the owner–contractor–architect relationships are a big to-do for Jimmy too. Assume typical AIA contracts; pick the variant up front in the project survey.

## C. Project input

- **9. Summary and code analysis:** a file made by another repository, not built yet. Use placeholders. Import it. Free-flowing: not every key will have a value, and it gets refined through conversations like this one.
- **10. Keynotes:** depends on the situation.
- **11. Input approach:** a text dump, plus recommendations ("here are the five options in this part of the spec; we think it's this because of X, Y, Z"). The MVP may not use AI yet, so it takes the classical approach: questions are asked, and the answers switch things on and off.
- **12. PPD and outline spec as early outputs:** yes, absolutely.

## D. Section schematics and decisions

- **13. First sections, in order:** roofing → firestopping → joint sealants → exterior painting → CMU wall → ladder fall protection → doors and hardware. (Kept as a subsection in `todo.md`.)
- **14. ".06 / .03 / .09":** options in **brackets** inside a paragraph, e.g. a material choice or a finish thickness.
- **15. Who decided:** yes. Every decision is tracked by user, with a description or reasoning.
- **16. Impacts:** a flag inside the affected section *and* a flag in the project overall.
- **17. Hand edits vs. regenerated text:** expect many review flags. Use levels/colors: small things change automatically, larger decisions need a closer review.

## E. Knowledge base

- **18. Structure:** files shouldn't cover the same thing. Treat them like chapters: 101, 102…, 301, 302, 303…, with 500s going deep on specifics. The **500s may be the actual template specs** we work on together.
- **19. CCS:** Jimmy is studying for the CCS. Practice questions could help, but mainly this is a gathering place for files we agree on.
- **20. CSI books:** Jimmy has some but is cautious about IP overlap; prefers to do the legwork together and arrive at our own solutions.

## F. Tool and look

- **21. Look:** professional, the adult "Jimmy tools" kind. Legible; graphics still matter; color used sparingly, for high-level wayfinding (sections, parts, flags).
- **22. Device:** mainly desktop.
- **23. Saving:** use the **Architecture** Supabase project. Files may also be written into the local project folder. Once grown, Jimmy moves it out of the nursery into its own repo.
- **24. AI:** the project will need AI eventually. The MVP is statically driven. Anything that needs or would benefit from AI goes in its own section of `todo.md`.
- **25. Copyright:** agreed. No copying. Core knowledge stays true; applied knowledge needs revisiting now as things change fast.

## G. MVP

- **26. MVP:** an MVP of the **framework**, not of one section. Then we write a spec from the to-do list together, publish it, and check it online.
- **27. What should never happen:** no proprietary information. Questions and possible solution sets are fine; they are the core of specifying. When Jimmy talks about an old project, only the **lesson** goes in the repo, never anything about that project. AI conversations are fine, but nothing project-specific is committed to text, scripts, GitHub or Supabase. Exception: a project we work on together that is Jimmy's own (not an office project), or a temporary sketch/draft project to test things.
  - Also: ask "what should never happen?" in future projects (added to `04 AI/lessons_pool.md`).

## Claude's follow-up decisions (from these answers)

- MVP plan: `mvp schematic.md`. Task list for a Haiku session to build it: `mvp tasks.md`.
- The decision record points at a **bracket option** (`section › article › paragraph › [choice]`).
- Flags have three levels: **auto** (applied, logged), **review** (check it), **decision** (needs a person).
- Supabase: Architecture project, tables prefixed `ss_`, registered in its `table_index`. Only shared library content, lessons and sketch projects go there; never office project data.
- Knowledge restructured into non-overlapping chapters (see the chapter map in `mvp schematic.md`); 500s hold the template specs.

## Open for v0.3

1. **Roofing first:** which system? (TPO, modified bitumen, EPDM, PVC, metal, shingles, or a re-roof over existing). Re-roof or new?
2. **Ladder fall protection:** fixed ladder with a cage or a ladder safety system, roof-hatch safety posts, guardrails, anchors? It can sit in Division 05 (metal ladders) or Division 11 (fall protection) depending on scope.
3. **Doors and hardware:** one section for both, or the usual pair (`08 11 13` hollow metal + `08 71 00` hardware)?
4. **The import file** from the other repo: what's its working name, and which repo will make it? A one-line guess at the main keys helps the placeholder.
5. **Users:** for "tracked by user", is a typed name in ⚙️ enough for the MVP, or Supabase sign-in from the start?
