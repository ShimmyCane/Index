/* Mind Palace: layout -> scene description, as a flat list of simple shapes.
   The same idea as godot/scripts/palace_builder.gd, kept in step with it. No DOM and no 3-D library.
   A shape: { t: 'box'|'cyl'|'sph'|'torus'|'prism', color: '#rrggbb', xf: {b: [9 numbers, three columns], o: [x, y, z]},
              glow, pick (id of the memory, room or world it belongs to), and its sizes }.
   Signs (names) come back as a separate list, to be drawn as text. */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};
  var FLOOR = 0.08, WALL_H = [1.1, 1.3, 1.5, 1.7, 1.9];
  var ROOM = {
    meadow: { floor: '#cdeedd', wall: '#fff6e0', trim: '#8fd3b0' }, peach: { floor: '#ffe0cc', wall: '#fff6e0', trim: '#ff9f8a' },
    sky: { floor: '#d6ecfa', wall: '#ffffff', trim: '#7fb8e6' }, lilac: { floor: '#e6defa', wall: '#fff6e0', trim: '#b9a6e8' },
    sand: { floor: '#f6e7c4', wall: '#fffaf0', trim: '#e0a57c' }, night: { floor: '#6a6fa3', wall: '#9a9fce', trim: '#ffd76a' }
  };
  var WORLD = {
    grass: { top: '#c4ebb4', side: '#c9a377', under: '#a9825a', bush: '#8fd3b0' }, beach: { top: '#f7e3b0', side: '#e6c690', under: '#c9a377', bush: '#ffb37a' },
    snow: { top: '#f4f8ff', side: '#cbd9ec', under: '#a9b8d0', bush: '#c4e3f7' }, moon: { top: '#cfc8ea', side: '#b1abcf', under: '#8e88b0', bush: '#b9a6e8' },
    candy: { top: '#ffdfe6', side: '#f7b6d2', under: '#d99ab8', bush: '#ffd76a' }
  };

  /* ---------- small transforms (basis as three columns, plus an origin) ---------- */
  var I = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  function at(p, b) { return { b: b || I, o: [p[0], p[1], p[2]] }; }
  function mulB(a, c) {
    var o = new Array(9);
    for (var col = 0; col < 3; col++) for (var row = 0; row < 3; row++)
      o[col * 3 + row] = a[row] * c[col * 3] + a[3 + row] * c[col * 3 + 1] + a[6 + row] * c[col * 3 + 2];
    return o;
  }
  function apply(xf, p) {
    var b = xf.b;
    return [b[0] * p[0] + b[3] * p[1] + b[6] * p[2] + xf.o[0], b[1] * p[0] + b[4] * p[1] + b[7] * p[2] + xf.o[1], b[2] * p[0] + b[5] * p[1] + b[8] * p[2] + xf.o[2]];
  }
  function mul(a, c) { var o = apply(a, c.o); return { b: mulB(a.b, c.b), o: o }; }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c]; }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, s, 0, -s, c]; }
  function scaleB(x, y, z) { return [x, 0, 0, 0, y, 0, 0, 0, z]; }
  function quatB(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)];
  }
  /* A basis whose z column runs from a to b, with y as near to up as it can be. */
  function alongB(a, b) {
    var z = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.sqrt(z[0] * z[0] + z[1] * z[1] + z[2] * z[2]) || 1;
    z = [z[0] / l, z[1] / l, z[2] / l];
    var x = [z[2], 0, -z[0]], xl = Math.sqrt(x[0] * x[0] + x[2] * x[2]) || 1; x = [x[0] / xl, 0, x[2] / xl];
    var y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]];
  }
  function add3(p, x, y, z) { return [p[0] + x, p[1] + y, p[2] + z]; }

  /* ---------- shape helpers ---------- */
  function box(out, color, size, pos, pick, b) { var s = { t: 'box', color: color, xf: at(pos, b), size: size, pick: pick || '' }; out.push(s); return s; }
  function cyl(out, color, rt, rb, h, pos, pick) { var s = { t: 'cyl', color: color, xf: at(pos), rt: rt, rb: rb, h: h, pick: pick || '' }; out.push(s); return s; }
  function sph(out, color, r, pos, scale, glow, pick) { var s = { t: 'sph', color: color, xf: at(pos, scale ? scaleB(scale[0], scale[1], scale[2]) : I), r: r, glow: !!glow, pick: pick || '' }; out.push(s); return s; }
  function strip(out, a, b, width, thick, color, lift) {
    var d = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2)); if (d < 0.01) return null;
    return box(out, color, [width, thick, d + 0.15], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift, (a[2] + b[2]) / 2], '', alongB(a, b));
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }

  function worldShapes(out, signs, w) {
    var st = WORLD[w.style] || WORLD.grass, p = w.pos, r = w.radius;
    cyl(out, st.top, r, r * 0.93, 1.2, add3(p, 0, -0.6, 0), w.id);
    cyl(out, st.side, r * 0.93, r * 0.6, 2.6, add3(p, 0, -2.5, 0), w.id);
    cyl(out, st.under, r * 0.6, 0, r * 0.7, add3(p, 0, -3.8 - r * 0.35, 0), w.id);
    cyl(out, '#fff6e0', 3.2, 3.2, 0.16, p, w.id);
    cyl(out, st.side, 0.75, 0.9, 0.4, add3(p, 0, 0.28, 0), w.id);
    cyl(out, '#fff6e0', 0.22, 0.28, 2.6, add3(p, 0, 1.7, 0), w.id);
    sph(out, st.bush, 0.55, add3(p, 0, 3.3, 0), null, true, w.id);
    signs.push({ kind: 'world', id: w.id, text: w.name, pos: add3(p, 0, 6, 0) });
    var seed = hash(w.id);
    for (var i = 0; i < 9; i++) {
      var a = (i + (seed % 7) / 7) * Math.PI * 2 / 9, s = 0.8 + ((seed >> (i % 5)) % 5) * 0.18;
      sph(out, st.bush, s, add3(p, Math.cos(a) * r * 0.9, s * 0.55, Math.sin(a) * r * 0.9), [1, 0.8, 1], false, w.id);
    }
  }

  function roomShapes(out, signs, r, w) {
    var st = ROOM[r.style] || ROOM.meadow, p = r.pos, h = r.half, wh = WALL_H[r.tier], th = 0.3, id = r.id;
    box(out, st.trim, [h * 2 + 0.7, 0.4, h * 2 + 0.7], add3(p, 0, -0.16, 0), id);
    box(out, st.floor, [h * 2, 0.16, h * 2], p, id);
    if (r.level > 0) {
      var drop = p[1] - w.pos[1];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cyl(out, st.wall, 0.28, 0.36, drop, add3(p, c[0] * (h - 0.3), -drop / 2 - 0.3, c[1] * (h - 0.3)), id); });
    }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (s) {
      var isDoor = s[0] === r.side[0] && s[1] === r.side[1], isBack = s[0] === -r.side[0] && s[1] === -r.side[1];
      var height = isBack ? wh * 1.8 : wh, alongZ = s[0] !== 0;
      (isDoor ? [[-h, -1.15], [1.15, h]] : [[-h, h]]).forEach(function (span) {
        var len = span[1] - span[0], mid = (span[0] + span[1]) / 2, a = alongZ ? add3(p, s[0] * h, 0, mid) : add3(p, mid, 0, s[1] * h);
        box(out, st.wall, alongZ ? [th, height, len] : [len, height, th], add3(a, 0, height / 2 + FLOOR, 0), id);
        box(out, st.trim, alongZ ? [th + 0.14, 0.14, len] : [len, 0.14, th + 0.14], add3(a, 0, height + FLOOR + 0.07, 0), id);
      });
      if (isDoor) {
        [-1.15, 1.15].forEach(function (o) { box(out, st.trim, [0.36, 2.7, 0.36], add3(alongZ ? add3(p, s[0] * h, 0, o) : add3(p, o, 0, s[1] * h), 0, 1.35 + FLOOR, 0), id); });
        box(out, st.trim, alongZ ? [0.42, 0.36, 2.9] : [2.9, 0.36, 0.42], add3(p, s[0] * h, 2.85 + FLOOR, s[1] * h), id);
        signs.push({ kind: 'room', id: id, text: r.name, pos: add3(p, s[0] * h, 4.1, s[1] * h) });
      } else if (isBack) {
        [-1, 1].forEach(function (k) {
          var a = alongZ ? add3(p, s[0] * h, 0, k * h * 0.45) : add3(p, k * h * 0.45, 0, s[1] * h);
          box(out, '#c4e3f7', alongZ ? [th + 0.06, wh * 0.55, 1] : [1, wh * 0.55, th + 0.06], add3(a, 0, wh * 1.15 + FLOOR, 0), id);
        });
      }
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c, i) {
      var ph = [wh + 0.3, wh + 0.5, wh * 1.8 + 0.6, wh * 1.8 + 1.2, wh * 1.8 + 2][r.tier], pr = r.tier >= 3 ? 0.55 : 0.3, cp = add3(p, c[0] * h, 0, c[1] * h);
      cyl(out, st.wall, pr, pr * 1.1, ph, add3(cp, 0, ph / 2 + FLOOR, 0), id);
      if (r.tier >= 3) cyl(out, st.trim, 0, pr * 1.35, 1.1, add3(cp, 0, ph + 0.55 + FLOOR, 0), id);
      else sph(out, st.trim, pr * 1.15, add3(cp, 0, ph + FLOOR + 0.1, 0), null, false, id);
      if (r.tier >= 4 && i === 0) { cyl(out, '#4a4860', 0.04, 0.04, 1.6, add3(cp, 0, ph + 1.9, 0), id); box(out, '#ff9f8a', [0.8, 0.5, 0.04], add3(cp, 0.42, ph + 2.4, 0), id); }
    });
  }

  function partShape(part, stand, color, pick) {
    var local = { b: mulB(quatB(part.q), scaleB(part.s[0], part.s[1], part.s[2])), o: part.p };
    var xf = mul(stand, local), s = { t: part.t, color: color, glow: !!part.glow, pick: pick };
    if (part.t === 'box') s.size = part.size;
    else if (part.t === 'cyl') { s.rt = part.rt; s.rb = part.rb; s.h = part.h; }
    else if (part.t === 'sph') s.r = part.r;
    else if (part.t === 'torus') { s.R = part.R; s.r = part.r; xf = mul(xf, { b: rotX(Math.PI / 2), o: [0, 0, 0] }); }   // three.js rings stand up; ours lie flat
    else if (part.t === 'prism') { s.pts = part.pts; s.depth = part.depth; }
    s.xf = xf; return s;
  }
  function objectShapes(out, signs, o, room, library) {
    var base = add3(o.pos, 0, FLOOR, 0), a = o.asset || {};
    cyl(out, '#fffdf7', 0.6, 0.68, 0.32, add3(base, 0, 0.16, 0), o.id);
    if (o.level >= 2) out.push({ t: 'torus', color: o.level >= 4 ? '#f2c14e' : '#e0a57c', xf: at(add3(base, 0, 0.3, 0)), R: 0.66, r: 0.06, pick: o.id });
    var stand = { b: mulB(rotY(Math.atan2(room.side[0], room.side[1])), scaleB(1.25, 1.25, 1.25)), o: add3(base, 0, 0.32, 0) };
    var kinds = (library && library.kinds) || {}, kind = kinds[a.kind] ? a.kind : 'star';
    if (a.representation === 'emoji' && a.glyph) {
      // An emoji has no shape to sample: a soft ball in the stand's colour holds its place, and the glyph is drawn as a sign.
      cyl(out, '#c49a6c', 0.05, 0.05, 0.44, add3(base, 0, 0.54, 0), o.id);
      sph(out, '#fff6e0', 0.5, add3(base, 0, 1.3, 0), null, false, o.id);
      signs.push({ kind: 'emoji', id: o.id, text: a.glyph, pos: add3(base, 0, 1.3, 0) });
    } else if (kinds[kind]) {
      kinds[kind].parts.forEach(function (part) { out.push(partShape(part, stand, a.color && part.main ? a.color : part.c, o.id)); });
    }
    signs.push({ kind: 'node', id: o.id, text: o.title, pos: add3(base, 0, 2.35, 0) });
  }

  function build(desc, library) {
    var out = [], signs = [];
    desc.worlds.forEach(function (w) { worldShapes(out, signs, w); });
    desc.rooms.forEach(function (r) { roomShapes(out, signs, r, desc.byId[r.worldId]); });
    desc.objects.forEach(function (o) { objectShapes(out, signs, o, desc.byId[o.roomId], library); });
    desc.paths.forEach(function (p) { strip(out, p.points[0], p.points[1], 1.7, 0.1, '#fff6e0', 0.03); });
    desc.bridges.forEach(function (br) {
      var pts = br.points;
      strip(out, desc.byId[br.a].pos, pts[0], 2, 0.1, '#fff6e0', 0.02); strip(out, pts[pts.length - 1], desc.byId[br.b].pos, 2, 0.1, '#fff6e0', 0.02);
      for (var i = 1; i < pts.length; i++) {
        var plank = strip(out, pts[i - 1], pts[i], 2.1, 0.18, '#d9b48a', 0.02);
        if (plank) [-0.98, 0.98].forEach(function (side) {
          out.push({ t: 'cyl', color: '#c49a6c', xf: mul(plank.xf, at([side, 0.5, 0])), rt: 0.08, rb: 0.08, h: 0.9, pick: '' });
          out.push({ t: 'sph', color: '#ff9f8a', xf: mul(plank.xf, at([side, 1, 0])), r: 0.14, pick: '' });
        });
      }
    });
    return { shapes: out, signs: signs };
  }

  /* Little-me, standing at the origin and facing +z. */
  function avatar() {
    var out = [];
    cyl(out, '#5d6aa8', 0.085, 0.085, 0.42, [-0.11, 0.21, 0]); cyl(out, '#5d6aa8', 0.085, 0.085, 0.42, [0.11, 0.21, 0]);
    cyl(out, '#ff9f8a', 0.19, 0.24, 0.5, [0, 0.66, 0]);
    cyl(out, '#ff9f8a', 0.07, 0.08, 0.38, [-0.27, 0.67, 0]); cyl(out, '#ff9f8a', 0.07, 0.08, 0.38, [0.27, 0.67, 0]);
    sph(out, '#ffe0c2', 0.25, [0, 1.13, 0]); sph(out, '#6b4a3a', 0.27, [0, 1.2, -0.04], [1, 0.75, 1]);
    sph(out, '#2b2a33', 0.04, [-0.09, 1.14, 0.23]); sph(out, '#2b2a33', 0.04, [0.09, 1.14, 0.23]);
    box(out, '#8fd3b0', [0.3, 0.34, 0.14], [0, 0.7, -0.24]);
    sph(out, '#ffd76a', 0.2, [0.32, 1.0, 0.22], null, true);          // a lantern that glows
    return out;
  }

  /* ---------- decorations: trees, a windmill, birds, a balloon, a walker and a gear. Some of them move, on a loop. ----------
     A moving part is a "motion": every shape in it moves together, rigidly, around its rest pivot.
     Motions are numbered as blocks from 2 (block 1 is little-me). A shape's group is its block; 0 is static. */
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, -s, c, 0, 0, 0, 1]; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
  var LEAF = ['#8fd3b0', '#7bd389', '#a8e6a1', '#6cc39a'], BLOSSOM = ['#ffb3d1', '#ffd1e3', '#f7b6d2'];

  /* A spot on a world's ground, away from the plaza and from that world's rooms. */
  function freeSpot(desc, w, rand, lo, hi, margin) {
    var rooms = desc.rooms.filter(function (q) { return q.worldId === w.id; });
    for (var k = 0; k < 40; k++) {
      var a = rand() * Math.PI * 2, r = w.radius * (lo + (hi - lo) * rand());
      var x = w.pos[0] + Math.cos(a) * r, z = w.pos[2] + Math.sin(a) * r;
      if (Math.hypot(x - w.pos[0], z - w.pos[2]) < 5) continue;
      var clash = rooms.some(function (q) { return Math.abs(x - q.pos[0]) < q.half + margin && Math.abs(z - q.pos[2]) < q.half + margin; });
      if (!clash) return [x, w.pos[1], z];
    }
    return null;
  }
  /* Three kinds of tree: round, pine and blossom. */
  function tree(out, rand, p) {
    var k = rand(), s = 0.8 + rand() * 0.5;
    function at(dx, dy, dz) { return [p[0] + dx * s, p[1] + dy * s, p[2] + dz * s]; }
    cyl(out, '#c49a6c', 0.16 * s, 0.22 * s, 1.5 * s, at(0, 0.75, 0));
    if (k < 0.45) {
      var c = LEAF[Math.floor(rand() * LEAF.length)];
      sph(out, c, 1.1 * s, at(0, 2.3, 0)); sph(out, c, 0.75 * s, at(0.5, 2.9, 0.2)); sph(out, LEAF[Math.floor(rand() * LEAF.length)], 0.7 * s, at(-0.5, 2.8, -0.3));
    } else if (k < 0.8) {
      var g = '#5fb88a';
      cyl(out, g, 0, 1.1 * s, 1.7 * s, at(0, 1.9, 0)); cyl(out, g, 0, 0.8 * s, 1.4 * s, at(0, 2.8, 0)); cyl(out, g, 0, 0.5 * s, 1.1 * s, at(0, 3.6, 0));
    } else {
      sph(out, BLOSSOM[Math.floor(rand() * BLOSSOM.length)], 1.0 * s, at(0, 2.3, 0)); sph(out, '#ffffff', 0.5 * s, at(0.6, 2.7, 0.3));
    }
  }
  /* Returns { shapes, motions }. A motion: { block, type: 'spin' | 'orbit' | 'bob', ...params }. */
  function decorate(desc) {
    var shapes = [], motions = [];
    function motion(type, opts, parts) {
      var block = motions.length + 2;
      parts.forEach(function (s) { s.group = block; shapes.push(s); });
      opts.block = block; opts.type = type; motions.push(opts);
    }
    desc.worlds.forEach(function (w) {
      var rand = rng(hash(w.id) * 7 + 3), i, k;
      for (i = 0; i < 9; i++) { var p = freeSpot(desc, w, rand, 0.3, 0.9, 2.2); if (p) tree(shapes, rand, p); }

      // A windmill: the blades turn about the hub.
      var wm = freeSpot(desc, w, rand, 0.3, 0.6, 3);
      if (wm) {
        cyl(shapes, '#fff6e0', 0.42, 0.6, 3.0, add3(wm, 0, 1.5, 0));
        cyl(shapes, '#ff9f8a', 0, 0.85, 0.9, add3(wm, 0, 3.45, 0));
        var hub = [wm[0], wm[1] + 3.2, wm[2] + 0.7], blades = [];
        sph(blades, '#ffd76a', 0.28, hub);
        for (k = 0; k < 4; k++) { var a = k * Math.PI / 2; box(blades, '#fffdf7', [1.7, 0.22, 0.12], add3(hub, Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0), '', rotZ(a)); }
        motion('spin', { axis: 'z', pivot: hub, period: 8 }, blades);
      }

      // Three birds, each flying a wide loop high over the island.
      for (i = 0; i < 3; i++) {
        var r = 9 + i * 2.5, C = [w.pos[0], w.pos[1] + 9 + i * 1.6, w.pos[2]], Pr = [C[0] + r, C[1], C[2]], col = ['#ffd76a', '#ff9fc0', '#9fd3ff'][i], bird = [];
        sph(bird, col, 0.6, Pr, [0.6, 0.5, 1.0]);
        sph(bird, col, 0.36, add3(Pr, 0, 0.12, 0.7));
        box(bird, '#ffffff', [1.6, 0.06, 0.5], add3(Pr, 0, 0.08, -0.05));
        motion('orbit', { centre: C, radius: r, rest: Pr, period: 14 + i * 4, phase: i * 2.1 }, bird);
      }

      // A balloon bobbing above the ground.
      var bl = freeSpot(desc, w, rand, 0.2, 0.7, 2.5);
      if (bl) {
        var balloon = [], base = add3(bl, 0, 6, 0);
        sph(balloon, '#ff8fa3', 0.9, add3(base, 0, 0.9, 0));
        cyl(balloon, '#c49a6c', 0.3, 0.3, 0.4, add3(base, 0, -0.5, 0));
        motion('bob', { amp: 0.7, period: 5 + rand() * 3, phase: rand() * 6.28 }, balloon);
      }

      // A little walker going round the plaza.
      var wr = 5.5, Wr = [w.pos[0] + wr, w.pos[1], w.pos[2]], walker = avatar();
      walker.forEach(function (s) { s.xf.o = [s.xf.o[0] + Wr[0], s.xf.o[1] + Wr[1], s.xf.o[2] + Wr[2]]; });
      motion('orbit', { centre: [w.pos[0], w.pos[1], w.pos[2]], radius: wr, rest: Wr, period: 22, phase: rand() * 6.28 }, walker);

      // Fireflies: a ring of glowing dots turning slowly above the plaza.
      var ff = [], fc = [w.pos[0], w.pos[1] + 3.2, w.pos[2]];
      for (k = 0; k < 6; k++) {
        var fa = k * Math.PI / 3, fr = 3.5 + (k % 2) * 1.5;
        sph(ff, '#fff3a0', 0.16, [fc[0] + Math.cos(fa) * fr, fc[1] + (k % 3) * 0.5, fc[2] + Math.sin(fa) * fr], null, true);
      }
      motion('spin', { axis: 'y', pivot: fc, period: 12 }, ff);

      // A gear on a post, turning.
      var gp = freeSpot(desc, w, rand, 0.45, 0.8, 2.5);
      if (gp) {
        var gc = add3(gp, 0, 1.7, 0), gear = [];
        cyl(shapes, '#c49a6c', 0.08, 0.08, 1.7, add3(gp, 0, 0.85, 0));
        gear.push({ t: 'cyl', color: '#9fc5e8', xf: { b: rotX(Math.PI / 2), o: gc }, rt: 0.7, rb: 0.7, h: 0.25, glow: false, pick: '' });
        for (k = 0; k < 8; k++) { var ga = k * Math.PI / 4; box(gear, '#9fc5e8', [0.32, 0.3, 0.3], add3(gc, Math.cos(ga) * 0.85, Math.sin(ga) * 0.85, 0), '', rotZ(ga)); }
        motion('spin', { axis: 'z', pivot: gc, period: 9 }, gear);
      }
    });
    return { shapes: shapes, motions: motions };
  }

  MP.Scene = { build: build, avatar: avatar, decorate: decorate, apply: apply, FLOOR: FLOOR };
})();
