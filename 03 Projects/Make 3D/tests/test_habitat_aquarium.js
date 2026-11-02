// Node tests for the Coastal Habitat Aquarium scenes. Run: node tests/test_habitat_aquarium.js
const assert = require('assert');
const path = require('path');
const root = path.join(__dirname, '..');
const G = require(path.join(root, 'js/core/geometry.js'));
const MO = require(path.join(root, 'js/core/motion.js'));
const H = require(path.join(root, 'tools/habitat_aquarium.js'));
const { SCENES } = require(path.join(root, 'tools/scenes.js'));
const { apply } = MO.mat4;
const { HABITAT, COUNTS, depthFt, tunnelDist } = H;
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };

function modelOf(scene) {
  const ops = scene.defs.map(([key, d], i) => ({ seq: i + 1, op: 'add', time: '2026-11-02T00:00:00Z', author: 'test', note: '',
    object: { uuid: `${scene.id}-${key}`, name: d.name, description: d.description || '', type: d.type, dimensions: d.dimensions,
      position: d.position, rotation_y: d.rotation_y || 0, parent: d.parent ? `${scene.id}-${d.parent}` : null, material: d.material || null } }));
  return G.replay({ schema: 'make3d.history/0.1', model_id: scene.id, header: scene.header, operations: ops });
}

t('four increments with object counts near the plan', () => {
  assert.strictEqual(HABITAT.length, 4);
  HABITAT.forEach((s, i) => assert.ok(s.defs.length >= COUNTS[i] * 0.9 && s.defs.length <= COUNTS[i] * 1.6, `H0${i + 1} has ${s.defs.length}, planned about ${COUNTS[i]}`));
});

t('keys are unique and each increment contains the one before (nothing deleted)', () => {
  let prev = null;
  for (const s of HABITAT) {
    const keys = s.defs.map((d) => d[0]);
    assert.strictEqual(new Set(keys).size, keys.length, `${s.id} duplicate keys`);
    if (prev) for (const k of prev) assert.ok(keys.includes(k), `${s.id} lost ${k}`);
    prev = keys;
  }
});

t('the tank is a curved, lobed outline, not a rectangle (the glass panels face many directions)', () => {
  const angles = new Set(HABITAT[0].defs.filter(([k]) => /^glass-/.test(k)).map(([, d]) => Math.round((d.rotation_z || 0) / 10)));
  assert.ok(angles.size >= 12, `only ${angles.size} directions`);
});

t('animals and plants have names and descriptions to read when tapped (H04)', () => {
  for (const [k, d] of HABITAT[3].defs) {
    assert.ok(d.name && d.name.length > 2, `${k} has no name`);
    if (/(sandtiger|zebra|leopard|bonnet|blacktip|seabass|yellowtail|barracuda|sheephead|garibaldi|batray|eagleray|turtle|moray)-\d+-body$/.test(k)) assert.ok(d.description.length > 20, `${k} has no description`);
  }
});

t('H01 and H02 are still; H03 and H04 pass the motion check, start at rest, and close the loop', () => {
  assert.ok(!HABITAT[0].motion && !HABITAT[1].motion);
  HABITAT.slice(2).forEach((s) => {
    const model = modelOf(s), mo = s.motion((k) => `${s.id}-${k}`);
    assert.strictEqual(MO.checkMotion(model, mo).outcome, 'accept', s.id);
    const p0 = MO.poseAt(model, mo, 0), pL = MO.poseAt(model, mo, mo.loop_s);
    for (const id of Object.keys(p0)) p0[id].forEach((x, i) => {
      assert.ok(Math.abs(x - MO.mat4.identity()[i]) < 1e-2, `${s.id} ${id} first frame is not the rest pose`);
      assert.ok(Math.abs(x - pL[id][i]) < 1e-2, `${s.id} ${id} loop does not close`);
    });
  });
});

t('swimmers stay in the water, clear of the rock wall, the floor and the tunnel at every time (H04)', () => {
  const s = HABITAT[3], model = modelOf(s), mo = s.motion((k) => `${s.id}-${k}`), byId = new Map(model.objects.map((o) => [o.uuid, o]));
  const swimmer = /-(sandtiger|zebra|leopard|bonnet|blacktip|seabass|yellowtail|barracuda|sheephead|garibaldi|batray|eagleray|turtle|clown|anchovy|sardine|blacksmith|opaleye|bluetang|yellowtang|sergeant|idol)-?\w*-?\d*(-|$)/;
  const bad = [];
  for (let k = 0; k < 90; k++) {
    const pose = MO.poseAt(model, mo, (k / 90) * mo.loop_s);
    for (const o of model.objects) {
      if (o.type === 'group' || !swimmer.test(o.uuid) || /moray|clown/.test(o.uuid)) continue;
      let q = o.position;
      for (let u = o.uuid, g = 0; u && g < 64; u = (byId.get(u) || {}).parent, g++) if (pose[u]) q = apply(pose[u], q);
      const [x, y, z] = q.map((v) => v / 12);
      const front = depthFt(x, y) < 6.5 && Math.atan2(y, x) < -0.8 && Math.atan2(y, x) > -2.35;
      if (depthFt(x, y) < (front ? 1.5 : 3.2) || z < 1.1 || z > 27.7) bad.push(`${o.uuid} t=${k} depth ${depthFt(x, y).toFixed(1)} z ${z.toFixed(1)}`);
      if (z < 12.6 && tunnelDist(x, y) < 5.4) bad.push(`${o.uuid} t=${k} in the tunnel (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
    }
  }
  assert.strictEqual(bad.length, 0, bad.slice(0, 8).join('\n'));
});

t('the tunnel curves: it is not on one straight line', () => {
  const ys = HABITAT[0].defs.filter(([k]) => /^tunnel-\d+$/.test(k)).map(([, d]) => d.position[1] / 12);
  assert.ok(Math.max(...ys) - Math.min(...ys) > 15);
});

t('scenes.js lists all four habitat increments', () => {
  const ids = SCENES.map((s) => s.id);
  for (let i = 1; i <= 4; i++) assert.ok(ids.includes(`habitat-aquarium-v0${i}`));
});
console.log(`${n} tests passed`);
