# make_sticker (`/make-sticker <Sticker Name>`)

Adds one new sticker to a Felix Stickers sheet, from a picture of it, so it can be peeled and placed.
Example: `/make-sticker Acorn Cap`.

The sheet is one picture. Each sticker is a box on that picture plus a cut-out of it. A new sticker is therefore a new box on a blank part of the sheet, with a cut-out on top. The sheet picture itself does not change.

## Inputs (ask once for anything missing)

- **Sticker name**: the label for the peel ("Acorn Cap"). The id is the same in snake_case (`acorn_cap`).
- **Source picture**: a file path. It should show one sticker on a plain, light background (for example a ChatGPT picture). If none is given, ask for one.
- **Sheet**: the sheet file to add to. Default: the Thanksgiving test sheet, `03 Projects/Felix Stickers/private/thanksgiving/sheet.js`.
- **Size on the sheet**: the longer side, in picture pixels. Default 260 (the sheet is 1536 px wide).
- **Where it lives**:
  - Default: `private/<sheet>/` (test only, never committed; Jimmy's answer in convo v0.1 Q10 for uploaded art).
  - Public: only when Jimmy confirms the picture may be published (licence or permission, convo v0.7). Then the cut-out goes to `art/` and the sheet data to `js/`. Otherwise use the lookalike SVG approach from the Woods sheet.

## Steps

1. **Read the sheet file** and list its sticker ids and boxes. Stop if the new id already exists.
2. **Cut the sticker**:
   `python3 "02 Refs/Skills/scripts/sticker_cut.py" one <source> <outdir>/pieces/<id>.png --max-side <size>`
   It prints the cut's size. Use `--light` (default 235) or `--min-area` if the cut has specks or misses edges.
3. **Look at the cut.** Read the PNG. If the halo, a speck or a cut-off edge shows, adjust step 2 and cut again.
4. **Find a free spot** on the sheet's background (`<outdir>/base.png`; if it is missing, run the sheet mode first):
   `python3 "02 Refs/Skills/scripts/sticker_cut.py" slot <outdir>/base.png <w> <h> --avoid x,y,w,h ...`
   Pass every existing sticker box as `--avoid`. This is needed because the background has the existing stickers erased, so a blank area can still be someone's sticker. If it reports no room, ask Jimmy for a smaller size or whether to replace a sticker.
5. **Register it** in the sheet file (use Edit):
   - add `{ id, label, box: {x, y, w, h}, svg: '' }` to `stickers`, where `box` is the spot from step 4 and `w, h` is the cut's size;
   - add the cut path to `native.art[id]` and `native.placed[id]`.
6. **Test it over HTTP, not file://.** Chromium blocks the peel's pixel read on file:// pages, so a peel silently fails there. Serve the project folder (`python3 -m http.server 8765` in `03 Projects/Felix Stickers/`) and open `http://127.0.0.1:8765/index.html?sheet=<key>`. Check: the title, one more slot than before, the new image loads, no page errors, no horizontal scroll at phone and iPad sizes, and a peel from the edge lifts it.
7. **Record it**: add a line to the sheet's `Changes` in `schematic.md`, a line in `04 AI/Felix Stickers/brief.md`, and any new lesson in `lessons.md`. Keep private names and files out of committed text.
8. **Report** to Jimmy: the sticker's id and box, where the cut is saved (private or public), the test URL, and anything not checked (a peel on a real iPad is not automated; say so).

## Limits

- The new sticker's art is only as good as its picture. A busy background or a missing outline gives a poor cut; ask for a new picture rather than forcing it.
- A sheet's `ref` size (its picture width and height) must not change when a sticker is added.
- Sticker placement on a real iPad is not tested by these steps. Jimmy checks the feel.
