// Adventure — under the hood: edit every table as text, see what changed,
// and roll back one change or everything after a time.
(function () {
  const { esc, q, status, error } = Adv;

  // How each table is shown and edited. type: text | long | int | bool | json | select
  const TABLES = {
    adv_entries: {
      order: [['kind'], ['sort'], ['title']],
      label: r => r.title,
      tag: r => r.kind,
      fields: [
        { k: 'kind', type: 'select', options: ['world', 'character', 'history', 'plan', 'theme', 'rule', 'note', 'setting'] },
        { k: 'title' }, { k: 'body', type: 'long' }, { k: 'sort', type: 'int' }
      ],
      fresh: () => ({ kind: 'note', title: 'Note for tonight', body: '', sort: 0 })
    },
    adv_roles: {
      order: [['sort']],
      label: r => r.emoji + ' ' + r.name,
      tag: r => (r.active ? 'playing' : 'resting'),
      fields: [
        { k: 'key', hint: 'short id the storyteller uses, like bristle' }, { k: 'name' }, { k: 'emoji' },
        { k: 'color', hint: 'a pastel like #CDEFE0' }, { k: 'blurb', type: 'long' }, { k: 'voice', type: 'long', hint: 'how they talk' },
        { k: 'active', type: 'bool' }, { k: 'sort', type: 'int' }
      ],
      fresh: () => ({ key: 'new_role', name: 'New character', emoji: '🙂', color: '#F9C8A8', blurb: '', voice: '', active: true, sort: 9 })
    },
    adv_chapters: {
      order: [['book', false], ['number', false]],
      label: r => 'Book ' + r.book + ' · Chapter ' + r.number + ': ' + r.title,
      tag: r => r.status,
      fields: [
        { k: 'book', type: 'int' }, { k: 'number', type: 'int' }, { k: 'title' },
        { k: 'text_tiny', type: 'long', hint: 'a couple of sentences' },
        { k: 'text_short', type: 'long', hint: 'about a minute' },
        { k: 'text_long', type: 'long', hint: 'about five minutes aloud' },
        { k: 'whispers', type: 'json', hint: '{ "role_key": "only this role hears this" }' },
        { k: 'prompt', type: 'long', hint: 'the question the chapter ends on' },
        { k: 'status', type: 'select', options: ['published', 'planned'] },
        { k: 'plan', type: 'long', hint: 'what this chapter should do (for planned chapters)' }
      ],
      fresh: rows => {
        const last = rows[0];
        return { book: last ? last.book : 1, number: last ? last.number + 1 : 1, title: 'New chapter',
          text_tiny: '', text_short: '', text_long: '', whispers: {}, prompt: '', status: 'planned', plan: '' };
      }
    },
    adv_places: {
      order: [['sort'], ['name']],
      label: r => r.emoji + ' ' + r.name,
      tag: r => r.kind,
      fields: [
        { k: 'name' }, { k: 'kind', type: 'select', options: ['world', 'region', 'town', 'building', 'room', 'wild', 'other'] },
        { k: 'emoji' }, { k: 'color' }, { k: 'summary', type: 'long' },
        { k: 'parent_id', hint: 'id of the place this sits inside; easier on the World page' },
        { k: 'x', type: 'int' }, { k: 'y', type: 'int' }, { k: 'w', type: 'int' }, { k: 'h', type: 'int' }, { k: 'sort', type: 'int' }
      ],
      fresh: () => ({ name: 'New place', kind: 'region', emoji: '📍', color: '#CDEFE0', summary: '', parent_id: '', x: 10, y: 10, w: 26, h: 20, sort: 0 })
    },
    adv_notes: {
      order: [['created_at', false]],
      label: r => r.body.slice(0, 80),
      tag: r => r.subject_type,
      fields: [{ k: 'body', type: 'long' }]
    },
    adv_turns: {
      order: [['created_at', false]],
      label: r => r.beats.map(b => b.role).join(' → '),
      tag: r => r.status,
      fields: [{ k: 'beats', type: 'json' }, { k: 'status', type: 'select', options: ['waiting', 'used'] }]
    }
  };

  const data = {};
  const when = t => (t ? new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');

  // ---------------------------------------------------------------- tables
  async function loadTable(table) {
    const cfg = TABLES[table];
    let b = Adv.sb.from(table).select('*');
    for (const [col, asc = true] of cfg.order) b = b.order(col, { ascending: asc });
    try {
      data[table] = await q(b.limit(200));
      renderTable(table);
    } catch (e) {
      error('Loading ' + table, e);
    }
  }

  function fieldHtml(f, value) {
    const id = 'f-' + f.k;
    const hint = f.hint ? ' <span class="muted">(' + esc(f.hint) + ')</span>' : '';
    let input;
    if (f.type === 'long') input = '<textarea class="field long" data-k="' + f.k + '">' + esc(value) + '</textarea>';
    else if (f.type === 'json') input = '<textarea class="field json" data-k="' + f.k + '">' + esc(JSON.stringify(value, null, 2)) + '</textarea>';
    else if (f.type === 'bool') input = '<input type="checkbox" data-k="' + f.k + '"' + (value ? ' checked' : '') + '>';
    else if (f.type === 'select') input = '<select class="field" data-k="' + f.k + '">' + f.options.map(o =>
      '<option' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
    else input = '<input class="field" data-k="' + f.k + '"' + (f.type === 'int' ? ' type="number"' : '') + ' value="' + esc(value) + '">';
    return '<label for="' + id + '">' + esc(f.k) + hint + input + '</label>';
  }

  function rowHtml(table, r, isNew) {
    const cfg = TABLES[table];
    const tag = cfg.tag ? '<span class="tag">' + esc(cfg.tag(r)) + '</span>' : '';
    return '<details class="row-item" data-id="' + esc(r.id || '') + '"' + (isNew ? ' open' : '') + '>' +
      '<summary>' + tag + '<span>' + esc(isNew ? 'New: ' + cfg.label(r) : cfg.label(r)) + '</span>' +
      '<span class="when">' + esc(when(r.updated_at || r.created_at)) + '</span></summary>' +
      '<form class="row-form">' + cfg.fields.map(f => fieldHtml(f, r[f.k])).join('') +
      '<div class="row-actions"><button class="btn mint small" data-act="save">💾 Save</button>' +
      (isNew ? '' : '<button class="btn small" data-act="delete">🗑 Delete</button>') +
      '<span class="muted msg"></span></div></form></details>';
  }

  function renderTable(table) {
    const list = document.querySelector('.list[data-table="' + table + '"]');
    const rows = data[table] || [];
    list.innerHTML = (TABLES[table].fresh ? '<button class="btn sun small add">➕ Add</button>' : '') +
      (rows.length ? rows.map(r => rowHtml(table, r)).join('') : '<p class="muted">Nothing here yet.</p>');
  }

  function readForm(table, form) {
    const out = {};
    for (const f of TABLES[table].fields) {
      const el = form.querySelector('[data-k="' + f.k + '"]');
      if (f.type === 'bool') out[f.k] = el.checked;
      else if (f.type === 'int') out[f.k] = parseInt(el.value, 10) || 0;
      else if (f.type === 'json') {
        try { out[f.k] = JSON.parse(el.value || 'null'); }
        catch (e) { throw new Error(f.k + ' is not valid JSON: ' + e.message); }
      } else out[f.k] = el.value;
      if (f.k.endsWith('_id') && out[f.k] === '') out[f.k] = null;
    }
    return out;
  }

  async function onListClick(ev) {
    const list = ev.target.closest('.list[data-table]');
    if (!list) return;
    const table = list.dataset.table;

    if (ev.target.classList.contains('add')) {
      ev.preventDefault();
      ev.target.insertAdjacentHTML('afterend', rowHtml(table, TABLES[table].fresh(data[table] || []), true));
      return;
    }
    const act = ev.target.dataset && ev.target.dataset.act;
    if (!act) return;
    ev.preventDefault();
    const item = ev.target.closest('.row-item');
    const form = item.querySelector('form');
    const msg = item.querySelector('.msg');
    const id = item.dataset.id;

    // Deleting needs a second tap. It is logged, so it can be undone in History.
    if (act === 'delete' && !ev.target.classList.contains('coral')) {
      ev.target.classList.add('coral');
      ev.target.textContent = 'Tap again to delete';
      return;
    }
    try {
      msg.textContent = 'Saving…';
      if (act === 'save') {
        const values = readForm(table, form);
        if (id) await q(Adv.sb.from(table).update(values).eq('id', id));
        else await q(Adv.sb.from(table).insert(values));
      } else {
        await q(Adv.sb.from(table).delete().eq('id', id));
      }
      await loadTable(table);
      await loadHistory();
      status('ok', '● Saved');
    } catch (e) {
      msg.textContent = e.message;
      error('Saving ' + table, e);
    }
  }

  // ---------------------------------------------------------------- status
  async function loadStatus() {
    try {
      const [runs, waiting] = await Promise.all([
        q(Adv.sb.from('adv_runs').select('*').order('started_at', { ascending: false }).limit(5)),
        q(Adv.sb.from('adv_turns').select('id').eq('status', 'waiting'))
      ]);
      document.getElementById('statusBox').innerHTML =
        '<p><b>' + waiting.length + '</b> ' + (waiting.length === 1 ? 'scene is' : 'scenes are') + ' waiting for the storyteller.</p>' +
        (runs.length ? '<ul>' + runs.map(r => '<li>' + esc(when(r.started_at)) + ' — <b>' + esc(r.status) + '</b>' +
          (r.turns_used ? ', read ' + r.turns_used + ' scenes' : '') + (r.note ? ': ' + esc(r.note) : '') + '</li>').join('') + '</ul>'
          : '<p class="muted">The storyteller has not run yet.</p>');
    } catch (e) {
      error('Loading storyteller status', e);
    }
  }

  // ---------------------------------------------------------------- history
  let historyFilter = '';

  function rowName(row) {
    if (!row) return '';
    if (row.title && row.number != null) return 'Chapter ' + row.number + ': ' + row.title;
    return row.title || row.name || (row.beats ? row.beats.map(b => b.role).join(' → ') : '');
  }

  function diffHtml(h) {
    const o = h.old_row || {}, n = h.new_row || {};
    const keys = [...new Set([...Object.keys(o), ...Object.keys(n)])]
      .filter(k => k !== 'updated_at' && JSON.stringify(o[k]) !== JSON.stringify(n[k]));
    const show = v => (v == null ? '—' : typeof v === 'string' ? v : JSON.stringify(v));
    const cut = s => (s.length > 400 ? s.slice(0, 400) + '…' : s);
    return keys.map(k => '<div><b>' + esc(k) + '</b>\nbefore: ' + esc(cut(show(o[k]))) + '\nafter: ' + esc(cut(show(n[k]))) + '</div>').join('');
  }

  async function loadHistory() {
    try {
      let b = Adv.sb.from('adv_history').select('*').order('id', { ascending: false }).limit(150);
      if (historyFilter) b = b.eq('table_name', historyFilter);
      const rows = await q(b);
      document.getElementById('history').innerHTML = rows.length ? rows.map(h =>
        '<details class="row-item"><summary><span class="actor ' + esc(h.actor) + '">' + esc(h.actor) + '</span>' +
        '<span>' + esc(h.action) + ' · ' + esc(h.table_name.replace('adv_', '')) + ' · ' + esc(rowName(h.new_row || h.old_row)) + '</span>' +
        '<span class="when">' + esc(when(h.at)) + '</span></summary>' +
        '<div class="diff">' + diffHtml(h) +
        '<div class="row-actions"><button class="btn small" data-undo="' + h.id + '">↩︎ Undo this change</button><span class="muted msg"></span></div>' +
        '</div></details>').join('') : '<p class="muted">No changes yet.</p>';
    } catch (e) {
      error('Loading history', e);
    }
  }

  async function reloadAll() {
    await Promise.all([...Object.keys(TABLES).map(loadTable), loadHistory(), loadStatus()]);
  }

  async function onHistoryClick(ev) {
    const id = ev.target.dataset && ev.target.dataset.undo;
    if (!id) return;
    const msg = ev.target.parentElement.querySelector('.msg');
    try {
      msg.textContent = 'Undoing…';
      const res = await q(Adv.sb.rpc('adv_restore', { p_history_id: Number(id) }));
      msg.textContent = 'Done: ' + res;
      await reloadAll();
    } catch (e) {
      msg.textContent = e.message;
      error('Undo', e);
    }
  }

  async function rollback(ev) {
    const btn = ev.target;
    const at = document.getElementById('rbAt').value;
    if (!at) { btn.textContent = 'Pick a time first'; return; }
    if (!btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      btn.textContent = 'Tap again to undo everything after ' + new Date(at).toLocaleString();
      return;
    }
    btn.classList.remove('confirm');
    const tables = ['adv_roles', 'adv_entries', 'adv_chapters', 'adv_places', 'adv_notes'];
    if (document.getElementById('rbTurns').checked) tables.push('adv_turns');
    try {
      const n = await q(Adv.sb.rpc('adv_restore_to', { p_at: new Date(at).toISOString(), p_tables: tables }));
      btn.textContent = '↩︎ Rolled back ' + n + ' changes';
      await reloadAll();
    } catch (e) {
      btn.textContent = '↩︎ Roll back';
      error('Roll back', e);
    }
  }

  // ---------------------------------------------------------------- start
  async function start() {
    Adv.buildChrome();
    document.getElementById('panels').addEventListener('click', ev => {
      const head = ev.target.closest('.panel-head');
      if (!head) return;
      const body = head.nextElementSibling;
      body.classList.toggle('hidden');
      head.querySelector('.pm').textContent = body.classList.contains('hidden') ? '+' : '−';
    });
    document.getElementById('panels').addEventListener('click', onListClick);
    document.getElementById('history').addEventListener('click', onHistoryClick);
    document.getElementById('rbBtn').onclick = rollback;
    document.getElementById('hFilter').onclick = ev => {
      if (ev.target.dataset.t === undefined) return;
      historyFilter = ev.target.dataset.t;
      document.querySelectorAll('#hFilter .chip').forEach(c => c.classList.toggle('on', c === ev.target));
      loadHistory();
    };

    const session = await Adv.signIn();
    if (!session) return;
    await reloadAll();
    status('ok', '● Connected');
  }

  start();
})();
