// Layout check: the start and finish pictures must not run into the title (top left), the footer (bottom) or the page edge.
//   node tools/check_layout.js            every maze in the bank; exit 1 if any problem
// Also used by tools/generate.js (layoutProblems) so a maze whose characters collide with the words is never published.
"use strict";
const { load } = require("./lib");

function layoutProblems(S, rc) {
  const { svg } = S.svg(rc), out = [];
  const zm = svg.match(/class="fmz-zoom" transform="translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/);
  const z = zm ? { cx: +zm[1], cy: +zm[2], k: +zm[3] } : null;
  const lm = svg.match(/class="fmz-lift" transform="translate\(0 (-?[\d.]+)\)/), lift = lm ? +lm[1] : 0;
  for (const which of ["start", "finish"]) {
    const m = svg.match(new RegExp(`class="fmz-${which}"><g transform="translate\\(([\\d.-]+) ([\\d.-]+)\\) rotate\\([\\d.-]+\\) scale\\(([\\d.]+)\\)`));
    if (!m) continue;
    let x = +m[1], y = +m[2], r = 52 * +m[3];
    if (z) { x = z.cx + (x - z.cx) * z.k; y = z.cy + (y - z.cy) * z.k; r *= z.k; }
    y += lift;
    const title = x + r > 30 && x - r < 345 && y + r > 25 && y - r < 88;
    const foot = y + r > 776;
    const edge = x - r < 12 || x + r > 1088 || y - r < 6;
    if (title) out.push(which + " picture runs into the title");
    if (foot) out.push(which + " picture runs into the footer");
    if (edge) out.push(which + " picture runs off the page");
  }
  return out;
}
module.exports = { layoutProblems };

if (require.main === module) {
  const ctx = load(), S = ctx.FMZ.sheet;
  let bad = 0;
  for (const rc of ctx.FMZ_CATALOG.filter(r => !r.retired)) {
    const p = layoutProblems(S, rc);
    if (p.length) { bad++; console.log(S.code(rc).padEnd(8), (rc.title || "").padEnd(24), p.join("; ")); }
  }
  console.log(bad ? bad + " mazes with layout problems" : "all layouts clear");
  process.exit(bad ? 1 : 0);
}
