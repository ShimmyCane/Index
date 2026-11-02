/* Make 3D — motion engine. Reads a model and a motion file; returns poses. No DOM, no Three.js.
   Motion is its own file (make3d.motion/0.1), separate from the model. It never changes the model.

   Every animation is a loop: time t runs from 0 to loop_s and wraps. Each motion repeats a whole
   number of times per loop (`cycles`), so the end of the loop is the same pose as the start.

   A pose is a 4x4 matrix (row-major array of 16) per target uuid, in model coordinates (inches, Z up),
   relative to the target's parent. The viewer applies it on top of the rest pose. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3D = Object.assign(root.M3D || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const SCHEMA = 'make3d.motion/0.1';
  const KINDS = ['path', 'swing', 'bob', 'slide', 'spin'];
  const AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  const TAU = Math.PI * 2;

  // ---------- 4x4 matrices, row-major
  const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  function mul(a, b) {
    const o = new Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[r * 4 + k] * b[k * 4 + c];
        o[r * 4 + c] = s;
      }
    }
    return o;
  }
  const translate = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
  function rotate(axis, rad) {
    const [x, y, z] = axis, c = Math.cos(rad), s = Math.sin(rad), t = 1 - c;
    return [
      t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
      t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
      t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
      0, 0, 0, 1,
    ];
  }
  // Rotation about a pivot point: move the pivot to the origin, turn, move back.
  const about = (pivot, axis, rad) =>
    mul(translate(pivot[0], pivot[1], pivot[2]), mul(rotate(axis, rad), translate(-pivot[0], -pivot[1], -pivot[2])));
  function apply(m, p) {
    return [0, 1, 2].map((r) => m[r * 4] * p[0] + m[r * 4 + 1] * p[1] + m[r * 4 + 2] * p[2] + m[r * 4 + 3]);
  }

  // ---------- closed path: smooth curve through the points (centripetal-free uniform Catmull-Rom), constant speed
  function catmull(p0, p1, p2, p3, s) {
    const s2 = s * s, s3 = s2 * s;
    return [0, 1, 2].map((i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * s +
      (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * s2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * s3));
  }
  const pathCache = new WeakMap();
  // Samples the closed curve; returns { pts, len (cumulative), total }.
  function samplePath(points) {
    if (pathCache.has(points)) return pathCache.get(points);
    const P = points.map((p) => [p[0], p[1], p[2] || 0]);
    const n = P.length, per = 64, pts = [];
    for (let i = 0; i < n; i++) {
      const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      for (let k = 0; k < per; k++) pts.push(catmull(p0, p1, p2, p3, k / per));
    }
    pts.push(pts[0].slice());
    const len = [0];
    for (let i = 1; i < pts.length; i++) {
      len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
    }
    const out = { pts, len, total: len[len.length - 1] };
    pathCache.set(points, out);
    return out;
  }
  // Point and heading (radians, about Z) at fraction u of the way round, by distance walked.
  // The heading is taken across a short chord centred on the point, so it is smooth and exact at the start.
  function pathAt(points, u) {
    const { pts, len, total } = samplePath(points);
    const at = (dist) => {
      const d = ((dist % total) + total) % total;
      let lo = 0, hi = len.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (len[mid] <= d) lo = mid; else hi = mid; }
      const f = (d - len[lo]) / (len[hi] - len[lo] || 1), a = pts[lo], b = pts[hi];
      return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * f);
    };
    const d = (((u % 1) + 1) % 1) * total, h = Math.min(1, total / 1000);
    const ahead = at(d + h), behind = at(d - h);
    return { point: at(d), heading: Math.atan2(ahead[1] - behind[1], ahead[0] - behind[0]) };
  }
  const pathLength = (points) => samplePath(points).total;

  // ---------- time profile (optional): maps loop time to distance along a path.
  // profile = [[t, s], ...] from [0, 0] to [1, 1], both non-decreasing. t is the fraction of the loop, s the fraction
  // of the path's length. Missing profile = constant speed. Lets a path speed up and slow down (gravity, drag).
  function warpTime(profile, x) {
    if (!Array.isArray(profile) || profile.length < 2) return x;
    const whole = Math.floor(x), f = x - whole;
    let i = 0;
    while (i < profile.length - 2 && profile[i + 1][0] < f) i++;
    const [t0, s0] = profile[i], [t1, s1] = profile[i + 1];
    const k = t1 > t0 ? (f - t0) / (t1 - t0) : 0;
    return whole + s0 + (s1 - s0) * k;
  }

  // ---------- one motion -> matrix at loop fraction u (0..1)
  const deg = (d) => (d * Math.PI) / 180;
  function matrixFor(m, u) {
    const c = m.cycles || 1, ph = m.phase || 0;
    const wave = Math.sin(TAU * (c * u + ph));                  // -1..1, smooth
    const rise = (1 - Math.cos(TAU * (c * u + ph))) / 2;        // 0..1, smooth
    const axis = AXES[m.axis || 'z'];
    const pivot = m.pivot || [0, 0, 0];
    switch (m.kind) {
      case 'swing': {
        const mid = ((m.from || 0) + (m.to || 0)) / 2, amp = ((m.to || 0) - (m.from || 0)) / 2;
        return about(pivot, axis, deg(mid + amp * wave));
      }
      case 'spin': return about(pivot, axis, TAU * c * u + deg(m.start_deg || 0));
      case 'bob': { const a = (m.amount || 0) * rise; return translate(axis[0] * a, axis[1] * a, axis[2] * a); }
      case 'slide': { const a = (m.distance || 0) * rise; return translate(axis[0] * a, axis[1] * a, axis[2] * a); }
      case 'path': {
        // The target's pivot travels along the path. Facing 'tangent' turns it to face the way it goes;
        // rest_heading_deg is the way it faces in the model (0 = +X).
        const { point, heading } = pathAt(m.points, warpTime(m.profile, c * u + ph));
        const turn = m.face === 'tangent' ? heading - deg(m.rest_heading_deg || 0) : 0;
        return mul(translate(point[0], point[1], point[2]),
          mul(rotate(AXES.z, turn), translate(-pivot[0], -pivot[1], -pivot[2])));
      }
      default: return I();
    }
  }

  // Pose at time t (seconds). Returns { [uuid]: matrix }. Motions on the same target apply in file order.
  // Targets missing from the model are skipped (checkMotion warns about them).
  function poseAt(model, motion, t) {
    const out = {};
    if (!motion || !Array.isArray(motion.motions)) return out;
    const have = new Set((model && model.objects || []).map((o) => o.uuid));
    const L = motion.loop_s > 0 ? motion.loop_s : 1;
    const u = (((t / L) % 1) + 1) % 1;
    for (const m of motion.motions) {
      if (!have.has(m.target) || !KINDS.includes(m.kind)) continue;
      if (m.start && m.start !== 'auto') continue; // tap and chained starts are future
      out[m.target] = mul(matrixFor(m, u), out[m.target] || I());
    }
    return out;
  }

  // Box that holds every part's centre over the whole loop, plus a margin (for fitting the camera).
  // Returns { min, max } in model coordinates, or null when nothing moves.
  function motionBox(model, motion, samples = 32, margin = 12) {
    if (!motion || !Array.isArray(motion.motions) || !motion.motions.length) return null;
    const objs = (model && model.objects || []).filter((o) => o.type !== 'group' && Array.isArray(o.position));
    const byId = new Map((model.objects || []).map((o) => [o.uuid, o]));
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const L = motion.loop_s > 0 ? motion.loop_s : 1;
    for (let k = 0; k < samples; k++) {
      const pose = poseAt(model, motion, (k / samples) * L);
      for (const o of objs) {
        let q = o.position, guard = 0;
        for (let u = o.uuid; u && guard < 64; u = (byId.get(u) || {}).parent, guard++) if (pose[u]) q = apply(pose[u], q);
        for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], q[i]); max[i] = Math.max(max[i], q[i]); }
      }
    }
    if (!Number.isFinite(min[0])) return null;
    return { min: min.map((v) => v - margin), max: max.map((v) => v + margin) };
  }

  // ---------- checks: issues {severity, message, motion}
  function checkMotion(model, motion) {
    const issues = [];
    const bad = (message, id) => issues.push({ severity: 'reject', message, motion: id || null });
    const warn = (message, id) => issues.push({ severity: 'warning', message, motion: id || null });
    if (!motion || typeof motion !== 'object') { bad('motion is not an object'); return { outcome: 'reject', issues }; }
    if (motion.schema !== SCHEMA) warn(`schema is ${motion.schema}, expected ${SCHEMA}`);
    if (!(motion.loop_s > 0)) bad('loop_s must be a number above 0');
    if (!Array.isArray(motion.motions)) bad('motions must be a list');
    const objects = new Map((model && model.objects || []).map((o) => [o.uuid, o]));
    const ids = new Set();
    const finite = (v) => Number.isFinite(v);
    const vec = (v) => Array.isArray(v) && v.length === 3 && v.every(finite);
    for (const m of motion.motions || []) {
      const id = m && m.id;
      if (!id) bad('a motion has no id');
      else if (ids.has(id)) bad(`duplicate motion id ${id}`, id);
      ids.add(id);
      if (!KINDS.includes(m.kind)) { bad(`unknown kind "${m.kind}"`, id); continue; }
      if (!objects.has(m.target)) warn(`target ${m.target} is not in the model, so it will not move`, id);
      if (m.cycles !== undefined && !(Number.isInteger(m.cycles) && m.cycles >= 1)) bad('cycles must be a whole number, 1 or more, so the loop closes', id);
      if (m.axis !== undefined && !AXES[m.axis]) bad('axis must be x, y or z', id);
      if (m.pivot !== undefined && !vec(m.pivot)) bad('pivot must be [x, y, z] in inches', id);
      if (m.phase !== undefined && !finite(m.phase)) bad('phase must be a number', id);
      if (m.kind === 'swing' && !(finite(m.from) && finite(m.to))) bad('swing needs from and to, in degrees', id);
      if (m.kind === 'bob' && !finite(m.amount)) bad('bob needs amount, in inches', id);
      if (m.kind === 'slide' && !finite(m.distance)) bad('slide needs distance, in inches', id);
      if (m.kind === 'path') {
        if (!Array.isArray(m.points) || m.points.length < 3 || !m.points.every((p) => Array.isArray(p) && p.length >= 2 && p.every(finite))) {
          bad('path needs 3 or more points [x, y] or [x, y, z]; the path always closes on itself', id);
        }
        if (m.profile !== undefined) {
          const pr = m.profile;
          const okPair = (q) => Array.isArray(q) && q.length === 2 && q.every((v) => finite(v) && v >= 0 && v <= 1);
          const mono = Array.isArray(pr) && pr.every((q, i) => okPair(q) && (i === 0 || (q[0] >= pr[i - 1][0] && q[1] >= pr[i - 1][1])));
          if (!mono || pr.length < 2 || pr[0][0] !== 0 || pr[0][1] !== 0 || pr[pr.length - 1][0] !== 1 || pr[pr.length - 1][1] !== 1) {
            bad('profile must be [[t, s], ...] from [0, 0] to [1, 1], both values non-decreasing', id);
          }
        }
      }
      if (m.start && m.start !== 'auto') warn(`start "${m.start}" is not built yet; this motion does not play`, id);
    }
    const outcome = issues.some((i) => i.severity === 'reject') ? 'reject' : issues.length ? 'warn' : 'accept';
    return { outcome, issues };
  }

  return {
    MOTION_SCHEMA: SCHEMA, MOTION_KINDS: KINDS,
    poseAt, checkMotion, pathAt, pathLength, motionBox, warpTime,
    mat4: { identity: I, mul, translate, rotate, about, apply },
  };
});
