// Name each stroke from its centre line (hanzi-writer medians, 1024 grid, y pointing UP).
// Rules: stroke.md, "The algorithm". Run from the project folder:
//   node tools/stroke_names.js            -> prints every character's names
//   node tools/stroke_names.js 言 請      -> only those characters
// The output is a suggestion. Check it with a stroke-order source before it goes into batches.json.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TURN = 0.45;        // a segment is "horizontal" or "vertical" when the other side is under 45% of it
const DOT_MAX = 220;      // a short down-right piece is a 點; a longer one is a 捺
const HOOK_MIN = 60;      // a last piece this long that flicks left is a 鉤; shorter flicks are ignored

// Direction class of one segment, with screen coordinates (y down).
function classify(dx, dy) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (dx > 0 && dy < 0 && ay > TURN * ax) return '提';      // rising to the right
  if (dx > 0 && ay <= TURN * ax) return '橫';                // rightward
  if (dy > 0 && ax <= TURN * ay) return '豎';                // downward
  if (dx < 0 && dy > 0) return '撇';                         // down to the left
  if (dx > 0 && dy > 0) return '捺';                         // down to the right (點 or 捺, see name())
  return 'flick';                                             // leftward or upward: a possible 鉤
}

// Simplify the centre line to its main corners (Ramer-Douglas-Peucker), so small wobbles do not make pieces.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [a, b];
  const left = simplify(pts.slice(0, idx + 1), tol), right = simplify(pts.slice(idx), tol);
  return left.slice(0, -1).concat(right);
}

// Pieces: the straight edges between main corners, each with its direction class and length.
// Edges shorter than MIN_PIECE are wobbles or a tiny lead-in and are dropped.
const MIN_PIECE = 40, TOL = 18;
function pieces(points) {
  const pts = simplify(points.map(([x, y]) => [x, -y]), TOL);   // screen coordinates
  const runs = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
    const len = Math.hypot(dx, dy);
    if (len < MIN_PIECE) continue;
    const cls = classify(dx, dy);
    if (!cls) continue;
    const last = runs[runs.length - 1];
    if (last && last.cls === cls) { last.len += len; last.end = pts[i]; }
    else runs.push({ cls, len, start: pts[i - 1], end: pts[i] });
  }
  // A curved downward stroke (a 豎 that bends) is split into a 捺 and a 撇 on the way down:
  // merge neighbouring downward pieces that point within 80 degrees of each other, then classify the merge.
  const merged = [];
  for (const r of runs) {
    const prev = merged[merged.length - 1];
    if (prev && downward(prev) && downward(r) && angleGap(prev, r) < 80) {
      prev.len += r.len;
      prev.end = r.end;
      prev.cls = classify(prev.end[0] - prev.start[0], prev.end[1] - prev.start[1]) || prev.cls;
    } else merged.push({ ...r });
  }
  return merged;
}

const downward = r => r.end[1] - r.start[1] > 0;
const angleOf = r => Math.atan2(r.end[1] - r.start[1], r.end[0] - r.start[0]) * 180 / Math.PI;
const angleGap = (a, b) => { const d = Math.abs(angleOf(a) - angleOf(b)) % 360; return d > 180 ? 360 - d : d; };

const BASE = { '橫': '橫', '豎': '豎', '撇': '撇', '提': '提' };
const PAIR = { '橫豎': '橫折', '豎橫': '豎折', '橫撇': '橫撇', '撇橫': '撇折', '豎撇': '豎撇', '橫捺': '橫折捺' };

// Name of one direction piece on its own (a 捺 short enough is a 點).
function pieceName(p) {
  if (p.cls === '捺') return p.len <= DOT_MAX ? '點' : '捺';
  if (p.cls === 'flick') return '點';
  return BASE[p.cls] || '點';
}

function name(points) {
  const total = points.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) : 0), 0);
  if (total < DOT_MAX) return '點';                           // a very short stroke is a dot
  // A lead-in or tail piece under a fifth of the stroke is a wobble, not a new direction.
  const ps = pieces(points).filter((p, _, all) => all.length === 1 || p.len >= 0.2 * total);
  if (!ps.length) return '點';
  // A last piece that flicks left and is long enough is a hook, not a new direction.
  let hook = false;
  const last = ps[ps.length - 1];
  if (ps.length > 1 && last.cls === 'flick' && last.len >= HOOK_MIN) { hook = true; ps.pop(); }
  if (ps.length > 1 && ps[ps.length - 1].cls === 'flick') ps.pop();
  let core;
  if (ps.length === 1) core = pieceName(ps[0]);
  else {
    const first = ps[0], second = ps[1];
    const key = (first.cls === '捺' ? '點' : first.cls) + (second.cls === '捺' ? '點' : second.cls);
    core = PAIR[key] || (pieceName(first) + '折' + pieceName(second));
    for (let i = 2; i < ps.length; i++) core += pieceName(ps[i]);
  }
  if (hook) core += '鉤';
  return core;
}

function main() {
  const root = path.join(__dirname, '..');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'data', 'strokes.js'), 'utf8'), sandbox);
  const data = sandbox.window.STROKES;
  const only = process.argv.slice(2);
  for (const ch of Object.keys(data)) {
    if (only.length && !only.includes(ch)) continue;
    const names = data[ch].medians.map(name);
    console.log(ch, names.join(' '));
  }
}

if (require.main === module) main();
module.exports = { name, pieces, classify };
