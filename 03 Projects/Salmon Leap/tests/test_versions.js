// Checks the five versions: each builds and passes the audit, and each one adds parts (never removes its earlier ones).
// Run: node tests/test_versions.js
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const M = require('../js/core/model.js');
const root = path.join(__dirname, '..');
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/salmon-world.json'), 'utf8'));
const { defsFor } = require('../tools/build_versions.js');

const counts = [];
const names = [];
for (let v = 1; v <= 5; v++) {
  const id = 'salmon-leap-v0' + v;
  const history = JSON.parse(fs.readFileSync(path.join(root, 'samples', id, 'history.json'), 'utf8'));
  const r = M.replay(history, world);
  assert.deepStrictEqual(r.rejected, [], id + ' has rejected operations');
  assert.strictEqual(M.audit(r).ok, true, id + ' fails the audit');
  assert(!JSON.stringify(r.model).includes('null'), id + ' has a null');
  counts.push(r.model.objects.length);
  names.push(new Set(r.model.objects.map(o => o.uuid)));
  console.log('ok  V' + v + ': ' + r.model.objects.length + ' parts, audit clean');
}
for (let v = 1; v < 5; v++) {
  // each version keeps every part of the one before it (V1 and V2 may change a material, not drop a part)
  const earlier = [...names[v - 1]];
  assert(earlier.every(u => names[v].has(u)), 'V' + (v + 1) + ' drops a part from V' + v);
}
assert(counts.every((c, i) => i === 0 || c > counts[i - 1]), 'each version should add parts');
// the build is the same from the same generator
assert.deepStrictEqual(defsFor(5).objects.length, counts[4]);
console.log('ok  versions grow in order and keep their earlier parts');
