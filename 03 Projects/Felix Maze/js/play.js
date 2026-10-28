/* Felix Maze drive mode: the rules, with no drawing.
   A Driver moves one step at a time along the open passages of a built maze (FMZ.sheet.buildModel), so it can never
   cross a wall. It remembers every step, including turning around, so the page can show where you explored and replay
   the drive afterwards. The finish is reached when you stand in the finish square; the way does not have to be short. */
(function (root) {
  "use strict";
  const E = root.FMZ.engine;
  const other = (e, c) => (e.a === c ? e.b : e.a);

  function Driver(model) {
    const g = model.g, links = model.links, warp = model.warp;
    const pos = c => { const p = [g.cells[c].cx, g.cells[c].cy]; return warp ? warp(p) : p; };
    const d = this;
    d.model = model;
    d.pos = pos;
    d.start = model.start.cell;
    d.end = model.end.cell;
    d.reset = () => { d.walk = [d.start]; d.hints = 0; d.t0 = null; };
    d.reset();
    Object.defineProperty(d, "cur", { get: () => d.walk[d.walk.length - 1] });
    Object.defineProperty(d, "won", { get: () => d.cur === d.end });

    // open passages out of a square: [{cell, edge}]
    d.exits = c => g.adj[c].filter(ei => links.has(ei) && other(g.edges[ei], c) !== null).map(ei => ({ cell: other(g.edges[ei], c), edge: ei }));
    d.edgeBetween = (a, b) => { const x = d.exits(a).find(e => e.cell === b); return x ? x.edge : -1; };

    // one step to a neighbouring square; false if there is a wall in the way
    d.step = c => {
      if (d.won) return false;
      if (!d.exits(d.cur).some(e => e.cell === c)) return false;
      if (d.t0 === null) d.t0 = Date.now();
      d.walk.push(c);
      return true;
    };
    // step back to the square you came from (it counts as a move: the line shows you went there and back)
    d.back = () => {
      if (d.won || d.walk.length < 2) return false;
      const prev = d.walk[d.walk.length - 2];
      d.walk.push(prev);
      return true;
    };
    // a pointer is over square `target`: follow the passages toward it, a few steps at most, never through a wall
    d.driveTo = (target, maxSteps = 5) => {
      if (d.won || target === d.cur) return 0;
      const q = [d.cur], prev = new Map([[d.cur, -1]]), depth = new Map([[d.cur, 0]]);
      for (let h = 0; h < q.length; h++) {
        const c = q[h];
        if (c === target) break;
        if (depth.get(c) >= maxSteps) continue;
        for (const e of d.exits(c)) if (!prev.has(e.cell)) { prev.set(e.cell, c); depth.set(e.cell, depth.get(c) + 1); q.push(e.cell); }
      }
      if (!prev.has(target)) return 0;
      const route = []; for (let c = target; c !== -1; c = prev.get(c)) route.unshift(c);
      let n = 0;
      for (const c of route.slice(1)) { if (!d.step(c)) break; n++; }
      return n;
    };
    // arrow keys: the open passage that points most nearly that way (dx, dy in page directions)
    d.go = (dx, dy) => {
      if (d.won) return false;
      const a = pos(d.cur);
      let best = null, bs = 0.5;
      for (const e of d.exits(d.cur)) {
        const b = pos(e.cell), vx = b[0] - a[0], vy = b[1] - a[1], L = Math.hypot(vx, vy) || 1;
        const s = (vx * dx + vy * dy) / L;
        if (s > bs) { bs = s; best = e.cell; }
      }
      return best !== null && d.step(best);
    };
    // 💡 the next few squares of the right way from where you stand
    d.hint = (n = 7) => {
      const sol = E.solve(g, links, d.cur, d.end);
      if (!sol) return [];
      d.hints++;
      return sol.cells.slice(0, n + 1);
    };

    // numbers for the end screen
    d.stats = () => {
      const seen = new Set(d.walk), sol = E.solve(g, links, d.start, d.end), onWay = new Set(sol ? sol.cells : []);
      let turns = 0;
      for (let i = 2; i < d.walk.length; i++) if (d.walk[i] === d.walk[i - 2]) turns++;
      const side = [...seen].filter(c => !onWay.has(c)).length;
      return {
        steps: d.walk.length - 1, shortest: sol ? sol.cells.length - 1 : 0, visited: seen.size, total: g.cells.length,
        explored: Math.round(100 * seen.size / g.cells.length), sideSquares: side, turns, hints: d.hints,
        seconds: d.t0 ? Math.round((Date.now() - d.t0) / 1000) : 0
      };
    };

    /* The line you have drawn, as page points: through the middle of each square and each doorway you passed.
       It includes every turn-around, so the exploration shows. */
    const outside = (end, c) => {
      if (!end || end.edge < 0) return null;
      const [mx, my] = E.edgeMid(g.edges[end.edge].geo), cc = pos(c);
      const m = warp ? warp([mx, my]) : [mx, my];
      return [m[0] + (m[0] - cc[0]) * 0.6, m[1] + (m[1] - cc[1]) * 0.6];
    };
    d.points = (upTo = d.walk.length, withExit = true) => {
      const pts = [], first = outside(model.start, d.start);
      if (first) pts.push(first);
      pts.push(pos(d.walk[0]));
      for (let i = 1; i < upTo; i++) {
        const a = d.walk[i - 1], b = d.walk[i], ei = d.edgeBetween(a, b);
        if (ei >= 0 && !g.edges[ei].under) { const m = E.edgeMid(g.edges[ei].geo); pts.push(warp ? warp(m) : m); }
        pts.push(pos(b));
      }
      if (withExit && d.walk[upTo - 1] === d.end) { const last = outside(model.end, d.end); if (last) pts.push(last); }
      return pts;
    };
    // the nearest square to a page point
    d.nearest = (x, y) => {
      let best = 0, bd = Infinity;
      for (let i = 0; i < g.cells.length; i++) { const p = pos(i), dd = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (dd < bd) { bd = dd; best = i; } }
      return best;
    };
  }

  root.FMZ.play = { Driver };
})(typeof window !== "undefined" ? window : globalThis);
