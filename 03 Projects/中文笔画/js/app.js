// 中文筆畫: 看拼音，一筆一筆把字寫出來。
// Each weekly batch is a tab (by upload date, newest first). Strokes come from data/strokes.js (hanzi-writer).
// A wrong stroke is corrected on the spot; after a set number of misses the right answer is shown and
// its stroke order is played, then the child writes it again. Hints match 中文汉字数独 3.0 (描红).
// Shares the look (style.css) with that game; the feedback box follows 02 Refs/Skills/feedback_notes.md.

const APP_VERSION = '0.1.0';
const CHANGELOG = [
  '0.1.0 第一版：按上傳日期分頁，描紅、筆順提示、寫錯給答案，改進意見',
];

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];

function logError(msg, err) {
  errors.push(`${new Date().toLocaleTimeString()} ${msg}${err ? ': ' + (err.message || err) : ''}`);
  $('errorList').innerHTML = errors.map(e => `<li>${e}</li>`).join('');
  $('errorsPanel').hidden = !S.settings.showErrors;
}
function load(key, fallback) {
  try { const v = localStorage.getItem('zhbh.' + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem('zhbh.' + key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
}

const DEFAULTS = { traceGuide: true, showAfter: 2, animSpeed: 'normal', readAloud: true, strokeNames: true, sound: true, showErrors: false };
const S = {
  settings: { ...DEFAULTS, ...load('settings', {}) },
  batches: Array.isArray(window.BATCHES) ? window.BATCHES : [],
  strokes: window.STROKES || {},
  tab: 0,
};
const T = {
  writer: null, writerKey: '', writerCh: '',
  item: null, n: 0, next: 0, mistakes: 0, hints: 0, slips: [], marks: [],
  finished: false, revealed: false, busy: false,
};

// ---------- speech (Web Speech, silent if the browser can't speak) ----------
const Say = (() => {
  const can = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let voice = null;
  function pickVoice() {
    try {
      const vs = speechSynthesis.getVoices();
      voice = vs.find(v => /^zh[-_](TW|HK|CN)/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
    } catch (e) { voice = null; }
  }
  if (can()) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW'; u.rate = 0.7;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  return {
    unlock() { if (can()) { try { speak(''); } catch (e) { /* nothing to unlock */ } } },
    read(text) {
      if (!can() || !S.settings.readAloud || !text) return;
      try { speechSynthesis.cancel(); speak(text); } catch (e) { logError('朗讀出錯', e); }
    },
    queue(text) {
      if (!can() || !S.settings.readAloud || !text) return;
      try { speak(text); } catch (e) { logError('朗讀出錯', e); }
    },
    cancel() { if (can()) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } } },
  };
})();

// ---------- recorded characters (audio/u<hex>.mp3, made by tools/make_audio.py); iPad voice if a file is missing ----------
const Clip = {
  read(ch) {
    if (!ch || !S.settings.readAloud) return;
    const a = new Audio(`audio/u${ch.codePointAt(0).toString(16)}.mp3`);
    a.onerror = () => Say.read(ch);
    a.play().catch(() => Say.read(ch));
  },
};

// ---------- sounds (Web Audio, made in code) ----------
const sfx = (() => {
  let ctx = null;
  const on = () => S.settings.sound;
  function tone(freq, dur, type = 'sine', vol = 0.15, when = 0) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime + when;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* no audio here */ }
  }
  return {
    good() { if (on()) { tone(660, 0.12); tone(880, 0.14, 'sine', 0.15, 0.08); } },
    bad() { if (on()) tone(220, 0.2, 'triangle', 0.15); },
    pick() { if (on()) tone(520, 0.06, 'square', 0.05); },
    win() { if (on()) [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.15, i * 0.12)); },
  };
})();

// ---------- stroke names: only the names checked in data/batches.json (item "names"); nothing is guessed ----------
const nameOf = i => (T.item && T.item.names && T.item.names[i]) || '';
const names = () => S.settings.strokeNames !== false;

// ---------- the writing board ----------
function boardSize() { return Math.max(200, Math.round($('traceBoard').clientWidth)); }
function pad(w) { return Math.round(w * 0.06); }

function ensureWriter() {
  if (typeof HanziWriter === 'undefined') throw new Error('hanzi-writer.min.js 沒有載入');
  const w = boardSize();
  const speed = S.settings.animSpeed === 'slow' ? 0.5 : 1;
  const key = speed + '|' + S.settings.traceGuide;
  if (T.writer && T.writerKey === key) { T.writer.updateDimensions({ width: w, height: w, padding: pad(w) }); return; }
  $('traceTarget').innerHTML = '';
  T.writer = HanziWriter.create($('traceTarget'), T.item.ch, {
    width: w, height: w, padding: pad(w),
    charDataLoader: (char, ok, fail) => (S.strokes[char] ? ok(S.strokes[char]) : fail()),
    showCharacter: false, showOutline: S.settings.traceGuide,
    strokeColor: '#3b3248', outlineColor: '#dac9a8', drawingColor: '#3b3248',
    highlightColor: '#35b383', radicalColor: '#3f9d9a',
    drawingWidth: Math.max(8, Math.round(w / 24)),
    strokeAnimationSpeed: speed, strokeFadeDuration: 250, delayBetweenStrokes: 300,
    leniency: 1.4, showHintAfterMisses: false, markStrokeCorrectAfterMisses: 5, highlightOnComplete: false,
  });
  T.writerKey = key;
  T.writerCh = T.item.ch;
}

function say(t) { $('message').textContent = t; }

function renderDots(box = $('strokeDots'), big = false) {
  box.classList.toggle('big', big);
  box.innerHTML = Array.from({ length: T.n }, (_, i) => {
    const cls = T.marks[i] || (i === T.next && !T.finished ? 'next' + (T.slips[i] ? ' slip' : '') : '');
    return `<i class="${cls}">${i + 1}</i>`;
  }).join('');
}

// ---------- one attempt ----------
function startQuiz() {
  Object.assign(T, { next: 0, mistakes: 0, hints: 0, slips: [], marks: [], finished: false });
  $('done').hidden = true;
  renderDots();
  ensureWriter();
  if (T.revealed) {
    say('跟著寫一次，記住它');
  } else {
    say('照著淡淡的字，一筆一筆寫，注意筆順喔');
    Clip.read(T.item.ch);
    if (names() && T.n) Say.queue(nameOf(0));
  }
  T.writer.quiz({
    showOutline: S.settings.traceGuide,
    onMistake: s => {
      T.mistakes++; T.slips[s.strokeNum] = true;
      sfx.bad();
      say(s.isBackwards ? '這一筆寫反了，換個方向' : `不對哦，現在該寫第 ${s.strokeNum + 1} 筆`);
      renderDots();
      if (!T.revealed && T.mistakes >= S.settings.showAfter) reveal();
    },
    onCorrectStroke: s => {
      T.marks[s.strokeNum] = T.slips[s.strokeNum] ? 'slip' : 'ok';
      T.next = s.strokeNum + 1;
      sfx.good();
      say(T.next < T.n ? `好！下一筆是第 ${T.next + 1} 筆` : '');
      if (names() && T.next < T.n) Say.queue(nameOf(T.next));
      renderDots();
    },
    onComplete: () => finish(),
  });
}

// Wrong too many times (or 👀 pressed): show the right answer, play its stroke order, then write it again.
async function reveal() {
  if (T.revealed || T.busy || !T.writer) return;
  T.revealed = true;
  T.writer.cancelQuiz();
  say('沒關係，看看正確的寫法');
  Clip.read(T.item.ch);
  await animate();
}

// ---------- grade ----------
function finish() {
  T.finished = true;
  const clean = T.marks.filter(m => m === 'ok').length;
  const stars = T.revealed ? 1 : T.mistakes === 0 && T.hints === 0 ? 3 : T.mistakes + T.hints <= 2 ? 2 : 1;
  const best = load('stars', {});
  best[T.item.ch] = Math.max(best[T.item.ch] || 0, stars);
  save('stars', best);
  renderDots(); renderPicker(); renderTotals();
  $('doneTitle').textContent = stars === 3 ? '筆順全對！' : '寫完了！';
  $('doneStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('doneText').textContent = T.revealed
    ? `這個字看了答案，再寫一次，下次會更好。`
    : stars === 3
    ? `${T.n} 筆都是第一次就寫對，一筆都沒錯！`
    : `${T.n} 筆裡有 ${clean} 筆一次寫對${T.hints ? `，用了 ${T.hints} 次提示` : ''}。再寫一次，拿更多星星吧！`;
  renderDots($('doneDots'), true);
  say('');
  setTimeout(() => {
    if (!T.finished) return;
    $('done').hidden = false;
    if (stars >= 2) sfx.win(); else sfx.good();
    Clip.read(T.item.ch);
  }, 700);
}

// ---------- buttons ----------
async function animate() {
  if (!T.writer || T.busy) return;
  T.busy = true;
  T.writer.cancelQuiz();
  $('done').hidden = true;
  await T.writer.hideCharacter({ duration: 0 });
  await T.writer.showOutline();
  T.next = -1; T.marks = []; T.finished = false;
  for (let i = 0; i < T.n; i++) {
    T.next = i;
    renderDots();
    say(`第 ${i + 1} 筆`);
    sfx.pick();
    await T.writer.animateStroke(i);
    T.marks[i] = 'ok';
    await sleep(250);
  }
  await sleep(500);
  T.busy = false;
  await T.writer.hideCharacter({ duration: 0 });
  startQuiz();
  say('現在你來寫！');
}

function hint() {
  if (!T.writer || T.busy || T.finished) return;
  T.hints++;
  say(`💡 看，這是第 ${T.next + 1} 筆`);
  if (names()) Say.read(nameOf(T.next));
  T.writer.highlightStroke(T.next);
  renderDots();
}

function help() {
  if (!T.writer || T.busy || T.finished) return;
  const nm = nameOf(T.next);
  say(nm ? `🙋 這一筆叫「${nm}」` : `🙋 這是第 ${T.next + 1} 筆`);
  if (nm) Say.read(nm);
}

function redo() {
  if (!T.writer || T.busy) return;
  T.writer.cancelQuiz();
  startQuiz();
}

// ---------- tabs, picking, info ----------
const tabItems = () => (S.batches[S.tab] ? S.batches[S.tab].items : []);
const tabLabel = () => (S.batches[S.tab] ? `${S.batches[S.tab].date} · ${S.batches[S.tab].lesson}` : '');

function renderTabs() {
  $('tabs').innerHTML = S.batches.map((b, i) =>
    `<button class="tab${i === S.tab ? ' on' : ''}" data-i="${i}">${b.date} · ${b.lesson}</button>`).join('');
  $('lessonTag').textContent = S.batches[S.tab] ? S.batches[S.tab].lesson : '';
}

function renderPicker() {
  const best = load('stars', {});
  $('pickGrid').innerHTML = tabItems().map(it => {
    const s = best[it.ch] || 0;
    return `<div class="pick s${s}${T.item && it.ch === T.item.ch ? ' cur' : ''}" data-ch="${it.ch}">${it.ch}${s ? `<small>${'★'.repeat(s)}</small>` : ''}</div>`;
  }).join('');
}

function renderInfo() {
  $('big').textContent = T.item.ch;
  $('py').textContent = T.item.py;
  $('count').textContent = `${T.n} 筆`;
  $('lessonTag').textContent = S.batches[S.tab].lesson;
}

function renderTotals() {
  const best = load('stars', {});
  const got = Object.keys(best).filter(c => best[c] > 0).length;
  $('starTotal').textContent = Object.values(best).reduce((a, b) => a + b, 0);
  $('doneCount').textContent = got;
}

function pickNext() {
  const items = tabItems();
  if (!items.length) return null;
  const best = load('stars', {});
  const cur = T.item && T.item.ch;
  const pool = items.filter(i => i.ch !== cur);
  const list = pool.length ? pool : items;
  const lowest = Math.min(...list.map(i => best[i.ch] || 0));
  const cands = list.filter(i => (best[i.ch] || 0) === lowest);
  return cands[Math.floor(Math.random() * cands.length)];
}

function setItem(item) {
  if (!item) { logError('這一課沒有字'); return; }
  if (!S.strokes[item.ch]) { logError(`「${item.ch}」沒有筆順資料，請重新產生 data/strokes.js`); say('這個字還沒有筆順資料'); return; }
  T.item = item;
  T.n = S.strokes[item.ch].strokes.length;
  T.revealed = false;
  T.busy = false;
  ensureWriter();
  if (T.writerCh !== item.ch) { T.writer.cancelQuiz(); T.writer.setCharacter(item.ch); T.writerCh = item.ch; }
  renderInfo();
  renderPicker();
  if (window.AppNotes) AppNotes.setContext({ item: item.ch, label: `${tabLabel()} · ${item.ch}` });
  startQuiz();
}

function selectTab(i) {
  S.tab = i;
  save('tab', S.batches[i].date);
  renderTabs();
  setItem(pickNext());
}

// ---------- settings (gear drawer) ----------
const BOOL_KEYS = ['traceGuide', 'readAloud', 'strokeNames', 'sound', 'showErrors'];
function asStr(v) { return typeof v === 'boolean' ? (v ? '1' : '0') : String(v); }
function syncSettings() {
  document.querySelectorAll('.seg[data-key]').forEach(seg => {
    const cur = asStr(S.settings[seg.dataset.key]);
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === cur));
  });
  $('errorsPanel').hidden = !S.settings.showErrors;
}
function setSetting(key, raw) {
  let v = raw;
  if (BOOL_KEYS.includes(key)) v = raw === '1';
  else if (key === 'showAfter') v = Number(raw);
  S.settings[key] = v;
  save('settings', S.settings);
  syncSettings();
  if (key === 'traceGuide' || key === 'animSpeed') {
    // The board is rebuilt on the next attempt with the new guide and speed.
    if (T.item) { T.writer = null; T.writerCh = ''; setItem(T.item); }
  }
}

// ---------- startup ----------
function init() {
  $('version').textContent = APP_VERSION;
  $('changelog').innerHTML = CHANGELOG.map(l => `<li>${l}</li>`).join('');
  syncSettings();
  if (!S.batches.length) { logError('沒有字表資料（data/batches.js）'); say('還沒有字表'); return; }
  const savedDate = load('tab', null);
  const idx = S.batches.findIndex(b => b.date === savedDate);
  S.tab = idx >= 0 ? idx : 0;
  renderTabs();
  setItem(pickNext());
  renderTotals();
}

document.addEventListener('DOMContentLoaded', () => {
  $('tabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (b) selectTab(Number(b.dataset.i));
  });
  $('pickGrid').addEventListener('click', e => {
    const p = e.target.closest('[data-ch]'); if (!p) return;
    const item = tabItems().find(i => i.ch === p.dataset.ch);
    if (item) setItem(item);
  });
  $('btnSay').addEventListener('click', () => { Say.unlock(); Clip.read(T.item && T.item.ch); });
  $('btnHelp').addEventListener('click', help);
  $('btnHint').addEventListener('click', hint);
  $('btnAnim').addEventListener('click', () => { Say.unlock(); animate(); });
  $('btnAnswer').addEventListener('click', () => { Say.unlock(); reveal(); });
  $('btnRedo').addEventListener('click', redo);
  $('btnAgain').addEventListener('click', redo);
  $('btnNext').addEventListener('click', () => { Say.cancel(); setItem(pickNext()); });
  $('btnNext2').addEventListener('click', () => { Say.cancel(); setItem(pickNext()); });
  $('gear').addEventListener('click', () => { $('drawer').hidden = false; });
  $('closeDrawer').addEventListener('click', () => { $('drawer').hidden = true; });
  document.querySelectorAll('.seg[data-key] button').forEach(b => b.addEventListener('click', () => {
    setSetting(b.parentElement.dataset.key, b.dataset.v);
  }));
  $('resetStars').addEventListener('click', () => { save('stars', {}); renderPicker(); renderTotals(); });
  $('clearErrors').addEventListener('click', () => { errors.length = 0; $('errorList').innerHTML = ''; });
  init();
});
