// Engine tests in plain Node (no browser). Usage: node tools/test_engine.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// Load the engine the same way the page does: each file adds to globalThis.SS.
const localStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k)
};
['template', 'recommend', 'draft', 'decisions', 'flags', 'import', 'outputs', 'store']
  .forEach((f) => require(path.join(ROOT, 'js', f + '.js')));
const SS = globalThis.SS;
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const data = {
  drivers: read('data/drivers.json'),
  survey: read('data/survey.json'),
  keywords: read('data/keywords.json'),
  rules: read('data/rules.json'),
  uniformat: read('data/uniformat.json'),
  sections: read('data/sections/index.json'),
  templates: { '_demo.json': read('data/sections/_demo.json') },
  sample: read('samples/sketch-project.json')
};
SS.store.data = data;

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok   ' + name); }
  catch (e) { console.log('FAIL ' + name + '\n     ' + e.message); process.exitCode = 1; }
}

function fresh() {
  const p = JSON.parse(JSON.stringify(SS.store.create ? newProject() : {}));
  return p;
}
function newProject() {
  return { format: 'shimmy-state/1', id: 't', name: 'T', kind: 'sketch', seq: 0, answers: {}, choices: {},
    sections: {}, keynotes: [], keywordHits: [], decisions: [], flags: [], edits: {}, extra: {}, importReport: null };
}
function withSample() {
  const p = newProject();
  SS.importer.applyFile(p, read('samples/sketch-project.json'), data);
  p.keywordHits = SS.importer.textHits(read('samples/sketch-project.json').text_dump, data).map((h) => Object.assign(h, { status: 'accepted' }));
  return p;
}

// ---- conditions -------------------------------------------------------------
test('evalWhen: all / any / not and question=option', () => {
  const ctx = { drivers: new Set(['a', 'b']), answers: { q: 'x' } };
  assert.ok(SS.template.evalWhen(undefined, ctx));
  assert.ok(SS.template.evalWhen({ all: ['a', 'b'] }, ctx));
  assert.ok(!SS.template.evalWhen({ all: ['a', 'c'] }, ctx));
  assert.ok(SS.template.evalWhen({ any: ['z', 'b'] }, ctx));
  assert.ok(!SS.template.evalWhen({ any: ['z'] }, ctx));
  assert.ok(!SS.template.evalWhen({ not: ['a'] }, ctx));
  assert.ok(SS.template.evalWhen({ all: ['q=x'] }, ctx));
  assert.ok(!SS.template.evalWhen({ all: ['q=y'] }, ctx));
  assert.ok(SS.template.evalWhen({ all: [] }, ctx));
});

// ---- recommender ------------------------------------------------------------
test('recommend: required sections appear with no answers', () => {
  const rows = SS.recommend.recommend(newProject(), data);
  const req = rows.filter((r) => r.level === 'required').map((r) => r.number);
  assert.ok(req.includes('01 10 00'));
  assert.ok(req.includes('01 25 00'));
});

test('recommend: Type IIB masonry repair gives the expected levels and reasons', () => {
  const p = withSample();
  const rows = SS.recommend.recommend(p, data);
  const byNum = Object.fromEntries(rows.map((r) => [r.number, r]));
  assert.strictEqual(byNum['04 01 20'].level, 'required', 'keynote 04 01 20.A1 makes it required');
  assert.strictEqual(byNum['06 10 53'].level, 'consider', 'Type IIB is noncombustible: consider, not likely');
  assert.strictEqual(byNum['07 54 23'].level, 'required', 'keynote makes it required');
  assert.ok(byNum['06 10 53'].reasons.length >= 1);
});

test('recommend: scope-repair with no interior repair gives unlikely for interior flooring', () => {
  const p = newProject();
  p.answers.scope = ['repair'];
  const rows = SS.recommend.recommend(p, data);
  const floor = rows.find((r) => r.number === '09 65 00');
  assert.ok(floor && floor.level === 'unlikely');
});

// ---- drivers and cascade ----------------------------------------------------
test('drivers: survey answers and accepted text hits add drivers', () => {
  const p = withSample();
  const d = SS.recommend.drivers(p, data);
  assert.ok(d.has('construction-type-IIB'));
  assert.ok(d.has('repair-masonry'));
  assert.ok(!d.has('use-A'));
});

test('drivers: cascade from a chosen demo option reaches the book', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  p.choices['00 00 00'] = { thk: '080' };
  assert.ok(SS.recommend.drivers(p, data).has('long-life'));
});

// ---- draft ------------------------------------------------------------------
test('draft: hidden paragraphs leave no numbering gaps', () => {
  const tpl = read('data/sections/_demo.json');
  const cond = JSON.parse(JSON.stringify(tpl));
  cond.parts[1].articles[0].paragraphs[0].when = { all: ['never-set'] };
  const d = SS.draft.build(cond, '00 00 00', { drivers: new Set(), answers: {} }, {});
  const marks = d.parts[1].articles[0].paras.map((p) => p.mark);
  assert.deepStrictEqual(marks, ['A.', 'B.', 'C.'].slice(0, marks.length));
  assert.strictEqual(marks[0], 'A.');
});

test('draft: unanswered bracket shows the question, answered shows the label', () => {
  const tpl = read('data/sections/_demo.json');
  const none = SS.draft.build(tpl, '00 00 00', { drivers: new Set(), answers: {} }, {});
  assert.ok(none.plain.includes('[to choose: Membrane thickness (demo)]'));
  const yes = SS.draft.build(tpl, '00 00 00', { drivers: new Set(), answers: { thk: '060' } }, {});
  assert.ok(yes.plain.includes('Option B (demo 0.060)'));
});

test('draft: hash is stable and changes with text', () => {
  assert.strictEqual(SS.draft.hash('abc'), SS.draft.hash('abc'));
  assert.notStrictEqual(SS.draft.hash('abc'), SS.draft.hash('abd'));
});

// ---- decisions, impacts, flags ----------------------------------------------
test('decisions: answers record alternatives and ids in order', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  SS.store.current = p;
  SS.store.touch = () => {};
  SS.store.save = () => {};
  SS.store.setChoice('00 00 00', 'thk', '060', 'typical');
  SS.store.setChoice('00 00 00', 'thk', '045', '');
  assert.strictEqual(p.decisions.length, 2);
  assert.strictEqual(p.decisions[0].id, 'd-0001');
  assert.deepStrictEqual(p.decisions[0].alternatives.sort(), ['045', '080']);
  assert.strictEqual(p.decisions[1].chosen, '045');
});

test('flags: impact on a section not in the book is a decision flag', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  SS.store.current = p; SS.store.touch = () => {}; SS.store.save = () => {};
  SS.store.setChoice('00 00 00', 'thk', '060', '');
  SS.store.setChoice('00 00 00', 'thk', '080', '');
  const f = p.flags.find((x) => x.section === '07 01 50');
  assert.ok(f, 'flag exists');
  assert.strictEqual(f.level, 'decision', 'the demo impact on 07 01 50 is not in the book, so it needs a decision');
});

test('flags: a changed answer supersedes the old impact flags for that question', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  p.sections['07 01 50'] = { status: 'accepted' };
  SS.store.current = p; SS.store.touch = () => {}; SS.store.save = () => {};
  SS.store.setChoice('00 00 00', 'thk', '080', '');
  SS.store.setChoice('00 00 00', 'thk', '045', '');
  const open = p.flags.filter((x) => x.status === 'open' && x.section === '07 01 50');
  const sup = p.flags.filter((x) => x.status === 'superseded');
  assert.strictEqual(open.length, 1, 'one open flag for the latest decision');
  assert.ok(sup.length >= 1);
});

test('flags: duplicate keys are not raised twice while open', () => {
  const p = newProject();
  const f1 = SS.flags.raise(p, { key: 'k', note: 'x', section: '01 10 00' });
  const f2 = SS.flags.raise(p, { key: 'k', note: 'x', section: '01 10 00' });
  assert.ok(f1 && !f2);
  assert.strictEqual(p.flags.length, 1);
});

// ---- hand edits --------------------------------------------------------------
test('edits: a changed generated text raises one review flag with old and new', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  p.choices['00 00 00'] = { thk: '060' };
  SS.store.current = p; SS.store.touch = () => {}; SS.store.save = () => {};
  SS.store.setEdit('00 00 00', '2.0.0', 'Membrane: hand-written thickness.');
  assert.strictEqual(p.edits['00 00 00/2.0.0'].basedOn, SS.draft.hash(SS.store.generatedFor('00 00 00', '2.0.0')));
  SS.store.setChoice('00 00 00', 'thk', '080', '');
  SS.flags.reconcile(p, data);
  const f = p.flags.find((x) => x.kind === 'edit' && x.status === 'open');
  assert.ok(f, 'review flag raised');
  assert.strictEqual(f.level, 'review');
  assert.ok(f.detail.generated.includes('Option C'));
  assert.strictEqual(p.edits['00 00 00/2.0.0'].text, 'Membrane: hand-written thickness.', 'edit kept');
  SS.flags.reconcile(p, data);
  assert.strictEqual(p.flags.filter((x) => x.kind === 'edit' && x.status === 'open').length, 1, 'not raised twice');
});

test('edits: draft shows the hand edit and marks it edited', () => {
  const tpl = read('data/sections/_demo.json');
  const edits = { '00 00 00/2.0.0': { text: 'Edited', basedOn: SS.draft.hash('Membrane: [to choose: Membrane thickness (demo)] thick, reinforced.'), original: '' } };
  const d = SS.draft.build(tpl, '00 00 00', { drivers: new Set(), answers: {} }, { edits });
  const para = d.parts[1].articles[0].paras[0];
  assert.strictEqual(para.text, 'Edited');
  assert.strictEqual(para.edited, true);
  assert.strictEqual(para.stale, false);
});

// ---- import -------------------------------------------------------------------
test('import: text hits match words and keep the matched text', () => {
  const hits = SS.importer.textHits('Type IIB, sprinklered. Repoint the brick.', data);
  const labels = hits.map((h) => h.label);
  assert.ok(labels.includes('Type IIB'));
  assert.ok(labels.includes('Sprinklered'));
  assert.ok(labels.includes('Masonry'));
  const t = hits.find((h) => h.label === 'Type IIB');
  assert.deepStrictEqual(t.matched, ['Type IIB']);
});

test('import: known keys fill answers, unknown keys go to extra', () => {
  const p = newProject();
  const report = SS.importer.applyFile(p, { summary: { scope: ['repair'], occupied: true }, code: { construction_type: 'IIB', sprinklered: true }, surprise: 'kept' }, data);
  assert.deepStrictEqual(p.answers.scope, ['repair']);
  assert.strictEqual(p.answers.occupied, 'yes');
  assert.strictEqual(p.answers.construction_type, 'IIB');
  assert.strictEqual(p.answers.sprinklered, 'yes');
  assert.strictEqual(p.extra.surprise, 'kept');
  assert.ok(report.unknown.includes('surprise'));
});

test('import: a value outside the survey options is ignored, not guessed', () => {
  const p = newProject();
  SS.importer.applyFile(p, { code: { construction_type: 'VIII' } }, data);
  assert.strictEqual(p.answers.construction_type, undefined);
});

// ---- outputs ----------------------------------------------------------------
test('outputs: outline has only outline paragraphs; PPD groups by UniFormat', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  p.choices['00 00 00'] = { thk: '060', attach: 'mech', fastener: 'f1' };
  SS.store.current = p;
  const outline = SS.outputs.outline(p, data, false);
  assert.ok(outline.includes('Membrane: Option B'));
  assert.ok(!outline.includes('Seams'));
  const ppd = SS.outputs.ppd(p, data, false);
  assert.ok(ppd.includes('B3010 Roof coverings'));
  assert.ok(ppd.includes('00 00 00 Demo section'));
});

// ---- state round trip -------------------------------------------------------
test('store: export then restore keeps answers, decisions and flags', () => {
  const p = newProject();
  p.sections['00 00 00'] = { status: 'added' };
  SS.store.current = p; SS.store.touch = () => {}; SS.store.save = () => {}; SS.store.saveNow = () => {};
  SS.store.setChoice('00 00 00', 'thk', '080', 'why');
  const txt = SS.store.exportState();
  const back = SS.store.restoreState(JSON.parse(txt));
  assert.notStrictEqual(back.id, p.id, 'restore gives a new id');
  assert.deepStrictEqual(back.choices, p.choices);
  assert.strictEqual(back.decisions.length, p.decisions.length);
  assert.strictEqual(back.flags.length, p.flags.length);
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
