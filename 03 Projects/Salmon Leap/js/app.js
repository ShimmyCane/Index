/* Salmon Leap: the page. Five versions in one bundle; each one is replayed and checked before it is shown. */
(function () {
  'use strict';
  const M = window.M3DXC.model, VW = window.M3DXC.viewer;
  const VERSIONS = window.SALMON_VERSIONS || [];
  const $ = (id) => document.getElementById(id);
  const MODE_NEXT = { material: 'provenance', provenance: 'plain', plain: 'material' };
  const MODE_LABEL = { material: 'Colour: material', provenance: 'Colour: certainty', plain: 'Colour: paper and ink' };
  let current = VERSIONS.length ? VERSIONS.length : 0;
  let mode = 'material';
  let viewer = null;

  function renderTabs() {
    const box = $('version-tabs'); box.textContent = '';
    VERSIONS.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn small'; b.textContent = v.label;
      b.setAttribute('aria-pressed', String(i === current));
      b.addEventListener('click', () => show(i));
      box.appendChild(b);
    });
  }

  function show(i) {
    current = i;
    const v = VERSIONS[i];
    renderTabs();
    $('version-title').textContent = v.label + ' · ' + v.title;
    $('narrative').textContent = v.narrative;
    const pill = $('pill-audit');
    pill.className = 'pill ' + (v.audit.ok ? 'ok' : 'bad');
    pill.textContent = v.label + ': ' + (v.audit.ok ? 'checks clean' : 'checks failing');
    const st = v.stats;
    const growth = v.growth ? ' · growth ×' + v.growth.triangles + ' triangles, ×' + v.growth.objects + ' objects' : '';
    $('facts').textContent = st.objects + ' objects (' + st.parts + ' parts), about ' + st.triangles.toLocaleString() + ' triangles' + growth + ' · history ' + v.model.history_hash;
    const list = $('part-list'); list.textContent = '';
    v.model.objects.filter(o => o.type !== 'group').forEach(o => {
      const li = document.createElement('li');
      li.textContent = o.name + ' · ' + o.material;
      list.appendChild(li);
    });
    // the replayed model (a re-check, so the page shows what the rules see)
    const replayed = M.replay(v.history, window.SALMON_WORLD || { warn_below_percent: 50, min_dimension_in: 0.05, max_dimension_in: 240, up: 'z', units: 'in' });
    if (viewer) viewer.setModel(replayed.model);
  }

  function boot() {
    if (!VERSIONS.length) { $('subtitle').textContent = 'No versions found. Run node tools/build_versions.js.'; return; }
    current = VERSIONS.length - 1;
    document.querySelectorAll('.panel[data-panel]').forEach((sec) => {
      sec.querySelector('.panelHead').addEventListener('click', () => {
        const open = sec.dataset.collapsed === 'true';
        sec.dataset.collapsed = String(!open);
        sec.querySelector('.panelHead').setAttribute('aria-expanded', String(open));
      });
      if (sec.dataset.open === 'false') { sec.dataset.collapsed = 'true'; sec.querySelector('.panelHead').setAttribute('aria-expanded', 'false'); }
    });
    if (typeof THREE !== 'undefined') {
      viewer = VW.create($('view'));
      viewer.start();
    } else {
      $('subtitle').textContent += ' · the 3-D engine did not load.';
    }
    document.querySelectorAll('button[data-view]').forEach((b) => b.addEventListener('click', () => {
      if (viewer) { viewer.setView(b.dataset.view); viewer.render(); }
    }));
    $('mode').textContent = MODE_LABEL[mode];
    $('mode').addEventListener('click', () => {
      mode = MODE_NEXT[mode];
      $('mode').textContent = MODE_LABEL[mode];
      if (viewer) viewer.setMode(mode === 'provenance' ? 'provenance' : mode, VERSIONS[current] ? M.replay(VERSIONS[current].history, { warn_below_percent: 50, min_dimension_in: 0.05, max_dimension_in: 240 }).model : null);
    });
    show(current);
  }
  boot();
})();
