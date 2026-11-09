# Voice — Lessons

1. **Open voice models are reachable through npm when HuggingFace is blocked.** Kokoro weights (`kokoro-q8-shards`) and voices (`kokoro-js`) are on npm; `kokoro-onnx` from PyPI runs them. Check npm before saying a model can't be downloaded.
2. **Let the baker own the tokens.** Python and the browser split Chinese differently; store the token list with the timings and render from it.
3. **Keep the source text with the audio** so the page can tell when audio is stale (the bake-cache fingerprint idea, with the text itself as the fingerprint).
4. **Class name clash:** the header used `.top`, and the speed-read tick also used `.top`, which made the tick 32 px wide and moved it off the focus letter. Measure alignment in the smoke test, not by eye.
5. **Grid centring:** `1fr auto 1fr` is not symmetric when the side columns' contents differ; use `minmax(0, 1fr)`.
6. **Run in-browser models in a worker.** kokoro-js on the main thread froze the page for more than 30 s while it loaded and spoke. A module worker kept the page responsive; send the Float32Array back as a transferable.
7. **Playwright `route.fulfill` can't carry a 92 MB body** (the DevTools pipe has a 100 MB limit, and the browser closed). Answer with a 302 to a local CORS server instead. `route.continue` can't change http to https.
8. **Test a hosted model without its host:** redirect its URLs to local copies. Mark any file you had to rebuild (here the tokenizer) as unverified.
9. **Script stories:** one line = one paragraph keeps the tokens, timings, highlight and speed read unchanged; speaker labels and notes are extra elements outside the token spans.
10. **Write notes once, show them in every language.** Translations keep the English line order and point at it with `notesFrom`; one set of director's notes serves all versions.
11. **Japanese needs word joining for reading.** Raw fugashi tokens split verb endings (い・まし・た); join particles, auxiliaries, suffixes and closing brackets to the word before, and prefixes and opening brackets to the next.
12. **Accented letters:** use `\p{L}` with the `u` flag for the focus letter and the weights, not `[A-Za-z]` (French and Spanish broke the speed-read split).
13. **Python stdout to a file is block-buffered:** a background bake showed no progress lines until the end. Use `python3 -u` or check the output files.
