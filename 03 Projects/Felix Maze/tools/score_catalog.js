// Score every published maze (difficulty measures + joy) and write data/scores.js.
// Run after any change to the catalog or the engine.   node tools/score_catalog.js
"use strict";
const { load, writeData } = require("./lib");
const ctx = load(["js/engine.js", "js/art.js", "js/sheet.js", "js/doodle.js", "js/score.js", "js/shapes.js", "js/designs.js", "data/catalog.js"]);
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const out = {};
for (const rc of ctx.FMZ_CATALOG.filter(r => !r.retired)) {
  const sc = Q.score(S.buildModel(rc));
  out[rc.n] = { level: sc.level, effort: sc.effort, looking: sc.looking, doing: sc.doing, solving: sc.solving, overall: sc.overall, ok: sc.ok };
}
writeData("data/scores.js", "FMZ_SCORES", out, "Computed scores, keyed by maze counter n: guessed level, effort, Looking / Doing / Solving (1–5) and overall.\nWritten by tools/score_catalog.js; read by the library, puzzle of the day and top five.");
console.log("scored", Object.keys(out).length, "mazes");
