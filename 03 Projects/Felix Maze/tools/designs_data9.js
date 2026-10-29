// Batch 9: 50 perfect mazes (one way through, no loops) for a bell curve peaking at level 7 (about 80 minutes):
// about 8 at level 5, 15 at level 6, 27 at level 7. Levels 5 and up are always perfect (recipe.perfect), so a player
// has one route to find. Each entry reuses a design's style and changes its look and its words.
// Same format as designs_data8.js. Sources for the fun lines: tools/designs_sources.md.
"use strict";

const SRC = [...require("./designs_data"), ...require("./designs_data5"), ...require("./designs_data7")];
const V = (title, fun, chars, p = {}, extra = {}) => Object.assign({ title, fun, chars, p }, extra);

const PICK = [
  ["starry", V("Deep Night", "In Starry Night, each star has its own swirl of light around it.", ["cat", "star"], { v: 0 })],
  ["starry", V("Star Whirl", "The painting hangs in a New York museum, where you can see its thick paint up close.", ["cat", "moon"], { v: 1 })],
  ["starry", V("Blue Hour", "Van Gogh used blue and yellow together, because they look bright side by side.", ["cat", "star"], { v: 2 })],
  ["starry", V("Sky Storm", "He painted many skies in the Saint-Rémy hospital year, from his window.", ["cat", "moon"], { v: 3 })],
  ["mouse", V("Cheese Vault", "A mouse can find a crumb from very far away, by its nose.", ["mouse", "cheese"], {})],
  ["mouse", V("Whisker Run", "Mice have whiskers to feel their way in the dark.", ["mouse", "cheese"], {})],
  ["mouse", V("Cheese Stairs", "Mice can climb straight up walls, with tiny claws.", ["mouse", "cheese"], {})],
  ["honeycomb", V("Hive Tunnels", "Bees make wax in their own bodies to build their cells.", ["bee", "flower"], {})],
  ["honeycomb", V("Pollen Path", "Bees carry pollen on their legs from flower to flower.", ["bee", "flower"], {})],
  ["honeycomb", V("Honey Maze", "Honey does not spoil, so honey from old tombs can still be eaten.", ["bee", "drop"], {})],
  ["mondrian", V("Boogie Blocks", "Mondrian moved to New York in 1940 and painted its jazz streets.", ["cat", "star"], {})],
  ["mondrian", V("Yellow Rooms", "Mondrian's lines were thick and thin, but never curved.", ["cat", "sun"], { startAt: 0.25, finishAt: 0.75 })],
  ["mondrian", V("Black Line Grid", "His paintings are built from straight black lines and a few primary colors.", ["cat", "heart"], { startAt: 0.75, finishAt: 0.25 })],
  ["mondrian", V("Crossroads", "Mondrian painted his last grids with small colored squares, dancing across the canvas.", ["cat", "star"], { startAt: 0.5, finishAt: 0.5 })],
  ["seurat", V("Pointillist Park", "Seurat's dots were named pointillism, from the French word for point.", ["cat", "sun"], {})],
  ["seurat", V("Dot Garden", "His park painting was shown in 1886, and people were surprised by its dots.", ["cat", "flower"], {})],
  ["seurat", V("Light Dots", "Seurat studied how colors look next to each other.", ["cat", "star"], {})],
  ["streets", V("Grid Crossing", "Many cities planned their streets as a grid, like a sheet of paper.", ["cat", "house"], {})],
  ["streets", V("Long Block", "A block is the space between two cross streets.", ["cat", "tree"], {})],
  ["streets", V("Downtown Loop", "Some city centers are built on a grid, and others curve around a river.", ["cat", "star"], {})],
  ["klee", V("Paint Squares", "Klee studied music, and he said that his paintings had rhythm.", ["cat", "note"], {})],
  ["klee", V("Square Sky", "Klee taught at the Bauhaus school in Germany, where he shared ideas about shapes and color.", ["cat", "moon"], {})],
  ["klee", V("Checker Garden", "Klee often used the same small shapes over and over, like a rhythm.", ["cat", "flower"], {})],
  ["ants", V("Under the Hill", "Some ants farm fungus underground, like a garden.", ["ant", "crumb"], {})],
  ["ants", V("Ant Trail Deep", "Ants leave a trail of scent so the rest of the colony can follow.", ["ant", "cookie"], {})],
  ["warren", V("Burrow Hall", "A warren can have many entrances, so a rabbit can escape quickly.", ["cat", "carrot"], {})],
  ["warren", V("Warren Tunnels", "Rabbits dig the tunnels with their front paws.", ["cat", "carrot"], {})],
  ["wave", V("Breaking Wave", "Hokusai's wave is shown about to fall, with the boats far below it.", ["boat", "fish"], { v: 0 })],
  ["wave", V("Sea Lines", "Hokusai's blue came from a dye that was new in Japan at the time.", ["boat", "bird"], { v: 1 })],
  ["wave", V("Curl", "The wave's curl is shaped like a claw.", ["fish", "sun"], { v: 2 })],
  ["wave", V("Foam", "The white foam is the paper, left unpainted.", ["boat", "mountain"], { v: 3 })],
  ["spirals", V("Golden Coil", "Klimt used real gold leaf on some of his big paintings.", ["cat", "star"], { v: 0 })],
  ["spirals", V("Twisted Tree", "Klimt's tree of life is a symbol of growth.", ["cat", "tree"], { v: 1 })],
  ["spirals", V("Spiral Road", "Many roads in old towns wind in spirals up a hill.", ["cat", "house"], { v: 2 })],
  ["spirals", V("Klimt Swirl", "Klimt's Beethoven Frieze is about 34 meters long.", ["cat", "sun"], { v: 3 })],
  ["canyon", V("Stone Ribbon", "Canyon walls are often striped in different colors of rock.", ["boat", "sun"], { v: 0, thin: true })],
  ["canyon", V("Desert Bend", "Some slot canyons are so narrow that you have to turn sideways.", ["cat", "sun"], { v: 1, thin: true })],
  ["canyon", V("Sandstone Turn", "Canyons can be carved by a river over millions of years.", ["cat", "mountain"], { v: 3, thin: true })],
  ["soundwave", V("Pitch Maze", "A pitch is how high or low a sound is.", ["cat", "note"], { v: 0 })],
  ["soundwave", V("Loud Wave", "The sound of a whisper is much quieter than a shout.", ["cat", "note"], { v: 1 })],
  ["soundwave", V("Quiet Hum", "A hum is a sound you can feel in your chest.", ["cat", "heart"], { v: 2 })],
  ["hilma", V("Spirit Flowers", "Hilma af Klint painted flowers and spirals before most painters made abstract art.", ["cat", "flower"], { v: 0 })],
  ["hilma", V("Paint Rings", "She painted in series, with many pictures of one idea.", ["cat", "star"], { v: 2 })],
  ["circuit", V("Chip Board", "A circuit board has copper paths that carry tiny electric signals.", ["cat", "star"], {})],
  ["circuit", V("Circuit Loop", "Circuit boards are often two-sided, with paths on each side.", ["cat", "sun"], {})],
  ["subway", V("Night Train", "A subway map shows only the order of stations, not the real distances.", ["train", "house"], {})],
  ["lattice", V("Window Grid", "Lattice windows let in breezes and keep out strong sun.", ["cat", "sun"], {})],
  ["lattice", V("Garden Screen", "Lattice screens are often cut from wood into a fine, open pattern.", ["cat", "leaf"], {})],
  ["coral", V("Reef Ridges", "Reef corals grow only a few centimeters each year.", ["fish", "star"], {})],
  ["coral", V("Brain Coral Deep", "Brain corals can be as wide as a dining table.", ["fish", "sun"], {})]
];

module.exports = PICK.map(([id, v]) => {
  const d = SRC.find(x => x.id === id);
  if (!d) throw new Error("designs_data9: no design " + id);
  return { id, family: d.family, levels: [5, 7], style: d.style, base: d.base, inspired: d.inspired, tags: d.tags, variants: [v] };
});
