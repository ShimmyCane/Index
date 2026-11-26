# Index (main website): brief

**Goal.** The nursery home page: a hub of tiles that link to each project.

**State (2026-11-25, fifth round).** `index.html` holds content only; styles and eight scripts are in `03 Projects/Index/`. Geometric shows four across on a laptop. Every tile has a favourite heart. Reorder (drag within a category) works in all styles but Bauhaus, which has its block editor with a Picture button and a different picture per section. Polygonal Masonry is a heavily interlocked wall with pale category seams. Not committed or published at the time of writing.

**Architecture.** Static page, no build. Device storage only: `index-style`, `nursery-clicks`, `index-order`, `index-favs`, `index-ship-v1`. Human-only: change on request.

**Verified.** Headless Chrome across widths for all styles; mouse and touch tests for hearts, reorder, pictures and the editor.

**Not verified.** A real iPad or Safari; the published Pages site; Jimmy's eye on this round.

**Interpretations to confirm.** "Little boundaries are the categories" was built as a wider pale seam between categories, with no category names in the wall.

**Known.** Saved choices don't travel between devices. Heart tap area is 34 px. A section already arranged by hand keeps its saved places when the picture design changes (Start over shows the new one). `SHAPES` in `nursery-order.js` is unused.

**Next (ideas, not asked).** Show favourites together; category names on the wall; sync across devices (needs a database).
