// Build every published maze and check it: it has a way through, and it hasn't changed.
// A published maze is a promise (it may already be printed), so engine changes must not alter it.
//   node tools/check_sheets.js            check against tools/fingerprints.json
//   node tools/check_sheets.js --update   accept the current mazes as the new fingerprints
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const ctx = { console, Math };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["js/engine.js", "js/art.js", "js/sheet.js", "js/doodle.js", "data/catalog.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
}
const S = ctx.FMZ.sheet;
const file = path.join(__dirname, "fingerprints.json");
const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const now = {};
let bad = 0;
for (const rc of ctx.FMZ_CATALOG) {
  const code = S.code(rc);
  const { svg, model } = S.svg(rc);
  const fp = crypto.createHash("sha1").update(svg).digest("hex").slice(0, 12);
  now[code] = fp;
  const problems = [];
  if (!model.sol) problems.push("no way through");
  if (old[code] && old[code] !== fp) problems.push("changed (was " + old[code] + ")");
  if (problems.length) bad++;
  console.log(code.padEnd(8), (rc.title || "").padEnd(22), "path", String(model.sol ? model.sol.cells.length : 0).padStart(3),
    "dead ends", String(model.deadEnds).padStart(3), fp, problems.length ? "✗ " + problems.join(", ") : "✓");
}
if (process.argv.includes("--update")) { fs.writeFileSync(file, JSON.stringify(now, null, 2) + "\n"); console.log("fingerprints updated"); }
else if (bad) { console.log(bad + " problem(s)"); process.exit(1); }
