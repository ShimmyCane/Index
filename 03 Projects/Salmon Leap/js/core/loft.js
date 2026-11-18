/*
 * Make 3D x Construct: lofted surfaces. Pure JS, no DOM, no Three.js (runs in Node for tests).
 *
 * A "loft" part is a smooth closed surface swept along a spline through its joints. Each cross-section is an
 * ellipse with a half-width w and a half-height h, which change along the spline. This is how a horse's barrel,
 * neck and legs, or a person's torso, head and limbs, get their real shapes instead of stacked blocks.
 *
 * Fields on a loft object (absolute model coordinates, inches):
 *   joints:  [[x, y, z], ...]          the spine: 2 or more points, a smooth curve passes through them
 *   rings:   [[t, w, h], ...]          t from 0 to 1 along the spine (by length); w, h = half-width and half-height
 *   facing:  [x, y, z]  (optional)     the direction the width w points; default: any side
 *
 * The position and dimensions of a loft are its bounding box (set by whoever builds the scene), so the rules
 * and the certainty checks still work. The mesh itself is always in absolute coordinates.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { loft: api });
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const unit = (a) => { const l = len(a); return l > 1e-12 ? mul(a, 1 / l) : [0, 0, 0]; };

  // A vector not parallel to t, used when no facing is given.
  function anyPerp(t) {
    const a = Math.abs(t[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    return unit(sub(a, mul(t, dot(a, t))));
  }

  // Catmull-Rom through the joints, uniform. The curve starts and ends at the first and last joint.
  function catmull(p0, p1, p2, p3, u) {
    const u2 = u * u, u3 = u2 * u;
    return [0, 1, 2].map((k) =>
      0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3));
  }

  // A dense polyline through the joints, with its cumulative length, for arc-length sampling.
  function spine(joints, perSegment = 24) {
    const n = joints.length;
    const pts = [];
    for (let i = 0; i < n - 1; i++) {
      const p0 = joints[Math.max(i - 1, 0)], p1 = joints[i], p2 = joints[i + 1], p3 = joints[Math.min(i + 2, n - 1)];
      for (let k = 0; k < perSegment; k++) pts.push(catmull(p0, p1, p2, p3, k / perSegment));
    }
    pts.push(joints[n - 1].slice());
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
    return { pts, cum, total: cum[cum.length - 1] || 1 };
  }

  // The point at fraction t (0..1) of the spine's length.
  function pointAt(sp, t) {
    const target = Math.min(1, Math.max(0, t)) * sp.total;
    let lo = 0, hi = sp.cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (sp.cum[mid] < target) lo = mid; else hi = mid; }
    const span = sp.cum[hi] - sp.cum[lo] || 1;
    const f = (target - sp.cum[lo]) / span;
    return add(mul(sp.pts[lo], 1 - f), mul(sp.pts[hi], f));
  }

  // Half-width and half-height at t, linear between the rings.
  function ringAt(rings, t) {
    if (t <= rings[0][0]) return { w: rings[0][1], h: rings[0][2] };
    for (let i = 1; i < rings.length; i++) {
      if (t <= rings[i][0]) {
        const a = rings[i - 1], b = rings[i];
        const f = (t - a[0]) / ((b[0] - a[0]) || 1);
        return { w: a[1] + (b[1] - a[1]) * f, h: a[2] + (b[2] - a[2]) * f };
      }
    }
    const last = rings[rings.length - 1];
    return { w: last[1], h: last[2] };
  }

  // Checks a loft's spine and rings. Returns a list of problems (empty when it is valid).
  function validate(obj) {
    const errs = [];
    const j = obj.joints, r = obj.rings;
    if (!Array.isArray(j) || j.length < 2 || !j.every((p) => Array.isArray(p) && p.length === 3 && p.every((v) => Number.isFinite(v)))) {
      errs.push('joints must be two or more [x, y, z] points');
      return errs;
    }
    if (!Array.isArray(r) || r.length < 2 || !r.every((q) => Array.isArray(q) && q.length === 3 && q.every((v) => Number.isFinite(v)))) {
      errs.push('rings must be two or more [t, w, h] entries');
      return errs;
    }
    if (!r.every((q, i) => q[0] >= 0 && q[0] <= 1 && (i === 0 || q[0] >= r[i - 1][0]))) errs.push('ring t values must rise from 0 to 1');
    if (!r.every((q) => q[1] >= 0.02 && q[2] >= 0.02)) errs.push('ring half-widths and half-heights must be at least 0.02 in');
    if (obj.facing !== undefined && (!Array.isArray(obj.facing) || len(obj.facing) < 1e-9)) errs.push('facing must be a non-zero [x, y, z]');
    return errs;
  }

  // The bounding box of a loft's surface (conservative: each ring is taken as a circle of its largest radius).
  function extentsOf(obj) {
    const maxR = Math.max(...obj.rings.map((q) => Math.max(q[1], q[2])));
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    obj.joints.forEach((p) => { for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k] - maxR); hi[k] = Math.max(hi[k], p[k] + maxR); } });
    return { min: lo, max: hi, centre: [0, 1, 2].map((k) => (lo[k] + hi[k]) / 2), size: [0, 1, 2].map((k) => hi[k] - lo[k]) };
  }

  // Builds the surface. Returns flat arrays: positions, normals, uvs (u round, v along), indices.
  // The ends are closed with a centre point each, so the solid is watertight.
  function mesh(obj, opts = {}) {
    const sides = opts.sides || 16, samples = opts.samples || 28;
    const sp = spine(obj.joints);
    const positions = [], normals = [], uvs = [], indices = [];
    const facing = obj.facing ? unit(obj.facing) : null;

    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const c = pointAt(sp, t);
      const t0 = pointAt(sp, Math.max(0, t - 0.01)), t1 = pointAt(sp, Math.min(1, t + 0.01));
      const T = unit(sub(t1, t0));
      const N = facing ? unit(sub(facing, mul(T, dot(facing, T)))) : anyPerp(T);
      const B = cross(T, N);
      const { w, h } = ringAt(obj.rings, t);
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        const p = add(c, add(mul(N, w * ca), mul(B, h * sa)));
        positions.push(p[0], p[1], p[2]);
        const n = unit(add(mul(N, ca / w), mul(B, sa / h)));
        normals.push(n[0], n[1], n[2]);
        uvs.push(i / sides, t);
      }
    }
    // Ring-to-ring quads as two triangles each.
    for (let s = 0; s < samples; s++) {
      for (let i = 0; i < sides; i++) {
        const a = s * sides + i, b = s * sides + ((i + 1) % sides);
        const c = (s + 1) * sides + i, d = (s + 1) * sides + ((i + 1) % sides);
        indices.push(a, c, b, b, c, d);
      }
    }
    // End caps: a centre vertex at each end, fanned to its ring.
    [[0, 0], [samples, -1]].forEach(([s, dir]) => {
      const t = s / samples;
      const c = pointAt(sp, t);
      const T = unit(sub(pointAt(sp, Math.min(1, t + 0.01)), pointAt(sp, Math.max(0, t - 0.01))));
      const n = mul(T, dir === 0 ? -1 : 1);
      const centreIndex = positions.length / 3;
      positions.push(c[0], c[1], c[2]); normals.push(n[0], n[1], n[2]); uvs.push(0.5, t);
      for (let i = 0; i < sides; i++) {
        const a = s * sides + i, b = s * sides + ((i + 1) % sides);
        if (dir === 0) indices.push(centreIndex, b, a); else indices.push(centreIndex, a, b);
      }
    });
    return { positions, normals, uvs, indices };
  }

  return { validate, extentsOf, mesh, spine, pointAt, ringAt, anyPerp };
});
