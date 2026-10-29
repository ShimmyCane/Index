/* Felix Maze seed library: everything a new batch can be made from.
   The planner (tools/plan.js) reads a short brief (how many, which levels, which themes) and picks from here:
   an inspiration (artist, tradition, place, nature), one of its series items (title + fun line), and a template that
   can draw it. The generator (tools/generate.js --plan) then builds each one solution first and checks it.

   status: "ready"   the engine can draw it today, the planner may pick it
           "partial" some of it works (the note says what); the planner may pick the working part
           "planned" an idea to build; never picked until it is ready
   Rules: historical artists only (living: false, with the year they died), facts short and checkable, sheets print
   black and white (color is a planned "color edition"), levels 5 and up are one way through (perfect, solution first). */
(function (root) {
  "use strict";

  // ---------- maze concepts: Jimmy's ideas, kept as things to build into templates ----------
  const concepts = {
    // 1) the paths
    path: [
      { id: "sweeps", status: "ready", what: "The right way sweeps back and forth across the page and twists, so it heads away from the goal half the time.", engine: "pathFirst waypoints + twist" },
      { id: "lures", status: "ready", what: "Wrong turns hang off the path where they look nearer the finish than the right way.", engine: "pathFirst lure + doorway moves" },
      { id: "dens", status: "partial", what: "An underground burrow with dens (rooms) where friends or animals live; tunnels circle out from them.", engine: "ants/warren styles have wide chambers; dens as rooms on the path are planned (open a block of cells into one room)" },
      { id: "bulges", status: "planned", what: "Paths that are not all the same width: some bulge, some pinch, some join into a pool.", engine: "per-cell corridor width (ribbon mode with a width map)" },
      { id: "spirals-circles", status: "ready", what: "Spirals and circles: rings and spokes, or a spiral warp.", engine: "rings style, spirals warp" },
      { id: "straight-lines", status: "ready", what: "Direct simple lines: long straight halls (low twist, low mix).", engine: "pathFirst twist 0, mix 0" },
      { id: "intestine", status: "partial", what: "Intestinal flow: one long folded tube that meanders and packs a region.", engine: "pathFirst with many sweeps and high twist approximates it; a true meander fill (Pedersen and Singh) is planned" },
      { id: "skew", status: "ready", what: "Distortion and skew: the whole maze pushed through a swirl or a wave.", engine: "look.vortices, look.sine (warp)" }
    ],
    // 2) the walls
    walls: [
      { id: "grid", status: "ready", what: "Square cells, straight walls, hand-drawn wobble.", engine: "buildGrid" },
      { id: "hex", status: "ready", what: "Hexagon cells (honeycomb).", engine: "buildHex" },
      { id: "rings", status: "ready", what: "Rings and spokes.", engine: "buildPolar" },
      { id: "curved", status: "ready", what: "Curved, whirling walls, like a waterslide.", engine: "warp (vortices/sine) on any grid" },
      { id: "triangle", status: "planned", what: "Triangle cells.", engine: "buildTri (new graph builder)" },
      { id: "collide", status: "planned", what: "A geometric system: different shapes colliding, a patchwork of tilings.", engine: "Voronoi or mixed tiling cell graph" },
      { id: "ribs", status: "planned", what: "Walls that form ribs (parallel curved walls with gaps), like a whale or a leaf.", engine: "a rib field: curves from a spine, cells between them" },
      { id: "grooves", status: "planned", what: "Pumpkin grooves: lobes around a center.", engine: "polar with a lobed radius r(θ)" }
    ],
    // 3) composition: more than one shape
    composition: [
      { id: "chain", status: "planned", what: "A chain of shapes joined by narrow necks: cherries (fruit, stem, back to fruit); barn → grass → tree → bird flying out.", engine: "a scene mask: union of placed shapes plus necks; the path runs through every one in order (waypoints)" },
      { id: "collage", status: "planned", what: "A collage of profiles (many animals or objects) on one page.", engine: "several masks, each its own region, joined by doors" },
      { id: "hidden-picture", status: "planned", what: "From far away it is a face (a leopard): wall density and solid areas draw the picture.", engine: "image-guided density (Xu and Kaplan) + solid regions" },
      { id: "white-space", status: "ready", what: "Lots of white space, or tight and dense: the size of a square and the zoom set it.", engine: "cell, zoom" }
    ],
    // 4) color and solids
    color: [
      { id: "solids", status: "partial", what: "Parts of the maze are solid (no-go) but mean something: eyes, gills, fins. Holes in a silhouette already work (the owl's eyes).", engine: "mask holes work; named solid regions are planned" },
      { id: "regions", status: "planned", what: "Color regions: the fish orange with its own rough outline, the water blue around it, so it reads from a distance.", engine: "a color edition: fills per region under the walls; black-and-white stays the default" },
      { id: "wall-colors", status: "planned", what: "Walls in different colors and weights for different parts.", engine: "per-region look" }
    ],
    // 5) things to do on the way
    mechanics: [
      { id: "treats", status: "partial", what: "Little cheese blocks or snacks along the way. Sheets already place treats on the right path and at the end of wrong turns.", engine: "placeTreats; counting them in drive mode is planned" },
      { id: "score", status: "planned", what: "A score for a drive: reach the finish, how fast, how many treats, few loops or turn-arounds.", engine: "drive mode: treats collected, steps vs shortest, time" },
      { id: "detours", status: "planned", what: "Worth-it detours: a side trip that costs steps but earns a treat.", engine: "pathFirst: place treats deep in some wrong turns" }
    ]
  };

  // ---------- templates the planner can use (each one is a style the engine draws) ----------
  // levels: what it can reach (the generator measures the real reach). kind: page = fills the page, shape = a silhouette.
  const T = (id, style, p, levels, kind, tags) => ({ id, style, p: p || {}, levels, kind, tags: tags || [], status: "ready" });
  const BOLD = { outline: 11 };
  const templates = [
    T("starry-sky", "starry", { v: 0 }, [2, 7], "page", ["swirls", "night"]),
    T("starry-sky-2", "starry", { v: 2 }, [2, 7], "page", ["swirls", "night"]),
    T("great-wave", "wave", { v: 0 }, [2, 7], "page", ["sea", "waves"]),
    T("calm-sea", "wave", { v: 2, thin: true }, [2, 7], "page", ["sea", "mist"]),
    T("gold-spirals", "spirals", { v: 1 }, [2, 7], "page", ["spirals", "gold"]),
    T("sound-wave", "soundwave", { v: 1 }, [2, 7], "page", ["sound", "waves"]),
    T("dot-field", "seurat", {}, [1, 7], "page", ["dots"]),
    T("patchwork", "klee", {}, [1, 7], "page", ["squares", "color blocks"]),
    T("city-grid", "streets", {}, [1, 7], "page", ["streets", "grid"]),
    T("lattice", "streets", { scale: 1.15 }, [1, 7], "page", ["lattice", "pattern"]),
    T("honeycomb", "honeycomb", {}, [1, 7], "page", ["hexagons"]),
    T("burrow", "ants", {}, [2, 7], "page", ["tunnels", "dens"]),
    T("mouse-box", "mouse", {}, [1, 7], "page", ["classic"]),
    T("carpet", "carpet", {}, [1, 5], "page", ["borders", "pattern"]),
    T("rings-double", "rings", { look: "double", core: 1.3, R: 250 }, [1, 6], "rings", ["circles", "labyrinth"]),
    T("rings-dots", "rings", { look: "dots", decor: "seeds", core: 1.4, R: 255 }, [1, 6], "rings", ["circles", "dots"]),
    T("rings-thin", "rings", { look: "thin", decor: "ticks", core: 2.2, R: 255 }, [1, 6], "rings", ["circles"]),
    T("rings-petals", "rings", { look: "thin", decor: "petals", core: 1.6, R: 240 }, [1, 6], "rings", ["flower", "circles"]),
    T("canals", "canals", {}, [1, 4], "page", ["water", "bridges"]),
    // silhouettes (the bigger ones reach higher levels)
    ...["oval", "rect", "octagon", "donut", "heart", "cloud", "pumpkin", "butterfly", "turtle", "fish", "whale", "catface", "island", "sailboat", "lilypad", "fuji", "mountains", "babel", "star5", "sun", "daisy", "apple", "owl", "snail", "bird", "tree", "leaf", "palmleaf", "mushroom", "house", "castle", "saturn", "balloon", "moon"]
      .map(sh => T("shape-" + sh, "shape", { shape: sh, look: BOLD }, ["oval", "rect", "octagon", "donut", "heart", "cloud", "pumpkin", "butterfly", "turtle", "fish", "whale", "catface", "island"].includes(sh) ? [1, 6] : [1, 5], "shape", [sh, "shape maze"])),
    ...["daisy", "leaf", "turtle", "startile", "snowflake"].map(sh => T("hex-" + sh, "hexshape", { shape: sh }, [1, 5], "shape", [sh, "hexagons"]))
  ];

  // ---------- inspirations ----------
  // living: false always (the planner refuses true). died: the year, so the rule can be checked.
  // series: new puzzles waiting to be made (title + fun line; chars = start and finish pictures from js/art.js).
  const A = o => Object.assign({ kind: "artist", living: false, family: 3, palette: [], style: [], templates: [], concepts: [], series: [] }, o);
  const S = (title, fun, chars, p) => ({ title, fun, chars: chars || ["cat", "star"], p: p || null });
  const inspirations = [
    A({ id: "turner", name: "J. M. W. Turner", born: 1775, died: 1851, inspired: "Inspired by J. M. W. Turner's misty seas and ships",
      style: ["atmospheric seas", "ships in mist", "swirling light", "storms", "sunsets"], palette: ["#f2c14e", "#d9a066", "#9fb8c9", "#e8dcc0"],
      templates: ["calm-sea", "great-wave", "sound-wave", "shape-sailboat"], concepts: ["skew", "sweeps"],
      series: [
        S("Ships in the Mist", "Turner painted sea, sky and ships in soft swirls of light and mist.", ["boat", "sun"]),
        S("The Old Warship", "In The Fighting Temeraire, 1839, a little steam tug pulls a great old sailing ship.", ["boat", "sun"]),
        S("Storm at Sea", "Turner said he was tied to a ship's mast so he could watch a snowstorm at sea.", ["boat", "mountain"]),
        S("Golden Harbour", "Turner's skies are full of yellow and gold light.", ["boat", "sun"]),
        S("Venice Sails", "Turner visited Venice and painted its boats and canals.", ["boat", "house"]),
        S("Twenty Pound Note", "Turner's face is on the Bank of England twenty pound note.", ["cat", "star"])
      ] }),
    A({ id: "lichtenstein", name: "Roy Lichtenstein", born: 1923, died: 1997, inspired: "Inspired by Roy Lichtenstein's comic-book paintings",
      style: ["comic-book dots", "thick black outlines", "speech balloons", "primary colors"], palette: ["#e63946", "#f1c40f", "#1d70b8", "#ffffff"],
      templates: ["dot-field", "patchwork", "shape-cloud", "shape-heart"], concepts: ["solids", "regions"],
      series: [
        S("Comic Dots", "Roy Lichtenstein painted dots like the ones in printed comic books.", ["cat", "star"]),
        S("Stencil Dots", "He used a stencil full of holes to paint his dots evenly.", ["cat", "heart"]),
        S("Speech Bubble", "His paintings often have big speech balloons, like a comic strip.", ["cat", "note"]),
        S("Bold Lines", "He outlined everything with thick black lines.", ["cat", "star"]),
        S("Comic Brushstroke", "He even painted brushstrokes in a comic-book style.", ["cat", "sun"])
      ] }),
    A({ id: "warhol", name: "Andy Warhol", born: 1928, died: 1987, inspired: "Inspired by Andy Warhol's pop art prints",
      style: ["repeated images", "rows and grids", "bright flat colors", "silkscreen"], palette: ["#ff5fa2", "#ffd400", "#00b4d8", "#7bd389"],
      templates: ["patchwork", "city-grid", "mouse-box", "shape-daisy"], concepts: ["regions", "collage"],
      series: [
        S("Soup Can Rows", "Andy Warhol painted 32 soup cans, one for each flavor sold at the time.", ["cat", "star"]),
        S("Print It Again", "He used silkscreen printing to repeat one picture many times.", ["cat", "heart"]),
        S("Pop Colors", "Warhol printed the same picture in many bright colors.", ["cat", "sun"]),
        S("Pop Flowers", "Warhol made a series of bright flower prints in 1964.", ["bee", "flower"]),
        S("The Factory", "His studio in New York was called the Factory.", ["cat", "house"])
      ] }),
    A({ id: "hiroshige", name: "Utagawa Hiroshige", born: 1797, died: 1858, inspired: "Inspired by Hiroshige's woodblock prints of Japan",
      style: ["rain as straight lines", "bridges", "snow", "travel roads", "deep blue"], palette: ["#1f4e79", "#c9d6df", "#e9c46a", "#f4a261"],
      templates: ["calm-sea", "city-grid", "shape-fuji", "shape-mountains"], concepts: ["straight-lines", "chain"],
      series: [
        S("Rain on the Bridge", "Hiroshige drew a sudden shower over a bridge as thin straight lines of rain.", ["cat", "house"]),
        S("Fifty-Three Stations", "Hiroshige made prints of the 53 stops along the Tōkaidō road.", ["cat", "house"]),
        S("Plum Garden", "Van Gogh copied one of Hiroshige's prints of plum trees.", ["bird", "flower"]),
        S("Snowy Village", "Many of his prints show snow, rain or mist.", ["cat", "house"])
      ] }),
    A({ id: "miro", name: "Joan Miró", born: 1893, died: 1983, inspired: "Inspired by Joan Miró's floating stars and shapes",
      style: ["floating shapes", "stars and moons", "thin black lines", "bright spots of color"], palette: ["#e63946", "#ffd166", "#118ab2", "#111111"],
      templates: ["starry-sky", "rings-dots", "shape-star5", "shape-moon"], concepts: ["collage", "solids"],
      series: [
        S("Floating Stars", "Joan Miró filled his paintings with stars, moons and floating shapes.", ["cat", "star"]),
        S("Constellations", "He painted a series called the Constellations in 1940 and 1941.", ["cat", "moon"]),
        S("Birds and Ladders", "Birds and ladders appear in many of his pictures.", ["bird", "star"]),
        S("Bright Spots", "He loved bright red, yellow and blue with black lines.", ["cat", "sun"])
      ] }),
    A({ id: "okeeffe", name: "Georgia O'Keeffe", born: 1887, died: 1986, inspired: "Inspired by Georgia O'Keeffe's flowers and desert hills",
      style: ["giant flowers", "soft curves", "desert hills", "bones against the sky"], palette: ["#f4a6a6", "#f6e3c5", "#c1121f", "#7f5539"],
      templates: ["rings-petals", "shape-daisy", "shape-mountains", "hex-daisy"], concepts: ["bulges", "regions"],
      series: [
        S("Giant Flower", "Georgia O'Keeffe painted flowers so big they fill the whole canvas.", ["bee", "flower"]),
        S("Desert Hills", "She lived in New Mexico and painted its red hills.", ["cat", "sun"]),
        S("Sky and Bones", "She collected bones in the desert and painted them against the sky.", ["cat", "sun"]),
        S("Slow Look", "She wanted people to slow down and really look at a flower.", ["bee", "flower"])
      ] }),
    A({ id: "morris", name: "William Morris", born: 1834, died: 1896, inspired: "Inspired by William Morris's garden patterns",
      style: ["leaves and vines", "birds in a garden", "repeating patterns", "block printing"], palette: ["#2a9d8f", "#264653", "#e9c46a", "#e76f51"],
      templates: ["lattice", "gold-spirals", "shape-leaf", "hex-leaf"], concepts: ["curved", "ribs"],
      series: [
        S("Strawberry Thief", "William Morris made a pattern of birds stealing strawberries from his garden.", ["bird", "heart"]),
        S("Willow Bough", "His wallpapers are made of leaves and vines that repeat.", ["bird", "leaf"]),
        S("Block Print Garden", "Morris printed his patterns with carved wooden blocks.", ["cat", "flower"]),
        S("Vine Trail", "In his patterns the vines never end: they curl into the next tile.", ["cat", "leaf"])
      ] }),
    A({ id: "delaunay", name: "Sonia Delaunay", born: 1885, died: 1979, inspired: "Inspired by Sonia Delaunay's circles of color",
      style: ["circles of color", "rhythm", "patchwork", "fabric"], palette: ["#ef476f", "#ffd166", "#06d6a0", "#118ab2"],
      templates: ["rings-thin", "rings-double", "patchwork"], concepts: ["spirals-circles", "regions"],
      series: [
        S("Color Circles", "Sonia Delaunay painted circles of color that seem to spin.", ["cat", "sun"]),
        S("Baby Blanket", "She sewed a patchwork blanket for her baby son in 1911, and it became famous.", ["cat", "heart"]),
        S("Rhythm", "She called many of her paintings Rhythm.", ["cat", "note"]),
        S("Fabric Circles", "She also designed fabrics and clothes.", ["cat", "star"])
      ] }),
    A({ id: "vangogh", name: "Vincent van Gogh", born: 1853, died: 1890, inspired: "Inspired by Vincent van Gogh",
      style: ["swirling skies", "thick brushstrokes", "sunflowers", "wheat fields"], palette: ["#f4d35e", "#1d3557", "#457b9d", "#e9c46a"],
      templates: ["starry-sky", "starry-sky-2", "great-wave", "rings-petals"], concepts: ["skew", "sweeps"],
      series: [
        S("Sunflower Field", "Van Gogh painted sunflowers in vases many times in 1888 and 1889.", ["bee", "flower"]),
        S("Café at Night", "His Café Terrace at Night shows a starry sky above a yellow café.", ["cat", "star"]),
        S("Wheat Waves", "He painted wheat fields swaying in the wind.", ["bird", "sun"]),
        S("Irises", "Van Gogh painted Irises in the hospital garden at Saint-Rémy.", ["bee", "flower"])
      ] }),
    A({ id: "hokusai", name: "Katsushika Hokusai", born: 1760, died: 1849, inspired: "Inspired by Katsushika Hokusai's prints",
      style: ["great waves", "Mount Fuji", "waterfalls", "sketchbooks"], palette: ["#1d3557", "#a8dadc", "#e63946", "#f1faee"],
      templates: ["great-wave", "calm-sea", "shape-fuji", "shape-mountains"], concepts: ["skew", "curved"],
      series: [
        S("Red Fuji", "Hokusai's Red Fuji shows the mountain glowing red in the morning.", ["cat", "mountain"]),
        S("Waterfall Journey", "Hokusai made a series of prints of famous waterfalls.", ["fish", "mountain"]),
        S("Sketchbooks", "Hokusai filled sketchbooks, called Manga, with thousands of drawings.", ["cat", "star"]),
        S("Thunder Below", "In one print, lightning flashes below the top of Mount Fuji.", ["cat", "mountain"])
      ] }),
    A({ id: "klimt", name: "Gustav Klimt", born: 1862, died: 1918, inspired: "Inspired by Gustav Klimt",
      style: ["gold patterns", "spirals", "birch forests", "flower gardens"], palette: ["#d4af37", "#8c6d1f", "#f6e7b4", "#3a5a40"],
      templates: ["gold-spirals", "dot-field", "shape-tree"], concepts: ["spirals-circles", "regions"],
      series: [
        S("The Kiss", "Klimt's painting The Kiss is covered in gold patterns.", ["cat", "heart"]),
        S("Birch Forest", "Klimt also painted quiet forests of birch trees.", ["cat", "tree"]),
        S("Lake Garden", "He painted gardens full of flowers by Lake Attersee.", ["bee", "flower"])
      ] }),
    A({ id: "monet", name: "Claude Monet", born: 1840, died: 1926, inspired: "Inspired by Claude Monet",
      style: ["water lilies", "reflections", "haystacks", "light at different times of day"], palette: ["#a8dadc", "#cdb4db", "#ffafcc", "#bde0fe"],
      templates: ["calm-sea", "shape-lilypad", "dot-field"], concepts: ["regions", "curved"],
      series: [
        S("Japanese Bridge", "Monet built a Japanese-style bridge over his lily pond.", ["cat", "flower"]),
        S("Haystacks", "Monet painted the same haystacks at many times of day.", ["cat", "sun"]),
        S("Impression", "The word Impressionism came from Monet's painting Impression, Sunrise.", ["boat", "sun"]),
        S("Poppy Field", "Monet painted fields of red poppies near Argenteuil.", ["cat", "flower"])
      ] }),
    A({ id: "seurat", name: "Georges Seurat", born: 1859, died: 1891, inspired: "Inspired by Georges Seurat's dot paintings",
      style: ["dots", "calm figures", "parks and rivers"], palette: ["#9bc1bc", "#f4f1bb", "#ed6a5a", "#5ca4a9"],
      templates: ["dot-field", "rings-dots"], concepts: ["regions"],
      series: [
        S("The Circus", "Seurat's last painting, The Circus, was left unfinished.", ["cat", "star"]),
        S("River Bathers", "Seurat painted people bathing in the river at Asnières.", ["fish", "sun"]),
        S("Seaside Dots", "Seurat painted the sea at Gravelines with dots.", ["boat", "sun"])
      ] }),
    A({ id: "mondrian", name: "Piet Mondrian", born: 1872, died: 1944, inspired: "Inspired by Piet Mondrian",
      style: ["straight black lines", "red, yellow and blue blocks", "grids"], palette: ["#d62828", "#fcbf49", "#003049", "#ffffff"],
      templates: ["city-grid", "patchwork"], concepts: ["straight-lines", "regions"],
      series: [
        S("Victory Boogie", "Mondrian was still working on Victory Boogie Woogie when he died in 1944.", ["cat", "star"]),
        S("Tree to Grid", "Mondrian's early paintings of trees slowly turned into grids.", ["cat", "tree"]),
        S("Diamond Rooms", "Mondrian also painted grids turned on their corner, like a diamond.", ["cat", "heart"])
      ] }),
    A({ id: "klee", name: "Paul Klee", born: 1879, died: 1940, inspired: "Inspired by Paul Klee",
      style: ["little squares of color", "simple rules", "fish and castles"], palette: ["#f4a261", "#e9c46a", "#2a9d8f", "#264653"],
      templates: ["patchwork", "dot-field"], concepts: ["regions", "collide"],
      series: [
        S("Fish Magic", "Klee painted Fish Magic, with fish floating in a dark blue night.", ["fish", "moon"]),
        S("Castle and Sun", "Klee's Castle and Sun is built of colored triangles and squares.", ["cat", "sun"])
      ] }),
    A({ id: "kandinsky", name: "Wassily Kandinsky", born: 1866, died: 1944, inspired: "Inspired by Wassily Kandinsky",
      style: ["circles", "colors as music", "lines and points"], palette: ["#f94144", "#f8961e", "#90be6d", "#577590"],
      templates: ["rings-thin", "rings-double", "sound-wave"], concepts: ["spirals-circles", "collide"],
      series: [
        S("Color Music", "Kandinsky gave his paintings musical names, like Composition and Improvisation.", ["cat", "note"]),
        S("Circle Love", "Kandinsky said he loved circles the way he once loved horses.", ["cat", "star"]),
        S("Yellow Red Blue", "He painted Yellow-Red-Blue in 1925.", ["cat", "sun"])
      ] }),
    A({ id: "escher", name: "M. C. Escher", born: 1898, died: 1972, inspired: "Inspired by M. C. Escher",
      style: ["tilings of animals", "impossible stairs", "day and night"], palette: ["#111111", "#ffffff", "#adb5bd"],
      templates: ["honeycomb", "hex-startile", "patchwork"], concepts: ["collide", "hidden-picture"],
      series: [
        S("Day and Night", "In Escher's Day and Night, white birds and black birds fly in opposite directions.", ["bird", "star"]),
        S("Endless Stairs", "Escher drew stairs that seem to go up forever.", ["cat", "star"]),
        S("Fish Tiles", "Escher filled flat sheets with fish, birds and lizards that fit together.", ["fish", "star"])
      ] }),
    A({ id: "matisse", name: "Henri Matisse", born: 1869, died: 1954, inspired: "Inspired by Henri Matisse's cut-paper pictures",
      style: ["cut-paper shapes", "bright flat colors", "a snail of squares"], palette: ["#0077b6", "#e63946", "#ffb703", "#06d6a0"],
      templates: ["shape-leaf", "shape-snail", "patchwork"], concepts: ["collage", "regions"],
      series: [
        S("The Snail", "Matisse's The Snail is made of cut paper squares arranged in a spiral.", ["cat", "star"]),
        S("Jazz Book", "Matisse made a book called Jazz from cut-paper pictures.", ["cat", "note"]),
        S("Paper Icarus", "His cut-paper Icarus has a small red heart.", ["cat", "heart"])
      ] }),
    A({ id: "calder", name: "Alexander Calder", born: 1898, died: 1976, inspired: "Inspired by Alexander Calder",
      style: ["hanging mobiles", "wire", "balance"], palette: ["#e63946", "#1d3557", "#ffd166", "#111111"],
      templates: ["shape-balloon", "rings-thin"], concepts: ["chain"],
      series: [
        S("Wire Circus", "Calder made a tiny circus from wire and cloth.", ["cat", "star"]),
        S("Stabile", "His sculptures that stand still are called stabiles.", ["cat", "sun"])
      ] }),
    A({ id: "rousseau", name: "Henri Rousseau", born: 1844, died: 1910, inspired: "Inspired by Henri Rousseau's jungles",
      style: ["jungle leaves", "hidden animals", "moonlit nights"], palette: ["#2d6a4f", "#95d5b2", "#f4a261", "#1b4332"],
      templates: ["shape-palmleaf", "shape-leaf", "burrow"], concepts: ["hidden-picture"],
      series: [
        S("The Dream", "Rousseau's The Dream shows a jungle full of flowers and animals.", ["cat", "flower"]),
        S("Surprised!", "His tiger painting is called Surprised!", ["cat", "leaf"])
      ] }),
    A({ id: "gaudi", name: "Antoni Gaudí", born: 1852, died: 1926, inspired: "Inspired by Antoni Gaudí's Barcelona",
      style: ["curves from nature", "broken-tile mosaic", "towers"], palette: ["#06d6a0", "#ffd166", "#ef476f", "#118ab2"],
      templates: ["shape-babel", "honeycomb", "gold-spirals"], concepts: ["curved", "collide"],
      series: [
        S("Mosaic Bench", "Park Güell has a long, curvy bench covered in broken tile pieces.", ["cat", "sun"]),
        S("Forty Years", "Gaudí worked on the Sagrada Família church for more than 40 years.", ["cat", "star"]),
        S("Nature Curves", "Gaudí liked curved shapes from nature more than straight lines.", ["cat", "leaf"])
      ] }),
    A({ id: "afklint", name: "Hilma af Klint", born: 1862, died: 1944, inspired: "Inspired by Hilma af Klint",
      style: ["big abstract spirals", "series", "flowers and swans"], palette: ["#f4acb7", "#ffd6a5", "#9d4edd", "#ffffff"],
      templates: ["gold-spirals", "rings-petals"], concepts: ["spirals-circles"],
      series: [
        S("The Ten Largest", "Her paintings The Ten Largest show the stages of life, from childhood to old age.", ["cat", "star"]),
        S("Swan Series", "She painted a series of swans in black and white.", ["bird", "star"])
      ] }),
    // traditions (no single artist)
    A({ id: "islamic-geometry", kind: "tradition", name: "Islamic geometric patterns", inspired: "Inspired by Islamic star patterns",
      style: ["star patterns", "interlacing", "tiles"], palette: ["#1d3557", "#e9c46a", "#2a9d8f", "#ffffff"],
      templates: ["hex-startile", "honeycomb", "lattice"], concepts: ["collide"],
      series: [
        S("Compass Stars", "These star patterns were drawn with only a compass and a ruler.", ["cat", "star"]),
        S("Zellige", "Moroccan zellige tiles are cut by hand into small shapes.", ["cat", "star"])
      ] }),
    A({ id: "seigaiha", kind: "tradition", name: "Seigaiha (Japanese wave pattern)", inspired: "Inspired by the Japanese seigaiha wave pattern",
      style: ["overlapping arcs", "waves"], palette: ["#1d3557", "#a8dadc"],
      templates: ["calm-sea", "great-wave", "rings-thin"], concepts: ["curved"],
      series: [S("Blue Sea Waves", "Seigaiha means blue sea waves: rows of overlapping arcs.", ["boat", "fish"])] })
  ];

  // ---------- scene ideas (compositions to build; examples for later rounds) ----------
  const scenes = [
    { id: "cherries", status: "planned", shapes: ["fruit", "stem", "fruit"], story: "Start in one cherry, climb the stem, come back down into the other cherry." },
    { id: "barn-to-bird", status: "planned", shapes: ["barn", "grass", "tree", "bird"], story: "Leave the barn, cross the grass, climb the tree and fly out with the bird." },
    { id: "fish-in-sea", status: "planned", shapes: ["fish", "sea"], story: "A fish in its own color inside blue water; gills, fins and eye are solid no-go shapes." },
    { id: "leopard-face", status: "planned", shapes: ["face"], story: "Up close a maze, from far away a leopard's face drawn by how dense the walls are." },
    { id: "burrow-friends", status: "planned", shapes: ["burrow"], story: "Tunnels between dens where friends live; visit each den on the way to the exit." }
  ];

  const SEEDS = { version: 1, concepts, templates, inspirations, scenes };
  if (typeof module !== "undefined" && module.exports) module.exports = SEEDS;
  else { root.FMZ = root.FMZ || {}; root.FMZ.seeds = SEEDS; }
})(typeof window !== "undefined" ? window : globalThis);
