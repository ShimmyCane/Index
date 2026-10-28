/* Felix Maze silhouettes: a maze that fills a picture (a fish, a castle, the letter F, ...).
   Each shape is drawn in its own box (w × h, any units) as a yes/no function: "is this point inside?".
   FMZ.shapes.fit() places a shape on the page and returns a mask for the maze grid.
   `s` and `f` are where the maze starts and finishes (in shape units); `fin` means the finish is inside the shape. */
(function (root) {
  "use strict";
  const E = root.FMZ.engine;

  // ---------- building blocks ----------
  const poly = pts => (x, y) => E.inPoly(x, y, pts);
  const circle = (cx, cy, r) => (x, y) => (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
  const ellipse = (cx, cy, rx, ry, deg = 0) => {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return (x, y) => { const dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c; return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1; };
  };
  const cap = (x1, y1, x2, y2, r) => (x, y) => E.segDist(x, y, x1, y1, x2, y2) <= r;   // a thick line with round ends
  const rect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const or = (...f) => (x, y) => f.some(g => g(x, y));
  const minus = (a, ...b) => (x, y) => a(x, y) && !b.some(g => g(x, y));
  const star = (cx, cy, R, r, n, rot = -90) => {
    const pts = [];
    for (let i = 0; i < 2 * n; i++) { const a = (rot + i * 180 / n) * Math.PI / 180, q = i % 2 ? r : R; pts.push([cx + q * Math.cos(a), cy + q * Math.sin(a)]); }
    return poly(pts);
  };

  // ---------- the silhouettes ----------
  const SHAPES = {
    fish: { w: 100, h: 64, fn: or(ellipse(44, 32, 40, 24), poly([[72, 32], [100, 4], [100, 60]]), poly([[34, 12], [52, 0], [60, 14]])), s: [100, 32], f: [0, 32] },
    whale: { w: 112, h: 66, fn: or(ellipse(48, 42, 46, 22), poly([[84, 40], [104, 8], [112, 12], [106, 36], [112, 56], [104, 60], [84, 48]])), s: [110, 34], f: [2, 44] },
    turtle: { w: 116, h: 84, fn: or(ellipse(52, 42, 42, 34), ellipse(100, 42, 14, 10), ellipse(24, 12, 11, 8, -25), ellipse(80, 12, 11, 8, 25), ellipse(24, 72, 11, 8, 25), ellipse(80, 72, 11, 8, -25), poly([[12, 42], [0, 38], [0, 46]])), s: [116, 42], f: [0, 42] },
    butterfly: { w: 100, h: 80, fn: or(ellipse(30, 28, 29, 23, -20), ellipse(70, 28, 29, 23, 20), ellipse(33, 62, 20, 16, 15), ellipse(67, 62, 20, 16, -15), cap(50, 16, 50, 74, 6)), s: [0, 28], f: [100, 28] },
    snail: { w: 104, h: 88, fn: or(circle(62, 42, 35), cap(10, 78, 86, 78, 10), circle(12, 62, 11), cap(10, 78, 12, 64, 9)), s: [0, 66], f: [62, 6] },
    tree: { w: 72, h: 100, fn: or(circle(36, 30, 29), circle(15, 48, 18), circle(57, 48, 18), poly([[26, 60], [46, 60], [50, 100], [22, 100]])), s: [36, 100], f: [36, 0] },
    bird: { w: 116, h: 76, fn: or(ellipse(54, 44, 33, 22, -12), circle(88, 28, 15), poly([[100, 24], [116, 30], [100, 38]]), poly([[28, 38], [0, 24], [2, 52], [26, 52]])), s: [0, 38], f: [116, 30] },
    moon: { w: 84, h: 100, fn: minus(circle(42, 50, 44), circle(64, 44, 36)), s: [56, 8], f: [56, 93] },
    rocket: { w: 60, h: 100, fn: or(ellipse(30, 28, 17, 28), rect(13, 28, 47, 84), poly([[13, 60], [0, 96], [13, 84]]), poly([[47, 60], [60, 96], [47, 84]])), s: [30, 100], f: [30, 0] },
    balloon: { w: 80, h: 100, fn: or(ellipse(40, 34, 35, 34), poly([[16, 56], [64, 56], [52, 80], [28, 80]]), rect(28, 78, 52, 100)), s: [40, 100], f: [40, 0] },
    kite: { w: 64, h: 70, fn: poly([[32, 0], [62, 32], [32, 70], [2, 32]]), s: [32, 70], f: [32, 0] },
    catface: { w: 100, h: 88, fn: or(ellipse(50, 56, 46, 31), poly([[6, 42], [12, 0], [44, 26]]), poly([[94, 42], [88, 0], [56, 26]])), s: [88, 2], f: [12, 2] },
    dino: { w: 114, h: 74, fn: or(ellipse(50, 46, 30, 18), cap(72, 40, 94, 16, 9), ellipse(100, 12, 12, 8), poly([[22, 42], [0, 62], [28, 56]]), cap(34, 58, 34, 72, 7), cap(64, 58, 64, 72, 7)), s: [0, 60], f: [112, 12] },
    island: { w: 100, h: 70, fn: poly([[4, 50], [14, 30], [34, 20], [56, 12], [78, 24], [92, 38], [98, 54], [80, 66], [40, 69], [14, 62]]), s: [0, 50], f: [52, 38], fin: true },
    castle: { w: 100, h: 90, fn: minus(or(rect(14, 38, 86, 90), rect(2, 18, 28, 90), rect(72, 18, 98, 90), rect(36, 2, 64, 90)), rect(42, 66, 58, 90)), s: [50, 90], f: [50, 0] },
    pyramid: { w: 100, h: 70, fn: poly([[0, 70], [50, 0], [100, 70]]), s: [8, 70], f: [50, 0] },
    pumpkin: { w: 100, h: 84, fn: or(ellipse(50, 54, 46, 30), rect(43, 8, 57, 28)), s: [0, 54], f: [50, 8] },
    pineapple: { w: 66, h: 100, fn: or(ellipse(33, 66, 27, 34), poly([[33, 36], [10, 4], [28, 30]]), poly([[33, 36], [56, 4], [38, 30]]), poly([[33, 36], [27, 0], [39, 0]])), s: [33, 100], f: [33, 0] },
    matisse: { w: 80, h: 100, fn: poly([[44, 0], [66, 18], [58, 34], [80, 50], [60, 62], [76, 82], [46, 100], [24, 80], [40, 62], [10, 48], [34, 34], [24, 16]]), s: [46, 100], f: [44, 0] },
    oval: { w: 100, h: 70, fn: ellipse(50, 35, 50, 35), s: [0, 35], f: [50, 35], fin: true },
    rect: { w: 100, h: 62, fn: rect(0, 0, 100, 62), s: [50, 62], f: [50, 31], fin: true },
    // Keith Haring style figures (chunky limbs)
    haringA: { w: 100, h: 100, fn: or(circle(50, 11, 12), cap(50, 26, 50, 60, 11), cap(50, 30, 24, 8, 8), cap(50, 30, 76, 8, 8), cap(50, 60, 30, 96, 9), cap(50, 60, 70, 94, 9)), s: [30, 100], f: [76, 0] },
    haringB: { w: 100, h: 100, fn: or(circle(50, 14, 12), cap(50, 28, 50, 56, 11), cap(50, 32, 20, 24, 8), cap(20, 24, 6, 6, 8), cap(50, 32, 80, 24, 8), cap(80, 24, 94, 6, 8), cap(50, 56, 22, 74, 9), cap(22, 74, 10, 98, 9), cap(50, 56, 78, 74, 9), cap(78, 74, 92, 98, 9)), s: [10, 100], f: [94, 0] },
    dog: { w: 110, h: 80, fn: or(ellipse(52, 40, 30, 16), circle(90, 22, 14), poly([[100, 14], [112, 20], [102, 28]]), poly([[84, 12], [90, -2], [96, 12]]), cap(30, 52, 24, 78, 7), cap(70, 52, 74, 78, 7), cap(24, 36, 4, 22, 6)), s: [2, 22], f: [112, 20] },
    baby: { w: 110, h: 80, fn: or(circle(88, 24, 17), ellipse(52, 42, 28, 17), cap(30, 52, 20, 76, 8), cap(70, 52, 80, 76, 8), cap(36, 40, 16, 56, 8), cap(70, 36, 92, 56, 8)), s: [8, 62], f: [104, 14] },
    // letters
    letterF: { w: 64, h: 100, fn: or(rect(0, 0, 26, 100), rect(0, 0, 64, 24), rect(0, 38, 50, 62)), s: [13, 100], f: [64, 12] },
    letterE: { w: 64, h: 100, fn: or(rect(0, 0, 26, 100), rect(0, 0, 64, 24), rect(0, 38, 54, 62), rect(0, 76, 64, 100)), s: [13, 100], f: [64, 12] },
    letterL: { w: 64, h: 100, fn: or(rect(0, 0, 26, 100), rect(0, 76, 64, 100)), s: [13, 0], f: [64, 88] },
    letterI: { w: 64, h: 100, fn: or(rect(19, 0, 45, 100), rect(0, 0, 64, 24), rect(0, 76, 64, 100)), s: [32, 0], f: [32, 100] },
    // hex mazes
    snowflake: {
      w: 100, h: 100, hex: true, s: [0, 50], f: [100, 50],
      fn: (() => {
        const parts = [];
        [0, 60, 120].forEach(deg => {
          const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
          parts.push(cap(50 - 50 * c, 50 - 50 * s, 50 + 50 * c, 50 + 50 * s, 8));
          [-1, 1].forEach(side => [1, -1].forEach(dir => {
            const bx = 50 + dir * 30 * c, by = 50 + dir * 30 * s, b = a + side * Math.PI / 3 * (dir > 0 ? 1 : -1);
            parts.push(cap(bx, by, bx + 20 * Math.cos(b), by + 20 * Math.sin(b), 6));
          }));
        });
        return or(...parts);
      })()
    },
    startile: { w: 100, h: 100, hex: true, fn: star(50, 50, 50, 29, 8, -90), s: [0, 50], f: [100, 50] }
  };

  // Shapes that depend on a setting: the rainbow's bands, the Sierpiński triangle's depth.
  function rainbow(bands) {
    const edges = { 1: [[26, 50]], 2: [[38, 50], [22, 34]], 3: [[41, 50], [29, 38], [17, 26]] }[bands] || [[26, 50]];
    return { w: 100, h: 56, fn: (x, y) => { if (y > 56) return false; const r = Math.hypot(x - 50, y - 56); return edges.some(([a, b]) => r >= a && r <= b); }, s: [0, 56], f: [100, 56] };
  }
  function sierpinski(n) {
    const H = 87;
    return {
      w: 100, h: H, s: [8, H], f: [50, 0],
      fn: (x, y) => {
        const t = y / H; if (t < 0 || t > 1) return false;
        const row = Math.min(n - 1, Math.floor(t * n)), w = 100 / n;
        const j = Math.round((x - (50 - row * w / 2)) / w);
        return j >= 0 && j <= row && (j & (row - j)) === 0;
      }
    };
  }
  function get(id, p = {}) {
    if (id === "rainbow") return rainbow(p.bands || 1);
    if (id === "sierpinski") return sierpinski(p.n || 4);
    return SHAPES[id];
  }

  /* Place a shape in the drawing area. area = { cx, cy, w, h }. Returns the mask for the grid, its box on the page,
     and a function to turn shape points into page points. flip mirrors it left to right. */
  function fit(shape, area, flip) {
    const sc = Math.min(area.w / shape.w, area.h / shape.h);
    const ox = area.cx - shape.w * sc / 2, oy = area.cy - shape.h * sc / 2;
    const toShape = (px, py) => { let x = (px - ox) / sc; if (flip) x = shape.w - x; return [x, (py - oy) / sc]; };
    const toPage = (x, y) => [ox + (flip ? shape.w - x : x) * sc, oy + y * sc];
    return { scale: sc, box: { x: ox, y: oy, w: shape.w * sc, h: shape.h * sc }, mask: (px, py) => { const [x, y] = toShape(px, py); return shape.fn(x, y); }, toPage };
  }

  root.FMZ = root.FMZ || {};
  root.FMZ.shapes = { SHAPES, get, fit, poly, circle, ellipse, cap, rect, or, minus, star };
})(typeof window !== "undefined" ? window : globalThis);
