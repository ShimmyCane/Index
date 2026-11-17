/* Mind Palace: shapes -> Gaussian splats. No DOM and no 3-D library.
   Every shape's surface is scattered with points. Each point becomes one Gaussian: a soft blob with a middle,
   a spread in three directions (thin across the surface, wide along it), a colour and a strength.
   "Fuzz" pushes the blobs off the surface and swells them, so a thing that is not well remembered looks vague.

   Result: { n, center: Float32Array(3n), cov: Float32Array(6n) (xx, xy, xz, yy, yz, zz), rgba: Uint8Array(4n),
             normal (3n) and scale (2n: along, across) for saving a .ply } */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};
  var SUN = (function () { var v = [0.48, 0.78, 0.4], l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();

  function rng(seed) {      // the same palace always gives the same splats
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hexRgb(h) { var n = parseInt(String(h).replace('#', ''), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function colLen(b, c) { return Math.sqrt(b[c * 3] * b[c * 3] + b[c * 3 + 1] * b[c * 3 + 1] + b[c * 3 + 2] * b[c * 3 + 2]); }

  /* Surface area of a shape in its own space. */
  function polyArea(pts) { var a = 0; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; }
  function polyEdge(pts) { var l = 0; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; l += Math.hypot(q[0] - p[0], q[1] - p[1]); } return l; }
  function area(s) {
    if (s.t === 'box') return 2 * (s.size[0] * s.size[1] + s.size[1] * s.size[2] + s.size[0] * s.size[2]);
    if (s.t === 'cyl') return Math.PI * (s.rt + s.rb) * Math.sqrt(s.h * s.h + (s.rb - s.rt) * (s.rb - s.rt)) + Math.PI * (s.rt * s.rt + s.rb * s.rb);
    if (s.t === 'sph') return 4 * Math.PI * s.r * s.r;
    if (s.t === 'torus') return 4 * Math.PI * Math.PI * s.R * s.r;
    if (s.t === 'prism') return 2 * polyArea(s.pts) + polyEdge(s.pts) * s.depth;
    return 0;
  }
  function inPoly(pts, x, y) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], b = pts[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }

  /* One random point on a shape's surface, in its own space: writes [x, y, z, nx, ny, nz] into out. */
  function samplePoint(s, R, out) {
    var u, v, a, r;
    if (s.t === 'box') {
      var w = s.size[0], h = s.size[1], d = s.size[2], az = w * h, ax = h * d, ay = w * d; u = R() * (az + ax + ay);
      var sign = R() < 0.5 ? -1 : 1, p = R() - 0.5, q = R() - 0.5;
      if (u < az) { out[0] = p * w; out[1] = q * h; out[2] = sign * d / 2; out[3] = 0; out[4] = 0; out[5] = sign; }
      else if (u < az + ax) { out[0] = sign * w / 2; out[1] = p * h; out[2] = q * d; out[3] = sign; out[4] = 0; out[5] = 0; }
      else { out[0] = p * w; out[1] = sign * h / 2; out[2] = q * d; out[3] = 0; out[4] = sign; out[5] = 0; }
    } else if (s.t === 'cyl') {
      var slant = Math.sqrt(s.h * s.h + (s.rb - s.rt) * (s.rb - s.rt)), side = Math.PI * (s.rt + s.rb) * slant, top = Math.PI * s.rt * s.rt, bot = Math.PI * s.rb * s.rb;
      u = R() * (side + top + bot); a = R() * Math.PI * 2;
      if (u < side) {
        var t, big = Math.max(s.rt, s.rb); do { t = R(); r = s.rb + (s.rt - s.rb) * t; } while (R() * big > r);     // more points where the wall is wider
        out[0] = Math.cos(a) * r; out[1] = (t - 0.5) * s.h; out[2] = Math.sin(a) * r;
        var nx = Math.cos(a) * s.h, ny = s.rb - s.rt, nz = Math.sin(a) * s.h, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        out[3] = nx / nl; out[4] = ny / nl; out[5] = nz / nl;
      } else {
        var isTop = u < side + top; r = (isTop ? s.rt : s.rb) * Math.sqrt(R());
        out[0] = Math.cos(a) * r; out[1] = (isTop ? 0.5 : -0.5) * s.h; out[2] = Math.sin(a) * r; out[3] = 0; out[4] = isTop ? 1 : -1; out[5] = 0;
      }
    } else if (s.t === 'sph') {
      v = 2 * R() - 1; a = R() * Math.PI * 2; r = Math.sqrt(1 - v * v);
      out[3] = r * Math.cos(a); out[4] = v; out[5] = r * Math.sin(a); out[0] = out[3] * s.r; out[1] = out[4] * s.r; out[2] = out[5] * s.r;
    } else if (s.t === 'torus') {     // lies flat, a ring around the y axis
      do { v = R() * Math.PI * 2; } while (R() * (s.R + s.r) > s.R + s.r * Math.cos(v));
      a = R() * Math.PI * 2;
      out[3] = Math.cos(v) * Math.cos(a); out[4] = Math.sin(v); out[5] = Math.cos(v) * Math.sin(a);
      out[0] = (s.R + s.r * Math.cos(v)) * Math.cos(a); out[1] = s.r * Math.sin(v); out[2] = (s.R + s.r * Math.cos(v)) * Math.sin(a);
    } else if (s.t === 'prism') {     // an outline in x-y, pushed out along z
      var pts = s.pts, caps = 2 * polyArea(pts), edge = polyEdge(pts) * s.depth;
      if (R() * (caps + edge) < caps) {
        var b = s._box || (s._box = pts.reduce(function (m, p) { return [Math.min(m[0], p[0]), Math.min(m[1], p[1]), Math.max(m[2], p[0]), Math.max(m[3], p[1])]; }, [1e9, 1e9, -1e9, -1e9]));
        var x, y, tries = 0; do { x = b[0] + R() * (b[2] - b[0]); y = b[1] + R() * (b[3] - b[1]); } while (!inPoly(pts, x, y) && ++tries < 40);
        var f = R() < 0.5 ? -1 : 1; out[0] = x; out[1] = y; out[2] = f * s.depth / 2; out[3] = 0; out[4] = 0; out[5] = f;
      } else {
        var pick = R() * polyEdge(pts), i = 0, len = 0;
        for (; i < pts.length; i++) { len = Math.hypot(pts[(i + 1) % pts.length][0] - pts[i][0], pts[(i + 1) % pts.length][1] - pts[i][1]); if (pick <= len) break; pick -= len; }
        i = Math.min(i, pts.length - 1); var p0 = pts[i], p1 = pts[(i + 1) % pts.length], k = R(), ex = p1[0] - p0[0], ey = p1[1] - p0[1], el = Math.hypot(ex, ey) || 1;
        out[0] = p0[0] + ex * k; out[1] = p0[1] + ey * k; out[2] = (R() - 0.5) * s.depth;
        var ox = ey / el, oy = -ex / el; if (inPoly(pts, out[0] + ox * 0.01, out[1] + oy * 0.01)) { ox = -ox; oy = -oy; }
        out[3] = ox; out[4] = oy; out[5] = 0;
      }
    }
  }

  /* opts: budget (how many splats in all), density (per square unit before the budget), fuzzOf(shape) -> 0 sharp .. 1.6 very vague,
     detailOf(shape) -> 1 for scenery, more for the things to recognise (they get that many times the splats and keep them) */
  function build(shapes, opts) {
    opts = opts || {};
    var budget = opts.budget || 140000, density = opts.density || 70, maxPer = opts.maxPer || 7000, fuzzOf = opts.fuzzOf || function () { return 0; }, detailOf = opts.detailOf || function () { return 1; };
    var areas = [], counts = [], keep = [], total = 0, kept = 0, i;
    for (i = 0; i < shapes.length; i++) {
      var b = shapes[i].xf.b, sx = colLen(b, 0), sy = colLen(b, 1), sz = colLen(b, 2);
      var A = area(shapes[i]) * (sx * sy + sy * sz + sx * sz) / 3;       // a fair guess at the area after stretching
      var detail = detailOf(shapes[i]), n = A > 0 ? Math.max(detail > 1 ? 40 : 14, Math.min(maxPer, Math.round(A * density * detail))) : 0;
      areas.push(A); counts.push(n); keep.push(detail > 1); total += n; if (detail > 1) kept += n;
    }
    // Over budget: the detailed shapes (the memory objects) keep their splats; floors, walls and islands give some up.
    if (total > budget) { var k = Math.max(0.05, (budget - kept) / Math.max(1, total - kept)); total = 0; for (i = 0; i < counts.length; i++) { if (counts[i] && !keep[i]) counts[i] = Math.max(8, Math.floor(counts[i] * k)); total += counts[i]; } }
    var center = new Float32Array(total * 3), cov = new Float32Array(total * 6), rgba = new Uint8Array(total * 4), owner = new Int32Array(total), blk = new Uint8Array(total), normal = new Float32Array(total * 3), scale = new Float32Array(total * 2);
    var R = rng(opts.seed || 20261117), pt = [0, 0, 0, 0, 0, 0], at = 0;
    for (i = 0; i < shapes.length; i++) {
      var s = shapes[i], count = counts[i]; if (!count) continue;
      var m = s.xf.b, o = s.xf.o, base = hexRgb(s.color), fuzz = Math.max(0, fuzzOf(s));
      var sigma = 0.56 * Math.sqrt(areas[i] / count) * (1 + 1.1 * fuzz);       // wide enough that neighbours melt together
      var thin = sigma * Math.min(1, 0.2 + 0.7 * fuzz), opacity = Math.round(255 * Math.max(0.25, 0.94 - 0.5 * Math.min(1, fuzz)));
      var wobble = fuzz * 0.16;
      for (var j = 0; j < count; j++, at++) {
        samplePoint(s, R, pt);
        var px = m[0] * pt[0] + m[3] * pt[1] + m[6] * pt[2] + o[0], py = m[1] * pt[0] + m[4] * pt[1] + m[7] * pt[2] + o[1], pz = m[2] * pt[0] + m[5] * pt[1] + m[8] * pt[2] + o[2];
        var nx = m[0] * pt[3] + m[3] * pt[4] + m[6] * pt[5], ny = m[1] * pt[3] + m[4] * pt[4] + m[7] * pt[5], nz = m[2] * pt[3] + m[5] * pt[4] + m[8] * pt[5];
        var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        if (wobble) { px += (R() + R() + R() - 1.5) * wobble; py += (R() + R() + R() - 1.5) * wobble; pz += (R() + R() + R() - 1.5) * wobble; }
        center[at * 3] = px; center[at * 3 + 1] = py; center[at * 3 + 2] = pz;
        // Spread: sigma along the surface, thin across it.  cov = sigma² I + (thin² − sigma²) n nᵀ
        var grow = 0.8 + R() * 0.4, st = sigma * grow, a2 = st * st, d2 = thin * grow * thin * grow - a2;
        cov[at * 6] = a2 + d2 * nx * nx; cov[at * 6 + 1] = d2 * nx * ny; cov[at * 6 + 2] = d2 * nx * nz;
        cov[at * 6 + 3] = a2 + d2 * ny * ny; cov[at * 6 + 4] = d2 * ny * nz; cov[at * 6 + 5] = a2 + d2 * nz * nz;
        // Light is painted into the colour, with a little variation so a surface reads as dabs of paint.
        var shade = (s.glow ? 1.06 : 0.6 + 0.4 * Math.max(0, nx * SUN[0] + ny * SUN[1] + nz * SUN[2])) * (0.95 + R() * 0.1);
        rgba[at * 4] = Math.min(255, base[0] * shade); rgba[at * 4 + 1] = Math.min(255, base[1] * shade); rgba[at * 4 + 2] = Math.min(255, base[2] * shade); rgba[at * 4 + 3] = opacity;
        owner[at] = i; blk[at] = s.group || 0; normal[at * 3] = nx; normal[at * 3 + 1] = ny; normal[at * 3 + 2] = nz; scale[at * 2] = st; scale[at * 2 + 1] = thin * grow;
      }
    }
    return { n: total, center: center, cov: cov, rgba: rgba, owner: owner, block: blk, normal: normal, scale: scale };
  }

  /* Join two sets (the palace, then little-me). */
  function join(a, b) {
    var n = a.n + b.n, c = new Float32Array(n * 3), v = new Float32Array(n * 6), col = new Uint8Array(n * 4), nr = new Float32Array(n * 3), sc = new Float32Array(n * 2);
    c.set(a.center); c.set(b.center, a.n * 3); v.set(a.cov); v.set(b.cov, a.n * 6); col.set(a.rgba); col.set(b.rgba, a.n * 4);
    nr.set(a.normal); nr.set(b.normal, a.n * 3); sc.set(a.scale); sc.set(b.scale, a.n * 2);
    var bl = new Uint8Array(n); bl.set(a.block); bl.set(b.block, a.n);
    return { n: n, center: c, cov: v, rgba: col, block: bl, normal: nr, scale: sc, split: a.n };
  }

  /* The usual 3-D Gaussian splatting .ply (binary). Returns an ArrayBuffer. */
  function toPly(g, count) {
    var n = count == null ? g.n : count, props = ['x', 'y', 'z', 'nx', 'ny', 'nz', 'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity', 'scale_0', 'scale_1', 'scale_2', 'rot_0', 'rot_1', 'rot_2', 'rot_3'];
    var head = 'ply\nformat binary_little_endian 1.0\nelement vertex ' + n + '\n' + props.map(function (p) { return 'property float ' + p + '\n'; }).join('') + 'end_header\n';
    var buf = new ArrayBuffer(head.length + n * props.length * 4), bytes = new Uint8Array(buf), dv = new DataView(buf), off = head.length, C0 = 0.28209479177387814;
    for (var h = 0; h < head.length; h++) bytes[h] = head.charCodeAt(h);
    for (var i = 0; i < n; i++) {
      var nxx = g.normal[i * 3], nyy = g.normal[i * 3 + 1], nzz = g.normal[i * 3 + 2], a = g.scale[i * 2], t = g.scale[i * 2 + 1];
      // The rotation that turns the z axis onto the surface normal (the thin direction).
      var qw = 1 + nzz, qx = -nyy, qy = nxx, qz = 0, ql = Math.hypot(qw, qx, qy); if (ql < 1e-6) { qw = 0; qx = 1; qy = 0; ql = 1; }
      var op = Math.max(0.004, Math.min(0.996, g.rgba[i * 4 + 3] / 255));
      var vals = [g.center[i * 3], g.center[i * 3 + 1], g.center[i * 3 + 2], nxx, nyy, nzz,
        (g.rgba[i * 4] / 255 - 0.5) / C0, (g.rgba[i * 4 + 1] / 255 - 0.5) / C0, (g.rgba[i * 4 + 2] / 255 - 0.5) / C0,
        Math.log(op / (1 - op)), Math.log(a), Math.log(a), Math.log(t), qw / ql, qx / ql, qy / ql, qz / ql];
      for (var k = 0; k < vals.length; k++, off += 4) dv.setFloat32(off, vals[k], true);
    }
    return buf;
  }

  MP.Gauss = { build: build, join: join, toPly: toPly, area: area };
})();
