# What to Cook — Schematic

**Status:** MVP-2 in progress (pantry, capture, swipe check-ins built on the device; database SQL written, not applied).
**Track:** A. Family play (household tool: few words, big touch targets, secondary options in ⚙️). See `02 Refs/Skills/project_track.md`.
**Database:** Supabase **Family** project (`twvqvutrcobedvuhnzxq`), tables `wtc_*`, RLS on, anon revoked. SQL in `supabase/` (`test_001`, `001`, `verify_001`). Not applied yet; applied by Jimmy pasting the SQL.
**Private data:** pantry, recipes, photos, transcripts and calories live in Supabase or on the device, never in this public repo.
**Decisions:** `convo/convo v0.2.md`.

## Purpose

A family kitchen tool that knows what is in the fridge, pantry, freezer, the tools and the space, learns what the family likes, and helps decide what to cook.

## Four input routes, one review step

Every route produces the same draft items, shown on the review screen with a tick per item. Nothing is saved without the tick.

| Route | How it works | Status |
|---|---|---|
| Raw transcript | Type or speak; the page sorts it on the device with rules (`js/parse.js`) | built |
| Speech | Browser speech recognition where supported, else keyboard dictation | built |
| Claude-sorted transcript | Paste the transcript into Claude; paste back a JSON list (AI JSON loop) | planned |
| Claude photo | Photo of the shelf, Claude returns the same JSON list | planned |
| AI transcript review | Claude checks the rule-based draft and suggests fixes before save | planned |

## The item model (`wtc_items`)

One row per stock lot. Fields: name, kind (dry / wet / tool / space), category, subcategory, quality (new / good / fair / poor / unknown), quantity and unit, servings remaining, expiry date, freshness (fresh / use soon / use now / past / unknown), stored location, purchase cost, notes, status (in stock / eaten / tossed / used up), source (which input route), raw text.

## Swipe check-ins (`wtc_checkins`)

On the pantry screen each card can be swiped right (ate), left (tossed), or tapped for Keep. A check-in is recorded with who checked (a family member), the time, and the action. The item's status changes for ate and tossed. This is the occasional check: it keeps stock true without a separate stock-take.

## Recipes and tastes

- `wtc_recipes`: name, photo path, cook time, servings, favourite, wish, steps, notes.
- `wtc_recipe_ingredients`: ingredient lines per recipe.
- `wtc_recipe_trials`: each time a recipe is cooked, the outcome (great / good / ok / not again) and notes. This is the "how did it turn out?" record, and what makes "last month you liked X" possible.
- `wtc_taste_votes`: each member's 1–5 score per recipe. Latest vote per member counts.

## Food log (`wtc_food_log`)

Per family member: date, meal, recipe (optional), description, calories (optional). Calories are health data, so the table is family sign-in only, never committed. Calorie totals per member per day or week are computed from this table.

## Planning and shopping (planned)

- `wtc_plan`: one dinner slot per day to start; a recipe or a note.
- `wtc_shopping`: generated from the plan and wish recipes (needed minus pantry), or added by hand. Ticked items stay ticked.
- Quick plan ("What can I cook?") ranks favourites by how many ingredients are in stock, then by cook time.

## Family members

`family_members` is owned by the habits app and read here (names and colours). Member columns in this app are plain uuids with no foreign key, so a change to the family list never touches this app's rows. Until the family sign-in is wired, the page uses a names-only list kept on the device (⚙️ → Family members).

## Settings (⚙️)

Per `02 Refs/Skills/settings_gear.md`:
- Family members (this device, until sign-in)
- Notes for improvement (feedback, saved with the screen it was typed on)
- Show errors (opt-in, at the bottom of the page)
- Database check and sign-in: when the database is wired

## Offline-first

Live database (8 s timeout) → last good copy on the device → empty state. Right now only the device copy exists (local storage keys `wtc.*`). Nothing is bundled as personal data.

## Increments

1. **MVP-1 (done on the device):** pantry list with swipe check-ins; four input routes' first one (raw transcript and speech) with review; feedback notes in ⚙️; errors opt-in.
2. **MVP-2 (next):** Family database applied by paste (`001`), the page wired to it, database check in ⚙️, recipe book with photos, trials and tastes.
3. **MVP-3:** food log per member with calories and daily totals.
4. **MVP-4:** week calendar and quick plan.
5. **MVP-5:** wish list and shopping list generated from the plan.
6. **MVP-6:** Claude-sorted transcript, photo route and AI review, via the JSON loop.

Each increment is smoke-tested (`02 Refs/Skills/smoke_test.md`) before it is called working.

## Verified vs. not verified

- Verified: the parser on sample lines (`js/parse.js`); the page loads at phone and iPad width with zero JavaScript errors and no horizontal scroll; saving a transcript and tapping "Ate" change the list (headless Chromium).
- Verified on the live Family project: the rolled-back test (`test_001`) passes; `family_members` columns and policies were read; no `wtc_` tables exist yet.
- Not verified: the SQL is not applied; the database link is not wired; no real phone or real speech input; no real family sign-in.
