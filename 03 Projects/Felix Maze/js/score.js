/* Felix Maze scores: how hard a maze is, and how much joy it is likely to give.
   Difficulty uses the measures maze researchers use: length of the right path, choices along it,
   how deep the wrong turns go (traps), and the "confusion ratio" (wrong-turn length ÷ right-path length).
   Joy follows rubric.md: Looking (inviting at a glance), Doing (fun to work through), Solving (the payoff).
   These are the computer's guesses; Felix's reactions (the log) are the real answer. */
(function (root) {
  "use strict";
  const E = root.FMZ.engine;

  function measure(model) {
    const { g, links, sol } = model;
    if (!sol) return null;
    const onPath = new Set(sol.cells);
    const L = sol.cells.length;
    let choices = 0, trapSum = 0, trapMax = 0;
    const seen = new Set(onPath);
    for (const c of sol.cells) {
      const branches = [];
      for (const ei of g.adj[c]) {
        if (!links.has(ei)) continue;
        const o = E.other(g.edges[ei], c);
        if (o === null || onPath.has(o) || seen.has(o)) continue;
        // size of the wrong turn: every square you can reach from here without coming back to the path
        let size = 0; const q = [o]; seen.add(o);
        while (q.length) {
          const x = q.pop(); size++;
          for (const ej of g.adj[x]) {
            if (!links.has(ej)) continue;
            const y = E.other(g.edges[ej], x);
            if (y !== null && !seen.has(y) && !onPath.has(y)) { seen.add(y); q.push(y); }
          }
        }
        branches.push(size);
      }
      if (branches.length) choices += branches.length;
      for (const b of branches) { trapSum += b; trapMax = Math.max(trapMax, b); }
    }
    const loops = links.size - (g.cells.length - 1);
    const confusion = trapSum / L;
    // A rough time to solve for a young solver, in minutes: walking the path, plus exploring
    // about half of the wrong turns at each choice (deeper traps cost more).
    let secs = L * 1.1;
    for (const c of sol.cells) {
      for (const ei of g.adj[c]) {
        if (!links.has(ei)) continue;
        const o = E.other(g.edges[ei], c);
        if (o !== null && !onPath.has(o)) secs += 2.5;
      }
    }
    secs += trapSum * 0.55 + trapMax * 0.6;
    // effort: a grown-up's minutes. Level boundaries sit halfway between the typical effort of each
    // level's settings (measured over all styles). The level's time label is a target for Felix,
    // to be tuned from his log, not a measurement.
    const effort = secs / 60;
    const level = effort <= 0.85 ? 1 : effort <= 1.25 ? 2 : effort <= 1.8 ? 3 : effort <= 2.8 ? 4 : 5;
    // the longest stretch of the right path with no choice at all (a dull hallway)
    let run = 0, longest = 0;
    for (const c of sol.cells) {
      const deg = E.degree(g, links, c);
      if (deg <= 2) { run++; longest = Math.max(longest, run); } else run = 0;
    }
    return { L, choices, trapSum, trapMax, confusion: Math.round(confusion * 100) / 100, loops, deadEnds: model.deadEnds,
      effort: Math.round(effort * 10) / 10, level, dull: Math.round((longest / L) * 100) / 100 };
  }

  const clamp = v => Math.max(1, Math.min(5, Math.round(v * 10) / 10));

  function joy(model, m, lint) {
    const sp = model.spec, look = sp.look, W = root.FMZ.sheet.W, H = root.FMZ.sheet.H;
    // ---- Looking: room to breathe, a pencil-friendly path, clean lines ----
    const xs = model.g.cells.map(c => c.cx), ys = model.g.cells.map(c => c.cy);
    const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
    const fill = (bw * bh) / (W * H);                         // share of the page the maze covers
    const corridor = ((model.g.s || sp.size) - (look.mode === "walls" ? look.wall : 0)) / 100; // inches
    // ink: inches of wall line per square inch of maze. Busy pages look like sewing-machine stitching.
    let inkLen = 0;
    for (const w of (model.drawn && model.drawn.walls) || []) for (let i = 1; i < w.length; i++) inkLen += Math.hypot(w[i][0] - w[i - 1][0], w[i][1] - w[i - 1][1]);
    const ink = inkLen / 100 / Math.max(1, (bw * bh) / 10000);
    let looking = 3;
    looking += fill < 0.36 ? 0.8 : fill > 0.5 ? -1 : 0.3;
    looking += corridor >= 0.6 ? 0.6 : corridor >= 0.4 ? 0.2 : -0.6;
    looking += ink === 0 ? 0.3 : ink < 2.5 ? 0.6 : ink < 4 ? 0 : -0.8;
    looking += lint && lint.ok ? 0 : -2.5;
    // ---- Doing: real choices, not a long dull hallway, the path wanders the whole maze ----
    let doing = 2.6;
    const rate = m ? m.choices / m.L : 0;
    doing += rate >= 0.2 && rate <= 0.38 ? 0.8 : rate < 0.1 ? -1 : 0.2;
    doing += m && m.confusion >= 1 && m.confusion <= 3.5 ? 0.6 : m && m.confusion < 0.6 ? -0.8 : m && m.confusion > 5 ? -0.4 : 0;
    doing += m && m.dull > 0.35 ? -0.7 : m && m.dull < 0.2 ? 0.3 : 0;
    if (model.path) {
      const px = model.path.map(p => p[0]), py = model.path.map(p => p[1]);
      const spread = ((Math.max(...px) - Math.min(...px)) * (Math.max(...py) - Math.min(...py))) / Math.max(1, bw * bh);
      doing += spread > 0.45 ? 0.6 : spread < 0.2 ? -0.6 : 0;
    }
    // ---- Solving: a goal that belongs to the start, a surprise or mechanic, treats on the way ----
    let solving = 2.5;
    if (sp.chars) solving += 0.8;
    if (model.bridges.length) solving += 0.8;
    if (sp.mask || look.vortices || model.g.kind !== "grid") solving += 0.6;
    if (model.treats && model.treats.length) solving += 0.7;
    return { looking: clamp(looking), doing: clamp(doing), solving: clamp(solving), fill: Math.round(fill * 100) / 100, corridor: Math.round(corridor * 100) / 100, ink: Math.round(ink * 10) / 10 };
  }

  function score(model) {
    const lint = root.FMZ.sheet.lint(model);
    const m = measure(model);
    const j = joy(model, m, lint);
    const overall = Math.round(((j.looking + j.doing + j.solving) / 3) * 10) / 10;
    return Object.assign({ ok: lint.ok && !!m, lint }, m || {}, j, { overall });
  }

  root.FMZ = root.FMZ || {};
  root.FMZ.score = { measure, joy, score };
})(typeof window !== "undefined" ? window : globalThis);
