// Build every design variant once, at the middle of its level range, and report crashes and odd mazes.
"use strict";
const { load } = require("./lib");
const designs = require("./designs_data");
const ctx = load();
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
let bad = 0;
designs.forEach((d, di) => d.variants.forEach((v, vi) => {
  if (!v) return;
  const level = Math.round((d.levels[0] + d.levels[1]) / 2);
  const rc = { n: 50 * vi + di + 1, family: d.family, level, source: 0, style: v.style || d.style, seed: 1000 + di * 7 + vi, p: Object.assign({}, d.base, v.p), chars: v.chars, title: v.title };
  try {
    const m = S.buildModel(rc), sc = Q.score(m);
    const flags = [];
    if (!m.sol) flags.push("NO WAY");
    if (!sc.lint.ok) flags.push("lint " + sc.lint.hits);
    if (m.g.cells.length < 25) flags.push("tiny " + m.g.cells.length);
    console.log(d.id.padEnd(11), "v" + (vi + 1), "L" + level, "cells", String(m.g.cells.length).padStart(4), "est", sc.level, "joy", sc.overall, flags.join(" ") || "ok");
    if (flags.length) bad++;
  } catch (e) { bad++; console.log(d.id.padEnd(11), "v" + (vi + 1), "CRASH", e.message); }
}));
console.log(bad, "flagged");
