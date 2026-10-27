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
        <div id="gear-slot"></div>
        <label><input type="checkbox" id="showErrors"> Show errors</label>
        <div class="row">
          <button class="btn small" id="dbCheck">Check database</button>
          <button class="btn small" id="signOut">Sign out</button>
        </div>
        <div id="dbResult" class="muted"></div>
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
  }

  async function dbCheck() {
    const out = document.getElementById('dbResult');
    out.textContent = 'Checking…';
    const tables = ['adv_roles', 'adv_entries', 'adv_chapters', 'adv_turns', 'adv_runs', 'adv_history'];
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
  async function signIn() {
    if (!window.supabase) {
      error('Start', 'Could not load the Supabase library (offline?)');
      return null;
    }
    Adv.sb = window.supabase.createClient(cfg.url, cfg.key);
    try {
      const { data } = await withTimeout(Adv.sb.auth.getSession());
      if (data.session) return data.session;
    } catch (e) {
      error('Session', e);
      return null;
    }
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
