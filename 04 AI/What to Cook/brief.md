# What to Cook — AI Brief

**Updated:** 2026-11-07 (consolidated after the notes and food-list round)
**Status:** Version 0.4.0. Pantry is saved to the Family database (sign-in works; pantry rows reach `wtc_items`). Notes reach `wtc_notes`. Food list page (`foods.html`, linked from Settings → Pages) saves to `wtc_foods`. Both new paste files are written but not yet pasted into the live database.

## Goal

A family kitchen tool: stock from memos, typed lists and (later) photos; tells the family what to use up first; predicts what is left of things eaten over time; keeps a food list with fridge life; later a recipe book with trial outcomes and family tastes, a food log per member with calories, planning, and a shopping list. Later, a family food journal (name to confirm).

## Architecture (current)

- Plain HTML/CSS/JS, no build. Pages: `index.html` (pantry, add, settings), `foods.html` (food list), `style.css`.
- Scripts: `js/parse.js` (pure, offline transcript parser), `js/app.js` (pantry UI, device storage, sync), `js/db.js` (family database client: sign-in, select, insert, patch, count, timeouts, plain-words errors), `js/config.js` (URL and publishable key only).
- Device storage keys `wtc.*` (items, checkins, transcripts, members, notes, foods, showErrors, session), each read and written in try/catch.
- Database, Family project (`twvqvutrcobedvuhnzxq`), all tables `wtc_*`, RLS on, anon revoked, signed-in policy, registered to app `what-to-cook`:
  - Applied (from `supabase/what_to_cook_setup.sql`): `wtc_items`, `wtc_checkins`, `wtc_recipes`, `wtc_recipe_ingredients`, `wtc_recipe_trials`, `wtc_taste_votes`, `wtc_food_log`, `wtc_plan`, `wtc_shopping`, `wtc_transcripts`, `wtc_photos`.
  - Applied by Jimmy (2026-11-07, verified by a read-only query): `wtc_notes`. Four rows, all status `done`.
  - Written, not yet applied: `wtc_foods` (`supabase/foods_what_to_cook.sql`). Its check should show rls_on true, policies 1, anon_grants 0, registered 1.
- Duplicate rule (pantry): a partial unique index `wtc_items_stock_key` on (lower(name), coalesce(expires_on, 1900-01-01), stored_location) where status = 'in_stock'. Same key overwrites; a new expiry date is a new line.
- Duplicate rule (food list): a partial unique index `wtc_foods_name_location_key` on (lower(name), location) where name is not blank. Same food in the same place is one row.
- Notes: the Notes log writes to the device first and then to `wtc_notes` on sync (when signed in). Notes marked done are kept, not deleted (status `done`, text prefixed `Done- `).
- Predicted index: remaining = quantity at `counted_on` − `daily_rate` × days since. Feedback (ate more / about right / ate less) resets the count to the guess and moves the rate by ×1.25 / ×1 / ×0.8.
- Fridge life (planned, not built): an item's fridge days come from the food list when it goes in. The stamp is a later build.

## Verified vs. unverified

- Verified by Jimmy on the live Family project: sign-in works; pantry rows reach `wtc_items` (four rows seen).
- Verified: `wtc_notes` exists with RLS on, one policy, no anon grants, registered; the four notes arrived from the device with the right times.
- Verified (headless Chromium, 390 px and 820 px): `foods.html` loads with zero JS errors, the place tabs filter the list, and there is no horizontal scroll after the tabs were allowed to wrap. Scratch scripts, not committed.
- Verified earlier (headless, 390 px): 19 pantry-flow checks; the parser on sample lines.
- Not verified: `foods_what_to_cook.sql` not applied; no test of saving a food to the live database; no real phone or touch; no real speech; no check of the Notes log saving a new note after the sync.

## Open decisions and questions

- Convo v0.6 records Jimmy's answers to v0.5: fridge life via a master list (answer 1a), a separate Food list page from Settings (2), places as tabs (3), Q4 skipped, done items ignored not deleted (5).
- The "a few other things not built" note (6 Nov 23:44) is unnamed and was skipped.
- Merge of tables (`wtc_recipe_ingredients` into recipes, and similar) was raised, not decided. Renaming tables was declined: it would break the live data.

## Next steps

1. Jimmy pastes `supabase/foods_what_to_cook.sql` into the Family SQL editor and sends back the one-row check.
2. Jimmy adds a food on the Food list page, signed in, and confirms it appears in `wtc_foods` (test a save before building on it).
3. Auto-stamp: when a pantry item goes in, set its fridge days and expiry from the food list. Later build; after the list has entries.
4. Photo route: Claude writes rows straight to `wtc_items` (upsert on the conflict key).
5. Recipe book with photo, trials and tastes (MVP-2). Food log with calories per member (MVP-3); decide owner-only first.
6. Open: the unnamed "other things" note; whether to merge any `wtc_` tables.
