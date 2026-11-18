/* Make 3D x Construct: the home page. Projects, the library on this device, and the cloud library with sign-in.
   Every cloud call is in a try/catch and shows a plain message. Text is written with textContent only. */
(function () {
  'use strict';
  const C = window.M3DXC.cloud, Lib = window.M3DXC.library;
  const $ = (id) => document.getElementById(id);
  const KEYS = { panels: 'm3dxc.home.panels.v1' };

  const library = Lib.createLibrary(Lib.browserStore(window.localStorage));
  const cloud = C.createCloud(window.supabase, C.CONFIG, { redirectTo: (location.protocol.indexOf('http') === 0) ? location.href : undefined });

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  // The projects: the current sample (in the studio) and the archived V1 (its own folder, a self-contained copy).
  const PROJECTS = [
    { title: 'Southern Cheyenne camp move (V2, draft)', text: 'The current diorama: three planes, lofted horses and people, a story. Not reviewed by the tribes.', href: 'studio.html?src=sample', open: 'Open in the studio' },
    { title: 'Oklahoma diorama V1 (archived)', text: 'The previous state, kept as it was (round 6). Read only.', href: 'archive/Oklahoma%20diorama%20V1/index.html', open: 'Open the archive' },
  ];
  function renderProjects() {
    const box = $('project-cards'); box.textContent = '';
    PROJECTS.forEach((p) => box.appendChild(el('article', { class: 'card' }, [
      el('h2', { text: p.title }), el('p', { class: 'help', text: p.text }),
      el('a', { class: 'btn', href: p.href, text: p.open }),
    ])));
  }

  function renderLibrary() {
    const list = $('library-list'); list.textContent = '';
    const rows = library.list();
    if (!rows.length) { list.appendChild(el('li', { text: 'Nothing saved on this device yet. Use Save to library in the studio.' })); return; }
    rows.forEach((s) => list.appendChild(el('li', { class: 'row' }, [
      el('span', { text: s.name + ' · ' + new Date(s.updated).toLocaleString() }),
      el('a', { class: 'btn small', href: 'studio.html?src=local&id=' + encodeURIComponent(s.model_id), text: 'Open' }),
      el('button', { type: 'button', class: 'btn small ghost', text: 'Remove', onclick: () => { library.remove(s.model_id); renderLibrary(); } }),
    ])));
  }

  function setCloudMsg(text) { $('cloud-status').textContent = text; }

  async function renderCloud() {
    if (!cloud.available) { $('pill-cloud').textContent = 'cloud: unavailable'; setCloudMsg(cloud.reason); return; }
    let session = null;
    try { session = await cloud.session(); } catch (e) { session = null; }
    const signedIn = !!session;
    $('pill-cloud').textContent = signedIn ? 'cloud: signed in' : 'cloud: signed out';
    $('pill-cloud').className = 'pill ' + (signedIn ? 'ok' : '');
    $('send-form').hidden = signedIn;
    $('verify-form').hidden = true;
    $('signout').hidden = !signedIn;
    $('cloud-list-title').hidden = !signedIn;
    const list = $('cloud-list'); list.textContent = '';
    if (!signedIn) { setCloudMsg('Sign in to see and open your cloud scenes. The sign-in code goes only to an existing account.'); return; }
    setCloudMsg('Signed in. Your cloud scenes are below.');
    try {
      const rows = await cloud.listScenes();
      if (!rows || !rows.length) list.appendChild(el('li', { text: 'No scenes in the cloud yet. Use Save to cloud in the studio.' }));
      (rows || []).forEach((r) => list.appendChild(el('li', { class: 'row' }, [
        el('span', { text: (r.name || r.model_id) + ' · ' + (r.updated_at ? new Date(r.updated_at).toLocaleString() : '') }),
        el('a', { class: 'btn small', href: 'studio.html?src=cloud&id=' + encodeURIComponent(r.model_id), text: 'Open' }),
      ])));
    } catch (e) {
      setCloudMsg(C.cloudFriendly(e));
    }
  }

  async function sendCode(e) {
    e.preventDefault();
    const email = $('email').value.trim();
    if (!email) { setCloudMsg('Type the email of your account.'); return; }
    try {
      await cloud.sendCode(email);
      $('verify-form').hidden = false;
      setCloudMsg('A code was sent if the account exists. Type it below.');
    } catch (err) { setCloudMsg(C.cloudFriendly(err)); }
  }
  async function verifyCode(e) {
    e.preventDefault();
    try {
      await cloud.verifyCode($('email').value.trim(), $('code').value.trim());
      await renderCloud();
    } catch (err) { setCloudMsg(C.cloudFriendly(err)); }
  }
  async function signOut() {
    try { await cloud.signOut(); } catch (err) { setCloudMsg(C.cloudFriendly(err)); }
    await renderCloud();
  }

  // Panels collapse; the state is kept on this device.
  function setupPanels() {
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(KEYS.panels) || '{}'); } catch (e) { stored = {}; }
    document.querySelectorAll('.panel[data-panel]').forEach((sec) => {
      const id = sec.dataset.panel;
      const apply = (open) => { sec.dataset.collapsed = String(!open); sec.querySelector('.panelHead').setAttribute('aria-expanded', String(open)); };
      let open = id in stored ? stored[id] : sec.dataset.open !== 'false';
      apply(open);
      sec.querySelector('.panelHead').addEventListener('click', () => {
        open = sec.dataset.collapsed === 'true';
        apply(open); stored[id] = open;
        try { localStorage.setItem(KEYS.panels, JSON.stringify(stored)); } catch (e) { /* not kept */ }
      });
    });
  }

  function boot() {
    setupPanels();
    renderProjects();
    renderLibrary();
    $('send-form').addEventListener('submit', sendCode);
    $('verify-form').addEventListener('submit', verifyCode);
    $('signout').addEventListener('click', signOut);
    if (cloud.available) cloud.onChange(() => { renderCloud(); });
    renderCloud();
  }
  boot();
})();
