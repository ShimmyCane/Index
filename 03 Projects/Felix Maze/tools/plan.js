// Plan a batch from a brief: picks inspirations, series items and templates from data/seeds.js, so making 50 new
// puzzles needs a few lines of JSON instead of a hand-written design file.
//   node tools/plan.js briefs/batch9.json          writes tools/plans/<name>.js and prints the plan
//   node tools/generate.js --plan tools/plans/batch9.js --batch 9 [--dry]
// Brief: { "name": "batch9", "count": 50, "levels": { "5": 8, "6": 15, "7": 27 },
//          "inspirations": ["turner", ...] or "all", "maxPerInspiration": 4, "seed": 9 }
// Rules it keeps: historical artists only (living false and a year of death), only "ready" templates, a template
// that can reach the level, titles never reused (not in the catalog, not twice in the plan), inspirations spread out.
"use strict";
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const SEEDS = require(path.join(root, "data", "seeds.js"));
const { load } = require("./lib");

const file = process.argv[2];
if (!file) { console.log("usage: node tools/plan.js briefs/<name>.json"); process.exit(1); }
const brief = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const ctx = load(), used = new Set(ctx.FMZ_CATALOG.map(r => (r.title || "").toLowerCase()));

// deterministic shuffle
let st = (brief.seed || 1) >>> 0;
const rnd = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Measured reach: for each template, can it really make a level-L maze at that level's smallest squares, with the
// answer line clear of every wall and the start and finish pictures clear of the words? Built once per template (three test mazes per level) and cached in
// tools/plans/reach.json, so the plan only uses templates for levels they can draw cleanly.
const { floorOf, maxZoomOf } = require("./limits");
const { layoutProblems } = require("./check_layout");
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const reachFile = path.join(root, "tools", "plans", "reach.json");
const reachCache = fs.existsSync(reachFile) ? JSON.parse(fs.readFileSync(reachFile, "utf8")) : {};
function reachOf(t) {
  const key = t.id + ":" + JSON.stringify(t.p) + ":" + t.style;
  if (reachCache[key]) return reachCache[key];
  let top = 0;
  for (let L = 1; L <= 7; L++) {
    let good = 0;
    for (const zoom of [maxZoomOf(L), 1.1, 1]) {
    if (good >= 2) break;
    good = 0;
    const cell = Math.round(floorOf(L) / zoom);
    for (let k = 0; k < 3; k++) {
      const rc = { n: 990 + k, family: 3, level: L, source: 0, style: t.style, seed: 4242 + 97 * k, title: "t", inspired: "i", fun: "f", tags: [], p: t.p, chars: ["cat", "star"], cell, zoom: zoom === 1 ? undefined : zoom };
      if (L >= 5) Object.assign(rc, { perfect: true, build: "path", pathCfg: { waypoints: L >= 7 ? 4 : L >= 6 ? 3 : 2, len: 0.25, twist: 0.8, away: 0.7, lure: 1, mix: 0.3 } });
      try { const m = S.buildModel(rc), sc = Q.score(m); if (sc.lint.ok && sc.level >= L && !layoutProblems(S, rc).length) good++; } catch (e) { /* no */ }
    }
    }
    if (good >= 2) top = L;
  }
  reachCache[key] = { top, at: new Date().toISOString().slice(0, 10) };
  return reachCache[key];
}
const T = new Map(SEEDS.templates.filter(t => t.status === "ready").map(t => [t.id, Object.assign({}, t, { levels: [t.levels[0], Math.min(t.levels[1], reachOf(t).top)] })]));
fs.mkdirSync(path.dirname(reachFile), { recursive: true });
fs.writeFileSync(reachFile, JSON.stringify(reachCache, null, 1));
const ok = insp => !insp.living && (insp.kind !== "artist" || insp.died) && (brief.inspirations === "all" || !brief.inspirations || brief.inspirations.includes(insp.id));
const insps = SEEDS.inspirations.filter(ok);
const refused = SEEDS.inspirations.filter(i => i.living || (i.kind === "artist" && !i.died)).map(i => i.id);
// the pool: every unused series item
const pool = new Map(insps.map(i => [i.id, i.series.filter(s => !used.has(s.title.toLowerCase()))]));

// level tokens, hardest first (they have the fewest templates)
const tokens = [];
Object.entries(brief.levels || {}).forEach(([l, n]) => { for (let k = 0; k < n; k++) tokens.push(+l); });
tokens.sort((a, b) => b - a);
const count = Math.min(brief.count || tokens.length, tokens.length);
const per = new Map(), titles = new Set(), plan = [], short = [];
const maxPer = brief.maxPerInspiration || 4;
let lastInsp = null;
for (const level of tokens.slice(0, count)) {
  // inspirations with something left, fewest used first, never the same one twice in a row
  const order = shuffle(insps.slice()).sort((a, b) => (per.get(a.id) || 0) - (per.get(b.id) || 0));
  // first pass: an inspiration whose own templates can reach the level; second pass (last resort): borrow a page template
  const fits = t => t && t.levels[0] <= level && level <= t.levels[1];
  let pick = null;
  for (const borrow of [false, true]) {
    for (const insp of order) {
      if ((per.get(insp.id) || 0) >= maxPer || insp.id === lastInsp) continue;
      const items = pool.get(insp.id).filter(s => !titles.has(s.title));
      if (!items.length) continue;
      let tpl = shuffle(insp.templates.map(id => T.get(id)).filter(fits))[0];
      if (!tpl && borrow) tpl = shuffle([...T.values()].filter(t => t.kind === "page" && fits(t) && (t.tags || []).some(g => insp.style.join(" ").includes(g))))[0];
      if (!tpl) continue;
      pick = { insp, item: items[0], tpl, borrowed: !insp.templates.includes(tpl.id) };
      break;
    }
    if (pick) break;
  }
  if (!pick) { short.push(level); continue; }
  const { insp, item, tpl } = pick;
  titles.add(item.title); per.set(insp.id, (per.get(insp.id) || 0) + 1); lastInsp = insp.id;
  plan.push({
    id: insp.id + "-" + tpl.id, family: insp.family, level, levels: [level, level], style: tpl.style, base: tpl.p,
    inspired: insp.inspired, tags: [...new Set([...(tpl.tags || []), insp.kind === "artist" ? "painting" : insp.name.toLowerCase()])].slice(0, 4),
    seedInspiration: insp.id, seedTemplate: tpl.id, ...(pick.borrowed ? { borrowedTemplate: true } : {}),
    variants: [{ title: item.title, fun: item.fun, chars: item.chars, p: item.p || {} }]
  });
}

const name = brief.name || path.basename(file, ".json");
const out = path.join(root, "tools", "plans", name + ".js");
fs.writeFileSync(out, `// Plan "${name}", made by tools/plan.js from ${path.relative(root, path.resolve(file))} on ${new Date().toISOString().slice(0, 10)}.\n// Each entry: an inspiration's series item drawn with a ready template at a fixed level. Edit freely, then:\n//   node tools/generate.js --plan tools/plans/${name}.js --batch ${brief.batch || "N"}\n"use strict";\nmodule.exports = ${JSON.stringify(plan, null, 1)};\n`);
const hist = {}; plan.forEach(p => { hist[p.level] = (hist[p.level] || 0) + 1; });
const byI = {}; plan.forEach(p => { byI[p.seedInspiration] = (byI[p.seedInspiration] || 0) + 1; });
console.log(`plan ${name}: ${plan.length} puzzles → ${path.relative(root, out)}`);
console.log("template reach (top level, measured):", [...T.values()].map(t => t.id + " " + t.levels[1]).join(", "));
console.log("levels:", JSON.stringify(hist), short.length ? `  (could not fill ${short.length}: ${short.join(",")})` : "");
console.log("inspirations:", Object.entries(byI).map(([k, v]) => k + " " + v).join(", "));
if (refused.length) console.log("refused (living or no year of death):", refused.join(", "));
plan.forEach(p => console.log(`  L${p.level}  ${p.variants[0].title.padEnd(22)} ${p.seedInspiration.padEnd(16)} ${p.seedTemplate}`));
