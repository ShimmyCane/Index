// 3.0 描红: write one of the recently learned characters stroke by stroke with a finger or Apple Pencil.
// Strokes must be written in the right order; the grade at the end counts the strokes written right first time.
// Stroke outlines: hanzi-writer-data (Arphic Public License, a Kai-style typeface), drawn and matched by
// Hanzi Writer (MIT). Both are bundled, so it works offline. Shares settings, sounds and storage with app.js.
const Trace = (() => {
  const T = {
    strokes: null,   // { char: { strokes, medians, radStrokes } } from assets/strokes.json
    writer: null,
    cur: null,       // character being written
    n: 0,            // its stroke count
    next: 0,         // index of the stroke to write next
    mistakes: 0,
    hints: 0,
    slips: [],       // slips[i]: stroke i needed more than one try
    marks: [],       // marks[i]: 'ok' (right first time) or 'slip' (right after misses)
    finished: false,
    busy: false,     // the stroke animation is playing
    shown: false,
  };
  const el = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const guide = () => S.settings.traceGuide !== false;
  const progress = () => load('trace', {});
  const say = t => { el('traceMessage').textContent = t; };

  // ---------- data: live JSON -> cached copy ----------
  async function ensureData() {
    if (T.strokes) return true;
    try {
      T.strokes = await fetchJson('assets/strokes.json');
      save('strokes', T.strokes);
    } catch (e) {
      T.strokes = load('strokes', null);
      logError(T.strokes ? '笔顺数据读取失败，用上次保存的' : '笔顺数据读取失败', e);
    }
    return !!T.strokes;
  }
  const chars = () => [...S.lessonChars].filter(c => T.strokes && T.strokes[c]);

  // ---------- the writing board ----------
  const boardSize = () => Math.max(200, Math.round(el('traceBoard').clientWidth));
  const pad = w => Math.round(w * 0.06);

  function ensureWriter() {
    if (typeof HanziWriter === 'undefined') throw new Error('hanzi-writer.min.js 没加载到');
    const w = boardSize();
    if (T.writer) { T.writer.updateDimensions({ width: w, height: w, padding: pad(w) }); return; }
    T.writer = HanziWriter.create(el('traceTarget'), T.cur, {
      width: w, height: w, padding: pad(w),
      charDataLoader: (char, ok, fail) => (T.strokes[char] ? ok(T.strokes[char]) : fail()),
      showCharacter: false, showOutline: guide(),
      strokeColor: '#3b3248', outlineColor: '#dac9a8', drawingColor: '#3b3248',
      highlightColor: '#35b383', radicalColor: '#3f9d9a',
      drawingWidth: Math.max(8, Math.round(w / 24)),
      strokeAnimationSpeed: 0.8, strokeFadeDuration: 250, delayBetweenStrokes: 300,
      leniency: 1.4, showHintAfterMisses: 2, markStrokeCorrectAfterMisses: 5, highlightOnComplete: false,
    });
  }

  // ---------- one attempt at the current character ----------
  function startQuiz() {
    T.next = 0; T.mistakes = 0; T.hints = 0; T.slips = []; T.marks = []; T.finished = false;
    el('traceDone').hidden = true;
    renderDots();
    say('照着淡淡的字，一笔一笔写，注意笔顺哦');
    T.writer.quiz({
      showOutline: guide(),
      onMistake: s => {
        T.mistakes++; T.slips[s.strokeNum] = true;
        sfx.bad();
        say(s.isBackwards ? '这一笔写反了，换个方向' : `不对哦，现在该写第 ${s.strokeNum + 1} 笔`);
        renderDots();
      },
      onCorrectStroke: s => {
        T.marks[s.strokeNum] = T.slips[s.strokeNum] ? 'slip' : 'ok';
        T.next = s.strokeNum + 1;
        sfx.good();
        say(T.next < T.n ? `好！下一笔是第 ${T.next + 1} 笔` : '');
        renderDots();
      },
      onComplete: () => finish(),
    });
  }

  function renderDots(box = el('strokeDots'), big = false) {
    box.classList.toggle('big', big);
    box.innerHTML = Array.from({ length: T.n }, (_, i) => {
      const cls = T.marks[i] || (i === T.next && !T.finished ? 'next' + (T.slips[i] ? ' slip' : '') : '');
      return `<i class="${cls}">${i + 1}</i>`;
    }).join('');
  }

  // ---------- grade ----------
  function finish() {
    T.finished = true;
    const clean = T.marks.filter(m => m === 'ok').length;
    const stars = T.mistakes === 0 && T.hints === 0 ? 3 : T.mistakes + T.hints <= 2 ? 2 : 1;
    const best = progress();
    best[T.cur] = Math.max(best[T.cur] || 0, stars);
    save('trace', best);
    save('stars', load('stars', 0) + 1);
    el('stars').textContent = load('stars', 0);
    renderPicker();
    renderDots();
    el('traceTitle').textContent = stars === 3 ? '笔顺全对！' : '写完了！';
    el('gradeStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    el('gradeText').textContent = stars === 3
      ? `${T.n} 笔都是第一次就写对，一笔都没错！`
      : `${T.n} 笔里有 ${clean} 笔一次写对${T.hints ? `，用了 ${T.hints} 次提示` : ''}。再写一次，拿更多星星吧！`;
    renderDots(el('gradeDots'), true);
    say('');
    setTimeout(() => {
      if (!T.shown) return;
      el('traceDone').hidden = false;
      confetti('traceConfetti');
      if (stars >= 2) sfx.win(); else sfx.good();
    }, 700);
  }

  // ---------- picking a character ----------
  function pickNext() {
    const all = chars();
    const best = progress();
    const pool = all.filter(c => c !== T.cur);
    if (!pool.length) return all[0];
    const lowest = Math.min(...pool.map(c => best[c] || 0));
    const cands = pool.filter(c => (best[c] || 0) === lowest);
    return cands[Math.floor(Math.random() * cands.length)];
  }

  function exampleWords(c) {
    const ws = [...S.idx.W].filter(w => w.includes(c));
    // Words made of recently learned characters first, then a little shuffle.
    const score = w => ([...w].every(x => S.lessonChars.has(x)) ? 2 : 0) + Math.random();
    return ws.sort((a, b) => score(b) - score(a)).slice(0, 3);
  }

  function renderInfo() {
    const c = T.cur;
    el('traceBig').textContent = c;
    const showPy = S.settings.pinyin || !guide() || isExtra(c);
    el('tracePy').textContent = showPy ? (S.data.chars[c] || [''])[0] : '';
    el('traceCount').textContent = `${T.n} 笔`;
    el('traceWords').innerHTML = exampleWords(c).map(wordChip).join('');
    el('levelTag').textContent = `描红 · 提示${guide() ? '开' : '关'}`;
  }

  function renderPicker() {
    const best = progress();
    el('pickGrid').innerHTML = chars().map(c => {
      const s = best[c] || 0;
      return `<div class="pick s${s}${c === T.cur ? ' cur' : ''}" data-char="${c}">${c}${s ? `<small>${'★'.repeat(s)}</small>` : ''}</div>`;
    }).join('');
  }

  async function setChar(c) {
    T.cur = c;
    T.n = T.strokes[c].strokes.length;
    if (!T.writer) ensureWriter(); else T.writer.setCharacter(c);
    renderInfo();
    renderPicker();
    startQuiz();
  }

  // ---------- buttons ----------
  async function animate() {
    if (!T.cur || T.busy || !T.writer) return;
    T.busy = true;
    T.writer.cancelQuiz();
    el('traceDone').hidden = true;
    await T.writer.hideCharacter({ duration: 0 });
    await T.writer.showOutline();
    T.next = -1; T.marks = []; T.finished = false;
    for (let i = 0; i < T.n && T.shown; i++) {
      T.next = i;
      renderDots();
      say(`第 ${i + 1} 笔`);
      sfx.pick();
      await T.writer.animateStroke(i);
      T.marks[i] = 'ok';
      await sleep(250);
    }
    await sleep(500);
    T.busy = false;
    if (T.shown) { await T.writer.hideCharacter({ duration: 0 }); startQuiz(); say('现在你来写！'); }
  }

  function hint() {
    if (!T.writer || T.busy || T.finished) return;
    T.hints++;
    say(`💡 看，这是第 ${T.next + 1} 笔`);
    T.writer.highlightStroke(T.next);
  }

  function redo() { if (T.writer && !T.busy) { T.writer.hideCharacter({ duration: 0 }); startQuiz(); } }
  function next() { if (!T.busy) setChar(pickNext()); }
  function select(c) { if (!T.busy && T.strokes[c]) setChar(c); }

  // ---------- show / hide ----------
  async function show() {
    T.shown = true;
    el('traceDone').hidden = true;
    say('');
    if (!(await ensureData())) { say('笔顺数据没读到，请联网后再试'); return; }
    if (!chars().length) { say('没有可以描红的字'); return; }
    try {
      if (!T.cur || !T.strokes[T.cur] || !S.lessonChars.has(T.cur)) { T.cur = null; await setChar(pickNext()); }
      else { ensureWriter(); renderInfo(); renderPicker(); startQuiz(); }
    } catch (e) { logError('描红出错', e); say('描红出错了，打开 ⚙️ 显示错误看看'); }
  }

  function hide() {
    T.shown = false;
    if (T.writer) T.writer.cancelQuiz();
    el('traceDone').hidden = true;
  }

  // Settings that change what the card shows; only turning the hint on or off starts the character over.
  function refresh(key) { if (!T.shown || !T.cur) return; renderInfo(); if (key === 'traceGuide' && !T.busy) startQuiz(); }

  function wire() {
    el('animBtn').onclick = animate;
    el('traceHint').onclick = hint;
    el('traceRedo').onclick = redo;
    el('traceNext').onclick = next;
    el('traceNext2').onclick = next;
    el('traceAgain').onclick = redo;
    el('pickGrid').addEventListener('click', e => { const p = e.target.closest('.pick'); if (p) select(p.dataset.char); });
    let timer = null;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (T.shown && T.writer) { const w = boardSize(); T.writer.updateDimensions({ width: w, height: w, padding: pad(w) }); } }, 200);
    });
  }

  return { show, hide, refresh, wire, animate, hint, redo, next, select, state: T };
})();
