// Quick engine check: node tools/test_engine.js
// Generates puzzles at every size and confirms each solution passes the challenge rule.
const Engine = require('../js/engine.js');
const data = require('../assets/phrases.json');
const idx = Engine.buildIndex(data.phrases);
const lesson = new Set(data.lesson);
let fail = 0;
for (const [n, givens, easy] of [[2, 2, false], [3, 4, true], [3, 4, false], [4, 7, true], [4, 7, false]]) {
  const t = Date.now();
  let made = 0, lessonHits = 0;
  const seen = new Set();
  for (let k = 0; k < 30; k++) {
    const p = Engine.generate(idx, { n, easy, givens, bankMult: 3, lessonWords: lesson });
    if (!p) { fail++; continue; }
    made++;
    seen.add(p.solution.join(''));
    const ok = easy ? p.solution.every((_, i) => Engine.easyCellOk(idx, p.solution, n, i)) : Engine.checkHard(idx, p.solution, n).ok;
    if (!ok) { fail++; console.log('BAD', p.solution.join('')); }
    const blanks = p.given.filter(x => !x).length;
    if (p.bank.length !== blanks * 3 || new Set(p.bank).size !== p.bank.length) { fail++; console.log('BANK', p.bank.join('')); }
    if (Engine.wordsOnBoard(idx, p.solution, n).some(w => lesson.has(w))) lessonHits++;
    if (k === 0) console.log(' ', n + 'x' + n, p.solution.join('').match(new RegExp('.{' + n + '}', 'g')).join(' / '), '| bank', p.bank.join(''));
  }
  console.log(`${n}x${n}${easy ? ' easy' : ''}: ${made}/30 made, ${seen.size} different, ${lessonHits} use a lesson word, ${(Date.now() - t) / 30 | 0} ms each`);
}
// Rule spot checks
const g = ['爸', '爸', '妈', '妈'];
const g2 = ['白', '雪', '天', '花']; // 白雪 天花 | 白天 雪花
console.log('2x2 白雪/天花 hard ok:', Engine.checkHard(idx, g2, 2).ok);
const bad = ['白', '雪', '花', '天']; // 白花 ok, 雪天? not a word
console.log('2x2 白雪/花天 hard ok:', Engine.checkHard(idx, bad, 2).ok, 'easy cell3:', Engine.easyCellOk(idx, bad, 2, 3));
process.exit(fail ? 1 : 0);
