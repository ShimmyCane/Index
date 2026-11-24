# Felix Stickers — Convo v0.11

**Project:** Felix Stickers
**Round:** 11 (after 0.5.1, 2026-11-23)

## Jimmy's note

> Stickers should "peel" from when the mouse is clicked and dragged from. Stickers should be applied in reverse. Scale of the stickers should remain the same. There shouldn't be an outline from them.

## What changed (0.5.2)

- **Peel from the click:** the fold now runs through the point where the sticker is clicked, across the drag. The part beyond the click turns over, so a sticker grabbed at its centre folds in half, from where the finger is.
- **Applied in reverse:** a sticker is laid back down by running the peel backwards: it unfolds from its folded state into flat. (Claude's reading; see below.)
- **Same scale:** a placed sticker is the same size as its piece on the sheet, at any screen size. The sheet's width sets the size.
- **No outline:** the shadows and borders around placed stickers and their folds are removed. The art itself is unchanged.

## Claude's reading (to confirm)

- "Applied in reverse" means the sticking animation is the peel run backwards, not a bounce.

## Questions

1. The cutouts still have the cream sticker edge from the picture. Is that the "outline" you mean, or only the shadows? If it is the edge, I can trim it from the placed stickers (the sheet keeps it, as in the reference).
   - Answer: **Yes.** Placed stickers now use the same pictures with the cream edge trimmed (`art/placed/`). The sheet keeps the edge, as in the reference.
2. Is the fold from the click point right, or should the fold run from a fixed edge of each sticker?
   - Answer: **From the click point.** This is how it is built.
