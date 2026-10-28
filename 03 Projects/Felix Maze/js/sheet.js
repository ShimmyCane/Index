/* Felix Maze sheets: turn a recipe into a maze model and an SVG worksheet.
   Units: 1 = 0.01 inch. A sheet is US Letter landscape, 1100 × 850.
   Recipe: { n, family, level, source, style, seed, title, inspired, fun, tags, doodle? } (see catalog.md). */
(function (root) {
  "use strict";
  const E = root.FMZ.engine, A = root.FMZ.art;
  const W = 1100, H = 850;
  const INK = "#222";

  // Difficulty by time to solve.
  const LEVELS = {
    1: { name: "About 2 minutes", size: 88, mix: 0, braid: 0 },
    2: { name: "About 5 minutes", size: 64, mix: 0.1, braid: 0.04 },
    3: { name: "About 10 minutes", size: 48, mix: 0.25, braid: 0.06 },
    4: { name: "20 minutes or more", size: 36, mix: 0.35, braid: 0.08 }
  };
  const FAMILIES = {
    1: "Classical", 2: "Famous mazes", 3: "Art", 4: "Nature", 5: "Systems and maps", 6: "Math and patterns", 7: "Music and sound", 8: "Story worlds"
  };
  const SOURCES = { 0: "Made by the computer", 1: "Grown from Felix's doodle", 2: "Picked and tuned by hand" };

  const hex = (v, n) => v.toString(16).toUpperCase().padStart(n, "0");
  // Code: family, level, source, then a counter. 8 1 0 - 001 → "810-001".
  const code = r => hex(r.family, 1) + hex(r.level, 1) + hex(r.source || 0, 1) + "-" + hex(r.n, 3);
  function parseCode(s) {
    const m = String(s).trim().toUpperCase().replace(/^#/, "").match(/^([0-9A-F])([0-9A-F])([0-9A-F])-?([0-9A-F]{1,3})$/);
    if (m) return { family: parseInt(m[1], 16), level: parseInt(m[2], 16), source: parseInt(m[3], 16), n: parseInt(m[4], 16) };
    const k = String(s).trim().replace(/^#/, "").match(/^([0-9A-Fa-f]{1,3})$/);
    return k ? { n: parseInt(k[1], 16) } : null;
  }

  // ---------- geometry to SVG ----------
  const f1 = v => v.toFixed(1);
  function samplesOf(geo, chords, step = 14) {
    if (geo.t === "line" || chords) {
      let x1, y1, x2, y2;
      if (geo.t === "line") ({ x1, y1, x2, y2 } = geo);
      else { const q = geo.squash || 1; x1 = geo.cx + geo.r * Math.cos(geo.a0); y1 = geo.cy + geo.r * Math.sin(geo.a0) * q; x2 = geo.cx + geo.r * Math.cos(geo.a1); y2 = geo.cy + geo.r * Math.sin(geo.a1) * q; }
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      return Array.from({ length: n + 1 }, (_, k) => [x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
    }
    const n = Math.max(2, Math.ceil(Math.abs(geo.a1 - geo.a0) * geo.r / step));
    const q = geo.squash || 1;
    return Array.from({ length: n + 1 }, (_, k) => { const a = geo.a0 + (geo.a1 - geo.a0) * k / n; return [geo.cx + geo.r * Math.cos(a), geo.cy + geo.r * Math.sin(a) * q]; });
  }
  function smooth(pts) {
    if (pts.length < 3) return "M" + pts.map(p => f1(p[0]) + " " + f1(p[1])).join("L");
    let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += "Q" + f1(pts[i][0]) + " " + f1(pts[i][1]) + " " + f1(mx) + " " + f1(my);
    }
    const l = pts[pts.length - 1];
    return d + "L" + f1(l[0]) + " " + f1(l[1]);
  }
  // Hand feel: a gentle bend in the middle of a stroke, ends stay put so walls still meet.
  function wobbly(pts, amt, r) {
    if (!amt || pts.length < 2) return pts;
    const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    const k = (r() - 0.5) * 2 * amt, k2 = (r() - 0.5) * amt;
    const n = pts.length - 1;
    return pts.map(([x, y], i) => { const t = i / n, b = Math.sin(Math.PI * t) * k + Math.sin(2 * Math.PI * t) * k2; return [x + nx * b, y + ny * b]; });
  }

  // Swirls (Starry Night): rotate points around vortex centers, more near the middle.
  function makeWarp(vortices) {
    if (!vortices || !vortices.length) return null;
    return ([x, y]) => {
      for (const v of vortices) {
        const dx = x - v.x, dy = y - v.y, d = Math.hypot(dx, dy);
        const th = v.s * Math.exp(-(d * d) / (v.r * v.r));
        const c = Math.cos(th), s = Math.sin(th);
        x = v.x + dx * c - dy * s; y = v.y + dx * s + dy * c;
      }
      return [x, y];
    };
  }

  // ---------- the maze model ----------
  function buildModel(recipe) {
    const st = STYLES[recipe.style] || STYLES.mouse;
    const lv = LEVELS[recipe.level] || LEVELS[2];
    const r = E.rng(recipe.seed >>> 0);
    const spec = st.spec(recipe, lv);
    spec.geometry = spec.geometry || st.geometry;
    let g;
    if (spec.geometry === "hex") g = E.buildHex(Object.assign({}, spec.box, { size: spec.size, mask: spec.mask }));
    else if (spec.geometry === "polar") g = E.buildPolar(spec.polar);
    else g = E.buildGrid(Object.assign({}, spec.box, { size: spec.size, mask: spec.mask }));
    if (spec.mask) g = E.keepLargest(g);
    const prep = spec.prepare ? spec.prepare(g, r) : {};
    const grown = E.grow(g, r, Object.assign({ mix: spec.mix !== undefined ? spec.mix : lv.mix, growth: recipe.growth || 1 }, prep));
    const links = grown.links;
    let bridges = [];
    if ((recipe.growth || 1) >= 1) {
      if (spec.weave) bridges = E.weave(g, links, r, spec.weave);
      E.braid(g, links, r, spec.braid !== undefined ? spec.braid : lv.braid);
    }
    // {far:true}: the outside doorway farthest (along the maze) from the other end, for a long right path
    const farFrom = (cell, side) => {
      const d = E.distances(g, links, cell);
      let best = -1, bc = -1;
      g.edges.forEach((e, i) => { if (e.b === null && d[e.a] > best && (!side || sideOk(e, side))) { best = d[e.a]; bc = i; } });
      return bc < 0 ? { cell: 0, edge: -1 } : { cell: g.edges[bc].a, edge: bc };
    };
    let start, end;
    if (spec.start.far) {
      end = prep.finish || E.pickEnd(g, spec.finish, spec.box || {});
      start = farFrom(end.cell, spec.start.side);
    } else {
      start = prep.start || E.pickEnd(g, spec.start, spec.box || {});
      end = spec.finish.far ? farFrom(start.cell, spec.finish.side) : prep.finish || E.pickEnd(g, spec.finish, spec.box || {});
    }
    const sol = (recipe.growth || 1) >= 1 ? E.solve(g, links, start.cell, end.cell) : null;
    const model = { recipe, spec, g, links, seen: grown.seen, bridges, start, end, sol };
    model.path = sol ? E.pathPoints(g, sol, start, end) : null;
    model.warp = makeWarp(spec.look.vortices);
    if (model.warp && model.path) model.path = model.path.map(model.warp);
    model.deadEnds = 0;
    g.cells.forEach((c, i) => { if (E.degree(g, links, i) === 1 && i !== start.cell && i !== end.cell) model.deadEnds++; });
    return model;
  }
  function sideOk(e, side) {
    const want = { W: [-1, 0], E: [1, 0], N: [0, -1], S: [0, 1] }[side];
    return !want || !e.out || e.out[0] * want[0] + e.out[1] * want[1] > 0.7;
  }

  // Where a character stands: just outside its doorway, or inside its cell.
  function standAt(model, end, push = 1) {
    const g = model.g, c = g.cells[end.cell];
    let p;
    if (end.edge >= 0) {
      const [mx, my] = E.edgeMid(g.edges[end.edge].geo);
      const o = g.edges[end.edge].out || [mx - c.cx, my - c.cy];
      const L = Math.hypot(o[0], o[1]) || 1;
      p = [mx + (o[0] / L) * 44 * push, my + (o[1] / L) * 44 * push];
    } else p = [c.cx, c.cy];
    return model.warp ? model.warp(p) : p;
  }

  // ---------- drawing the maze ----------
  function renderMaze(model, uid, opts = {}) {
    const { g, links, spec, seen } = model;
    const look = spec.look;
    const r = E.rng((model.recipe.seed >>> 0) ^ 0x51ed27);
    const warp = model.warp;
    const growing = (model.recipe.growth || 1) < 1;
    const ptsOf = geo => { let p = samplesOf(geo, look.chords, warp ? 10 : 40); if (warp) p = p.map(warp); return wobbly(p, look.wobble || 0, r); };
    const out = [];
    const entrance = new Set([model.start.edge, model.end.edge]);
    const center = c => { const p = [g.cells[c].cx, g.cells[c].cy]; return warp ? warp(p) : p; };
    const mid = geo => { const p = E.edgeMid(geo); return warp ? warp(p) : p; };

    if (look.bg) out.push(look.bg(uid, model));

    if (look.mode === "walls") {
      const d = [], bd = [];
      g.edges.forEach((e, i) => {
        if (e.under) return;
        if (growing && !(seen[e.a] || (e.b !== null && seen[e.b]))) return;
        if (e.b === null) { if (!entrance.has(i)) bd.push(smooth(ptsOf(e.geo))); }
        else if (!links.has(i)) d.push(smooth(ptsOf(e.geo)));
      });
      const all = d.concat(bd).join("");
      const w = look.wall, ow = look.outline || w;
      if (look.hedge) {
        out.push(`<path d="${all}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
        out.push(`<path d="${all}" fill="none" stroke="url(#leaf${uid})" stroke-width="${w - 5}" stroke-linecap="round" stroke-linejoin="round"/>`);
      } else if (look.double) {
        out.push(`<path d="${all}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
        out.push(`<path d="${all}" fill="none" stroke="#fff" stroke-width="${look.double}" stroke-linecap="round" stroke-linejoin="round"/>`);
      } else {
        out.push(`<path d="${d.join("")}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
        out.push(`<path d="${bd.join("")}" fill="none" stroke="${INK}" stroke-width="${ow}" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
    } else {
      // Paths drawn as ribbons, tunnels or subway lines.
      const segs = [], overs = [];
      g.edges.forEach((e, i) => {
        if (!links.has(i)) return;
        if (e.under) { segs.push([center(e.a), center(e.b)]); return; }
        segs.push([center(e.a), mid(e.geo), center(e.b)]);
      });
      for (const b of model.bridges) {
        const c = g.cells[b.cell], s = g.s / 2;
        const p = b.over === "NS" ? [[c.cx, c.cy - s], [c.cx, c.cy + s]] : [[c.cx - s, c.cy], [c.cx + s, c.cy]];
        overs.push(warp ? p.map(warp) : p);
      }
      for (const end of [model.start, model.end]) {
        if (end.edge < 0) continue;
        segs.push([center(end.cell), standAt(model, end, 0.55)]);
      }
      const dOf = list => list.map(p => smooth(wobbly(p, look.wobble || 0, r))).join("");
      const D = dOf(segs);
      if (look.mode === "subway") {
        out.push(`<path d="${D}" fill="none" stroke="${INK}" stroke-width="${look.wall}" stroke-linecap="round" stroke-linejoin="round"/>`);
        g.cells.forEach((c, i) => {
          const deg = E.degree(g, links, i);
          if (deg >= 3 || deg === 1) { const [x, y] = center(i); out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${look.wall * 0.95}" fill="#fff" stroke="${INK}" stroke-width="5"/>`); }
        });
      } else {
        const ow = look.wall + 2 * look.edge;
        out.push(`<path d="${D}" fill="none" stroke="${INK}" stroke-width="${ow}" stroke-linecap="round" stroke-linejoin="round"/>`);
        if (look.chamber) g.cells.forEach((c, i) => {
          if (E.degree(g, links, i) === 1) { const [x, y] = center(i); out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(ow * look.chamber / 2)}" fill="${INK}"/>`); }
        });
        out.push(`<path d="${D}" fill="none" stroke="#fff" stroke-width="${look.wall}" stroke-linecap="round" stroke-linejoin="round"/>`);
        if (look.chamber) g.cells.forEach((c, i) => {
          if (E.degree(g, links, i) === 1) { const [x, y] = center(i); out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(ow * look.chamber / 2 - look.edge)}" fill="#fff"/>`); }
        });
        if (overs.length) {
          const O = overs.map(p => smooth(p)).join("");
          out.push(`<path d="${O}" fill="none" stroke="${INK}" stroke-width="${ow}" stroke-linecap="butt"/>`);
          out.push(`<path d="${O}" fill="none" stroke="#fff" stroke-width="${look.wall}" stroke-linecap="square"/>`);
        }
      }
    }
    if (opts.answer && model.path) {
      out.push(`<path class="fmz-answer" d="${smooth(model.path)}" fill="none" stroke="${opts.answerColor || "#e0604a"}" stroke-width="${opts.answerWidth || Math.max(8, (spec.size || 40) * 0.18)}" stroke-linecap="round" stroke-linejoin="round" ${opts.answerDash ? `stroke-dasharray="${opts.answerDash}"` : ""}/>`);
    }
    return out.join("");
  }

  function defs(uid) {
    return `<defs>
      <pattern id="leaf${uid}" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#fff"/><circle cx="3" cy="3" r="1.6" fill="#555"/><circle cx="9" cy="8" r="1.6" fill="#555"/><path d="M7 2 q2 1 3 3" stroke="#555" stroke-width="1.2" fill="none"/>
      </pattern>
      <pattern id="earth${uid}" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect width="22" height="22" fill="#fff"/><circle cx="4" cy="5" r="1.8" fill="#444"/><circle cx="15" cy="3" r="1.2" fill="#444"/><circle cx="11" cy="13" r="2" fill="#444"/><circle cx="3" cy="17" r="1.2" fill="#444"/><circle cx="18" cy="18" r="1.6" fill="#444"/>
      </pattern>
      <pattern id="sky${uid}" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 q10 -8 20 0 t20 0" fill="none" stroke="#bbb" stroke-width="1.5"/>
      </pattern>
    </defs>`;
  }

  // ---------- the worksheet ----------
  let uidCounter = 0;
  function svg(recipe, opts = {}) {
    const model = opts.model || buildModel(recipe);
    const uid = "m" + (++uidCounter);
    const st = STYLES[recipe.style] || STYLES.mouse;
    const id = code(recipe);
    const font = `font-family="Patrick Hand, 'Comic Sans MS', 'Chalkboard SE', cursive"`;
    const parts = [];
    parts.push(defs(uid));
    parts.push(`<rect width="${W}" height="${H}" fill="#fff"/>`);
    if (st.under) parts.push(st.under(model, uid));
    parts.push(`<g class="fmz-maze">${renderMaze(model, uid, opts)}</g>`);
    if (st.over) parts.push(st.over(model, uid));
    const sp = model.spec;
    if (sp.chars && model.sol !== undefined) {
      const sz = sp.charSize || 84;
      const inside = end => end.edge >= 0 ? sz : model.g.kind === "polar" && end.cell === 0 ? model.g.r0 * 1.5 : Math.min(sz, (model.g.s || sp.size || 60) * 0.9);
      const a = standAt(model, model.start), b = standAt(model, model.end);
      parts.push(`<g class="fmz-start">${A.draw(sp.chars[0], a[0], a[1], inside(model.start))}</g>`);
      parts.push(`<g class="fmz-finish">${A.draw(sp.chars[1], b[0], b[1], inside(model.end))}</g>`);
    }
    if (!opts.bare) {
      parts.push(`<text x="40" y="70" ${font} font-size="44" fill="${INK}">Felix Maze <tspan font-size="30">#${id}</tspan></text>`);
      const foot = [`Felix Maze #${id}`, recipe.title, recipe.inspired, recipe.fun].filter(Boolean).join("  ·  ");
      const fit = foot.length * 7.6 > 1020 ? ` textLength="1020" lengthAdjust="spacingAndGlyphs"` : "";
      parts.push(`<text x="${W / 2}" y="822" text-anchor="middle" ${font} font-size="17" fill="#444"${fit}>${esc(foot)}</text>`);
    }
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"${opts.fluid ? "" : ' width="11in" height="8.5in"'}>${parts.join("")}</svg>`, model };
  }
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------- the styles ----------
     spec(recipe, level) returns: geometry, box, size, mask, polar, mix, braid, weave, start, finish, chars, look.
     look.mode: walls | ribbon | subway. under/over draw extra pictures before/after the maze. */
  const capsule = (segs, rad) => (x, y) => segs.some(([a, b, c, d, t]) => E.segDist(x, y, a, b, c, d) <= (t || rad));

  const STYLES = {
    mouse: {
      label: "Mouse and cheese", geometry: "grid",
      spec: (rc, lv) => ({ box: { x: 160, y: 115, w: 780, h: 650 }, size: lv.size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 },
        chars: ["mouse", "cheese"], look: { mode: "walls", wall: 9, wobble: 3 } })
    },
    starry: {
      label: "Starry Night swirls", geometry: "grid",
      spec: (rc, lv) => ({ box: { x: 140, y: 125, w: 760, h: 630 }, size: lv.size, start: { side: "W", at: 0.85 }, finish: { side: "N", at: 0.9 },
        chars: ["cat", "moon"],
        look: { mode: "walls", wall: 6.5, wobble: 1.2, vortices: [{ x: 430, y: 330, r: 210, s: 1.35 }, { x: 700, y: 560, r: 160, s: -1.1 }, { x: 300, y: 600, r: 110, s: 0.9 }] } }),
      over: () => {
        // a cypress tree like the flame-shaped one in the painting, and stars around the edge
        let s = `<path d="M985 760 C950 640 990 560 975 470 C965 400 1000 330 990 230 C1010 320 1030 400 1022 480 C1015 560 1050 650 1020 760 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
        s += `<path d="M990 300 q12 30 0 60 M1000 420 q14 34 -2 70 M996 560 q16 40 0 90" fill="none" stroke="${INK}" stroke-width="3"/>`;
        [[60, 140], [95, 300], [55, 470], [1050, 150], [930, 110], [640, 100]].forEach(([x, y], i) => { s += A.draw("star", x, y, i % 2 ? 26 : 34); });
        return s;
      }
    },
    haring: {
      label: "Dancing figure", geometry: "grid",
      spec: (rc, lv) => {
        const limbs = [
          [550, 300, 550, 500, 78], // body
          [550, 320, 420, 200], [420, 200, 370, 120], // left arm up
          [550, 320, 690, 220], [690, 220, 760, 140], // right arm up
          [550, 500, 440, 590], [440, 590, 410, 670], // left leg
          [550, 500, 650, 590], [650, 590, 710, 660]  // right leg
        ];
        const head = (x, y) => Math.hypot(x - 550, y - 200) < 66;
        const body = capsule(limbs, 50);
        return { box: { x: 260, y: 110, w: 580, h: 600 }, size: Math.min(lv.size, 40), mask: (x, y) => body(x, y) || head(x, y),
          start: { side: "S", at: 0.26 }, finish: { side: "N", at: 0.88 }, chars: ["cat", "heart"], charSize: 70,
          look: { mode: "walls", wall: 6, outline: 14, wobble: 1.5 } };
      },
      under: () => {
        // buzz lines, like the lines Keith Haring drew around his dancing figures
        const lines = [[300, 160, 250, 130], [290, 230, 235, 225], [830, 170, 880, 140], [840, 240, 900, 240], [360, 700, 310, 730], [760, 700, 810, 730], [470, 130, 450, 95], [640, 130, 660, 95]];
        return lines.map(([a, b, c, d]) => `<path d="M${a} ${b} L${c} ${d}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`).join("");
      }
    },
    hampton: {
      label: "Hampton Court hedge maze", geometry: "grid",
      spec: (rc, lv) => {
        const poly = [[330, 115], [770, 115], [950, 730], [150, 730]];
        return { box: { x: 150, y: 115, w: 800, h: 615 }, size: lv.size, mask: (x, y) => E.inPoly(x, y, poly),
          start: { side: "S", at: 0.5 }, finish: { near: [550, 420] }, chars: ["cat", "tree"], charSize: 74,
          look: { mode: "walls", wall: 17, hedge: true, wobble: 0.8 } };
      }
    },
    honeycomb: {
      label: "Honeycomb", geometry: "hex",
      spec: (rc, lv) => ({ box: { x: 150, y: 110, w: 800, h: 650 }, size: lv.size * 1.05, start: { side: "W", at: 0.3 }, finish: { side: "E", at: 0.7 },
        chars: ["bee", "flower"], look: { mode: "walls", wall: 7, wobble: 0 } })
    },
    spider: {
      label: "Spider web", geometry: "polar",
      spec: (rc, lv) => {
        const R = 320, size = Math.max(44, lv.size * 0.85);
        return { polar: { cx: 560, cy: 440, R, rings: Math.max(3, Math.round(R / size) - 1), core: 1.3 }, size,
          start: { far: true }, finish: { center: true }, chars: ["spider", "star"], charSize: 80,
          look: { mode: "walls", wall: 3.5, outline: 5, chords: true } };
      }
    },
    ants: {
      label: "Ant tunnels", geometry: "grid",
      spec: (rc, lv) => ({ box: { x: 110, y: 185, w: 880, h: 570 }, size: lv.size, mix: 0, start: { side: "N", at: 0.15 }, finish: { near: [940, 720] },
        chars: ["ant", "cookie"], charSize: 74, look: { mode: "ribbon", wall: lv.size * 0.52, edge: 4, chamber: 1.25, wobble: 5,
          bg: uid => `<rect x="70" y="160" width="960" height="625" rx="30" fill="url(#earth${uid})" stroke="${INK}" stroke-width="5"/>` } }),
      under: () => {
        // ground line with grass tufts and a little anthill
        let s = `<path d="M50 160 L1050 160" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
        for (let x = 300; x < 1040; x += 70) s += `<path d="M${x} 160 l-6 -18 M${x} 160 l2 -22 M${x} 160 l9 -16" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
        s += `<path d="M150 160 Q215 110 280 160" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
        return s;
      }
    },
    celtic: {
      label: "Celtic knot", geometry: "grid",
      spec: (rc, lv) => ({ box: { x: 170, y: 125, w: 760, h: 610 }, size: Math.max(lv.size, 54), weave: 0.55, braid: 0, start: { side: "W", at: 0.15 }, finish: { side: "E", at: 0.85 },
        chars: ["cat", "yarn"], charSize: 76, look: { mode: "ribbon", wall: 22, edge: 4.5, wobble: 0 } }),
      under: () => `<rect x="120" y="100" width="860" height="660" rx="40" fill="none" stroke="${INK}" stroke-width="5"/><rect x="132" y="112" width="836" height="636" rx="32" fill="none" stroke="${INK}" stroke-width="2.5"/>`
    },
    subway: {
      label: "Subway map", geometry: "grid",
      spec: (rc, lv) => ({ box: { x: 170, y: 120, w: 760, h: 630 }, size: lv.size * 0.95, braid: 0.12, start: { side: "W", at: 0.25 }, finish: { side: "E", at: 0.75 },
        chars: ["train", "house"], charSize: 86, look: { mode: "subway", wall: 11, wobble: 0 } })
    },
    chartres: {
      label: "Chartres rings", geometry: "polar",
      spec: (rc, lv) => {
        const R = 300, size = lv.size;
        return { polar: { cx: 550, cy: 425, R, rings: Math.max(4, Math.round(R / size) - 1), core: 1.6, rot: -Math.PI / 2 }, size,
          start: { far: true }, finish: { center: true }, chars: ["cat", "rosette"], charSize: 76,
          look: { mode: "walls", wall: 9, double: 3, wobble: 0 } };
      },
      under: m => {
        // the scalloped edge of the Chartres labyrinth
        const p = m.spec.polar, n = 56; let s = "";
        for (let k = 0; k < n; k++) { const a = (k + 0.5) * 2 * Math.PI / n; s += `<circle cx="${f1(p.cx + (p.R + 16) * Math.cos(a))}" cy="${f1(p.cy + (p.R + 16) * Math.sin(a))}" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/>`; }
        return s;
      }
    },
    doodle: {
      label: "Felix's doodle", geometry: "grid",
      spec: (rc, lv) => root.FMZ.doodle.spec(rc, lv),
      over: m => root.FMZ.doodle.overlay(m.recipe, (m.recipe.growth || 1) < 1)
    }
  };

  root.FMZ = root.FMZ || {};
  root.FMZ.sheet = { W, H, LEVELS, FAMILIES, SOURCES, STYLES, code, parseCode, buildModel, renderMaze, svg, smooth, standAt, makeWarp };
})(typeof window !== "undefined" ? window : globalThis);
