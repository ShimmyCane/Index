# Make 3D — Lessons

Appended over time. Promote anything reusable to `04 AI/lessons_pool.md`.

- **Check the page from file:// early.** ES module imports (`<script type="module">`) do not load from `file://`, so Jimmy's double-click use breaks. Use classic scripts, and a UMD build of the library (Three.js r160 `build/three.min.js`). Promoted to the pool.
- **Generate sample files from one operation list and check them by replay.** A test that replays `history.json` and compares it with `model.json` stops the two from drifting. Promoted to the pool.
- **Test shapes with real bulk.** A one-off far spire made the bulk look like outliers, so the first version of the origin test failed for the wrong reason. Give bulk objects real size when testing origin rules.
- **Floating buttons need room in the footer.** The lower-right gear covered the model-check chip. Reserved padding on the footer fixed it.
- **On narrow screens, the view comes first.** On iPad portrait, the panels above the view hid the model. The stage now sits on top, and the panels scroll below.
- **Headless Chromium with WebGL** needs `--no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` with the pre-installed Chromium at `/opt/pw-browsers/chromium`.
- **Use the project's own names for the UI.** "Not applied" and "Accepted with notes" say what happened; "error" is kept for the opt-in area.
