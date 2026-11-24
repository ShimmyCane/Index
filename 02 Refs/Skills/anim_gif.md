# anim_gif: see an interaction as an animated GIF

Purpose: record a drag-based interaction (lift, curl, carry, stick) headless and turn it into an animated GIF that can be sent and looked at quickly. Use it whenever a motion has to be judged by eye and PNG contact sheets are not enough.

## Tools (in `02 Refs/Skills/scripts/`)

- `anim_capture.js`: plays a JSON plan in a headless Chromium (Playwright, from the pre-installed browser) and writes one PNG per frame, cropped to a box on the page.
- `frames_to_gif.py`: turns the PNG folder into a GIF (Pillow). Options: `--scale`, `--ms`, `--every`, `--colors`, `--hold-last`.

## Steps

1. Serve the project over http (file:// taints canvases, so pixel reads and the peel fail):
   `cd "03 Projects/<Project>" && python3 -m http.server 8765 &`
2. Write a plan file in the scratchpad (not in the repo): url, viewport, a `clip` element, optional `setup`, and the steps. Gesture points can be absolute or relative to an element with `selector`, `nth`, `fx`, `fy`. A `drag` step moves in `stepPx` steps and takes a frame every `shotEvery` steps; `untilSelector` ends the drag early when an element appears (for example `.ps.committed` when a sticker sticks).
3. Capture: `NODE_PATH=$(npm root -g) node "02 Refs/Skills/scripts/anim_capture.js" plan.json <frames_dir>`. Read the JSON it prints: frame count and any page errors. Stop if there are errors.
4. Make the GIF: `python3 "02 Refs/Skills/scripts/frames_to_gif.py" <frames_dir> <out.gif> --scale 0.67 --ms 80 --hold-last 6`
5. Look at it: send the GIF with `SendUserFile` (display `attach`), and also make a key-frame contact sheet with Pillow to check the frames yourself.
6. Keep the GIF, plan and frames in the scratchpad. Only commit the GIF if it is needed in the repo, and never a GIF of private data.

## Plan example

```json
{
  "url": "http://localhost:8765/index.html",
  "viewport": { "width": 1180, "height": 820 },
  "clip": { "selector": ".sheetPage" },
  "setup": "localStorage.clear()",
  "steps": [
    { "type": "drag", "from": { "selector": "#sheetCard .slot", "nth": 3, "fx": 0.02, "fy": 0.5 },
      "to": { "fx": 0.9, "fy": 0.5 }, "stepPx": 5, "shotEvery": 1 },
    { "type": "release" }, { "type": "wait", "ms": 300 }, { "type": "shot" }
  ]
}
```

## Rules

- Judge the motion in the GIF, not only in the test's numbers. Look at the start, the middle and the end frame.
- One change per GIF, so the cause of any problem is clear.
- Frames are per step, so `stepPx` sets the speed of the motion as seen (5 px is the default used so far).
- The GIF is for the owner's eyes; send it as a file, and say what it shows in one line.
