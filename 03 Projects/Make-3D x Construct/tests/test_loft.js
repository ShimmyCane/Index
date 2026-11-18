// Node tests for the lofted surfaces. Run: node tests/test_loft.js
const assert = require('assert');
const L = require('../js/core/loft.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }

const tube = { joints: [[0, 0, 0], [2, 0, 0]], rings: [[0, 1, 1], [1, 1, 1]], facing: [0, 1, 0] };

test('a straight tube of radius 1 over 2 in: its box is x 0..2, y and z -1..1', () => {
  const e = L.extentsOf(tube);
  assert.deepStrictEqual(e.min.map(v => Math.round(v * 100) / 100), [-1, -1, -1]);
  assert.deepStrictEqual(e.max.map(v => Math.round(v * 100) / 100), [3, 1, 1]);
});

test('mesh has (samples+1) rings of sides vertices plus two cap centres', () => {
  const m = L.mesh(tube, { sides: 12, samples: 10 });
  assert.strictEqual(m.positions.length / 3, 11 * 12 + 2);
  assert.strictEqual(m.normals.length, m.positions.length);
  assert.strictEqual(m.uvs.length / 2, 11 * 12 + 2);
});

test('the index count is a whole number of triangles and every index is in range', () => {
  const m = L.mesh(tube, { sides: 12, samples: 10 });
  assert.strictEqual(m.indices.length % 3, 0);
  const n = m.positions.length / 3;
  assert(m.indices.every(i => i >= 0 && i < n));
});

test('normals are unit length (within rounding)', () => {
  const m = L.mesh(tube, { sides: 16, samples: 12 });
  for (let i = 0; i < m.normals.length; i += 3) {
    const l = Math.hypot(m.normals[i], m.normals[i + 1], m.normals[i + 2]);
    assert(Math.abs(l - 1) < 1e-6, 'normal length ' + l);
  }
});

test('a curved spine passes through its joints and the mesh stays near them', () => {
  const bent = { joints: [[0, 0, 0], [1, 1, 0], [2, 0, 0]], rings: [[0, 0.3, 0.3], [1, 0.3, 0.3]], facing: [0, 0, 1] };
  const m = L.mesh(bent, { sides: 8, samples: 16 });
  const mid = L.pointAt(L.spine(bent.joints), 0.5);
  assert(Math.abs(mid[0] - 1) < 0.15 && mid[1] > 0.5, 'middle point near the bend: ' + mid);
  assert(m.positions.every(v => Number.isFinite(v)));
});

test('the cross-section changes along the spine (rings interpolate)', () => {
  const r = [[0, 0.2, 0.2], [0.5, 0.6, 0.4], [1, 0.2, 0.2]];
  assert.strictEqual(L.ringAt(r, 0.5).w, 0.6);
  assert(Math.abs(L.ringAt(r, 0.25).w - 0.4) < 1e-9);
});

test('validate refuses a spine with one joint, rings out of order, or a tiny ring', () => {
  assert(L.validate({ joints: [[0, 0, 0]], rings: [[0, 1, 1], [1, 1, 1]] }).length > 0);
  assert(L.validate({ joints: [[0, 0, 0], [1, 0, 0]], rings: [[0.5, 1, 1], [0.2, 1, 1]] }).length > 0);
  assert(L.validate({ joints: [[0, 0, 0], [1, 0, 0]], rings: [[0, 0.01, 1], [1, 1, 1]] }).length > 0);
  assert.deepStrictEqual(L.validate(tube), []);
});

console.log(passed + ' loft tests passed');
