// Adventure — shared helpers: Supabase client, sign-in, status pill,
// error panel, gear drawer, local cache. Used by index.html and hood.html.
(function () {
  const cfg = window.ADV_CONFIG;
  const errors = [];

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function withTimeout(promise, ms = cfg.timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out after ' + ms / 1000 + 's')), ms))
    ]);
  }

  // Run a Supabase query builder; throw on error so callers can catch once.
  async function q(builder) {
    const { data, error } = await withTimeout(builder);
    if (error) throw new Error(error.message);
    return data;
  }

  function status(kind, text) {
    const pill = document.getElementById('pill');
    if (!pill) return;
    if (kind === 'ok' && errors.length) return;   // keep the problem count showing
    pill.className = 'pill ' + kind;
    pill.textContent = text;
  }

  function error(where, err) {
    const msg = where + ': ' + (err && err.message ? err.message : err);
    errors.push(new Date().toLocaleTimeString() + ' — ' + msg);
    console.error(msg, err);
    renderErrors();
    status('err', '⚠️ ' + errors.length + (errors.length === 1 ? ' problem' : ' problems'));
  }

  function renderErrors() {
    const box = document.getElementById('errors');
    if (!box) return;
    box.innerHTML = errors.map(e => '<div>' + esc(e) + '</div>').join('') || '<div>No problems so far.</div>';
    box.classList.toggle('hidden', !store.get('adv.showErrors', false));
  }

  // Gear button + drawer + error panel. Page-specific controls go in
  // an element with id="gear-extra", which is moved into the drawer.
  function buildChrome() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="errors" class="errors hidden"></div>
      <div id="drawer" class="drawer card hidden">
        <h3>Settings</h3>
        <nav class="pages">
          <a class="btn small" href="index.html">📖 Story</a>
          <a class="btn small" href="world.html">🗺️ World</a>
          <a class="btn small" href="lore.html">📚 Lore</a>
          <a class="btn small" href="voices.html">🎙️ Voices</a>
          <a class="btn small" href="hood.html">🔧 Under the hood</a>
          <a class="btn small" href="../../index.html">🏠 All projects</a>
        </nav>
        <div id="gear-slot"></div>
        <details class="gear-sec" open><summary>🗄️ Database</summary>
          <p id="dbStatus" class="muted">Checking the connection…</p>
          <div class="row">
            <button class="btn small" id="signIn" hidden>🔑 Sign in</button>
            <button class="btn small" id="dbCheck">Check database</button>
            <button class="btn small" id="signOut">Sign out</button>
          </div>
          <div id="dbResult" class="muted"></div>
        </details>
        <details class="gear-sec"><summary>📝 Notes for improvement</summary>
          <p class="muted">Saved on this device only. Copy them to send them.</p>
          <textarea id="fbText" class="field" rows="3" placeholder="What would make this better?"></textarea>
          <div class="row">
            <button class="btn small" id="fbSave">Save note</button>
            <button class="btn small" id="fbCopy">Copy notes</button>
            <select id="fbFilter" class="field"><option value="open">Open</option><option value="all">All</option></select>
          </div>
          <ul id="fbList" class="fb-list"></ul>
        </details>
        <label><input type="checkbox" id="showErrors"> Show errors</label>
        <details class="gear-sec"><summary>ℹ️ Version</summary>
          <p id="verLine" class="muted"></p>
          <ol id="changelog" class="muted"></ol>
        </details>
      </div>
      <button class="gear" id="gear" aria-label="Settings">⚙️</button>
      <div id="login" class="overlay hidden">
        <form class="card" id="loginForm">
          <h2>Sign in</h2>
          <p class="muted">Use the family account.</p>
          <input class="field" id="email" type="email" autocomplete="username" placeholder="Email" required>
          <input class="field" id="password" type="password" autocomplete="current-password" placeholder="Password" required>
          <button class="btn sun" type="submit">Open the story</button>
          <div id="loginMsg" class="muted"></div>
        </form>
      </div>`);
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.pages a').forEach(a => a.classList.toggle('sun', a.getAttribute('href') === here));
    const extra = document.getElementById('gear-extra');
    if (extra) document.getElementById('gear-slot').appendChild(extra);

    const drawer = document.getElementById('drawer');
    document.getElementById('gear').onclick = () => drawer.classList.toggle('hidden');
    const showErrors = document.getElementById('showErrors');
    showErrors.checked = store.get('adv.showErrors', false);
    showErrors.onchange = () => { store.set('adv.showErrors', showErrors.checked); renderErrors(); };
    document.getElementById('dbCheck').onclick = dbCheck;
    document.getElementById('signOut').onclick = async () => {
      try { await Adv.sb.auth.signOut(); } catch (e) { error('Sign out', e); }
      location.reload();
    };
    renderErrors();

    // Sign in from ⚙️ at any time. The button shows only while signed out.
    const signInBtn = document.getElementById('signIn');
    signInBtn.onclick = async () => { await signIn(); location.reload(); };
    signIn({ quiet: true }).then(session => {
      signInBtn.hidden = !!session;
      document.getElementById('dbStatus').textContent = session
        ? 'Signed in. The newest chapters and the recordings load from the family database.'
        : 'Not signed in. The story shows the copy saved on this device. Sign in to see the newest chapters.';
    }).catch(e => error('Session', e));

    // Notes for improvement: device first (feedback_notes.md).
    document.getElementById('fbSave').onclick = saveNote;
    document.getElementById('fbFilter').onchange = renderNotes;
    document.getElementById('fbCopy').onclick = () => {
      const out = JSON.stringify(feedbackNotes(), null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(out).catch(() => window.prompt('Copy the notes:', out));
      else window.prompt('Copy the notes:', out);
    };
    renderNotes();

    // Version and changelog (the bottom of ⚙️).
    document.getElementById('verLine').textContent = 'Adventure ' + cfg.version;
    document.getElementById('changelog').innerHTML = (cfg.changelog || []).map(c => '<li>' + esc(c) + '</li>').join('');
  }

  const FB_KEY = 'adv.feedback';
  function feedbackNotes() { return store.get(FB_KEY, []); }

  function renderNotes() {
    const filter = document.getElementById('fbFilter').value;
    const shown = feedbackNotes().filter(n => filter === 'all' || n.status === 'open').sort((a, b) => (a.at < b.at ? 1 : -1));
    document.getElementById('fbList').innerHTML = shown.map(n =>
      '<li>' + (n.status === 'done' ? '✅ ' : '📝 ') + esc(new Date(n.at).toLocaleString()) + ' · ' + esc(n.where.page) +
      '<br>' + esc(n.text) + '</li>').join('') || '<li class="muted">No notes yet.</li>';
  }

  function saveNote() {
    const box = document.getElementById('fbText');
    const text = box.value.trim();
    if (!text) return;
    const notes = feedbackNotes();
    notes.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(),
      status: 'open', text, where: { page: location.pathname.split('/').pop() || 'index.html' }, version: cfg.version });
    store.set(FB_KEY, notes);
    if (!store.get(FB_KEY, []).length) error('Saving a note', new Error('this browser will not keep notes'));
    box.value = '';
    renderNotes();
  }

  async function dbCheck() {
    const out = document.getElementById('dbResult');
    out.textContent = 'Checking…';
    const tables = ['adv_roles', 'adv_entries', 'adv_chapters', 'adv_turns', 'adv_runs', 'adv_places', 'adv_notes', 'adv_history'];
    const lines = [];
    for (const t of tables) {
      try {
        const { count, error: e } = await withTimeout(Adv.sb.from(t).select('*', { count: 'exact', head: true }));
        if (e) throw new Error(e.message);
        lines.push('✅ ' + t + ': ' + count);
      } catch (e) {
        lines.push('❌ ' + t + ': ' + e.message);
        error('Database check ' + t, e);
      }
    }
    out.innerHTML = lines.map(esc).join('<br>');
  }

  // Resolve once there is a signed-in session (or null when offline).
  // quiet: resolve null instead of showing the sign-in form when nobody is signed in.
  async function signIn(opts) {
    if (!window.supabase) {
      error('Start', 'Could not load the Supabase library (offline?)');
      return null;
    }
    if (!Adv.sb) Adv.sb = window.supabase.createClient(cfg.url, cfg.key);
    try {
      const { data } = await withTimeout(Adv.sb.auth.getSession());
      if (data.session) return data.session;
    } catch (e) {
      error('Session', e);
      return null;
    }
    if (opts && opts.quiet) return null;
    const overlay = document.getElementById('login');
    overlay.classList.remove('hidden');
    return new Promise(resolve => {
      document.getElementById('loginForm').onsubmit = async ev => {
        ev.preventDefault();
        const msg = document.getElementById('loginMsg');
        msg.textContent = 'Signing in…';
        try {
          const { data, error: e } = await withTimeout(Adv.sb.auth.signInWithPassword({
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
          }));
          if (e) throw new Error(e.message);
          overlay.classList.add('hidden');
          resolve(data.session);
        } catch (e) {
          msg.textContent = 'Could not sign in: ' + e.message;
        }
      };
    });
  }

  window.Adv = { sb: null, store, esc, withTimeout, q, status, error, buildChrome, signIn };
})();
