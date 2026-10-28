# Shimmy Specs — Lessons

1. **Master guide specs and CSI lists are copyrighted.** In a public repo, write question sets and explanations in our own words, keep only common section numbers and titles, and put any licensed text in `private/`. _(start, 2026-10-28)_
2. **Construction type doesn't remove a division outright.** Type I/II buildings still use some wood (blocking, nailers, FRT where allowed), so the recommender should say "unlikely, keep 06 10 53 if…" rather than drop Division 06. _(start, 2026-10-28)_
3. **The decision unit is the bracket choice.** Jimmy's ".03 / .06 / .09" were bracketed options inside a paragraph (material, thickness), not article or section numbers. Model decisions at `section › paragraph › [choice]`. _(convo v0.2)_
4. **Guide specs come with a point of view.** Master guide, manufacturer, performance and contractor perspectives differ; show them side by side when explaining an option. _(convo v0.2)_
5. **The Architecture Supabase project uses `table_index`, not `app_table_registry`.** Register new tables there (table_name, project, purpose). _(2026-10-28)_
6. **Load order breaks shared namespaces.** A file that copies `SS.ui` at load time sees `undefined` if it loads before the file that creates it. Create the shared object in every file that uses it (`SS.ui = SS.ui || {}`). Caught by the browser smoke run, not by the Node tests. _(Haiku build, 2026-10-28)_
7. **Check both kinds of impact.** Impacts can sit on an option or on its question. Reading only one dropped flags silently; a test caught it. _(Haiku build)_
8. **Hash routes carry percent-encoded spaces.** `#/section/07 54 23` arrives as `%20`; decode it in the router. _(Haiku build)_
9. **Keep a fallback data bundle for file://.** `fetch` fails from `file://`; a generated script with the same data lets the app run from a double-click, and a validator fails if the bundle is stale. _(Haiku build)_
