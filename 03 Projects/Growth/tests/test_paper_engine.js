// Plain Node test for the Growth paper engine. Run: node tests/test_paper_engine.js
var assert = require('assert');
var path = require('path');
var E = require(path.join(__dirname, '..', 'js', 'paper_engine.js'));
var S = require(path.join(__dirname, '..', 'js', 'paper_story.js'));

var rows = [];
for (var n = 0; n <= S.steps.length; n++) {
  var st = E.replay(S, n);
  var s = E.stats(st);
  var pieces = E.toPieces(st);
  rows.push({ n: n, faces: s.faces, pieces: s.pieces, geom: pieces.length });
  pieces.forEach(function (p) {
    for (var i = 0; i < p.positions.length; i++) {
      assert(Number.isFinite(p.positions[i]), 'NaN/Inf position at step ' + n);
    }
  });
}
console.log(rows.map(function (r) { return 'step ' + r.n + ': faces ' + r.faces + ', pieces ' + r.pieces; }).join('\n'));

// Clean sheet: 40 x 52 cells, 2 triangles each, one piece.
assert.strictEqual(rows[0].faces, E.W * E.H * 2);
assert.strictEqual(rows[0].pieces, 1);
// Tear (step 4) removes faces.
assert(rows[4].faces < rows[3].faces, 'tear should remove faces');
// Cuts: two pieces after step 7, three after step 8.
assert.strictEqual(rows[6].pieces, 1);
assert.strictEqual(rows[7].pieces, 2);
assert.strictEqual(rows[8].pieces, 3);
// Holes at step 9 remove faces.
assert(rows[9].faces < rows[8].faces, 'holes should remove faces');
// Determinism: same story, same step, same numbers.
var a = E.toPieces(E.replay(S, 10)), b = E.toPieces(E.replay(S, 10));
assert.strictEqual(a.length, b.length);
a.forEach(function (p, i) {
  assert.strictEqual(p.positions.length, b[i].positions.length);
  for (var k = 0; k < p.positions.length; k++) assert.strictEqual(p.positions[k], b[i].positions[k]);
});
// The same seed gives the same tear noise; a different seed changes the result.
var S2 = JSON.parse(JSON.stringify(S)); S2.seed = 7;
var c = E.toPieces(E.replay(S2, 4)), d = E.toPieces(E.replay(S, 4));
var same = c[0].positions.every(function (v, k) { return v === d[0].positions[k]; });
assert(!same, 'different seed should change the replay');
console.log('ok: all engine checks passed');
