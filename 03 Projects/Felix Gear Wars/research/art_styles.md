# Felix Gear Wars — art styles research

Rule (Jimmy's preferences §4b): historical artists and traditions only, never a living artist's style. Each style below restyles the whole campaign: colours, line weight, background, border and texture. Units, gears and effects are drawn in code, so a style is a palette plus a few drawing rules, not new art files.

## 1. Illuminated manuscript (default)

What it looked like and why it suits a game:
- **Gold is the point.** A page counts as "illuminated" when it carries gold, as hammered gold leaf laid on first and burnished, or as shell-gold paint. Gold went on halos, backgrounds, borders and small highlights inside figures. In the game: gold rims on gears, gold hub highlights, gold border and corner pieces, gold star rating.
- **Prestige colours.** Ultramarine (crushed lapis) and vermilion (mercury and sulphur) were the costly colours; azurite was the cheaper blue; lead-tin yellow, malachite green and lead white filled out the set. In the game: lapis blue for Felix's side, vermilion and rust for the Rust Horde, malachite for meadows, lead-tin yellow for light.
- **Flat colour with a dark outline.** Figures are flat tempera shapes with ink outlines, no cast shadows; depth comes from overlap and tiny hatching. In the game: 2.5–3.5 px dark ink outline on every figure, flat fills, a lighter highlight stroke.
- **Specialists:** the scribe ruled the page, then the illuminator added decoration; the costly decoration came last. In the game: parchment page first, then painted scenes, then gold last.
- **Gothic page.** Ruled margins, a border of leaves and curls, a big decorated initial, and marginal creatures (snails, rabbits, knights). In the game: vellum background with ruled lines, a leafy border, an illuminated first letter on the story card, and tiny marginal animals that wander along the bottom border.
- **Backgrounds** started flat and gold, then gained architecture and landscape in the Gothic period. In the game: gold-and-diaper (diamond lattice) sky behind the far hills.

## 2. Bayeux Tapestry

- Not a tapestry: wool thread embroidered on linen. Outline (stem) stitch for outlines and lettering; couching (laid work) to fill the figures.
- Wool dyed with woad (blues), madder (reds) and weld, "dyer's rocket" (yellows); about eight colours: dark and light blue, red, yellow, dark and light green, black and a dove grey.
- **Colours are not natural:** a horse may be blue, its muscles yellow. Sides of a body are often told apart by colour.
- Stock images from manuscripts; long friezes with a main band and borders where tiny archers and animals run.
- In the game: only eight earthy colours, stitch-line texture over everything, a frieze border, and a blue horse for the knight.

## 3. Japanese woodblock print (Hokusai, Hiroshige; both long dead)

- Flat colour blocks, strong key line, a few colours (indigo, ochre, vermilion, soft green), paper grain, sky that fades from a band of colour, cartouche labels, a red seal.
- In the game: indigo and vermilion palette, grain texture, bokashi gradient in the sky, a red seal in the corner.

## 4. Art Nouveau (Alphonse Mucha, d. 1939)

- Whiplash curves, flowing hair and plants, soft muted colours, gold outlines and halo circles behind figures.
- In the game: pale sage, rose and ochre, gold outlines, a flowing vine border, and a round halo behind the heart.

## 5. Stained glass (Gothic cathedral glass)

- Jewel colours (ruby, cobalt, emerald, amber), thick black lead lines holding each piece, light glowing through.
- In the game: saturated jewel palette, very thick black outlines, a leading lattice, a glow on gears.

## Implementation notes (for the build)

- One `Art.theme` object per style: palette, colour filter, line width multiplier, border painter, texture painter. Every colour in the game goes through `Art.C(hex)`, so a style only needs a filter. Borders and textures are painted once to an offscreen canvas and reused.
- Changing the style repaints the whole game; progress is untouched.

## Sources

- [Illuminators' Materials and Techniques in Fourteenth-century English Manuscripts](https://core.ac.uk/download/187093124.doc)
- [From stone or bug to masterpiece (KBR, Royal Library of Belgium)](https://www.kbr.be/en/miniature/)
- [Getty: Annunciation, manuscript background](https://www.getty.edu/education/teachers/classroom_resources/curricula/manuscripts/background1.html)
- [Bayeux Museum: tapestry or embroidery](https://www.bayeuxmuseum.com/en/the-bayeux-tapestry/discover-the-bayeux-tapestry/tapestry-or-embroidery/)
- [Bayeux Tapestry art notes (Florilegium)](https://www.florilegium.org/files/TEXTILES/Bayeux-Tapsty-art.html)
- [Bayeux Tapestry (New World Encyclopedia)](https://www.newworldencyclopedia.org/entry/Bayeux_Tapestry)
- Styles 3–5 from general art-history knowledge; no outside page was read for them.
