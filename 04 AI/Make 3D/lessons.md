# Make 3D — Lessons

Appended over time. Promote anything reusable to `04 AI/lessons_pool.md`.

- **Check the page from file:// early.** ES module imports (`<script type="module">`) do not load from `file://`, so Jimmy's double-click use breaks. Use classic scripts, and a UMD build of the library (Three.js r160 `build/three.min.js`). Promoted to the pool.
- **Generate sample files from one operation list and check them by replay.** A test that replays `history.json` and compares it with `model.json` stops the two from drifting. Promoted to the pool.
- **Test shapes with real bulk.** A one-off far spire made the bulk look like outliers, so the first version of the origin test failed for the wrong reason. Give bulk objects real size when testing origin rules.
- **Floating buttons need room in the footer.** The lower-right gear covered the model-check chip. Reserved padding on the footer fixed it.
- **On narrow screens, the view comes first.** On iPad portrait, the panels above the view hid the model. The stage now sits on top, and the panels scroll below.
- **Headless Chromium with WebGL** needs `--no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` with the pre-installed Chromium at `/opt/pw-browsers/chromium`.
- **Use the project's own names for the UI.** "Not applied" and "Accepted with notes" say what happened; "error" is kept for the opt-in area.

## 2026-11-02: check the picture, not the numbers

- A pass on the numbers is not a pass on the shape. The first bonsai "passed" every test and still looked like a bare line of sticks. Look at each screenshot from at least two angles (default and side) and ask what a real tree of this kind does: taper, lean, apex above the crown, branches that arch up, not flat arms.
- Dimensions that look fine on paper can clash in 3-D (a pole through a table top). Run the clash check (`js/core/clash.js`) after every scene change.
- "Sparse" in a user's description can be a complaint, not a spec. Re-read the user's sentence before building to it.
- Shell: never run `cat > file` without input in a command that is not meant to read stdin; it hangs the shell.
