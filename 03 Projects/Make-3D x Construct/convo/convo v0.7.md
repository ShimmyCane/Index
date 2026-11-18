# Make 3D x Construct — Convo v0.7

**Project:** Make 3D x Construct · **Version:** V2 (V1 is archived in `archive/Oklahoma diorama V1/`, commit `f8d87b8`)
**Round:** 7. Your answers to round 6, then what changed, then what is still open.

## Your answers (round 6)

1. **Faces.** Approximate the phenotype and the general major facial features. Specific research and an artist's reference are overkill for now. Major clothing and pattern are enough for the next step. → Built: eyes, brows, nose, mouth and ears on each figure's face, in a neutral warm skin tone (a judgement to confirm, see below); a banded pattern on the women's skirts; a cloth top and sleeves. No hair detail, no portraits.
2. **Gate.** Not realistic; remove it. → Removed: the header pill, the Display check panel, the gate settings, and the requirement to note a consultation close. The consultation flags remain as notes.
3. **Next density pass.** More realistic meshes, not primitives. Look at references for lighting and for modelling meshes quickly. → Built: a loft type (a smooth surface swept along a spline through its joints, as in Make 3D's skeleton meshes). Horses are now a lofted barrel, neck, head, mane and tail, with lofted legs. The people's torsos, heads, limbs and skirts are lofts too. Lighting: an image-based environment (a soft studio room) plus a key, a fill and a warm sun, with soft shadows.

## Your requests (round 7)

- **Archive V1, then V2, then merge.** V1 is the state of PR #195 (round 6). Archived as a folder (`archive/Oklahoma diorama V1/`, a self-contained copy that opens on its own) and kept in history (commit `f8d87b8`). PR #195 is closed unmerged. V2 is the work on this branch. Merged after review.
- **Cloud database, login, a library and a homepage, as in Make 3D.** Built, with the same publishable-key setup and the same rule: sign-in with an email code to an existing account only, and owner-only table access. See below.

## What changed (V2)

- **Homepage (`index.html`):** the projects (the current diorama, and the archived V1), the library saved on this device, and the cloud library with sign-in.
- **Studio (`studio.html`):** the 3-D app. Its ⚙️ drawer has a *Library* panel: Save to library (on this device), Save to cloud (when signed in). Opening a saved scene from the home page loads it into the studio.
- **Cloud (`js/cloud/cloud.js`):** the same Architecture project as Make 3D. One table, `public.m3dxc_scenes`. The SQL is in `supabase/002_m3dxc_scenes.sql`, **not applied**: you copy it in by hand, as agreed.
- **Library (`js/library/library.js`):** scenes on this device, by model_id, newest first; a blocked browser store gives a message, not a crash.
- **Loft geometry (`js/core/loft.js`):** tested (7 tests); the engine checks loft joints and rings; the build carries the new fields (joints, rings, facing), so a field cannot be lost silently again.
- **Tests:** 9 cloud and library tests (with a fake Supabase, no network), 7 loft tests, and the older 18 model, 14 rounds, 10 review tests, and the sample test. All pass.
- **Browser checks:** the home page loads with no errors; a save in the studio reaches the library and the home page lists it; opening it loads the studio. The review flows still work.

## What I could not do here

- **The cloud sign-in itself.** It needs your email code and a live Supabase session, so I tested it with a fake client only.
- **Applying the SQL.** You copy `002_m3dxc_scenes.sql` by hand; until then the database check says the table is not applied yet.
- **A device test** on an iPad.

## Questions

1. **Skin tone.** I used a neutral warm brown for all figures, as an approximation. Is that the one you want, or should each figure differ?
2. **Lighting references.** You asked me to look at online references for lighting. I used an image-based room light and a warm key. Do you want me to look up specific references next (for example, studio lighting for dioramas), and to write them into the lessons file?
3. **Next density step.** The horses and people are lofted now. Next: the bluff and the lodge cover as lofts (a fold, a stratified bluff), or the travois loads and the harness?
