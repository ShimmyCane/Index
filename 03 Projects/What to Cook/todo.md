# What to Cook — To do

Items come from the feedback notes in the family database (`wtc_notes`). Notes are marked done only after Jimmy confirms (see `02 Refs/Skills/read_notes_and_update.md`).

## Round 2026-11-07 (from notes read on 2026-11-07)

Status key: **built** (code shows it), **new** (not in code), **question** (needs Jimmy's answer first).

- [x] **Save to the database works for the pantry.** Note from 2026-11-06 23:44 ("I can save to the database at least the pantry"). Confirmed: `wtc_notes` received notes from the device on 2026-11-07, and wtc_items shows the pantry rows.
- [ ] **Fridge life, stamped on entry.** When an item goes into the pantry, stamp the date and estimate how many days it will last in the fridge. (Note 2026-11-06 23:45.) Status: **new**. Question Q1 and Q2 in convo v0.5.
- [ ] **Master list of fridge life.** Keep the estimate in an editable master list, separate from quantities and from whether an item is in the pantry. (Note 2026-11-06 23:45.) Status: **new**. Question Q2 in convo v0.5.
- [ ] **Fridge and kitchen buttons.** In addition to the pantry button, add a fridge button and a kitchen button. Each feeds its items straight into the right groups, such as wet, dry and tools. (Note 2026-11-06 23:46.) Status: **question**. The current app has a place choice (fridge, pantry, freezer, other) and a kind (dry, wet, tool, space) in the database, but no kitchen. Question Q3 in convo v0.5.
- [ ] **Clarify the unbuilt list.** The note from 2026-11-06 23:44 says "a few other things that are not built" but does not name them. Status: **question**. Question Q4 in convo v0.5.
- [ ] **Test note.** "Test note 1 round two" (2026-11-07 00:45) looks like a test, not feedback. Status: **question**. Question Q5 in convo v0.5: leave it open or mark it done.

Notes marked done on 2026-11-07 after Jimmy's confirmation (status done, text prefixed "Done- "). The items above stay open until built or answered.

## Round 2026-11-07, answered in convo v0.6

- [x] Food list page linked from Settings (Pages): `foods.html`, saves to `wtc_foods`. Built, not yet pasted into the database.
- [ ] Paste `supabase/foods_what_to_cook.sql` into the Family SQL editor and send back the one-row check.
- [ ] Auto-stamp fridge days when an item goes in (from the food list). Later build.
- [x] Q3: places tagged and shown by tapping Fridge, Freezer, Pantry or Other.
- [x] Q4 skipped at Jimmy's request.
- [x] Q5: done items are ignored from future review, not deleted.

## Anticipated SQL (look-ahead, 2026-11-07)

All the new tables and columns the to-do list needs are compiled into one file: `supabase/what_to_cook_MVP.sql`. It replaces the separate food-list paste for the live database; `foods_what_to_cook.sql` stays as history and is not needed once the MVP file has run.

- [ ] Paste `supabase/what_to_cook_MVP.sql` into the Family SQL editor. Expect three table rows (rls_on true, policies 1, anon_grants 0, registered 1) and a column count of 2.
- [ ] Not included, decide first: owner-only calorie log. Needs `04 AI/Supabase/platform_owner.sql` pasted first (`platform_owners` does not exist in the Family project yet).
- [ ] Open (convo v0.3 questions 4–8): app name, cuisine list or free tags, restaurant fields, brand links to pantry items, kids' access to the journal. The journal tables are provisional until these are answered.

## Recipe book (convo v0.7, 2026-11-07)

- [x] Answer convo v0.7 questions (answers in convo v0.8). Open: Athena and Felix edit or read; logos; flip-card example.
- [ ] Paste `supabase/recipes_what_to_cook.sql` after `what_to_cook_MVP.sql` (adds `dish`, `version_by`, and the pantry link on ingredients). Expect dish_column_count 2 and food_column 1.
- [ ] Build the recipe list: one dish with its versions, each with its own ingredients, steps, trials and votes. Test headless at phone width.

## Recipe book, explore (2026-11-07)

- [x] `recipes_explore.json`: 50 starter recipes from what the family buys. All "not started".
- [x] `recipes.html`: scrapbook cards that flip, filters (favourites, we have most, use soon, started), start and favourite buttons, and a "see versions" search. Device-only for now (favourites and starts are saved on this device).
- [ ] Test on a real phone or iPad. Check the flip and the filters on the family's own pantry data.
- [ ] Save favourites and starts in the database, once the recipe tables are in use.
- [ ] Add steps to the back of the cards once a recipe is started.

## Cuisine library (2026-11-07)

- [x] `cuisine_library.json`: 66 cuisines and cooking styles, by region (Asian, European, American and Latin American, Middle Eastern and African, Oceania) and by type (desserts, bakery, salads, cooking methods). All "to try".
- [ ] Choose the cuisines to start with, and move them to "in the book" when a first version is added.
- [ ] Decide whether the library lives in the database (a `wtc_cuisines` table) or stays a file, once the recipe book is built.

## Earlier items

See `convo/convo v0.2.md`, `convo v0.3.md` (food journal) and `convo v0.4.md` (pantry behaviour, open items 12–13).
