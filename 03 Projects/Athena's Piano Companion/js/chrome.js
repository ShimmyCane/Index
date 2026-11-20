// The ⚙️ gear and drawer, the sync pill, and the shared panels (02 Refs/Skills/settings_gear.md).
// Order: description, page settings, pages, family database, show errors, notes, version.
(function () {
  'use strict';
  var h = PC.h, drawer, gear, panelState = PC.store.get('panels', {});
  var PAGES = [
    { id: 'index', href: 'index.html', icon: '🎹', label: 'Record' },
    { id: 'player', href: 'player.html', icon: '🎧', label: 'Listen' },
    { id: 'library', href: 'library.html', icon: '📚', label: 'Library' },
    { id: 'compose', href: 'compose.html', icon: '🎛️', label: 'Compose' }
  ];

  function panel(id, icon, title, body, open) {
    var isOpen = id in panelState ? panelState[id] : open;
    var sec = h('section', { 'class': 'panel', 'data-panel': id, 'data-collapsed': String(!isOpen) });
    var head = h('button', { 'class': 'panelHead', type: 'button', 'aria-expanded': String(isOpen) },
      [h('span', { text: icon }), h('span', { 'class': 'panelTitle', text: title }), h('span', { 'class': 'panelMark', text: '▾' })]);
    head.addEventListener('click', function () {
      var nowOpen = sec.dataset.collapsed === 'true';
      sec.dataset.collapsed = String(!nowOpen); head.setAttribute('aria-expanded', String(nowOpen));
      panelState[id] = nowOpen; PC.store.set('panels', panelState);
    });
    sec.appendChild(head); sec.appendChild(h('div', { 'class': 'panelBody' }, body));
    return sec;
  }

  // ---- setting controls (rebuilt from PC.settings; never a second copy of the state)
  function seg(key, opts, cls, after) {
    var box = h('div', { 'class': 'seg ' + (cls || '') });
    function paint() {
      box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === String(PC.settings[key])); });
    }
    opts.forEach(function (o) {
      var b = h('button', { type: 'button', 'data-v': String(o.v) }, [o.label, o.hint ? h('small', { text: o.hint }) : null]);
      b.addEventListener('click', function () {
        var v = typeof PC.settings[key] === 'number' ? Number(o.v) : o.v;
        PC.set(key, v); paint(); if (after) after(v);
      });
      box.appendChild(b);
    });
    paint(); return box;
  }
  function check(key, label, hint) {
    var inp = h('input', { type: 'checkbox' }); inp.checked = !!PC.settings[key];
    inp.addEventListener('change', function () { PC.set(key, inp.checked ? 1 : 0); });
    return h('label', { 'class': 'row check' }, [inp, h('span', {}, [label, hint ? h('small', { text: hint }) : null])]);
  }
  function range(key, label, min, max, step, unit) {
    var out = h('span', { text: PC.settings[key] + (unit || '') });
    var inp = h('input', { type: 'range', min: min, max: max, step: step || 1, value: PC.settings[key] });
    inp.addEventListener('input', function () { PC.set(key, Number(inp.value)); out.textContent = inp.value + (unit || ''); });
    return h('div', { 'class': 'row' }, [h('span', { text: label }), inp, out]);
  }
  function text(key, label, hint) {
    var inp = h('input', { type: 'text', value: PC.settings[key], 'class': 'txt' });
    inp.addEventListener('change', function () { PC.set(key, inp.value.trim()); });
    return h('div', {}, [h('div', { 'class': 'row' }, [h('span', {}, [label, hint ? h('small', { text: hint }) : null])]), inp]);
  }

  // ---- pill: 💾 this device · ☁️ synced · ⚠️ check
  function pill() {
    var p = document.getElementById('pill'); if (!p) return;
    function paint() {
      var s = Store.status();
      p.textContent = s === 'synced' ? '☁️ synced' : s === 'syncing' ? '☁️ …' : s === 'problem' ? '⚠️ check' : '💾 this device';
      p.className = 'pill ' + s;
    }
    p.addEventListener('click', function () { open(true); });
    PC.on('syncstatus', paint); PC.on('family', paint); paint();
  }

  // ---- family database block
  function familyBlock() {
    var status = h('div', { 'class': 'hint' }), out = h('pre', { 'class': 'dbOut', text: '' });
    var email = h('input', { type: 'email', placeholder: 'Email', autocomplete: 'username' });
    var pass = h('input', { type: 'password', placeholder: 'Password', autocomplete: 'current-password' });
    var go = h('button', { 'class': 'btn wide', type: 'submit', text: 'Sign in' });
    var form = h('form', { 'class': 'stackForm' }, [email, pass, go]);
    var outBtn = h('button', { 'class': 'btn wide', type: 'button', text: 'Sign out' });
    var check = h('button', { 'class': 'btn wide', type: 'button', text: 'Check the database' });
    var now = h('button', { 'class': 'btn wide', type: 'button', text: 'Sync now' });
    function paint() {
      var on = Family.signedIn();
      status.textContent = on ? 'Signed in as ' + Family.email() + '. Takes and notes are copied to the family database when you are not playing.'
        : 'Not signed in. Takes and notes stay on this device only.';
      form.hidden = on; outBtn.hidden = !on; now.hidden = !on;
    }
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault(); go.disabled = true;
      try { await Family.signIn(email.value.trim(), pass.value); pass.value = ''; }
      catch (e) { PC.err('Sign-in failed', e); status.textContent = 'Sign-in failed: ' + e.message; }
      finally { go.disabled = false; }
    });
    outBtn.addEventListener('click', function () { Family.signOut(); });
    check.addEventListener('click', async function () { out.textContent = 'Checking…'; out.textContent = await Family.check(); });
    now.addEventListener('click', async function () { out.textContent = 'Syncing…'; await Store.sync(true); out.textContent = Store.status() === 'synced' ? 'Everything is in the family database.' : 'Not finished: ' + Store.status(); });
    PC.on('family', paint); paint();
    return [status, form, outBtn, now, check, out];
  }

  // ---- notes for improvement
  function notesBlock() {
    var box = h('textarea', { rows: 3, placeholder: 'What would make this better?' });
    var save = h('button', { 'class': 'btn small', type: 'button', text: 'Save note' });
    var copy = h('button', { 'class': 'btn small', type: 'button', text: 'Copy notes' });
    var filter = h('select', {}, [h('option', { value: 'open', text: 'Open' }), h('option', { value: 'all', text: 'All' })]);
    var list = h('ul', { id: 'noteList' }), ctx = h('div', { 'class': 'hint' });
    function paint() {
      list.textContent = '';
      Notes.all().filter(function (n) { return filter.value === 'all' || n.status === 'open'; })
        .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
        .forEach(function (n) {
          var b = h('button', { type: 'button', 'class': 'doneBtn', text: n.status === 'done' ? 'Reopen' : 'Done' });
          b.addEventListener('click', function () { Notes.setStatus(n.id, n.status === 'done' ? 'open' : 'done'); });
          list.appendChild(h('li', { 'class': n.status === 'done' ? 'done' : '' },
            [b, (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') + new Date(n.at).toLocaleString() + '\n' + n.text]));
        });
    }
    save.addEventListener('click', function () { if (Notes.add(box.value)) box.value = ''; });
    copy.addEventListener('click', function () {
      var s = JSON.stringify(Notes.all(), null, 2);
      if (navigator.clipboard) navigator.clipboard.writeText(s).catch(function () { window.prompt('Copy the notes:', s); }); else window.prompt('Copy the notes:', s);
    });
    filter.addEventListener('change', paint); PC.on('notes', paint); paint();
    return h('div', { 'class': 'notesBox' }, [ctx, box, h('div', { 'class': 'row' }, [save, copy, filter]), list]);
  }

  var CHANGELOG = [
    '0.1.0 · first build: listening circle, voice and big-button start, count-in choices, pause and stop-note endings, trimmed takes saved on the device and synced; library, listening page, four-layer composer.'
  ];

  function open(on) {
    drawer.classList.toggle('open', on); gear.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('drawerOpen', on); drawer.setAttribute('aria-hidden', String(!on));
  }

  function init(cfg) {
    gear = h('button', { 'class': 'gear', id: 'gear', type: 'button', 'aria-label': 'Settings', 'aria-expanded': 'false', 'aria-controls': 'drawer', text: '⚙️' });
    drawer = h('aside', { 'class': 'drawer', id: 'drawer', 'aria-hidden': 'true' });
    var close = h('button', { 'class': 'btn icon', type: 'button', 'aria-label': 'Close', text: '✖' });
    drawer.appendChild(h('div', { 'class': 'drawerHead' }, [h('span', { 'class': 'drawerTitle', text: 'Settings' }), close]));
    if (cfg.desc) drawer.appendChild(h('p', { 'class': 'hint', text: cfg.desc }));
    (cfg.sections || []).forEach(function (s) { drawer.appendChild(panel(s.id, s.icon, s.title, s.build(), !!s.open)); });
    var links = PAGES.filter(function (p) { return p.id !== cfg.page; }).map(function (p) {
      return h('a', { 'class': 'btn wide', href: p.href, text: p.icon + ' ' + p.label });
    });
    drawer.appendChild(panel('pages', '🧭', 'Pages', links, false));
    drawer.appendChild(panel('family', '☁️', 'Family database', familyBlock(), false));
    var errCheck = check('showErrors', 'Show errors', 'Problems appear at the bottom of the page');
    var errBox = h('div', { id: 'errors', 'class': 'errors', hidden: true }, [h('strong', { text: 'Errors' }), h('ul', { id: 'errList' })]);
    function paintErr() {
      var on = !!PC.settings.showErrors; errBox.hidden = !on;
      var ul = errBox.querySelector('ul'); ul.textContent = '';
      (PC.errors.length ? PC.errors : ['No problems so far.']).forEach(function (l) { ul.appendChild(h('li', { text: l })); });
    }
    PC.on('error', paintErr); PC.on('setting', function (k) { if (k === 'showErrors') paintErr(); });
    drawer.appendChild(panel('errorsPanel', '🪲', 'Errors', [errCheck], false));
    drawer.appendChild(panel('notes', '📝', 'Notes for improvement', notesBlock(), false));
    drawer.appendChild(panel('version', 'ℹ️', 'Version ' + PC.version,
      [h('ul', { 'class': 'changelog' }, CHANGELOG.map(function (c) { return h('li', { text: c }); }))], false));
    document.body.appendChild(gear); document.body.appendChild(drawer); document.body.appendChild(errBox);
    gear.addEventListener('click', function () { open(!drawer.classList.contains('open')); });
    close.addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
    paintErr(); pill();
    Notes.setContext({ page: location.pathname.split('/').pop() || 'index.html' });
  }
  window.Chrome = { init: init, seg: seg, check: check, range: range, text: text, panel: panel, open: open, PAGES: PAGES };
})();
