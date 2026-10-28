// Quick engine check: node tools/test_engine.js
// Generates puzzles at every size and confirms each solution passes the challenge rule.
const Engine = require('../js/engine.js');
const data = require('../assets/phrases.json');
const chars = require('../assets/characters.json');
const bankChars = new Set(Object.values(chars.categories).join(''));
const idx = Engine.buildIndex(data.phrases, [...bankChars]);
// Every word must be built from the bank, and every bank character needs a pinyin entry.
const outside = data.phrases.filter(w => ![...w].every(c => bankChars.has(c)));
if (outside.length) { console.log('WORDS OUTSIDE THE BANK', outside.join(' ')); process.exit(1); }
const noPinyin = [...bankChars].filter(c => !chars.chars[c]);
if (noPinyin.length) { console.log('NO PINYIN', noPinyin.join('')); process.exit(1); }
console.log(`bank ${bankChars.size} characters, ${data.phrases.length} words`);
const lesson = new Set(data.lessonChars);
if (lesson.size !== 60 || ![...lesson].every(c => bankChars.has(c))) { console.log('lessonChars should be 60 bank characters'); process.exit(1); }
let fail = 0;
for (const [n, givens, easy] of [[2, 2, false], [3, 4, true], [3, 4, false], [4, 7, true], [4, 7, false]]) {
  const t = Date.now();
  let made = 0, lessonCells = 0, cells = 0;
  const seen = new Set();
  for (let k = 0; k < 30; k++) {
    const p = Engine.generate(idx, { n, easy, givens, bankMult: 3, lessonChars: lesson });
    if (!p) { fail++; continue; }
    made++;
    seen.add(p.solution.join(''));
    const ok = easy ? p.solution.every((_, i) => Engine.easyCellOk(idx, p.solution, n, i)) : Engine.checkHard(idx, p.solution, n).ok;
    if (!ok) { fail++; console.log('BAD', p.solution.join('')); }
    const blanks = p.given.filter(x => !x).length;
    if (![...p.solution, ...p.bank].every(c => bankChars.has(c))) { fail++; console.log('OUTSIDE BANK', p.solution.join(''), p.bank.join('')); }
    if (p.bank.length !== blanks * 3 || new Set(p.bank).size !== p.bank.length) { fail++; console.log('BANK', p.bank.join('')); }
    lessonCells += p.solution.filter(c => lesson.has(c)).length; cells += n * n;
    if (k === 0) console.log(' ', n + 'x' + n, p.solution.join('').match(new RegExp('.{' + n + '}', 'g')).join(' / '), '| bank', p.bank.join(''));
  }
  console.log(`${n}x${n}${easy ? ' easy' : ''}: ${made}/30 made, ${seen.size} different, ${Math.round(100 * lessonCells / cells)}% of cells are recent characters, ${(Date.now() - t) / 30 | 0} ms each`);
}
// 2.0 lines: every line is a word, no character repeats, the bank holds the answers plus decoys that are never right.
for (const lines of [2, 3, 4, 5]) {
  const seen = new Set(); let made = 0, lessonCells = 0, cells = 0, traps = 0;
  const t = Date.now();
  for (let k = 0; k < 40; k++) {
    const p = Engine.generateLines(idx, { lines, bankMult: 3, lessonChars: lesson });
    if (!p) { fail++; console.log('NO LINES', lines); continue; }
    made++; seen.add(p.key);
    if (!Engine.checkLines(idx, p.solution, lines).ok) { fail++; console.log('BAD LINES', p.solution.join('')); }
    if (new Set(p.solution).size !== p.solution.length) { fail++; console.log('REPEAT', p.solution.join('')); }
    const blanks = p.given.filter(x => !x).length;
    if (p.bank.length !== blanks * 3 || new Set(p.bank).size !== p.bank.length) { fail++; console.log('LINES BANK', p.bank.join('')); }
    if (![...p.solution, ...p.bank].every(c => bankChars.has(c))) { fail++; console.log('LINES OUTSIDE BANK'); }
    // A decoy must not make a word in any line (otherwise it would be a second right answer).
    const answers = p.solution.filter((_, i) => !p.given[i]);
    const decoys = p.bank.filter(c => !answers.includes(c));
    for (const d of decoys) {
      for (let r = 0; r < lines; r++) {
        const blankFirst = !p.given[2 * r];
        const shown = p.solution[blankFirst ? 2 * r + 1 : 2 * r];
        if (blankFirst ? idx.isWord(d, shown) : idx.isWord(shown, d)) { fail++; console.log('DECOY IS RIGHT', d, shown); }
        if (blankFirst ? idx.isWord(shown, d) : idx.isWord(d, shown)) traps++;
      }
    }
    lessonCells += p.solution.filter(c => lesson.has(c)).length; cells += p.solution.length;
  }
  console.log(`lines ${lines}: ${made}/40 made, ${seen.size} different, ${Math.round(100 * lessonCells / cells)}% recent characters, ${traps} wrong-order decoys, ${(Date.now() - t) / 40 | 0} ms each`);
}
// Rule spot checks
const g = ['爸', '爸', '妈', '妈'];
const g2 = ['白', '雪', '天', '花']; // 白雪 天花 | 白天 雪花
console.log('2x2 白雪/天花 hard ok:', Engine.checkHard(idx, g2, 2).ok);
const bad = ['白', '雪', '花', '天']; // 白花 ok, 雪天? not a word
console.log('2x2 白雪/花天 hard ok:', Engine.checkHard(idx, bad, 2).ok, 'easy cell3:', Engine.easyCellOk(idx, bad, 2, 3));
process.exit(fail ? 1 : 0);
