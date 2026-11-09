/* Ole Bar Glide — the page around the game: controls, ⚙️ settings, collapsible panels, notes for improvement,
 * top scores, the family database and the opt-in error panel. Classic script, no build. */
(function (BG) {
  'use strict';
  const $ = id => document.getElementById(id);
  const G = window.BarGlide;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: the game still runs */ } }
  };

  // ---------- errors (opt-in, at the bottom) ----------
  const errors = [];
  function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
  function renderErrors() {
    const box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  window.addEventListener('error', e => logError(e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '')));
  window.addEventListener('unhandledrejection', e => logError('Promise: ' + (e.reason && e.reason.message || e.reason)));

  // ---------- settings ----------
  const KEY = 'barglide.settings';
  const DEFAULTS = { start: '1', speed: 'normal', glasses: '3', ending: 'spank', theme: 'saloon', crt: 1, sound: 1, music: 1, showErrors: false };
  let settings = Object.assign({}, DEFAULTS, store.get(KEY, {}));
  for (const k in DEFAULTS) {               // an old saved value that no longer matches falls back
    const seg = document.querySelector('.seg[data-key="' + k + '"]');
    if (seg && ![...seg.querySelectorAll('button')].some(b => b.dataset.v === String(settings[k]))) settings[k] = DEFAULTS[k];
  }
  const SPEEDS = { slow: 0.75, normal: 1, fast: 1.25 };
  function gameConfig() {
    return { start: +settings.start, speed: SPEEDS[settings.speed] || 1, glasses: +settings.glasses, ending: settings.ending, theme: settings.theme };
  }
  function renderSettings() {
    document.querySelectorAll('.seg').forEach(seg => {
      const v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    $('showErrors').checked = !!settings.showErrors;
    document.body.dataset.theme = settings.theme;
    $('crt').hidden = !+settings.crt;
    BG.sound.setEnabled(!!+settings.sound);
    BG.sound.setMusic(!!+settings.music);
    renderErrors();
  }
  document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
    const key = b.parentElement.dataset.key, v = b.dataset.v;
    settings[key] = (key === 'crt' || key === 'sound' || key === 'music') ? +v : v;
    store.set(KEY, settings);
    renderSettings();
    G.configure(gameConfig());
    if (key === 'start') { showOverlay('title'); }
  }));
  $('showErrors').addEventListener('change', e => { settings.showErrors = e.target.checked; store.set(KEY, settings); renderErrors(); });

  // ---------- drawer and panels ----------
  const gear = $('gear'), drawer = $('drawer');
  function setDrawer(open) {
    drawer.hidden = !open;
    gear.setAttribute('aria-expanded', String(open));
    if (open) { G.pause(true); updateNoteWhere(); renderNotes(); renderLocalTop(); if (session) loadFamilyTop(); }
    renderPause();
  }
  gear.addEventListener('click', () => setDrawer(drawer.hidden));
  $('closeDrawer').addEventListener('click', () => setDrawer(false));
  $('pill').addEventListener('click', () => setDrawer(true));

  (function panels() {
    const PKEY = 'barglide.panels';
    const saved = store.get(PKEY, {});
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    document.querySelectorAll('.panel').forEach(section => {
      const id = section.dataset.panel;
      let open = id in saved ? saved[id] : (section.dataset.open !== 'false' && !(small && id !== 'game'));
      const head = section.querySelector('.panelHead');
      const apply = () => { section.dataset.collapsed = String(!open); head.setAttribute('aria-expanded', String(open)); };
      apply();
      head.addEventListener('click', () => { open = !open; apply(); saved[id] = open; store.set(PKEY, saved); });
    });
  })();

  // ---------- overlays ----------
  function showOverlay(which) {
    $('titleOverlay').hidden = which !== 'title';
    $('overOverlay').hidden = which !== 'over';
  }
  function startGame() {
    BG.sound.unlock();
    showOverlay(null);
    G.start();
    renderPause();
  }
  $('playBtn').addEventListener('click', startGame);
  $('againBtn').addEventListener('click', startGame);

  // ---------- controls ----------
  const canvas = $('game');
  let holdId = null;
  function playing() { const s = G.state(); return s.state !== 'title' && s.state !== 'over'; }
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    BG.sound.unlock();
    if (!playing()) return;
    if (G.isPaused()) { G.pause(false); renderPause(); return; }
    if (G.tap(e.clientX, e.clientY)) return;   // a tip or a bonus-round mug
    holdId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older Safari */ }
    G.press(G.laneFromPoint(e.clientY));
  });
  const letGo = e => { if (holdId !== null && (!e || e.pointerId === holdId)) { holdId = null; G.release(); } };
  canvas.addEventListener('pointerup', letGo);
  canvas.addEventListener('pointercancel', letGo);

  const pour = $('pourBtn');
  pour.addEventListener('pointerdown', e => {
    e.preventDefault(); BG.sound.unlock();
    if (!playing()) return;
    if (G.isPaused()) { G.pause(false); renderPause(); }
    try { pour.setPointerCapture(e.pointerId); } catch (err) {}
    pour.classList.add('down'); G.press();
  });
  const pourUp = () => { pour.classList.remove('down'); G.release(); };
  pour.addEventListener('pointerup', pourUp);
  pour.addEventListener('pointercancel', pourUp);
  pour.addEventListener('contextmenu', e => e.preventDefault());

  $('upBtn').addEventListener('click', () => G.up());
  $('downBtn').addEventListener('click', () => G.down());
  function renderPause() { $('pauseBtn').textContent = G.isPaused() ? '▶' : '⏸'; }
  $('pauseBtn').addEventListener('click', () => { if (playing()) { G.pause(); renderPause(); } });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowUp') { G.up(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { G.down(); e.preventDefault(); }
    else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      if (!$('titleOverlay').hidden || !$('overOverlay').hidden) { if (e.key === ' ') startGame(); return; }
      if (G.isPaused()) { G.pause(false); renderPause(); }
      G.press();
    } else if (e.key === '1' || e.key === '2' || e.key === '3') { G.pickSlot(+e.key - 1);
    } else if (e.key === 'p' || e.key === 'Escape') { if (playing()) { G.pause(); renderPause(); } }
  });
  document.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') G.release(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing()) { G.pause(true); renderPause(); } });

  // ---------- top scores ----------
  let lastRun = null;
  function renderList(el, rows, empty) {
    el.textContent = '';
    if (!rows.length) { const li = document.createElement('li'); li.textContent = empty; el.appendChild(li); return; }
    rows.forEach(r => {
      const li = document.createElement('li');
      li.textContent = (r.initials || '???') + '  ' + String(r.score).padStart(6, '0') + '  · round ' + r.round;
      el.appendChild(li);
    });
  }
  const localScores = () => store.get('barglide.scores', []);
  function renderLocalTop() { renderList($('localTop'), localScores().slice(0, 5), 'No scores yet.'); }

  G.hooks.onError = logError;
  G.hooks.onGameOver = run => {
    lastRun = run;
    $('overScore').textContent = String(run.score).padStart(6, '0');
    $('overInfo').textContent = 'Round ' + run.round + ' · best on this device ' + run.best;
    $('initials').value = store.get('barglide.initials', '');
    $('scoreForm').hidden = run.score <= 0;
    renderList($('overTop'), localScores().slice(0, 5), 'No scores yet.');
    showOverlay('over');
    renderPause();
  };
  $('scoreForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!lastRun) return;
    const initials = ($('initials').value || '???').toUpperCase().replace(/[^A-Z0-9?]/g, '').slice(0, 3) || '???';
    store.set('barglide.initials', initials);
    const row = { id: 's-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), initials, score: lastRun.score,
      round: lastRun.round, version: BG.VERSION, played_at: new Date().toISOString() };
    const list = localScores().concat([row]).sort((a, b) => b.score - a.score).slice(0, 20);
    store.set('barglide.scores', list);
    renderList($('overTop'), list.slice(0, 5), '');
    $('scoreForm').hidden = true;
    lastRun = null;
    if (session) {
      dbFetch('POST', '/rest/v1/bglide_scores', [row], 'return=minimal')
        .then(() => setSync('synced'))
        .catch(err => { setSync('check'); logError('Score not saved to the family database: ' + err.message); });
    }
  });

  // ---------- notes for improvement ----------
  const NKEY = 'barglide.notes';
  let notes = store.get(NKEY, []);
  function where() {
    const s = G.state();
    const item = s.state === 'title' ? 'title' : 'round-' + s.round;
    return { page: 'index.html', item, label: (s.state === 'title' ? 'Title screen' : 'Round ' + s.round + ' · ' + s.shift + ' · ' + s.lanes + ' bars') + ' · ' + settings.theme };
  }
  function updateNoteWhere() { $('noteWhere').textContent = 'About: ' + where().label; }
  function renderNotes() {
    const filter = $('noteFilter').value, list = $('noteList');
    list.textContent = '';
    const shown = notes.filter(n => filter === 'all' || n.status === 'open').sort((a, b) => a.at < b.at ? 1 : -1);
    if (!shown.length) { const li = document.createElement('li'); li.textContent = 'No notes yet.'; list.appendChild(li); return; }
    shown.forEach(n => {
      const li = document.createElement('li');
      li.textContent = (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') +
        new Date(n.at).toLocaleString() + '\n' + n.text;
      list.appendChild(li);
    });
  }
  function pushNote(n) {
    if (!session) return Promise.resolve();
    return dbFetch('POST', '/rest/v1/bglide_notes?on_conflict=id', [{
      id: n.id, text: n.text, item: n.where.item, label: n.where.label, version: n.version, status: n.status, noted_at: n.at
    }], 'resolution=merge-duplicates,return=minimal');
  }
  $('noteSave').addEventListener('click', () => {
    const text = $('noteText').value.trim();
    if (!text) return;
    const n = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(),
      status: 'open', text: text.slice(0, 2000), where: where(), version: BG.VERSION };
    notes.push(n); store.set(NKEY, notes);
    $('noteText').value = '';
    renderNotes();
    pushNote(n).then(() => { if (session) setSync('synced'); })
      .catch(err => { setSync('check'); logError('Note kept on this device; the family database said: ' + err.message); });
  });
  $('noteFilter').addEventListener('change', renderNotes);
  $('noteCopy').addEventListener('click', () => {
    const out = JSON.stringify(notes, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(out).catch(() => window.prompt('Copy the notes:', out));
    else window.prompt('Copy the notes:', out);
  });

  // ---------- family database (Supabase, Family project). Everything works without it. ----------
  const DB = BG.DB;
  let session = store.get('barglide.session', null);
  let syncState = 'device';
  function setSync(s) { syncState = s; renderSync(); }
  function renderSync() {
    const label = { device: '💾 this device', checking: '☁️ syncing…', synced: '☁️ synced', check: '⚠️ check' }[syncState];
    $('pill').textContent = label;
    $('pill').className = 'pill ' + syncState;
    $('signInStatus').textContent = session ? 'Signed in as ' + session.email + '. Scores and notes also go to the family database.'
      : 'Not signed in. Everything stays on this device.';
    $('signInForm').hidden = !!session;
    $('signOut').hidden = !session;
  }
  async function dbFetch(method, path, body, prefer, retried) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    try {
      const res = await fetch(DB.url + path, {
        method, signal: c.signal,
        headers: Object.assign({ apikey: DB.key, 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (session ? session.access_token : DB.key) }, prefer ? { Prefer: prefer } : {}),
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      if (res.status === 401 && session && !retried) { await refreshSession(); return dbFetch(method, path, body, prefer, true); }
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && (data.message || data.msg || data.error_description)) || ('HTTP ' + res.status));
      return data;
    } finally { clearTimeout(t); }
  }
  async function refreshSession() {
    const res = await fetch(DB.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: DB.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    const j = await res.json();
    if (!res.ok) { signOut(); throw new Error('Please sign in again'); }
    session = { access_token: j.access_token, refresh_token: j.refresh_token, email: session.email };
    store.set('barglide.session', session);
  }
  function signOut() { session = null; store.set('barglide.session', null); setSync('device'); renderList($('familyTop'), [], 'Sign in to see the family scores.'); }
  $('signInForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('signEmail').value.trim(), password = $('signPassword').value;
    $('signInStatus').textContent = 'Signing in…';
    try {
      const res = await fetch(DB.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { apikey: DB.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error_description || j.msg || j.message || 'Sign-in failed');
      session = { access_token: j.access_token, refresh_token: j.refresh_token, email };
      store.set('barglide.session', session);
      $('signPassword').value = '';
      setSync('checking');
      await Promise.all(notes.map(pushNote));       // device notes go up once signed in
      setSync('synced');
      loadFamilyTop();
    } catch (err) {
      renderSync();
      $('signInStatus').textContent = 'Sign-in did not work: ' + err.message;
    }
  });
  $('signOut').addEventListener('click', signOut);
  function loadFamilyTop() {
    dbFetch('GET', '/rest/v1/bglide_scores?select=initials,score,round&order=score.desc&limit=5')
      .then(rows => { renderList($('familyTop'), rows || [], 'No family scores yet.'); setSync('synced'); })
      .catch(err => { setSync('check'); renderList($('familyTop'), [], 'Could not load: ' + err.message); });
  }
  $('checkDb').addEventListener('click', async () => {
    const out = $('dbCheck');
    if (!session) { out.textContent = 'Not signed in: this device only. Sign in to check the family tables.'; return; }
    out.textContent = 'Checking…';
    const lines = [];
    for (const t of DB.tables) {
      try {
        const rows = await dbFetch('GET', '/rest/v1/' + t + '?select=*&limit=1');
        lines.push('✅ ' + t + (rows && rows.length ? '' : ' (empty, or row-level security hides the rows)'));
      } catch (err) { lines.push('❌ ' + t + ': ' + err.message); logError('Check ' + t + ': ' + err.message); }
    }
    out.textContent = lines.join('\n');
  });

  // ---------- version ----------
  $('versionLine').textContent = 'Ole Bar Glide ' + BG.VERSION;
  BG.CHANGES.forEach(c => { const li = document.createElement('li'); li.textContent = c; $('changelog').appendChild(li); });

  // ---------- go ----------
  G.configure(gameConfig());
  G.init(canvas);
  renderSettings();
  renderSync();
  renderLocalTop();
  showOverlay('title');
  if (session) loadFamilyTop();
})(window.BG);
