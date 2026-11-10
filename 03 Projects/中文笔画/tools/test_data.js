// Checks the weekly data before it goes on the page: node tools/test_data.js
// - every item has one character and a pinyin
// - no character twice in one batch
// - every character has stroke data in data/strokes.js (so the tracing and the answer can play)
// - the tabs are dated (YYYY-MM-DD) and newest first
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['data/batches.js', 'data/strokes.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
}
const batches = sandbox.window.BATCHES;
const strokes = sandbox.window.STROKES;
let fails = 0;
const fail = msg => { fails++; console.log('FAIL', msg); };

if (!Array.isArray(batches) || !batches.length) fail('no batches');
let prevDate = null;
for (const b of batches || []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) fail(`bad date ${b.date}`);
  if (!b.lesson) fail(`batch ${b.date} has no lesson name`);
  if (prevDate && b.date > prevDate) fail(`batches not newest first at ${b.date}`);
  prevDate = b.date;
  const seen = new Set();
  for (const it of b.items || []) {
    if (!it.ch || [...it.ch].length !== 1) fail(`${b.date}: item needs one character, got "${it.ch}"`);
    if (!it.py || !it.py.trim()) fail(`${b.date}: ${it.ch} has no pinyin`);
    if (seen.has(it.ch)) fail(`${b.date}: ${it.ch} appears twice`);
    seen.add(it.ch);
    if (!strokes[it.ch] || !strokes[it.ch].strokes || !strokes[it.ch].strokes.length) fail(`no stroke data for ${it.ch}`);
  }
  console.log(`${b.date} · ${b.lesson}: ${b.items.length} characters`);
}
if (!fails) console.log('OK: data checks passed');
process.exit(fails ? 1 : 0);
