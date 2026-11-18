// Node tests for the engine. Run: node tests/test_model.js
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const M = require('../js/core/model.js');
const root = path.join(__dirname, '..');
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/plains-diorama-world.json'), 'utf8'));
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }
const header = { model_id: 't', name: 'Test', units: 'in', up: 'z', world: 'plains-diorama-world' };
const hist = (ops) => ({ schema: M.SCHEMA.history, header, operations: ops });
const box = (uuid, extra) => Object.assign({ uuid, name: uuid, type: 'box', dimensions: { x: 2, y: 2, z: 2 },
  position: [0, 0, 1], certainty: { percent: 80, basis: 'inferred' } }, extra || {});
const add = (object, seq) => ({ seq: seq || 1, op: 'add', object });
const codes = (r) => r.diagnostics.map(d => d.code);

test('canon sorts keys and hash is stable', () => {
  assert.strictEqual(M.canon({ b: 1, a: [2, { d: 1, c: 0 }] }), '{"a":[2,{"c":0,"d":1}],"b":1}');
  assert.strictEqual(M.fnv1a('abc'), M.fnv1a('abc'));
  assert.notStrictEqual(M.fnv1a('abc'), M.fnv1a('abd'));
});

const sampleHist = JSON.parse(fs.readFileSync(path.join(root, 'samples/plains-diorama/history.json'), 'utf8'));
test('sample replays with no rejected operations and a clean audit', () => {
  const r = M.replay(sampleHist, world);
  assert.deepStrictEqual(r.rejected, []);
  assert.strictEqual(M.audit(r).ok, true);
  assert.strictEqual(M.audit(r).unexplained, 0);
});

test('replay is deterministic: same history, same bytes', () => {
  assert.strictEqual(JSON.stringify(M.replay(sampleHist, world).model), JSON.stringify(M.replay(sampleHist, world).model));
});

test('the model stores the hash of its history', () => {
  const r = M.replay(sampleHist, world);
  assert.strictEqual(r.model.history_hash, M.hashHistory(sampleHist));
});

test('null is refused (E110) and the operation is not applied', () => {
  const r = M.replay(hist([add(box('a', { position: null }))]), world);
  assert(codes(r).includes('E110'));
  assert.strictEqual(r.model.objects.length, 0);
  assert.deepStrictEqual(r.rejected[0].codes, ['E110']);
});

test('a zero or huge dimension is refused (E120)', () => {
  assert(codes(M.replay(hist([add(box('a', { dimensions: { x: 0, y: 2, z: 2 } }))]), world)).includes('E120'));
  assert(codes(M.replay(hist([add(box('b', { dimensions: { x: 999, y: 2, z: 2 } }))]), world)).includes('E120'));
});

test('every solid needs a certainty percent (E123), a whole number 0-100', () => {
  const noCert = box('a'); delete noCert.certainty;
  assert(codes(M.replay(hist([add(noCert)]), world)).includes('E123'));
  assert(codes(M.replay(hist([add(box('b', { certainty: { percent: 101 } }))]), world)).includes('E123'));
  assert(codes(M.replay(hist([add(box('c', { certainty: { percent: 50.5 } }))]), world)).includes('E123'));
});

test('a round cylinder must have y equal to x (E125)', () => {
  const c = box('a', { type: 'cylinder', dimensions: { x: 2, y: 3, z: 2 } });
  assert(codes(M.replay(hist([add(c)]), world)).includes('E125'));
});

test('a modify may only change settable fields (E129)', () => {
  const ops = [add(box('a'), 1), { seq: 2, op: 'modify', uuid: 'a', set: { type: 'sphere' } }];
  assert(codes(M.replay(hist(ops), world)).includes('E129'));
});

test('a modify changes a value and keeps the rest', () => {
  const ops = [add(box('a'), 1), { seq: 2, op: 'modify', uuid: 'a', set: { 'certainty.percent': 90, 'dimensions.x': 4 } }];
  const m = M.replay(hist(ops), world).model;
  assert.strictEqual(m.objects[0].certainty.percent, 90);
  assert.strictEqual(m.objects[0].dimensions.x, 4);
  assert.strictEqual(m.objects[0].dimensions.y, 2);
});

test('a parent must exist and be a group (E112)', () => {
  assert(codes(M.replay(hist([add(box('a', { parent: 'nope' }))]), world)).includes('E112'));
  const ops = [add(box('p'), 1), add(box('a', { parent: 'p' }), 2)];
  assert(codes(M.replay(hist(ops), world)).includes('E112'));
});

test('a group with children cannot be deleted (E113); a leaf can', () => {
  const g = { uuid: 'g', name: 'G', type: 'group' };
  const kids = [add(g, 1), add(box('a', { parent: 'g' }), 2), { seq: 3, op: 'delete', uuid: 'g' }];
  assert(codes(M.replay(hist(kids), world)).includes('E113'));
  const leaf = [add(box('a'), 1), { seq: 2, op: 'delete', uuid: 'a' }];
  assert.strictEqual(M.replay(hist(leaf), world).model.objects.length, 0);
});

test('a flag needs an existing target and a sentence (E130, E133)', () => {
  assert(codes(M.replay(hist([add(box('a'), 1), { seq: 2, op: 'flag', id: 'F1', target: 'zz', text: 'x' }]), world)).includes('E130'));
  assert(codes(M.replay(hist([add(box('a'), 1), { seq: 2, op: 'flag', id: 'F1', target: 'a', text: '' }]), world)).includes('E133'));
});

test('a low-certainty part is a warning until a flag explains it', () => {
  const low = [add(box('a', { certainty: { percent: 30, basis: 'inferred' } }), 1)];
  const bare = M.audit(M.replay(hist(low), world));
  assert.strictEqual(bare.ok, false);
  assert.strictEqual(bare.unexplained, 1);
  const flagged = M.audit(M.replay(hist(low.concat([{ seq: 2, op: 'flag', id: 'F1', target: 'a', text: 'Guess.' }])), world));
  assert.strictEqual(flagged.ok, true);
  assert.strictEqual(flagged.explained, 1);
});

test('a flag on a group explains the warnings of its children', () => {
  const ops = [{ seq: 1, op: 'add', object: { uuid: 'g', name: 'G', type: 'group' } },
    add(box('a', { parent: 'g', certainty: { percent: 10, basis: 'placeholder' } }), 2),
    { seq: 3, op: 'flag', id: 'F1', target: 'g', text: 'Placeholder.' }];
  assert.strictEqual(M.audit(M.replay(hist(ops), world)).ok, true);
});

test('a part below the ground is a warning (W202)', () => {
  const r = M.replay(hist([add(box('a', { position: [0, 0, 0] }))]), world);
  assert(codes(r).includes('W202'));
});

test('sorting by percent and by name is stable and does not change the input', () => {
  const objs = [box('a', { certainty: { percent: 70, basis: 'inferred' } }), box('b', { certainty: { percent: 20, basis: 'placeholder' } })];
  assert.deepStrictEqual(M.sortSolids(objs, 'percent', 'asc').map(o => o.uuid), ['b', 'a']);
  assert.deepStrictEqual(M.sortSolids(objs, 'percent', 'desc').map(o => o.uuid), ['a', 'b']);
  assert.strictEqual(objs[0].uuid, 'a');
});

test('bands read in plain words', () => {
  assert.strictEqual(M.band(95), 'checked');
  assert.strictEqual(M.band(75), 'good');
  assert.strictEqual(M.band(55), 'estimate');
  assert.strictEqual(M.band(30), 'guess');
  assert.strictEqual(M.band(10), 'placeholder');
});

console.log(passed + ' model tests passed');
