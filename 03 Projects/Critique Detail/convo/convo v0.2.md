# Critique Detail — convo v0.2 (2026-11-14)

## Jimmy's answers to v0.1 (as written), and what was done

1. Real details in the database: **yes.** "They will be using details from both detail library cloud and quick detail cloud, as well as its own (dc_)."
   Done: `source_kind` now allows `office`, `quick_detail` and `library`, with a `source_ref` back to the source. The page lists the Quick Detail cloud when signed in.
2. Model and key: **"No AI for this, AI only access backend."**
   Done: the script and the page call no AI service. A review is one JSON file written by Claude in a session (or a person); see `reviewer.md`.
3. Step 1: **"Yes, there should be a hard gate. If it's slop, reject and call it out!"**
   Done: a rejected drawing gets its reasons, a REJECTED stamp and no audit. `inputs/detail_slop.png` shows it.
4. New rulebooks: **active; "I will refine."** "Develop for all major CSI relevant to architectural details, some could be stubs. I expect to have subcategories too (sort by CSI)."
   Done: 57 detail types in 11 divisions, each with a CSI section and subcategory; 22 written, 35 stubs.
5. My rulebooks: **"I will augment."**
6. Library: **"All working details to be local, with option to save to cloud. Don't reference private buckets; when ready they will be sent to cloud as well, so can be linked directly from there."**
   Done: no reference points to a private file or bucket. The page has "Save this detail to the cloud". The library indexes are empty until cloud details exist.
7. Sign-in: **keep signed in.** Done.
8. Review from the page: **"Static page, I guess no review then, just the results."** Done.
9. Defaults: **"There should be a setting link for defaults, populated from the JSON input or 2025 California Building Code."** Done: ⚙️ → Project defaults.

From the website: **right panel scrolls to the finding** (done; the right column scrolls on its own), and **little pictures of good details** (done for the parapet rulebook, drawn as a synthetic correct detail).

"I'm trying to create a lean proof approach for details. Any other suggestions? Create them, toggleable from the settings button to evaluate." Done, five ideas under ⚙️ → Ideas to evaluate: verdict line, proof ledger, control layer trace, good detail pictures, one finding at a time.

## Questions

1. **Detail library cloud.** I found Quick Detail (`sketch_details`, 48 rows) and our own `dc_` tables in the Architecture database, but no table or bucket for a detail library. Where does it live, or is it still to come?

   Answer:

2. **"Lean proof".** I read it as: a detail is proven when each requirement is shown on the drawing and someone can point to the place. Is that what you meant, or something closer to a formal proof (requirements written as rules a program can check from the drawing's data, for example Quick Detail's `items`)?

   Answer:

3. **Quick Detail data.** Its details carry structured `items` as well as a picture. Should a review read those items (layers, materials, order) and not only the image? That would make checks like "the membrane laps over the flashing" something the script can test.

   Answer:

4. **First real reviews.** May I review a few Quick Detail details in a session and save the results to `dc_` (after the owner row and file 002 are in)? Which ones first?

   Answer:

5. **Good-detail pictures.** For now they are synthetic drawings in the repo. Once good details are in the cloud, should the pictures come from those (owner sign-in needed to see them), with the synthetic ones as the fallback?

   Answer:

6. **California defaults.** I set the 2025 California Building Code, Energy Code, Chapter 11B and CALGreen, climate zone 3 and seismic design category D as the sample's values. Which climate zone and other values should be the standing defaults?

   Answer:
