// Batch 7: mazes inspired by historical artists (no living artists). Same format as designs_data5.js.
// Policy: only artists who are no longer alive, so the work stays about their art and never imitates today's artists.
"use strict";

const V = (title, fun, chars, p = {}, extra = {}) => Object.assign({ title, fun, chars, p }, extra);
const D = (id, family, levels, style, base, inspired, tags, variant) => ({ id, family, levels, style, base, inspired, tags, variants: [variant] });
const BOLD = { outline: 11 };

module.exports = [
  D("monet", 3, [1, 4], "shape", { shape: "lilypad", look: BOLD }, "Inspired by Claude Monet's water lily paintings", ["lily pad", "shape maze", "painting"],
    V("Lily Pad Pond", "Monet painted his own pond garden at Giverny again and again.", ["cat", "flower"])),
  D("fuji", 3, [1, 4], "shape", { shape: "fuji", look: BOLD }, "Inspired by Hokusai's Thirty-Six Views of Mount Fuji", ["mountain", "shape maze", "print"],
    V("Mount Fuji", "Hokusai was about seventy when he made his Mount Fuji prints.", ["boat", "mountain"])),
  D("durer", 3, [1, 4], "shape", { shape: "rhino", look: BOLD }, "Inspired by Albrecht Dürer's rhinoceros print, 1515", ["rhino", "shape maze", "woodcut"],
    V("Dürer's Rhino", "Dürer never saw a rhinoceros: he drew it from a description and a sketch.", ["cat", "leaf"])),
  D("bruegel", 3, [1, 4], "shape", { shape: "babel", look: BOLD }, "Inspired by Pieter Bruegel's Tower of Babel, 1563", ["tower", "shape maze", "painting"],
    V("Tower of Rings", "Bruegel painted the tower as many rings of arches stacked up high.", ["cat", "star"])),
  D("calder", 3, [1, 4], "shape", { shape: "mobile", look: BOLD }, "Inspired by Alexander Calder's hanging mobiles", ["mobile", "shape maze", "sculpture"],
    V("Hanging Mobile", "Calder's moving sculptures are called mobiles, and a breath of air can turn them.", ["cat", "star"])),
  D("hilma", 3, [2, 3], "spirals", { v: 1 }, "Inspired by Hilma af Klint's spiral paintings, 1900s", ["spirals", "painting"],
    V("Spiral Garden", "She painted big colorful abstract pictures before many famous artists did.", ["cat", "heart"])),
  D("rousseau", 3, [1, 4], "shape", { shape: "palmleaf", look: BOLD }, "Inspired by Henri Rousseau's jungle paintings", ["jungle", "shape maze", "painting"],
    V("Jungle Leaves", "Rousseau painted jungles from imagination and from plants in a Paris garden.", ["cat", "butterfly"])),
  D("gaudi", 3, [1, 4], "shape", { shape: "lizard", look: { dots: { size: 7, gap: 13 }, wall: 7 } }, "Inspired by Antoni Gaudí's tiled lizard in Park Güell, Barcelona", ["lizard", "shape maze", "mosaic"],
    V("Mosaic Lizard", "The colorful tiled lizard in Park Güell is a fountain.", ["cat", "sun"]))
];
