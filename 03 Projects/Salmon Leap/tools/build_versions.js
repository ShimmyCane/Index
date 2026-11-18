// Salmon Leap: the statue in five versions, built from one generator (defsFor(v), cumulative).
//
// Growth rule (set by Jimmy, 2026-11-18): V1 starts at 25 to 100 objects. Each later version may grow up to 4x
// in mesh faces or objects, and the growth decays: faces 4x (V2), 3x (V3), 2x (V4), 1.5x (V5). Refining or
// replacing a part may also shrink a count. The build measures both, and the test checks the decay.
//
//   V1 narrative and rough massing     V2 narrative, light, colour, texture, background set-up
//   V3 concept and details, all sides  V4 details increment                   V5 the ground
//
// Run from the project folder: node tools/build_versions.js
// Writes samples/salmon-v0N/{history,model}.json and js/versions_bundle.js. Refuses to write if an audit fails.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const M = require(path.join(root, 'js/core/model.js'));
const { makeList, C } = require('./parts.js');
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/salmon-world.json'), 'utf8'));

// Loft resolution per version: sides round each cross-section, samples cut the length. Faces grow with both.
const DETAIL = {
  1: { sides: 8, samples: 10 },
  2: { sides: 12, samples: 20 },   // about 3.8x the triangles of V1
  3: { sides: 20, samples: 23 },   // about 3x V2 (just under)
  4: { sides: 25, samples: 31 },   // about 2x V3 (just under)
  5: { sides: 30, samples: 32 },   // about 1.5x V4 (just under)
};

// The body's spine, nose last: tail (x -11) to nose (x 10.9). Absolute inches, Z up. The fish moves in the x-z plane.
const SPINE = [[-11.0, 0, 7.6], [-7.0, 0, 10.6], [-3.0, 0, 13.2], [1.0, 0, 14.4], [5.0, 0, 14.1], [8.4, 0, 12.8], [10.9, 0, 10.8]];
// Body cross-sections along the whole spine: [t, w (half-width, sideways), h (half-depth, in the plane)].
const BODY_RINGS = [[0, 0.3, 0.4], [0.08, 0.5, 0.7], [0.2, 1.0, 1.5], [0.38, 1.25, 2.2], [0.55, 1.2, 2.2],
  [0.7, 0.9, 1.5], [0.85, 0.6, 0.9], [0.95, 0.45, 0.6], [1, 0.5, 0.6]];
const TAIL_UP = [[-11.0, 0, 7.6], [-13.4, 0, 9.4], [-15.2, 0, 11.3]];
const TAIL_DOWN = [[-11.0, 0, 7.6], [-13.4, 0, 6.0], [-15.2, 0, 4.2]];
const LOBE_RINGS = [[0, 0.12, 0.6], [0.6, 0.14, 1.1], [1, 0.08, 0.45]];

// The body's radii at a fraction t (0..1) of the whole spine, interpolated from BODY_RINGS.
function bodyRadii(t) {
  if (t <= BODY_RINGS[0][0]) return { w: BODY_RINGS[0][1], h: BODY_RINGS[0][2] };
  for (let i = 1; i < BODY_RINGS.length; i++) {
    if (t <= BODY_RINGS[i][0]) {
      const a = BODY_RINGS[i - 1], b = BODY_RINGS[i];
      const f = (t - a[0]) / (b[0] - a[0]);
      return { w: a[1] + (b[1] - a[1]) * f, h: a[2] + (b[2] - a[2]) * f };
    }
  }
  const last = BODY_RINGS[BODY_RINGS.length - 1];
  return { w: last[1], h: last[2] };
}

// Body segments: each covers a run of spine joints, so one long body becomes four lofts with their own cross-sections.
const BODY_SEGMENTS = [
  { name: 'Body (tail section)', from: 0, to: 2, id: 'body-tail' },
  { name: 'Body (middle)', from: 2, to: 4, id: 'body-middle' },
  { name: 'Body (front)', from: 4, to: 5, id: 'body-front' },
  { name: 'Body (head)', from: 5, to: 6, id: 'body-head' },
];
function segmentRings(seg) {
  const t0 = seg.from / (SPINE.length - 1), t1 = seg.to / (SPINE.length - 1);
  const out = [];
  [0, 1 / 3, 2 / 3, 1].forEach((u) => {
    const r = bodyRadii(t0 + (t1 - t0) * u);
    out.push([round(u), r.w, r.h]);
  });
  return out;
}
const round = (v) => Math.round(v * 100) / 100;

const VERSIONS = [
  { v: 1, label: 'V1', title: 'Narrative and rough massing',
    narrative: 'A salmon leaps up a fall. Against the current the whole body bends into one arc: the tail drives, the head reaches up and forward, the fins spread. The bronze statue stands on a stepped granite base, held by a pillar under the belly and a prop under the tail.' },
  { v: 2, label: 'V2', title: 'Narrative refined; light, colour, texture, background set-up',
    narrative: 'The same leap, told as a single moment: the fish has just left the water. Bronze carries the body; a green patina lies on the fins and the tail, where the light is weakest. A pale wall stands behind, so the arc reads against it.' },
  { v: 3, label: 'V3', title: 'Concept and details; viewed from every side',
    narrative: 'The concept is fixed: a leaping Atlantic salmon, bronze, with its details placed. The eye, the gill cover, the mouth, the small fins and the pelvic fins are shown from every side, so nothing is hidden from the viewer.' },
  { v: 4, label: 'V4', title: 'Details increment',
    narrative: 'The surface now reads as a fish: scales on the body, rays in the tail and the fins, a lateral line along the flank. Each detail is kept small, so the arc still reads first.' },
  { v: 5, label: 'V5', title: 'The ground',
    narrative: 'The statue stands in a shallow pool on a granite slab, with rocks at the edge of the water. The base is in the water; the leap reads as a rise out of it.' },
];

function defsFor(v) {
  const L = makeList();
  const { grp, part, flag } = L;
  const D = DETAIL[v];
  // every loft carries its resolution, so the viewer builds the same faces the counts report
  const loft = (...args) => { const o = L.loftPart(...args); o.detail = { sides: D.sides, samples: D.samples }; return o; };
  const bodyMat = v >= 4 ? 'pattern:scales' : 'bronze';
  const finMat = v >= 2 ? 'patina' : 'bronze';

  grp('statue', 'Leaping salmon (statue)', undefined, 'A bronze Atlantic salmon leaping up. Massing, then details.');
  grp('fish', 'Fish (bronze)', 'statue', 'The body and its fins.');
  grp('base', 'Granite base (stepped)', 'statue', 'Three steps of granite that the fish rises from.');
  grp('supports', 'Supports', 'statue', 'A pillar under the belly and a prop under the tail.');

  // V1: the body in four sections, the tail lobes, the dorsal and the pectoral fins
  BODY_SEGMENTS.forEach((seg) => loft(seg.id, seg.name, 'fish', SPINE.slice(seg.from, seg.to + 1), segmentRings(seg),
    [0, 1, 0], bodyMat, C(70, 'Spindle body: depth about a quarter of the length (Maine DMR, Fishbase).')));

  // tail lobes: one piece in V1; two pieces (root and tip) from V2 on
  const lobe = (name, joints) => {
    if (v >= 2) {
      loft(name + '-root', name + ' (root)', 'fish', joints.slice(0, 2), [[0, 0.12, 0.6], [1, 0.14, 1.0]], [0, 1, 0], finMat, C(60, 'Caudal fin root.'));
      loft(name + '-tip', name + ' (tip)', 'fish', joints.slice(1), [[0, 0.14, 1.0], [1, 0.08, 0.45]], [0, 1, 0], finMat, C(60, 'Caudal fin tip.'));
    } else {
      loft(name, name, 'fish', joints, LOBE_RINGS, [0, 1, 0], finMat, C(60, 'Caudal fin lobe. Forked tail.'));
    }
  };
  lobe('tail-up', TAIL_UP);
  lobe('tail-down', TAIL_DOWN);

  // dorsal fin: one piece in V1; two from V2 on
  if (v >= 2) {
    loft('dorsal-front', 'Dorsal fin (front)', 'fish', [[-4.0, 0, 15.3], [-2.6, 0, 17.6]], [[0, 0.1, 0.7], [1, 0.12, 1.9]], [0, 1, 0], finMat, C(60, 'Dorsal fin, front.'));
    loft('dorsal-back', 'Dorsal fin (back)', 'fish', [[-2.6, 0, 17.6], [-0.9, 0, 16.9]], [[0, 0.12, 1.9], [1, 0.1, 0.35]], [0, 1, 0], finMat, C(60, 'Dorsal fin, back.'));
  } else {
    loft('dorsal', 'Dorsal fin', 'fish', [[-4.0, 0, 15.3], [-2.6, 0, 17.6], [-0.9, 0, 16.9]],
      [[0, 0.1, 0.7], [0.45, 0.12, 1.9], [1, 0.1, 0.35]], [0, 1, 0], finMat, C(60, 'Dorsal fin: steering and balance.'));
  }

  // pectoral fins: one piece each in V1; two each from V2 on
  [1, -1].forEach((s) => {
    const side = s > 0 ? 'right' : 'left', key = 'pectoral-' + (s > 0 ? 'r' : 'l');
    if (v >= 2) {
      loft(key + '-root', 'Pectoral fin ' + side + ' (root)', 'fish', [[3.5, s * 1.0, 12.4], [2.8, s * 2.8, 11.2]],
        [[0, 0.1, 0.9], [1, 0.12, 1.3]], [0, 0, 1], finMat, C(60, 'Pectoral fin root.'));
      loft(key + '-tip', 'Pectoral fin ' + side + ' (tip)', 'fish', [[2.8, s * 2.8, 11.2], [2.2, s * 4.2, 10.3]],
        [[0, 0.12, 1.3], [1, 0.08, 0.45]], [0, 0, 1], finMat, C(60, 'Pectoral fin tip.'));
    } else {
      loft(key, 'Pectoral fin (' + side + ')', 'fish', [[3.5, s * 1.0, 12.4], [2.8, s * 2.8, 11.2], [2.2, s * 4.2, 10.3]],
        [[0, 0.1, 0.9], [0.6, 0.12, 1.3], [1, 0.08, 0.45]], [0, 0, 1], finMat, C(60, 'Pectoral fin: steering, spread out.'));
    }
  });

  // the base: three steps, each built from blocks (V1 onward)
  const steps = [
    { id: 'step-1', size: { x: 16, y: 9, z: 3 }, z: 1.5 },
    { id: 'step-2', size: { x: 10, y: 7, z: 3 }, z: 4.5 },
    { id: 'step-3', size: { x: 5, y: 4.5, z: 2 }, z: 7 },
  ];
  steps.forEach((st) => {
    const blocks = 3, w = st.size.x / blocks;
    for (let b = 0; b < blocks; b++) {
      const x = -st.size.x / 2 + w * (b + 0.5);
      part(st.id + '-block-' + (b + 1), 'Block ' + (b + 1) + ' of ' + st.id, 'box', 'base',
        { x: round(w - 0.1), y: st.size.y, z: st.size.z }, [x, 0, st.z], 'granite', C(80, 'Designed block. Massing.', 'user'));
    }
  });

  // the supports
  part('pillar', 'Pillar under the belly', 'cylinder', 'supports', { x: 1.0, y: 1.0, z: 4.0 }, [0, 0, 9.9], 'bronze', C(80, 'Support pillar, bronze. Its height meets the belly.', 'user'));
  part('pillar-foot', 'Pillar foot', 'box', 'supports', { x: 1.8, y: 1.8, z: 0.5 }, [0, 0, 8.25], 'granite', C(80, 'Foot where the pillar meets the step.', 'user'));
  part('tail-prop', 'Prop under the tail', 'cylinder', 'supports', { x: 0.8, y: 0.8, z: 7.4 }, [-11, 0, 3.7], 'bronze', C(80, 'Tail prop from the ground.', 'user'));
  part('tail-prop-foot', 'Tail prop foot', 'box', 'supports', { x: 1.6, y: 1.6, z: 0.4 }, [-11, 0, 0.2], 'granite', C(80, 'Foot of the tail prop.', 'user'));

  // V2: the background set-up
  if (v >= 2) {
    grp('background', 'Background', 'statue', 'A pale wall behind the arc, so the silhouette reads.');
    part('backdrop', 'Backdrop wall', 'box', 'background', { x: 40, y: 0.5, z: 26 }, [0, 10, 13], 'painted',
      { percent: 100, basis: 'decorative', note: 'Flat wall. Not a finished painting.' });
  }

  // V3: the head details, seen from every side
  if (v >= 3) {
    grp('head', 'Head details', 'fish', 'The eye, the gill cover, the mouth, the adipose and anal fins, the pelvic fins.');
    part('eye-l', 'Eye (left)', 'sphere', 'head', { x: 0.6, y: 0.6, z: 0.6 }, [9.6, -1.0, 12.4], 'dark', C(50, 'Eye, a small dark form.'));
    part('eye-r', 'Eye (right)', 'sphere', 'head', { x: 0.6, y: 0.6, z: 0.6 }, [9.6, 1.0, 12.4], 'dark', C(50, 'Eye, a small dark form.'));
    loft('gill-l', 'Gill cover (left)', 'head', [[7.0, -0.1, 13.5], [8.0, -1.0, 12.6], [8.6, -1.4, 11.4]],
      [[0, 0.1, 0.9], [0.5, 0.12, 1.3], [1, 0.1, 0.6]], [0, 1, 0], 'bronze', C(55, 'Gill cover, an arc on the head.'));
    loft('gill-r', 'Gill cover (right)', 'head', [[7.0, 0.1, 13.5], [8.0, 1.0, 12.6], [8.6, 1.4, 11.4]],
      [[0, 0.1, 0.9], [0.5, 0.12, 1.3], [1, 0.1, 0.6]], [0, 1, 0], 'bronze', C(55, 'Gill cover, the other side.'));
    loft('mouth', 'Mouth', 'head', [[10.2, -0.2, 11.6], [10.9, -0.3, 11.4]], [[0, 0.1, 0.25], [1, 0.08, 0.2]], [0, 1, 0], 'dark', C(50, 'Mouth, the line of the jaw.'));
    loft('adipose', 'Adipose fin', 'head', [[-7.4, 0, 12.1], [-7.0, 0, 12.9], [-6.6, 0, 12.7]],
      [[0, 0.08, 0.3], [1, 0.08, 0.22]], [0, 1, 0], finMat, C(50, 'Small fleshy fin between the dorsal and the tail.'));
    loft('anal', 'Anal fin', 'head', [[-6.2, 0, 8.8], [-5.0, 0, 8.2], [-4.0, 0, 8.4]],
      [[0, 0.08, 0.5], [0.5, 0.1, 0.9], [1, 0.08, 0.35]], [0, 1, 0], finMat, C(55, 'Anal fin, under the body near the tail.'));
    [1, -1].forEach((s) => loft('pelvic-' + (s > 0 ? 'r' : 'l'), 'Pelvic fin (' + (s > 0 ? 'right' : 'left') + ')', 'head',
      [[1.5, s * 1.2, 11.7], [1.8, s * 2.4, 10.8]], [[0, 0.08, 0.5], [1, 0.07, 0.35]], [0, 0, 1], finMat, C(55, 'Pelvic fin, small.')));
  }

  // V4: fin rays and a lateral line
  if (v >= 4) {
    grp('rays', 'Fin rays', 'fish', 'Thin rays in the tail lobes: the structure of the fin.');
    [['up', TAIL_UP], ['down', TAIL_DOWN]].forEach(([name, joints]) => {
      [-0.12, 0.12].forEach((dy, i) => loft('ray-' + name + '-' + (i + 1), 'Ray ' + name + ' ' + (i + 1), 'rays',
        joints.map(p => [p[0], p[1] + dy, p[2]]), [[0, 0.05, 0.3], [1, 0.05, 0.25]], [0, 1, 0], finMat, C(50, 'A fin ray.')));
    });
    loft('lateral-line', 'Lateral line', 'fish', SPINE.slice(1, 6).map(p => [p[0], -1.27, p[2] - 0.4]),
      [[0, 0.05, 0.06], [1, 0.05, 0.06]], [0, 1, 0], 'dark', C(50, 'Lateral line, a thin mark along the flank.'));
  }

  // V5: the ground, the pool, rocks at the edge
  if (v >= 5) {
    grp('ground', 'Ground and pool', 'statue', 'A granite slab, a shallow pool, and rocks at the edge of the water.');
    part('slab', 'Granite slab', 'box', 'ground', { x: 30, y: 22, z: 1 }, [0, 0, 0.5], 'granite', C(80, 'Slab the statue stands on. Its top is the ground.', 'user'));
    part('pool', 'Pool surface', 'box', 'ground', { x: 22, y: 14, z: 0.3 }, [0, 0, 1.15], 'water', C(60, 'Shallow pool. Its depth is not measured.'));
    const rocks = [[-13, -8, 2.2], [12, -7, 1.8], [-12, 7, 2.0], [11, 8, 2.4], [0, -10, 2.0]];
    rocks.forEach(([x, y, r], i) => loft('rock-' + (i + 1), 'Rock ' + (i + 1), 'ground',
      [[x - 0.6, y, 1 + r], [x, y + 0.2, 1 + r], [x + 0.6, y - 0.1, 1 + r]],
      [[0, r * 0.7, r * 0.6], [0.5, r, r * 0.8], [1, r * 0.6, r * 0.5]], [0, 1, 0], 'granite', C(70, 'Rock at the edge of the pool. Shape generic.')));
  }

  return { objects: L.objects, flags: L.flags };
}

// Triangles, approximately: a loft is 2 per quad plus the two caps; primitives use fixed counts.
const PRIM_TRIS = { box: 12, cylinder: 128, cone: 96, sphere: 768 };
function triangles(objects) {
  let t = 0;
  objects.forEach((o) => {
    if (o.type === 'group') return;
    if (o.type === 'loft') {
      const s = o.detail.sides, n = o.detail.samples;
      t += 2 * s * n + 2 * s;
    } else t += PRIM_TRIS[o.type] || 0;
  });
  return t;
}

// Build and check every version. Write nothing if any version fails the audit.
const bundle = [];
const failures = [];
const stats = [];
for (const info of VERSIONS) {
  const { objects, flags } = defsFor(info.v);
  const id = 'salmon-leap-v0' + info.v;
  const header = { model_id: id, name: 'Leaping salmon statue ' + info.label, description: info.title,
    scale: 'statue, about 25 in from tail to nose', units: 'in', up: 'z', world: 'salmon-world' };
  const ops = [];
  let seq = 0;
  const t0 = Date.parse('2026-11-18T10:00:00Z');
  const at = (s) => new Date(t0 + s * 60000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  for (const o of objects) {
    seq++;
    const obj = { uuid: o.uuid, name: o.name, type: o.type };
    ['description', 'parent', 'dimensions', 'position', 'material', 'certainty', 'joints', 'rings', 'facing', 'detail',
      'rotation_x', 'rotation_y', 'rotation_z'].forEach(k => { if (o[k] !== undefined) obj[k] = o[k]; });
    ops.push({ seq, op: 'add', time: at(seq), author: 'jimmy', note: 'add ' + o.name, object: obj });
  }
  for (const f of flags) {
    seq++;
    ops.push({ seq, op: 'flag', time: at(seq), author: 'jimmy', note: 'flag ' + f.id, id: f.id, kind: f.kind, target: f.target, text: f.text });
  }
  const history = { schema: M.SCHEMA.history, header, operations: ops };
  const result = M.replay(history, world);
  const audit = M.audit(result);
  if (result.rejected.length || !audit.ok) {
    failures.push(info.label + ': ' + JSON.stringify(result.rejected) + ' ' +
      result.diagnostics.filter(d => d.severity === 'error' || !d.explained).map(d => d.code + ' ' + d.path + ' ' + d.message).join('; '));
    continue;
  }
  const parts = result.model.objects.filter(o => o.type !== 'group').length;
  const groups = result.model.objects.length - parts;
  const tris = triangles(result.model.objects);
  stats.push({ label: info.label, objects: result.model.objects.length, parts, groups, triangles: tris });
  bundle.push({ id, label: info.label, title: info.title, narrative: info.narrative, history, model: result.model, audit,
    stats: { objects: result.model.objects.length, parts, triangles: tris } });
}
if (failures.length) { console.error('Not written:\n' + failures.join('\n')); process.exit(1); }

// The growth from one version to the next, in triangles and in objects.
bundle.forEach((b, i) => {
  if (i === 0) { b.growth = null; return; }
  const p = bundle[i - 1].stats;
  b.growth = { triangles: round(b.stats.triangles / p.triangles), objects: round(b.stats.objects / p.objects) };
});

for (const b of bundle) {
  const dir = path.join(root, 'samples', b.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'history.json'), JSON.stringify(b.history, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'model.json'), JSON.stringify(b.model, null, 2) + '\n');
  const g = b.growth ? ' · growth ×' + b.growth.triangles + ' triangles, ×' + b.growth.objects + ' objects' : '';
  console.log(b.label + ': ' + b.stats.objects + ' objects (' + b.stats.parts + ' parts), ' + b.stats.triangles + ' triangles' + g + ' · audit ok · ' + b.title);
}
fs.writeFileSync(path.join(root, 'js', 'versions_bundle.js'),
  '// Generated by tools/build_versions.js. Do not edit by hand.\nwindow.SALMON_VERSIONS = ' + JSON.stringify(bundle) + ';\n');
module.exports = { defsFor, VERSIONS, DETAIL, triangles };
