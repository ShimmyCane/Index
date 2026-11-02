# Make 3D — Lessons

Appended over time. Promote anything reusable to `04 AI/lessons_pool.md`.

- **Check the page from file:// early.** ES module imports (`<script type="module">`) do not load from `file://`, so Jimmy's double-click use breaks. Use classic scripts, and a UMD build of the library (Three.js r160 `build/three.min.js`). Promoted to the pool.
- **Generate sample files from one operation list and check them by replay.** A test that replays `history.json` and compares it with `model.json` stops the two from drifting. Promoted to the pool.
- **Test shapes with real bulk.** A one-off far spire made the bulk look like outliers, so the first version of the origin test failed for the wrong reason. Give bulk objects real size when testing origin rules.
- **Floating buttons need room in the footer.** The lower-right gear covered the model-check chip. Reserved padding on the footer fixed it.
- **On narrow screens, the view comes first.** On iPad portrait, the panels above the view hid the model. The stage now sits on top, and the panels scroll below.
- **Headless Chromium with WebGL** needs `--no-sandbox --use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` with the pre-installed Chromium at `/opt/pw-browsers/chromium`.
- **Use the project's own names for the UI.** "Not applied" and "Accepted with notes" say what happened; "error" is kept for the opt-in area.

## Photo to 3D: living room (started 2026-11-02)

- **Process agreed with Jimmy:** he gives a photo and a rough description of what is in it. Claude blocks out the room in inches from visual estimates, builds version V01, renders it, and reviews the render against the photo. Each review leads to the next numbered version, V02 to V10. Each version is a full scene rebuilt from one code path, so older versions can be regenerated.
- **Keep the photo private.** A photo of a home goes in `private/` (git-ignored). Only synthetic, approximate geometry is committed.
- **Scale from one known object.** Use something of known size (a TV, a sofa, a child's chair) to set the scale for the rest, and say in the brief that the sizes are estimates.
- **Rotation is about Y only** (`rotation_y`), so chairs and the sofa can only face along the room's Y axis. Lay the room out to match, rather than rotating in the photo's way.
- **Review each render against the photo** and write down what was wrong, so the next version fixes it and the lesson is kept.

**Outcomes after V01 to V10 (2026-11-02)**

- **Check the handedness before the first layout.** With Z up, a viewer standing at the front and facing the back wall has +x on the left, not the right. The first layout came out mirrored, so the final x is mirrored once at the end (`200 - x`), as the kitchen did. Check the first render against the photo before adding detail.
- **Parents before children.** Groups must be added before their members, or the rules reject the operation. A grouping step adds the group first.
- **Chairs cannot turn to face sideways.** With rotation about Y only, a chair beside the table cannot face it. Move the chair to the end of the table instead.
- **A wall can hide what you want to check.** The right wall hides the door from the default camera. A zoom-out shot shows the whole room, but not behind a wall. A "hide walls" toggle is the real fix (noted for the viewer).
- **Keep old versions reproducible.** Each version is a `if (v >= N)` block in one function, so V01 to V10 all rebuild from the same file.

## 2026-11-02: check the picture, not the numbers

- A pass on the numbers is not a pass on the shape. The first bonsai "passed" every test and still looked like a bare line of sticks. Look at each screenshot from at least two angles (default and side) and ask what a real tree of this kind does: taper, lean, apex above the crown, branches that arch up, not flat arms.
- Dimensions that look fine on paper can clash in 3-D (a pole through a table top). Run the clash check (`js/core/clash.js`) after every scene change.
- "Sparse" in a user's description can be a complaint, not a spec. Re-read the user's sentence before building to it.
- Shell: never run `cat > file` without input in a command that is not meant to read stdin; it hangs the shell.

**Second look (V11 to V15, 2026-11-02)**

- **New photos can change the layout, not just the details.** The second photo showed the room was longer and the TV wall was a side wall. Redrawing the room was faster and clearer than patching V01 to V10. Keep the first version reproducible and start a new file with its own coordinates.
- **Pick the camera by where the room is open.** When the near end is open, the camera belongs there (azimuth 34° in this file), not outside the far wall.
- **Ceilings hide rooms.** An opaque ceiling blocks the default view from above. Make it see-through (opacity 0.4) when a room is viewed from above.
- **Rotation about Y only again.** Ceiling tiles that are angled in a photo become a straight grid here. Say so in the brief.
- **Check the data when a close-up misses.** A zoomed camera can land on the wrong part of the room. Confirm the object positions in `model.json` instead of guessing from a screenshot.
