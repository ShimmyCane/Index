// Paper Again: a particle-spring model of one sheet of paper, replayed from a story.
// Pure JavaScript, no DOM, so it runs in the browser and in plain Node (tests/).
//
// The story (paper_story.js) is the record: a seed and ten increments of operations.
// replay(story, n) starts from a flat sheet and runs increments 1..n. Same story, same
// n, same numbers. Nothing is stored as a finished shape.
//
// Model (units: inches, time in steps):
// - Particles on a grid. Springs: structural, shear and bend (two cells apart).
// - Bend springs are plastic: when bent past a yield, their rest length moves to the
//   bent length, so creases stay after the force is gone.
// - Structural and shear springs break only where a tear or cut removes them.
// - Self-contact: particles that are not close on the sheet push each other apart.
// - Colliders: a floor at z = 0, and moving spheres (stamps, rollers, junk).
// - Wetness spreads over the springs and softens them. Mould grows where it stays wet.
// - Dirt builds up where many particles are close together (a crease or fold).
// - Burns darken and lift the edge they touch.

(function (root) {
  var NX = 24, NY = 32;          // cells across and along
  var SX = 8.5, SY = 11;         // sheet size, inches
  var DX = SX / NX, DY = SY / NY;
  var VX = NX + 1, VY = NY + 1;  // vertices per row and column
  var NV = VX * VY;
  var DMIN = 0.3;                // closest two non-neighbour particles may be
  var HASH = 0.25;               // hash cell size, at least DMIN
  var G = 0.03;                  // gravity per step squared (scaled; see tests)
  var DAMP = 0.985;              // velocity kept each step
  var ITER = 4;                  // constraint passes per step
  var YIELD = 0.03;              // bend strain before a crease sets
  var CONTACT_FRICTION = 0.9;   // share of sliding velocity removed at a contact
  var PLASTIC = 0.2;             // how fast the rest length follows a set crease

  function rngFrom(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function vid(i, j) { return j * VX + i; }

  // A fresh flat sheet, floating a little above the floor.
  function cleanSheet(seed) {
    var rng = rngFrom(seed);
    var s = {
      rng: rng, n: NV,
      x: new Float64Array(NV), y: new Float64Array(NV), z: new Float64Array(NV),
      px: new Float64Array(NV), py: new Float64Array(NV), pz: new Float64Array(NV),
      alive: new Uint8Array(NV).fill(1),
      gi: new Int32Array(NV), gj: new Int32Array(NV),
      wet: new Float32Array(NV), dirt: new Float32Array(NV), burn: new Float32Array(NV), mould: new Float32Array(NV),
      sa: [], sb: [], L0: [], k: [], brk: [], bend: [], alive_s: [],
      faces: [], colliders: [], gravity: true, floorOn: true,
      edgeIndex: new Map(), log: [], steps: 0, increment: 0
    };
    for (var j = 0; j < VY; j++) {
      for (var i = 0; i < VX; i++) {
        var v = vid(i, j);
        s.gi[v] = i; s.gj[v] = j;
        s.x[v] = (i / NX - 0.5) * SX;
        s.y[v] = (j / NY - 0.5) * SY;
        s.z[v] = 0.5;
        s.px[v] = s.x[v]; s.py[v] = s.y[v]; s.pz[v] = s.z[v];
      }
    }
    function addSpring(a, b, k, bendFlag) {
      var key = Math.min(a, b) * NV + Math.max(a, b);
      if (s.edgeIndex.has(key)) return;
      var dx = s.x[a] - s.x[b], dy = s.y[a] - s.y[b];
      s.edgeIndex.set(key, s.sa.length);
      s.sa.push(a); s.sb.push(b);
      s.L0.push(Math.sqrt(dx * dx + dy * dy));
      s.k.push(k);
      s.brk.push(Infinity);
      s.bend.push(bendFlag ? 1 : 0);
      s.alive_s.push(1);
    }
    // Structural springs first, every row and column, including the last ones.
    for (j = 0; j < VY; j++) for (i = 0; i < NX; i++) addSpring(vid(i, j), vid(i + 1, j), 1.0, false);
    for (i = 0; i < VX; i++) for (j = 0; j < NY; j++) addSpring(vid(i, j), vid(i, j + 1), 1.0, false);
    for (j = 0; j < NY; j++) {
      for (i = 0; i < NX; i++) {
        var a = vid(i, j), b = vid(i + 1, j), c = vid(i + 1, j + 1), d = vid(i, j + 1);
        addSpring(a, c, 0.9, false);
        s.faces.push([a, b, c]);
        s.faces.push([a, c, d]);
      }
    }
    for (j = 0; j < VY; j++) for (i = 0; i < VX; i++) {
      if (i + 2 < VX) addSpring(vid(i, j), vid(i + 2, j), 0.6, true);
      if (j + 2 < VY) addSpring(vid(i, j), vid(i, j + 2), 0.6, true);
    }
    return s;
  }

  function edgeKey(a, b) { return Math.min(a, b) * NV + Math.max(a, b); }

  function edgeAlive(s, a, b) {
    var idx = s.edgeIndex.get(edgeKey(a, b));
    return idx !== undefined && s.alive_s[idx] === 1;
  }

  // One step: move, satisfy springs, collide.
  function step(s, opt) {
    var g = (opt && opt.gravity === false) ? 0 : (s.gravity ? G : 0);
    var gust = (opt && opt.gust) || 0;
    var n = NV;
    for (var v = 0; v < n; v++) {
      if (!s.alive[v]) continue;
      var vx = (s.x[v] - s.px[v]) * DAMP, vy = (s.y[v] - s.py[v]) * DAMP, vz = (s.z[v] - s.pz[v]) * DAMP;
      s.px[v] = s.x[v]; s.py[v] = s.y[v]; s.pz[v] = s.z[v];
      if (gust) {
        vx += gust * (s.rng() - 0.5);
        vy += gust * (s.rng() - 0.5);
        vz += gust * (s.rng() - 0.5) * 0.5;
      }
      s.x[v] += vx; s.y[v] += vy; s.z[v] += vz - g;
    }
    for (var it = 0; it < ITER; it++) {
      springConstraints(s);
      collide(s);
      selfContact(s);
    }
    s.steps++;
  }

  function springConstraints(s) {
    var m = s.sa.length;
    for (var q = 0; q < m; q++) {
      if (!s.alive_s[q]) continue;
      var a = s.sa[q], b = s.sb[q];
      if (!s.alive[a] || !s.alive[b]) continue;
      var dx = s.x[b] - s.x[a], dy = s.y[b] - s.y[a], dz = s.z[b] - s.z[a];
      var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 1e-9) continue;
      var L0 = s.L0[q];
      // Wet paper is softer.
      var wetSoft = 1 - 0.5 * Math.min(1, 0.5 * (s.wet[a] + s.wet[b]));
      if (s.bend[q]) {
        var strain = (d - L0) / L0;
        if (Math.abs(strain) > YIELD) s.L0[q] = L0 + PLASTIC * (d - L0);
        L0 = s.L0[q];
      } else if (d > L0 * (1 + s.brk[q])) {
        s.alive_s[q] = 0;
        continue;
      }
      var corr = (d - L0) / d * 0.5 * s.k[q] * wetSoft;
      var cx = dx * corr, cy = dy * corr, cz = dz * corr;
      s.x[a] += cx; s.y[a] += cy; s.z[a] += cz;
      s.x[b] -= cx; s.y[b] -= cy; s.z[b] -= cz;
    }
  }

  function collide(s) {
    // The hold: while the paper is a ball, a soft shell keeps it together. It is a stand-in
    // for the jamming real crumpled paper has, which this model does not reproduce.
    var holdC = null;
    if (s.hold) {
      var sx = 0, sy = 0, sz = 0, cnt = 0;
      for (var q = 0; q < NV; q++) if (s.alive[q]) { sx += s.x[q]; sy += s.y[q]; sz += s.z[q]; cnt++; }
      holdC = { x: sx / cnt, y: sy / cnt, z: sz / cnt, r: s.hold.r, inside: true };
    }
    for (var v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      if (holdC) {
        var hx = s.x[v] - holdC.x, hy = s.y[v] - holdC.y, hz = s.z[v] - holdC.z;
        var hd = Math.sqrt(hx * hx + hy * hy + hz * hz);
        if (hd > holdC.r && hd > 1e-9) {
          var hf = holdC.r / hd;
          s.x[v] = holdC.x + hx * hf; s.y[v] = holdC.y + hy * hf; s.z[v] = holdC.z + hz * hf;
        }
      }
      for (var c = 0; c < s.colliders.length; c++) {
        var k = s.colliders[c];
        var dx = s.x[v] - k.x, dy = s.y[v] - k.y, dz = s.z[v] - k.z;
        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (k.inside) {
          // container: keep the particle inside a sphere of radius k.r
          if (d > k.r && d > 1e-9) {
            var f = k.r / d;
            s.x[v] = k.x + dx * f; s.y[v] = k.y + dy * f; s.z[v] = k.z + dz * f;
          }
        } else if (d < k.r + 0.02 && d > 1e-9) {
          var p = (k.r + 0.02) / d;
          s.x[v] = k.x + dx * p; s.y[v] = k.y + dy * p; s.z[v] = k.z + dz * p;
        }
      }
      if (s.floorOn && s.z[v] < 0.02) {
        // Floor with friction: horizontal motion is damped while touching.
        s.z[v] = 0.02;
        s.px[v] = s.x[v] - (s.x[v] - s.px[v]) * 0.6;
        s.py[v] = s.y[v] - (s.y[v] - s.py[v]) * 0.6;
      }
    }
  }

  function hashKey(cx, cy, cz) { return ((cx + 5000) * 10007 + (cy + 5000)) * 10007 + (cz + 5000); }

  // Non-neighbour particles on the sheet must not pass through each other.
  function selfContact(s) {
    var map = new Map();
    var cellOf = new Int32Array(NV * 3);
    for (var v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var cx = Math.floor(s.x[v] / HASH), cy = Math.floor(s.y[v] / HASH), cz = Math.floor(s.z[v] / HASH);
      cellOf[v * 3] = cx; cellOf[v * 3 + 1] = cy; cellOf[v * 3 + 2] = cz;
      var key = hashKey(cx, cy, cz);
      var list = map.get(key);
      if (!list) { list = []; map.set(key, list); }
      list.push(v);
    }
    for (v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var vx0 = cellOf[v * 3], vy0 = cellOf[v * 3 + 1], vz0 = cellOf[v * 3 + 2];
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) for (var oz = -1; oz <= 1; oz++) {
        var list2 = map.get(hashKey(vx0 + ox, vy0 + oy, vz0 + oz));
        if (!list2) continue;
        for (var t = 0; t < list2.length; t++) {
          var w = list2[t];
          if (w <= v) continue;
          if (Math.abs(s.gi[v] - s.gi[w]) <= 2 && Math.abs(s.gj[v] - s.gj[w]) <= 2) continue;
          var dx = s.x[w] - s.x[v], dy = s.y[w] - s.y[v], dz = s.z[w] - s.z[v];
          var d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= DMIN * DMIN) continue;
          var d = Math.sqrt(d2);
          var push = d > 1e-9 ? (DMIN - d) * 0.5 / d : 0;
          if (d <= 1e-9) { dx = 0.001; dy = 0; dz = 0.001; d = 0.0014; push = (DMIN * 0.5) / d; }
          s.x[v] -= dx * push; s.y[v] -= dy * push; s.z[v] -= dz * push;
          s.x[w] += dx * push; s.y[w] += dy * push; s.z[w] += dz * push;
          // Friction at contact: layers that touch lose most of their sliding velocity.
          var fr = CONTACT_FRICTION;
          s.px[v] = s.x[v] - (s.x[v] - s.px[v]) * (1 - fr); s.py[v] = s.y[v] - (s.y[v] - s.py[v]) * (1 - fr); s.pz[v] = s.z[v] - (s.z[v] - s.pz[v]) * (1 - fr);
          s.px[w] = s.x[w] - (s.x[w] - s.px[w]) * (1 - fr); s.py[w] = s.y[w] - (s.y[w] - s.py[w]) * (1 - fr); s.pz[w] = s.z[w] - (s.z[w] - s.pz[w]) * (1 - fr);
        }
      }
    }
  }

  // Run n steps.
  function run(s, n, opt) { for (var i = 0; i < n; i++) step(s, opt); }

  // Let the sheet fall and rest on the floor.
  function settle(s, n) {
    var was = s.gravity;
    s.gravity = true;
    run(s, n || 120);
    s.gravity = was;
  }

  // Random rotation of the whole sheet about its centre, then a drop and a settle.
  // This is the flip between increments.
  function tumble(s, opt) {
    var angle = (opt && opt.angle) || (0.6 + s.rng() * 1.2);
    var ax = s.rng() - 0.5, ay = s.rng() - 0.5, az = s.rng() - 0.5;
    var len = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
    ax /= len; ay /= len; az /= len;
    var cx = 0, cy = 0, cz = 0, c = 0;
    for (var v = 0; v < NV; v++) if (s.alive[v]) { cx += s.x[v]; cy += s.y[v]; cz += s.z[v]; c++; }
    cx /= c; cy /= c; cz /= c;
    var cs = Math.cos(angle), sn = Math.sin(angle), oc = 1 - cs;
    var R = [
      [cs + ax * ax * oc, ax * ay * oc - az * sn, ax * az * oc + ay * sn],
      [ay * ax * oc + az * sn, cs + ay * ay * oc, ay * az * oc - ax * sn],
      [az * ax * oc - ay * sn, az * ay * oc + ax * sn, cs + az * az * oc]
    ];
    var minZ = Infinity;
    for (v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var dx = s.x[v] - cx, dy = s.y[v] - cy, dz = s.z[v] - cz;
      s.x[v] = cx + R[0][0] * dx + R[0][1] * dy + R[0][2] * dz;
      s.y[v] = cy + R[1][0] * dx + R[1][1] * dy + R[1][2] * dz;
      s.z[v] = cz + R[2][0] * dx + R[2][1] * dy + R[2][2] * dz;
      if (s.z[v] < minZ) minZ = s.z[v];
    }
    var lift = (opt && opt.drop) || 2.5;
    for (v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      s.z[v] += lift - minZ;
      s.px[v] = s.x[v]; s.py[v] = s.y[v]; s.pz[v] = s.z[v];
    }
    settle(s, 220);
    s.log.push('tumble ' + (angle * 180 / Math.PI).toFixed(0) + ' deg');
  }

  // Dirt: particles with many close neighbours (folds, creases) collect dirt.
  function depositDirt(s) {
    var map = new Map(), cellOf = new Int32Array(NV * 3), R = 0.5, CELL = 0.5;
    for (var v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var cx = Math.floor(s.x[v] / CELL), cy = Math.floor(s.y[v] / CELL), cz = Math.floor(s.z[v] / CELL);
      cellOf[v * 3] = cx; cellOf[v * 3 + 1] = cy; cellOf[v * 3 + 2] = cz;
      var key = hashKey(cx, cy, cz);
      var list = map.get(key);
      if (!list) { list = []; map.set(key, list); }
      list.push(v);
    }
    for (v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var count = 0;
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) for (var oz = -1; oz <= 1; oz++) {
        var list2 = map.get(hashKey(cellOf[v * 3] + ox, cellOf[v * 3 + 1] + oy, cellOf[v * 3 + 2] + oz));
        if (!list2) continue;
        for (var t = 0; t < list2.length; t++) {
          var w = list2[t];
          var dx = s.x[w] - s.x[v], dy = s.y[w] - s.y[v], dz = s.z[w] - s.z[v];
          if (dx * dx + dy * dy + dz * dz < R * R) count++;
        }
      }
      // A flat sheet has about 9 particles inside R (itself included); more means a fold.
      var occl = Math.max(0, Math.min(1, (count - 9) / 12));
      s.dirt[v] = Math.min(1, s.dirt[v] + 0.6 * occl);
    }
  }

  // Connected pieces: flood fill over alive springs.
  function pieceIds(s) {
    var id = new Int32Array(NV).fill(-1);
    var adj = [];
    for (var v = 0; v < NV; v++) adj.push([]);
    for (var q = 0; q < s.sa.length; q++) {
      if (!s.alive_s[q]) continue;
      var a = s.sa[q], b = s.sb[q];
      if (!s.alive[a] || !s.alive[b]) continue;
      adj[a].push(b); adj[b].push(a);
    }
    var next = 0;
    for (v = 0; v < NV; v++) {
      if (!s.alive[v] || id[v] >= 0) continue;
      var stack = [v];
      id[v] = next;
      while (stack.length) {
        var u = stack.pop();
        var nb = adj[u];
        for (var t = 0; t < nb.length; t++) if (id[nb[t]] < 0) { id[nb[t]] = next; stack.push(nb[t]); }
      }
      next++;
    }
    return { id: id, count: next };
  }

  // Colour for one particle: paper, then dirt, stain, mould and burn on top.
  function colourOf(s, v) {
    var r = 0.96, g = 0.95, b = 0.91;
    var d = s.dirt[v] * 0.7;
    r = r * (1 - d) + 0.42 * d; g = g * (1 - d) + 0.38 * d; b = b * (1 - d) + 0.31 * d;
    var tide = Math.exp(-Math.pow((s.wet[v] - 0.45) / 0.07, 2)) * 0.55;
    var st = Math.min(0.5, tide + 0.12 * s.wet[v]);
    r = r * (1 - st) + 0.8 * st; g = g * (1 - st) + 0.7 * st; b = b * (1 - st) + 0.55 * st;
    var m = Math.min(1, s.mould[v]) * 0.85;
    r = r * (1 - m) + 0.5 * m; g = g * (1 - m) + 0.6 * m; b = b * (1 - m) + 0.42 * m;
    var bn = Math.min(1, s.burn[v]);
    r = r * (1 - bn) + 0.14 * bn; g = g * (1 - bn) + 0.08 * bn; b = b * (1 - bn) + 0.04 * bn;
    return [r, g, b];
  }

  // Geometry per piece: indexed triangles with smooth normals.
  function toPieces(s) {
    var pid = pieceIds(s);
    var buckets = [];
    for (var p = 0; p < pid.count; p++) buckets.push({ faces: [], map: new Map(), verts: [], cols: [], index: [] });
    s.faces.forEach(function (f) {
      if (!f.every(function (v) { return s.alive[v]; })) return;
      if (!(edgeAlive(s, f[0], f[1]) && edgeAlive(s, f[1], f[2]) && edgeAlive(s, f[2], f[0]))) return;
      var bk = buckets[pid.id[f[0]]];
      if (!bk) return;
      f.forEach(function (v) {
        var li = bk.map.get(v);
        if (li === undefined) {
          li = bk.verts.length / 3;
          bk.map.set(v, li);
          bk.verts.push(s.x[v], s.y[v], s.z[v]);
          var c = colourOf(s, v);
          bk.cols.push(c[0], c[1], c[2]);
        }
        bk.index.push(li);
      });
    });
    var out = [];
    buckets.forEach(function (bk, id) {
      if (!bk.index.length) return;
      out.push({ id: id, positions: new Float32Array(bk.verts), colors: new Float32Array(bk.cols), indices: new Uint32Array(bk.index), faces: bk.index.length / 3 });
    });
    return out;
  }

  function stats(s) {
    var faces = 0;
    s.faces.forEach(function (f) {
      if (f.every(function (v) { return s.alive[v]; }) && edgeAlive(s, f[0], f[1]) && edgeAlive(s, f[1], f[2]) && edgeAlive(s, f[2], f[0])) faces++;
    });
    // A piece is a connected group of paper with at least one triangle (loose particles do not count).
    var pieces = toPieces(s).length;
    var maxZ = -Infinity;
    for (v = 0; v < NV; v++) if (s.alive[v] && s.z[v] > maxZ) maxZ = s.z[v];
    return { faces: faces, pieces: pieces, maxHeight: maxZ, steps: s.steps, log: s.log.slice() };
  }

  // Fraction of paper width that is taken by spot radius, etc. Helpers for ops.
  // Nearest live particle to a point on the flat sheet (u, v, 0 to 1).
  function nearest(s, u, v) {
    var best = -1, bd = Infinity;
    for (var k = 0; k < NV; k++) {
      if (!s.alive[k]) continue;
      var dx = (s.gi[k] / NX - u) * SX, dy = (s.gj[k] / NY - v) * SY;
      var d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  }

  var OPS = {
    // The flip between increments: turn the whole sheet, drop it, let it settle.
    tumble: function (s, p) { tumble(s, { angle: p.angle, drop: p.drop }); },

    // Hang in the air for a while, drifting, then fall.
    float: function (s, p) {
      s.gravity = false;
      run(s, p.steps || 60, { gust: p.gust || 0.02 });
      s.gravity = true;
      settle(s, 200);
      s.log.push('float');
    },

    // A boot: a round stamp pressed into the sheet, then lifted away.
    stamp: function (s, p) {
      var k = { x: (p.u - 0.5) * SX, y: (p.v - 0.5) * SY, z: 6, r: p.r || 0.8 };
      s.colliders.push(k);
      var target = (p.r || 0.8) - (p.depth || 0.35);
      var n = p.steps || 80;
      for (var i = 0; i < n; i++) {
        k.z = 6 + (target - 6) * (i + 1) / n;
        step(s);
      }
      run(s, 40);
      s.colliders.splice(s.colliders.indexOf(k), 1);
      markDirt(s, k.x, k.y, k.r * 1.6, 0.5);
      settle(s, 160);
      s.log.push('stamp');
    },

    // A roller (a truck wheel) pressed along the sheet.
    roller: function (s, p) {
      var k = { x: 0, y: -SY / 2 - 1, z: p.r || 0.8, r: p.r || 0.8 };
      s.colliders.push(k);
      var n = p.steps || 120;
      for (var i = 0; i < n; i++) {
        k.y = -SY / 2 - 1 + (SY + 2) * (i + 1) / n;
        k.z = (p.r || 0.8) - (p.depth || 0.3);
        step(s);
      }
      s.colliders.splice(s.colliders.indexOf(k), 1);
      settle(s, 160);
      s.log.push('roller');
    },

    // A big crease: the part of the sheet past a line is folded over.
    fold: function (s, p) {
      var yc = (p.v - 0.5) * SY, ang = p.angle || 2.4;
      var cs = Math.cos(ang), sn = Math.sin(ang);
      for (var v = 0; v < NV; v++) {
        if (!s.alive[v] || s.y[v] <= yc) continue;
        var dy = s.y[v] - yc, dz = s.z[v];
        // rotate the flap about the crease line (x axis at y = yc, z = 0)
        var ny = dy * cs - dz * sn, nz = dy * sn + dz * cs;
        s.y[v] = yc + ny; s.z[v] = Math.max(0.02, nz + 0.4);
        s.px[v] = s.x[v]; s.py[v] = s.y[v]; s.pz[v] = s.z[v];
      }
      settle(s, 200);
      s.log.push('fold');
    },

    // Wind: gusts and a loose gathering into a ball (the container shrinks).
    wind: function (s, p) {
      var cx = 0, cy = 0, cz = 1.2;
      var k = { x: cx, y: cy, z: cz, r: 8, inside: true };
      s.colliders.push(k);
      var n = p.steps || 500;
      for (var i = 0; i < n; i++) {
        var t = (i + 1) / n;
        k.r = 8 - (8 - (p.radius || 1.9)) * t;
        step(s, { gravity: true, gust: (p.gust || 0.25) * (1 - t) });
      }
      s.colliders.splice(s.colliders.indexOf(k), 1);
      s.hold = { r: p.radius || 1.9 };
      run(s, 600);
      settle(s, 200);
      s.log.push('wind (held as a ball)');
    },

    // Tear: break springs along a random walk from the edge of the sheet.
    tear: function (s, p) {
      var edge = p.edge || 'top';
      var start = -1;
      for (var j = 0; j < 4 && start < 0; j++) {
        var ci = Math.floor(s.rng() * NX);
        var v = edge === 'top' ? vid(ci, NY) : edge === 'bottom' ? vid(ci, 0) : edge === 'left' ? vid(0, ci % NY) : vid(NX, ci % NY);
        if (s.alive[v]) start = v;
      }
      if (start < 0) return;
      var cur = start, steps = p.length || 9, cut = 0;
      for (var q = 0; q < steps; q++) {
        var i0 = s.gi[cur], j0 = s.gj[cur];
        var inward = edge === 'top' ? [0, -1] : edge === 'bottom' ? [0, 1] : edge === 'left' ? [1, 0] : [-1, 0];
        var sideways = [inward[1], inward[0]];
        var sway = Math.floor(s.rng() * 3) - 1;
        var ni = i0 + inward[0] + sideways[0] * sway, nj = j0 + inward[1] + sideways[1] * sway;
        if (ni < 0 || nj < 0 || ni > NX || nj > NY) break;
        var nxt = vid(ni, nj);
        var idx = s.edgeIndex.get(edgeKey(cur, nxt));
        if (idx !== undefined && s.alive_s[idx]) { s.alive_s[idx] = 0; cut++; }
        // Break the neighbours too, so the tear is one fibre wide, not a single spring.
        var side = vid(ni + sideways[0], nj + sideways[1]);
        if (ni + sideways[0] >= 0 && ni + sideways[0] <= NX && nj + sideways[1] >= 0 && nj + sideways[1] <= NY) {
          var ix2 = s.edgeIndex.get(edgeKey(nxt, side));
          if (ix2 !== undefined) s.alive_s[ix2] = 0;
        }
        cur = nxt;
      }
      // Fibre fray: the torn edge is a little rough.
      markFray(s, 0.04);
      run(s, 60);
      settle(s, 200);
      s.log.push('tear cut ' + cut + ' springs');
    },

    // Cut: a straight line of springs is removed, and the two sides are pushed apart.
    cut: function (s, p) {
      s.hold = null;   // a cut opens the ball
      // The line is drawn on the flat sheet (material coordinates), so it cuts the paper
      // wherever it lies in the ball, not wherever it crosses the world.
      var u0 = p.line.u0, v0 = p.line.v0, du = p.line.u1 - u0, dv = p.line.v1 - v0;
      var ln = Math.sqrt(du * du + dv * dv), nu = -dv / ln, nv = du / ln;
      var removed = 0;
      for (var q = 0; q < s.sa.length; q++) {
        if (!s.alive_s[q]) continue;
        var a = s.sa[q], b = s.sb[q];
        // A spring crosses the line when its two ends lie on opposite sides of it.
        var ua = s.gi[a] / NX, va = s.gj[a] / NY, ub = s.gi[b] / NX, vb = s.gj[b] / NY;
        var sa2 = (ua - u0) * nu + (va - v0) * nv, sb2 = (ub - u0) * nu + (vb - v0) * nv;
        if (sa2 * sb2 < 0) {
          var t = sa2 / (sa2 - sb2);
          var cu = ua + (ub - ua) * t, cv = va + (vb - va) * t;
          var along2 = ((cu - u0) * du + (cv - v0) * dv) / (ln * ln);
          if (along2 >= 0 && along2 <= 1) { s.alive_s[q] = 0; removed++; }
        }
      }
      // Push the two sides apart, away from each other, in the world.
      var side = new Int8Array(NV), cP = [0, 0, 0, 0], cN = [0, 0, 0, 0];
      for (var v = 0; v < NV; v++) {
        if (!s.alive[v]) continue;
        var sv = ((s.gi[v] / NX - u0) * nu + (s.gj[v] / NY - v0) * nv) >= 0 ? 1 : -1;
        side[v] = sv;
        var acc = sv > 0 ? cP : cN;
        acc[0] += s.x[v]; acc[1] += s.y[v]; acc[2] += s.z[v]; acc[3]++;
      }
      if (cP[3] && cN[3]) {
        var dxw = cP[0] / cP[3] - cN[0] / cN[3], dyw = cP[1] / cP[3] - cN[1] / cN[3], dzw = cP[2] / cP[3] - cN[2] / cN[3];
        var dl = Math.sqrt(dxw * dxw + dyw * dyw + dzw * dzw) || 1;
        dxw /= dl; dyw /= dl; dzw /= dl;
        var push = p.push || 0.35;
        for (v = 0; v < NV; v++) {
          if (!s.alive[v]) continue;
          var sg = side[v] > 0 ? 1 : -1;
          s.x[v] += dxw * push * sg; s.y[v] += dyw * push * sg; s.z[v] += dzw * push * sg;
          s.px[v] = s.x[v]; s.py[v] = s.y[v]; s.pz[v] = s.z[v];
        }
      }
      settle(s, 200);
      s.log.push('cut removed ' + removed + ' springs');
    },

    // Wetness: water soaks in from a point and spreads over the paper.
    wet: function (s, p) {
      var k = nearest(s, p.u, p.v);
      var r = p.r || 1.6;
      for (var v = 0; v < NV; v++) {
        if (!s.alive[v]) continue;
        var dx = (s.gi[v] - s.gi[k]) * DX, dy = (s.gj[v] - s.gj[k]) * DY;
        s.wet[v] = Math.min(1, s.wet[v] + (p.amount || 0.9) * Math.exp(-(dx * dx + dy * dy) / (r * r)));
      }
      spreadWet(s, p.steps || 40);
      // Fluffy edges: the free edge swells and frays a little where it is wet.
      markFray(s, 0.05 * (p.amount || 0.9));
      settle(s, 160);
      s.log.push('wet');
    },

    // Burn: a scorch from a point on the edge. It darkens and curls the edge up.
    burn: function (s, p) {
      var k = nearest(s, p.u, p.v);
      var r = p.r || 1.2;
      for (var v = 0; v < NV; v++) {
        if (!s.alive[v]) continue;
        var dx = (s.gi[v] - s.gi[k]) * DX, dy = (s.gj[v] - s.gj[k]) * DY;
        var w = Math.exp(-(dx * dx + dy * dy) / (r * r));
        s.burn[v] = Math.min(1, s.burn[v] + w);
        s.z[v] += 0.35 * w;
        s.pz[v] = s.z[v];
      }
      settle(s, 200);
      s.log.push('burn');
    },

    // Holes: insects eat through the paper (particles inside each circle go).
    holes: function (s, p) {
      var removed = 0;
      (p.items || []).forEach(function (h) {
        var r = h.r || 0.3;
        for (var v = 0; v < NV; v++) {
          if (!s.alive[v]) continue;
          var dx = (s.gi[v] / NX - h.u) * SX, dy = (s.gj[v] / NY - h.v) * SY;
          if (dx * dx + dy * dy < r * r) { s.alive[v] = 0; removed++; }
        }
      });
      settle(s, 160);
      s.log.push('holes removed ' + removed);
    },

    // Mould: colonies grow where the paper stays wet, and spread slowly.
    mould: function (s, p) {
      var rate = p.rate || 0.25;
      var n = p.steps || 30;
      for (var i = 0; i < n; i++) {
        for (var v = 0; v < NV; v++) {
          if (!s.alive[v]) continue;
          if (s.wet[v] > 0.3) s.mould[v] = Math.min(1, s.mould[v] + rate * 0.05 * s.wet[v]);
        }
        // mould spreads a little to neighbours
        var copy = Float32Array.from(s.mould);
        for (var q = 0; q < s.sa.length; q++) {
          if (!s.alive_s[q]) continue;
          var a = s.sa[q], b = s.sb[q];
          var avg = (copy[a] + copy[b]) / 2;
          s.mould[a] = Math.max(s.mould[a], avg * 0.01);
          s.mould[b] = Math.max(s.mould[b], avg * 0.01);
        }
      }
      s.log.push('mould');
    },

    // Nest: shreds of paper are pulled into a bundle around a point.
    gather: function (s, p) {
      var cx = (p.u - 0.5) * SX, cy = (p.v - 0.5) * SY;
      var r0 = p.radius || 2.2, r1 = (p.final !== undefined) ? p.final : 0.9;
      var k = { x: cx, y: cy, z: 0.8, r: r0, inside: true };
      s.colliders.push(k);
      var n = p.steps || 200;
      for (var i = 0; i < n; i++) {
        var t = (i + 1) / n;
        k.r = r0 + (r1 - r0) * t;
        step(s);
      }
      s.colliders.splice(s.colliders.indexOf(k), 1);
      settle(s, 160);
      s.log.push('gather');
    }
  };

  function markDirt(s, x, y, r, amt) {
    for (var v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var dx = s.x[v] - x, dy = s.y[v] - y;
      if (dx * dx + dy * dy < r * r) s.dirt[v] = Math.min(1, s.dirt[v] + amt);
    }
  }

  function markFray(s, amp) {
    for (var v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      var edge = s.gi[v] <= 1 || s.gi[v] >= NX - 1 || s.gj[v] <= 1 || s.gj[v] >= NY - 1;
      if (!edge) continue;
      s.x[v] += (s.rng() - 0.5) * amp;
      s.y[v] += (s.rng() - 0.5) * amp;
      s.z[v] += (s.rng() - 0.5) * amp;
    }
  }

  function spreadWet(s, n) {
    for (var i = 0; i < n; i++) {
      var copy = Float32Array.from(s.wet);
      for (var q = 0; q < s.sa.length; q++) {
        if (!s.alive_s[q]) continue;
        var a = s.sa[q], b = s.sb[q];
        var avg = (copy[a] + copy[b]) / 2;
        s.wet[a] += (avg - copy[a]) * 0.1;
        s.wet[b] += (avg - copy[b]) * 0.1;
      }
      for (var v = 0; v < NV; v++) s.wet[v] *= 0.998;
    }
  }

  // Run one increment (its events in order), then deposit dirt.
  // Move the paper so its middle sits over the origin (the camera looks there).
  function recentre(s) {
    var cx = 0, cy = 0, c = 0;
    for (var v = 0; v < NV; v++) if (s.alive[v]) { cx += s.x[v]; cy += s.y[v]; c++; }
    if (!c) return;
    cx /= c; cy /= c;
    for (v = 0; v < NV; v++) {
      if (!s.alive[v]) continue;
      s.x[v] -= cx; s.y[v] -= cy; s.px[v] -= cx; s.py[v] -= cy;
    }
  }

  function runIncrement(s, inc) {
    s.increment = inc.age;
    inc.events.forEach(function (ev) {
      var fn = OPS[ev.op];
      if (!fn) throw new Error('Unknown op: ' + ev.op);
      fn(s, ev);
    });
    recentre(s);
    depositDirt(s);
  }

  // A fresh sheet, settled on the floor, ready for increment 1.
  function startSheet(seed) {
    var s = cleanSheet(seed || 1);
    settle(s, 60);
    return s;
  }

  // Replay increments 1..n of a story from a flat sheet.
  function replay(story, n) {
    var s = startSheet(story.seed);
    story.steps.slice(0, n).forEach(function (inc) { runIncrement(s, inc); });
    return s;
  }

  // A short fingerprint of the story, so a baked cache can be checked against it.
  function storyHash(story) {
    var str = JSON.stringify(story), h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  var api = {
    replay: replay, runIncrement: runIncrement, startSheet: startSheet, storyHash: storyHash, toPieces: toPieces, stats: stats, step: step, settle: settle, tumble: tumble,
    cleanSheet: cleanSheet, OPS: OPS, NX: NX, NY: NY, NV: NV
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PaperSim = api;
})(typeof window !== 'undefined' ? window : this);
