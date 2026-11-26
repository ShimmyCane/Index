# Index: the main website (schematic)

**This project folder is for the main website:** the nursery home page of this repository. It is not a nursery seed, it will not graduate, and it has no tile of its own.

**Status:** in use · **Updated:** 2026-11-25

## Files

| File | What it holds |
|---|---|
| `index.html` (repo root) | The page itself: the settings panel, the sections and the tiles. It stays at the root so GitHub Pages serves it as the home page. |
| `css/index.css` | All styles, including the six tile styles and the phone layout. |
| `js/style-switcher.js` | The ⚙️ panel and the style picker. Saves the choice in `localStorage` as `index-style`. |
| `js/nursery-order.js` | Orders the Nursery tiles by clicks on this device (`nursery-clicks` in `localStorage`); the first tile gets the larger size. The ⚙️ switch "Reorder & favourites" (pull request #279) turns this off and restores the written order and sizes (`nursery-reorder`). It does not control the Reorder button or the hearts. |
| `js/masonry.js` | The Polygonal Masonry style: one wall for the whole page around a twelve-angled title stone. Stones are packed on a hidden grid; steps, notches and tongues move grid cells between neighbours so stones interlock; shared corners are nudged. Thin dark joints. A wider pale seam marks where categories meet; arrangements are tried until each category is one patch. Flat colour. Phones add plain packing stones beside the big one. Lends packing helpers to `bauhaus.js`. |
| `js/bauhaus.js` | The Bauhaus Blocks style, after Alma Siedhoff-Buscher's building toy (1923). Each section builds a picture: ship (Games), castle (Learning), house (Family), bridge (Architecture), tree (Nursery), with a train as the sixth. Eleven shapes. A saved arrangement (`index-ship-v1`) wins. |
| `js/bauhaus-edit.js` | The ✏️ Edit blocks button: drag, Shape, Flip, Bigger, Smaller, Colour, Picture (next picture for that section), Undo, Start over. Arrow keys nudge. Saved on this device, one set for wide screens and one for phones. Links do not open while editing. |
| `js/tile-colors.js` | Colours all styles like countries on a map: touching tiles never share a colour. Holds one palette per style. It also rebuilds the walls on a style change, a Nursery reorder or a width change. |
| `js/arrange.js` | The ↕️ Reorder button (every style except Bauhaus): drag a tile onto another in the same category. Arrow keys too. Undo and Original order. Saved in `index-order` and used by every style. |
| `js/favorites.js` | A heart in each tile's upper right, placed inside the shape and clear of the words (on stickers, pinned on the corner). Saved in `index-favs`. |
| `index_summary.html` | Code summary made by `/summarize-code`. Rebuild it after a change to the files above. |
| `schematic.md`, `CLAUDE.md` | This note and the Claude Code pointer. |

There are no image, font or audio assets. Colours come from the palettes in `js/tile-colors.js`; the `--c` on each tile in `index.html` is only the fallback if that script does not run.

## Styles (Jimmy, 2026-11-25)

- **Geometric Shapes** (default): keep its shapes; the number across follows the width, four on a laptop.
- **Paper Stickers:** no changes to the look.
- **Polygonal Masonry:** much more visual interlocking; the little boundaries mark the categories. No inner bevel line, no corner numbers, no oval knobs. Bright colours, no shading. Reference photos: https://theperuchannel.com/cuscos-12-angled-stone-reality-and-mythology/ (none stored). _Superseded: hexagon rows; the version with bevel lines, numbers and knobs._
- **Bauhaus Blocks:** the wooden toy look; more overall pictures than boats; many shapes; the edit mode is liked. _Superseded: all ships; the QC keynotes scheme._
- **Every style:** a heart for favourites in the upper right, and drag to reorder.
- **Colour:** a non-repeating map layout in every style.

## Rules

- `index.html`, `css/` and `js/` here are human-only. Claude changes them only when Jimmy asks for that change. The standing exception: `/start-project` adds a Nursery tile with a project's first build, and `/graduate-project` moves that one tile.
- No scripts or style blocks in `index.html`: add them to this folder.
- Paths from the root page are written like `03%20Projects/Index/css/index.css`.
- Plain HTML, CSS and JavaScript. No build step. It also opens by double-click.
- The scripts are classic scripts at the end of `<body>`, in this order: style-switcher, nursery-order, arrange, masonry, bauhaus, tile-colors, bauhaus-edit, favorites.

## Page layout

Sections in order: Games, Learning, Family, Architecture, Nursery. A tile is:

```html
<li class="w2" data-size="3x1"><a class="hex" style="--c:#ffb02e" href="…">Name</a></li>
```

- `class` on `li`: size in the Geometric style (`w2`, `h2`, `h3`, `w4`).
- `data-size`: size in the Polygonal style (`3x1`, `3x2`, `6x1`, `6x2`).
- `class` on `a`: shape in the Geometric style (`tri`, `hex`, `pent`, `para`, `chev`, `dia`, `notch`).
- Nursery tiles also have `data-track="slug"`.

The ⚙️ panel holds the style choices and the Planning links (`01 Planning/`).

## How to check a change

Open `index.html`. Try each of the six styles at a wide and a phone width, open and close ⚙️ (Escape closes it), and check every local link opens. For the colours: no two touching tiles match. For the wall and the ships: every label sits inside its piece.

On 2026-11-25, in headless Chrome: all six styles at 1366, 1100, 768, 390 and 320 wide had no page errors, labels in view, tiles answering at their labels, hearts reachable and clear of the words, and no touching tiles of one colour. The wall also passed at 820, 430 and 360, with 12 centre corners and each category in one patch. With a mouse (1100) and touch (390): hearts, reordering, saving, all six pictures and the block editor passed. Not tested: a real iPad or finger, Safari, or the published Pages site.

The styles and scripts first moved here the same day; before any restyle, screenshots matched the old single-file page.

## Known issues (2026-11-25)

- Hearts have a 34 px tap area, under the 48 px guideline, so they don't swallow the tile.
- Favourites, order and arrangements stay on one device and browser. A heart marks a tile; it does not move or group it.
- A dragged order for Nursery replaces ordering by visits until "Original order".
- `js/nursery-order.js` defines `SHAPES` and does not use it. When tiles reorder, a tile that moves down can keep the larger size it had before.
- Fixed this round: the six Nursery tiles that pointed to graduated folders now link to their own sites.
- A saved Bauhaus arrangement stays on this device and browser; it does not travel to another device. A tile added later takes its default spot, which may overlap saved pieces. Renaming a tile keeps its place; changing its link or section does not.
