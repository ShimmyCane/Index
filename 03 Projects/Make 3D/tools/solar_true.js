// Solar System V06: true orbits. Sources: 04 AI/Make 3D/research/solar-system-true.md (JPL approximate positions).
//
// What is true here:
//   - each orbit's shape (eccentricity), tilt (inclination), and where it crosses the plane (node, perihelion)
//   - each planet's place on its orbit on the start date (2026-11-02), from its mean longitude at J2000
//   - the direction and the speed of each orbit and spin (a negative spin turns the other way: Venus, Uranus, Pluto)
//   - the asteroid belt: each rock has its own orbit, from a fixed pattern (not real asteroid positions)
// What is scaled:
//   - distances: each orbit is scaled by K / sqrt(a), so the inner planets are not crowded and Pluto still fits.
//     The shape is kept exactly; only the size changes. Planet sizes are kept rough, as in V01 to V05.
//   - time: the animation is ONE lap of Pluto (90,560 days) in 240 s. It does not loop: it plays once and holds.
//     Faster bodies lap many times, and their positions simply follow their true orbits.
//   - spins are whole turns per the one lap, so Jupiter's spin can look like flicker at this pace.
// Units: inches, Z up. The ecliptic (Earth's orbit plane) is the z = 0 plane.
//
// The motion file (make3d.motion/0.1) uses kind "orbit" (js/core/motion.js orbitPosition) with loop: false.
// Build: node tools/build_samples.js.

const M = require('../js/core/motion.js');
const SS = require('./solar_system.js');
const PV = require('./planet_views.js');

const WORLD_ID = 'solar-system-world';
const K = 120;                       // model inches for sqrt(AU): a_model = K * sqrt(a_AU)
const LOOP_S = 240;                  // one Pluto lap, seconds
const SPAN_DAYS = 90560;             // Pluto's orbital period (the slowest body), days
const START = '2026-11-02';          // the date the planets are placed on (00:00 UTC)
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const DAY_MS = 86400000;
const DEG = 180 / Math.PI;
const rnd = (n) => Math.round(n * 1000) / 1000;

// JPL approximate Keplerian elements, J2000 (Standish). a AU, e, inc/node/peri in degrees, L mean longitude
// in degrees, period in days, rot = sidereal spin in days (negative = retrograde). Approximate to about a degree.
const ELEMENTS = {
  mercury: { a: 0.38710, e: 0.20563, inc: 7.005, node: 48.331, peri: 29.124, L: 252.251, period: 87.969, rot: 58.646 },
  venus: { a: 0.72333, e: 0.00677, inc: 3.395, node: 76.680, peri: 54.884, L: 181.979, period: 224.701, rot: -243.025 },
  earth: { a: 1.00000, e: 0.01671, inc: 0.00005, node: 348.739, peri: 114.208, L: 100.464, period: 365.256, rot: 0.99727 },
  mars: { a: 1.52371, e: 0.09340, inc: 1.850, node: 49.558, peri: 286.502, L: 355.453, period: 686.980, rot: 1.02596 },
  jupiter: { a: 5.20288, e: 0.04839, inc: 1.303, node: 100.464, peri: 273.867, L: 34.404, period: 4332.59, rot: 0.41354 },
  saturn: { a: 9.53667, e: 0.05386, inc: 2.485, node: 113.666, peri: 339.392, L: 49.944, period: 10759.22, rot: 0.44401 },
  uranus: { a: 19.18916, e: 0.04726, inc: 0.773, node: 74.006, peri: 96.998, L: 313.232, period: 30688.5, rot: -0.71833 },
  neptune: { a: 30.06992, e: 0.00859, inc: 1.770, node: 131.784, peri: 276.336, L: 304.880, period: 60182, rot: 0.67125 },
  pluto: { a: 39.48211, e: 0.24883, inc: 17.142, node: 110.303, peri: 113.834, L: 238.929, period: 90560, rot: -6.387 },
};
const SUN_ROT = 25.38;               // days, the Sun's equator

const startDays = (Date.parse(START + 'T00:00:00Z') - J2000_MS) / DAY_MS;   // days from J2000 to the start date

// Mean anomaly at the start: M = L - (node + peri) at J2000, advanced by the mean motion to the start date.
function startM0(el) {
  const M2000 = el.L - (el.node + el.peri);
  return (((M2000 + (360 * startDays) / el.period) % 360) + 360) % 360;
}
// The motion-engine orbit for a body with these elements. a is in inches (scaled).
function orbitOf(el) {
  return { a: rnd(K * Math.sqrt(el.a)), e: el.e, inc_deg: el.inc, node_deg: el.node, peri_deg: el.peri,
    M0_deg: rnd(startM0(el)), period_days: el.period, span_days: SPAN_DAYS };
}
// Where it is at the start (the rest pose), in inches. Same formula the viewer uses, so rest matches motion.
const restPos = (el) => M.orbitPosition(orbitOf(el), 0);

// Points along the orbit, for the one-pixel orbit line: N points, evenly in eccentric anomaly.
function orbitRing(el, N = 72) {
  const o = orbitOf(el), out = [];
  for (let k = 0; k < N; k++) {
    const E = (2 * Math.PI * k) / N;
    const xp = o.a * (Math.cos(E) - el.e), yp = o.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    const O = el.node / DEG, w = el.peri / DEG, i = el.inc / DEG;
    const cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
    out.push([
      (cO * cw - sO * sw * ci) * xp + (-cO * sw - sO * cw * ci) * yp,
      (sO * cw + cO * sw * ci) * xp + (-sO * sw + cO * cw * ci) * yp,
      (sw * si) * xp + (cw * si) * yp,
    ]);
  }
  return out;
}

// One-pixel orbit line: a box along each chord, turned to follow the orbit in 3D.
// Box rotation: rotation_z then rotation_y (x is the box's long side; the viewer composes Z*Y*X).
function orbitLineDefs(key, name, el) {
  const pts = orbitRing(el), N = pts.length, out = [];
  out.push([`orbit-line-${key}`, { name: `${name} orbit line`, description: 'the true path, drawn as one-pixel boxes', type: 'group', dimensions: [], position: [0, 0, 0] }]);
  for (let k = 0; k < N; k++) {
    const a = pts[k], b = pts[(k + 1) % N];
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(...d), u = d.map((v) => v / len);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const ry = Math.asin(-u[2]) * DEG, rz = Math.atan2(u[1], u[0]) * DEG;
    out.push([`line-${key}-${k}`, { name: `${name} orbit line ${k + 1}`, description: '', type: 'box', dimensions: [rnd(len * 1.12), 0.9, 0.9],
      position: [rnd(mid[0]), rnd(mid[1]), rnd(mid[2])], rotation_y: rnd(ry), rotation_z: rnd(rz), material: 'orbit', parent: `orbit-line-${key}` }]);
  }
  return out;
}

// Belt: 160 rocks, each on its own orbit from a fixed pattern (golden-ratio spread, so no randomness).
const BELT_N = 160;
function beltEl(i) {
  const f = (x) => x - Math.floor(x);
  return { a: 2.2 + 1.1 * f(i * 0.618034), e: 0.02 + 0.12 * f(i * 0.381966), inc: 0.5 + 9 * f(i * 0.137),
    node: f(i * 0.618034 + 0.31) * 360, peri: f(i * 0.754877) * 360, L: f(i * 0.2296) * 360, period: Math.pow(2.2 + 1.1 * f(i * 0.618034), 1.5) * 365.25 };
}

function trueDefs() {
  const defs = [];
  defs.push(['sun', { name: 'Sun', description: 'the star at the centre (stylised size)', type: 'sphere', dimensions: [40], position: [0, 0, 0], material: 'sun' }]);
  defs.push(['corona', { name: 'Sun glow', description: 'a faint glow round the Sun (taps pass through it)', type: 'sphere', dimensions: [48], position: [0, 0, 0], material: 'corona' }]);
  for (const key of SS.ORDER) {
    const el = ELEMENTS[key], p = SS.PLANETS[key];
    const c = restPos(el);
    defs.push(...orbitLineDefs(key, p.name, el));
    defs.push([`orbit-${key}`, { name: `${p.name} orbit`, description: 'the true orbit: shape, tilt and place', type: 'group', dimensions: [], position: [0, 0, 0] }]);
    // Tapping the ball opens the planet's own view (zoom). Its view is the newest version of that planet.
    defs.push(...SS.bodyDefs(key, p, c, `orbit-${key}`, 5, { link: `${PV.latestId(key)}:zoom` }));
  }
  const rocks = [];
  for (let i = 0; i < BELT_N; i++) {
    const el = beltEl(i), c = restPos(el);
    rocks.push([`rock-${i}`, { name: `Asteroid ${i + 1}`, description: 'one rock on its own orbit (pattern, not a real asteroid)', type: 'sphere', dimensions: [rnd(0.8 + 1.6 * ((i * 0.37) % 1))],
      position: [rnd(c[0]), rnd(c[1]), rnd(c[2])], material: i % 3 === 0 ? 'rock2' : 'rock' }]);
  }
  defs.push(['belt', { name: 'Asteroid belt', description: 'rocks between Mars and Jupiter, each on its own orbit', type: 'group', dimensions: [], position: [0, 0, 0] }]);
  for (const r of rocks) defs.push([r[0], { ...r[1], parent: 'belt' }]);
  return defs;
}

function trueMotion(uuid, id) {
  const list = [];
  for (const key of SS.ORDER) {
    const el = ELEMENTS[key], p = SS.PLANETS[key];
    list.push({ id: `${key}-orbit`, target: `orbit-${key}`, kind: 'orbit', ...orbitOf(el) });
    list.push({ id: `${key}-spin`, target: `body-${key}`, kind: 'spin', axis: p.spinAxis || 'z', pivot: restPos(el), cycles: rnd(SPAN_DAYS / el.rot) });
  }
  list.push({ id: 'sun-spin', target: 'sun', kind: 'spin', axis: 'z', pivot: [0, 0, 0], cycles: rnd(SPAN_DAYS / SUN_ROT) });
  for (let i = 0; i < BELT_N; i++) {
    const el = beltEl(i);
    list.push({ id: `rock-${i}-orbit`, target: `rock-${i}`, kind: 'orbit', ...orbitOf(el) });
  }
  return {
    schema: M.MOTION_SCHEMA,
    model_id: id,
    name: 'True orbits, one lap of Pluto',
    description: `Every orbit is true (shape, tilt and place on ${START}). The animation is one lap of Pluto (about 248 years) in ${LOOP_S} s. It plays once and holds; faster bodies lap many times, so their spins and orbits blur at this pace.`,
    units: 'in', up: 'z',
    loop_s: LOOP_S,
    loop: false,
    timeline: { start_date: START, span_days: SPAN_DAYS, note: 'one lap of Pluto around the Sun' },
    autoplay: { plays: 1 },
    motions: list.map((m) => ({ ...m, target: uuid(m.target) })),
  };
}

function sceneTrue() {
  const id = 'solar-system-v06';
  return {
    id,
    builtin: true,
    project: 'Solar System',
    header: {
      model_id: id,
      name: 'Solar System V06',
      description: `Solar System, increment 6 of 6: true orbits. Shape, tilt and place are true for ${START}; the planets are scaled by the square root of their distance and sized roughly. One lap of Pluto plays once. Tap a planet to open its own view.`,
      units: 'in', up: 'z', world: WORLD_ID,
      materials: SS.MATERIALS,
    },
    defs: trueDefs(),
    motion: (uuid) => trueMotion(uuid, id),
  };
}

const SOLAR_TRUE = sceneTrue();
module.exports = { SOLAR_TRUE, ELEMENTS, START, SPAN_DAYS, LOOP_S, restPos, orbitOf, beltEl, BELT_N };
