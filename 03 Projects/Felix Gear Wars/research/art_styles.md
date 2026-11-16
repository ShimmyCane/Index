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

---

## Round 2 (2026-11-16): three more styles, and armies that look like their culture

Jimmy's brief: keep adding styles, research them, and let the unit selection reflect the culture (assassins become ninjas in the Japanese style). A style now sets the **names and look of the fighters** as well as colours. The rules never change: a "Ninja" is the same fighter as an "Assassin".

### 6. Persian miniature (Safavid manuscript painting, 16th century)

- Flat, bright colour with no cast shadow and no perspective; the surface is treated as a pattern. Lapis blue, vermilion, emerald green and plenty of gold; gold skies and gold-sprinkled borders; borders with flowers, leaves and arabesques.
- Game: turquoise and crimson sides, gold sky disc with rays, a border of alternating lapis and gold diamonds.
- Army: Nayza guard (spear), Kaman archer, Swordsman (scimitar), Shadow scout (veiled; deliberately not called by a historical sect's name), Savar rider (cavalry with a tall *kulah* cap), Armoured guard, Sage (turbaned), Manjaniq (the siege engine's Persian name). Turbans, tall pointed caps, curved blades.

### 7. Egyptian tomb painting (New Kingdom)

- Flat colour, bold outline, figures in profile with the eye shown from the front, white linen, red-brown skin for men, blue, gold and red as accents. (From general art history; the search did not return a page on the painting conventions.)
- Army, from the sources on the New Kingdom: archers were central and used the composite bow; the khopesh was a sickle-shaped sword and a status symbol; chariots were moving archery platforms.
- Game: red sun disc in a gold ring, a border of red, blue and gold bars. Names: Spearman, Bowman, Khopesh fighter, Desert scout, Charioteer (the horse stands in for the chariot for now), Shield bearer, Priest, Stone hurler. Striped *nemes* headcloths, white linen caps, a hooked khopesh blade.

### 8. Chinese silk painting (Song dynasty)

- Ink and colour on silk, soft muted colour, black ink line, red collector's seals in the corner. (Painting conventions from general knowledge; the search returned a Freer Gallery record of a 12th-century Song scroll with seals, and no style description.)
- Army, from the sources on the Song: crossbows were one of the major weapons; field formations put shield-and-pike troops in front, then archers, then crossbowmen; horses were armoured too.
- Game: muted jade and red sides, a red sun disc, a red seal in the corner, a border with cloud scrolls. Names: Spear guard, Bowman, Dao fighter, Shadow sword, Cavalry, Iron guard, Taoist, Trebuchet. Bamboo-style conical hats, topknots with pins, a broad curved *dao* with a red tassel, Tang-style helmets with a spike and tassel, a tall Taoist cap.

### Existing styles that gained a culture

| Style | Culture | Fighter names (spearman, archer, fighter, assassin, knight, tank, mage, catapult) | Look |
|---|---|---|---|
| Illuminated manuscript | Medieval Europe | Spearman, Archer, Fighter, Assassin, Knight, Tank, Mage, Catapult | steel helmets, plumes |
| Bayeux tapestry | Norman and English, 1066 | Fyrdman, Bowman, Housecarl, Scout, Horseman, Shield wall, Seer, Siege engine | as manuscript |
| Woodblock print | Sengoku Japan | Ashigaru, Yumi archer, Samurai, Ninja, Mounted samurai, Armoured guard, Onmyoji, Siege cannon | straw *jingasa* hats, *kabuto* helmets with a gold crest, ninja hood and headband, *eboshi* court hat, katana |
| Art Nouveau, Stained glass | storybook | as manuscript | style only |

### Sengoku Japan, as researched

- Ashigaru were the light foot soldiers, the most numerous and often the core of an army. *Yumi-gumi* were the bow troops and *yari-gumi* the spearmen; late in the period matchlock gunners (*teppō*) stood in front, with bows, spears and swordsmen behind. Samurai commanded the ashigaru and fought as cavalry, using spears more than bows from the saddle.
- Kabuto helmets, ninja and onmyoji (court diviners) were not covered by the search; the game's versions come from general knowledge and are drawn as simple, friendly figures.

### Honest limits

- The figures are small cartoon figures with the headgear, blade and name of each culture, not museum-accurate reconstructions. The Charioteer is a rider on a horse. The Japanese siege unit is named a cannon but drawn as the same wheeled engine.
- Not covered by the searches: kabuto, ninja and onmyoji details; the Egyptian and Chinese painting conventions. Those come from general knowledge.

### Sources (round 2)

- [Persian miniature painting: materials and techniques (BIPS)](https://bips.ac.uk/?p=2506)
- [The Edge of Artifice: the Shāhnāmeh of Shah Tahmāsp (Courtauld)](https://courtauld.ac.uk/research/research-resources/publications/immeditations-postgraduate-journal/immediations-online/immediations-no-21-2024/the-edge-of-artifice-the-shahnameh-of-shah-tahmasp-and-interrogating-the-edge-in-early-safavid-manuscript-painting/)
- [A deep dive into Safavid miniature paintings (Astaguru)](https://www.astaguru.com/blogs/a-deep-dive-into-the-history--evolution-of-safavid-miniature-paintings-878)
- [Ashigaru (Wikipedia mirror)](https://www.wikipedia.com/wiki/Asigaru)
- [Sengoku period warfare, part 1](https://dcmpx.remotevs.com/com/blogspot/gunbai-militaryhistory/PL/2018/03/sengoku-period-warfare-part-1-army-and.html)
- [How the ancient Egyptian army was organised](https://www.historyskills.com/classroom/ancient-history/ancient-egyptian-army/)
- [How Ancient Egypt waged war across the desert and the Nile](https://www.thecollector.com/ancient-egypt-warfare/)
- [Egyptian chariot warfare](https://warhistory.org/@msw/article/egyptian-chariot-warfare)
- [Crossbows in Song China (University of Washington)](https://depts.washington.edu/chinaciv/miltech/crossbow.htm)
- [Removing the Saddle, Inspecting the Arrows, Song scroll (Freer Gallery)](https://asia.si.edu/explore-art-culture/collections/search/edanmdm:fsg_F1916.526/)
