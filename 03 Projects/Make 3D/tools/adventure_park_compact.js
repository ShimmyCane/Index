// Adventure Coaster Park, compact and animated: increments V11 to V15, built on the same park as adventure_park.js.
// V11 compacts the footprint to about half the V10 area (about 300 by 250 ft instead of 600 by 400 ft). Rides keep
// their capacity, so the park still handles 1,000 persons an hour. Thunder Trail's lift is lowered to 50 ft to sit
// inside the family-coaster examples (open point in the brief). Then each ride is animated in turn:
//   V12 Pip's cars and Thunder Trail's cars run their tracks.
//   V13 the teacups spin; Bumble River boats drift; Splash Falls boats bob.
//   V14 the Sky Wheel turns (new, a show ride, not counted in capacity); flags wave; balloons bob.
//   V15 the plaza fountain plays in a wave. Every ride now moves.
// Sizes are planning estimates. Feet in, inches out. Z up, ground z = 0. Position = centre of each box.
// Motion is a separate file per version (make3d.motion/0.1), one loop of 24 s. It never changes the model.
//
// One code path per version: defsFor(v). Version N adds a block with "if (v >= N)". Older versions stay reproducible.

const M = require('../js/core/motion.js');

const WORLD_ID = 'adventure-park-world';
const F = 12;                    // inches per foot
const LOOP_S = 24;               // one loop of motion, seconds
const PPH = 1000;                // capacity from V07 on; the Sky Wheel is a show ride and is not counted
const rnd = (n) => Math.round(n * 1000) / 1000;
const DEG = 180 / Math.PI;

const MATERIALS = {
  path: { color: '#f4e7cf', opacity: 1 },
  stone: { color: '#e7e2d6', opacity: 1 },
  track: { color: '#f29a7e', opacity: 1 },
  steel: { color: '#b9c0ca', opacity: 1 },
  car: { color: '#ffc09a', opacity: 1 },
  cup: { color: '#f7d1e0', opacity: 1 },
  water: { color: '#a6e3d7', opacity: 0.9 },
  boat: { color: '#9cc8f0', opacity: 1 },
  wood: { color: '#e2b98f', opacity: 1 },
  roof: { color: '#f7a8a0', opacity: 1 },
  cream: { color: '#fff8e7', opacity: 1 },
  fence: { color: '#fffdf6', opacity: 1 },
  red: { color: '#f08080', opacity: 1 },
  green: { color: '#9ed39a', opacity: 1 },
  leaf: { color: '#8fcf8a', opacity: 1 },
  trunk: { color: '#b98a63', opacity: 1 },
  lamp: { color: '#fff1a8', opacity: 1 },
  flower: { color: '#f6a6c1', opacity: 1 },
  flag: { color: '#ffd36e', opacity: 1 },
  lavender: { color: '#c7b2ea', opacity: 1 },
  mint: { color: '#9fd8c0', opacity: 1 },
  sky: { color: '#bfe3f7', opacity: 0.85 },
};

// Thunder Trail's track in the V10 layout (feet), then scaled into the compact plan.
const TH_SRC = [
  [120, 60, 4], [140, 60, 30], [158, 60, 60], [180, 60, 8], [200, 50, 22], [230, 40, 6], [250, 60, 40],
  [265, 100, 52], [250, 140, 20], [215, 150, 12], [190, 130, 30], [170, 110, 18], [150, 100, 10], [130, 95, 5], [120, 80, 4],
];
const TH_K = 0.55;               // plan scale
const TH_Z = 50 / 60;            // lift lowered from 60 ft to 50 ft
const TH_MAP = (p) => [70 + (p[0] - 192) * TH_K, 62 + (p[1] - 95) * TH_K, Math.max(2, p[2] * TH_Z)];
const TH = TH_SRC.map(TH_MAP);

// The Pip oval, compact: 12 points, 5 to 8 ft high.
const PIP = { cx: -92, cy: -40, rx: 36, ry: 24 };
const PIP_PTS = Array.from({ length: 12 }, (_, k) => {
  const t = (2 * Math.PI * k) / 12;
  return [PIP.cx + PIP.rx * Math.cos(t), PIP.cy + PIP.ry * Math.sin(t), 6 + 2 * Math.sin(2 * t)];
});

const TEA = { x: 74, y: -48 };
const BUMBLE = { x: -68, y: 58 };
const SPLASH = { x: -98, y: 100 };
const SKY = { x: 130, y: -30, z: 36, r: 26 };
const FOUNTAIN = { x: 0, y: 0 };

function defsFor(v) {
  const defs = [];
  const add = (key, def) => defs.push([key, def]);
  const inch = (arr) => arr.map((x) => rnd(x * F));

  const box = (key, name, description, size, at, o = {}) =>
    add(key, { name, description, type: 'box', dimensions: inch(size), position: inch(at), ...o });
  const cyl = (key, name, description, r, h, at, o = {}) =>
    add(key, { name, description, type: 'cylinder', dimensions: inch([r, h]), position: inch(at), ...o });
  const sph = (key, name, description, r, at, o = {}) =>
    add(key, { name, description, type: 'sphere', dimensions: inch([r]), position: inch(at), ...o });
  const cone = (key, name, description, r, h, at, o = {}) =>
    add(key, { name, description, type: 'cone', dimensions: inch([r, h]), position: inch(at), ...o });
  // A thin cylinder from a to b (feet): tilt about X, then turn about Y. See adventure_park.js.
  const rod = (key, name, a, b, r, o = {}) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    const rx = rnd(-Math.asin(dy / len) * DEG), ry = rnd(Math.atan2(dx, dz) * DEG);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    add(key, { name, description: '', type: 'cylinder', dimensions: inch([r, len]), position: inch(mid),
      ...(rx ? { rotation_x: rx } : {}), rotation_y: ry, ...o });
  };
  // Two rails 2 ft apart and a support under each point above 2 ft. Heights are rounded before the centre is set.
  const track = (prefix, pts, parent) => {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1], hl = Math.hypot(dx, dy);
      const px = (-dy / hl), py = (dx / hl);
      rod(`${prefix}-railL-${i}`, `${prefix} rail left ${i + 1}`, [a[0] + px, a[1] + py, a[2]], [b[0] + px, b[1] + py, b[2]], 0.2, { parent, material: 'track' });
      rod(`${prefix}-railR-${i}`, `${prefix} rail right ${i + 1}`, [a[0] - px, a[1] - py, a[2]], [b[0] - px, b[1] - py, b[2]], 0.2, { parent, material: 'track' });
    }
    pts.forEach((p, i) => {
      if (p[2] <= 2) return;
      const hIn = rnd(p[2] * F), zIn = Math.ceil((hIn / 2) * 1000) / 1000;
      cyl(`${prefix}-post-${i}`, `${prefix} support ${i + 1}`, 'steel support', 0.5, hIn / F, [p[0], p[1], zIn / F], { parent, material: 'steel' });
    });
  };
  // A car sitting on the track at point i (car centre 2 ft above the rail), turned to face the next point.
  const carOn = (key, name, pts, i, parent) => {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const heading = rnd(Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG);
    box(key, name, 'a seat car, five seats', [6, 3, 2.5], [a[0], a[1], a[2] + 2], { parent, material: 'car', rotation_z: heading });
  };
  const fence = (prefix, x0, y0, x1, y1, parent, h = 3) => {
    box(`${prefix}-n`, `${prefix} fence north`, 'queue or safety rail', [x1 - x0, 0.5, h], [(x0 + x1) / 2, y1, h / 2], { parent, material: 'fence' });
    box(`${prefix}-s`, `${prefix} fence south`, '', [x1 - x0, 0.5, h], [(x0 + x1) / 2, y0, h / 2], { parent, material: 'fence' });
    box(`${prefix}-w`, `${prefix} fence west`, '', [0.5, y1 - y0, h], [x0, (y0 + y1) / 2, h / 2], { parent, material: 'fence' });
    box(`${prefix}-e`, `${prefix} fence east`, '', [0.5, y1 - y0, h], [x1, (y0 + y1) / 2, h / 2], { parent, material: 'fence' });
  };
  const tree = (key, x, y) => {
    cyl(`${key}-trunk`, 'Tree trunk', '', 0.6, 8, [x, y, 4], { parent: 'scenery', material: 'trunk' });
    sph(`${key}-leaves`, 'Tree crown', 'round crown', 6, [x, y, 12], { parent: 'scenery', material: 'leaf' });
  };

  // ---- groups (parents first)
  const groups = [
    ['gate', 'Entrance', 'the park gate and its sign'],
    ['paths', 'Paths', 'walkways and the plaza'],
    ['pip', "Pip's Little Loop", 'kiddie coaster: oval track, station, two cars'],
    ['bumble', 'Bumble River', 'a gentle boat ride on a short river'],
    ['teacups', 'Teacup Twirl', 'turntable and canopy'],
    ['tea-cups', 'Teacups', 'four cups that spin on the turntable'],
    ['thunder', 'Thunder Trail', 'the adventure family coaster'],
    ['splash', 'Splash Falls', 'log flume with a lift and a splash drop'],
    ['skywheel', 'Sky Wheel', 'show ride: tower and A-frame'],
    ['sky-wheel', 'Sky Wheel wheel', 'the turning wheel with bubble cars'],
    ['safety', 'Safety', 'fences, signs, walkways and stop buttons'],
    ['scenery', 'Scenery', 'trees, benches, lamps and flower beds'],
    ['fountain', 'Plaza fountain', 'a basin and eight jets that play in a wave'],
    ['finish', 'Finishing', 'flags, the park sign and balloons'],
  ];
  for (const [k, n, d] of groups) add(k, { name: n, description: d, type: 'group', dimensions: [], position: [0, 0, 0] });

  // ================= V11 compact footprint (about 300 by 250 ft). Same rides, tighter plan. No motion yet.
  // Gate and paths
  cyl('gate-post-l', 'Gate post left', 'entrance post', 1, 16, [-10, -118, 8], { parent: 'gate', material: 'wood' });
  cyl('gate-post-r', 'Gate post right', 'entrance post', 1, 16, [10, -118, 8], { parent: 'gate', material: 'wood' });
  box('gate-beam', 'Gate beam', 'arch over the path', [24, 2, 2], [0, -118, 16], { parent: 'gate', material: 'wood' });
  box('path-main', 'Main path', 'from the gate to the plaza', [8, 96, 0.3], [0, -70, 0.15], { parent: 'paths', material: 'path' });
  cyl('plaza', 'Plaza', 'round meeting place, 52 ft across', 26, 0.3, [0, 0, 0.15], { parent: 'paths', material: 'path' });
  box('path-west', 'West path', 'to Pip and Bumble River', [120, 8, 0.3], [-86, 0, 0.15], { parent: 'paths', material: 'path' });
  box('path-east', 'East path', 'to the teacups and Thunder Trail', [120, 8, 0.3], [86, 0, 0.15], { parent: 'paths', material: 'path' });

  // Pip's Little Loop
  track('pip', PIP_PTS, 'pip');
  carOn('pip-car-1', 'Pip car 1', PIP_PTS, 0, 'pip');
  carOn('pip-car-2', 'Pip car 2', PIP_PTS, 6, 'pip');
  box('pip-station', 'Pip station', 'low station beside the oval', [16, 10, 10], [PIP.cx, PIP.cy - 34, 5], { parent: 'pip', material: 'cream' });
  box('pip-roof', 'Pip station roof', '', [18, 12, 1], [PIP.cx, PIP.cy - 34, 10.5], { parent: 'pip', material: 'roof' });

  // Bumble River
  box('bumble-water', 'Bumble River water', 'mint water, 1.5 ft deep', [76, 22, 1.5], [BUMBLE.x, BUMBLE.y, 0.75], { parent: 'bumble', material: 'water' });
  box('bumble-station', 'Bumble station', 'boarding house on the bank', [12, 8, 9], [BUMBLE.x, BUMBLE.y - 20, 4.5], { parent: 'bumble', material: 'cream' });

  // Teacup Twirl (static parts; the cups are added with their spin group in V13)
  cyl('tea-platform', 'Teacup platform', 'turntable, 1 ft high', 20, 1, [TEA.x, TEA.y, 0.5], { parent: 'teacups', material: 'stone' });
  cyl('tea-pole', 'Teacup centre pole', 'the spindle the cups turn on', 0.5, 8, [TEA.x, TEA.y, 4], { parent: 'teacups', material: 'steel' });
  cone('tea-roof', 'Teacup roof', 'coral canopy', 14, 5, [TEA.x, TEA.y, 10], { parent: 'teacups', material: 'roof' });

  // Thunder Trail, compact plan with the 50 ft lift
  track('thunder', TH, 'thunder');
  carOn('thunder-car-1', 'Thunder car 1', TH, 12, 'thunder');
  carOn('thunder-car-2', 'Thunder car 2', TH, 13, 'thunder');
  box('thunder-station', 'Thunder station', 'boarding hall', [20, 12, 10], [14, 36, 5], { parent: 'thunder', material: 'cream' });
  box('thunder-motor', 'Lift motor house', 'drives the chain lift', [7, 6, 7], [60, 22, 3.5], { parent: 'thunder', material: 'wood' });

  // Splash Falls, compact: channel, lift and drop at the north-west
  box('splash-water', 'Splash pool', 'channel, 1.5 ft deep', [68, 12, 1.5], [SPLASH.x, SPLASH.y, 0.75], { parent: 'splash', material: 'water' });
  const liftLen = Math.hypot(24, 24), pitch = 45;
  box('splash-lift', 'Flume lift', 'the slope up, 45 degrees', [liftLen, 8, 2], [SPLASH.x - 30, SPLASH.y, 13], { parent: 'splash', material: 'wood', rotation_y: -pitch });
  box('splash-drop', 'Flume drop', 'the drop into the pool, 45 degrees', [liftLen, 8, 2], [SPLASH.x - 6, SPLASH.y, 13], { parent: 'splash', material: 'wood', rotation_y: pitch });
  box('splash-station', 'Flume station', 'boarding house', [24, 12, 10], [SPLASH.x, SPLASH.y + 16, 5], { parent: 'splash', material: 'cream' });

  // Safety, compact
  fence('pip-queue', PIP.cx - 22, PIP.cy - 50, PIP.cx + 22, PIP.cy - 42, 'safety');
  fence('tea-queue', TEA.x - 24, TEA.y - 24, TEA.x + 24, TEA.y + 24, 'safety');
  cyl('pip-sign-post', 'Height sign post', 'stands at the Pip queue', 0.4, 9, [PIP.cx - 40, PIP.cy - 30, 4.5], { parent: 'safety', material: 'steel' });
  box('pip-sign', 'Height sign: 36 in', 'riders under 36 in ride with an adult', [1, 6, 3], [PIP.cx - 40, PIP.cy - 30, 7.5], { parent: 'safety', material: 'cream' });
  box('walkway', 'Emergency walkway', 'a clear route along the south edge', [300, 8, 0.3], [0, -128, 0.15], { parent: 'safety', material: 'path' });

  // Scenery, compact
  [[-130, -110], [-140, 10], [-60, -100], [-20, 96], [30, 110], [140, 100], [-30, -60]].forEach(([x, y], i) => tree(`tree-${i + 1}`, x, y));
  [[-22, 20], [22, 20]].forEach(([x, y], i) => box(`bench-${i + 1}`, `Bench ${i + 1}`, 'wooden bench by the plaza', [6, 2, 2], [x, y, 1], { parent: 'scenery', material: 'wood' }));

  // ================= V12 Pip's cars and Thunder Trail's cars run their tracks (motion file).
  // (The car boxes are the same as V11; the motion moves them along the track.)

  // ================= V13 Teacup Twirl spins; Bumble boats drift; Splash boats bob.
  if (v >= 13) {
    const cupRing = [0, 90, 180, 270].map((deg, i) => {
      const t = (deg * Math.PI) / 180;
      return [TEA.x + 12 * Math.cos(t), TEA.y + 12 * Math.sin(t), 2.5];
    });
    cupRing.forEach((p, i) => cyl(`tea-cup-${i + 1}`, `Teacup ${i + 1}`, 'a cup for two riders', 3.2, 3, p, { parent: 'tea-cups', material: 'cup' }));
    [-82, -68, -54].forEach((x, i) => box(`bumble-boat-${i + 1}`, `Bumble boat ${i + 1}`, 'floats on the river, four seats', [6, 4, 2], [x, BUMBLE.y, 2.5], { parent: 'bumble', material: 'boat' }));
    [-118, -98, -78].forEach((x, i) => box(`splash-boat-${i + 1}`, `Log boat ${i + 1}`, 'floats in the pool, two seats', [6, 4, 2], [x, SPLASH.y, 2.5], { parent: 'splash', material: 'wood' }));
  }

  // ================= V14 the Sky Wheel turns; flags wave; balloons bob.
  if (v >= 14) {
    // Tower and A-frame, static. Hub at SKY.z.
    cyl('sky-tower', 'Sky Wheel tower', 'the post under the hub', 1.2, SKY.z, [SKY.x, SKY.y, SKY.z / 2], { parent: 'skywheel', material: 'steel' });
    rod('sky-frame-l', 'Sky Wheel leg left', [SKY.x - 8, SKY.y, 1.2], [SKY.x, SKY.y, SKY.z], 0.6, { parent: 'skywheel', material: 'steel' });
    rod('sky-frame-r', 'Sky Wheel leg right', [SKY.x + 8, SKY.y, 1.2], [SKY.x, SKY.y, SKY.z], 0.6, { parent: 'skywheel', material: 'steel' });
    // Turning parts: rim, spokes, bubble cars. They spin about the hub, on the y axis (the wheel faces along y).
    const N = 12;
    const rimPts = Array.from({ length: N }, (_, k) => {
      const t = (2 * Math.PI * k) / N;
      return [SKY.x + SKY.r * Math.cos(t), SKY.y, SKY.z + SKY.r * Math.sin(t)];
    });
    rimPts.forEach((p, i) => {
      rod(`sky-rim-${i + 1}`, `Sky Wheel rim ${i + 1}`, p, rimPts[(i + 1) % N], 0.4, { parent: 'sky-wheel', material: 'track' });
      rod(`sky-spoke-${i + 1}`, `Sky Wheel spoke ${i + 1}`, [SKY.x, SKY.y, SKY.z], p, 0.25, { parent: 'sky-wheel', material: 'steel' });
      sph(`sky-car-${i + 1}`, `Bubble car ${i + 1}`, 'a bubble car, two seats', 2.5, p, { parent: 'sky-wheel', material: 'lavender' });
    });
    cyl('sky-hub', 'Sky Wheel hub', 'the axle at the centre', 1.5, 2, [SKY.x, SKY.y, SKY.z], { parent: 'sky-wheel', material: 'steel', rotation_x: 90 });
    // Flags wave by the gate, on poles
    [-18, 18].forEach((x, i) => {
      cyl(`flagpole-${i + 1}`, `Flag pole ${i + 1}`, 'pole by the gate', 0.3, 26, [x, -126, 13], { parent: 'finish', material: 'steel' });
      // The flag hangs off the pole, 3 ft out, and waves about the pole's vertical axis.
      box(`flag-${i + 1}`, `Flag ${i + 1}`, 'pastel flag on the pole', [6, 0.3, 3], [x + 3, -126, 24], { parent: 'finish', material: 'flag' });
    });
    // Balloons on sticks around the plaza
    [[-24, 14], [26, 18], [0, -34]].forEach(([x, y], i) => {
      cyl(`balloon-stick-${i + 1}`, `Balloon stick ${i + 1}`, '', 0.2, 10, [x, y, 5], { parent: 'finish', material: 'steel' });
      sph(`balloon-${i + 1}`, `Balloon ${i + 1}`, 'party balloon', 1.5, [x, y, 11], { parent: 'finish', material: ['lavender', 'mint', 'roof'][i] });
    });
  }

  // ================= V15 plaza fountain plays in a wave. Every ride now moves.
  if (v >= 15) {
    cyl('fountain-basin', 'Fountain basin', 'round basin, 1.5 ft deep', 10, 1.5, [FOUNTAIN.x, FOUNTAIN.y, 0.75], { parent: 'fountain', material: 'water' });
    for (let k = 0; k < 8; k++) {
      const t = (2 * Math.PI * k) / 8;
      sph(`jet-${k + 1}`, `Fountain jet ${k + 1}`, 'a water jet that rises and falls', 1.2,
        [FOUNTAIN.x + 6 * Math.cos(t), FOUNTAIN.y + 6 * Math.sin(t), 3], { parent: 'fountain', material: 'sky' });
    }
  }

  return defs;
}

// ---------- motion (make3d.motion/0.1), one per version. uuid(key) turns a scene key into the object's uuid.
function motionFor(v, uuid) {
  const motions = [];
  const I = (ft) => ft * F;
  const pts = (list) => list.map((p) => [I(p[0]), I(p[1]), I(p[2])]);  // feet -> inches
  // Pip's cars: a closed path round the oval, one lap per loop. The second car starts half way round.
  // Car centres ride 2 ft above the rail, so the paths are lifted by 2 ft to match the car boxes.
  const up2 = (list) => list.map((p) => [p[0], p[1], p[2] + 2]);
  const pipIn = pts(up2(PIP_PTS));
  const thIn = pts(up2(TH));
  const headingDeg = (a, b) => rnd(Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG);
  const carPath = (id, key, list, idx, phase) => {
    const start = M.pathAt(list, phase).point;
    const a = list[idx], b = list[(idx + 1) % list.length];
    return { id, target: uuid(key), kind: 'path', points: list, face: 'tangent',
      pivot: start, rest_heading_deg: headingDeg(a, b), cycles: 1, phase };
  };
  if (v >= 12) {
    motions.push(carPath('pip-car-1-run', 'pip-car-1', pipIn, 0, 0));
    motions.push(carPath('pip-car-2-run', 'pip-car-2', pipIn, 6, 0.5));
    motions.push(carPath('thunder-car-1-run', 'thunder-car-1', thIn, 12, 0));
    motions.push(carPath('thunder-car-2-run', 'thunder-car-2', thIn, 13, 0.5));
  }
  if (v >= 13) {
    motions.push({ id: 'teacups-spin', target: uuid('tea-cups'), kind: 'spin', pivot: [I(TEA.x), I(TEA.y), 0], axis: 'z', cycles: 3 });
    [[-82, 0], [-68, 0.33], [-54, 0.66]].forEach(([x, ph], i) =>
      motions.push({ id: `bumble-boat-${i + 1}-drift`, target: uuid(`bumble-boat-${i + 1}`), kind: 'slide', axis: 'x', distance: I(16), cycles: 1, phase: ph }));
    [0, 0.33, 0.66].forEach((ph, i) =>
      motions.push({ id: `splash-boat-${i + 1}-bob`, target: uuid(`splash-boat-${i + 1}`), kind: 'bob', axis: 'z', amount: I(1.5), cycles: 1, phase: ph }));
  }
  if (v >= 14) {
    motions.push({ id: 'sky-wheel-turn', target: uuid('sky-wheel'), kind: 'spin', pivot: [I(SKY.x), I(SKY.y), I(SKY.z)], axis: 'y', cycles: 2 });
    [-18, 18].forEach((x, i) => {
      motions.push({ id: `flag-${i + 1}-wave`, target: uuid(`flag-${i + 1}`), kind: 'swing', pivot: [I(x), I(-126), I(13)], axis: 'z', from: -18, to: 18, cycles: 2, phase: i * 0.5 });
    });
    [0, 0.33, 0.66].forEach((ph, i) =>
      motions.push({ id: `balloon-${i + 1}-bob`, target: uuid(`balloon-${i + 1}`), kind: 'bob', axis: 'z', amount: I(2), cycles: 1, phase: ph }));
  }
  if (v >= 15) {
    for (let k = 0; k < 8; k++) {
      motions.push({ id: `jet-${k + 1}-wave`, target: uuid(`jet-${k + 1}`), kind: 'bob', axis: 'z', amount: I(3), cycles: 1, phase: k / 8 });
    }
  }
  return { schema: M.MOTION_SCHEMA, model_id: `adventure-park-v${String(v).padStart(2, '0')}`, loop_s: LOOP_S,
    autoplay: { plays: 2 }, motions };
}

function sceneFor(v) {
  const pad = String(v).padStart(2, '0');
  const id = `adventure-park-v${pad}`;
  const scene = {
    id,
    builtin: true,
    header: {
      model_id: id,
      name: `Adventure park V${pad}`,
      description: `Adventure Coaster Park, compact and animated, increment ${v} of 15. Capacity ${PPH} persons per hour. Estimated from published figures, in inches.`,
      units: 'in', up: 'z', world: WORLD_ID,
      materials: MATERIALS,
    },
    defs: defsFor(v),
  };
  if (v >= 12) scene.motion = (uuid) => motionFor(v, uuid);
  return scene;
}

const ADVENTURE_PARK_COMPACT = [11, 12, 13, 14, 15].map(sceneFor);

module.exports = { ADVENTURE_PARK_COMPACT, sceneFor, defsFor, motionFor, PPH };
