/* Felix Maze prototypes: ten ideas that only work on a screen (3D, rotating, moving, flooding).
   Plain canvas, our own tiny 3D projection, no libraries and no build step.
   Each prototype is { id, title, tag, blurb, how, make(), draw(ctx, w, h, t, dt, st), orbit?, buttons?, key?, down?, move? }.
   prototypes.html draws them in a gallery and runs one at a time on a stage. */
(function (root) {
  "use strict";
  const E = root.FMZ.engine, TAU = Math.PI * 2;
  const C = { paper: "#fff8e7", ink: "#3b3248", mint: "#c8f0e0", mintD: "#3fae84", peach: "#ffd8b8", coral: "#ff9e8a", coralD: "#e0604a", lav: "#e3d7ff", sun: "#ffe58f", sky: "#cfe8ff", blue: "#3d8bfd", green: "#2fb96b" };

  // ---------- a maze on an abstract grid (optionally wrapping around, optionally in layers) ----------
  function gen(cols, rows, layers, wrapX, wrapY, seed) {
    const r = E.rng(seed), N = cols * rows * layers, open = new Set();
    const id = (i, j, k = 0) => i + cols * (j + rows * k);
    const key = (a, b) => (a < b ? a * N + b : b * N + a);
    const at = c => ({ i: c % cols, j: Math.floor(c / cols) % rows, k: Math.floor(c / (cols * rows)) });
    function nb(c) {
      const { i, j, k } = at(c), out = [];
      const add = (ii, jj, kk, d) => out.push({ c: id(ii, jj, kk), d });
      if (i + 1 < cols) add(i + 1, j, k, "E"); else if (wrapX && cols > 2) add(0, j, k, "E");
      if (i > 0) add(i - 1, j, k, "W"); else if (wrapX && cols > 2) add(cols - 1, j, k, "W");
      if (j + 1 < rows) add(i, j + 1, k, "S"); else if (wrapY && rows > 2) add(i, 0, k, "S");
      if (j > 0) add(i, j - 1, k, "N"); else if (wrapY && rows > 2) add(i, rows - 1, k, "N");
      if (k + 1 < layers) add(i, j, k + 1, "U");
      if (k > 0) add(i, j, k - 1, "D");
      return out;
    }
    const seen = new Uint8Array(N), stack = [0]; seen[0] = 1;
    while (stack.length) {
      const c = stack[stack.length - 1], cand = nb(c).filter(n => !seen[n.c]);
      if (!cand.length) { stack.pop(); continue; }
      const n = cand[r.int(cand.length)]; seen[n.c] = 1; open.add(key(c, n.c)); stack.push(n.c);
    }
    const m = { cols, rows, layers, N, id, at, nb, open, key, r, isOpen: (a, b) => open.has(key(a, b)) };
    m.solve = (a, b) => {
      const prev = new Int32Array(N).fill(-2); prev[a] = -1; const q = [a];
      for (let h = 0; h < q.length && prev[b] === -2; h++) for (const n of nb(q[h])) if (prev[n.c] === -2 && m.isOpen(q[h], n.c)) { prev[n.c] = q[h]; q.push(n.c); }
      const p = []; for (let c = b; c !== -1; c = prev[c]) p.unshift(c); return p;
    };
    // wall segments of one layer, in grid-corner coordinates [x1, y1, x2, y2]
    m.walls = (k = 0) => {
      const out = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const c = id(i, j, k), ns = nb(c);
        const e = ns.find(n => n.d === "E"), s = ns.find(n => n.d === "S");
        if (!e || !m.isOpen(c, e.c)) out.push([i + 1, j, i + 1, j + 1]);
        if (!s || !m.isOpen(c, s.c)) out.push([i, j + 1, i + 1, j + 1]);
        if (i === 0 && !wrapX) out.push([0, j, 0, j + 1]);
        if (j === 0 && !wrapY) out.push([i, 0, i + 1, 0]);
      }
      return out;
    };
    return m;
  }

  // ---------- a tiny 3D camera: yaw (around the vertical), pitch (look down), perspective ----------
  function cam(st, w, h) {
    const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
    const f = Math.min(w, h) * st.f;
    return (x, y, z) => {
      const X = x * cy + z * sy, Z = -x * sy + z * cy, Y = y * cp + Z * sp, Z2 = Z * cp - y * sp, k = f / (st.dist + Z2);
      return [w / 2 + X * k, h / 2 - Y * k, Z2];
    };
  }
  const base3d = (extra = {}) => Object.assign({ yaw: 0.6, pitch: 0.7, f: 1, dist: 14, spin: 0.18 }, extra);
  const line = (ctx, pts, color, wd, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = wd; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore(); };
  const dot = (ctx, p, r, fill, stroke = C.ink) => { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = stroke; ctx.stroke(); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const text = (ctx, s, x, y, size = 22, color = C.ink, align = "center") => { ctx.fillStyle = color; ctx.font = `700 ${size}px Quicksand, system-ui, sans-serif`; ctx.textAlign = align; ctx.fillText(s, x, y); };
  // a ball that walks a list of points, back and forth
  function along(pts, t, speed) {
    const n = pts.length - 1; if (n < 1) return pts[0];
    let u = (t * speed) % (2 * n); if (u > n) u = 2 * n - u;
    const i = Math.min(n - 1, Math.floor(u)), f = u - i;
    return pts[i].map((v, d) => lerp(v, pts[i + 1][d], f));
  }
  const tour = (m, a, b) => m.solve(a, b);
  // does a surface normal point toward the camera? (smaller depth = nearer)
  const toward = (n, st) => { const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch), Z = -n[0] * sy + n[2] * cy; return Z * cp - n[1] * sp < 0 ? 1 : -1; };

  const P = [];

  // ================= 1. Tabletop: a maze with real walls, circling slowly =================
  P.push({
    id: "table", title: "Tabletop", tag: "3D", blurb: "The maze stands up. Walk around it and look from any side.",
    how: "Every wall is a little block with a top and sides, sorted from far to near and drawn pastel with a bold outline. The sun ball walks the right path forever. Drag to turn the table.",
    orbit: true,
    make() { const m = gen(12, 8, 1, false, false, 31); return { m, walls: m.walls(0), path: tour(m, 0, m.N - 1), ...base3d({ dist: 17, yaw: 0.5, pitch: 0.85 }) }; },
    draw(ctx, w, h, t, dt, st) {
      const { m } = st, p = cam(st, w, h), X = i => i - m.cols / 2, Z = j => j - m.rows / 2, T = 0.14, H = 0.8;
      const floor = [[0, 0], [m.cols, 0], [m.cols, m.rows], [0, m.rows]].map(([i, j]) => p(X(i), 0, Z(j)));
      ctx.beginPath(); floor.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = C.mint; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      const boxes = st.walls.map(([x1, y1, x2, y2]) => {
        const a = Math.min(x1, x2) - (x1 === x2 ? T : 0), b = Math.max(x1, x2) + (x1 === x2 ? T : 0), c = Math.min(y1, y2) - (y1 === y2 ? T : 0), d = Math.max(y1, y2) + (y1 === y2 ? T : 0);
        const v = [[a, c], [b, c], [b, d], [a, d]].map(([i, j]) => [p(X(i), 0, Z(j)), p(X(i), H, Z(j))]);
        return { v, z: v.reduce((s, q) => s + q[0][2], 0) / 4 };
      }).sort((u, v) => v.z - u.z);
      for (const bx of boxes) {
        for (let s = 0; s < 4; s++) {
          const a = bx.v[s], b = bx.v[(s + 1) % 4], q = [a[0], b[0], b[1], a[1]];
          const cross = (q[1][0] - q[0][0]) * (q[2][1] - q[1][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[1][0]);
          if (cross > 0) continue;
          ctx.beginPath(); q.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.closePath(); ctx.fillStyle = s % 2 ? C.lav : C.peach; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
        }
        ctx.beginPath(); bx.v.forEach((pt, i) => (i ? ctx.lineTo(pt[1][0], pt[1][1]) : ctx.moveTo(pt[1][0], pt[1][1]))); ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      }
      const pts = st.path.map(c => { const { i, j } = m.at(c); return [i + 0.5, j + 0.5]; });
      const b = along(pts, t, 3.2), q = p(X(b[0]), 0.35, Z(b[1]));
      dot(ctx, q, Math.max(8, w * 0.016), C.sun);
    }
  });

  // ================= 2. Fly-through: first person, walls rise on both sides =================
  P.push({
    id: "fly", title: "Fly-through", tag: "3D · you steer", blurb: "Stand inside the maze and walk it. Find the sun.",
    how: "A ray is cast for every column of the screen until it hits a wall; nearer walls are drawn taller and lighter. The little map shows where you are. Arrow keys, the buttons, or drag left and right to turn.",
    make() {
      const m = gen(9, 7, 1, false, false, 77), W = 2 * m.cols + 1, H = 2 * m.rows + 1, map = new Uint8Array(W * H).fill(1);
      for (let c = 0; c < m.N; c++) { const { i, j } = m.at(c); map[(2 * j + 1) * W + 2 * i + 1] = 0; for (const n of m.nb(c)) if (m.isOpen(c, n.c)) { const q = m.at(n.c); map[(j + q.j + 1) * W + i + q.i + 1] = 0; } }
      return { m, W, H, map, x: 1.5, y: 1.5, a: 0, goal: [W - 1.5, H - 1.5], won: false, keys: {} };
    },
    draw(ctx, w, h, t, dt, st) {
      const { W, H, map } = st, step = Math.min(dt, 0.05);
      const turn = (st.keys.left ? -1 : 0) + (st.keys.right ? 1 : 0), fwd = (st.keys.up ? 1 : 0) + (st.keys.down ? -1 : 0);
      st.a += turn * 2.2 * step;
      const nx = st.x + Math.cos(st.a) * fwd * 2.4 * step, ny = st.y + Math.sin(st.a) * fwd * 2.4 * step, R = 0.2;
      const free = (x, y) => !map[Math.floor(y - R) * W + Math.floor(x - R)] && !map[Math.floor(y - R) * W + Math.floor(x + R)] && !map[Math.floor(y + R) * W + Math.floor(x - R)] && !map[Math.floor(y + R) * W + Math.floor(x + R)];
      if (free(nx, st.y)) st.x = nx; if (free(st.x, ny)) st.y = ny;
      if (Math.hypot(st.x - st.goal[0], st.y - st.goal[1]) < 0.6) st.won = true;
      const sky = ctx.createLinearGradient(0, 0, 0, h / 2); sky.addColorStop(0, C.sky); sky.addColorStop(1, "#eaf5ff");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h / 2); ctx.fillStyle = "#ffeec2"; ctx.fillRect(0, h / 2, w, h / 2);
      const FOV = 1.05, cols = Math.min(w, 360), cw = w / cols, zbuf = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        const ra = st.a + (c / cols - 0.5) * FOV, dx = Math.cos(ra), dy = Math.sin(ra);
        let mx = Math.floor(st.x), my = Math.floor(st.y), sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
        const ddx = Math.abs(1 / (dx || 1e-9)), ddy = Math.abs(1 / (dy || 1e-9));
        let sdx = (dx < 0 ? st.x - mx : mx + 1 - st.x) * ddx, sdy = (dy < 0 ? st.y - my : my + 1 - st.y) * ddy, side = 0;
        for (let n = 0; n < 60; n++) { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; } if (map[my * W + mx]) break; }
        const dist = Math.max(0.05, (side ? sdy - ddy : sdx - ddx) * Math.cos(ra - st.a)); zbuf[c] = dist;
        const hh = h / dist * 0.7, shade = Math.max(0.35, 1 - dist / 9);
        const tint = (mx + my) % 3, base = side ? [227, 215, 255] : [255, 216, 184], alt = [200, 240, 224];
        const col = (tint === 0 ? alt : base).map(v => Math.round(v * shade));
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; ctx.fillRect(c * cw, h / 2 - hh / 2, cw + 1, hh);
      }
      // the sun at the goal
      const gx = st.goal[0] - st.x, gy = st.goal[1] - st.y, gd = Math.hypot(gx, gy), ga = Math.atan2(gy, gx) - st.a, da = Math.atan2(Math.sin(ga), Math.cos(ga));
      if (Math.abs(da) < FOV / 2) { const c = Math.floor((da / FOV + 0.5) * cols); if (gd * Math.cos(da) < zbuf[Math.min(cols - 1, Math.max(0, c))]) { dot(ctx, [(da / FOV + 0.5) * w, h / 2], Math.min(60, h / gd * 0.22), C.sun); } }
      // map
      const s = Math.min(8, (w * 0.22) / W);
      ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = "#fff"; ctx.fillRect(10, 10, W * s, H * s);
      ctx.fillStyle = C.ink; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (map[j * W + i]) ctx.fillRect(10 + i * s, 10 + j * s, s, s);
      ctx.restore(); dot(ctx, [10 + st.goal[0] * s, 10 + st.goal[1] * s], 4, C.sun); dot(ctx, [10 + st.x * s, 10 + st.y * s], 4, C.coral);
      if (st.won) { text(ctx, "🎉 You found the sun!", w / 2, h * 0.2, 34); }
    },
    buttons: [{ label: "◀", hold: "left" }, { label: "▲", hold: "up" }, { label: "▼", hold: "down" }, { label: "▶", hold: "right" }, { label: "↻ New", act(st) { Object.assign(st, P.find(p => p.id === "fly").make()); } }],
    key(st, e, down) { const k = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" }[e.key]; if (k) { st.keys[k] = down; return true; } },
    move(st, dx) { st.a += dx * 0.01; }
  });

  // ================= helpers for mazes wrapped onto curved surfaces =================
  function surface(id, title, blurb, how, cols, rows, wrapX, wrapY, seed, map3, opts = {}) {
    return {
      id, title, tag: "3D · wraps around", blurb, how, orbit: true,
      make() { const m = gen(cols, rows, 1, wrapX, wrapY, seed); return { m, walls: m.walls(0), path: tour(m, 0, m.N - 1), ...base3d(opts.cam || {}) }; },
      draw(ctx, w, h, t, dt, st) {
        const p = cam(st, w, h), S = st.m;
        opts.back && opts.back(ctx, w, h, st, p, t);
        const seg = (x1, y1, x2, y2) => { const n = 4, out = []; for (let q = 0; q <= n; q++) { const u = lerp(x1, x2, q / n), v = lerp(y1, y2, q / n); out.push(map3(u / S.cols, v / S.rows, st, t)); } return out; };
        const all = st.walls.map(wl => seg(...wl)), drawn = all.map(pts => { const pp = pts.map(q => p(q[0], q[1], q[2])); const front = pts.reduce((s, q, i) => s + (opts.facing ? opts.facing(q, st, t) : 1), 0) / pts.length; return { pp, front, z: pp.reduce((s, q) => s + q[2], 0) / pp.length }; });
        drawn.sort((a, b) => b.z - a.z);
        for (const d of drawn) line(ctx, d.pp, C.ink, d.front > 0 ? 3.2 : 1.6, d.front > 0 ? 1 : 0.28);
        const pts = st.path.map(c => { const { i, j } = S.at(c); return [i + 0.5, j + 0.5]; });
        const b = along(pts, t, 2.6), q3 = map3(b[0] / S.cols, b[1] / S.rows, st, t, 0.06), q = p(q3[0], q3[1], q3[2]);
        dot(ctx, q, Math.max(7, w * 0.014), C.sun);
        const s0 = map3(0.5 / S.cols, 0.5 / S.rows, st, t, 0.06), e0 = map3((S.cols - 0.5) / S.cols, (S.rows - 0.5) / S.rows, st, t, 0.06);
        text(ctx, "🐱", ...p(s0[0], s0[1], s0[2]).slice(0, 2), 22); text(ctx, "⭐", ...p(e0[0], e0[1], e0[2]).slice(0, 2), 22);
      }
    };
  }

  // ================= 3. Globe =================
  P.push(surface("globe", "Maze Globe", "A maze that goes all the way around a ball. No edges: walk east long enough and you come back.",
    "The grid wraps left to right, so the maze has no seam. Each corner of a wall is turned into a longitude and latitude, then rotated and drawn. Walls on the far side are drawn faint.",
    22, 11, true, false, 5,
    (u, v, st, t, lift = 0) => { const lon = u * TAU + t * 0.3, lat = (v - 0.5) * Math.PI * 0.82, R = 3.4 + lift * 8; return [R * Math.cos(lat) * Math.cos(lon), -R * Math.sin(lat), R * Math.cos(lat) * Math.sin(lon)]; },
    {
      cam: { dist: 11, pitch: 0.35, yaw: 0, spin: 0 },
      facing: (q, st) => toward(q, st),
      back: (ctx, w, h, st, p) => { const c = p(0, 0, 0), R = 3.4, rad = Math.min(w, h) * st.f * R / Math.sqrt(st.dist * st.dist - R * R); ctx.beginPath(); ctx.arc(c[0], c[1], rad, 0, TAU); ctx.fillStyle = C.sky; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); }
    }));

  // ================= 4. Drum (cylinder) =================
  P.push(surface("drum", "Maze Drum", "A maze printed on a rolling drum. It keeps turning, and so does your path.",
    "The maze wraps around the drum, so a passage that leaves one side comes back on the other. The drum rolls on its own; drag to tilt it.",
    24, 9, true, false, 12,
    (u, v, st, t, lift = 0) => { const a = u * TAU + t * 0.45, R = 2.4 + lift * 6, L = 7; return [(v - 0.5) * L, R * Math.sin(a), R * Math.cos(a)]; },
    {
      cam: { dist: 12, pitch: 0.5, yaw: 0.9, spin: 0 },
      facing: (q, st) => toward([0, q[1], q[2]], st)
    }));

  // ================= 5. Donut (torus) =================
  P.push(surface("donut", "Maze Donut", "The maze wraps around the hole and around the tube at the same time.",
    "Both edges of the grid wrap, so the maze lives on a torus (a donut). Each wall corner becomes a point on the donut, then it is rotated and drawn.",
    28, 12, true, true, 8,
    (u, v, st, t, lift = 0) => { const a = u * TAU + t * 0.25, b = v * TAU, R = 3, r = 1.25 + lift * 3; return [(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a)]; },
    {
      cam: { dist: 11, pitch: 0.75, yaw: 0, spin: 0 },
      facing: (q, st) => { const rr = Math.hypot(q[0], q[2]) || 1; return toward([q[0] - 3 * q[0] / rr, q[1], q[2] - 3 * q[2] / rr], st); }
    }));

  // ================= 6. Cube: six little mazes on six faces =================
  P.push({
    id: "cube", title: "Maze Cube", tag: "3D", blurb: "A different maze on every face of a tumbling cube.",
    how: "Each face is its own small maze with its own start and finish. The cube tumbles; faces that turn away from you are hidden. Drag to spin it your own way.",
    orbit: true,
    make() {
      const faces = [], axes = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [1, 0, 0]]];
      const cols = [C.peach, C.lav, C.mint, C.sun, C.sky, "#ffd1dc"];
      for (let f = 0; f < 6; f++) { const m = gen(6, 6, 1, false, false, 40 + f), s = f % 2 ? -1 : 1, ax = axes[f >> 1]; faces.push({ m, walls: m.walls(0), n: ax[2].map(v => v * s), u: ax[0], v: ax[1], color: cols[f], path: tour(m, 0, m.N - 1) }); }
      return { faces, ...base3d({ dist: 12, yaw: 0.6, pitch: 0.5, spin: 0.35 }) };
    },
    draw(ctx, w, h, t, dt, st) {
      const p = cam(st, w, h), S = 2.1;
      const pos = (f, a, b, lift = 0) => [0, 1, 2].map(d => f.n[d] * (S + lift) + f.u[d] * (a * 2 - 1) * S + f.v[d] * (b * 2 - 1) * S);
      const list = st.faces.map(f => { const c = p(...f.n.map(v => v * S)), corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([a, b]) => p(...pos(f, a, b))); const nr = [f.n[0], f.n[1], f.n[2]]; const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch); const Z = -nr[0] * sy + nr[2] * cy, Zc = Z * cp - nr[1] * sp; return { f, c, corners, vis: Zc < 0.001, z: c[2] }; }).sort((a, b) => b.z - a.z);
      for (const q of list) {
        if (!q.vis) continue;
        ctx.beginPath(); q.corners.forEach((c, i) => (i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]))); ctx.closePath(); ctx.fillStyle = q.f.color; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
        const M = q.f.m;
        q.f.walls.forEach(([x1, y1, x2, y2]) => { const a = p(...pos(q.f, x1 / M.cols, y1 / M.rows)), b = p(...pos(q.f, x2 / M.cols, y2 / M.rows)); line(ctx, [a, b], C.ink, 2.6); });
        const pts = q.f.path.map(c => { const { i, j } = M.at(c); return [(i + 0.5) / M.cols, (j + 0.5) / M.rows]; });
        const b = along(pts, t + q.f.n[0] * 2 + q.f.n[1], 0.28 * 6), pp = p(...pos(q.f, b[0], b[1], 0.03));
        dot(ctx, pp, Math.max(5, w * 0.009), C.sun);
      }
    }
  });

  // ================= 7. Shifting maze: the walls move while you walk =================
  P.push({
    id: "shift", title: "Shifting Maze", tag: "moving · you steer", blurb: "Every few seconds a wall opens and another closes. The way is never the same twice.",
    how: "The maze is a tree of passages. Each shift adds one new passage (a loop appears) and closes one old passage on that loop, so a way to the star always exists. Arrow keys or the buttons move the cat.",
    make() { const m = gen(14, 9, 1, false, false, 3); return { m, open: new Set(m.open), alpha: new Map(), pl: 0, goal: m.N - 1, next: 3, won: 0, shifts: 0 }; },
    draw(ctx, w, h, t, dt, st) {
      st.lastT = t;
      const m = st.m, s = Math.min((w - 40) / m.cols, (h - 70) / m.rows), x0 = (w - s * m.cols) / 2, y0 = 50 + (h - 70 - s * m.rows) / 2;
      const isOpen = (a, b) => st.open.has(m.key(a, b));
      if (t > st.next && !st.won) {
        st.next = t + 3.2; st.shifts++;
        for (let tries = 0; tries < 40; tries++) {
          const a = m.r.int(m.N), ns = m.nb(a).filter(n => !isOpen(a, n.c)); if (!ns.length) continue;
          const b = ns[m.r.int(ns.length)].c;
          // path between a and b along open passages
          const prev = new Int32Array(m.N).fill(-2); prev[a] = -1; const q = [a];
          for (let k = 0; k < q.length && prev[b] === -2; k++) for (const n of m.nb(q[k])) if (prev[n.c] === -2 && isOpen(q[k], n.c)) { prev[n.c] = q[k]; q.push(n.c); }
          const path = []; for (let c = b; c !== -1; c = prev[c]) path.unshift(c);
          const cuts = []; for (let k = 0; k + 1 < path.length; k++) cuts.push([path[k], path[k + 1]]);
          const c = cuts[m.r.int(cuts.length)];
          st.open.add(m.key(a, b)); st.open.delete(m.key(c[0], c[1]));
          st.alpha.set(m.key(a, b), 0); st.alpha.set(m.key(c[0], c[1]), 1);
          break;
        }
      }
      for (const [k, v] of st.alpha) { const target = st.open.has(k) ? 0 : 1, nv = v + Math.sign(target - v) * Math.min(Math.abs(target - v), dt * 1.8); if (nv === target) st.alpha.delete(k); else st.alpha.set(k, nv); }
      ctx.fillStyle = "#fff"; ctx.fillRect(x0, y0, s * m.cols, s * m.rows);
      const wallA = (a, b) => { const k = m.key(a, b); return st.alpha.has(k) ? st.alpha.get(k) : (st.open.has(k) ? 0 : 1); };
      for (let j = 0; j < m.rows; j++) for (let i = 0; i < m.cols; i++) {
        const c = m.id(i, j), ns = m.nb(c), e = ns.find(n => n.d === "E"), so = ns.find(n => n.d === "S");
        if (e) line(ctx, [[x0 + (i + 1) * s, y0 + j * s], [x0 + (i + 1) * s, y0 + (j + 1) * s]], C.ink, 4, wallA(c, e.c));
        if (so) line(ctx, [[x0 + i * s, y0 + (j + 1) * s], [x0 + (i + 1) * s, y0 + (j + 1) * s]], C.ink, 4, wallA(c, so.c));
      }
      ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.strokeRect(x0, y0, s * m.cols, s * m.rows);
      const cell = c => { const { i, j } = m.at(c); return [x0 + (i + 0.5) * s, y0 + (j + 0.5) * s]; };
      text(ctx, "⭐", ...cell(st.goal), s * 0.7); text(ctx, "🐱", ...cell(st.pl).map((v, k) => v + (k ? s * 0.2 : 0)), s * 0.7);
      // countdown ring
      const f = Math.max(0, Math.min(1, (st.next - t) / 3.2)); ctx.beginPath(); ctx.arc(30, 28, 14, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.lineWidth = 6; ctx.strokeStyle = C.coral; ctx.stroke();
      text(ctx, st.won ? "🎉 You made it!" : "next shift", 62, 36, 18, C.ink, "left");
      if (st.won && t - st.won > 1.8) Object.assign(st, P.find(p => p.id === "shift").make(), { next: t + 3 });
    },
    buttons: [{ label: "◀", press: [-1, 0] }, { label: "▲", press: [0, -1] }, { label: "▼", press: [0, 1] }, { label: "▶", press: [1, 0] }],
    joy(st, x, y, dt) { st.joyCool = Math.max(0, (st.joyCool || 0) - dt); if (Math.hypot(x, y) < 0.5 || st.joyCool > 0) return; const d = Math.abs(x) > Math.abs(y) ? [Math.sign(x), 0] : [0, Math.sign(y)]; this.step(st, d); st.joyCool = 0.28; },
    key(st, e, down) { if (!down) return; const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] }[e.key]; if (d) { this.step(st, d); return true; } },
    step(st, d) {
      if (st.won) return; const m = st.m, { i, j } = m.at(st.pl), dir = d[0] > 0 ? "E" : d[0] < 0 ? "W" : d[1] > 0 ? "S" : "N", n = m.nb(st.pl).find(q => q.d === dir);
      if (n && st.open.has(m.key(st.pl, n.c))) { st.pl = n.c; if (n.c === st.goal) st.won = st.lastT + 0.001; }
    }
  });

  // ================= 8. Rings: time the gaps =================
  P.push({
    id: "rings", title: "Spinning Rings", tag: "moving · you steer", blurb: "Gaps turn round and round. Wait for one to line up, then dive in toward the center.",
    how: "Each ring turns at its own speed, one way or the other. Slide your ball around its lane, and press Dive when it sits right under a gap. No path is drawn: the maze is in the timing.",
    make() { const rings = [0, 1, 2, 3, 4].map(k => ({ r: 4.6 - k * 0.85, speed: (k % 2 ? -1 : 1) * (0.5 + 0.18 * k), gap: 0.9 - k * 0.05, off: k * 1.3 })); return { rings, lane: 0, a: -Math.PI / 2, won: 0, drive: 0 }; },
    draw(ctx, w, h, t, dt, st) {
      const cx = w / 2, cy = h / 2, sc = Math.min(w, h) / 11.5;
      st.a += st.drive * 2.3 * Math.min(dt, 0.05);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 5.1 * sc, 0, TAU); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      const gapAt = (ring, ang) => { const d = Math.atan2(Math.sin(ang - ring.off - ring.speed * t), Math.cos(ang - ring.off - ring.speed * t)); return Math.abs(d) < ring.gap / 2; };
      st.rings.forEach((rg, k) => {
        const a0 = rg.off + rg.speed * t + rg.gap / 2, a1 = rg.off + rg.speed * t + TAU - rg.gap / 2;
        ctx.beginPath(); ctx.arc(cx, cy, rg.r * sc, a0, a1); ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.strokeStyle = [C.coral, C.peach, C.lav, C.mint, C.sky][k % 5]; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, rg.r * sc, a0, a1); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(cx, cy, 0.4 * sc, 0, TAU); ctx.fillStyle = C.sun; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); text(ctx, "⭐", cx, cy + 7, 20);
      const laneR = st.lane < st.rings.length ? (st.rings[st.lane].r + 0.42) * sc : 0;
      const bx = cx + Math.cos(st.a) * (st.lane >= st.rings.length ? 0 : laneR), by = cy + Math.sin(st.a) * (st.lane >= st.rings.length ? 0 : laneR);
      dot(ctx, [bx, by], Math.max(9, sc * 0.22), C.sky); text(ctx, "🐱", bx, by + 7, 16);
      if (st.lane >= st.rings.length) text(ctx, "🎉 You made it!", cx, h * 0.1, 34);
      st.t = t;
    },
    buttons: [{ label: "◀", hold: "L" }, { label: "▶", hold: "R" }, { label: "⬇ Dive", act(st) { this.dive(st); } }, { label: "↻ New", act(st) { Object.assign(st, P.find(p => p.id === "rings").make()); } }],
    dive(st) {
      if (st.lane >= st.rings.length) return; const ring = st.rings[st.lane], d = Math.atan2(Math.sin(st.a - ring.off - ring.speed * st.t), Math.cos(st.a - ring.off - ring.speed * st.t));
      if (Math.abs(d) < ring.gap / 2) st.lane++;
    },
    key(st, e, down) { if (e.key === "ArrowLeft") { st.drive = down ? -1 : (st.drive === -1 ? 0 : st.drive); return true; } if (e.key === "ArrowRight") { st.drive = down ? 1 : (st.drive === 1 ? 0 : st.drive); return true; } if (down && (e.key === "ArrowDown" || e.key === " ")) { this.dive(st); return true; } },
    holdKey(st, k, down) { st.drive = down ? (k === "L" ? -1 : 1) : 0; },
    joy(st, x, y) { st.drive = x < -0.35 ? -1 : x > 0.35 ? 1 : 0; if (y > 0.7 && !st.diveHeld) { st.diveHeld = true; this.dive(st); } if (y < 0.3) st.diveHeld = false; }
  });

  // ================= 9. Stairs: a maze in floors =================
  P.push({
    id: "stairs", title: "Maze Tower", tag: "3D", blurb: "Three floors, joined by stairs. Watch the cat climb through all of them.",
    how: "The maze is a 3D grid: each cell can also open up or down. Floors are drawn apart so you can see through, and the posts are the stairs. Drag to turn the tower.",
    orbit: true,
    make() { const m = gen(8, 6, 3, false, false, 19); return { m, path: tour(m, 0, m.N - 1), walls: [0, 1, 2].map(k => m.walls(k)), ...base3d({ dist: 19, pitch: 0.62, yaw: 0.6, f: 1.15 }) }; },
    draw(ctx, w, h, t, dt, st) {
      const m = st.m, p = cam(st, w, h), X = i => i - m.cols / 2, Z = j => j - m.rows / 2, Y = k => (k - 1) * 3.4, cols = [C.peach, C.mint, C.lav];
      for (let k = 0; k < 3; k++) {
        const quad = [[0, 0], [m.cols, 0], [m.cols, m.rows], [0, m.rows]].map(([i, j]) => p(X(i), Y(k), Z(j)));
        ctx.beginPath(); quad.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.globalAlpha = 0.55; ctx.fillStyle = cols[k]; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
        st.walls[k].forEach(([x1, y1, x2, y2]) => line(ctx, [p(X(x1), Y(k), Z(y1)), p(X(x2), Y(k), Z(y2))], C.ink, 2.6));
        // stairs up from this floor
        if (k < 2) for (let c = 0; c < m.cols * m.rows; c++) { const a = c + k * m.cols * m.rows, b = a + m.cols * m.rows; if (m.isOpen(a, b)) { const { i, j } = m.at(a); line(ctx, [p(X(i + 0.5), Y(k), Z(j + 0.5)), p(X(i + 0.5), Y(k + 1), Z(j + 0.5))], C.coralD, 6); } }
      }
      const pts = st.path.map(c => { const { i, j, k } = m.at(c); return [i + 0.5, j + 0.5, k]; });
      const b = along(pts, t, 3), q = p(X(b[0]), Y(b[2]) + 0.4, Z(b[1]));
      dot(ctx, q, Math.max(8, w * 0.015), C.sun);
    }
  });

  // ================= 10. Flood: how a computer solves it =================
  P.push({
    id: "flood", title: "Flood", tag: "moving", blurb: "Water pours in at the start and floods every passage. The first drop to reach the star shows the shortest way.",
    how: "This is breadth-first search: the water spreads one step at a time to every open neighbor, so it reaches the finish by the shortest route. Then the way back is traced in green. It is how a computer solves a maze.",
    make() { return { seed: 100, built: null, t0: 0 }; },
    draw(ctx, w, h, t, dt, st) {
      if (!st.built) {
        const m = gen(18, 11, 1, false, false, st.seed), dist = new Int32Array(m.N).fill(-1); dist[0] = 0; const q = [0];
        for (let k = 0; k < q.length; k++) for (const n of m.nb(q[k])) if (dist[n.c] < 0 && m.isOpen(q[k], n.c)) { dist[n.c] = dist[q[k]] + 1; q.push(n.c); }
        st.built = { m, dist, maxd: dist[m.N - 1], path: m.solve(0, m.N - 1), walls: m.walls(0) }; st.t0 = t;
      }
      const { m, dist, maxd, path, walls } = st.built, s = Math.min((w - 40) / m.cols, (h - 40) / m.rows), x0 = (w - s * m.cols) / 2, y0 = (h - s * m.rows) / 2;
      const speed = 11, reach = (t - st.t0) * speed;
      ctx.fillStyle = "#fff"; ctx.fillRect(x0, y0, s * m.cols, s * m.rows);
      for (let c = 0; c < m.N; c++) if (dist[c] >= 0 && dist[c] <= reach) { const { i, j } = m.at(c), f = 1 - Math.min(1, (reach - dist[c]) / 10); ctx.fillStyle = f > 0 ? "#7cc4ff" : `hsl(${205 - (dist[c] / maxd) * 40} 85% ${78 - (dist[c] / maxd) * 18}%)`; ctx.fillRect(x0 + i * s, y0 + j * s, s + 0.5, s + 0.5); }
      walls.forEach(([x1, y1, x2, y2]) => line(ctx, [[x0 + x1 * s, y0 + y1 * s], [x0 + x2 * s, y0 + y2 * s]], C.ink, 4));
      ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.strokeRect(x0, y0, s * m.cols, s * m.rows);
      const cell = c => { const { i, j } = m.at(c); return [x0 + (i + 0.5) * s, y0 + (j + 0.5) * s]; };
      if (reach >= maxd) { const f = Math.min(1, (reach - maxd) / 14); line(ctx, path.slice(0, Math.max(2, Math.round(f * path.length))).map(cell), C.green, Math.max(5, s * 0.22)); if (f >= 1 && reach > maxd + 40) { st.seed++; st.built = null; } }
      text(ctx, "⭐", ...cell(m.N - 1), s * 0.7); text(ctx, "🐱", ...cell(0), s * 0.7);
    }
  });

  root.FMZ.proto = { list: P, gen };
})(window);
