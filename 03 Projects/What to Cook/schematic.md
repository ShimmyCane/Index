# What to Cook — Schematic

**Status:** idea (awaiting answers in `convo/convo v0.1.md`)
**Track:** to confirm. Leaning **A. Family play** (a household tool: few words, big touch targets, secondary options in ⚙️). See `02 Refs/Skills/project_track.md`.
**Database:** Supabase **Family** project (`twvqvutrcobedvuhnzxq`), table prefix `wtc_`, to confirm. Plan in `02 Refs/Skills/supabase_link.md` (paste route).
**Private data:** the pantry, recipes, family photos and transcripts live in Supabase or in `private/`, never committed to this public repo.

## Purpose

A household website that keeps track of what is in the kitchen and pantry, and helps decide what to cook:

1. **Capture.** Turn a spoken or typed observation ("two eggs, half a bag of rice, the milk is nearly gone") into inventory items, review them, and save.
2. **Pantry.** See what is in the fridge, the pantry and the freezer, and what is running low.
3. **Recipe book.** Keep favourite recipes with a photo, cook time, ingredient list and steps.
4. **Plan.** Decide a meal in a pinch (a quick plan, sorted by what is in stock), or plan the whole week on a calendar.
5. **Wish list and shopping.** Mark recipes to try later. Choose which ones to plan, and the app makes a shopping list: the ingredients they need minus what is already in stock.

## Screens (track A: one main action per screen)

| Screen | Main action | Secondary (⚙️ or a collapsed panel) |
|---|---|---|
| Home | "What can I cook?" (quick plan) big button | this week, shopping list count |
| Capture | Record or type an observation, then review the draft items | raw transcript history |
| Pantry | list by place (fridge, pantry, freezer) | add, edit, use up, low-stock threshold |
| Recipes | list of favourites, tap to open | add or edit recipe, filter by cook time |
| Week | calendar, one day tapped to pick a meal | copy last week, clear a day |
| Shopping | list grouped by category, tick to buy | clear ticked, share as text |

## Core rules

- **Quick plan.** Ranks favourite recipes by how many ingredients are in stock, then by cook time (shortest first if the user picks "in a pinch"). Shows the missing items in one line.
- **Week calendar.** Seven days, one dinner slot per day to start (breakfast and lunch later if wanted). A planned meal can be a recipe or a free note ("leftovers").
- **Wish list.** Any recipe can be marked *wish*. Wish recipes are not in the week until planned.
- **Shopping list.** Generated from planned meals and chosen wish recipes: needed quantity minus pantry quantity, merged by ingredient name and unit. Items already ticked stay ticked on regeneration. Manual items can be added.
- **Use up.** Taking an item out of the pantry reduces its quantity. Quantity reaching zero marks it as out, and it moves to the shopping list only if a planned recipe needs it.

## Transcript capture

- **Input:** speech via the browser's speech recognition where it exists (`webkitSpeechRecognition`, as in Adventure), else typed or phone-keyboard dictation. Recording on a phone and pasting the transcript is also supported.
- **Parsing, MVP:** rule-based on the device. Split on commas, "and", and new lines. Read numbers and common units ("two", "half a", "400 g"). Guess the place (fridge, pantry, freezer) from keywords, and let the user change it on the review step.
- **Parsing, optional later:** the AI JSON loop (`02 Refs/Skills/ai_json_loop.md`). The page builds a prompt with the transcript and the item schema, Jimmy pastes it into any AI chat, and the reply is validated before anything is saved. No AI key in the browser.
- **Review before save.** Every draft item shows name, quantity, unit and place, with a tick to keep or drop it. Nothing is saved without the tick.
- **Raw transcript kept** (in the database, or in local storage if signed out) so it can be parsed again later.

## Data (draft; finalise with `supabase_link`)

- `wtc_items`: pantry stock (id, name, quantity, unit, place, low_at, updated_at, updated_by)
- `wtc_recipes`: recipe book (id, name, photo_url, cook_minutes, favourite, wish, steps, notes, created_at)
- `wtc_recipe_ingredients`: (recipe_id, name, quantity, unit, sort) — or a JSON column if simpler
- `wtc_plan`: week calendar (date, slot, recipe_id or note)
- `wtc_shopping`: manual and generated items (name, quantity, unit, ticked, source)
- `wtc_transcripts`: raw observations (id, at, text, parsed_count)
- `wtc_notes`: feedback notes, only if they must survive a new device (see Feedback below)

Table names and fields are a draft until the questions in `convo/convo v0.1.md` are answered. Row-level security on: family login only. Photos: Supabase Storage bucket (to confirm) or resized copies kept on the device.

## Settings (⚙️)

Per `02 Refs/Skills/settings_gear.md`, because this app talks to a database:
- Show errors (opt-in, at the bottom of the page)
- Database check (each table reported)
- Sign in (family login); "this device only" when signed out, not an error on every load
- Units: metric or US
- Shopping categories order
- Notes for improvement (feedback, below)

## Offline-first

Live database (8 s timeout) → last good copy in local storage → empty state with a "Load" button. Personal data has no bundled sample file, except an optional demo set in `data/` with made-up items.

## Feedback notes (planned in the first increment)

Per `02 Refs/Skills/feedback_notes.md`:
- A "Notes for improvement" box in ⚙️, saved with the screen and the item on it (for example, "Recipes · Lentil soup").
- Read back in the same panel; open and done filter.
- Device first (one local storage key, `wtc.notes`). A `wtc_notes` table only when notes must persist across devices.
- Never sent anywhere else.

## Increments (proposed)

1. **MVP-1 (recipe book).** Add and edit recipes: name, photo, cook time, favourite, ingredients, steps. Pantry added by hand. Feedback box in ⚙️.
2. **MVP-2 (pantry and capture).** Pantry list by place, use-up, low stock. Transcript capture with rule-based parsing and review step.
3. **MVP-3 (planning).** Quick plan ("What can I cook?") and the week calendar.
4. **MVP-4 (wish list and shopping).** Wish flag, shopping list generated from the plan and wish recipes, tick and clear.
5. **MVP-5 (database).** Family sign-in, tables applied by paste, database check, sync to other devices.

Each step is smoke-tested (`02 Refs/Skills/smoke_test.md`) before it is called working.

## Open questions

See `convo/convo v0.1.md`. The main ones: track, which database, photo storage, the voice route, units and categories, and who uses it.
