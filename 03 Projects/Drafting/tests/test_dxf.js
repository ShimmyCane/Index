// Drafting — increment 1 tests. Plain Node, no packages.
//   node tests/test_dxf.js
// Checks: round trip (write, read back), R2013 and R12 output, the linter's validity and confidence,
// refused output, and (if ezdxf is installed, test-only) an external audit of the written files.
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

const sample = (f) => JSON.parse(fs.readFileSync(path.join(DIR, 'samples', f), 'utf8'));
const wall = sample('synthetic-wall-section.json');
const label = sample('synthetic-small-label.json');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

console.log('Drafting increment 1 tests');

test('wall section exports as AC1027, reads back, and is valid', () => {
  const r = exportDetail(wall, { version: 'AC1027' });
  assert.strictEqual(r.ok, true, JSON.stringify(r.lint.validity.filter(v => !v.ok)));
  assert.strictEqual(r.parsed.version, 'AC1027');
  assert.strictEqual(r.parsed.insunits, 1);
  assert.strictEqual(r.filename, 'synthetic-wall-section-test.dxf');
  assert.strictEqual(r.parsed.entities.length, r.built.prims.length);
});

test('round trip keeps coordinates (y flipped for CAD, upright)', () => {
  const r = exportDetail(wall, { version: 'AC1027' });
  const ys = r.built.prims.flatMap(p => (p.k === 'text' ? [p.at] : p.pts).map(q => q[1]));
  const miny = Math.min(...ys), maxy = Math.max(...ys);
  const w1 = r.parsed.entities.find(e => e.type === 'POLYLINE' && e.layer === 'DRAFT-LINE');
  assert.ok(w1, 'a line entity exists');
  // w1 is the first stroke: (0,0) -> (0,96) on the sheet
  assert.ok(Math.abs(w1.pts[0][1] - (miny + maxy - 0)) < 1e-6, 'first point flipped');
  assert.ok(Math.abs(w1.pts[1][1] - (miny + maxy - 96)) < 1e-6, 'second point flipped');
});

test('solid steel hatch is a HATCH entity; concrete pattern is an outline with a warning', () => {
  const r = exportDetail(wall, { version: 'AC1027' });
  const solid = r.parsed.entities.filter(e => e.type === 'HATCH');
  assert.strictEqual(solid.length, 1);
  assert.strictEqual(solid[0].solid, true);
  const pat = r.lint.checks.find(c => c.id === 'pattern-hatch');
  assert.strictEqual(pat.status, 'warn');
});

test('dimension is listed as not exported (increment 2), not silently lost', () => {
  const r = exportDetail(wall, { version: 'AC1027' });
  assert.ok(r.lint.dropped.some(d => d.id === 'd1' && /increment 2/.test(d.reason)));
});

test('notes split into lines at the paper-size height times the scale', () => {
  const b = buildPrims(wall);
  const texts = b.prims.filter(p => p.k === 'text');
  assert.strictEqual(texts.length, 3); // CONTROL JOINT + two lines of the steel note
  assert.ok(Math.abs(texts[0].height - 0.125 * 4) < 1e-9);
});

test('R12 output: version set, no hatch fill, and the linter says so', () => {
  const r = exportDetail(wall, { version: 'AC1009' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.parsed.version, 'AC1009');
  assert.strictEqual(r.lint.checks.find(c => c.id === 'r12-fill').status, 'warn');
  assert.ok(!r.parsed.entities.some(e => e.type === 'HATCH'));
});

test('small label: text too small at scale and a single point is dropped; viewer opens', () => {
  const r = exportDetail(label, { version: 'AC1027' });
  assert.strictEqual(r.lint.checks.find(c => c.id === 'text-size').status, 'warn');
  assert.ok(r.lint.dropped.some(d => d.id === 'a2' && /single point/.test(d.reason)));
  assert.strictEqual(r.lint.showViewer, r.lint.score < 80);
});

test('below 80% confidence the viewer is flagged to open (constructed: R12 solid fill, pattern hatch, tiny note)', () => {
  const low = {
    name: 'low confidence', scale: '3"=1\'-0"', items: [
      { id: 'a', kind: 'hatch', pattern: 'steel', pts: [[0, 0], [4, 0], [4, 4]] },
      { id: 'b', kind: 'hatch', pattern: 'concrete', pts: [[6, 0], [10, 0], [10, 4]] },
      { id: 'c', kind: 'note', text: 'TINY', at: [0, 8], size: 0.03, width: 2 }
    ]
  };
  const r = exportDetail(low, { version: 'AC1009' });
  assert.strictEqual(r.ok, true);
  // weights: pattern warn 2*0.5 + text warn 2*0.5 + R12 fill warn 1*0.5 = 2.5 of 10 lost -> 75%
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
  // R12 has one ENDSEC before EOF; put an unknown entity just inside ENTITIES.
  const txt = writeDXF([{ k: 'line', layer: 'DRAFT-LINE', pts: [[0, 0], [1, 1]] }], { version: 'AC1009' })
    .replace('0\nENDSEC\n0\nEOF', '0\nSPLINE\n8\nDRAFT-LINE\n0\nENDSEC\n0\nEOF');
  const p = parseDXF(txt);
  assert.ok(p.warnings.some(w => /SPLINE/.test(w)));
});

// Optional: external audit with ezdxf (test-only, never shipped). Skipped if not installed.
test('ezdxf audit of the written files (skipped if ezdxf is not installed)', () => {
  let have = true;
  try { execFileSync('python3', ['-I', '-c', 'import ezdxf'], { stdio: 'ignore' }); } catch (e) { have = false; }
  if (!have) { console.log('       (ezdxf not installed; skipped)'); return; }
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'drafting-'));
  for (const [name, det] of [['wall', wall], ['label', label]]) {
    for (const v of ['AC1027', 'AC1009']) {
      const r = exportDetail(det, { version: v });
      const f = path.join(out, name + '-' + v + '.dxf');
      fs.writeFileSync(f, r.dxf);
      const res = execFileSync('python3', ['-I', '-c',
        'import sys, ezdxf\n' +
        'doc, auditor = ezdxf.readfile(sys.argv[1]), None\n' +
        'a = doc.audit()\n' +
        'print(len(a.errors), len(a.fixes))\n' +
        'for e in a.errors[:5]: print("ERR", e)', f]).toString().trim();
      assert.ok(res.split('\n')[0].startsWith('0 '), name + ' ' + v + ' has audit errors: ' + res);
    }
  }
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
