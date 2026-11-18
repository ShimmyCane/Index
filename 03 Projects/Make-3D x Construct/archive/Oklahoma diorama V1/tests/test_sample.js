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
const byName = (g) => model.objects.filter(o => o.parent === g).map(o => o.uuid);
// Each existing object is built from its real parts (no filler):
assert.strictEqual(byName('lodge-1').length, 6, 'lodge 1 has a cover, four poles and a door');
assert.strictEqual(byName('lodge-2').length, 6, 'lodge 2 has a cover, four poles and a door');
['horse-1', 'horse-2'].forEach(h => assert.strictEqual(model.objects.filter(o => o.parent === h).length, 12, h + ' has barrel, neck, mane, head, muzzle, two ears, tail and four legs'));
['woman-a', 'woman-b', 'child-a'].forEach(p => assert(model.objects.filter(o => o.parent === p).some(o => o.name === 'Head'), p + ' has a head'));
assert.strictEqual(model.objects.filter(o => o.parent === 'fire-ring').length, 9, 'fire ring: ash and eight stones');
assert.strictEqual(model.objects.filter(o => o.parent === 'tufts').length, 6, 'two back tufts of three blades each');
assert.strictEqual(model.objects.filter(o => o.parent === 'tuft-front').length, 3, 'one front tuft of three blades');
// Three planes, each a group under the root, and the bones in the midground:
['back', 'mid', 'fore'].forEach(g => assert(model.objects.some(o => o.uuid === g && o.type === 'group'), 'plane ' + g + ' exists'));
assert(model.objects.some(o => o.uuid === 'bones' && o.parent === 'mid'), 'bones sit in the midground');
// Figures have a torso, arms, hands, legs and feet, and no face or hair parts:
['woman-a', 'woman-b', 'child-a'].forEach(p => {
  const names = model.objects.filter(o => o.parent === p).map(o => o.name.toLowerCase());
  ['torso', 'arm', 'hand', 'leg', 'foot', 'head'].forEach(k => assert(names.some(n => n.includes(k)), p + ' has a ' + k));
  assert(!names.some(n => n.includes('hair') || n.includes('face')), p + ' has no hair or face parts');
});
const story2 = JSON.parse(fs.readFileSync(path.join(root, 'exhibit/story.json'), 'utf8'));
assert.strictEqual(story2.steps.length, 6, 'the story has six steps');
console.log('ok  each object is built from its real parts; the story has six steps (' + model.objects.length + ' parts)');
