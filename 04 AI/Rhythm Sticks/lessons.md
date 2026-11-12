# Rhythm Sticks — lessons

- 2026-11-12: Jimmy's first brief was a spoken ramble. Pull out principles, modes and exclusions into `context.md` first, keep personal details (teacher, place, children) out of every committed file, and ask the open questions in a numbered convo with recommended defaults.
- Mention of a living artist's game: record the *interaction mechanic* only, never the visual style (preferences §4b).
- 2026-11-12: Jimmy answered v0.1 inline as review comments. Record the answers verbatim-in-meaning in a new `convo v0.2.md` (never edit v0.1), then fold them into the schematic. "Beads" turned out to mean a beat looper, not a bar of beads, so ask what a visual should *do* before building it.
- 2026-11-12 (build): a hash-only `page.goto` does not reload, so tests that jump between `#mode` URLs silently stay in the old mode. Listen for `hashchange` in the app, and the test also works.
- Crossing a line with `a*b < 0` misses a sample that lands exactly on the line (a drag stepping onto a string's y). Use `(prev < y) !== (now < y)`.
- A palette key that does not exist (`RS.pal.paper`) fails silently on canvas: the old `fillStyle` is kept. Check every colour key when styling.
- Beads: Chromium's fake microphone beeps on its own and fires real onsets; assert `>= n` hits, not `=== n`.
- Panels that start collapsed need opening in a test before `fill` or `click` (Playwright waits for visibility).
- "Home" in a hidden-gear single-page app can mean the app's own start page (reload, new random mode), not the nursery home; ask when the destination is not obvious.
- 2026-11-12: "Remember the microphone permission" is the browser's choice, not the page's. What the page controls is how often it asks: keep one stream per visit where `permissions.query` is unavailable (Safari), release it where the state is `granted`, never retry after a refusal, and give a visible "try again" button. Test with init scripts that wrap or reject `getUserMedia` and count calls.
