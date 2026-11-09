# Voice — Lessons

1. **Open voice models are reachable through npm when HuggingFace is blocked.** Kokoro weights (`kokoro-q8-shards`) and voices (`kokoro-js`) are on npm; `kokoro-onnx` from PyPI runs them. Check npm before saying a model can't be downloaded.
2. **Let the baker own the tokens.** Python and the browser split Chinese differently; store the token list with the timings and render from it.
3. **Keep the source text with the audio** so the page can tell when audio is stale (the bake-cache fingerprint idea, with the text itself as the fingerprint).
4. **Class name clash:** the header used `.top`, and the speed-read tick also used `.top`, which made the tick 32 px wide and moved it off the focus letter. Measure alignment in the smoke test, not by eye.
5. **Grid centring:** `1fr auto 1fr` is not symmetric when the side columns' contents differ; use `minmax(0, 1fr)`.
