# Bake Cache (precomputed results that work from file://)

Purpose
Some results are too slow to compute in the browser (a ten-step physics run took about 40 s). Compute them once with a Node script, store them in a cache file, and load the cache with a `<script>` tag so it works by double-click. Tie the cache to the source with a fingerprint, so a stale cache is never shown.

When to use
- A simulation, generator or set of renders takes more than a few seconds.
- The page must open from `file://` (no server).
- The output is derived from a small source (a story, a recipe, a list of operations).

Input
- The source of truth (the story, the recipe, the operations) and the engine that turns it into results. Name both.

Steps
1. **Separate the record from the output.** The source is the record. The cache and renders are derived; rebuild them, never hand-edit them.
2. **One engine, two runners.** The engine is plain JavaScript with no DOM. The same file runs in Node (for the baker and tests) and in the page.
3. **A fingerprint in the engine.** Write a pure-JavaScript hash (FNV-1a 32-bit over the canonical JSON of the source, plus an engine version number). Do not use `crypto` in the page: it is not available the same way on `file://`. The baker and the page must call the same function.
4. **The baker** (`tools/bake.js`): run the engine on the source, round numbers to a sensible precision (3 decimals is usually enough), and write `data/<name>_cache.js` as:
   `window.<NAME>_CACHE = { fingerprint: "...", frames: [...] };`
5. **The page** loads `data/<name>_cache.js` with a classic `<script>` tag. If `window.<NAME>_CACHE` exists and its fingerprint matches the fingerprint computed from the current source, use it. Otherwise build the results live, one step at a time, with a progress note, and say the cache is not used.
6. **Tests** (`tests/`): the same source gives the same result twice (determinism); changing one item in the source changes the fingerprint; a stale cache is rejected; the cache matches a fresh run.
7. **Size.** Keep the cache small enough to load at once (a few MB at most). If it grows, store the frames as deltas or drop the rarely used detail, and say so in the schematic.
8. **Rebuild after every change** to the source or the engine. Commit the source, the engine and the cache together, so the fingerprint and the file agree.

Rules
- `fetch` fails from `file://`; always use a `<script>` tag for the cache.
- Keep the engine deterministic: seeded random numbers only, no wall-clock time.
- Say in the schematic which steps are cached and which are live, so a reviewer knows what they are looking at.

Lessons this comes from
- Paper Again: a 40 s replay was baked; the page loads the cache from a `<script>` tag and checks the fingerprint of the story (Paper Again lessons 9).
- Shimmy Specs: a generated data bundle works from `file://`, and a validator fails when the bundle is stale.
- Make 3D: the sample files are generated from one operation list, and a replay test checks the history against the saved model.
