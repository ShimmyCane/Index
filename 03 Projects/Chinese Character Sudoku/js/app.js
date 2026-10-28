// 汉字数独 — UI: board, drag-and-drop bank, settings, sounds, celebration.
const APP_VERSION = '0.2.0';
const CHANGELOG = [
  ['0.1.0', '2026-10-27', '第一版：2×2 到 4×4；从字库拖字；简单（放对马上变绿）和挑战（最后检查）；拼音、繁体、加新词、撤销、答案、完成音乐。'],
  ['0.2.0', '2026-10-28', '字库换成三张照片里的字（第3级新增60字、第4级240字、课本写字表100字，共266字）；词库只用这些字。'],
];

const $ = id => document.getElementById(id);
const STORE = 'ccs.';
const load = (k, d) => { try { const v = localStorage.getItem(STORE + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch (e) { logError('保存失败', e); } };

// Used only when assets/*.json can't load and nothing is cached (e.g. opened as a local file).
const FALLBACK = {
  lesson: ['喜欢', '主人', '国王', '公主', '过去', '还书', '高兴', '快乐'],
  phrases: '国王 王子 女王 王后 中国 国家 爸妈 白雪 雪花 白天 天花 大山 山上 上下 下山 天上 大小 小山 高山 山下 天下 一天 地上 地下 大地 天地 过去 来去 回去 出去 过来 出来 回来 上去 下去 快乐 高兴 主人 人家 大人 家人 公主 公园 学生 学校 老师 小鸟 大树 树上 上学 看见 好吃'.split(' '),
  pool: '',
};

const DEFAULTS = { n: 2, easy: true, givensMany: true, decoysMany: true, pinyin: false, trad: false, sound: true, showErrors: false };
const GIVENS = { true: { 2: 2, 3: 5, 4: 9 }, false: { 2: 1, 3: 4, 4: 7 } };

const S = {
  settings: { ...DEFAULTS, ...load('settings', {}) },
  data: null,          // { lesson, phrases, chars, words }
  idx: null,           // Engine word index
  lessonWords: new Set(),
  puzzle: null,        // { n, solution, given, bank }
  place: [],           // place[cell] = bank tile index, or null
  undo: [],
  checked: null,       // last challenge check result
  done: false,
  revealed: false,
  selected: null,      // bank tile chosen by tap
};

// ---------- errors (bottom panel, opt-in from ⚙️) ----------
const errors = [];
function logError(msg, err) {
  errors.push(`${new Date().toLocaleTimeString()} ${msg}${err ? ': ' + (err.message || err) : ''}`);
  const ol = $('errorList');
  if (ol) ol.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
}
window.addEventListener('error', e => logError('程序错误', e.error || e.message));
window.addEventListener('unhandledrejection', e => logError('程序错误', e.reason));

// ---------- data: live JSON → cached copy → small built-in list ----------
async function fetchJson(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(url, { cache: 'no-cache', signal: ctl.signal });
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return await r.json();
  } finally { clearTimeout(timer); }
}

async function loadData() {
  let data = null;
  try {
    const [p, c] = await Promise.all([fetchJson('assets/phrases.json'), fetchJson('assets/characters.json')]);
    data = { lesson: p.lesson, phrases: p.phrases, version: p.version, chars: c.chars || {}, words: c.words || {}, pool: Object.values(c.categories || {}).join('') };
    save('data', data);
  } catch (e) {
    data = load('data', null);
    logError(data ? '词库读取失败，用上次保存的' : '词库读取失败，用备用小词库', e);
    if (!data) data = { ...FALLBACK, version: '备用', chars: {}, words: {} };
  }
  S.data = data;
  rebuildIndex();
}

function rebuildIndex() {
  const extra = load('extraWords', []), extraLesson = load('extraLesson', []);
  S.idx = Engine.buildIndex([...S.data.phrases, ...S.data.lesson, ...extra], [...(S.data.pool || '')]);
  S.lessonWords = new Set([...S.data.lesson, ...extraLesson].filter(w => S.idx.W.has(w)));
}

// ---------- pinyin and traditional, using the word a cell makes when there is one ----------
function wordAt(i) {
  // A word on the board that includes cell i and has its own reading (还书 huán, 头发 髮).
  const { n } = S.puzzle, r = Math.floor(i / n), c = i % n, g = boardChars();
  const pairs = [];
  if (c > 0) pairs.push([i - 1, i]);
  if (c < n - 1) pairs.push([i, i + 1]);
  if (r > 0) pairs.push([i - n, i]);
  if (r < n - 1) pairs.push([i, i + n]);
  for (const [a, b] of pairs) {
    const w = (g[a] || '') + (g[b] || '');
    if (S.data.words[w] && S.idx.W.has(w)) return { w, pos: a === i ? 0 : 1 };
  }
  return null;
}
function pinyinOf(ch, cell) {
  if (cell != null) { const wa = wordAt(cell); if (wa) return S.data.words[wa.w][0].split(' ')[wa.pos]; }
  return (S.data.chars[ch] || [''])[0];
}
function showChar(ch, cell) {
  if (!S.settings.trad) return ch;
  if (cell != null) { const wa = wordAt(cell); if (wa) return [...S.data.words[wa.w][1]][wa.pos]; }
  return (S.data.chars[ch] || [ch, ch])[1];
}
function glyph(ch, cell) {
  const py = S.settings.pinyin ? `<span class="py">${pinyinOf(ch, cell)}</span>` : '';
  return `<span class="glyph">${py}<span>${showChar(ch, cell)}</span></span>`;
}
function wordPinyin(w) {
  if (S.data.words[w]) return S.data.words[w][0];
  return [...w].map(c => pinyinOf(c)).join(' ');
}
function wordShown(w) {
  if (!S.settings.trad) return w;
  return S.data.words[w] ? S.data.words[w][1] : [...w].map(c => showChar(c)).join('');
}

// ---------- puzzle state ----------
function boardChars() {
  const p = S.puzzle;
  return p.solution.map((ch, i) => p.given[i] ? ch : (S.place[i] == null ? null : p.bank[S.place[i]]));
}
const blanks = () => S.puzzle.given.map((g, i) => g ? -1 : i).filter(i => i >= 0);
const allFilled = () => blanks().every(i => S.place[i] != null);

function newPuzzle() {
  const st = S.settings, n = +st.n;
  const recent = load('recent', []);
  const p = Engine.generate(S.idx, {
    n, easy: st.easy, givens: GIVENS[st.givensMany][n], bankMult: st.decoysMany ? 3 : 2,
    lessonWords: S.lessonWords, avoid: new Set(recent),
  });
  if (!p) {
    logError(`出不了 ${n}×${n} 的题，词库可能太小`);
    setMessage('这个大小出不了题，换小一点试试 🙂');
    return;
  }
  save('recent', [p.solution.join(''), ...recent].slice(0, 40));
  S.puzzle = p;
  S.place = Array(n * n).fill(null);
  S.undo = []; S.checked = null; S.done = false; S.revealed = false; S.selected = null;
  saveGame();
  setMessage('');
  render();
}

function saveGame() {
  save('game', { v: S.data.version, puzzle: S.puzzle, place: S.place, done: S.done, revealed: S.revealed, mode: S.settings.easy });
}

function changePlace(fn) {
  S.undo.push(S.place.slice());
  if (S.undo.length > 100) S.undo.shift();
  const before = S.settings.easy ? goodCells() : new Set();
  fn();
  S.checked = null;
  S.selected = null;
  saveGame();
  render();
  if (S.settings.easy) {
    const now = goodCells();
    const newlyGood = [...now].some(i => !before.has(i));
    if (newlyGood) sfx.good(); else sfx.drop();
    if (allFilled() && blanks().every(i => now.has(i))) win();
  } else {
    sfx.drop();
    if (allFilled()) setMessage('都放好了，按 ✅ 检查吧！');
  }
}

function goodCells() {
  const g = boardChars(), n = S.puzzle.n;
  return new Set(blanks().filter(i => S.place[i] != null && Engine.easyCellOk(S.idx, g, n, i)));
}

function placeTile(tile, cell) {
  if (S.done || S.puzzle.given[cell]) return;
  changePlace(() => {
    const from = S.place.indexOf(tile);
    const old = S.place[cell];
    if (from >= 0) S.place[from] = old != null && from !== cell ? old : null; // swap when moving between cells
    S.place[cell] = tile;
  });
}
function returnTile(tile) {
  const from = S.place.indexOf(tile);
  if (from < 0 || S.done) return;
  changePlace(() => { S.place[from] = null; });
}

function undo() {
  if (!S.undo.length || S.done) return;
  S.place = S.undo.pop();
  S.checked = null;
  saveGame();
  render();
  sfx.pick();
}

function check() {
  if (S.done || !allFilled()) { setMessage('先把空格都填满哦'); return; }
  const res = Engine.checkHard(S.idx, boardChars(), S.puzzle.n);
  if (res.ok) { win(); return; }
  S.checked = res;
  render();
  sfx.bad();
  setMessage('有的字还不对，再试试！');
}

function showAnswer() {
  const p = S.puzzle, used = new Set();
  S.undo.push(S.place.slice());
  blanks().forEach(i => {
    const t = p.bank.findIndex((ch, k) => ch === p.solution[i] && !used.has(k));
    used.add(t);
    S.place[i] = t;
  });
  S.revealed = true; S.done = true; S.checked = null;
  saveGame();
  render();
  setMessage('这是一种答案（别的对法也算对）');
}

function win() {
  S.done = true;
  S.checked = null;
  const stars = load('stars', 0) + 1;
  save('stars', stars);
  saveGame();
  render();
  setMessage('完成了！🎉');
  const words = Engine.wordsOnBoard(S.idx, boardChars(), S.puzzle.n);
  $('cheerWords').innerHTML = words.map(wordChip).join('');
  $('celebrate').hidden = false;
  confetti();
  sfx.win();
}

// ---------- rendering ----------
function setMessage(t) { $('message').textContent = t; }

function render() {
  const st = S.settings, p = S.puzzle;
  if (!p) return;
  const n = p.n, g = boardChars();
  const good = st.easy ? goodCells() : new Set();
  const bad = S.checked ? S.checked.badCells : new Set();
  const badLine = i => S.checked && (S.checked.badRows.includes(Math.floor(i / n)) || S.checked.badCols.includes(i % n));

  const board = $('board');
  board.style.setProperty('--n', n);
  board.innerHTML = p.solution.map((_, i) => {
    const edge = (i % n === n - 1 ? ' lastCol' : '') + (i >= n * (n - 1) ? ' lastRow' : '');
    if (p.given[i]) return `<div class="cell given${edge}${badLine(i) ? ' lineBad' : ''}">${glyph(g[i], i)}</div>`;
    const t = S.place[i];
    const tile = t == null ? '' :
      `<div class="tile placed${good.has(i) ? ' good' : ''}${bad.has(i) ? ' bad' : ''}${S.revealed ? ' revealed' : ''}" data-tile="${t}">${glyph(g[i], i)}</div>`;
    return `<div class="cell slot${t == null ? ' empty' : ''}${edge}${badLine(i) ? ' lineBad' : ''}" data-cell="${i}">${tile}</div>`;
  }).join('');

  $('bank').innerHTML = p.bank.map((ch, k) => {
    const used = S.place.includes(k);
    return `<div class="bankSlot">${used ? '' : `<div class="tile${S.selected === k ? ' selected' : ''}" data-tile="${k}">${glyph(ch)}</div>`}</div>`;
  }).join('');

  // Words made so far: always in easy mode; in challenge mode only once finished.
  const showWords = st.easy || S.done;
  $('wordsPanel').hidden = !showWords;
  if (showWords) {
    const ws = Engine.wordsOnBoard(S.idx, g, n);
    $('madeWords').innerHTML = ws.length ? ws.map(wordChip).join('') : '<span class="muted">还没有词</span>';
  }

  $('levelTag').textContent = `${n}×${n} · ${st.easy ? '简单' : '挑战'}`;
  $('ruleText').textContent = st.easy
    ? '每个字要和旁边的字组成词（横着从左往右，竖着从上往下）'
    : '每一行 → 和每一列 ↓ 里，每个字都要组成词';
  $('checkBtn').hidden = st.easy;
  $('checkBtn').disabled = S.done;
  // The answer is offered only at the end: after a challenge check, or once an easy board is full.
  $('answerBtn').hidden = S.done || (st.easy ? !allFilled() : !S.checked);
  $('undoBtn').disabled = !S.undo.length || S.done;
  $('stars').textContent = load('stars', 0);
}

function wordChip(w) {
  const lesson = S.lessonWords.has(w) ? ' lesson' : '';
  const py = S.settings.pinyin ? `<small>${wordPinyin(w)}</small>` : '';
  return `<span class="word${lesson}">${py}${wordShown(w)}</span>`;
}

// ---------- drag and drop (pointer events work for finger and mouse) ----------
let drag = null;
function onDown(e) {
  sfx.unlock();
  const tileEl = e.target.closest('.tile');
  if (!tileEl || S.done) return;
  e.preventDefault();
  drag = { tile: +tileEl.dataset.tile, el: tileEl, x: e.clientX, y: e.clientY, moved: false, ghost: null, over: null };
}
function onMove(e) {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
  if (!drag.moved) {
    drag.moved = true;
    const gh = document.createElement('div');
    gh.className = 'tile ghost';
    gh.innerHTML = glyph(S.puzzle.bank[drag.tile]);
    document.body.appendChild(gh);
    drag.ghost = gh;
    drag.el.classList.add('lifted');
    sfx.pick();
  }
  drag.ghost.style.left = e.clientX + 'px';
  drag.ghost.style.top = e.clientY + 'px';
  const target = dropTarget(e);
  if (drag.over !== target) {
    if (drag.over) drag.over.classList.remove('over');
    if (target) target.classList.add('over');
    drag.over = target;
  }
}
function onUp(e) {
  if (!drag) return;
  const d = drag;
  drag = null;
  if (d.over) d.over.classList.remove('over');
  if (d.ghost) d.ghost.remove();
  d.el.classList.remove('lifted');
  const fromCell = S.place.indexOf(d.tile);
  if (!d.moved) {
    // Tap: a placed tile goes home; a bank tile is selected for tap-to-place.
    if (fromCell >= 0) returnTile(d.tile);
    else { S.selected = S.selected === d.tile ? null : d.tile; render(); sfx.pick(); }
    return;
  }
  const target = dropTarget(e);
  if (target && target.dataset.cell != null) placeTile(d.tile, +target.dataset.cell);
  else if (fromCell >= 0) returnTile(d.tile);
  else render();
}
function dropTarget(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return null;
  return el.closest('.slot') || el.closest('#bank');
}
function onBoardTap(e) {
  // Tap an empty cell after selecting a bank tile.
  const slot = e.target.closest('.slot');
  if (slot && S.selected != null && !e.target.closest('.tile')) placeTile(S.selected, +slot.dataset.cell);
}

// ---------- sounds (Web Audio, no files) ----------
const sfx = (() => {
  let ctx = null;
  const on = () => S.settings.sound;
  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { logError('声音打不开', e); }
  }
  function tone(freq, at, dur, type = 'triangle', vol = 0.18) {
    if (!ctx || !on()) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const N = { C4: 262, G3: 196, F4: 349, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, C6: 1047, E6: 1319, G6: 1568 };
  return {
    unlock,
    pick: () => tone(660, 0, 0.08, 'sine', 0.12),
    drop: () => { tone(440, 0, 0.09, 'sine', 0.14); tone(330, 0.05, 0.12, 'sine', 0.1); },
    good: () => { tone(N.E5, 0, 0.15); tone(N.A5, 0.09, 0.25); },
    bad: () => { tone(220, 0, 0.18, 'triangle', 0.14); tone(185, 0.15, 0.25, 'triangle', 0.12); },
    // 一闪一闪亮晶晶 (Twinkle Twinkle), then a sparkle run.
    win: () => {
      const tune = [['C5', 1], ['C5', 1], ['G5', 1], ['G5', 1], ['A5', 1], ['A5', 1], ['G5', 2], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1], ['C5', 2]];
      const bass = ['C4', 'C4', 'F4', 'C4', 'F4', 'C4', 'G3', 'C4'];
      const beat = 0.24;
      let t = 0;
      tune.forEach(([note, len]) => { tone(N[note], t, beat * len * 0.95, 'triangle', 0.2); t += beat * len; });
      bass.forEach((note, k) => tone(N[note], k * beat * 2, beat * 1.9, 'sine', 0.1));
      ['C6', 'E6', 'G6', 'C6', 'E6', 'G6'].forEach((note, k) => tone(N[note], t + k * 0.07, 0.3, 'sine', 0.08));
    },
  };
})();

function confetti() {
  const box = $('confetti'), colors = ['#ffd8b8', '#c8f0e0', '#ff9e8a', '#e3d7ff', '#ffe58f', '#b8e0ff'];
  box.innerHTML = Array.from({ length: 70 }, () => {
    const left = Math.random() * 100, delay = Math.random() * 0.8, dur = 2.2 + Math.random() * 1.8;
    const c = colors[Math.floor(Math.random() * colors.length)];
    return `<i style="left:${left}%;background:${c};animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
  }).join('');
}

// ---------- settings drawer ----------
function renderSettings() {
  document.querySelectorAll('.seg').forEach(seg => {
    const v = S.settings[seg.dataset.key];
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(b.dataset.v) === String(typeof v === 'boolean' ? +v : v)));
  });
  $('errorsPanel').hidden = !S.settings.showErrors;
  const extra = load('extraWords', []);
  $('extraInfo').textContent = extra.length ? `我加的词（${extra.length}）：${extra.join(' ')}` : '还没有加词。长期保存请加到 assets/phrases.json。';
  $('dataInfo').innerHTML = `${S.idx.W.size} 个词 · ${S.idx.pool.length} 个字 · 版本 ${S.data.version || ''}<br>最近学的：${[...S.lessonWords].join(' ') || '（无）'}`;
  $('doneCount').textContent = load('stars', 0);
  $('version').textContent = 'v' + APP_VERSION;
  $('changelog').innerHTML = CHANGELOG.map(([v, d, t]) => `<li><b>v${v}</b> ${d}：${t}</li>`).join('');
}

function setSetting(key, raw) {
  const v = key === 'n' ? +raw : raw === '1';
  if (S.settings[key] === v) return;
  S.settings[key] = v;
  save('settings', S.settings);
  renderSettings();
  // Size, mode, givens and bank size need a new puzzle; the rest just redraw.
  if (['n', 'easy', 'givensMany', 'decoysMany'].includes(key)) newPuzzle(); else render();
}

function saveWords() {
  const found = ($('newWords').value.match(/[一-鿿]+/g) || []).filter(w => w.length === 2 && w[0] !== w[1]);
  const skipped = ($('newWords').value.match(/[一-鿿]+/g) || []).filter(w => w.length !== 2);
  if (!found.length) { $('extraInfo').textContent = '没找到两个字的词。例子：春天 花朵'; return; }
  save('extraWords', [...new Set([...load('extraWords', []), ...found])]);
  if ($('newIsLesson').checked) save('extraLesson', [...new Set([...load('extraLesson', []), ...found])]);
  $('newWords').value = '';
  rebuildIndex();
  renderSettings();
  if (skipped.length) $('extraInfo').textContent += `（跳过了不是两个字的：${skipped.join(' ')}）`;
  newPuzzle();
}

// ---------- start ----------
function wire() {
  document.addEventListener('pointerdown', onDown);
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
  $('board').addEventListener('click', onBoardTap);
  $('undoBtn').onclick = undo;
  $('newBtn').onclick = () => { sfx.pick(); newPuzzle(); };
  $('checkBtn').onclick = check;
  $('answerBtn').onclick = showAnswer;
  $('nextBtn').onclick = () => { $('celebrate').hidden = true; newPuzzle(); };
  $('gear').onclick = () => { renderSettings(); $('drawer').hidden = !$('drawer').hidden; };
  $('closeDrawer').onclick = () => { $('drawer').hidden = true; };
  document.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) setSetting(seg.dataset.key, b.dataset.v);
  }));
  $('saveWords').onclick = saveWords;
  $('clearWords').onclick = () => { save('extraWords', []); save('extraLesson', []); rebuildIndex(); renderSettings(); };
  $('resetStars').onclick = () => { save('stars', 0); renderSettings(); render(); };
  $('clearErrors').onclick = () => { errors.length = 0; $('errorList').innerHTML = ''; };
}

async function start() {
  wire();
  await loadData();
  renderSettings();
  const g = load('game', null);
  const st = S.settings;
  // A saved puzzle from an older word list may use characters that are no longer in the bank.
  if (g && g.puzzle && g.v === S.data.version && g.puzzle.n === +st.n && g.mode === st.easy && !g.done) {
    Object.assign(S, { puzzle: g.puzzle, place: g.place, done: g.done, revealed: g.revealed });
    render();
  } else {
    newPuzzle();
  }
}
start();
