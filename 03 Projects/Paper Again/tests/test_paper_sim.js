// Plain Node checks for the Paper Again simulation. Run: node tests/test_paper_sim.js (about 45 s)
var assert = require('assert');
var path = require('path');
var S = require(path.join(__dirname, '..', 'js', 'paper_sim.js'));
var story = require(path.join(__dirname, '..', 'js', 'paper_story.js'));

var s = S.startSheet(story.seed);
var rows = [];
var pieceCounts = [];
var faceCounts = [];
story.steps.forEach(function (inc) {
  S.runIncrement(s, inc);
  var st = S.stats(s);
  rows.push(inc.age + ' ' + inc.label + ': pieces ' + st.pieces + ', faces ' + st.faces + ', max height ' + st.maxHeight.toFixed(2));
  pieceCounts.push(st.pieces);
  faceCounts.push(st.faces);
  for (var v = 0; v < S.NV; v++) {
    assert(Number.isFinite(s.x[v]) && Number.isFinite(s.y[v]) && Number.isFinite(s.z[v]), 'NaN at increment ' + inc.age);
  }
});
console.log(rows.join('\n'));

// The sheet is a single piece until the first cut (increment 7), two after it, three after the second cut.
for (var i = 0; i < 6; i++) assert.strictEqual(pieceCounts[i], 1, 'one piece before the cuts, increment ' + (i + 1));
assert.strictEqual(pieceCounts[6], 2, 'two pieces after the first cut');
assert.strictEqual(pieceCounts[7], 3, 'three pieces after the second cut');

// The tear (increment 4) removes faces; the holes (increment 9) remove more.
assert(faceCounts[3] < faceCounts[2], 'tear should remove faces');
assert(faceCounts[8] < faceCounts[7], 'holes and burn should remove faces');

// The ball forms: after the wind (increment 3) the paper is raised well above the floor.
assert(S.stats(S.replay(story, 3)).maxHeight > 0.8, 'the crumpled ball should stand up off the floor');

// Determinism: the same story gives the same geometry.
var a = S.toPieces(S.replay(story, 5)), b = S.toPieces(S.replay(story, 5));
assert.strictEqual(a.length, b.length);
a.forEach(function (p, k) {
  assert.strictEqual(p.positions.length, b[k].positions.length);
  for (var q = 0; q < p.positions.length; q++) assert.strictEqual(p.positions[q], b[k].positions[q]);
});

// A different seed changes the result.
var other = JSON.parse(JSON.stringify(story)); other.seed = 99;
var c = S.toPieces(S.replay(other, 3));
var same = c[0].positions.every(function (v, k) { return v === a[0].positions[k] || k >= a[0].positions.length; });
assert(!same || c.length !== a.length, 'a different seed should change the result');

// The cache fingerprint changes when the story changes.
assert.notStrictEqual(S.storyHash(story), S.storyHash(other));

console.log('ok: all Paper Again simulation checks passed');
