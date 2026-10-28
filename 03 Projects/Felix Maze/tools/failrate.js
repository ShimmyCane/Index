// Failure rate of one style over many seeds and all its levels: how often does the answer line touch a wall?
//   node tools/failrate.js spirals 20
"use strict";
const { load } = require("./lib");
const designs = require("./designs_data");
const ctx = load();
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const want = process.argv[2], N = +process.argv[3] || 15;
for (const d of designs.filter(x => !want || x.id === want)) {
  let tot = 0, bad = 0, nosol = 0, lv = {};
  d.variants.forEach((v, vi) => { if (!v) return; for (let level = d.levels[0]; level <= d.levels[1]; level++) for (let k = 0; k < N; k++) {
    const rc = { n: 1, family: d.family, level, source: 0, style: v.style || d.style, seed: 500 + k * 977 + vi, p: Object.assign({}, d.base, v.p), chars: v.chars };
    let m; try { m = S.buildModel(rc); } catch (e) { bad++; tot++; continue; }
    tot++; if (!m.sol) { nosol++; continue; }
    const sc = Q.score(m); if (!sc.lint.ok) bad++; lv[sc.level] = (lv[sc.level] || 0) + 1;
  } });
  console.log(d.id.padEnd(11), "fail", bad + "/" + tot, "nosol", nosol, "levels reached", JSON.stringify(lv));
}
