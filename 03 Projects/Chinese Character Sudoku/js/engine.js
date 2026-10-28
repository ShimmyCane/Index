// Puzzle engine: word index, grid generator, decoys and answer checks.
// No DOM here, so it also runs under Node for tests (tools/test_engine.js).
const Engine = (() => {
  // ---------- word index ----------
  // pool: extra characters (the whole 字库) that may show up as distractors even without a word.
  function buildIndex(words, pool = []) {
    const W = new Set(), next = new Map();
    for (const w of words) {
      if (w.length !== 2 || w[0] === w[1] || W.has(w)) continue;
      W.add(w);
      if (!next.has(w[0])) next.set(w[0], []);
      next.get(w[0]).push(w[1]);
    }
    const chars = [...new Set([...W].join(''))];
    return { W, next, chars, pool: [...new Set([...chars, ...pool])], isWord: (a, b) => !!a && !!b && W.has(a + b) };
  }

  function makeRng(seed) {
    if (seed == null) return Math.random;
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function shuffle(a, rng) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // ---------- rules ----------
  // A character "joins" its line when it makes a word with the character before or after it
  // (rows read left→right, columns read top→bottom).
  function lineOk(idx, line, i) {
    return (i > 0 && idx.isWord(line[i - 1], line[i])) || (i < line.length - 1 && idx.isWord(line[i], line[i + 1]));
  }
  const rowOf = (g, n, r) => g.slice(r * n, r * n + n);
  const colOf = (g, n, c) => Array.from({ length: n }, (_, r) => g[r * n + c]);

  // Easy rule: a character is right when it makes a word with at least one neighbour.
  function easyCellOk(idx, g, n, i) {
    if (!g[i]) return false;
    const r = Math.floor(i / n), c = i % n;
    return lineOk(idx, rowOf(g, n, r), c) || lineOk(idx, colOf(g, n, c), r);
  }

  // Challenge rule: every character makes a word in its row AND in its column.
  function checkHard(idx, g, n) {
    const badRows = [], badCols = [], badCells = new Set();
    for (let r = 0; r < n; r++) {
      const line = rowOf(g, n, r);
      let ok = true;
      line.forEach((_, c) => { if (!lineOk(idx, line, c)) { ok = false; badCells.add(r * n + c); } });
      if (!ok) badRows.push(r);
    }
    for (let c = 0; c < n; c++) {
      const line = colOf(g, n, c);
      let ok = true;
      line.forEach((_, r) => { if (!lineOk(idx, line, r)) { ok = false; badCells.add(r * n + c); } });
      if (!ok) badCols.push(c);
    }
    return { ok: !badRows.length && !badCols.length, badRows, badCols, badCells };
  }

  // Every word on the board, rows first, for the "you made these words" list.
  function wordsOnBoard(idx, g, n) {
    const out = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) {
      const a = g[r * n + c], b = g[r * n + c + 1];
      if (idx.isWord(a, b)) out.push(a + b);
    }
    for (let c = 0; c < n; c++) for (let r = 0; r < n - 1; r++) {
      const a = g[r * n + c], b = g[(r + 1) * n + c];
      if (idx.isWord(a, b)) out.push(a + b);
    }
    return [...new Set(out)];
  }

  // ---------- solution search ----------
  // Which neighbour pairs along a line must be words. 2 and 3 cells: all of them.
  // 4 cells: either a chain (AB BC CD) or two words (AB CD).
  function linePattern(n, rng) {
    if (n < 4) return Array(n - 1).fill(true);
    return rng() < 0.35 ? [true, true, true] : [true, false, true];
  }

  // pre: Map(cell → character) placed before the search (used to plant a lesson word).
  // Easy puzzles only need rows to be words; each column is a word chain half the time.
  // prefer: Set of recent characters to try first (shuffled within each group), or null.
  function solveOnce(idx, n, rng, maxSteps, pre, easy, prefer) {
    const H = Array.from({ length: n }, () => linePattern(n, rng)); // H[r][c]: cell c + c+1 in row r
    const V = Array.from({ length: n }, () => // V[c][r]: cell r + r+1 in column c
      easy && rng() < 0.5 ? Array(n - 1).fill(false) : linePattern(n, rng));
    const g = Array(n * n).fill(null), used = new Set(pre.values());
    const outDeg = ch => (idx.next.get(ch) || []).length;
    let steps = 0;
    function fill(i) {
      if (i === n * n) return true;
      if (++steps > maxSteps) return false;
      const r = Math.floor(i / n), c = i % n;
      const needLeft = c > 0 && H[r][c - 1], needUp = r > 0 && V[c][r - 1];
      let cand;
      if (needLeft && needUp) cand = (idx.next.get(g[i - 1]) || []).filter(x => idx.isWord(g[i - n], x));
      else if (needLeft) cand = idx.next.get(g[i - 1]) || [];
      else if (needUp) cand = idx.next.get(g[i - n]) || [];
      else cand = idx.chars;
      const needOut = (c < n - 1 && H[r][c] ? 1 : 0) + (r < n - 1 && V[c][r] ? 1 : 0);
      if (pre.has(i)) {
        const x = pre.get(i);
        if (!cand.includes(x) && cand !== idx.chars) return false;
        g[i] = x;
        if (fill(i + 1)) return true;
        g[i] = null;
        return false;
      }
      const order = shuffle([...cand], rng);
      if (prefer) order.sort((a, b) => prefer.has(b) - prefer.has(a));
      for (const x of order) {
        if (used.has(x) || outDeg(x) < needOut) continue;
        // Look ahead to planted cells on the right and below.
        if (c < n - 1 && H[r][c] && pre.has(i + 1) && !idx.isWord(x, pre.get(i + 1))) continue;
        if (r < n - 1 && V[c][r] && pre.has(i + n) && !idx.isWord(x, pre.get(i + n))) continue;
        g[i] = x; used.add(x);
        if (fill(i + 1)) return true;
        used.delete(x);
      }
      g[i] = null;
      return false;
    }
    return fill(0) ? g : null;
  }

  function findSolution(idx, n, rng, pre, easy, prefer) {
    // A planted word may not fit at all, so give it fewer restarts than a free search.
    for (let t = 0, max = pre.size ? 4 : 30; t < max; t++) {
      const g = solveOnce(idx, n, rng, pre.size ? 800 : 2000, pre, easy, prefer);
      if (g) return g;
    }
    return null;
  }

  // Put a word that uses recent characters on the bottom row (across) or right column (down).
  // Cells there need fewer partner words, so it fits far more often than in the top-left corner.
  // Half the time the word is made only of recent characters.
  function plantLessonWord(idx, n, rng, lessonChars) {
    const both = [], some = [];
    for (const w of idx.W) {
      const k = (lessonChars.has(w[0]) ? 1 : 0) + (lessonChars.has(w[1]) ? 1 : 0);
      if (k === 2) both.push(w); else if (k === 1) some.push(w);
    }
    const pool = both.length && (rng() < 0.5 || !some.length) ? both : some;
    if (!pool.length) return new Map();
    const w = pool[Math.floor(rng() * pool.length)];
    const k = Math.floor(rng() * (n - 1));
    const a = rng() < 0.5 ? (n - 1) * n + k : k * n + (n - 1);
    return new Map([[a, w[0]], [a >= (n - 1) * n ? a + 1 : a + n, w[1]]]);
  }

  // Every 3×3 challenge grid: three row chains (AB BC) whose columns are chains too.
  // Random search keeps finding the same few, so list them all once (about a second) and sample.
  function allGrids3(idx) {
    if (idx.grids3) return idx.grids3;
    const nx = c => idx.next.get(c) || [];
    const chains = [], byStart = new Map();
    for (const [a, bs] of idx.next) for (const b of bs) for (const c of nx(b)) {
      if (c === a) continue;
      const ch = a + b + c;
      chains.push(ch);
      if (!byStart.has(a)) byStart.set(a, []);
      byStart.get(a).push(ch);
    }
    const out = [];
    for (const r0 of chains) for (const r1 of chains) {
      if (!idx.isWord(r0[0], r1[0]) || !idx.isWord(r0[1], r1[1]) || !idx.isWord(r0[2], r1[2])) continue;
      if (new Set(r0 + r1).size < 6) continue;
      for (const c0 of nx(r1[0])) for (const r2 of byStart.get(c0) || []) {
        if (idx.isWord(r1[1], r2[1]) && idx.isWord(r1[2], r2[2]) && new Set(r0 + r1 + r2).size === 9) out.push(r0 + r1 + r2);
      }
    }
    return (idx.grids3 = out);
  }

  // Score favours boards made of recent characters (a word made only of them counts extra).
  function score(idx, g, n, lessonChars) {
    let s = 0;
    for (const ch of g) if (lessonChars.has(ch)) s += 2;
    for (const w of wordsOnBoard(idx, g, n)) if (lessonChars.has(w[0]) && lessonChars.has(w[1])) s += 1;
    return s;
  }

  // ---------- puzzle ----------
  // opts: { n, easy, givens, bankMult, lessonChars:Set (recently learned characters), avoid:Set (recent solutions), seed }
  function generate(idx, opts) {
    const n = opts.n, rng = makeRng(opts.seed);
    const lessonChars = opts.lessonChars || new Set();
    const avoid = opts.avoid || new Set();
    let best = null, bestScore = -1;
    const consider = g => {
      if (!g || avoid.has(g.join(''))) return;
      const s = score(idx, g, n, lessonChars) + rng() * 3;
      if (s > bestScore) { best = g; bestScore = s; }
    };
    if (n === 3 && !opts.easy) {
      // Sample from the full list: the grids with the most recent characters, plus some random ones.
      const all = allGrids3(idx);
      const ranked = all.map(g => [[...g].filter(c => lessonChars.has(c)).length + rng() * 0.9, g]).sort((x, y) => y[0] - x[0]);
      ranked.slice(0, 80).forEach(([, g]) => consider([...g]));
      for (let k = 0; k < 20 && all.length; k++) consider([...all[Math.floor(rng() * all.length)]]);
    } else {
      const tries = n === 2 ? 40 : n === 3 ? 20 : 8;
      const prefer = lessonChars.size ? lessonChars : null;
      for (let k = 0; k < tries; k++) {
        // Most attempts plant a word with recent characters; the rest search freely so there is always a fallback.
        const pre = k % 3 === 2 ? new Map() : plantLessonWord(idx, n, rng, lessonChars);
        consider(findSolution(idx, n, rng, pre, opts.easy, prefer));
      }
    }
    if (!best) return null;

    // Givens: pick cells at random, then make sure no row or column is completely given.
    const nGiven = Math.min(opts.givens, n * n - 1);
    let given;
    for (let t = 0; t < 50; t++) {
      const pick = new Set(shuffle([...Array(n * n).keys()], rng).slice(0, nGiven));
      given = Array.from({ length: n * n }, (_, i) => pick.has(i));
      const fullRow = [...Array(n).keys()].some(r => rowOf(given, n, r).every(Boolean));
      const fullCol = [...Array(n).keys()].some(c => colOf(given, n, c).every(Boolean));
      if (n === 2 || (!fullRow && !fullCol)) break;
    }

    const blanks = best.filter((_, i) => !given[i]);
    const bank = [...blanks, ...pickDecoys(idx, best, given, n, blanks.length * (opts.bankMult - 1), rng, lessonChars)];
    return { n, solution: best, given, bank: shuffle(bank, rng) };
  }

  // Decoys: characters that make a word with one neighbour of a blank cell but don't fit the
  // whole puzzle (黑 fits 黑白, but 白马 next to it leaves no room). Topped up with lesson
  // characters, then random ones from the whole 字库.
  function pickDecoys(idx, sol, given, n, count, rng, lessonChars) {
    const taken = new Set(sol), out = [];
    const add = ch => { if (ch && !taken.has(ch) && out.length < count) { taken.add(ch); out.push(ch); } };
    const near = [];
    sol.forEach((_, i) => {
      if (given[i]) return;
      const r = Math.floor(i / n), c = i % n;
      const left = c > 0 ? sol[i - 1] : null, up = r > 0 ? sol[i - n] : null;
      const right = c < n - 1 ? sol[i + 1] : null, down = r < n - 1 ? sol[i + n] : null;
      // Prefer partners the child can see (givens), then any solution neighbour.
      const partners = [[left, 'L', c > 0 && given[i - 1]], [up, 'L', r > 0 && given[i - n]],
                        [right, 'R', c < n - 1 && given[i + 1]], [down, 'R', r < n - 1 && given[i + n]]];
      for (const [p, side, visible] of partners) {
        if (!p) continue;
        const fits = side === 'L' ? (idx.next.get(p) || []) : idx.chars.filter(x => idx.isWord(x, p));
        for (const x of fits) near.push({ x, w: visible ? 2 : 1 });
      }
    });
    shuffle(near, rng).sort((a, b) => b.w - a.w).forEach(d => add(d.x));
    shuffle([...lessonChars], rng).forEach(add);
    shuffle([...idx.pool], rng).forEach(add);
    return out;
  }

  // ---------- 2.0: lines, one two-character word on each ----------
  // Each line shows one character of a word and leaves the other blank. A line is right when its two
  // characters, read left to right, make a word. Lines don't affect each other.
  const rowIsWord = (idx, g, r) => idx.isWord(g[2 * r], g[2 * r + 1]);

  function checkLines(idx, g, n) {
    const badRows = [], badCells = new Set();
    for (let r = 0; r < n; r++) if (!rowIsWord(idx, g, r)) { badRows.push(r); badCells.add(2 * r); badCells.add(2 * r + 1); }
    return { ok: !badRows.length, badRows, badCols: [], badCells };
  }

  function linesWords(idx, g, n) {
    const out = [];
    for (let r = 0; r < n; r++) if (rowIsWord(idx, g, r)) out.push(g[2 * r] + g[2 * r + 1]);
    return out;
  }

  // Wrong characters worth tempting a child with: they make a word with the shown character, but in
  // the other order (黑白 is a word, 白黑 is not). Never a character that would also be right.
  function pickLineDecoys(idx, rows, count, rng, lessonChars, taken) {
    const out = [];
    const valid = (x, row) => (row.blank === 1 ? idx.isWord(row.shown, x) : idx.isWord(x, row.shown));
    const add = ch => {
      if (!ch || taken.has(ch) || out.length >= count || rows.some(row => valid(ch, row))) return;
      taken.add(ch); out.push(ch);
    };
    const traps = [];
    for (const row of rows) {
      for (const x of idx.chars) if (row.blank === 1 ? idx.isWord(x, row.shown) : idx.isWord(row.shown, x)) traps.push(x);
    }
    shuffle(traps, rng).slice(0, Math.ceil(count / 2)).forEach(add);
    shuffle([...lessonChars], rng).forEach(add);
    shuffle([...idx.pool], rng).forEach(add);
    return out;
  }

  // opts: { lines, bankMult, lessonChars:Set, avoid:Set (recent puzzles), seed }
  function generateLines(idx, opts) {
    const rng = makeRng(opts.seed), L = opts.lessonChars || new Set(), avoid = opts.avoid || new Set();
    const n = opts.lines, words = [...idx.W];
    // Words with recently learned characters are far more likely to be picked.
    const weight = w => 1 + 8 * ((L.has(w[0]) ? 1 : 0) + (L.has(w[1]) ? 1 : 0));
    const weights = words.map(weight);
    const pickWord = used => {
      let total = 0;
      const ok = [];
      words.forEach((w, i) => { if (!used.has(w[0]) && !used.has(w[1])) { ok.push(i); total += weights[i]; } });
      if (!ok.length) return null;
      let r = rng() * total;
      for (const i of ok) { r -= weights[i]; if (r <= 0) return words[i]; }
      return words[ok[ok.length - 1]];
    };
    for (let attempt = 0; attempt < 60; attempt++) {
      const used = new Set(), picked = [];
      while (picked.length < n) {
        const w = pickWord(used);
        if (!w) break;
        picked.push(w); used.add(w[0]); used.add(w[1]);
      }
      if (picked.length < n) continue;
      const key = picked.join('');
      if (avoid.has(key)) continue;
      // Blank the recently learned character when only one of the two is recent; otherwise a coin flip.
      const rows = picked.map(w => {
        const a = L.has(w[0]), b = L.has(w[1]);
        const blank = a !== b ? (a ? 0 : 1) : (rng() < 0.5 ? 0 : 1);
        return { word: w, blank, shown: w[1 - blank] };
      });
      const solution = picked.flatMap(w => [w[0], w[1]]);
      const given = rows.flatMap(row => (row.blank === 0 ? [false, true] : [true, false]));
      const answers = rows.map(row => row.word[row.blank]);
      const decoys = pickLineDecoys(idx, rows, answers.length * (opts.bankMult - 1), rng, L, new Set(solution));
      return { kind: 'lines', n, rows: n, cols: 2, key, solution, given, bank: shuffle([...answers, ...decoys], rng) };
    }
    return null;
  }

  return { buildIndex, generate, generateLines, checkLines, linesWords, checkHard, easyCellOk, wordsOnBoard, makeRng };
})();

if (typeof module !== 'undefined') module.exports = Engine;
