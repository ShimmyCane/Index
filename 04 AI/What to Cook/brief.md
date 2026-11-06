# What to Cook — AI Brief

**Updated:** 2026-11-06
**Status:** MVP-1 on the device, pantry v0.2.0. Family database test passes on the live project (rolled back); the SQL is not applied yet.

## Goal

A family kitchen tool: stock from memos, typed lists and (later) photos, tells the family what to use up first, predicts what is left of things eaten over time, keeps a recipe book with trial outcomes and family tastes, a food log per member with calories, planning, and a shopping list. Later, a family food journal (name to confirm).

## Architecture

- Plain HTML/CSS/JS, no build: `index.html`, `style.css`, `js/parse.js` (pure, offline parser), `js/app.js` (UI and device storage).
- Local storage keys `wtc.*` (items, checkins, transcripts, members, notes, showErrors), each read and written in try/catch.
- Database (planned): Family project, tables `wtc_items`, `wtc_checkins`, `wtc_recipes`, `wtc_recipe_ingredients`, `wtc_recipe_trials`, `wtc_taste_votes`, `wtc_photos`, `wtc_food_log`, `wtc_plan`, `wtc_shopping`, `wtc_transcripts`. Registered as app `what-to-cook`; `family_members` read as `reads`.
- Duplicate rule: a partial unique index `wtc_items_stock_key` on (lower(name), coalesce(expires_on, 1900-01-01), stored_location) where status = 'in_stock'. A write with the same key overwrites (`on conflict ... do update`); a new expiry date is a new line.
- Photo route (planned): Claude reads the photo, builds the JSON rows and writes them straight to the database with the same conflict key. Nothing is pasted by hand.
- Predicted index: remaining = quantity at `counted_on` − `daily_rate` × days since. Feedback (ate more / about right / ate less) resets the count to the guess and moves the rate by ×1.25 / ×1 / ×0.8.
- Family policies are signed-in only. Calorie and food-log tables are the first candidates for owner-only (needs `platform_owners` and `platform_is_owner()`, see `04 AI/Supabase/platform_owner.sql`).

## Verified vs. unverified

- Verified (headless Chromium, 390 px): 19 pantry-flow checks pass with zero JS errors and no horizontal scroll (scratch script, not committed).
- Verified: the parser on sample lines, including "half a bag of rice", "1 tin of chickpeas", "and 400 g mince", "nearly gone", "frozen".
- Verified on the live Family project (rolled back): the test returns `ok_kind=t bad_kind_rejected=t ok_member_row=t dup_overwritten=t new_expiry_is_new_line=t`.
- Not verified: `001_what_to_cook.sql` not applied; no database link in the page; no real phone or touch; no real speech; no real family sign-in.

## Next steps

1. Jimmy pastes `test_001` (expect RESULT with all five true), then `001`, then `verify_001`, and pastes the verify output back.
2. Wire the page to the database with the publishable key only, and add the database check in ⚙️.
3. Photo route: Claude writes the rows straight to `wtc_items` (upsert on the conflict key). Confirm the photo can stay out of the repo.
4. Recipe book with photo, trials and tastes (MVP-2).
5. Food log with calories per member (MVP-3); decide owner-only first.
6. Open questions: convo v0.4 items 12–13 ("Mergr" and the trailing "2-" in Jimmy's message, unclear; rate suggestions from history later).
