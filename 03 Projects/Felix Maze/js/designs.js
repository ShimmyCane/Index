/* Felix Maze: the styles behind the catalog's designs (silhouettes, ring mazes, Mondrian rooms, waves, ribbons, streets...).
   Each is registered into FMZ.sheet.STYLES, so a recipe only names its style and a few settings (recipe.p).
   The words (titles, footers) live in tools/designs_data.js, used by the generator. */
(function (root) {
  "use strict";
  const S = root.FMZ.sheet, E = root.FMZ.engine, SH = root.FMZ.shapes;
  const INK = "#222";
  const AREA = { cx: 550, cy: 420, w: 660, h: 510 };            // the drawing area: plenty of white around it
  const wallFor = size => Math.max(4.5, Math.min(9, size * 0.15)); // thinner walls for smaller squares
  const f1 = v => v.toFixed(1);
  const reg = (name, geometry, def) => { S.STYLES[name] = Object.assign({ geometry }, def); };

  // ---------- silhouettes: a maze that fills a picture ----------
  function shapeSpec(geometry) {
    return (rc, lv) => {
      const p = rc.p || {};
      const sh = SH.get(p.shape, Object.assign({ n: lv.level >= 5 ? 8 : 4 }, p)), f = SH.fit(sh, AREA, p.flip);
      const size = lv.size * (geometry === "hex" ? 1.05 : 1) * (p.scale || 1);
      const start = { nearEdge: f.toPage(sh.s[0], sh.s[1]) };
      const finish = sh.fin ? { near: f.toPage(sh.f[0], sh.f[1]) } : { nearEdge: f.toPage(sh.f[0], sh.f[1]) };
      return {
        geometry, box: f.box, size, mask: f.mask, start, finish,
        chars: ["cat", "star"], charSize: Math.max(62, Math.min(84, size * 1.7)), treat: p.treat || null,
        look: Object.assign({ mode: "walls", wall: wallFor(size), wobble: p.wobble !== undefined ? p.wobble : 1.4 }, p.look)
      };
    };
  }
  reg("shape", "grid", { spec: shapeSpec("grid") });
  reg("hexshape", "hex", { spec: shapeSpec("hex") });

  // ---------- rings and spokes ----------
  function ringsUnder(m) {
    const p = m.recipe.p || {}, pl = m.spec.polar;
    if (!p.decor) return "";
    let s = "";
    if (p.decor === "scallop") {
      const n = 56; for (let k = 0; k < n; k++) { const a = (k + 0.5) * 2 * Math.PI / n; s += `<circle cx="${f1(pl.cx + (pl.R + 16) * Math.cos(a))}" cy="${f1(pl.cy + (pl.R + 16) * Math.sin(a))}" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/>`; }
    } else if (p.decor === "petals") {
      const n = 16; for (let k = 0; k < n; k++) { const a = k * 360 / n; s += `<ellipse cx="${f1(pl.cx)}" cy="${f1(pl.cy - pl.R - 30)}" rx="16" ry="32" transform="rotate(${a} ${f1(pl.cx)} ${f1(pl.cy)})" fill="#fff" stroke="${INK}" stroke-width="4"/>`; }
    } else if (p.decor === "rays") {
      const n = 24; for (let k = 0; k < n; k++) { const a = k * 360 / n; s += `<path d="M${f1(pl.cx)} ${f1(pl.cy - pl.R - 14)} L${f1(pl.cx)} ${f1(pl.cy - pl.R - (k % 2 ? 34 : 50))}" transform="rotate(${a} ${f1(pl.cx)} ${f1(pl.cy)})" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`; }
    } else if (p.decor === "seeds") {
      const n = 48; for (let k = 0; k < n; k++) { const a = (k + 0.5) * 2 * Math.PI / n; s += `<circle cx="${f1(pl.cx + (pl.R + 18) * Math.cos(a))}" cy="${f1(pl.cy + (pl.R + 18) * Math.sin(a))}" r="5" fill="${INK}"/>`; }
    } else if (p.decor === "ticks") {
      const n = 72; for (let k = 0; k < n; k++) { const a = k * 2 * Math.PI / n; s += `<path d="M${f1(pl.cx + (pl.R + 10) * Math.cos(a))} ${f1(pl.cy + (pl.R + 10) * Math.sin(a))} L${f1(pl.cx + (pl.R + (k % 6 ? 20 : 30)) * Math.cos(a))} ${f1(pl.cy + (pl.R + (k % 6 ? 20 : 30)) * Math.sin(a))}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; }
    }
    return s;
  }
  reg("rings", "polar", {
    spec: (rc, lv) => {
      const p = rc.p || {}, R = p.R || 265, size = lv.size * (p.scale || 1);
      const rings = Math.max(3, Math.round(R / size) - 1), wall = wallFor(size);
      const look = { mode: "walls", wall, wobble: 0, chords: !!p.chords };
      if (p.look === "dots") { look.dots = { size: wall * 1.2, gap: wall * 2.2 }; look.wall = look.dots.size; }
      else if (p.look === "double") { look.wall = wall * 1.3; look.double = look.wall * 0.36; }
      else if (p.look === "hedge") { look.hedge = true; look.wall = wall * 2.1; }
      else if (p.look === "thin") { look.wall = Math.max(3, wall * 0.55); }
      return { polar: { cx: 550, cy: 425, R, rings, core: p.core || 1.5, rot: p.rot !== undefined ? p.rot : -Math.PI / 2 }, size, start: { far: true }, finish: { center: true }, chars: ["cat", "star"], charSize: 76, treat: p.treat || null, look };
    },
    under: ringsUnder
  });

  // ---------- Mondrian: big rooms, thick walls, doors ----------
  reg("mondrian", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1);
      const box = { x: 220, y: 165, w: 660, h: 510 };
      const total = (box.w / size) * (box.h / size);
      return {
        box, size, start: { side: "W", at: p.startAt || 0.5 }, finish: { side: "E", at: p.finishAt || 0.5 }, chars: ["cat", "star"], charSize: 76,
        generate: (g, r) => E.divide(g, r, { minSide: 2, maxArea: Math.max(8, Math.round(total / 9)), heavyDepth: 1, mix: 0.1 }),
        look: { mode: "walls", wall: Math.max(3.5, wallFor(size) * 0.55), heavyScale: 3, wobble: 0.6 }
      };
    }
  });

  // ---------- bent mazes: waves and spirals ----------
  const SPIRALS = [
    [[400, 300, 1.45], [560, 430, -1.45], [720, 540, 1.45]],
    [[420, 520, 1.45], [560, 400, -1.45], [700, 290, 1.45]],
    [[390, 400, -1.4], [550, 400, 1.5], [710, 400, -1.4]],
    [[480, 290, 1.5], [640, 330, -1.5], [560, 520, 1.5]]
  ];
  reg("spirals", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), v = SPIRALS[(p.v || 0) % SPIRALS.length];
      return {
        box: { x: 230, y: 175, w: 640, h: 490 }, size, start: { side: "W", at: 0.8 }, finish: { side: "E", at: 0.25 }, chars: ["cat", "heart"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size) * 0.9, wobble: 1, vortices: v.map(([x, y, s]) => ({ x, y, r: 140, s })) }
      };
    }
  });
  reg("wave", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), v = p.v || 0;
      return {
        box: { x: 230, y: 175, w: 640, h: 490 }, size, start: { side: "W", at: 0.75 }, finish: { side: "E", at: 0.3 }, chars: ["boat", "mountain"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size) * (p.thin ? 0.55 : 0.9), wobble: 1, sine: { a: 30 + 6 * (v % 2), k: 0.013 + 0.002 * v, ph: v }, vortices: [{ x: 690 - 40 * (v % 2), y: 320, r: 120, s: -1.5 }] }
      };
    }
  });
  reg("soundwave", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), v = p.v || 0;
      return {
        box: { x: 230, y: 185, w: 640, h: 470 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "note"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size) * 0.9, wobble: 0.8, sine: { a: [44, 30, 52, 38][v % 4], k: [0.016, 0.026, 0.012, 0.02][v % 4], ph: v * 0.7 } }
      };
    }
  });

  // ---------- ribbons: paths drawn as roads, canals and tunnels ----------
  reg("kusama", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = Math.max(lv.size * (p.scale || 1), 46);
      return { box: { x: 225, y: 175, w: 650, h: 490 }, size, mix: 0, start: { side: "W", at: 0.2 }, finish: { side: "E", at: 0.8 }, chars: ["cat", "pumpkin"], charSize: 76, treat: p.treat || null,
        look: { mode: "ribbon", wall: size * 0.5, edge: 4.5, chamber: 1.9, wobble: 0 } };
    }
  });
  reg("canals", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = Math.max(lv.size * (p.scale || 1), 46);
      return { box: { x: 225, y: 175, w: 650, h: 490 }, size, weave: 0.55, braid: 0, start: { side: "W", at: 0.3 }, finish: { side: "E", at: 0.7 }, chars: ["boat", "house"], charSize: 76, treat: p.treat || null,
        look: { mode: "ribbon", wall: size * 0.4, edge: 4.5, wobble: 0 } };
    },
    under: () => `<path d="M170 700 q20 -14 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>`
  });

  // ---------- rectangles with a look: streets, piano, checkerboard, dots, circuit ----------
  reg("streets", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), wall = Math.max(7, size * 0.17);
      return { box: { x: 215, y: 165, w: 670, h: 510 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "house"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall, double: wall * 0.42, wobble: 0 } };
    }
  });
  const KEYS = (x0, y0, w, h, n) => {
    let s = ""; const kw = w / n;
    for (let k = 0; k < n; k++) s += `<rect x="${f1(x0 + k * kw)}" y="${y0}" width="${f1(kw)}" height="${h}" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`;
    for (let k = 0; k < n - 1; k++) if ((k % 7) !== 2 && (k % 7) !== 6) s += `<rect x="${f1(x0 + (k + 1) * kw - kw * 0.3)}" y="${y0}" width="${f1(kw * 0.6)}" height="${f1(h * 0.62)}" rx="3" fill="${INK}"/>`;
    return s;
  };
  reg("piano", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1);
      return { box: { x: 215, y: 160, w: 670, h: 380 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "note"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size), wobble: 1.2 } };
    },
    under: () => KEYS(215, 590, 670, 100, 14)
  });
  reg("checker", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, n = p.n || ({ 1: 5, 2: 8, 3: 10, 4: 12, 5: 14 }[lv.level] || 8), cell = Math.floor(500 / n);
      return { box: { x: 550 - cell * n / 2, y: 420 - cell * n / 2, w: cell * n, h: cell * n }, size: cell, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "star"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(cell), wobble: 0.8, bg: (uid, m) => m.g.cells.filter(c => (c.i + c.j) % 2).map(c => `<rect x="${f1(c.cx - m.g.s / 2)}" y="${f1(c.cy - m.g.s / 2)}" width="${f1(m.g.s)}" height="${f1(m.g.s)}" fill="#e4e4e4"/>`).join("") } };
    }
  });
  reg("seurat", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), dot = Math.max(5, wallFor(size) * 1.15);
      return { box: { x: 215, y: 165, w: 670, h: 510 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "sun"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: dot, dots: { size: dot, gap: dot * 1.9 }, wobble: 0 } };
    }
  });
  reg("circuit", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1);
      return { box: { x: 230, y: 160, w: 640, h: 520 }, size: size * 0.95, braid: 0.12, start: { side: "W", at: 0.3 }, finish: { side: "E", at: 0.7 }, chars: ["cat", "star"], charSize: 76,
        look: { mode: "subway", wall: 5, pad: 8, wobble: 0 } };
    },
    under: () => [[130, 120], [880, 640]].map(([x, y]) => `<rect x="${x}" y="${y}" width="70" height="50" rx="5" fill="#fff" stroke="${INK}" stroke-width="4"/>${[0, 1, 2, 3].map(k => `<path d="M${x + 12 + k * 16} ${y} v-12 M${x + 12 + k * 16} ${y + 50} v12" stroke="${INK}" stroke-width="3"/>`).join("")}`).join("")
  });

  // Paul Klee's patchwork: rooms washed with soft grey squares
  const KLEE = ["#fff", "#ececec", "#dcdcdc", "#f6f6f6"];
  reg("klee", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1), seed = rc.seed || 1;
      const shade = (i, j) => KLEE[(((Math.floor(i / 2) * 73856093) ^ (Math.floor(j / 2) * 19349663) ^ seed) >>> 0) % 4];
      return { box: { x: 215, y: 165, w: 670, h: 510 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "star"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size), wobble: 1, bg: (uid, m) => m.g.cells.map(c => `<rect x="${f1(c.cx - m.g.s / 2)}" y="${f1(c.cy - m.g.s / 2)}" width="${f1(m.g.s + 0.5)}" height="${f1(m.g.s + 0.5)}" fill="${shade(c.i, c.j)}"/>`).join("") } };
    }
  });
  // a carpet: the maze sits inside borders inside borders
  reg("carpet", "grid", {
    spec: (rc, lv) => {
      const p = rc.p || {}, size = lv.size * (p.scale || 1);
      return { box: { x: 270, y: 215, w: 560, h: 420 }, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: ["cat", "star"], charSize: 76, treat: p.treat || null,
        look: { mode: "walls", wall: wallFor(size), wobble: 0.8 } };
    },
    under: () => {
      let s = `<rect x="170" y="135" width="760" height="570" rx="6" fill="none" stroke="${INK}" stroke-width="5"/><rect x="186" y="151" width="728" height="538" rx="3" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
      for (let k = 0; k < 24; k++) s += `<circle cx="${f1(222 + k * 30.8)}" cy="173" r="5" fill="${INK}"/><circle cx="${f1(222 + k * 30.8)}" cy="667" r="5" fill="${INK}"/>`;
      for (let k = 0; k < 15; k++) s += `<circle cx="208" cy="${f1(200 + k * 31)}" r="5" fill="${INK}"/><circle cx="892" cy="${f1(200 + k * 31)}" r="5" fill="${INK}"/>`;
      return s + `<rect x="236" y="199" width="628" height="442" fill="none" stroke="${INK}" stroke-width="3"/>`;
    }
  });

  root.FMZ.designsLoaded = true;
})(typeof window !== "undefined" ? window : globalThis);
