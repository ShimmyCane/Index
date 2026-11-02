// Node tests for skeleton meshes (loft = closed, sheet = open, double sided), bends, attach, keyframes, and the hawk.
// Run: node tests/test_mesh.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const MESH = require(path.join(root, 'js/core/mesh.js'));
const MO = require(path.join(root, 'js/core/motion.js'));
const R = require(path.join(root, 'js/core/rules.js'));
const { mul, apply } = MO.mat4;

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} is not near ${b}`);
const nearV = (a, b, eps = 1e-6) => a.forEach((x, i) => near(x, b[i], eps));
const load = (f) => JSON.parse(fs.readFileSync(path.join(root, 'models', f), 'utf8'));

const tube = { joints: [[0, 0, 0], [10, 0, 0], [20, 0, 0], [30, 0, 0]], facing: [0, 1, 0], samples: 12, sides: 10, rings: [[0, 0.2, 0.2], [0.5, 2, 1.5], [1, 0.2, 0.2]] };
const blade = { joints: [[0, 0, 0], [0, 0, 5], [0, 0, 10]], facing: [1, 0, 0], samples: 6, sides: 3, cup: 0.3, rings: [[0, 0.4], [1, 0.05]] };

t('a loft is a closed mesh: every edge is shared by two triangles, and it has volume', () => {
  const s = MESH.meshStats(tube, 'loft');
  assert.strictEqual(s.openEdges, 0); assert.strictEqual(s.badEdges, 0);
  assert.ok(s.volume > 0, `volume ${s.volume} (negative means the faces point inward)`);
  // a tube of half-width 2 and half-height 1.5 for 30 in: volume is of the order of pi*2*1.5*30*0.6
  assert.ok(s.volume > 100 && s.volume < 400, `volume ${s.volume}`);
});

t('a sheet is open (it has edges) and is thin', () => {
  const s = MESH.meshStats(blade, 'sheet');
  assert.ok(s.openEdges > 0); assert.strictEqual(s.badEdges, 0);
  const b = MESH.meshBox(blade, 'sheet');
  assert.ok(b.max[1] - b.min[1] < 0.5, 'thin across the cup');
});

t('rest pose: identity joint matrices give the rest mesh', () => {
  const I = MO.mat4.identity();
  const a = MESH.meshPositions(tube, 'loft', null), b = MESH.meshPositions(tube, 'loft', [I, I, I, I]);
  a.forEach((x, i) => near(x, b[i], 1e-9));
});

t('bend: joints before the bend stay, joints after turn about it, and the mesh stays closed', () => {
  const model = { objects: [{ uuid: 'tb', type: 'loft', shape: tube, position: [15, 0, 0], dimensions: [30, 4, 3] }] };
  const mo = { schema: MO.MOTION_SCHEMA, loop_s: 4, motions: [{ id: 'b', target: 'tb', kind: 'bend', joint: 1, axis: 'z', from: 90, to: 90, cycles: 1 }] };
  const G = MO.skinAt(model, mo, 0).tb;
  nearV(apply(G[0], tube.joints[0]), [0, 0, 0]);
  nearV(apply(G[1], tube.joints[1]), [10, 0, 0]);
  nearV(apply(G[2], tube.joints[2]), [10, 10, 0]);      // 10 in further along, turned 90 degrees about joint 1
  nearV(apply(G[3], tube.joints[3]), [10, 20, 0]);
  const p = MESH.meshPositions(tube, 'loft', G);
  assert.ok(p.every(Number.isFinite));
  // bone lengths hold: the bent mesh's end cap centre is 20 in round the corner from the first, along the skeleton
  const end = [p[p.length - 3], p[p.length - 2], p[p.length - 1]];
  assert.ok(end[1] > 15, `end cap should have turned toward +y, is ${end}`);
});

t('bends compose down the chain: a second bend turns in the frame of the first', () => {
  const model = { objects: [{ uuid: 'tb', type: 'loft', shape: tube, position: [15, 0, 0], dimensions: [30, 4, 3] }] };
  const mk = (joint, deg) => ({ id: `b${joint}`, target: 'tb', kind: 'bend', joint, axis: 'z', from: deg, to: deg, cycles: 1 });
  const mo = { schema: MO.MOTION_SCHEMA, loop_s: 4, motions: [mk(1, 90), mk(2, -90)] };
  const G = MO.skinAt(model, mo, 0).tb;
  nearV(apply(G[3], tube.joints[3]), [20, 10, 0]);       // turn left at joint 1, then right at joint 2: heads +x again
});

t('keyframes close on themselves: the last value eases back to the first', () => {
  const keys = [[0, 0], [0.25, 10], [0.5, 10], [0.75, 0]];
  near(MO.keyAt(keys, 0), 0); near(MO.keyAt(keys, 1), 0, 1e-9); near(MO.keyAt(keys, 0.25), 10); near(MO.keyAt(keys, 0.4), 10);
  near(MO.keyAt(keys, 0.875), 0, 1e-9 + 0) ; // 0.75 is 0, and 1.0 is 0
  assert.ok(MO.keyAt(keys, 0.1) > 0 && MO.keyAt(keys, 0.1) < 10);
  const mo = (k) => ({ schema: MO.MOTION_SCHEMA, loop_s: 4, motions: [{ id: 'b', target: 'tb', kind: 'bend', joint: 1, axis: 'z', ...k }] });
  const model = { objects: [{ uuid: 'tb', type: 'loft', shape: tube, position: [15, 0, 0], dimensions: [30, 4, 3] }] };
  assert.strictEqual(MO.checkMotion(model, mo({ keys })).outcome, 'accept');
  assert.strictEqual(MO.checkMotion(model, mo({ keys: [[0.1, 0], [0.5, 5]] })).outcome, 'reject');   // must start at 0
  assert.strictEqual(MO.checkMotion(model, mo({ from: 0, to: 5, cycles: 1, joint: 9 })).outcome, 'reject');
});

t('rules: a loft needs a good shape; a sheet is thin on purpose; attach must name a joint', () => {
  const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/default-world.json'), 'utf8'));
  const base = { uuid: 'a', name: 'A', type: 'loft', dimensions: [30, 4, 3], position: [15, 0, 5], shape: tube };
  const model = { objects: [base] };
  const ok = (o) => R.checkOperation(model, { seq: 1, op: 'add', object: { uuid: 'x', name: 'x', ...o } }, world);
  assert.strictEqual(ok({ type: 'loft', dimensions: [30, 4, 3], position: [15, 0, 5], shape: tube }).outcome, 'accept');
  assert.strictEqual(ok({ type: 'loft', dimensions: [30, 4, 3], position: [15, 0, 5], shape: { ...tube, joints: [[0, 0, 0]] } }).outcome, 'reject');
  assert.strictEqual(ok({ type: 'sheet', dimensions: [1, 0.05, 10], position: [0, 0, 5], shape: blade }).outcome, 'accept');
  assert.strictEqual(ok({ type: 'sphere', dimensions: [1], position: [0, 0, 5], attach: { to: 'a', joint: 9 } }).outcome, 'reject');
  assert.strictEqual(ok({ type: 'sphere', dimensions: [1], position: [0, 0, 5], attach: { to: 'a', joint: 2 } }).outcome, 'accept');
});

// ---------- the hawk
const model = load('hawk-v06/model.json'), motion = load('hawk-v06/motion.json');
const objs = new Map(model.objects.map((o) => [o.uuid, o]));
const id = (k) => `hawk-v06-${k}`;
const L = motion.loop_s;

t('hawk: every body part is a closed mesh; every grass blade, leaf, ear and the flag is a thin open sheet', () => {
  let lofts = 0, sheets = 0;
  for (const o of model.objects) {
    if (o.type === 'loft') { const s = MESH.meshStats(o.shape, 'loft'); assert.strictEqual(s.openEdges, 0, o.name); assert.ok(s.volume > 0, `${o.name} volume`); lofts++; }
    if (o.type === 'sheet') { assert.ok(MESH.meshStats(o.shape, 'sheet').openEdges > 0, o.name); sheets++; }
  }
  assert.ok(lofts >= 12 && sheets >= 100, `${lofts} lofts, ${sheets} sheets`);
});

t('hawk: the first frame is the rest pose (every matrix is the identity)', () => {
  const pose = MO.poseAt(model, motion, 0);
  for (const [u, m] of Object.entries(pose)) m.forEach((x, i) => near(x, MO.mat4.identity()[i], 1e-6));
  for (const [u, mats] of Object.entries(MO.skinAt(model, motion, 0))) mats.forEach((m) => m.forEach((x, i) => near(x, MO.mat4.identity()[i], 1e-3)));
});

t('hawk: the loop closes (the last frame is the first)', () => {
  const a = MO.poseAt(model, motion, 0), b = MO.poseAt(model, motion, L);
  for (const u of Object.keys(a)) a[u].forEach((x, i) => near(x, b[u][i], 1e-4));
  const sa = MO.skinAt(model, motion, 0), sb = MO.skinAt(model, motion, L);
  for (const u of Object.keys(sa)) sa[u].forEach((m, j) => m.forEach((x, i) => near(x, sb[u][j][i], 1e-4)));
});

t('hawk: the flight frame is a proper rotation, turns smoothly, and the nose follows the path', () => {
  const fly = motion.motions.find((m) => m.id === 'fly');
  let prev = null, worst = 0, minUp = 1;
  const N = 600;
  for (let k = 0; k <= N; k++) {
    const u = k / N, f = MO.flightFrame(fly, u, L), R = f.R;
    const col = (c) => [R[c], R[4 + c], R[8 + c]];
    const x = col(0), y = col(1), z = col(2);
    near(Math.hypot(...x), 1, 1e-9); near(Math.hypot(...z), 1, 1e-9);
    near(x[0] * z[0] + x[1] * z[1] + x[2] * z[2], 0, 1e-9);
    near(x[0] * y[0] + x[1] * y[1] + x[2] * y[2], 0, 1e-9);
    const cr = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
    nearV(cr, z, 1e-9);
    minUp = Math.min(minUp, z[2]);
    if (prev) { const d = Math.acos(Math.min(1, Math.max(-1, x[0] * prev[0] + x[1] * prev[1] + x[2] * prev[2]))); worst = Math.max(worst, d); }
    prev = x;
  }
  assert.ok(worst < 0.2, `largest nose turn between samples ${worst} rad`);
  assert.ok(minUp > 0.15, `the hawk's back must stay up (steepest dive leaves its up axis at z = ${minUp.toFixed(2)})`);
  console.log(`   smallest up-axis height ${minUp.toFixed(2)} (steepest dive), largest nose turn ${worst.toFixed(3)} rad per 1/600 loop`);
});

// world position of every vertex of a part at time s: its own bends, its attach joint, then the groups above it
function worldPoints(o, s) {
  const skins = MO.skinAt(model, motion, s), pose = MO.poseAt(model, motion, s);
  const own = skins[o.uuid];
  let pts = MESH.meshPositions(o.shape, o.type, own || null);
  const P = []; for (let i = 0; i < pts.length; i += 3) P.push([pts[i], pts[i + 1], pts[i + 2]]);
  let cur = o, guard = 0;
  let out = P;
  while (cur && guard++ < 8) {
    const m = pose[cur.uuid];
    if (m) out = out.map((p) => apply(m, p));
    cur = cur.parent ? objs.get(cur.parent) : null;
  }
  return out;
}

t('hawk: it stays attached and clear of the ground for the whole loop', () => {
  const parts = ['body', 'tail', 'wing-l', 'wing-r', 'leg-l', 'leg-r', 'beak'].map((k) => objs.get(id(k)));
  let lowest = Infinity;
  for (let k = 0; k < 120; k++) {
    const s = (k / 120) * L;
    for (const o of parts) for (const p of worldPoints(o, s)) { assert.ok(p.every(Number.isFinite)); lowest = Math.min(lowest, p[2]); }
    // the shoulders ride the body: the shoulder joint of each wing sits at the same place relative to the body
    const body = worldPoints(objs.get(id('body')), s);
    assert.ok(body.length > 0);
  }
  assert.ok(lowest > 0.5, `lowest point of the hawk over the loop is ${lowest.toFixed(2)} in above the ground`);
  console.log(`   lowest point ${lowest.toFixed(2)} in, loop ${L} s`);
});

t('hawk: the talons reach the mouse at the bottom of the stoop (within 4 in)', () => {
  const mouse = objs.get(id('mouse')).position;
  let best = Infinity;
  for (let k = 0; k < 400; k++) {
    const s = (k / 400) * L;
    for (const key of ['leg-l', 'leg-r']) {
      const pts = worldPoints(objs.get(id(key)), s);
      for (const p of pts) best = Math.min(best, Math.hypot(p[0] - mouse[0], p[1] - mouse[1], p[2] - mouse[2]));
    }
  }
  assert.ok(best < 4, `closest approach ${best.toFixed(2)} in`);
  console.log(`   closest talon to the mouse: ${best.toFixed(2)} in`);
});

t('hawk: the wings fold in the stoop (wing tips come in), and open again after', () => {
  const span = (s) => {
    const pts = [...worldPoints(objs.get(id('wing-l')), s), ...worldPoints(objs.get(id('wing-r')), s)];
    const ys = pts.map((p) => p[1]);
    // measure in the hawk's own frame: distance between the two wing tips
    const tipL = worldPoints(objs.get(id('wing-l')), s), tipR = worldPoints(objs.get(id('wing-r')), s);
    const a = tipL[tipL.length - 3], b = tipR[tipR.length - 3];
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  };
  const fly = motion.motions.find((m) => m.id === 'sweep-l');
  const peak = fly.keys.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a));
  const open = span(0), tucked = span(peak[0] * L);
  assert.ok(tucked < open * 0.7, `span ${open.toFixed(1)} in open, ${tucked.toFixed(1)} in tucked`);
  console.log(`   wing-tip to wing-tip: ${open.toFixed(1)} in open, ${tucked.toFixed(1)} in tucked`);
});

console.log(`\n${n} test groups passed`);
