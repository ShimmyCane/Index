# Felix Continents — lessons

- 2026-11-24: A globe that changes its layout (a time bar appears under it) needs a ResizeObserver on its container. A window resize listener alone leaves the canvas stretched.
- 2026-11-24: Turn the globe to face the land of the moment you show. A fixed start view showed Pangaea as ocean.
- 2026-11-24: Auto-spin hides the moment you are testing. Switch it off in headless tests.
- 2026-11-24: The sandbox cannot reach cdnjs or unpkg. To test, serve the same three.js build from npm (`npm pack three@<version>`) and route the CDN URL to it in Playwright. Keep the test scripts outside the repo.
- 2026-11-24: Plate outlines and past positions are hand sketches until a source and licence are chosen. The page says so in About, and the convo records it.
