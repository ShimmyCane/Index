// One way through: a perfect maze has exactly one route between any two squares, so its open passages form a tree.
// Every extra passage (a loop, or a bridge that gives a second route) is a loop. Counts loops per maze.
//   node tools/check_one_way.js            list every maze with loops, by level; exit 1 if a level 5+ maze has any
// The rule: levels 5 and up must be one way (recipe.perfect), so a player never has two routes to win.
"use strict";
const { load } = require("./lib");

function loopsOf(model) {
  const { g, links } = model;
  // passages within the reachable part (the mask keeps one piece, so this is every square)
  const cells = g.cells.length;
  let passages = 0;
  for (const i of links) if (g.edges[i] && g.edges[i].b !== null) passages++;
  return Math.max(0, passages - (cells - 1));
}
module.exports = { loopsOf };

if (require.main === module) {
  const ctx = load(), S = ctx.FMZ.sheet;
  const rows = [];
  for (const rc of ctx.FMZ_CATALOG.filter(r => !r.retired)) {
    const m = S.buildModel(rc);
    rows.push({ code: S.code(rc), level: rc.level, loops: loopsOf(m), perfect: !!rc.perfect, title: rc.title || "" });
  }
  const bad = rows.filter(r => r.loops > 0 && r.level >= 5);
  const byLevel = {};
  rows.forEach(r => { byLevel[r.level] = byLevel[r.level] || [0, 0]; byLevel[r.level][0]++; if (r.loops) byLevel[r.level][1]++; });
  console.log("level  mazes  with loops");
  Object.keys(byLevel).sort().forEach(l => console.log(String(l).padEnd(7), String(byLevel[l][0]).padEnd(7), byLevel[l][1]));
  bad.forEach(r => console.log("  level " + r.level, r.code.padEnd(8), r.title.padEnd(24), "loops " + r.loops));
  console.log(bad.length ? bad.length + " level 5+ mazes have more than one way" : "every level 5+ maze has one way through");
  process.exit(bad.length ? 1 : 0);
}
