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
const designs = require("./designs_data");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const BATCH = +opt("batch", 1), TRIES = +opt("tries", 90), DRY = !!opt("dry", false), ONLY = opt("only", null);

const ctx = load();
const S = ctx.FMZ.sheet, Q = ctx.FMZ.score;
const vr = require("./verify_raster");

// Levels per batch of 50: 40 / 70 / 56 / 24 / 10 over the four batches (mean 2.5).
const QUOTAS = { 1: [10, 18, 14, 6, 2], 2: [10, 17, 14, 6, 3], 3: [10, 18, 14, 6, 2], 4: [10, 17, 14, 6, 3] }[BATCH];
if (!QUOTAS) { console.log("batch must be 1 to 4"); process.exit(1); }
const vi = BATCH - 1;

// ---------- the slots ----------
const catalog = ctx.FMZ_CATALOG.slice();
const have = new Map(catalog.map(r => [r.n, r]));
const slots = [];
designs.forEach((d, di) => {
  const v = d.variants[vi];
  const n = 50 * vi + di + 1;
  slots.push({ d, di, v, n, existing: have.get(n) || null });
});

// ---------- calibration: which levels can a design reach, and at what cell size? ----------
// Effort depends on how many cells the maze has (about size^-1.8). Paths narrower than about 0.3 in are hard for a
// pencil, so there is a floor on the cell size; the hardest levels get a bigger maze on the page instead (zoom, up to
// 1.2, which still leaves white margins). Some designs top out below level 5, and that is fine.
const MIN_CELL = 36, MAX_CELL = 110, MAX_ZOOM = 1.2;
const CENTER = { 1: 0.9, 2: 2.0, 3: 3.2, 4: 4.3, 5: 5.7 };       // effort at the middle of each level
const hashSeed = (n, k) => { let h = 2166136261 ^ n; h = Math.imul(h ^ (k + 1), 16777619); h = Math.imul(h ^ (h >>> 13), 2246822519); return (h >>> 0) % 900000 + 1000; };
const fixedCells = d => d.style === "checker";                      // its size comes from the board, not the level
// size = how big a square is on paper (1/100 in); zoom = how much of the page the maze fills
function withSize(rc0, size, zoom) { const rc = Object.assign({}, rc0, { cell: Math.round(size / zoom) }); if (zoom !== 1) rc.zoom = Math.round(zoom * 100) / 100; else delete rc.zoom; return rc; }
function medianEffort(rc0, size, zoom, n = 3) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const rc = withSize(Object.assign({}, rc0, { seed: hashSeed(rc0.n, 900 + k) }), size, zoom);
    try { const m = S.buildModel(rc); if (!m.sol) continue; out.push(Q.measure(m).effort); } catch (e) { /* skip */ }
  }
  out.sort((a, b) => a - b);
  return out.length ? out[Math.floor(out.length / 2)] : null;
}
function findCell(rc0, target) {
  let size = S.LEVELS[target].size, zoom = 1;
  for (let it = 0; it < 8; it++) {
    const e = medianEffort(rc0, size, zoom);
    if (e == null) break;
    if (Q.levelOf(e) === target && Math.abs(e - CENTER[target]) < 0.3 * CENTER[target]) break;
    const ratio = e / CENTER[target];
    if (ratio < 1) { if (size > MIN_CELL + 0.5) size = Math.max(MIN_CELL, size * Math.pow(ratio, 1 / 1.8)); else zoom = Math.min(MAX_ZOOM, zoom * Math.pow(1 / ratio, 1 / 2)); }
    else { if (zoom > 1) zoom = Math.max(1, zoom * Math.pow(1 / ratio, 1 / 2)); else size = Math.min(MAX_CELL, size * Math.pow(ratio, 1 / 1.8)); }
  }
  return { size: Math.round(size), zoom: Math.round(zoom * 100) / 100 };
}
function reach(s) {                                                 // levels this slot's design can actually produce
  if (fixedCells(s.d)) return s.d.levels.slice();
  const base = recipeFor(s, 1000, null);
  const eSmall = medianEffort(base, MIN_CELL, MAX_ZOOM), eBig = medianEffort(base, MAX_CELL, 1);
  if (eSmall == null || eBig == null) return s.d.levels.slice();
  const lo = Q.levelOf(eBig), hi = Q.levelOf(eSmall);
  const a = Math.max(lo, s.d.levels[0]), b = Math.min(hi, s.d.levels[1]);
  return a <= b ? [a, b] : [Math.min(lo, hi), Math.max(lo, hi)];
}

// ---------- level targets: match slots to the quota with each slot's allowed range ----------
function assignLevels() {
  const fixed = slots.filter(s => s.existing).map(s => s.existing.level);
  const quota = QUOTAS.slice();
  fixed.forEach(l => { quota[l - 1]--; });
  const open = slots.filter(s => !s.existing && (!ONLY || s.d.id === ONLY));
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
  if (foot.length > 150) out.push("footer is " + foot.length + " characters (150 max)");
  return out;
}
const charTags = chars => [...new Set((chars || []).map(c => (c === "cat" ? "Felix the cat" : c)))];

function recipeFor(s, seed, cell, level, zoom) {
  const { d, v } = s;
  const rc = {
    n: s.n, family: d.family, level: level || s.level, source: 0, style: v.style || d.style, seed,
    title: v.title, inspired: v.inspired || d.inspired, fun: v.fun,
    tags: [...new Set([...(d.tags || []), ...(v.tags || []), ...charTags(v.chars)])].slice(0, 7),
    design: d.id, v: vi + 1, batch: BATCH
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
  assignLevels();
  const stats = { attempts: 0, noWay: 0, lint: 0, levelMiss: 0, low: 0, raster: 0, ok: 0 };
  const perDesign = {};
  const made = [], rework = [], notes = [];
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const s of slots) {
    if (s.existing || (ONLY && s.d.id !== ONLY)) continue;
    const { d, v } = s;
    const rep = perDesign[d.id] = { n: s.n, level: s.level, attempts: 0, lint: 0, noWay: 0, levelMiss: 0, low: 0, raster: 0 };
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
          nudge++; if (cell) cell = Math.max(Math.round(MIN_CELL / zoom), Math.min(MAX_CELL, Math.round(cell * (lastEst < s.level ? 0.94 : 1.07))));
        }
        continue;
      }
      if (sc.looking < 3 || sc.overall < 3.4) { rep.low++; stats.low++; continue; }
      cands.push({ rc, sc, m });
    }
    cands.sort((a, b) => b.sc.overall - a.sc.overall);
    let chosen = null;
    for (const c of cands) {                                                   // 3. pixel check, best first
      const j = vr.job(c.rc);
      if (j.error) { rep.raster++; stats.raster++; continue; }
      const r = await page.evaluate(`(${vr.inPage.toString()})(${JSON.stringify(j)})`);
      const problems = vr.verdict(j, r);
      if (problems.length) { rep.raster++; stats.raster++; continue; }
      chosen = c; break;
    }
    if (chosen) { stats.ok++; made.push(chosen.rc); process.stdout.write("."); }
    else {                                                                     // 4. nothing passed: for repair
      const reasons = [];
      if (rep.lint) reasons.push(`answer touched a wall in ${rep.lint} of ${rep.attempts} tries`);
      if (rep.noWay) reasons.push(`no way through in ${rep.noWay}`);
      if (rep.levelMiss) reasons.push(`level ${s.level} not reached in ${rep.levelMiss} (last guess ${lastEst})`);
      if (rep.low) reasons.push(`${rep.low} scored too low to publish`);
      if (rep.raster) reasons.push(`${rep.raster} failed the pixel check`);
      rework.push({ id: `${d.id}-v${vi + 1}`, n: s.n, design: d.id, title: v.title, level: s.level, tries: rep.attempts, batch: BATCH, at: new Date().toISOString().slice(0, 10), reasons, recipe: recipeFor(s, hashSeed(s.n, 0), cell, null, zoom) });
      process.stdout.write("x");
    }
  }
  await browser.close();
  console.log("");

  // ---------- report ----------
  const lvHist = [0, 0, 0, 0, 0, 0];
  [...catalog.filter(r => r.batch === BATCH || (BATCH === 1 && r.n <= 50)), ...made].forEach(r => { lvHist[r.level]++; });
  const total = lvHist.slice(1).reduce((a, b) => a + b, 0), mean = lvHist.slice(1).reduce((a, c, i) => a + c * (i + 1), 0) / (total || 1);
  const lines = [];
  lines.push(`## Batch ${BATCH} (${new Date().toISOString().slice(0, 10)})`, "");
  lines.push(`- Slots: ${slots.length} (${slots.filter(s => s.existing).length} already in the catalog). Made: ${made.length}. Sent to rework: ${rework.length}.`);
  lines.push(`- Seeds tried: ${stats.attempts}. Rejected: no way through ${stats.noWay}, **answer touched a wall ${stats.lint}** (${(100 * stats.lint / Math.max(1, stats.attempts)).toFixed(1)}% of tries), wrong level ${stats.levelMiss}, scored too low ${stats.low}, pixel check ${stats.raster}.`);
  lines.push(`- Levels in this batch: ${lvHist.slice(1).map((c, i) => `L${i + 1}: ${c}`).join(", ")} (plan: ${QUOTAS.map((c, i) => `L${i + 1}: ${c}`).join(", ")}). Mean level ${mean.toFixed(2)}.`);
  if (notes.length) lines.push(`- Words to look at: ${notes.join(" | ")}`);
  const worst = Object.entries(perDesign).filter(([, r]) => r.lint / Math.max(1, r.attempts) > 0.15).map(([id, r]) => `${id} (${r.lint}/${r.attempts})`);
  if (worst.length) lines.push(`- Designs where more than 15% of tries had the answer touch a wall: ${worst.join(", ")}.`);
  if (rework.length) lines.push(`- For \`/fix-puzzles\`: ${rework.map(w => `${w.design} (${w.reasons.join("; ")})`).join(" | ")}`);
  lines.push("");
  console.log(lines.join("\n"));

  if (DRY) { console.log("(dry run: nothing written)"); return; }
  const next = catalog.concat(made).sort((a, b) => a.n - b.n);
  // the first ten get their design tags too, so packs can keep designs apart
  next.forEach(r => {
    if (r.design) return;
    const d = designs.find(x => x.existing === r.n);
    if (d) { r.design = d.id; r.v = 1; r.batch = 1; }
  });
  writeData("data/catalog.js", "FMZ_CATALOG", next, "The Felix Maze bank: one recipe per maze. A recipe rebuilds its maze, answer key and animation exactly.\nCode = family · level · source - counter (hex); see catalog.md. Written by tools/generate.js; the first ten were picked by hand.");
  const old = ctx.FMZ_REWORK.filter(w => w.batch !== BATCH || (ONLY && w.design !== ONLY));
  writeData("data/rework.js", "FMZ_REWORK", old.concat(rework), "Puzzles the generator could not finish cleanly (answer line touching a wall, a level that would not fit, a failed pixel check).\nThey are not in the catalog and are never printed or picked. The fix_puzzles skill repairs or replaces them. Shown on rework.html.");
  const reportFile = path.join(root, "tools", "generation_report.md");
  const prev = fs.existsSync(reportFile) ? fs.readFileSync(reportFile, "utf8") : "# Felix Maze: generation report\n\nOne section per batch: how many seeds were tried, how many were rejected and why, and the level mix against the plan.\n\n";
  const cut = prev.indexOf(`## Batch ${BATCH} `);
  fs.writeFileSync(reportFile, (cut < 0 ? prev : prev.slice(0, cut)).replace(/\n*$/, "\n\n") + lines.join("\n") + "\n");
  console.log("wrote data/catalog.js (" + next.length + " puzzles), data/rework.js (" + (old.length + rework.length) + "), tools/generation_report.md");
})().catch(e => { console.error(e); process.exit(1); });
