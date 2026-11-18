// Node tests for the AI review loop: prompts, reply parsing and checks. Run: node tests/test_review.js
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const RV = require('../js/core/review.js');
const RD = require('../js/core/rounds.js');
const M = require('../js/core/model.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }
const story = JSON.parse(fs.readFileSync(path.join(__dirname, '../exhibit/story.json'), 'utf8'));
const run = RD.createRun({});
RD.addDefect(run, { title: 'Horse reads as a dog', criterion: 'identity', severity: 'major' });
const packet = RD.buildPacket(run, { request: 'test' });
const reply = (obj, words) => (words || '') + '\n```json\n' + JSON.stringify(obj) + '\n```\n' + (words ? 'Thanks.' : '');
const scores = { silhouette: 2, proportion: 2, identity: 2, finish: 1 };

test('extractJson reads a fenced reply and a reply with words around it', () => {
  assert.deepStrictEqual(RV.extractJson(reply({ a: 1 })).value, { a: 1 });
  assert.deepStrictEqual(RV.extractJson('Sure! Here it is: {"a": {"b": "}"}} and more words').value, { a: { b: '}' } });
});

test('extractJson reports what it could not read', () => {
  const r = RV.extractJson('no json here at all');
  assert.strictEqual(r.ok, false);
  assert(r.error.includes('no json here'));
  assert.strictEqual(RV.extractJson('').ok, false);
});

test('the critic prompt carries the packet and the reply shape, and nothing else', () => {
  const p = RV.buildCriticPrompt(packet);
  assert(p.includes(RV.CRITIC_SCHEMA));
  assert(p.includes('one JSON object'));
  assert(!p.includes('history'));
});

test('a critic choosing B maps through the packet candidates', () => {
  const pk = Object.assign({}, packet, { candidates: { A: 'current', B: 'best' } });
  assert.strictEqual(RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'A', scores }), pk).verdict, 'won');
  assert.strictEqual(RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'B', scores }), pk).verdict, 'lost');
  assert.strictEqual(RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'tie', scores }), pk).verdict, 'tie');
});

test('a critic reply with a bad choice or a missing score is refused, with reasons', () => {
  const bad = RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'C', scores }), packet);
  assert.strictEqual(bad.ok, false);
  assert(bad.errors.join(' ').includes('better'));
  const noScore = RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'A', scores: { silhouette: 2 } }), packet);
  assert.strictEqual(noScore.ok, false);
  assert(noScore.errors.join(' ').includes('proportion'));
  const outOfRange = RV.parseCriticReply(reply({ schema: RV.CRITIC_SCHEMA, better: 'A', scores: Object.assign({}, scores, { finish: 7 }) }), packet);
  assert.strictEqual(outOfRange.ok, false);
});

test('a critic reply with the wrong schema is refused', () => {
  assert.strictEqual(RV.parseCriticReply(reply({ schema: 'other', better: 'A', scores }), packet).ok, false);
});

test('a fact-check prompt lists every claim id once', () => {
  const p = RV.buildFactcheckPrompt(story);
  story.steps.forEach(s => s.claims.forEach(c => assert(p.includes('"id": "' + c.id + '"'))));
});

test('a fact-check reply must cover every claim exactly once, with a valid status', () => {
  const all = [];
  story.steps.forEach(s => s.claims.forEach(c => all.push({ id: c.id, status: 'unclear', note: 'not sure' })));
  assert.strictEqual(RV.parseFactcheckReply(reply({ schema: RV.FACTCHECK_SCHEMA, claims: all }), story).ok, true);
  const missing = all.slice(1);
  assert(RV.parseFactcheckReply(reply({ schema: RV.FACTCHECK_SCHEMA, claims: missing }), story).errors.join(' ').includes('missing'));
  const badStatus = all.map((c, i) => i === 0 ? Object.assign({}, c, { status: 'probably' }) : c);
  assert(RV.parseFactcheckReply(reply({ schema: RV.FACTCHECK_SCHEMA, claims: badStatus }), story).errors.join(' ').includes('status'));
  const unknown = all.concat([{ id: 'zz', status: 'supported' }]);
  assert(RV.parseFactcheckReply(reply({ schema: RV.FACTCHECK_SCHEMA, claims: unknown }), story).errors.join(' ').includes('zz'));
});

test('round scores must be whole numbers 0 to 3 when given', () => {
  const r = RD.createRun({});
  RD.addDefect(r, { title: 'x', criterion: 'finish', severity: 'minor' });
  assert.strictEqual(RD.recordRound(r, { verdict: 'won', changes: [], scores: { silhouette: 3, proportion: 3, identity: 3, finish: 4 } }).ok, false);
  assert.strictEqual(RD.recordRound(r, { verdict: 'won', changes: [], scores: { silhouette: 3, proportion: 3, identity: 3, finish: 2.5 } }).ok, false);
  assert.strictEqual(RD.recordRound(r, { verdict: 'won', changes: [], scores: { silhouette: 3, proportion: 3, identity: 3, finish: 3 } }).stopped, true);
});

test('a consultation flag must have a known kind; an unknown kind is refused', () => {
  const header = { model_id: 't', name: 'T', units: 'in', up: 'z', world: 'plains-diorama-world' };
  const world = JSON.parse(fs.readFileSync(path.join(__dirname, '../worlds/plains-diorama-world.json'), 'utf8'));
  const base = [{ seq: 1, op: 'add', object: { uuid: 'a', name: 'A', type: 'box', dimensions: { x: 2, y: 2, z: 2 }, position: [0, 0, 1], certainty: { percent: 80, basis: 'inferred' } } }];
  const bad = M.replay({ schema: M.SCHEMA.history, header, operations: base.concat([{ seq: 2, op: 'flag', id: 'F1', kind: 'maybe', target: 'a', text: 'x' }]) }, world);
  assert(bad.diagnostics.some(d => d.code === 'E134'));
  const good = M.replay({ schema: M.SCHEMA.history, header, operations: base.concat([{ seq: 2, op: 'flag', id: 'F1', kind: 'consultation', target: 'a', text: 'Review first.' }]) }, world);
  assert.strictEqual(M.openConsultations(good.model).length, 1);
  const closed = M.replay({ schema: M.SCHEMA.history, header, operations: good.model.objects.length && base.concat([{ seq: 2, op: 'flag', id: 'F1', kind: 'consultation', target: 'a', text: 'Review first.' }, { seq: 3, op: 'flag_close', id: 'F1', note: 'reviewed by a named role on a date' }]) }, world);
  assert.strictEqual(M.openConsultations(closed.model).length, 0);
  assert.strictEqual(closed.model.flags[0].close_note, 'reviewed by a named role on a date');
});

console.log(passed + ' review tests passed');
