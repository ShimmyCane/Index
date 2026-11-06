# What to Cook — AI Brief

**Updated:** 2026-11-06
**Status:** MVP-1 built on the device (pantry, swipe check-ins, transcript capture, feedback notes). Family database SQL written and its test passed on the live project; the SQL is not applied yet.

## Goal

A family kitchen tool: stock from four input routes (photo, Claude-sorted transcript, raw transcript, AI review), occasional swipe check-ins, a recipe book with trial outcomes and family tastes, a food log per member with calories, planning, and a shopping list.

## Architecture

- Plain HTML/CSS/JS, no build: `index.html`, `style.css`, `js/parse.js` (pure, offline parser), `js/app.js` (UI, device storage).
- Local storage keys `wtc.*` (items, checkins, transcripts, members, notes, showErrors), each read and written in try/catch.
- Database (planned): Family project, tables `wtc_items`, `wtc_checkins`, `wtc_recipes`, `wtc_recipe_ingredients`, `wtc_recipe_trials`, `wtc_taste_votes`, `wtc_food_log`, `wtc_plan`, `wtc_shopping`, `wtc_transcripts`. Registered as app `what-to-cook`; `family_members` read as `reads`.
- Speech in: `webkitSpeechRecognition` where present; typed or keyboard dictation otherwise.
- Family policies are signed-in only. Calorie and food-log tables are the first candidates for owner-only (needs `platform_owners` and `platform_is_owner()`, see `04 AI/Supabase/platform_owner.sql`).

## Verified vs. unverified

- Verified: the parser on sample lines (units, halves, "a", "and 400 g", "nearly gone", frozen). The page loads at 390 px and 820 px with zero JS errors and no horizontal scroll, and save and "Ate" work (headless Chromium).
- Verified on the live Family project (read-only plus rolled-back test): no `wtc_` tables yet; registry and `family_members` present; the test block returns `ok_kind=t bad_kind_rejected=t ok_member_row=t`.
- Not verified: `001_what_to_cook.sql` not applied; no database link in the page; no real phone; no real speech; no real family sign-in.

## Next steps

1. Jimmy pastes `test_001` (expect RESULT: all true), then `001`, then `verify_001`, and pastes the verify output back.
2. Wire the page to the database with the publishable key only, and add the database check in ⚙️.
3. Recipe book with photo, trials and tastes (MVP-2).
4. Food log with calories per member (MVP-3); decide owner-only for it first.
5. Answer `convo/convo v0.2.md` questions 10–14.
