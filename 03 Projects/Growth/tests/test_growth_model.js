// Plain Node checks for the Growth world model. Run: node tests/test_growth_model.js
var assert = require('assert');
var path = require('path');
var M = require(path.join(__dirname, '..', 'js', 'growth_model.js'));
var list = require(path.join(__dirname, '..', 'worlds', 'index.js'));

function load(id) { return require(path.join(__dirname, '..', 'worlds', id + '.js')); }
function setVar(world, id, value) {
  var w = M.clone(world);
  w.environment.variables.forEach(function (v) { if (v.id === id) v.value = value; });
  return w;
}

// ---- every listed world exists and is valid
assert(list.length >= 2, 'at least two worlds listed');
list.forEach(function (e) {
  var w = load(e.id);
  assert.strictEqual(w.id, e.id, 'world id matches its file name: ' + e.id);
  assert.deepStrictEqual(M.validate(w), [], e.id + ' should validate');
});

// ---- the rabbit world: numbers follow from the rules
var rabbits = load('rabbits_hillside');
var c = M.compute(rabbits);
var S = c.states;
assert.strictEqual(S.length, 11, 'start plus ten steps');
assert.strictEqual(S[0].rabbits, 2, 'a pair to start with');
S.forEach(function (s) {
  assert(s.rabbits >= 2, 'the pair is never wiped out (burrow refuge), step ' + s.step);
  assert(s.plants_pct >= 12 && s.plants_pct <= 100, 'roots keep plants between 12 and 100 %, step ' + s.step);
});
var peak = Math.max.apply(null, S.map(function (s) { return s.rabbits; }));
assert(peak >= 100, 'rabbits multiply to a boom');
assert(S[S.length - 1].rabbits < 2 * peak, 'sanity: the end is not above twice the peak');
var firstHawk = S.findIndex(function (s) { return s.hawks > 0; });
var firstCoyote = S.findIndex(function (s) { return s.coyotes > 0; });
assert(firstHawk > 0 && firstCoyote > firstHawk, 'hawks arrive before coyotes');
assert(S[firstHawk - 1].rabbits > 35, 'a hawk only comes after the rabbits pass the hawk threshold');
assert(S[firstCoyote - 1].rabbits > 90, 'a coyote only comes after the rabbits pass the coyote threshold');
assert(S.some(function (s) { return s.plants_pct < 30; }), 'the landscape changes: plants drop below 30 %');
// same variables, same story
assert.deepStrictEqual(M.compute(rabbits), M.compute(M.clone(rabbits)), 'deterministic');

// ---- changing a variable changes the story
var noPredators = M.compute(setVar(setVar(rabbits, 'hawk_max', 0), 'coyote_max', 0)).states;
assert(noPredators.every(function (s) { return s.hawks === 0 && s.coyotes === 0; }), 'no predators when the maximums are zero');
var peakNoPred = Math.max.apply(null, noPredators.map(function (s) { return s.rabbits; }));
assert(peakNoPred > peak, 'without predators the rabbits go higher');
var smallValley = M.compute(setVar(rabbits, 'carry_plants', 400)).states;
var peakSmall = Math.max.apply(null, smallValley.map(function (s) { return s.rabbits; }));
assert(peakSmall < peak, 'a smaller valley holds fewer rabbits');

// ---- text with numbers
assert.strictEqual(M.resolveText('There are {rabbits} rabbits.', { rabbits: 7 }), 'There are 7 rabbits.');
assert.strictEqual(M.resolveText('Unknown {nope} stays', { rabbits: 7 }), 'Unknown {nope} stays');
assert(M.ruleText(rabbits, 'more than {hawk_start} rabbits').indexOf('35') > 0, 'rules take the variable values');
var desc = M.describeSeries(rabbits, c);
assert(desc.some(function (l) { return /^Rabbits: start at 2, highest at \d+ in step \d+/.test(l); }), 'plain-words reading of the chart');

// ---- the AI loop
var prompt = M.buildPrompt(rabbits);
assert(prompt.indexOf(rabbits.seed.prompt) >= 0, 'prompt has the start');
assert(prompt.indexOf('hawk_start') < 0 && prompt.indexOf('Hawks arrive above = 35') >= 0, 'prompt lists variables by name and value');
assert(prompt.indexOf('step 6') >= 0 && prompt.indexOf('Reply with JSON only') >= 0, 'prompt has the numbers and the reply shape');
assert(prompt.indexOf('Not modelled yet') >= 0, 'prompt lists what is not modelled');
var reply = '{"steps":[{"label":"A","narrative":"Hello {rabbits}.","events":["e1"],"landscape":"Green."},{"label":"B","narrative":"Again."}]}';
var steps = M.parseReply(reply);
assert.strictEqual(steps.length, 2);
assert.deepStrictEqual(steps[1].events, []);
assert.strictEqual(M.parseReply('Sure! Here it is:\n```json\n' + reply + '\n```\nAnything else?').length, 2, 'reads a code fence');
assert.strictEqual(M.parseReply('Here you go: ' + reply + ' Thanks.').length, 2, 'reads JSON among words');
assert.strictEqual(M.parseReply('[{"label":"A","narrative":"x"}]').length, 1, 'reads a bare list');
assert.throws(function () { M.parseReply('no json here'); }, /JSON/);
assert.throws(function () { M.parseReply('{"steps":[{"label":"A"}]}'); }, /no narrative/);
var applied = M.applySteps(rabbits, steps);
assert.strictEqual(applied.steps.length, 2);
assert.strictEqual(applied.time.increments, 2, 'increments follow the number of steps');
assert.deepStrictEqual(M.validate(applied), [], 'the new world is still valid');
assert.strictEqual(rabbits.steps.length, 10, 'the original is not changed');

// ---- the paper world: recorded numbers
var paper = load('paper_decay');
var P = M.compute(paper).states;
assert.strictEqual(P.length, 11);
assert.deepStrictEqual(P.map(function (s) { return s.pieces; }), [1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3], 'pieces: one, then two at the first cut, three at the second');
assert(P[10].faces < P[0].faces, 'paper is lost over time');
var keptState = M.applySteps(paper, M.parseReply('{"steps":' + JSON.stringify(paper.steps.map(function (s) { return { label: s.label, narrative: s.narrative }; })) + '}'));
assert.deepStrictEqual(M.compute(keptState).states.map(function (s) { return s.pieces; }), [1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3], 'recorded numbers stay with their steps');

// ---- the review the Increment Viewer reads
[rabbits, paper].forEach(function (w) {
  var r = M.toReview(w);
  assert.strictEqual(r.items.length, 10);
  r.items.forEach(function (item, i) {
    assert.strictEqual(item.id, String(i + 1));
    assert(item.title && item.description.indexOf('{') < 0, 'no unresolved {names} in step ' + (i + 1) + ' of ' + w.id);
    assert(item.card && item.card.bars.length === w.chart.length, 'a state card for every step');
  });
});

// ---- validate catches mistakes in plain words
var bad = M.clone(rabbits);
bad.kind = 'magic'; bad.time.increments = 9; bad.time.model.type = 'nope';
var problems = M.validate(bad);
assert(problems.some(function (p) { return /kind/.test(p); }) && problems.some(function (p) { return /model/.test(p); }) && problems.some(function (p) { return /steps but/.test(p); }), 'problems are reported');

console.log('ok: all Growth model checks passed');
