// Node tests for the rounds loop. Run: node tests/test_rounds.js
const assert = require('assert');
const R = require('../js/core/rounds.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }
const seed = () => {
  const run = R.createRun({});
  R.addDefect(run, { title: 'Tipi too tall', criterion: 'proportion', severity: 'major' });
  R.addDefect(run, { title: 'Figures read as portraits', criterion: 'identity', severity: 'critical' });
  R.addDefect(run, { title: 'Ridge floats', criterion: 'silhouette', severity: 'minor' });
  R.addDefect(run, { title: 'Dull finish', criterion: 'finish', severity: 'minor' });
  R.addDefect(run, { title: 'Fire ring too flat', criterion: 'proportion', severity: 'minor' });
  return run;
};
const change = (ids) => ids.map(id => ({ ledger_id: id, text: 'changed ' + id }));

test('defaults: four items per round, two rounds without a win, no time or round cap', () => {
  const run = R.createRun({});
  assert.strictEqual(run.settings.max_items_per_round, 4);
  assert.strictEqual(run.settings.stop_after_no_win, 2);
  assert.strictEqual('round_cap' in run.settings, false);
  assert.strictEqual('time_cap' in run.settings, false);
});

test('a defect needs a known criterion and severity', () => {
  const run = R.createRun({});
  assert.strictEqual(R.addDefect(run, { title: 'x', criterion: 'vibes', severity: 'major' }).ok, false);
  assert.strictEqual(R.addDefect(run, { title: 'x', criterion: 'finish', severity: 'huge' }).ok, false);
  assert.strictEqual(R.addDefect(run, { title: 'x', criterion: 'finish', severity: 'minor' }).ok, true);
});

test('a round may not work more than four ledger items; nothing is recorded when refused', () => {
  const run = seed();
  run.ledger.push({ id: 'D6', title: 'extra', criterion: 'finish', severity: 'minor', status: 'open', first_round: 1, attempts: 0 });
  const r = R.recordRound(run, { verdict: 'won', changes: change(['D1', 'D2', 'D3', 'D4', 'D5']) });
  assert.strictEqual(r.ok, false);
  assert(r.errors.join(' ').includes('at most 4'));
  assert.strictEqual(run.rounds.length, 0);
});

test('a known limit is not worked again', () => {
  const run = seed();
  run.ledger[0].status = 'known-limit';
  assert.strictEqual(R.recordRound(run, { verdict: 'won', changes: change(['D1']) }).ok, false);
});

test('every change needs a text', () => {
  const run = seed();
  assert.strictEqual(R.recordRound(run, { verdict: 'won', changes: [{ ledger_id: 'D1', text: '' }] }).ok, false);
});

test('a won round is kept: it becomes the best and its items are fixed', () => {
  const run = seed();
  const r = R.recordRound(run, { verdict: 'won', changes: change(['D1', 'D2']), scores: { silhouette: 2, proportion: 2, identity: 1, finish: 2 } });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(run.best_round, 1);
  assert.strictEqual(run.rounds[0].kept, true);
  assert.strictEqual(run.ledger[0].status, 'fixed');
  assert.strictEqual(run.no_win, 0);
});

test('a lost round is reverted: the best stays, the item stays open', () => {
  const run = seed();
  R.recordRound(run, { verdict: 'won', changes: change(['D1']) });
  R.recordRound(run, { verdict: 'lost', changes: change(['D3']) });
  assert.strictEqual(run.best_round, 1);
  assert.strictEqual(run.rounds[1].kept, false);
  assert.strictEqual(run.ledger[2].status, 'open');
});

test('two rounds in a row that do not beat the best stop the run', () => {
  const run = seed();
  R.recordRound(run, { verdict: 'lost', changes: change(['D1']) });
  assert.strictEqual(run.status, 'running');
  const r = R.recordRound(run, { verdict: 'tie', changes: change(['D2']) });
  assert.strictEqual(r.stopped, true);
  assert.strictEqual(run.status, 'stopped');
  assert(run.stop_reason.includes('2 rounds in a row'));
  assert.strictEqual(R.recordRound(run, { verdict: 'won', changes: change(['D3']) }).ok, false);
});

test('a win resets the count of rounds without a win', () => {
  const run = seed();
  R.recordRound(run, { verdict: 'lost', changes: change(['D1']) });
  R.recordRound(run, { verdict: 'won', changes: change(['D1']) });
  assert.strictEqual(run.no_win, 0);
  assert.strictEqual(run.status, 'running');
});

test('every criterion at the top score stops the run', () => {
  const run = seed();
  const r = R.recordRound(run, { verdict: 'won', changes: change(['D1']), scores: { silhouette: 3, proportion: 3, identity: 3, finish: 3 } });
  assert.strictEqual(r.stopped, true);
  assert.strictEqual(run.stop_reason, 'every criterion is at the top score');
});

test('a defect worked three times without progress becomes a known limit', () => {
  const run = seed();
  // Wins in between keep the run going (two losses in a row would stop it).
  assert.strictEqual(R.recordRound(run, { verdict: 'lost', changes: change(['D3']) }).ok, true);
  assert.strictEqual(R.recordRound(run, { verdict: 'won', changes: change(['D1']) }).ok, true);
  assert.strictEqual(R.recordRound(run, { verdict: 'lost', changes: change(['D3']) }).ok, true);
  assert.strictEqual(R.recordRound(run, { verdict: 'won', changes: change(['D2']) }).ok, true);
  assert.strictEqual(R.recordRound(run, { verdict: 'lost', changes: change(['D3']) }).ok, true);
  assert.strictEqual(run.ledger[2].attempts, 3);
  assert.strictEqual(run.ledger[2].status, 'known-limit');
});

test('the round cap is off unless set, and stops the run when set', () => {
  const run = R.createRun({ round_cap: 1 });
  R.addDefect(run, { title: 'x', criterion: 'finish', severity: 'minor' });
  const r = R.recordRound(run, { verdict: 'won', changes: [{ ledger_id: 'D1', text: 'changed' }] });
  assert.strictEqual(r.stopped, true);
  assert(run.stop_reason.includes('round cap'));
});

test('the packet carries renders and open defects only, never the history or notes', () => {
  const run = seed();
  R.recordRound(run, { verdict: 'won', changes: change(['D1']), note: 'secret reasoning' });
  const p = R.buildPacket(run, { request: 'A plains camp diorama' });
  const text = JSON.stringify(p);
  assert(!text.includes('secret reasoning'));
  assert(!text.includes('changed D1'));
  assert.deepStrictEqual(p.views, ['front', 'side', 'top', 'oblique']);
  assert.strictEqual(p.open_defects.length, 4);
  assert.deepStrictEqual(R.buildPacket(run, {}).candidates, p.candidates);
});

test('the report names the rounds, the kept round and any known limits', () => {
  const run = seed();
  run.ledger[2].status = 'known-limit';
  R.recordRound(run, { verdict: 'won', changes: change(['D1']) });
  const text = R.report(run);
  assert(text.includes('Round 1: won (kept)'));
  assert(text.includes('Known limits: D3'));
});

console.log(passed + ' rounds tests passed');
