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

  /* Solution first: lay down the right path on purpose, then grow the rest of the maze around it.
     1. the shortest way from s to t (on the open grid), 2. stretched with detours (a step a→b becomes a→c→d→b
        through two free neighbours) until it covers `len` of the squares, preferring to break straight runs so it
        twists and turns, 3. wrong turns grown out of the path into every square that is left (a perfect maze:
        no loops, so the path is the one way through).
     len 0..0.6 share of squares on the path · twist 0..1 how strongly straight runs are bent · mix 0..1 wrong
     turns: 0 = few long ones (deep traps), 1 = many short ones (more choices) · away 0..1 how often a detour heads away
     from the finish (the right way should not look like the way) · lure 0..1 how often a wrong turn grows toward the finish. */
  function pathFirst(g, r, s, t, { len = 0.3, twist = 0.7, mix = 0.35, away = 0.5, lure = 0.6, waypoints = 2 } = {}) {
    const N = g.cells.length, eOf = new Map(), nb = g.cells.map(() => []);
    g.edges.forEach((e, i) => { if (e.b === null) return; eOf.set(e.a * N + e.b, i); eOf.set(e.b * N + e.a, i); nb[e.a].push(e.b); nb[e.b].push(e.a); });
    const adj = (a, b) => eOf.has(a * N + b);
    const tx = g.cells[t].cx, ty = g.cells[t].cy, far = c => Math.hypot(g.cells[c].cx - tx, g.cells[c].cy - ty);
    // 1. the route: start → a few waypoints → finish, each leg the shortest way through squares not used yet.
    //    Waypoints are spread out and the route sweeps away from the finish and back, so long stretches of the right
    //    way head away from the goal (that is what makes the tempting turns tempting).
    const on = new Uint8Array(N);
    const leg = (a, b) => {
      const pv = new Int32Array(N).fill(-2); pv[a] = -1; const qq = [a];
      for (let h = 0; h < qq.length && pv[b] === -2; h++) for (const o of shuffle(nb[qq[h]].slice(), r)) if (pv[o] === -2 && (!on[o] || o === b)) { pv[o] = qq[h]; qq.push(o); }   // shuffled: a random one of the shortest ways, so it staircases instead of running straight
      if (pv[b] === -2) return null;
      const out = []; for (let c = b; c !== -1; c = pv[c]) out.unshift(c); return out;
    };
    let path = [s]; on[s] = 1;
    // waypoints in a zigzag: along the start→finish direction they alternate between the far end and the start end,
    // while stepping across the other way, so the route sweeps back and forth (half of it heads away from the goal)
    const pts = [];
    if (waypoints > 0) {
      const sx = g.cells[s].cx, sy = g.cells[s].cy;
      let ux = tx - sx, uy = ty - sy; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
      const vx = -uy, vy = ux;
      const U = c => (g.cells[c].cx - sx) * ux + (g.cells[c].cy - sy) * uy, Vv = c => (g.cells[c].cx - sx) * vx + (g.cells[c].cy - sy) * vy;
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (let c = 0; c < N; c++) { const u = U(c), v = Vv(c); u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
      const flip = r() < 0.5;                          // sweep up or down first
      for (let k = 1; k <= waypoints; k++) {
        const fu = k % 2 ? 0.88 : 0.12, fv = (flip ? 1 - k / (waypoints + 1) : k / (waypoints + 1));
        const wu = u0 + fu * (u1 - u0), wv = v0 + fv * (v1 - v0);
        let best = -1, bd = Infinity;
        for (let c = 0; c < N; c++) { if (c === s || c === t) continue; const d = Math.hypot(U(c) - wu, Vv(c) - wv); if (d < bd) { bd = d; best = c; } }
        if (best >= 0 && !pts.includes(best)) pts.push(best);
      }
    }
    // the finish and the waypoints are reserved: a leg may end on one but never pass through it (no square twice)
    on[t] = 1; pts.forEach(w => { on[w] = 1; });
    for (const w of [...pts, t]) {
      const seg = leg(path[path.length - 1], w);
      if (!seg) { if (w !== t) on[w] = 0; continue; }
      seg.slice(1).forEach(c => { on[c] = 1; path.push(c); });
    }
    if (path[path.length - 1] !== t) {                    // a waypoint boxed the route in: fall back to the plain way
      on.fill(0); path = leg(s, t) || [s]; path.forEach(c => { on[c] = 1; });
    }
    const routeLen = path.length, wpts = pts.length;
    // 2. stretch it
    // always some extra bends (twist), and at least `len` of the squares
    const target = Math.max(Math.round(path.length * (1 + 0.25 * twist)), Math.round(len * N));
    const straight = (p, a, b) => {
      const ax = g.cells[a].cx - g.cells[p].cx, ay = g.cells[a].cy - g.cells[p].cy, bx = g.cells[b].cx - g.cells[a].cx, by = g.cells[b].cy - g.cells[a].cy;
      return (ax * bx + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx, by)) || 1) > 0.9;
    };
    for (let tries = 0; path.length < target && tries < 80 * N; tries++) {
      const i = r.int(path.length - 1), a = path[i], b = path[i + 1];
      if (i > 0 && !straight(path[i - 1], a, b) && r() < twist * 0.5) continue;   // lean toward bending straight stretches
      const opts = [];
      for (const c of nb[a]) if (!on[c]) for (const d of nb[b]) if (!on[d] && d !== c && adj(c, d)) opts.push([c, d]);
      if (!opts.length) continue;
      // away: prefer the detour that heads away from the finish, so the right way doesn't look like the way
      let pick = opts[r.int(opts.length)];
      if (r() < away) { const base = far(a) + far(b); pick = opts.reduce((m, o) => (far(o[0]) + far(o[1]) - base > far(m[0]) + far(m[1]) - base ? o : m), pick); }
      path.splice(i + 1, 0, pick[0], pick[1]); on[pick[0]] = on[pick[1]] = 1;
    }
    // 3. wrong turns. First the lures: at each step of the path, a free neighbour that is nearer the finish than the
    //    next step of the right way is exactly where a solver goes wrong, so a wrong turn starts there and is grown
    //    deep (newest first). Then every square that is left is filled from the whole path.
    const links = new Set(), seen = new Uint8Array(N);
    for (let k = 0; k + 1 < path.length; k++) links.add(eOf.get(path[k] * N + path[k + 1]));
    path.forEach(c => { seen[c] = 1; });
    const growFrom = (active, m, budget = Infinity, pull = 0) => {
      while (active.length && budget > 0) {
        const i = r() < m ? r.int(active.length) : active.length - 1, c = active[i];
        const free = nb[c].filter(o => !seen[o]);
        if (!free.length) { active.splice(i, 1); continue; }
        // lure: a wrong turn often keeps heading toward the finish, so it keeps looking like the way
        const o = r() < pull ? free.reduce((m2, x) => (far(x) < far(m2) ? x : m2), free[0]) : free[r.int(free.length)];
        links.add(eOf.get(c * N + o)); seen[o] = 1; active.push(o); budget--;
      }
    };
    const lures = [];
    for (let k = 0; k + 1 < path.length; k++) {
      const c = path[k], nextFar = far(path[k + 1]);
      for (const o of nb[c]) if (!seen[o] && far(o) < nextFar) lures.push([c, o]);
    }
    // about one wrong turn for every three or four steps of the path, each given a fair share of the free squares,
    // so there are many choices and every one of them costs something
    const want = Math.max(4, Math.min(Math.round(path.length * 0.3), Math.round(lures.length * Math.max(0.15, lure))));
    const share = Math.max(6, Math.round((N - path.length) * 0.85 / want));
    let made = 0;
    for (const [c, o] of shuffle(lures, r)) {
      if (made >= want) break;
      if (seen[o] || r() > Math.max(0.15, lure)) continue;
      links.add(eOf.get(c * N + o)); seen[o] = 1; made++;
      growFrom([o], Math.min(mix, 0.2), share - 1, 0.35 * lure);    // a deep wrong turn, up to its share, leaning toward the finish
    }
    // fill from every square already in the maze (path and wrong turns), so no pocket is left out
    const inMaze = []; for (let c = 0; c < N; c++) if (seen[c]) inMaze.push(c);
    growFrom(shuffle(inMaze, r), mix);
    // 4. make every wrong turn tempting. Each wrong turn (a piece of the maze off the path) hangs from the path by
    //    exactly one doorway. Move that doorway to the spot where the wrong turn looks most like the way: where its first
    //    square is nearer the finish than the next step of the right way. The maze stays perfect (one doorway each).
    const idx = new Int32Array(N).fill(-1); path.forEach((c, k) => { idx[c] = k; });
    const comp = new Int32Array(N).fill(-1);
    let moved = 0, ncomp = 0;
    for (let c0 = 0; c0 < N; c0++) {
      if (idx[c0] >= 0 || comp[c0] >= 0) continue;
      const cells = [c0]; comp[c0] = ncomp;
      for (let h = 0; h < cells.length; h++) for (const o of nb[cells[h]]) if (idx[o] < 0 && comp[o] < 0 && links.has(eOf.get(cells[h] * N + o))) { comp[o] = ncomp; cells.push(o); }
      let cur = -1, best = null, bm = 0;
      for (const x of cells) for (const p of nb[x]) {
        if (idx[p] < 0) continue;
        const ei = eOf.get(x * N + p);
        if (links.has(ei)) cur = ei;
        if (idx[p] >= path.length - 1) continue;
        const margin = far(path[idx[p] + 1]) - far(x);       // > 0: the wrong turn looks nearer the finish
        if (margin > bm) { bm = margin; best = ei; }
      }
      if (best !== null && cur !== -1 && best !== cur && r() < lure) {
        const e0 = g.edges[cur], keepsTempting = idx[e0.a] >= 0 ? (idx[e0.a] < path.length - 1 && far(path[idx[e0.a] + 1]) - far(e0.b) > bm * 0.8) : (idx[e0.b] < path.length - 1 && far(path[idx[e0.b] + 1]) - far(e0.a) > bm * 0.8);
        if (!keepsTempting) { links.delete(cur); links.add(best); moved++; }
      }
      ncomp++;
    }
    return { links, seen, path, stats: { routeLen, wpts, stretched: path.length, target, want, made, lureSpots: lures.length, share, pieces: ncomp, moved } };
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
  root.FMZ.engine = { rng, shuffle, buildGrid, buildHex, buildPolar, keepLargest, grow, pathFirst, growRegion, divide, braid, weave, solve, distances, pickEnd, pathPoints, edgeMid, degree, other, inPoly, segDist, segCross };
})(typeof window !== "undefined" ? window : globalThis);
