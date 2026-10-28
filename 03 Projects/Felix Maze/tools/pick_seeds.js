// Try many seeds for one recipe and list the best: the answer must stay clear of every wall,
// the estimated level should match the intended one, then the highest joy score wins.
//   node tools/pick_seeds.js 001 [tries]      (a catalog number or code)
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { console, Math };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["js/engine.js", "js/art.js", "js/sheet.js", "js/doodle.js", "js/score.js", "data/catalog.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const want = S.parseCode(process.argv[2] || "1");
const base = want && ctx.FMZ_CATALOG.find(r => r.n === want.n);
if (!base) { console.log("no such maze"); process.exit(1); }
const tries = +process.argv[3] || 60;
const rows = [];
let rejected = 0;
for (let k = 0; k < tries; k++) {
  const seed = k === 0 ? base.seed : 1000 + k * 7919 + base.n * 31;
  const rc = Object.assign({}, base, { seed });
  const sc = Q.score(S.buildModel(rc));
  if (!sc.ok) { rejected++; continue; }
  rows.push({ seed, fit: Math.abs(sc.level - rc.level), sc });
}
rows.sort((a, b) => a.fit - b.fit || b.sc.overall - a.sc.overall);
console.log(S.code(base), base.title, "· tried", tries, "· rejected", rejected);
for (const r of rows.slice(0, 5)) console.log("seed", String(r.seed).padStart(6), "level est", r.sc.level, "(effort " + r.sc.effort + ")", "look", r.sc.looking, "do", r.sc.doing, "solve", r.sc.solving, "overall", r.sc.overall, r.seed === base.seed ? "← current" : "");
