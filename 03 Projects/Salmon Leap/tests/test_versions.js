// Checks the five versions against the growth rule (Jimmy, 2026-11-18):
//   V1 starts at 25 to 100 objects; each later version grows at most 4x in triangles, and the growth decays
//   (4x, then 3x, then 2x, then 1.5x at most). Every version builds and passes the audit.
// Run: node tests/test_versions.js
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const M = require('../js/core/model.js');
const root = path.join(__dirname, '..');
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/salmon-world.json'), 'utf8'));
const { triangles } = require('../tools/build_versions.js');

const tri = [], obj = [];
for (let v = 1; v <= 5; v++) {
  const id = 'salmon-leap-v0' + v;
  const history = JSON.parse(fs.readFileSync(path.join(root, 'samples', id, 'history.json'), 'utf8'));
  const r = M.replay(history, world);
  assert.deepStrictEqual(r.rejected, [], id + ' has rejected operations');
  assert.strictEqual(M.audit(r).ok, true, id + ' fails the audit');
  assert(!JSON.stringify(r.model).includes('null'), id + ' has a null');
  tri.push(triangles(r.model.objects));
  obj.push(r.model.objects.length);
  console.log('ok  V' + v + ': ' + obj[v - 1] + ' objects, ' + tri[v - 1] + ' triangles, audit clean');
}
assert(obj[0] >= 25 && obj[0] <= 100, 'V1 should have 25 to 100 objects, has ' + obj[0]);
const cap = [4, 3, 2, 1.5];
const decay = [];
for (let v = 1; v < 5; v++) {
  const g = tri[v] / tri[v - 1];
  decay.push(Math.round(g * 100) / 100);
  assert(g <= cap[v - 1] + 1e-9, 'V' + (v + 1) + ' grows ×' + g.toFixed(2) + ', more than the limit ×' + cap[v - 1]);
  assert(g >= 1, 'V' + (v + 1) + ' should grow');
}
assert(decay.every((g, i) => i === 0 || g <= decay[i - 1]), 'the growth should decay: ' + decay.join(', '));
console.log('ok  growth in triangles: ×' + decay.join(', ×') + ' (limits ×4, ×3, ×2, ×1.5)');
