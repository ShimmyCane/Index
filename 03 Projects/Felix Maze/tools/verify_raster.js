// Pixel check of what is actually drawn. For each maze:
//   overlap   red answer pixels that sit on a wall's ink (the "answer crosses a wall" look you see on paper)
//   shortcut  the picture has a shorter white route from start to finish than the red line (a visual gap or merge)
//   connected there is a white route at all
// Needs Playwright (Chromium). Usage:
//   node tools/verify_raster.js                 every published maze
//   node tools/verify_raster.js 00A 001 …       only these counters
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { console, Math };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["js/engine.js", "js/art.js", "js/sheet.js", "js/doodle.js", "js/score.js", "js/shapes.js", "js/designs.js", "data/catalog.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const S = ctx.FMZ.sheet, E = ctx.FMZ.engine;

// Build what the browser needs for one recipe (strings and numbers only).
function job(rc) {
  const model = S.buildModel(rc);
  const sol = model.sol;
  if (!sol) return { code: S.code(rc), error: "no way through" };
  const bare = S.svg(rc, { model, verify: true, bare: true }).svg;
  const ans = S.svg(rc, { model, verify: true, bare: true, answer: true }).svg;
  const z = rc.zoom || 1, w0 = model.warp || (p => p);
  const w = p => { const q = w0(p); return z === 1 ? q : [550 + (q[0] - 550) * z, 420 + (q[1] - 420) * z]; };
  const c0 = model.g.cells[sol.cells[0]], c1 = model.g.cells[sol.cells[sol.cells.length - 1]];
  const doors = [];
  for (const end of [model.start, model.end]) {
    if (end.edge < 0) continue;
    const g = model.g.edges[end.edge].geo;
    const n = 12, line = [];
    for (let k = 0; k <= n; k++) {
      if (g.t === "line") line.push(w([g.x1 + (g.x2 - g.x1) * k / n, g.y1 + (g.y2 - g.y1) * k / n]));
      else { const a = g.a0 + (g.a1 - g.a0) * k / n, q = g.squash || 1; line.push(w([g.cx + g.r * Math.cos(a), g.cy + g.r * Math.sin(a) * q])); }
    }
    doors.push(line);
  }
  const look = model.spec.look, cell = model.g.kind === "polar" ? model.g.dr : model.g.kind === "hex" ? model.g.s * 1.7 : model.g.s;
  return { code: S.code(rc), bare, ans, start: w([c0.cx, c0.cy]), end: w([c1.cx, c1.cy]), doors, zone: Math.max(10, cell * 0.42 * z), skip: look.mode === "subway", bridged: model.bridges.length > 0 };
}

// Runs in the page: draw both SVGs, compare.
async function inPage(j) {
  const W = 550, H = 425, K = W / 1100;
  const load = svg => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("svg did not load")); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace(/width="11in" height="8.5in"/, 'width="1100" height="850"')); });
  const px = img => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H); return x.getImageData(0, 0, W, H).data; };
  const a = px(await load(j.bare)), b = px(await load(j.ans));
  const N = W * H, ink = new Uint8Array(N), red = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = a[i * 4], g = a[i * 4 + 1], bl = a[i * 4 + 2];
    ink[i] = (r + g + bl) / 3 < 150 ? 1 : 0;
    const R = b[i * 4], G = b[i * 4 + 1], B = b[i * 4 + 2];
    red[i] = R > 190 && G < 140 && B < 120 && R - G > 80 ? 1 : 0;
  }
  let overlap = 0, redCount = 0;
  for (let i = 0; i < N; i++) if (red[i]) { redCount++; if (ink[i]) overlap++; }
  // red drawn on top hides ink: count red pixels sitting right next to ink the red covered (ink in `a`, red in `b`) — that is `overlap`.
  // Block the doors so the outside can't connect the two ends.
  const block = new Uint8Array(N);
  for (const line of j.doors) for (const [x, y] of line) {
    const cx = Math.round(x * K), cy = Math.round(y * K);
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = cx + dx, yy = cy + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) block[yy * W + xx] = 1; }
  }
  const idx = ([x, y]) => Math.round(y * K) * W + Math.round(x * K);
  const nearestRed = pt => {
    const cx = Math.round(pt[0] * K), cy = Math.round(pt[1] * K);
    let best = -1, bd = 1e9;
    for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) {
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x; if (red[i] && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = i; }
    }
    return best;
  };
  const S0 = nearestRed(j.start), T0 = nearestRed(j.end);
  // shortest white route (8 directions), optionally only inside a zone
  const route = allowed => {
    if (S0 < 0 || T0 < 0) return -2;
    const dist = new Float64Array(N).fill(1e9);
    // plain binary heap on (dist, idx)
    const heap = []; const push = (d, i) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { let l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    dist[S0] = 0; push(0, S0);
    while (heap.length) {
      const [d, c] = pop(); if (d > dist[c]) continue; if (c === T0) return d;
      const x = c % W, y = (c / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const n = yy * W + xx; if (!allowed(n)) continue;
        const nd = d + (dx && dy ? 1.4142 : 1); if (nd < dist[n]) { dist[n] = nd; push(nd, n); }
      }
    }
    return -1;
  };
  const free = i => !ink[i] && !block[i];
  const zr = Math.round(j.zone * K), zone = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (red[i]) { const x = i % W, y = (i / W) | 0; for (let dy = -zr; dy <= zr; dy++) for (let dx = -zr; dx <= zr; dx++) { if (dx * dx + dy * dy > zr * zr) continue; const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) zone[yy * W + xx] = 1; } }
  if (j.bridged) return { overlap, redCount, any: 0, along: 0, bridged: true }; // a tunnel crosses the bridge's edge lines, so a flood fill can't follow it
  const any = route(free);
  const along = route(i => free(i) && zone[i]);
  return { overlap, redCount, any: Math.round(any), along: Math.round(along) };
}

// Turn the page's measurements into a list of problems (empty = fine).
function verdict(j, r) {
  const problems = [];
  if (j.skip) return problems;
  if (r.overlap > 8) problems.push("answer on ink (" + r.overlap + " px)");
  if (r.bridged) return problems;
  if (r.any === -2) problems.push("answer not found in the picture");
  else if (r.any < 0) problems.push("no white route start to finish");
  else if (r.along < 0) problems.push("red route is not a white corridor");
  else if (r.any < r.along * 0.94) problems.push("shortcut in the picture (" + r.any + " vs " + r.along + ")");
  return problems;
}

if (require.main === module) (async () => {
  const want = process.argv.slice(2).map(s => S.parseCode(s)).filter(Boolean).map(p => p.n);
  const list = ctx.FMZ_CATALOG.filter(r => !r.retired && (!want.length || want.includes(r.n)));
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", m => { if (process.env.DEBUG) console.log("[page]", m.text()); });
  page.on("pageerror", e => console.log("[page error]", e.message));
  let bad = 0;
  for (const rc of list) {
    const j = job(rc);
    if (j.error) { console.log(j.code, "✗", j.error); bad++; continue; }
    const r = await page.evaluate(`(${inPage.toString()})(${JSON.stringify(j)})`);
    if (process.env.DEBUG) console.log(r);
    const problems = [];
    if (j.skip) { console.log(j.code.padEnd(8), (rc.title || "").padEnd(22), "skipped: the track is the path"); continue; }
    if (r.overlap > 8) problems.push("answer on ink (" + r.overlap + " px)");
    if (r.bridged) { /* overlap only */ }
    else if (r.any === -2) problems.push("answer not found in the picture");
    else if (r.any < 0) problems.push("no white route start to finish");
    else if (r.along < 0) problems.push("red route is not a white corridor");
    else if (r.any < r.along * 0.94) problems.push("shortcut in the picture (" + r.any + " vs " + r.along + ")");
    if (problems.length) bad++;
    console.log(j.code.padEnd(8), (rc.title || "").padEnd(22), "overlap", String(r.overlap).padStart(4), r.bridged ? "route skipped (bridges)" : "route " + r.any + " / " + r.along, problems.length ? "✗ " + problems.join(", ") : "✓");
  }
  await browser.close();
  if (bad) { console.log(bad + " problem(s)"); process.exit(1); }
})();

module.exports = { job, inPage, verdict };
