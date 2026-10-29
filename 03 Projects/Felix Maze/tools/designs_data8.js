// Batch 8: 50 puzzles, all level 6 (about 40 minutes). Level 6 is the top of the scale now: it needs big mazes (many squares),
// so these come from the styles that reach it at a printable size (large open pictures: starry skies, rooms, waves, spirals,
// dots, streets, squares, canyons, sound waves, burrows, and a few others). Each entry reuses a design's style and changes its
// look (p.v, startAt/finishAt, thin) and its words. Only historical or traditional sources are used.
// Same format as designs_data5.js: `variants[0]` is the puzzle. Sources for the fun lines: tools/designs_sources.md.
"use strict";

const SRC = [...require("./designs_data"), ...require("./designs_data5"), ...require("./designs_data7")];
const V = (title, fun, chars, p = {}, extra = {}) => Object.assign({ title, fun, chars, p }, extra);

const PICK = [
  // starry skies (Van Gogh, 1889)
  ["starry", V("Night Sky Path", "Van Gogh painted much of this sky during the day, from memory, and added the stars.", ["cat", "star"], { v: 0 })],
  ["starry", V("Moonlit Swirl", "The tall dark tree in the painting looks like a flame.", ["cat", "moon"], { v: 1 })],
  ["starry", V("Sky Over the Hills", "Van Gogh often painted outdoors, in one or two sittings.", ["cat", "star"], { v: 2 })],
  ["starry", V("Painted Wind", "The swirls make the sky look like it is turning in the wind.", ["cat", "moon"], { v: 3 })],
  // Mondrian: rooms of straight lines (1920s to 1940s)
  ["mondrian", V("Broadway Rooms", "Mondrian loved jazz, and he painted this city as lively blocks of color.", ["cat", "star"], {})],
  ["mondrian", V("Red Yellow Blue", "Mondrian used only red, yellow and blue, plus black, white and gray.", ["cat", "sun"], { startAt: 0.25, finishAt: 0.75 })],
  ["mondrian", V("Grid of Colors", "His grids use straight lines only. He avoided curves.", ["cat", "star"], { startAt: 0.75, finishAt: 0.25 })],
  ["mondrian", V("Heavy Line Room", "Mondrian's thick black lines were placed off-center on purpose.", ["cat", "heart"], {})],
  // Seurat: dots (1884 to 1886)
  ["seurat", V("Sunday Dots", "Seurat built this park scene from thousands of tiny dots of paint.", ["cat", "sun"], {})],
  ["seurat", V("Park Picnic", "Seurat spent about two years on his big park painting.", ["cat", "flower"], {})],
  ["seurat", V("Dotted Shade", "The dots blend in your eye, so the colors mix without being mixed on the paper.", ["cat", "tree"], {})],
  ["seurat", V("Quiet Afternoon", "The people in the painting stand still, as if time has slowed down.", ["cat", "star"], {})],
  // city streets (Manhattan grid, 1811)
  ["streets", V("Grid Town", "The street grid of Manhattan, New York, was planned in 1811.", ["cat", "house"], {})],
  ["streets", V("One-Way Avenue", "Many city streets are one-way, so traffic keeps moving.", ["cat", "house"], {})],
  ["streets", V("Hilltop Blocks", "A grid of blocks makes it easy to find your way around a city.", ["cat", "star"], {})],
  ["streets", V("Night Streets", "Early city streetlights were lit one by one, by hand.", ["cat", "moon"], {})],
  // Paul Klee: squares (1920s and 1930s)
  ["klee", V("Magic Squares", "Paul Klee liked to make pictures from simple squares and a few small rules.", ["cat", "star"], {})],
  ["klee", V("Patchwork Garden", "Klee painted gardens, cities and dreams, often as blocks of color.", ["cat", "flower"], {})],
  ["klee", V("Line for a Walk", "Klee said that drawing is taking a line for a walk.", ["cat", "leaf"], {})],
  ["klee", V("Quilt of Rooms", "Many patchwork quilts are made of squares sewn together by hand.", ["cat", "heart"], {})],
  // Hokusai: waves (about 1831)
  ["wave", V("Wave Crest", "Hokusai's foam looks like long curled fingers, reaching for the boats.", ["boat", "fish"], { v: 0 })],
  ["wave", V("Tall Water", "Hokusai's great wave print is one of the most copied pictures in the world.", ["boat", "mountain"], { v: 1 })],
  ["wave", V("Ocean Lines", "Each print was made from carved wood blocks, one color at a time.", ["fish", "sun"], { v: 2 })],
  ["wave", V("Blue Water", "A new blue dye from Europe colored the sea in this print.", ["boat", "bird"], { v: 3 })],
  // Klimt: spirals and gold (about 1909)
  ["spirals", V("Golden Spiral", "Klimt used real gold leaf in some of his paintings.", ["cat", "star"], { v: 0 })],
  ["spirals", V("Tree of Life", "Klimt's tree is a golden pattern of spirals and flowers.", ["cat", "tree"], { v: 1 })],
  ["spirals", V("Twisting Vines", "Spirals show up in plants: vines, ferns and curling leaves.", ["cat", "leaf"], { v: 2 })],
  ["spirals", V("Klimt Gold", "Klimt painted with gold, silver and bright colors on big wall pictures.", ["cat", "sun"], { v: 3 })],
  // Antelope Canyon, Arizona (carved by water)
  ["canyon", V("Canyon Bends", "Water carves curves into sandstone canyons over thousands of years.", ["boat", "sun"], { v: 0, thin: true })],
  ["canyon", V("Smooth Walls", "Flash floods can carve the walls of a slot canyon very smooth.", ["cat", "sun"], { v: 1, thin: true })],
  ["canyon", V("Curving Rock", "Antelope Canyon is in Arizona, on Navajo land.", ["cat", "star"], { v: 3, thin: true })],
  ["canyon", V("Layered Stone", "Canyon walls show layers of rock, each one from a different time.", ["cat", "mountain"], { v: 0, thin: false })],
  // sound waves (a drawing of sound)
  ["soundwave", V("Sound Trail", "Sound is a wave of moving air.", ["cat", "note"], { v: 0 })],
  ["soundwave", V("Loud and Soft", "A louder sound makes a taller wave.", ["cat", "note"], { v: 1 })],
  ["soundwave", V("Fast and Slow", "A higher sound makes a wave that wiggles more often.", ["cat", "note"], { v: 2 })],
  ["soundwave", V("Hum", "Your voice makes waves in the air that you cannot see.", ["cat", "heart"], { v: 3 })],
  // ants and burrows
  ["ants", V("Ant Hill", "Ants can lift many times their own weight.", ["ant", "crumb"], {})],
  ["ants", V("Crumb Race", "Ants find the short way to food by following a scent trail.", ["ant", "cookie"], {})],
  ["warren", V("Underground Burrow", "Rabbits dig burrows with many rooms and tunnels.", ["cat", "carrot"], {})],
  ["warren", V("Warren Home", "A group of rabbits living underground is called a warren.", ["cat", "carrot"], {})],
  // mice, bees, carpets and lattice
  ["mouse", V("Cheese Hunt", "A mouse can squeeze through a gap about the width of a pencil.", ["mouse", "cheese"], {})],
  ["mouse", V("Mouse Maze Deluxe", "Mice have a very good sense of smell.", ["mouse", "cheese"], {})],
  ["mouse", V("Long Tail Trail", "A mouse uses its long tail to help it balance.", ["mouse", "cheese"], {})],
  ["honeycomb", V("Honey Hall", "A honeycomb cell is a hexagon, which fits with no gaps at all.", ["bee", "flower"], {})],
  ["honeycomb", V("Comb Labyrinth", "A honeybee hive can hold tens of thousands of bees.", ["bee", "house"], {})],
  ["honeycomb", V("Worker Bees", "Worker bees in a hive are all female.", ["bee", "drop"], {})],
  ["klee", V("Square Garden", "Klee's little squares were often arranged like the beds in a garden.", ["cat", "flower"], {})],
  ["mondrian", V("Rooms in Blue", "Mondrian's last paintings replaced black lines with small colored squares.", ["cat", "star"], { startAt: 0.5, finishAt: 0.5 })],
  ["lattice", V("Window Screen", "Lattice windows let in air and light and keep out the glare.", ["cat", "sun"], {})],
  ["lattice", V("Lattice Garden", "Chinese gardens used lattice windows to frame views like pictures.", ["cat", "leaf"], {})]
];

module.exports = PICK.map(([id, v]) => {
  const d = SRC.find(x => x.id === id);
  if (!d) throw new Error("designs_data8: no design " + id);
  return { id, family: d.family, levels: [6, 6], style: d.style, base: d.base, inspired: d.inspired, tags: d.tags, variants: [v] };
});
