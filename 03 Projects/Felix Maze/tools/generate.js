// Generate one batch of 50 puzzles: variant k of every one of the 50 designs (tools/designs_data.js).
//   node tools/generate.js --batch 1            build, check, and write data/ and the report
//   node tools/generate.js --batch 2 --dry      same, but write nothing
//   node tools/generate.js --batch 1 --only fish --tries 200
//
// For each slot (a design and a variant, with a counter n and a target level):
//   1. try many seeds. For each: does it have a way through, and does the answer line stay clear of every wall?
//      Anything that fails goes into the reject counts; it is never published.
//   2. keep the ones whose guessed level matches the target; nudge the cell size if a design can't reach it.
//   3. rank those by joy score (Looking / Doing / Solving) and give the best a pixel check of the picture.
//   4. if nothing passes, the slot is written to data/rework.js (for /fix-puzzles) and left empty.
// The bank follows a bell curve around level 2.5 (see the QUOTAS below).
"use strict";
const fs = require("fs"), path = require("path");
const { root, load, writeData } = require("./lib");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const REDO = opt("redo", null);                    // --redo 11,15,19: make replacements (new counters) for these mazes; the old ones are retired
const PLAN = opt("plan", null);                    // --plan tools/plans/<name>.js: puzzles planned by tools/plan.js from data/seeds.js
const BATCH = +opt("batch", 1), TRIES = +opt("tries", 90), DRY = !!opt("dry", false), ONLY = opt("only", null);

const designs1 = require("./designs_data"), designs5 = require("./designs_data5"), designs7 = require("./designs_data7"), designs8 = require("./designs_data8");
const planned = PLAN ? require(path.resolve(PLAN)) : [];
const designs = PLAN ? planned : (BATCH === 5 ? designs5 : BATCH === 7 ? designs7 : BATCH === 8 ? designs8 : designs1);
const { layoutProblems } = require("./check_layout");
const ctx = load();
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const vr = require("./verify_raster");

// Levels per batch of 50: 40 / 70 / 56 / 24 / 10 over the four batches (mean 2.5).
const QUOTAS = PLAN ? [1, 2, 3, 4, 5, 6, 7].map(l => planned.filter(d => d.level === l).length) : { 1: [10, 18, 14, 6, 2], 2: [10, 17, 14, 6, 3], 3: [10, 18, 14, 6, 2], 4: [10, 17, 14, 6, 3], 5: [10, 18, 15, 7, 0, 0, 0], 7: [2, 3, 2, 1, 0, 0, 0], 8: [0, 0, 0, 0, 0, 50, 0], 9: [0, 0, 0, 0, 8, 15, 27] }[BATCH] || [0, 0, 0, 0, 0, 0, 0];
if (!QUOTAS.some(q => q)) { console.log("batch must be 1 to 8"); process.exit(1); }
const ALL6 = BATCH === 8;                            // batch 8: every puzzle is level 6 (about 40 minutes)
const vi = BATCH >= 5 ? 0 : BATCH - 1;
const FIRST_NEW = BATCH >= 7 ? Math.max(...ctx.FMZ_CATALOG.map(r => r.n)) + 1 : 0;   // batch 7 and later: counters continue after the last one

// ---------- the slots ----------
const catalog = ctx.FMZ_CATALOG.slice();
const have = new Map(catalog.map(r => [r.n, r]));
const slots = [];
if (REDO) {
  let next = Math.max(...catalog.map(r => r.n)) + 1;
  String(REDO).split(",").map(Number).forEach(n0 => {
    const r = have.get(n0); if (!r || r.retired) return;
    const d = [...designs1, ...designs5, ...designs7, ...designs8, ...planned].find(x => x.id === r.design); if (!d) return;
    const v = d.variants[r.batch >= 5 ? 0 : r.v - 1];
    slots.push({ d, di: 0, v, n: next++, existing: null, replaces: n0, level: +opt("level", r.level), range: [+opt("level", r.level), +opt("level", r.level)], vi: r.batch >= 5 ? 0 : r.v - 1 });
  });
} else designs.forEach((d, di) => {
  if (d.living) return;                                    // never generate from a living artist
  const v = d.variants[vi];
  const n = BATCH >= 7 ? FIRST_NEW + di : BATCH === 5 ? 201 + di : 50 * vi + di + 1;
  slots.push({ d, di, v, n, existing: have.get(n) || null });
});

// ---------- calibration: which levels can a design reach, and at what cell size? ----------
// Effort depends on how many cells the maze has (about size^-1.8). Paths narrower than about 0.3 in are hard for a
// pencil, so there is a floor on the cell size; the hardest levels get a bigger maze on the page instead (zoom, up to
// 1.2, which still leaves white margins). Some designs top out below level 5, and that is fine.
const { MIN_CELL, MAX_CELL, MAX_ZOOM, floorOf, maxZoomOf } = require("./limits");   // size limits, shared with tools/plan.js
const CENTER = { 1: 0.9, 2: 2.0, 3: 3.2, 4: 4.3, 5: 5.7, 6: 7.8, 7: 9.2 };       // effort at the middle of each level
const hashSeed = (n, k) => { let h = 2166136261 ^ n; h = Math.imul(h ^ (k + 1), 16777619); h = Math.imul(h ^ (h >>> 13), 2246822519); return (h >>> 0) % 900000 + 1000; };
const fixedCells = d => d.style === "checker";                      // its size comes from the board, not the level
// size = how big a square is on paper (1/100 in); zoom = how much of the page the maze fills
function withSize(rc0, size, zoom) { const rc = Object.assign({}, rc0, { cell: Math.round(size / zoom) }); if (zoom !== 1) rc.zoom = Math.round(zoom * 100) / 100; else delete rc.zoom; return rc; }
// How hard a maze is: solution-first mazes (build "path", levels 5 and up) are measured by the simulated young solver
// (squares walked, Q.simulate), which doubles per level; grown mazes by effort, as the published bank always was.
const isPath = rc => rc.build === "path";
const diffOf = (rc, m) => { const q = Q.measure(m); return isPath(rc) ? q.sim : q.effort; };
const levelFrom = (rc, v) => (isPath(rc) ? Q.levelOfSteps(v) : Q.levelOf(v));
const centerOf = (rc, level) => (isPath(rc) ? Q.STEP_CENTER[level] : CENTER[level]);
const sizePow = rc => (isPath(rc) ? 2 : 1.8);                     // difficulty ∝ size^-pow (steps follow the square count)
function medianEffort(rc0, size, zoom, n = 3) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const rc = withSize(Object.assign({}, rc0, { seed: hashSeed(rc0.n, 900 + k) }), size, zoom);
    try { const m = S.buildModel(rc); if (!m.sol) continue; out.push(diffOf(rc, m)); } catch (e) { /* skip */ }
  }
  out.sort((a, b) => a - b);
  return out.length ? out[Math.floor(out.length / 2)] : null;
}
// A picture that is tall on the page leaves no room for the start and finish pictures if it is also zoomed: cap the zoom.
const capCache = {};
// level 6 may use a taller picture (up to 640 of the 850 units, the layout check still keeps the words clear)
function zoomCap(rc0, level = 5) {
  const key = rc0.design + "/" + rc0.style + "/" + level;
  if (capCache[key] === undefined) {
    let h = 510; try { const sp = S.buildModel(Object.assign({}, rc0, { cell: rc0.cell || 60, zoom: undefined })).spec; h = sp.box ? sp.box.h : 2 * sp.polar.R; } catch (e) { /* keep default */ }
    capCache[key] = Math.max(1, Math.min(maxZoomOf(level), Math.floor(100 * (level >= 6 ? 640 : 560) / h) / 100));
  }
  return capCache[key];
}
function findCell(rc0, target) {
  let size = S.LEVELS[target].size, zoom = 1; const floor = floorOf(target);
  for (let it = 0; it < 8; it++) {
    const e = medianEffort(rc0, size, zoom);
    if (e == null) break;
    const c = centerOf(rc0, target), pw = sizePow(rc0);
    if (levelFrom(rc0, e) === target && Math.abs(e - c) < 0.35 * c) break;
    const ratio = e / c;
    if (ratio < 1) { if (size > floor + 0.5) size = Math.max(floor, size * Math.pow(ratio, 1 / pw)); else zoom = Math.min(zoomCap(rc0, target), zoom * Math.pow(1 / ratio, 1 / 2)); }
    else { if (zoom > 1) zoom = Math.max(1, zoom * Math.pow(1 / ratio, 1 / 2)); else size = Math.min(MAX_CELL, size * Math.pow(ratio, 1 / pw)); }
  }
  return { size: Math.round(size), zoom: Math.round(zoom * 100) / 100 };
}
function reach(s) {                                                 // levels this slot's design can actually produce
  if (fixedCells(s.d)) return s.d.levels.slice();
  // measured as a perfect maze at level 7 (the most squares, the most depth), from the paper floor to the biggest cells
  const base = recipeFor(s, 1000, null, 7);
  const eSmall = medianEffort(base, floorOf(7), maxZoomOf(7)), eBig = medianEffort(base, MAX_CELL, 1);
  if (eSmall == null || eBig == null) return s.d.levels.slice();
  const lo = levelFrom(base, eBig), hi = levelFrom(base, eSmall);
  const a = Math.max(lo, s.d.levels[0]), b = Math.min(hi, s.d.levels[1]);
  return a <= b ? [a, b] : [Math.min(lo, hi), Math.max(lo, hi)];
}

// ---------- level targets: match slots to the quota with each slot's allowed range ----------
function assignLevels() {
  const fixed = slots.filter(s => s.existing).map(s => s.existing.level);
  const quota = QUOTAS.slice();
  fixed.forEach(l => { quota[l - 1]--; });
  const open = slots.filter(s => !s.existing && (!ONLY || s.d.id === ONLY));
  if (ALL6 || PLAN) { open.forEach(s => { s.level = ALL6 ? 6 : s.d.level; s.range = [s.level, s.level]; }); return; }   // planned: each puzzle has its level
  open.forEach(s => { s.range = reach(s); });
  if (ONLY) { open.forEach(s => { s.level = Math.round((s.range[0] + s.range[1]) / 2); }); return; }
  const tokens = [];
  quota.forEach((q, i) => { for (let k = 0; k < q; k++) tokens.push(i + 1); });
  // levels this design already uses in other variants (in the catalog), to keep a design's variants varied
  const used = new Map();
  catalog.forEach(r => { if (r.design) { (used.get(r.design) || used.set(r.design, new Set()).get(r.design)).add(r.level); } });
  const order = open.slice().sort((a, b) => (a.range[1] - a.range[0]) - (b.range[1] - b.range[0]));
  const matchOf = new Array(tokens.length).fill(-1);
  const tryMatch = (si, seen) => {
    const s = order[si];
    const cand = tokens.map((l, ti) => ({ l, ti })).filter(t => t.l >= s.range[0] && t.l <= s.range[1])
      .sort((a, b) => ((used.get(s.d.id) || new Set()).has(a.l) ? 1 : 0) - ((used.get(s.d.id) || new Set()).has(b.l) ? 1 : 0));
    for (const { ti } of cand) {
      if (seen.has(ti)) continue; seen.add(ti);
      if (matchOf[ti] < 0 || tryMatch(matchOf[ti], seen)) { matchOf[ti] = si; return true; }
    }
    return false;
  };
  let unmatched = 0;
  order.forEach((s, si) => { if (!tryMatch(si, new Set())) unmatched++; });
  matchOf.forEach((si, ti) => { if (si >= 0) order[si].level = tokens[ti]; });
  // any slot the quota couldn't place gets the nearest level in its range to 2.5
  order.forEach(s => { if (!s.level) { s.level = Math.max(s.range[0], Math.min(s.range[1], 2)); s.moved = true; } });
  if (unmatched) console.log("note:", unmatched, "slots could not fit the quota exactly and took a level near 2");
}
// ---------- checks on the words ----------
const BAD_WORDS = /\b(kill|killed|dead|death|die|gun|weapon|sword|war|battle|blood|scary|ghost|devil|hate|fight|bomb|drug|beer|wine|sex|stupid|ugly|fat|monster)\b/i;
function wordProblems(rc) {
  const out = [], text = [rc.title, rc.inspired, rc.fun].join(" ");
  const bad = text.match(BAD_WORDS); if (bad) out.push("word to check: " + bad[0]);
  const foot = ["Felix Maze #000-000", rc.title, rc.inspired, rc.fun].join("  ·  ");
  const lines = [["Felix Maze #000-000", rc.title, rc.inspired].join("  ·  "), rc.fun];   // long footers wrap to two lines (sheet.js)
  if (foot.length > 135 && lines.some(l => l.length > 150)) out.push("a footer line is longer than 150 characters");
  return out;
}
const charTags = chars => [...new Set((chars || []).map(c => (c === "cat" ? "Felix the cat" : c)))];

function recipeFor(s, seed, cell, level, zoom) {
  const { d, v } = s;
  const lvl = level || s.level;
  const rc = {
    n: s.n, family: d.family, level: level || s.level, source: 0, style: v.style || d.style, seed,
    title: v.title, inspired: v.inspired || d.inspired, fun: v.fun,
    tags: [...new Set([...(d.tags || []), ...(v.tags || []), ...charTags(v.chars)])].slice(0, 7),
    design: d.id, v: (s.vi !== undefined ? s.vi : vi) + 1, batch: BATCH, ...(s.replaces ? { replaces: s.replaces } : {}),
    ...(lvl >= 5 || s.perfect ? { perfect: true } : {}),         // levels 5 and up: one way through (no loops, no bridges)
    // levels 5 and up are built solution first: the right path is laid out (sweeping back and forth, twisting), the
    // wrong turns are hung off it where they look like the way, then the maze is grown around it
    ...(lvl >= 5 && !s.d.noPath ? { build: "path", pathCfg: { waypoints: lvl >= 7 ? 4 : lvl >= 6 ? 3 : 2, len: 0.25, twist: 0.8, away: 0.7, lure: 1, mix: 0.3 } } : {})
  };
  const p = Object.assign({}, d.base, v.p);
  if (Object.keys(p).length) rc.p = p;
  if (v.chars) rc.chars = v.chars;
  if (cell) rc.cell = cell;
  if (zoom && zoom !== 1) rc.zoom = zoom;
  return rc;
}

// ---------- the work ----------
(async () => {
  if (!REDO) assignLevels();
  if (opt("ranges", false)) slots.filter(s => !s.existing).forEach(s => console.log(s.d.id.padEnd(12), "range", s.range && s.range.join("-"), "→ level", s.level));
  const stats = { attempts: 0, noWay: 0, lint: 0, levelMiss: 0, low: 0, raster: 0, layout: 0, ok: 0 };
  const perDesign = {};
  const made = [], rework = [], notes = [];
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const s of slots) {
    if (s.existing || (ONLY && s.d.id !== ONLY)) continue;
    const { d, v } = s;
    const rep = perDesign[d.id] = { n: s.n, level: s.level, attempts: 0, lint: 0, noWay: 0, levelMiss: 0, low: 0, raster: 0, layout: 0 };
    const words = wordProblems(recipeFor(s, 1));
    if (words.length) notes.push(`${d.id} v${vi + 1}: ${words.join("; ")}`);
    let cell = null, zoom = 1, nudge = 0, lastEst = null;
    if (!fixedCells(d)) { const f = findCell(recipeFor(s, 1000), s.level); zoom = f.zoom; cell = Math.round(f.size / zoom); rep.cell = f.size; rep.zoom = zoom; }
    const cands = [];
    for (let k = 0; k < TRIES && cands.length < 8; k++) {
      const seed = hashSeed(s.n, k);
      const rc = recipeFor(s, seed, cell, null, zoom);
      stats.attempts++; rep.attempts++;
      let m;
      try { m = S.buildModel(rc); } catch (e) { rep.noWay++; stats.noWay++; continue; }
      if (!m.sol) { rep.noWay++; stats.noWay++; continue; }
      const sc = Q.score(m);
      if (!sc.lint.ok) { rep.lint++; stats.lint++; continue; }               // 1. the answer line must clear every wall
      if (sc.level !== s.level) {                                              // 2. the level must fit
        rep.levelMiss++; stats.levelMiss++; lastEst = sc.level;
        if (rep.levelMiss % 8 === 0 && nudge < 4) {                           // a design that can't reach its level: nudge the cells
          nudge++; if (cell) cell = Math.max(Math.round(floorOf(s.level) / zoom), Math.min(MAX_CELL, Math.round(cell * (lastEst < s.level ? 0.94 : 1.07))));
        }
        continue;
      }
      // level 6 covers more of the page (its pictures are big), so white space scores lower; its bar is set lower on
      // Looking, and the lower overall bar is the one Jimmy should confirm (see the generation report)
      const lookMin = s.level >= 6 ? 1.9 : s.level === 5 ? 2.4 : 3, overallMin = s.level >= 6 ? 3.0 : s.level === 5 ? 3.2 : 3.4;
      if (sc.looking < lookMin || sc.overall < overallMin) { rep.low++; stats.low++; continue; }
      if (layoutProblems(S, rc).length) { rep.layout++; stats.layout++; continue; }   // the pictures must not run into the title or footer
      cands.push({ rc, sc, m });
    }
    cands.sort((a, b) => b.sc.overall - a.sc.overall);
    let chosen = null;
    for (const c of cands) {                                                   // 3. pixel check, best first
      const j = vr.job(c.rc);
      if (j.error) { rep.raster++; stats.raster++; continue; }
      const r = await page.evaluate(`(${vr.inPage.toString()})(${JSON.stringify(j)})`);
      const problems = vr.verdict(j, r);
      if (problems.length) { rep.raster++; stats.raster++; rep.rasterWhy = rep.rasterWhy || problems[0]; continue; }
      chosen = c; break;
    }
    if (chosen) { stats.ok++; made.push(chosen.rc); process.stdout.write("."); }
    else {                                                                     // 4. nothing passed: for repair
      const reasons = [];
      if (rep.lint) reasons.push(`answer touched a wall in ${rep.lint} of ${rep.attempts} tries`);
      if (rep.noWay) reasons.push(`no way through in ${rep.noWay}`);
      if (rep.levelMiss) reasons.push(`level ${s.level} not reached in ${rep.levelMiss} (last guess ${lastEst})`);
      if (rep.low) reasons.push(`${rep.low} scored too low to publish`);
      if (rep.layout) reasons.push(`${rep.layout} had a start or finish picture running into the words`);
      if (rep.raster) reasons.push(`${rep.raster} failed the pixel check (${rep.rasterWhy || "?"})`);
      rework.push({ id: `${d.id}-v${vi + 1}`, n: s.n, design: d.id, title: v.title, level: s.level, tries: rep.attempts, batch: BATCH, at: new Date().toISOString().slice(0, 10), reasons, recipe: recipeFor(s, hashSeed(s.n, 0), cell, null, zoom) });
      process.stdout.write("x");
    }
  }
  await browser.close();
  console.log("");

  // ---------- report ----------
  const lvHist = [0, 0, 0, 0, 0, 0, 0, 0];
  [...catalog.filter(r => r.batch === BATCH || (BATCH === 1 && r.n <= 50)), ...made].forEach(r => { lvHist[r.level]++; });
  const total = lvHist.slice(1).reduce((a, b) => a + b, 0), mean = lvHist.slice(1).reduce((a, c, i) => a + c * (i + 1), 0) / (total || 1);
  const lines = [];
  lines.push(REDO ? `## Repairs, batch ${BATCH} (${new Date().toISOString().slice(0, 10)}): ${REDO} replaced with new counters; the old ones are retired` : `## Batch ${BATCH}${PLAN ? " (plan " + path.basename(PLAN, ".js") + ")" : ""} (${new Date().toISOString().slice(0, 10)})`, "");
  lines.push(`- Slots: ${slots.length} (${slots.filter(s => s.existing).length} already in the catalog). Made: ${made.length}. Sent to rework: ${rework.length}.`);
  lines.push(`- Seeds tried: ${stats.attempts}. Rejected: no way through ${stats.noWay}, **answer touched a wall ${stats.lint}** (${(100 * stats.lint / Math.max(1, stats.attempts)).toFixed(1)}% of tries), wrong level ${stats.levelMiss}, scored too low ${stats.low}, pictures hit the words ${stats.layout}, pixel check ${stats.raster}.`);
  lines.push(`- Levels in this batch: ${lvHist.slice(1).map((c, i) => `L${i + 1}: ${c}`).join(", ")} (plan: ${QUOTAS.map((c, i) => `L${i + 1}: ${c}`).join(", ")}). Mean level ${mean.toFixed(2)}.`);
  if (notes.length) lines.push(`- Words to look at: ${notes.join(" | ")}`);
  const worst = Object.entries(perDesign).filter(([, r]) => r.lint / Math.max(1, r.attempts) > 0.15).map(([id, r]) => `${id} (${r.lint}/${r.attempts})`);
  if (worst.length) lines.push(`- Designs where more than 15% of tries had the answer touch a wall: ${worst.join(", ")}.`);
  if (rework.length) lines.push(`- For \`/fix-puzzles\`: ${rework.map(w => `${w.design} (${w.reasons.join("; ")})`).join(" | ")}`);
  lines.push("");
  console.log(lines.join("\n"));

  if (DRY) { console.log("(dry run: nothing written)"); return; }
  const replaced = new Set(made.map(r => r.replaces).filter(Boolean));
  const next = catalog.map(r => replaced.has(r.n) ? Object.assign({}, r, { retired: true }) : r).concat(made).sort((a, b) => a.n - b.n);
  // the first ten get their design tags too, so packs can keep designs apart
  next.forEach(r => {
    if (r.design) return;
    const d = designs.find(x => x.existing === r.n);
    if (d) { r.design = d.id; r.v = 1; r.batch = 1; }
  });
  writeData("data/catalog.js", "FMZ_CATALOG", next, "The Felix Maze bank: one recipe per maze. A recipe rebuilds its maze, answer key and animation exactly.\nCode = family · level · source - counter (hex); see catalog.md. Written by tools/generate.js; the first ten were picked by hand.");
  const old = REDO ? ctx.FMZ_REWORK : ctx.FMZ_REWORK.filter(w => w.batch !== BATCH || (ONLY && w.design !== ONLY));
  writeData("data/rework.js", "FMZ_REWORK", old.concat(rework), "Puzzles the generator could not finish cleanly (answer line touching a wall, a level that would not fit, a failed pixel check).\nThey are not in the catalog and are never printed or picked. The fix_puzzles skill repairs or replaces them. Shown on rework.html.");
  const reportFile = path.join(root, "tools", "generation_report.md");
  const prev = fs.existsSync(reportFile) ? fs.readFileSync(reportFile, "utf8") : "# Felix Maze: generation report\n\nOne section per batch: how many seeds were tried, how many were rejected and why, and the level mix against the plan.\n\n";
  const cut = REDO ? -1 : prev.indexOf(`## Batch ${BATCH} `);
  fs.writeFileSync(reportFile, (cut < 0 ? prev : prev.slice(0, cut)).replace(/\n*$/, "\n\n") + lines.join("\n") + "\n");
  console.log("wrote data/catalog.js (" + next.length + " puzzles), data/rework.js (" + (old.length + rework.length) + "), tools/generation_report.md");
})().catch(e => { console.error(e); process.exit(1); });
