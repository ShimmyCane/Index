/* Felix's doodle → mazes. His lines (in sheet units) can be read five ways:
     walls    his lines are walls the maze must keep
     path     his line is the hidden right path
     outline  his line is the shape the maze fills
     obstacle his line is a river the maze goes around
     guide    the halls flow along his line
   Each sprout also gets a theme (the look). A "spring" sprout is a maze grown about a third of the way. */
(function (root) {
  "use strict";
  const E = root.FMZ.engine;
  const BOX = { x: 120, y: 120, w: 860, h: 620 };
  const MODES = {
    walls: { label: "Your lines are walls", icon: "🧱" },
    path: { label: "Your line is the way through", icon: "👣" },
    outline: { label: "Your line is the shape", icon: "✂️" },
    obstacle: { label: "Your line is a river", icon: "🌊" },
    guide: { label: "The halls follow your line", icon: "🧭" }
  };
  const THEMES = {
    bold: { label: "Bold", family: 8, chars: ["cat", "cheese"], look: () => ({ mode: "walls", wall: 9, wobble: 3 }) },
    hedge: { label: "Hedges", family: 2, chars: ["cat", "tree"], look: () => ({ mode: "walls", wall: 16, hedge: true, wobble: 0.8 }) },
    tunnel: { label: "Tunnels", family: 4, chars: ["ant", "cookie"], look: lv => ({ mode: "ribbon", wall: lv.size * 0.5, edge: 4, chamber: 1.2, wobble: 4,
      bg: uid => `<rect x="${BOX.x - 30}" y="${BOX.y - 30}" width="${BOX.w + 60}" height="${BOX.h + 60}" rx="30" fill="url(#earth${uid})" stroke="#222" stroke-width="5"/>` }) },
    swirl: { label: "Swirls", family: 3, chars: ["cat", "moon"], look: () => ({ mode: "walls", wall: 6.5, wobble: 1.2 }) },
    thin: { label: "Fine lines", family: 6, chars: ["mouse", "star"], look: () => ({ mode: "walls", wall: 4.5, wobble: 0.5 }) }
  };

  const segsOf = strokes => {
    const out = [];
    for (const s of strokes) for (let i = 1; i < s.length; i++) out.push([s[i - 1][0], s[i - 1][1], s[i][0], s[i][1]]);
    return out;
  };
  const near = (segs, x, y, d) => segs.some(([a, b, c, e]) => E.segDist(x, y, a, b, c, e) <= d);
  const longest = strokes => strokes.reduce((best, s) => (len(s) > len(best) ? s : best), strokes[0] || []);
  function len(s) { let L = 0; for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); return L; }
  function area(poly) { let a = 0; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]); return Math.abs(a / 2); }
  function centroid(strokes) {
    let x = 0, y = 0, n = 0;
    strokes.forEach(s => s.forEach(p => { x += p[0]; y += p[1]; n++; }));
    return n ? [x / n, y / n] : [BOX.x + BOX.w / 2, BOX.y + BOX.h / 2];
  }

  function spec(recipe, lv) {
    const d = recipe.doodle || {};
    const strokes = (d.strokes || []).filter(s => s.length > 1);
    const segs = segsOf(strokes);
    const theme = THEMES[d.theme] || THEMES.bold;
    const look = theme.look(lv);
    const size = lv.size;
    const sp = { box: BOX, size, start: { side: "W", at: 0.5 }, finish: { side: "E", at: 0.5 }, chars: theme.chars, charSize: 76, look };
    if (d.theme === "swirl") { const [cx, cy] = centroid(strokes); look.vortices = [{ x: cx, y: cy, r: 220, s: 1.2 }]; }

    if (d.mode === "walls") {
      sp.prepare = g => {
        const forbid = new Set();
        g.edges.forEach((e, i) => {
          if (e.b === null) return;
          const a = g.cells[e.a], b = g.cells[e.b];
          if (segs.some(([x1, y1, x2, y2]) => E.segCross([a.cx, a.cy], [b.cx, b.cy], [x1, y1], [x2, y2]))) forbid.add(i);
        });
        return { forbid };
      };
    } else if (d.mode === "path") {
      sp.prepare = g => {
        // his line, square by square
        const cellAt = (x, y) => g.at.get(Math.floor((x - g.x0) / g.s) + "," + Math.floor((y - g.y0) / g.s));
        const seq = [];
        const add = c => {
          if (c === undefined) return;
          const k = seq.indexOf(c);
          if (k >= 0) { seq.length = k + 1; return; } // a loop back: cut it off
          seq.push(c);
        };
        const s = longest(strokes);
        for (let i = 0; i < s.length; i++) {
          const p = s[i], q = s[i + 1] || p;
          const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (g.s / 3)));
          for (let k = 0; k < n; k++) add(cellAt(p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n));
        }
        // walk between cells that aren't neighbors (one step at a time)
        const cells = [];
        for (const c of seq) {
          if (!cells.length) { cells.push(c); continue; }
          let cur = cells[cells.length - 1];
          let guard = 0;
          while (cur !== c && guard++ < 200) {
            const A = g.cells[cur], B = g.cells[c];
            const di = Math.sign(B.i - A.i), dj = Math.sign(B.j - A.j);
            const nx = g.at.get((A.i + (di || 0)) + "," + (A.j + (di ? 0 : dj)));
            if (nx === undefined || cells.includes(nx)) break;
            cells.push(nx); cur = nx;
          }
        }
        const prelink = [];
        for (let k = 1; k < cells.length; k++) {
          const ei = g.adj[cells[k - 1]].find(ei => E.other(g.edges[ei], cells[k - 1]) === cells[k]);
          if (ei !== undefined) prelink.push(ei);
        }
        if (cells.length < 2) return {};
        return { prelink, start: { cell: cells[0], edge: -1 }, finish: { cell: cells[cells.length - 1], edge: -1 } };
      };
      sp.charSize = Math.min(76, size * 0.9);
    } else if (d.mode === "outline") {
      const s = longest(strokes);
      const closed = s.length > 2 && area(s) > 0.12 * BOX.w * BOX.h;
      const band = Math.max(70, size * 1.4);
      sp.mask = closed ? (x, y) => E.inPoly(x, y, s) || near(segs, x, y, size * 0.5) : (x, y) => near(segs, x, y, band);
      sp.look.outline = (sp.look.wall || 6) * 1.8;
    } else if (d.mode === "obstacle") {
      const rad = Math.max(40, size * 0.75);
      sp.mask = (x, y) => !near(segs, x, y, rad);
      sp.river = rad;
    } else if (d.mode === "guide") {
      sp.prepare = g => ({
        bias: (from, to) => {
          const a = g.cells[from], b = g.cells[to];
          let best = Infinity, dir = null;
          for (const [x1, y1, x2, y2] of segs) {
            const dd = E.segDist(a.cx, a.cy, x1, y1, x2, y2);
            if (dd < best) { best = dd; dir = [x2 - x1, y2 - y1]; }
          }
          if (!dir || best > g.s * 4) return 1;
          const mx = b.cx - a.cx, my = b.cy - a.cy;
          const c = Math.abs(mx * dir[0] + my * dir[1]) / ((Math.hypot(mx, my) * Math.hypot(dir[0], dir[1])) || 1);
          return 1 + 6 * c * c;
        }
      });
      sp.mix = 0;
    }
    return sp;
  }

  // His lines drawn on top: bold for walls, a wavy river for obstacles, faint for the rest.
  function overlay(recipe, spring) {
    const d = recipe.doodle || {};
    const strokes = (d.strokes || []).filter(s => s.length > 1);
    const S = root.FMZ.sheet;
    const dd = strokes.map(s => S.smooth(s)).join("");
    if (!dd) return "";
    const lv = S.LEVELS[recipe.level] || S.LEVELS[2];
    if (d.mode === "walls") return `<path d="${dd}" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (d.mode === "obstacle") {
      const w = 2 * Math.max(40, lv.size * 0.75) - 24;
      return `<path d="${dd}" fill="none" stroke="#222" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="${dd}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="${dd}" fill="none" stroke="#777" stroke-width="3" stroke-dasharray="14 10" stroke-linecap="round"/>`;
    }
    if (spring) return `<path d="${dd}" fill="none" stroke="#e0604a" stroke-opacity="0.55" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    return d.mode === "guide" ? `<path d="${dd}" fill="none" stroke="#bbb" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>` : "";
  }

  root.FMZ = root.FMZ || {};
  root.FMZ.doodle = { BOX, MODES, THEMES, spec, overlay };
})(typeof window !== "undefined" ? window : globalThis);
