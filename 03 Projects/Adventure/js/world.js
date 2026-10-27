// Adventure — World page: a map of places (each place opens its own map),
// a journal for every character and place, and the plot as chapters.
(function () {
  const { esc, q, status, error } = Adv;

  const data = { places: [], roles: [], npcs: [], notes: [], chapters: [] };
  const view = { mapId: null, selected: null, codexFilter: '', codexOpen: null };
  const when = t => (t ? new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
  const KINDS = ['world', 'region', 'town', 'building', 'room', 'wild', 'other'];

  async function load() {
    try {
      const [places, roles, npcs, notes, chapters] = await Promise.all([
        q(Adv.sb.from('adv_places').select('*').order('sort').order('name')),
        q(Adv.sb.from('adv_roles').select('*').order('sort')),
        q(Adv.sb.from('adv_entries').select('*').eq('kind', 'character').order('title')),
        q(Adv.sb.from('adv_notes').select('*').order('created_at', { ascending: false }).limit(1000)),
        q(Adv.sb.from('adv_chapters').select('id, book, number, title, status, plan, text_tiny, text_short, text_long, created_at, updated_at')
          .order('book').order('number'))
      ]);
      Object.assign(data, { places, roles, npcs, notes, chapters });
      status('ok', '● Connected');
    } catch (e) {
      error('Loading the world', e);
    }
  }

  function renderAll() {
    renderMap();
    renderCodex();
    renderPlot();
  }

  // ================================================================ map
  const placeById = id => data.places.find(p => p.id === id);
  const childrenOf = id => data.places.filter(p => (p.parent_id || null) === id);

  function renderCrumbs() {
    const trail = [];
    for (let p = placeById(view.mapId); p; p = placeById(p.parent_id)) trail.unshift(p);
    document.getElementById('crumbs').innerHTML =
      '<button data-go="">🌍 All</button>' + trail.map(p => ' › <button data-go="' + esc(p.id) + '">' + esc(p.emoji + ' ' + p.name) + '</button>').join('');
  }

  function renderMap() {
    const map = document.getElementById('map');
    // A lone top-level world opens straight onto its own map, until "All" is tapped.
    const roots = childrenOf(null);
    if (view.mapId === null && !view.lockRoot && roots.length === 1) view.mapId = roots[0].id;
    renderCrumbs();
    // Top-level worlds don't sit on a map, so lay them out in a row.
    const spots = childrenOf(view.mapId);
    const box = (p, i) => (view.mapId === null
      ? { x: 4 + (i % 3) * 32, y: 8 + Math.floor(i / 3) * 34, w: 28, h: 28 }
      : p);
    map.innerHTML = spots.map((p, i) => { const b = box(p, i); return (
      '<div class="spot' + (p.id === view.selected ? ' sel' : '') + '" data-id="' + esc(p.id) + '" style="left:' + b.x + '%;top:' + b.y +
      '%;width:' + b.w + '%;height:' + b.h + '%;background:' + esc(p.color) + '">' +
      '<span class="e">' + esc(p.emoji) + '</span><span class="n">' + esc(p.name) + '</span>' +
      '<span class="k">' + esc(p.kind) + (childrenOf(p.id).length ? ' · ' + childrenOf(p.id).length + ' inside' : '') + '</span>' +
      (view.mapId === null ? '' : '<span class="grip" data-grip="1"></span>') + '</div>'); }).join('');
    renderPlaceEdit();
  }

  function renderPlaceEdit() {
    const box = document.getElementById('placeEdit');
    const p = placeById(view.selected);
    if (!p) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.innerHTML =
      '<div class="row-actions"><h3>' + esc(p.emoji + ' ' + p.name) + '</h3>' +
      '<button class="btn sun small" data-open="' + esc(p.id) + '">Open its map ▸</button>' +
      '<button class="btn small" data-journal="place:' + esc(p.id) + '">📓 Journal</button></div>' +
      '<div class="grid2">' +
      '<label>Name<input class="field" data-k="name" value="' + esc(p.name) + '"></label>' +
      '<label>Emoji<input class="field" data-k="emoji" value="' + esc(p.emoji) + '"></label>' +
      '<label>Kind<select class="field" data-k="kind">' + KINDS.map(k => '<option' + (k === p.kind ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></label>' +
      '<label>Color<input class="field" data-k="color" type="color" value="' + esc(/^#[0-9a-f]{6}$/i.test(p.color) ? p.color : '#cdefe0') + '"></label>' +
      '</div><label>Description<textarea class="field" data-k="summary">' + esc(p.summary) + '</textarea></label>' +
      '<div class="row-actions"><button class="btn mint small" id="placeSave">💾 Save</button>' +
      '<button class="btn small" id="placeDelete">🗑 Delete</button><span class="muted" id="placeMsg"></span></div>';
  }

  async function savePlace(id, values, msg) {
    try {
      await q(Adv.sb.from('adv_places').update(values).eq('id', id));
      Object.assign(placeById(id), values);
      if (msg) msg.textContent = 'Saved.';
    } catch (e) {
      error('Saving the place', e);
      if (msg) msg.textContent = e.message;
    }
  }

  async function addPlace() {
    const parent = placeById(view.mapId);
    const kind = !parent ? 'world' : { world: 'region', region: 'town', town: 'building', building: 'room' }[parent.kind] || 'other';
    try {
      const rows = await q(Adv.sb.from('adv_places').insert({
        parent_id: view.mapId, kind, name: 'New ' + kind, emoji: '📍', color: '#CDEFE0', x: 37, y: 38, w: 26, h: 22
      }).select());
      data.places.push(rows[0]);
      view.selected = rows[0].id;
      renderMap();
    } catch (e) {
      error('Adding a place', e);
    }
  }

  // Drag to move, drag the corner to resize; a tap without movement selects.
  function setupMapDrag() {
    const map = document.getElementById('map');
    let drag = null;
    map.addEventListener('pointerdown', ev => {
      const spot = ev.target.closest('.spot');
      if (!spot) return;
      if (view.mapId === null) { view.mapId = spot.dataset.id; view.selected = null; renderMap(); return; }
      const p = placeById(spot.dataset.id);
      const r = map.getBoundingClientRect();
      drag = { spot, p, resize: !!ev.target.dataset.grip, sx: ev.clientX, sy: ev.clientY, x: p.x, y: p.y, w: p.w, h: p.h, rw: r.width, rh: r.height, moved: false };
      spot.setPointerCapture(ev.pointerId);
    });
    map.addEventListener('pointermove', ev => {
      if (!drag) return;
      const dx = (ev.clientX - drag.sx) / drag.rw * 100;
      const dy = (ev.clientY - drag.sy) / drag.rh * 100;
      if (Math.abs(dx) + Math.abs(dy) > 0.8) drag.moved = true;
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const p = drag.p;
      if (drag.resize) {
        p.w = clamp(drag.w + dx, 8, 100 - p.x);
        p.h = clamp(drag.h + dy, 8, 100 - p.y);
      } else {
        p.x = clamp(drag.x + dx, 0, 100 - p.w);
        p.y = clamp(drag.y + dy, 0, 100 - p.h);
      }
      Object.assign(drag.spot.style, { left: p.x + '%', top: p.y + '%', width: p.w + '%', height: p.h + '%' });
    });
    const end = () => {
      if (!drag) return;
      const { p, moved } = drag;
      drag = null;
      if (moved) {
        const r = v => Math.round(v * 10) / 10;
        savePlace(p.id, { x: r(p.x), y: r(p.y), w: r(p.w), h: r(p.h) });
      } else {
        view.selected = p.id;
        renderMap();
      }
    };
    map.addEventListener('pointerup', end);
    map.addEventListener('pointercancel', end);
  }

  // ================================================================ characters & places
  // Every subject with its journal and the chapters that mention it.
  function subjects() {
    const list = [
      ...data.roles.map(r => ({ type: 'role', id: r.id, emoji: r.emoji, name: r.name, kind: r.active ? 'character' : 'character (resting)', desc: r.blurb, field: 'blurb', table: 'adv_roles', updated: r.updated_at, group: 'char' })),
      ...data.npcs.map(n => ({ type: 'entry', id: n.id, emoji: '👤', name: n.title, kind: 'character', desc: n.body, field: 'body', table: 'adv_entries', updated: n.updated_at, group: 'char' })),
      ...data.places.map(p => ({ type: 'place', id: p.id, emoji: p.emoji, name: p.name, kind: p.kind, desc: p.summary, field: 'summary', table: 'adv_places', updated: p.updated_at, group: 'place' }))
    ];
    for (const s of list) {
      s.notes = data.notes.filter(n => n.subject_type === s.type && n.subject_id === s.id);
      s.appears = mentions(s.name);
      const times = [s.updated, ...s.notes.map(n => n.created_at), ...s.appears.map(c => c.created_at)].filter(Boolean);
      s.last = times.sort().pop();
    }
    return list.sort((a, b) => (b.last || '').localeCompare(a.last || ''));
  }

  // Published chapters that mention a name, newest first. "The Crypt" matches "crypt".
  function mentions(name) {
    const word = name.replace(/^the\s+/i, '').trim().toLowerCase();
    if (word.length < 3) return [];
    return data.chapters.filter(c => c.status === 'published' &&
      [c.title, c.text_tiny, c.text_short, c.text_long].join(' ').toLowerCase().includes(word)).reverse();
  }

  function renderCodex() {
    const list = subjects().filter(s => !view.codexFilter || s.group === view.codexFilter);
    const box = document.getElementById('codex');
    box.innerHTML = list.map(s => {
      const key = s.type + ':' + s.id;
      const card = '<button class="cx' + (key === view.codexOpen ? ' on' : '') + '" data-cx="' + esc(key) + '">' +
        '<span class="e">' + esc(s.emoji) + '</span><b>' + esc(s.name) + '</b><span class="muted">' + esc(s.kind) + '</span>' +
        '<span class="when">' + (s.last ? 'last seen ' + esc(when(s.last)) : 'not in the story yet') + '</span></button>';
      return key === view.codexOpen ? card + detailHtml(s) : card;
    }).join('') || '<p class="muted">Nothing yet.</p>';
  }

  function detailHtml(s) {
    const chapterOpts = data.chapters.filter(c => c.status === 'published').slice().reverse()
      .map(c => '<option value="' + esc(c.id) + '">Book ' + c.book + ' · Ch ' + c.number + ': ' + esc(c.title) + '</option>').join('');
    return '<div class="cx-detail">' +
      '<h3>' + esc(s.emoji + ' ' + s.name) + '</h3>' +
      '<label>Description<textarea class="field" id="cxDesc">' + esc(s.desc) + '</textarea></label>' +
      '<div class="row-actions"><button class="btn mint small" id="cxSave">💾 Save description</button><span class="muted" id="cxMsg"></span></div>' +
      '<label>Add to the journal<textarea class="field" id="cxNote" placeholder="Something new about ' + esc(s.name) + '…"></textarea></label>' +
      '<div class="row-actions"><select class="field" id="cxChapter"><option value="">Not tied to a chapter</option>' + chapterOpts + '</select>' +
      '<button class="btn sun small" id="cxAdd">➕ Add note</button></div>' +
      '<div class="journal">' + (s.notes.map(n => {
        const ch = data.chapters.find(c => c.id === n.chapter_id);
        return '<div>' + esc(n.body) + '<small>' + esc(when(n.created_at)) + (ch ? ' · Chapter ' + ch.number + ': ' + esc(ch.title) : '') + '</small></div>';
      }).join('') || '<p class="muted">No journal notes yet.</p>') + '</div>' +
      (s.appears.length ? '<b>Appears in</b><div class="appears">' + s.appears.map(c =>
        '<span class="chip">Ch ' + c.number + ': ' + esc(c.title) + '</span>').join('') + '</div>' : '') +
      (s.type === 'place' ? '<button class="btn small" data-open="' + esc(s.id) + '">🗺️ Show on the map</button>' : '') +
      '</div>';
  }

  async function codexAction(ev) {
    const key = view.codexOpen;
    const s = key && subjects().find(x => x.type + ':' + x.id === key);
    if (!s) return;
    if (ev.target.id === 'cxSave') {
      const msg = document.getElementById('cxMsg');
      try {
        const desc = document.getElementById('cxDesc').value;
        await q(Adv.sb.from(s.table).update({ [s.field]: desc }).eq('id', s.id));
        msg.textContent = 'Saved.';
        await load();
      } catch (e) {
        msg.textContent = e.message;
        error('Saving the description', e);
      }
    } else if (ev.target.id === 'cxAdd') {
      const body = document.getElementById('cxNote').value.trim();
      if (!body) return;
      try {
        await q(Adv.sb.from('adv_notes').insert({
          subject_type: s.type, subject_id: s.id, body, chapter_id: document.getElementById('cxChapter').value || null
        }));
        await load();
        renderCodex();
      } catch (e) {
        error('Adding a journal note', e);
      }
    }
  }

  // ================================================================ plot
  function renderPlot() {
    const books = [...new Set(data.chapters.map(c => c.book))];
    if (!books.length) books.push(1);
    document.getElementById('plot').innerHTML = books.map(b => {
      const chs = data.chapters.filter(c => c.book === b);
      return '<div class="book"><h3>Book ' + b + '</h3>' + chs.map(c =>
        '<div class="plot-row ' + esc(c.status) + '" data-ch="' + esc(c.id) + '"><div class="num">' + c.number + '</div><div class="body">' +
        '<input class="field" data-k="title" value="' + esc(c.title) + '">' +
        '<textarea class="field" data-k="plan" placeholder="What should happen in this chapter?">' + esc(c.plan) + '</textarea>' +
        '<div class="row-actions"><span class="chip' + (c.status === 'published' ? ' on' : '') + '">' + (c.status === 'published' ? '✓ written' : '✏️ planned') + '</span>' +
        '<button class="btn mint small" data-plot-save="1">💾 Save</button><span class="muted msg"></span></div></div></div>').join('') +
        '<button class="btn sun small" data-plot-add="' + b + '">➕ Plan the next chapter</button></div>';
    }).join('') + '<button class="btn small" data-plot-add="' + (Math.max(0, ...books) + 1) + '">📚 Start a new book</button>';
  }

  async function plotAction(ev) {
    if (ev.target.dataset.plotAdd) {
      const book = Number(ev.target.dataset.plotAdd);
      const last = data.chapters.filter(c => c.book === book).pop();
      try {
        await q(Adv.sb.from('adv_chapters').insert({ book, number: last ? last.number + 1 : 1, title: 'New chapter', status: 'planned', plan: '' }));
        await load();
        renderPlot();
      } catch (e) {
        error('Planning a chapter', e);
      }
    } else if (ev.target.dataset.plotSave) {
      const row = ev.target.closest('.plot-row');
      const msg = row.querySelector('.msg');
      try {
        await q(Adv.sb.from('adv_chapters').update({
          title: row.querySelector('[data-k="title"]').value,
          plan: row.querySelector('[data-k="plan"]').value
        }).eq('id', row.dataset.ch));
        msg.textContent = 'Saved.';
      } catch (e) {
        msg.textContent = e.message;
        error('Saving the plot', e);
      }
    }
  }

  // ================================================================ start
  async function start() {
    Adv.buildChrome();
    const panels = document.getElementById('panels');
    panels.addEventListener('click', ev => {
      const head = ev.target.closest('.panel-head');
      if (head) {
        const body = head.nextElementSibling;
        body.classList.toggle('hidden');
        head.querySelector('.pm').textContent = body.classList.contains('hidden') ? '+' : '−';
        return;
      }
      const t = ev.target;
      if (t.dataset.go !== undefined) { view.mapId = t.dataset.go || null; view.selected = null; view.lockRoot = true; renderMap(); }
      else if (t.dataset.open) { view.mapId = t.dataset.open; view.selected = null; renderMap(); document.getElementById('map').scrollIntoView({ block: 'center' }); }
      else if (t.dataset.journal) { view.codexOpen = t.dataset.journal; renderCodex(); document.getElementById('codex').scrollIntoView({ block: 'start' }); }
      else if (t.closest('.cx')) { const k = t.closest('.cx').dataset.cx; view.codexOpen = view.codexOpen === k ? null : k; renderCodex(); }
      else if (t.id === 'cxSave' || t.id === 'cxAdd') codexAction(ev);
      else if (t.dataset.plotAdd || t.dataset.plotSave) plotAction(ev);
      else if (t.id === 'placeSave') {
        const box = document.getElementById('placeEdit');
        const values = {};
        box.querySelectorAll('[data-k]').forEach(el => { values[el.dataset.k] = el.value; });
        savePlace(view.selected, values, document.getElementById('placeMsg')).then(renderMap);
      } else if (t.id === 'placeDelete') {
        if (!t.classList.contains('coral')) { t.classList.add('coral'); t.textContent = 'Tap again to delete'; return; }
        q(Adv.sb.from('adv_places').delete().eq('id', view.selected))
          .then(() => { data.places = data.places.filter(p => p.id !== view.selected); view.selected = null; renderMap(); })
          .catch(e => error('Deleting the place', e));
      }
    });
    document.getElementById('cxFilter').onclick = ev => {
      if (ev.target.dataset.f === undefined) return;
      view.codexFilter = ev.target.dataset.f;
      document.querySelectorAll('#cxFilter .chip').forEach(c => c.classList.toggle('on', c === ev.target));
      renderCodex();
    };
    document.getElementById('addPlace').onclick = addPlace;
    setupMapDrag();

    const session = await Adv.signIn();
    if (!session) return;
    await load();
    renderAll();
  }

  start();
})();
