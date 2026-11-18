// Drafting — tests (increments 1 and 2). Plain Node, no packages.
//   node tests/test_dxf.js
// Checks: round trip, R2013 and R12 output, linetypes (.LIN and DXF table), hatch patterns (.PAT and
// DXF pattern lines), blocks and inserts, dimensions, the linter's validity and confidence, refused
// output, and (if ezdxf is installed, test-only) an external audit of every written file.
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..');
const { exportDetail } = require(path.join(DIR, 'js', 'pipeline.js'));
const { parseDXF } = require(path.join(DIR, 'js', 'dxf_read.js'));
const { writeDXF } = require(path.join(DIR, 'js', 'dxf_write.js'));
const { buildPrims } = require(path.join(DIR, 'js', 'primitives.js'));

const sample = (f) => JSON.parse(fs.readFileSync(path.join(DIR, 'samples', f + '.json'), 'utf8'));
const wall = sample('synthetic-wall-section');
const block = sample('synthetic-block-use');
const label = sample('synthetic-small-label');
const LIB = { [wall.id]: wall, [block.id]: block, [label.id]: label };

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

console.log('Drafting tests');

test('wall section: AC1027 exports, reads back, and is valid', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  assert.strictEqual(r.ok, true, JSON.stringify(r.lint.validity.filter(v => !v.ok)));
  assert.strictEqual(r.parsed.version, 'AC1027');
  assert.strictEqual(r.parsed.insunits, 1);
  assert.strictEqual(r.filename, 'synthetic-wall-section-test.dxf');
  assert.strictEqual(r.parsed.entities.length, r.built.prims.length);
});

test('round trip keeps coordinates (y flipped for CAD, upright)', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  const ys = r.built.prims.flatMap(p => (p.k === 'text' || p.k === 'insert' ? [p.at] : p.pts).map(q => q[1]));
  const miny = Math.min(...ys), maxy = Math.max(...ys);
  const w1 = r.parsed.entities.find(e => e.type === 'POLYLINE' && e.layer === 'DRAFT-LINE' && !e.lt);
  assert.ok(w1, 'a line entity exists');
  assert.ok(Math.abs(w1.pts[0][1] - (miny + maxy - 0)) < 1e-6, 'first point flipped');
  assert.ok(Math.abs(w1.pts[1][1] - (miny + maxy - 96)) < 1e-6, 'second point flipped');
});

test('solid steel hatch is a solid HATCH; brick is a pattern HATCH with its lines', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  const hatches = r.parsed.entities.filter(e => e.type === 'HATCH');
  assert.strictEqual(hatches.length, 2);
  const solid = hatches.find(h => h.solid);
  assert.ok(solid, 'solid hatch read back');
  const pat = hatches.find(h => !h.solid);
  assert.strictEqual(pat.pattern, 'BRICK');
  assert.strictEqual(pat.patternLines.length, 2);
  assert.ok(Math.abs(pat.patternLines[0].dy - 1) < 1e-6, 'horizontal courses 0.25 paper = 1 real inch at 3"=1\'-0"');
  assert.ok(Math.abs(pat.patternLines[1].dy - 2) < 1e-6, 'joints 0.5 paper = 2 real inches');
  assert.deepStrictEqual(pat.patternLines[1].dashes.map(v => Math.round(v * 1000) / 1000), [1, -0.5]);
});

test('dashed centre line: DASHED line type in the table, dashes at real size', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  const lt = r.parsed.ltypes.find(t => t.name === 'DASHED');
  assert.ok(lt, 'DASHED defined');
  assert.deepStrictEqual(lt.dashes, [0.5, -0.25]);
  assert.ok(r.parsed.entities.some(e => e.lt === 'DASHED'), 'a line uses DASHED');
});

test('.LIN and .PAT are plain text in the Autodesk form', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  assert.ok(/\*DASHED, /.test(r.lin) && /\nA,0\.5,-0\.25\n/.test(r.lin), r.lin);
  assert.ok(/\*BRICK, /.test(r.pat) && /\n0,0,0,0,1\n/.test(r.pat), r.pat);
  assert.ok(r.pat.endsWith('\n\n'), 'a blank line follows the last pattern');
});

test('no line type or pattern used: no .LIN or .PAT is written', () => {
  const plain = { name: 'plain', scale: '3"=1\'-0"', items: [{ id: 's', kind: 'stroke', pts: [[0, 0, 0, 0], [4, 0, 0, 0]] }] };
  const r = exportDetail(plain, { version: 'AC1027' });
  assert.strictEqual(r.lin, null);
  assert.strictEqual(r.pat, null);
});

test('dimension: its length is written as text (8")', () => {
  const r = exportDetail(wall, { version: 'AC1027', library: LIB });
  assert.ok(r.parsed.entities.some(e => e.type === 'TEXT' && e.text === '8"'), 'label 8"');
  assert.ok(r.parsed.entities.some(e => e.layer === 'DRAFT-DIM'), 'dimension lines on DRAFT-DIM');
});

test('block use: one INSERT per use, definition read back, scale kept (1 and 0.5)', () => {
  const r = exportDetail(block, { version: 'AC1027', library: LIB });
  assert.strictEqual(r.ok, true, JSON.stringify(r.lint.validity.filter(v => !v.ok)));
  const inserts = r.parsed.entities.filter(e => e.type === 'INSERT');
  assert.strictEqual(inserts.length, 2);
  assert.deepStrictEqual(inserts.map(i => i.scale), [1, 0.5]);
  const def = r.parsed.blocks[inserts[0].name];
  assert.ok(def && def.length > 0, 'block definition read back');
  assert.ok(def.some(e => e.type === 'POLYLINE'), 'definition has lines');
});

test('block insert lands at its sheet point (x kept; y flipped with the drawing)', () => {
  const r = exportDetail(block, { version: 'AC1027', library: LIB });
  const inserts = r.parsed.entities.filter(e => e.type === 'INSERT');
  assert.strictEqual(inserts[1].at[0], 60);
  const ys = r.built.prims.flatMap(p => (p.k === 'text' || p.k === 'insert' ? [p.at] : p.pts).map(q => q[1]));
  const miny = Math.min(...ys), maxy = Math.max(...ys);
  assert.ok(Math.abs(inserts[1].at[1] - (miny + maxy - (-40))) < 1e-6, 'insert y flipped');
});

test('block with a missing source is dropped with a reason; the rest still exports', () => {
  const d = { name: 'orphan', scale: '3"=1\'-0"', items: [{ id: 'x', kind: 'block', sourceId: 'nope', at: [0, 0], k: 1 }, { id: 's', kind: 'stroke', pts: [[0, 0, 0, 0], [4, 0, 0, 0]] }] };
  const r = exportDetail(d, { version: 'AC1027', library: {} });
  assert.strictEqual(r.ok, true);
  assert.ok(r.lint.dropped.some(x => x.id === 'x' && /not in the library/.test(x.reason)));
});

test('a block that contains itself is refused', () => {
  const a = { id: 'A', name: 'A', scale: '3"=1\'-0"', items: [{ id: 'self', kind: 'block', sourceId: 'A', at: [0, 0], k: 1 }, { id: 's', kind: 'stroke', pts: [[0, 0, 0, 0], [4, 0, 0, 0]] }] };
  const b = buildPrims(a, { A: a });
  assert.ok(b.dropped.some(x => /cannot contain itself/.test(x.reason)));
});

test('R12 output: no HATCH fill or pattern, the linter says so', () => {
  const r = exportDetail(wall, { version: 'AC1009', library: LIB });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.parsed.version, 'AC1009');
  assert.strictEqual(r.lint.checks.find(c => c.id === 'r12-fill').status, 'warn');
  assert.ok(!r.parsed.entities.some(e => e.type === 'HATCH'));
});

test('an unknown hatch pattern is drawn as an outline and the linter says so', () => {
  const d = { name: 'unk', scale: '3"=1\'-0"', items: [{ id: 'h', kind: 'hatch', pattern: 'concrete', pts: [[0, 0], [4, 0], [4, 4]] }] };
  const r = exportDetail(d, { version: 'AC1027' });
  assert.strictEqual(r.lint.checks.find(c => c.id === 'pattern-unknown').status, 'warn');
  assert.ok(/concrete/.test(r.lint.checks.find(c => c.id === 'pattern-unknown').hint));
});

test('small label: text too small at scale and a single point is dropped; viewer flag follows the score', () => {
  const r = exportDetail(label, { version: 'AC1027', library: LIB });
  assert.strictEqual(r.lint.checks.find(c => c.id === 'text-size').status, 'warn');
  assert.ok(r.lint.dropped.some(d => d.id === 'a2' && /single point/.test(d.reason)));
  assert.strictEqual(r.lint.showViewer, r.lint.score < 80);
});

test('below 80% confidence the viewer is flagged (constructed: R12 fill, unknown pattern, tiny note, tiny segment)', () => {
  const low = {
    name: 'low confidence', scale: '3"=1\'-0"', items: [
      { id: 'a', kind: 'hatch', pattern: 'steel', pts: [[0, 0], [4, 0], [4, 4]] },
      { id: 'b', kind: 'hatch', pattern: 'concrete', pts: [[6, 0], [10, 0], [10, 4]] },
      { id: 'c', kind: 'note', text: 'TINY', at: [0, 8], size: 0.03, width: 2 },
      { id: 'd', kind: 'stroke', pts: [[0, 12, 0, 0], [0.01, 12, 0, 0], [4, 12, 0, 0]] }
    ]
  };
  const r = exportDetail(low, { version: 'AC1009' });
  assert.strictEqual(r.ok, true);
  // lost: clean-lines 2*0.5 + text-size 2*0.5 + pattern-unknown 2*0.5 + r12-fill 1*0.5 = 3.5 of 14 -> 75%
  assert.strictEqual(r.lint.score, 75, 'score was ' + r.lint.score);
  assert.strictEqual(r.lint.showViewer, true);
});

test('a non-finite coordinate is refused with a reason (validity fails, no file)', () => {
  const bad = { name: 'bad', scale: '3"=1\'-0"', items: [{ id: 'x', kind: 'stroke', pts: [[0, 0, 0, 0], [NaN, 2, 0, 0]] }] };
  const r = exportDetail(bad, { version: 'AC1027' });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.dxf, null);
  assert.ok(r.lint.validity.some(v => !v.ok && /finite/.test(v.reason)));
});

test('a broken file is reported by the reader, not read as valid', () => {
  const p = parseDXF('abc\ndef\n');
  assert.strictEqual(p.ok, false);
  assert.ok(p.errors.length > 0);
});

test('the reader names the entities it does not read', () => {
  const txt = writeDXF([{ k: 'line', layer: 'DRAFT-LINE', pts: [[0, 0], [1, 1]] }], { version: 'AC1009' })
    .replace('0\nENDSEC\n0\nEOF', '0\nSPLINE\n8\nDRAFT-LINE\n0\nENDSEC\n0\nEOF');
  const p = parseDXF(txt);
  assert.ok(p.warnings.some(w => /SPLINE/.test(w)));
});

// Optional: external audit with ezdxf (test-only, never shipped). Skipped if not installed.
test('ezdxf audit of every written file (skipped if ezdxf is not installed)', () => {
  let have = true;
  try { execFileSync('python3', ['-I', '-c', 'import ezdxf'], { stdio: 'ignore' }); } catch (e) { have = false; }
  if (!have) { console.log('       (ezdxf not installed; skipped)'); return; }
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'drafting-'));
  for (const det of [wall, block, label]) {
    for (const v of ['AC1027', 'AC1009']) {
      const r = exportDetail(det, { version: v, library: LIB });
      const f = path.join(out, det.id + '-' + v + '.dxf');
      fs.writeFileSync(f, r.dxf);
      const res = execFileSync('python3', ['-I', '-c',
        'import sys, ezdxf\n' +
        'doc = ezdxf.readfile(sys.argv[1])\n' +
        'a = doc.audit()\n' +
        'print(len(a.errors), len(a.fixes))\n' +
        'for e in a.errors[:5]: print("ERR", e)', f]).toString().trim();
      assert.ok(res.split('\n')[0].startsWith('0 0'), det.id + ' ' + v + ' audit: ' + res);
    }
  }
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
