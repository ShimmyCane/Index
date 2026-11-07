# What to Cook — To do

One current list (consolidated 2026-11-07). The history lives in the convo files; `convo/convo v0.5.md` to `v0.8.md` hold the decisions. Notes are marked done only after Jimmy confirms (`02 Refs/Skills/read_notes_and_update.md`).

## Waiting on Jimmy (paste, check, decide)

- [ ] **Paste `supabase/what_to_cook_MVP.sql`** into the Family SQL editor. Expect three table rows (rls_on true, policies 1, anon_grants 0, registered 1) and column count 2. This includes the food list table, so `foods_what_to_cook.sql` is not needed.
- [ ] **Paste `supabase/wtc_items_tracking.sql`** (PR #121). Expect column_exists 1 and check_exists 1. Then say so, and eggs and bread move to the low list.
- [ ] **Paste `supabase/recipes_what_to_cook.sql`** after the MVP file (recipe versions and pantry links). Expect dish_column_count 2 and food_column 1.
- [ ] **Merge the drafts** when ready: PR #121 (tracking priority), PR #122 (pantry follow-ups), PR #124 (recipe book, with the explore page), PR #116 (nursery task tracker). Say "merge" for each.
- [ ] **Test the recipe book** on a phone or iPad (Settings → Pages → Recipe book): the flip, the filters, and whether the starter recipes fit the family.
- [ ] **Recipe book questions** (convo v0.8): should Athena and Felix edit recipes and add scores, or only read and tap a score? Which small logo for each person? Show me a flip-card example you like.
- [ ] **Choose the first cuisines** to start from the cuisine library, and move them to "in the book".
- [ ] **Food journal** (convo v0.3, questions 4–8): app name, cuisine list or free tags, restaurant fields, brand links to pantry items, kids' access.
- [ ] **Owner-only calorie log:** decide first. It needs `04 AI/Supabase/platform_owner.sql` pasted before any owner-only rule.
- [ ] **Freezer: full look.** Older chicken breasts may be there from earlier trips. Five bags were logged from today's memo.
- [ ] **Storage next to the stove:** not listed yet.
- [ ] **Cabinet over the counter:** to go through later.
- [ ] **Water filter:** replacement not done.
- [ ] **Expiry dates marked "?":** check them against the packages, starting with "use soon" and "use now" items.
- [ ] **Chia seeds:** the bag does not close; move them to a sealed container.
- [ ] **Anchovies (dried):** no use yet. Ask for ideas later.
- [ ] **Orange juice:** take it to the soccer game (expires 8 November, estimated).
- [ ] **Milk:** the lactose-free split is not recorded. Tell me the split if you want it added.
- [ ] **Left out of the database:** "Casey's mom" and "123-4567 wines" (unclear in the memos).

## Claude to build (once the above is pasted or decided)

- [ ] **Fridge life on entry:** stamp the date and fridge days when an item goes in, using the food list (convo v0.5, Q1 and Q2 answered in v0.6).
- [ ] **Priority ordering:** show "priority" items first, ordered by how often they are used; keep "low" items on a lower list (eggs and bread are on it).
- [ ] **Recipe book, database:** save favourites and starts in the database; show dishes with their versions; scrapbook cards with the family's versions.
- [ ] **Recipe back:** steps on the back of a card once a recipe is started.
- [ ] **Pantry links:** ingredients link to foods (`food_id`) so "have it" uses the database, not the device copy.
- [ ] **Cuisine library:** decide whether it moves into the database (`wtc_cuisines`) or stays a file.
- [ ] **Kitchen button:** not built. Places cover it for now (decided in convo v0.6).

## Done (2026-11-07)

- [x] Pantry saves to the Family database; sign-in works.
- [x] Notes save to the database, and done notes show ✅ in the Notes log (0.5.0).
- [x] To-do panel in Settings with ✅ and ⬜ (0.5.0).
- [x] Food list page (`foods.html`), with places (fridge, pantry, freezer, other), fridge days and notes. Linked from Settings → Pages (0.4.0).
- [x] Dark-mode text fix: white panels keep dark text (PR #117).
- [x] Nursery home page links to What to Cook; `CLAUDE.md` allows `index.html` changes when Jimmy asks (PR #123).
- [x] Recipe book, explore: 50 starter cards, filters, start and favourite buttons, search for versions (0.6.0, on PR #124).
- [x] Cuisine library: 66 cuisines and cooking styles (`cuisine_library.json`).
- [x] Pantry entered from four memos (wet, dry, cold and cabinet stock), with expiry estimates marked "?".
- [x] Notes round answered and closed (convo v0.6). Done notes ignored, not deleted.
