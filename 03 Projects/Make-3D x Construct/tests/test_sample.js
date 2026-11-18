// Checks the generated sample is current and clean. Run: node tests/test_sample.js
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const M = require('../js/core/model.js');
const root = path.join(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const history = read('samples/plains-diorama/history.json');
const model = read('samples/plains-diorama/model.json');
const world = read('worlds/plains-diorama-world.json');

const r = M.replay(history, world);
assert.deepStrictEqual(JSON.parse(JSON.stringify(r.model)), model, 'model.json is stale: run node tools/build_sample.js');
assert.strictEqual(M.audit(r).ok, true);
assert(!JSON.stringify(model).includes('null'), 'the model must contain no null');
assert.strictEqual(model.objects.filter(o => o.type !== 'group').every(o => Number.isInteger(o.certainty.percent)), true);
const bundle = fs.readFileSync(path.join(root, 'js/sample_bundle.js'), 'utf8');
assert(bundle.includes(model.history_hash), 'js/sample_bundle.js is stale: run node tools/build_sample.js');
console.log('ok  sample is current, clean and matches the bundle (' + model.objects.length + ' objects, ' + model.flags.length + ' flags)');
