/* Felix Maze engine: build a cell graph (square, hex, rings), grow a maze on it, solve it.
   Pure functions, no DOM. Every maze comes from a recipe + seed, so it can be rebuilt exactly. */
(function (root) {
  "use strict";

  // ---------- seeded random ----------
  function rng(seed) {
    let a = seed >>> 0;
    const r = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = n => Math.floor(r() * n);
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    return r;
  }
  function shuffle(a, r) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* A graph is { kind, cells: [{id, cx, cy, ...}], edges: [{a, b, geo, out?, side?}] }.
     An edge with b === null is on the outside. geo is {t:'line', x1,y1,x2,y2} or {t:'arc', cx,cy,r,a0,a1}. */

  function finish(g) {
    g.adj = g.cells.map(() => []);
    g.edges.forEach((e, i) => {
      g.adj[e.a].push(i);
      if (e.b !== null) g.adj[e.b].push(i);
    });
    return g;
  }
  const other = (e, c) => (e.a === c ? e.b : e.a);

  // ---------- square grid ----------
  function buildGrid({ x, y, w, h, size, mask }) {
    const cols = Math.max(2, Math.floor(w / size)), rows = Math.max(2, Math.floor(h / size));
    const s = Math.min(w / cols, h / rows);
    const x0 = x + (w - cols * s) / 2, y0 = y + (h - rows * s) / 2;
    const cells = [], at = new Map();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const cx = x0 + (i + 0.5) * s, cy = y0 + (j + 0.5) * s;
      if (mask && !mask(cx, cy)) continue;
      at.set(i + "," + j, cells.length);
      cells.push({ id: cells.length, i, j, cx, cy });
    }
    const edges = [];
    const L = (x1, y1, x2, y2) => ({ t: "line", x1, y1, x2, y2 });
    for (const c of cells) {
      const X = x0 + c.i * s, Y = y0 + c.j * s;
      const sides = [
        ["E", c.i + 1, c.j, L(X + s, Y, X + s, Y + s), [1, 0]],
        ["S", c.i, c.j + 1, L(X, Y + s, X + s, Y + s), [0, 1]],
        ["W", c.i - 1, c.j, L(X, Y, X, Y + s), [-1, 0]],
        ["N", c.i, c.j - 1, L(X, Y, X + s, Y), [0, -1]]
      ];
      for (const [side, ni, nj, geo, out] of sides) {
        const n = at.get(ni + "," + nj);
        if (n === undefined) edges.push({ a: c.id, b: null, geo, out, side });
        else if (side === "E" || side === "S") edges.push({ a: c.id, b: n, geo, side });
      }
    }
    return finish({ kind: "grid", cells, edges, s, cols, rows, x0, y0, at });
  }

  // ---------- hexagons (pointy top, axial coordinates) ----------
  function buildHex({ x, y, w, h, size, mask }) {
    const s = size / Math.sqrt(3); // size = distance between centers
    const dx = Math.sqrt(3) * s, dy = 1.5 * s;
    const rows = Math.floor((h - 2 * s) / dy) + 1;
    const cols = Math.floor((w - dx / 2) / dx);
    const gw = cols * dx + dx / 2, gh = (rows - 1) * dy + 2 * s;
    const ox = x + (w - gw) / 2 + dx / 2, oy = y + (h - gh) / 2 + s;
    const cells = [], at = new Map();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = ox + c * dx + (r & 1) * dx / 2, cy = oy + r * dy;
      if (mask && !mask(cx, cy)) continue;
      const q = c - (r - (r & 1)) / 2;
      at.set(q + "," + r, cells.length);
      cells.push({ id: cells.length, q, r, cx, cy });
    }
    const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    const edges = [];
    for (const c of cells) {
      DIRS.forEach(([dq, dr], k) => {
        const n = at.get((c.q + dq) + "," + (c.r + dr));
        const ang = (-k * 60) * Math.PI / 180; // direction to that neighbor (screen y down)
        const v1 = ang - Math.PI / 6, v2 = ang + Math.PI / 6;
        const geo = { t: "line", x1: c.cx + s * Math.cos(v1), y1: c.cy + s * Math.sin(v1), x2: c.cx + s * Math.cos(v2), y2: c.cy + s * Math.sin(v2) };
        if (n === undefined) edges.push({ a: c.id, b: null, geo, out: [Math.cos(ang), Math.sin(ang)] });
        else if (n > c.id) edges.push({ a: c.id, b: n, geo });
      });
    }
    return finish({ kind: "hex", cells, edges, s });
  }

  // ---------- rings and spokes ----------
  function buildPolar({ cx, cy, R, rings, core = 1.2, rot = -Math.PI / 2, squash = 1 }) {
    const dr = R / (rings + core); // outer edge lands on R
    const r0 = dr * core; // radius of the center cell
    const cells = [{ id: 0, ring: 0, k: 0, cx, cy }];
    const counts = [1];
    const ringStart = [0];
    let n = 6;
    for (let ring = 1; ring <= rings; ring++) {
      const rin = r0 + (ring - 1) * dr, rmid = rin + dr / 2;
      while ((2 * Math.PI * rmid) / n > 1.8 * dr) n *= 2; // keep sectors about as wide as they are deep
      counts.push(n); ringStart.push(cells.length);
      for (let k = 0; k < n; k++) {
        const a = rot + (k + 0.5) * 2 * Math.PI / n;
        cells.push({ id: cells.length, ring, k, cx: cx + rmid * Math.cos(a), cy: cy + rmid * Math.sin(a) * squash, a, rmid });
      }
    }
    const edges = [];
    const ang = (ring, k) => rot + k * 2 * Math.PI / counts[ring];
    for (let ring = 1; ring <= rings; ring++) {
      const n = counts[ring], rin = r0 + (ring - 1) * dr, rout = rin + dr;
      for (let k = 0; k < n; k++) {
        const id = ringStart[ring] + k;
        // wall on the counter-clockwise side, between k-1 and k
        const a = ang(ring, k), prev = ringStart[ring] + ((k - 1 + n) % n);
        edges.push({ a: prev, b: id, geo: { t: "line", x1: cx + rin * Math.cos(a), y1: cy + rin * Math.sin(a) * squash, x2: cx + rout * Math.cos(a), y2: cy + rout * Math.sin(a) * squash } });
        // inner arc, to the ring inside
        const inner = ring === 1 ? 0 : ringStart[ring - 1] + Math.floor(k * counts[ring - 1] / n);
        edges.push({ a: inner, b: id, geo: { t: "arc", cx, cy, r: rin, a0: a, a1: ang(ring, k + 1), squash } });
        if (ring === rings) {
          const am = (a + ang(ring, k + 1)) / 2;
          edges.push({ a: id, b: null, geo: { t: "arc", cx, cy, r: rout, a0: a, a1: ang(ring, k + 1), squash }, out: [Math.cos(am), Math.sin(am)] });
        }
      }
    }
    return finish({ kind: "polar", cells, edges, dr, r0, R, cx, cy, counts, ringStart, squash });
  }

  // Keep only the biggest connected piece (a mask can leave islands).
  function keepLargest(g) {
    const comp = new Array(g.cells.length).fill(-1);
    let best = -1, bestSize = 0, id = 0;
    for (let s = 0; s < g.cells.length; s++) {
      if (comp[s] !== -1) continue;
      let size = 0; const q = [s]; comp[s] = id;
      while (q.length) {
        const c = q.pop(); size++;
        for (const ei of g.adj[c]) { const e = g.edges[ei]; if (e.b === null) continue; const o = other(e, c); if (comp[o] === -1) { comp[o] = id; q.push(o); } }
      }
      if (size > bestSize) { bestSize = size; best = id; }
      id++;
    }
    if (id <= 1) return g;
    const remap = new Map(), cells = [];
    g.cells.forEach((c, i) => { if (comp[i] === best) { remap.set(i, cells.length); cells.push(Object.assign({}, c, { id: cells.length })); } });
    const edges = [];
    for (const e of g.edges) {
      const a = remap.get(e.a), b = e.b === null ? undefined : remap.get(e.b);
      if (a !== undefined && b !== undefined) edges.push(Object.assign({}, e, { a, b }));
      else if (a !== undefined) edges.push(Object.assign({}, e, { a, b: null }));
      else if (b !== undefined) edges.push(Object.assign({}, e, { a: b, b: null }));
    }
    return finish(Object.assign({}, g, { cells, edges }));
  }

  /* Grow a maze (growing tree). Options:
     mix      0 = always grow from the newest cell (long winding halls), 1 = from a random one (spiky)
     forbid   Set of edge indices that must stay walls (Felix's doodle as walls), opened only to stay connected
     prelink  edge indices opened first (Felix's doodle as the right path)
     bias     fn(fromCell, toCell) -> weight, steers corridors (a doodle as a guide)
     growth   0..1, stop early (a "spring" sprout) */
  function grow(g, r, { mix = 0, forbid = null, prelink = null, bias = null, growth = 1, from = null } = {}) {
    const N = g.cells.length;
    const seen = new Uint8Array(N), links = new Set();
    const active = [];
    const visit = c => { if (!seen[c]) { seen[c] = 1; active.push(c); } };
    if (prelink && prelink.length) {
      for (const ei of prelink) { const e = g.edges[ei]; links.add(ei); visit(e.a); visit(e.b); }
    } else visit(from !== null ? from : r.int(N));
    let carved = 0;
    const budget = Math.floor(growth * N);
    const closed = ei => forbid && forbid.has(ei);
    while (carved < budget) {
      if (!active.length) {
        // reconnect leftovers through a forbidden wall, if any are left
        let joined = false;
        for (let c = 0; c < N && !joined; c++) {
          if (!seen[c]) continue;
          for (const ei of g.adj[c]) {
            const e = g.edges[ei]; if (e.b === null) continue;
            const o = other(e, c);
            if (!seen[o]) { links.add(ei); visit(o); carved++; joined = true; break; }
          }
        }
        if (!joined) break;
        continue;
      }
      const i = r() < mix ? r.int(active.length) : active.length - 1;
      const c = active[i];
      const opts = [];
      for (const ei of g.adj[c]) {
        const e = g.edges[ei]; if (e.b === null || closed(ei)) continue;
        const o = other(e, c); if (!seen[o]) opts.push([ei, o]);
      }
      if (!opts.length) { active.splice(i, 1); continue; }
      let pick;
      if (bias) {
        const ws = opts.map(([, o]) => Math.max(0.01, bias(c, o)));
        let t = r() * ws.reduce((s, v) => s + v, 0);
        pick = opts[opts.length - 1];
        for (let k = 0; k < opts.length; k++) { t -= ws[k]; if (t <= 0) { pick = opts[k]; break; } }
      } else pick = opts[r.int(opts.length)];
      links.add(pick[0]); visit(pick[1]); carved++;
    }
    return { links, seen };
  }

  /* Carve a perfect maze inside a set of cells only (used for the rooms of a divided maze). */
  function growRegion(g, r, cells, mix, links) {
    const list = [...cells], seen = new Set(), active = [];
    const first = list[r.int(list.length)];
    seen.add(first); active.push(first);
    while (active.length) {
      const i = r() < mix ? r.int(active.length) : active.length - 1, c = active[i];
      const opts = [];
      for (const ei of g.adj[c]) { const e = g.edges[ei]; if (e.b === null) continue; const o = other(e, c); if (cells.has(o) && !seen.has(o)) opts.push([ei, o]); }
      if (!opts.length) { active.splice(i, 1); continue; }
      const [ei, o] = opts[r.int(opts.length)];
      links.add(ei); seen.add(o); active.push(o);
    }
  }

  /* Recursive division (Mondrian style): split the box with a wall and one door, again and again, down to rooms;
     then a small maze inside each room. Walls made by the first few splits are marked heavy (drawn thick).
     Needs a full square grid (no mask). */
  function divide(g, r, { minSide = 2, maxArea = 14, heavyDepth = 1, mix = 0.1 } = {}) {
    const key = (a, b) => (a < b ? a + "," + b : b + "," + a);
    const eix = new Map();
    g.edges.forEach((e, i) => { if (e.b !== null) eix.set(key(e.a, e.b), i); });
    const links = new Set(), heavy = new Set(), rooms = [];
    const cellAt = (i, j) => g.at.get(i + "," + j);
    (function split(i0, j0, w, h, depth) {
      const canV = w >= 2 * minSide, canH = h >= 2 * minSide;
      if ((!canV && !canH) || (depth >= 1 && w * h <= maxArea) || (depth >= 2 && r() < 0.16 * depth)) { rooms.push([i0, j0, w, h]); return; }
      const vertical = canV && (!canH || (w / h > 1.15 ? true : w / h < 0.87 ? false : r() < 0.5));
      if (vertical) {
        const pos = minSide + r.int(w - 2 * minSide + 1), door = j0 + r.int(h);
        for (let j = j0; j < j0 + h; j++) {
          const ei = eix.get(key(cellAt(i0 + pos - 1, j), cellAt(i0 + pos, j)));
          if (j === door) links.add(ei); else if (depth <= heavyDepth) heavy.add(ei);
        }
        split(i0, j0, pos, h, depth + 1); split(i0 + pos, j0, w - pos, h, depth + 1);
      } else {
        const pos = minSide + r.int(h - 2 * minSide + 1), door = i0 + r.int(w);
        for (let i = i0; i < i0 + w; i++) {
          const ei = eix.get(key(cellAt(i, j0 + pos - 1), cellAt(i, j0 + pos)));
          if (i === door) links.add(ei); else if (depth <= heavyDepth) heavy.add(ei);
        }
        split(i0, j0, w, pos, depth + 1); split(i0, j0 + pos, w, h - pos, depth + 1);
      }
    })(0, 0, g.cols, g.rows, 0);
    for (const [i0, j0, w, h] of rooms) {
      const cells = new Set();
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.add(cellAt(i0 + i, j0 + j));
      growRegion(g, r, cells, mix, links);
    }
    return { links, heavy, rooms, seen: new Uint8Array(g.cells.length).fill(1) };
  }

  const degree = (g, links, c) => g.adj[c].reduce((n, ei) => n + (links.has(ei) ? 1 : 0), 0);

  // Open some dead ends into loops (kinder, and adds "going around in circles").
  function braid(g, links, r, share) {
    let loops = 0;
    if (!share) return loops;
    for (let c = 0; c < g.cells.length; c++) {
      if (degree(g, links, c) !== 1 || r() >= share) continue;
      const shut = g.adj[c].filter(ei => !links.has(ei) && g.edges[ei].b !== null);
      if (!shut.length) continue;
      const pick = shut.find(ei => degree(g, links, other(g.edges[ei], c)) === 1) || shut[r.int(shut.length)];
      links.add(pick); loops++;
    }
    return loops;
  }

  /* Bridges (square grids only): where a hall runs straight through a cell, add a tunnel under it
     joining the cells on either side. Adds a new edge marked {under: cellId}. */
  function weave(g, links, r, share) {
    if (g.kind !== "grid" || !share) return [];
    const bridges = [];
    const used = new Set();
    // the edge leaving cell c on one side
    const leave = (c, side) => {
      for (const ei of g.adj[c]) {
        const e = g.edges[ei]; if (e.b === null) continue;
        const o = other(e, c), oc = g.cells[o], cc = g.cells[c];
        const s = oc.i > cc.i ? "E" : oc.i < cc.i ? "W" : oc.j > cc.j ? "S" : "N";
        if (s === side) return ei;
      }
      return -1;
    };
    for (const c of shuffle(g.cells.map(c => c.id), r)) {
      if (r() >= share || used.has(c)) continue;
      const n = leave(c, "N"), s = leave(c, "S"), e = leave(c, "E"), w = leave(c, "W");
      if (n < 0 || s < 0 || e < 0 || w < 0) continue;
      let over, under;
      if (links.has(n) && links.has(s) && !links.has(e) && !links.has(w)) { over = "NS"; under = [w, e]; }
      else if (links.has(e) && links.has(w) && !links.has(n) && !links.has(s)) { over = "EW"; under = [n, s]; }
      else continue;
      const A = other(g.edges[under[0]], c), B = other(g.edges[under[1]], c);
      if (used.has(A) || used.has(B)) continue;
      const ca = g.cells[A], cb = g.cells[B];
      const ei = g.edges.length;
      g.edges.push({ a: A, b: B, under: c, over, geo: { t: "line", x1: ca.cx, y1: ca.cy, x2: cb.cx, y2: cb.cy } });
      g.adj[A].push(ei); g.adj[B].push(ei);
      links.add(ei);
      used.add(c); used.add(A); used.add(B);
      bridges.push({ cell: c, edge: ei, over });
    }
    return bridges;
  }

  function solve(g, links, start, end) {
    const prev = new Int32Array(g.cells.length).fill(-2);
    const via = new Int32Array(g.cells.length).fill(-1);
    prev[start] = -1;
    const q = [start];
    for (let h = 0; h < q.length; h++) {
      const c = q[h];
      if (c === end) break;
      for (const ei of g.adj[c]) {
        if (!links.has(ei)) continue;
        const o = other(g.edges[ei], c);
        if (o !== null && prev[o] === -2) { prev[o] = c; via[o] = ei; q.push(o); }
      }
    }
    if (prev[end] === -2) return null;
    const cells = [], edges = [];
    for (let c = end; c !== -1; c = prev[c]) { cells.unshift(c); if (via[c] >= 0) edges.unshift(via[c]); }
    return { cells, edges };
  }

  function distances(g, links, start) {
    const d = new Int32Array(g.cells.length).fill(-1);
    d[start] = 0;
    const q = [start];
    for (let h = 0; h < q.length; h++) {
      const c = q[h];
      for (const ei of g.adj[c]) {
        if (!links.has(ei)) continue;
        const o = other(g.edges[ei], c);
        if (d[o] < 0) { d[o] = d[c] + 1; q.push(o); }
      }
    }
    return d;
  }

  /* Pick an outside edge for an entrance. spec: {side:'W'|'E'|'N'|'S'|'out', at:0..1 (along that side), angle (polar, radians)}
     or {center:true} for the middle cell of a ring maze, {near:[x,y]} for the cell closest to a point, or {cell: id}. */
  function pickEnd(g, spec, box) {
    if (spec.center && g.kind === "polar") return { cell: 0, edge: -1 };
    if (spec.cell !== undefined) return { cell: spec.cell, edge: -1 };
    if (spec.nearEdge) {                      // the outside doorway closest to a point, from any direction
      let best = null, bd = Infinity;
      g.edges.forEach((e, i) => {
        if (e.b !== null) return;
        if (spec.ok && !spec.ok(e, g.cells[e.a])) return;
        const [mx, my] = edgeMid(e.geo), d = Math.hypot(mx - spec.nearEdge[0], my - spec.nearEdge[1]);
        if (d < bd) { bd = d; best = { cell: e.a, edge: i }; }
      });
      if (best) return best;
    }
    if (spec.near) {
      let best = 0, bd = Infinity;
      g.cells.forEach((c, i) => { const d = Math.hypot(c.cx - spec.near[0], c.cy - spec.near[1]); if (d < bd) { bd = d; best = i; } });
      return { cell: best, edge: -1 };
    }
    const outs = g.edges.map((e, i) => [e, i]).filter(([e]) => e.b === null);
    let best = null, bestScore = Infinity;
    for (const [e, i] of outs) {
      const c = g.cells[e.a];
      if (spec.ok && !spec.ok(e, c)) continue; // e.g. keep doorways away from Felix's lines
      let score;
      if (g.kind === "polar") {
        const a = Math.atan2((c.cy - g.cy) / g.squash, c.cx - g.cx);
        let d = Math.abs(a - (spec.angle || 0)) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d;
        score = d;
      } else {
        const want = { W: [-1, 0], E: [1, 0], N: [0, -1], S: [0, 1] }[spec.side] || [0, 0];
        const dot = e.out[0] * want[0] + e.out[1] * want[1];
        if (dot < 0.7) continue;
        const t = spec.at === undefined ? 0.5 : spec.at;
        const tx = box.x + t * box.w, ty = box.y + t * box.h;
        const along = want[0] ? Math.abs(c.cy - ty) : Math.abs(c.cx - tx);
        const depth = want[0] ? (want[0] > 0 ? box.x + box.w - c.cx : c.cx - box.x) : (want[1] > 0 ? box.y + box.h - c.cy : c.cy - box.y);
        score = along + depth * 3; // prefer cells on the real outer edge
      }
      if (score < bestScore) { bestScore = score; best = { cell: e.a, edge: i }; }
    }
    return best || { cell: 0, edge: -1 };
  }

  // Midpoint of an edge (for drawing a path through doorways).
  function edgeMid(geo) {
    if (geo.t === "line") return [(geo.x1 + geo.x2) / 2, (geo.y1 + geo.y2) / 2];
    const a = (geo.a0 + geo.a1) / 2;
    return [geo.cx + geo.r * Math.cos(a), geo.cy + geo.r * Math.sin(a) * (geo.squash || 1)];
  }

  // Points along the right path: center, doorway, center, ...
  function pathPoints(g, sol, startEnd, finishEnd) {
    const pts = [];
    const outside = (end, c) => {
      if (end.edge < 0) return null;
      const e = g.edges[end.edge], [mx, my] = edgeMid(e.geo);
      return [mx + (mx - c.cx) * 0.6, my + (my - c.cy) * 0.6];
    };
    const c0 = g.cells[sol.cells[0]];
    const o0 = outside(startEnd, c0); if (o0) pts.push(o0);
    pts.push([c0.cx, c0.cy]);
    sol.edges.forEach((ei, k) => {
      const e = g.edges[ei];
      if (!e.under) pts.push(edgeMid(e.geo));
      const c = g.cells[sol.cells[k + 1]];
      pts.push([c.cx, c.cy]);
    });
    const cl = g.cells[sol.cells[sol.cells.length - 1]];
    const o1 = outside(finishEnd, cl); if (o1) pts.push(o1);
    return pts;
  }

  // Shape helpers for masks.
  function inPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function segDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L));
    return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
  }
  function segCross(a, b, c, d) {
    const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
  }

  root.FMZ = root.FMZ || {};
  root.FMZ.engine = { rng, shuffle, buildGrid, buildHex, buildPolar, keepLargest, grow, growRegion, divide, braid, weave, solve, distances, pickEnd, pathPoints, edgeMid, degree, other, inPoly, segDist, segCross };
})(typeof window !== "undefined" ? window : globalThis);
