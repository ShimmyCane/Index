// Growth engine: replays a paper story into geometry, step by step.
// Pure JavaScript, no DOM, so it runs in the browser and in plain Node (tests/).
//
// The story (paper_story.js) is the record: a seed plus the steps and their events.
// replay(story, n) applies steps 1..n in order from a clean sheet. The same story and
// the same n always give the same result. Nothing is stored as a finished shape.
//
// Coordinates: the sheet is a grid over u (across, 0..1) and v (along, 0..1).
// Real size: 8.5 by 11 inches, so x = (u - 0.5) * 8.5 and y = (v - 0.5) * 11.
// Heights (z) are in inches.

(function (root) {
  var W = 40;   // cells across
  var H = 52;   // cells along
  var SX = 8.5; // inches across
  var SY = 11;  // inches along

  // Small seeded random generator (mulberry32). Same seed, same numbers.
  function rngFrom(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function smooth(e0, e1, x) {
    var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  var CORNERS = { tl: [0, 1], tr: [1, 1], bl: [0, 0], br: [1, 0] };

  // Fresh sheet: vertices on a grid, two triangles per cell, all faces alive, all on piece 0.
  function cleanSheet(seed) {
    var nv = (W + 1) * (H + 1);
    var st = {
      x: new Float64Array(nv), y: new Float64Array(nv), z: new Float64Array(nv),
      r: new Float64Array(nv).fill(0.97), g: new Float64Array(nv).fill(0.97), b: new Float64Array(nv).fill(0.94),
      faces: [],       // each: [a, b, c, piece, alive]
      pieces: [{ id: 0, dx: 0, dy: 0 }],
      nextPiece: 1,
      tearNoise: new Float64Array(W + 1),
      rng: rngFrom(seed),
      log: []          // which ops ran, for tests and the page
    };
    for (var j = 0; j <= H; j++) {
      for (var i = 0; i <= W; i++) {
        var k = j * (W + 1) + i;
        st.x[k] = (i / W - 0.5) * SX;
        st.y[k] = (j / H - 0.5) * SY;
      }
    }
    for (var t = 0; t <= W; t++) st.tearNoise[t] = (st.rng() - 0.5) * 0.05;
    function id(i, j) { return j * (W + 1) + i; }
    for (var jj = 0; jj < H; jj++) {
      for (var ii = 0; ii < W; ii++) {
        var a = id(ii, jj), b = id(ii + 1, jj), c = id(ii + 1, jj + 1), d = id(ii, jj + 1);
        st.faces.push([a, b, c, 0, 1]);
        st.faces.push([a, c, d, 0, 1]);
      }
    }
    return st;
  }

  // Centre of a face in inches.
  function faceCentre(st, f) {
    var k = [f[0], f[1], f[2]];
    return [
      (st.x[k[0]] + st.x[k[1]] + st.x[k[2]]) / 3,
      (st.y[k[0]] + st.y[k[1]] + st.y[k[2]]) / 3
    ];
  }

  function nv(st) { return st.x.length; }

  var OPS = {
    // The sheet billows a little, as if floating.
    float: function (st, p) {
      for (var k = 0; k < nv(st); k++) {
        var u = st.x[k] / SX + 0.5, v = st.y[k] / SY + 0.5;
        st.z[k] += (p.amp || 0.12) * Math.sin(Math.PI * v) * (u - 0.5) * 2;
      }
    },

    // A foot or a stamp: a round dent, darker where it touched.
    stamp: function (st, p) {
      var cx = (p.u - 0.5) * SX, cy = (p.v - 0.5) * SY, r = p.r || 0.9, d = p.depth || 0.35;
      for (var k = 0; k < nv(st); k++) {
        var dx = st.x[k] - cx, dy = st.y[k] - cy, d2 = dx * dx + dy * dy;
        st.z[k] -= d * Math.exp(-d2 / (r * r));
        if (d2 < r * r * 0.8) { st.r[k] *= 0.9; st.g[k] *= 0.9; st.b[k] *= 0.9; }
      }
    },

    // A corner pushed up and bent, from the corner point toward the centre.
    bend: function (st, p) {
      var c = CORNERS[p.corner || 'tr'];
      var cx = (c[0] - 0.5) * SX, cy = (c[1] - 0.5) * SY;
      for (var k = 0; k < nv(st); k++) {
        var dx = st.x[k] - cx, dy = st.y[k] - cy, d = Math.sqrt(dx * dx + dy * dy);
        st.z[k] += (p.amount || 0.4) * (1 - smooth(0, 4, d));
      }
    },

    // A truck: a band pressed flat across the sheet.
    track: function (st, p) {
      var cy = (p.v - 0.5) * SY, w = p.halfWidth || 0.6, d = p.depth || 0.22;
      for (var k = 0; k < nv(st); k++) {
        var dy = st.y[k] - cy;
        st.z[k] -= d * Math.exp(-(dy * dy) / (w * w));
      }
    },

    // A fold: the part above the line lifts and tilts; a soft ridge marks it.
    crease: function (st, p) {
      var cy = (p.v - 0.5) * SY, a = p.angle || 0.3;
      for (var k = 0; k < nv(st); k++) {
        var dy = st.y[k] - cy;
        if (dy > 0) st.z[k] += a * dy * smooth(0, 0.5, dy);
        st.z[k] -= 0.05 * Math.exp(-(dy * dy) / 0.0025);
      }
    },

    // Wind: a dome over the sheet, and the old folds relax a little.
    wind: function (st, p) {
      var curl = p.curl || 0.35, relax = p.relax || 0.15;
      for (var k = 0; k < nv(st); k++) {
        var u = st.x[k] / SX + 0.5, v = st.y[k] / SY + 0.5;
        st.z[k] = st.z[k] * (1 - relax) + curl * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
      }
    },

    // A tear from a corner: faces past a ragged line are removed.
    tear: function (st, p) {
      var c = CORNERS[p.corner || 'tr'], size = p.size || 0.2;
      var kill = 0;
      st.faces.forEach(function (f) {
        if (!f[4] || f[3] !== (p.piece || 0)) return;
        var ctr = faceCentre(st, f);
        var u = ctr[0] / SX + 0.5, v = ctr[1] / SY + 0.5;
        var du = Math.abs(u - c[0]), dv = Math.abs(v - c[1]);
        var jag = st.tearNoise[Math.round(u * W)];
        if (du + dv < size + jag) { f[4] = 0; kill++; }
      });
      st.log.push('tear removed ' + kill + ' faces');
    },

    // Things caught on the sheet: small raised bumps with a colour.
    junk: function (st, p) {
      (p.items || []).forEach(function (it) {
        var cx = (it.u - 0.5) * SX, cy = (it.v - 0.5) * SY, r = it.r || 0.3, h = it.h || 0.1;
        var col = it.color || [0.6, 0.5, 0.3];
        for (var k = 0; k < nv(st); k++) {
          var dx = st.x[k] - cx, dy = st.y[k] - cy, d2 = dx * dx + dy * dy;
          var g = Math.exp(-d2 / (r * r));
          st.z[k] += h * g;
          if (g > 0.5) { st.r[k] = col[0]; st.g[k] = col[1]; st.b[k] = col[2]; }
        }
      });
    },

    // Wet and fluffy: greyer surface, and the edges swell with a little noise.
    wet: function (st, p) {
      var a = p.amount || 0.6;
      for (var k = 0; k < nv(st); k++) {
        var u = st.x[k] / SX + 0.5, v = st.y[k] / SY + 0.5;
        st.r[k] = st.r[k] * (1 - 0.25 * a) + 0.6 * 0.25 * a;
        st.g[k] = st.g[k] * (1 - 0.25 * a) + 0.6 * 0.25 * a;
        st.b[k] = st.b[k] * (1 - 0.25 * a) + 0.6 * 0.25 * a;
        var edge = Math.min(u, 1 - u, v, 1 - v);
        if (edge < 0.04) st.z[k] += (st.rng() - 0.5) * 0.12 * a * (1 - edge / 0.04);
      }
    },

    // A cut along a line. Faces on the cut are removed (a small gap). The side on the
    // positive side becomes a new piece, pushed apart from the rest.
    cut: function (st, p) {
      var target = p.piece || 0;
      var x0 = (p.line.u0 - 0.5) * SX, y0 = (p.line.v0 - 0.5) * SY;
      var x1 = (p.line.u1 - 0.5) * SX, y1 = (p.line.v1 - 0.5) * SY;
      var dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / len, ny = dx / len;           // unit normal, pointing to the new piece
      var gap = p.gap || 0.08, push = p.push || 0.25;
      var newId = st.nextPiece++;
      var removed = 0, moved = 0;
      st.faces.forEach(function (f) {
        if (!f[4] || f[3] !== target) return;
        var ctr = faceCentre(st, f);
        var s = (ctr[0] - x0) * nx + (ctr[1] - y0) * ny;
        if (Math.abs(s) < gap) { f[4] = 0; removed++; return; }
        if (s > 0) { f[3] = newId; moved++; }
      });
      var tp = st.pieces.filter(function (q) { return q.id === target; })[0];
      var np = { id: newId, dx: tp.dx + nx * push, dy: tp.dy + ny * push };
      tp.dx -= nx * push; tp.dy -= ny * push;
      st.pieces.push(np);
      st.log.push('cut piece ' + target + ' into ' + target + ' and ' + newId + ' (gap removed ' + removed + ')');
    },

    // Insect holes: faces inside each circle are removed.
    holes: function (st, p) {
      var circles = (p.items || []).map(function (h) {
        return { cx: (h.u - 0.5) * SX, cy: (h.v - 0.5) * SY, r: h.r || 0.04 };
      });
      var kill = 0;
      st.faces.forEach(function (f) {
        if (!f[4]) return;
        var ctr = faceCentre(st, f);
        for (var i = 0; i < circles.length; i++) {
          var c = circles[i];
          var dx = ctr[0] - c.cx, dy = ctr[1] - c.cy;
          if (dx * dx + dy * dy < c.r * c.r) { f[4] = 0; kill++; return; }
        }
      });
      st.log.push('holes removed ' + kill + ' faces');
    }
  };

  // Replay steps 1..n of a story from a clean sheet.
  function replay(story, n) {
    var st = cleanSheet(story.seed || 1);
    var steps = story.steps.slice(0, n);
    steps.forEach(function (step) {
      step.events.forEach(function (ev) {
        var fn = OPS[ev.op];
        if (!fn) throw new Error('Unknown op: ' + ev.op);
        fn(st, ev);
      });
    });
    return st;
  }

  // Turn the state into one geometry per piece (non-indexed triangles, positions and colours).
  function toPieces(st) {
    var out = st.pieces.map(function (pc) {
      var list = st.faces.filter(function (f) { return f[4] && f[3] === pc.id; });
      var pos = new Float32Array(list.length * 9);
      var col = new Float32Array(list.length * 9);
      list.forEach(function (f, fi) {
        for (var q = 0; q < 3; q++) {
          var k = f[q], o = fi * 9 + q * 3;
          pos[o] = st.x[k] + pc.dx;
          pos[o + 1] = st.y[k] + pc.dy;
          pos[o + 2] = st.z[k];
          col[o] = st.r[k]; col[o + 1] = st.g[k]; col[o + 2] = st.b[k];
        }
      });
      return { id: pc.id, positions: pos, colors: col, faces: list.length };
    });
    return out.filter(function (p) { return p.faces > 0; });
  }

  function stats(st) {
    var alive = st.faces.filter(function (f) { return f[4]; }).length;
    var pieces = st.pieces.filter(function (pc) {
      return st.faces.some(function (f) { return f[4] && f[3] === pc.id; });
    }).length;
    return { faces: alive, pieces: pieces, log: st.log.slice() };
  }

  var api = { replay: replay, toPieces: toPieces, stats: stats, W: W, H: H, SX: SX, SY: SY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PaperEngine = api;
})(typeof window !== 'undefined' ? window : this);
