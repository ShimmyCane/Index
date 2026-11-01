/* Make 3D — app shell. Connects the engines (core, viewer) to the page.
   All changes go through applyOp(): check, record in history, then redraw. */
(function () {
  const M = window.M3D;
  const $ = (id) => document.getElementById(id);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const STORE_KEY = 'make3d.v1.current';
  const SAMPLES = window.M3D_SAMPLES || {};
  const SAMPLE_ID = 'garden-planter';

  const st = {
    history: null,      // { header, operations, ... }
    world: null,
    cursor: 0,          // how many operations are applied (history step being viewed)
    preview: null,      // model shown without being saved
    previewOp: null,
    rejected: null,     // { op, issues } from the last rejected change
    last: null,         // { op, outcome, issues } from the last accepted change
    check: null,        // result of a model check
    selected: null,
    groundZ: null,      // null = automatic (lowest point of the major box)
    groundOn: false,
    up: 'z',
    display: 'solid',
    units: 'ftin',
    showErrors: false,
    fit: true,
    viewer: null,
  };

  // ---------- storage
  function loadInitial() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.history) return { history: d.history, world: d.world || clone(SAMPLES[SAMPLE_ID].world) };
      }
    } catch (e) { /* storage blocked or corrupt: fall back to the sample */ }
    return sampleBundle();
  }
  function sampleBundle(id = SAMPLE_ID) {
    const s = SAMPLES[id];
    return { history: clone(s.history), world: clone(s.world) };
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ history: st.history, world: st.world }));
      setStatus('Saved on this device', '');
    } catch (e) {
      setStatus('Not saved: browser storage is blocked. Use Save file.', 'bad');
    }
  }
  function setStatus(text, kind) {
    const p = $('status');
    p.textContent = text;
    p.className = 'pill' + (kind ? ' ' + kind : '');
  }

  // ---------- model state
  const latest = () => st.cursor === st.history.operations.length;
  const modelAt = () => M.replay(st.history, st.cursor);
  const shown = () => st.preview || modelAt();
  const findObj = (model, uuid) => model.objects.find((o) => o.uuid === uuid);
  const len = (v) => (st.units === 'in' ? M.fmtLength(v, 'in') : M.fmtLength(v, 'ftin'));

  // ---------- changes
  function applyOp(op) {
    if (!latest()) { setStatus('Go to the latest step to make changes', 'warn'); return { outcome: 'blocked' }; }
    const cur = modelAt();
    const r = M.checkOperation(cur, op, st.world);
    if (r.outcome === 'reject') {
      st.rejected = { op, issues: r.issues };
      st.preview = null; st.previewOp = null;
      render();
      return r;
    }
    const seq = st.history.operations.length + 1;
    const rec = Object.assign({}, op, { seq, time: new Date().toISOString(), author: op.author || 'jimmy' });
    st.history.operations.push(rec);
    st.cursor = seq;
    st.rejected = null; st.preview = null; st.previewOp = null;
    st.last = { op: rec, outcome: r.outcome, issues: r.issues };
    if (op.op === 'delete' && st.selected === op.uuid) st.selected = null;
    save();
    render();
    return r;
  }

  function deleteAndRetry() {
    if (!st.rejected) return;
    const { op, issues } = st.rejected;
    const cur = modelAt();
    const uuids = [...new Set(issues.map((i) => i.uuid).filter((u) => u && findObj(cur, u) && u !== op.uuid))];
    if (!uuids.length) { setStatus('Nothing to delete here. Edit the change instead.', 'warn'); return; }
    st.rejected = null;
    for (const u of uuids) applyOp({ op: 'delete', uuid: u, note: 'removed to fit a rule' });
    const r = applyOp(op);
    if (r.outcome === 'reject') setStatus('Still rejected after removing those objects', 'bad');
  }

  function previewRejected() {
    if (!st.rejected) return;
    try {
      st.preview = M.applyOperation(modelAt(), st.rejected.op);
      st.previewOp = st.rejected.op;
      setStatus('Preview only: not saved', 'warn');
    } catch (e) {
      setStatus(`Cannot preview: ${e.message}`, 'bad');
    }
    render();
  }

  function discardPreview() { st.preview = null; st.previewOp = null; setStatus('Saved on this device', ''); render(); }

  // ---------- rendering
  function render() {
    const model = shown();
    const info = M.majorBox(model.objects, st.up);
    const v = st.up === 'y' ? 1 : 2;
    const full = info.fullBox;

    $('modelTitle').textContent = `${model.name || model.model_id}`;
    if (document.activeElement !== $('modelName')) $('modelName').value = model.name || '';
    if (document.activeElement !== $('modelDesc')) $('modelDesc').value = model.description || '';
    $('modelMeta').textContent = `${model.objects.length} objects · version ${model.version} · origin: ${info.method === 'weighted' ? 'weighted major box' : 'major box centre'}`;

    refreshSelectors();
    renderList(model);
    renderSelection(model);
    renderLast();
    renderReject();
    renderHistory();
    renderErrors();
    $('previewBanner').hidden = !st.preview;

    const groundDefault = info.empty ? 0 : info.groundZ;
    const groundZ = st.groundZ ?? groundDefault;
    const slider = $('groundSlider');
    if (full) {
      const lo = Math.floor(full.min[v]) - 48, hi = Math.ceil(full.max[v]) + 48;
      slider.min = lo; slider.max = hi;
    }
    slider.disabled = !st.groundOn;
    if (document.activeElement !== slider) slider.value = String(Math.round(groundZ * 10) / 10);
    $('groundReadout').textContent = st.groundOn ? len(Number(slider.value)) : 'off';

    if (st.viewer) {
      st.viewer.setOptions({ up: st.up, display: st.display, ground: { on: st.groundOn, z: groundZ } });
      st.viewer.setModel(model, { origin: info.empty ? [0, 0, 0] : info.origin, fullBox: full, fit: st.fit });
      st.viewer.setSelected(st.selected);
    }
    st.fit = false;
  }

  function renderList(model) {
    const ul = $('objectList');
    ul.innerHTML = '';
    const items = [];
    const roots = model.objects.filter((o) => !o.parent || !findObj(model, o.parent));
    const walk = (o, depth) => {
      items.push({ o, depth });
      model.objects.filter((c) => c.parent === o.uuid).forEach((c) => walk(c, depth + 1));
    };
    roots.forEach((o) => walk(o, 0));
    $('emptyNote').hidden = model.objects.length > 0;
    for (const { o, depth } of items) {
      const li = document.createElement('li');
      li.className = depth ? 'child' : '';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = o.uuid === st.selected ? 'sel' : '';
      b.textContent = o.name;
      const k = document.createElement('span');
      k.className = 'kind';
      k.textContent = o.type;
      b.appendChild(k);
      b.addEventListener('click', () => select(o.uuid));
      li.appendChild(b);
      ul.appendChild(li);
    }
  }

  function renderSelection(model) {
    const o = st.selected && findObj(model, st.selected);
    $('selCard').hidden = !o;
    if (!o) return;
    const facts = [
      ['Name', o.name],
      ['Description', o.description || '—'],
      ['Type', o.type],
      ['Size', o.dimensions && o.dimensions.length ? o.dimensions.map((d) => len(d)).join(' × ') : '—'],
      ['Centre', o.position ? o.position.map((p) => len(p)).join(', ') : '—'],
      ['Rotation Y', `${o.rotation_y || 0}°`],
      ['Material', o.material || '—'],
      ['Parent', o.parent ? (findObj(model, o.parent) || {}).name || 'missing' : '—'],
      ['uuid', o.uuid],
    ];
    const dl = $('selFacts');
    dl.innerHTML = '';
    for (const [k, v] of facts) {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = String(v);
      dl.append(dt, dd);
    }
    $('selDelete').disabled = !latest();
  }

  function renderLast() {
    const card = $('lastCard');
    const l = st.last;
    card.hidden = !l || !l.issues.length;
    if (card.hidden) return;
    $('lastTitle').textContent = 'Accepted with notes';
    fillIssues($('lastIssues'), l.issues, false);
  }

  function renderReject() {
    const card = $('rejectCard');
    const wasHidden = card.hidden;
    card.hidden = !st.rejected;
    if (!st.rejected) return;
    if (wasHidden) document.querySelector('.side').scrollTop = 0; // show the reason straight away
    fillIssues($('rejectIssues'), st.rejected.issues, true);
    const cur = modelAt();
    const can = st.rejected.issues.some((i) => i.uuid && findObj(cur, i.uuid) && i.uuid !== st.rejected.op.uuid);
    $('rejectDelete').disabled = !can;
    $('rejectDelete').textContent = can ? 'Delete the listed objects and retry' : 'Nothing to delete: edit the change';
  }

  function fillIssues(ul, issues, bad) {
    ul.innerHTML = '';
    const model = shown();
    for (const i of issues) {
      const li = document.createElement('li');
      li.className = i.severity === 'reject' ? 'reject' : (i.severity || 'warning');
      const obj = i.uuid && findObj(model, i.uuid);
      li.textContent = `${obj ? obj.name + ': ' : ''}${i.message}`;
      ul.appendChild(li);
    }
  }

  function renderHistory() {
    const n = st.history.operations.length;
    const s = $('scrub');
    s.max = n; s.value = st.cursor;
    $('stepLabel').textContent = `v${st.cursor} / ${n}`;
    $('latestBtn').hidden = latest();
  }

  function renderErrors() {
    const area = $('errorsArea');
    area.hidden = !(st.showErrors && st.check);
    if (area.hidden) return;
    const r = st.check;
    const ul = $('errorsList');
    ul.innerHTML = '';
    if (!r.issues.length) {
      const li = document.createElement('li');
      li.textContent = 'No issues found.';
      ul.appendChild(li);
    } else fillIssues(ul, r.issues, false);
    const chip = $('rulesChip');
    chip.textContent = r.issues.length ? `Check: ${r.issues.length} to look at` : 'Check: clear';
  }

  // ---------- selection
  function select(uuid) {
    st.selected = uuid;
    render();
  }

  // ---------- add form
  function buildTypeControls() {
    const sel = $('fType');
    sel.innerHTML = '';
    for (const t of M.TYPES) {
      const o = document.createElement('option');
      o.value = t; o.textContent = t === 'box' ? 'Box' : t === 'group' ? 'Group (holds other objects)' : t[0].toUpperCase() + t.slice(1);
      sel.appendChild(o);
    }
    sel.addEventListener('change', buildDimFields);
    buildDimFields();
  }
  const DIM_LABELS = {
    box: ['Width (X)', 'Depth (Y)', 'Height (Z)'],
    cylinder: ['Radius', 'Height'],
    cone: ['Radius at base', 'Height'],
    sphere: ['Radius'],
    group: [],
  };
  function buildDimFields() {
    const type = $('fType').value;
    const box = $('fDims');
    box.innerHTML = '';
    (DIM_LABELS[type] || []).forEach((label, i) => {
      const l = document.createElement('label');
      l.className = 'field';
      l.textContent = label;
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.id = `fDim${i}`;
      inp.value = type === 'box' ? ['12', '12', '12'][i] : type === 'sphere' ? '3' : ['2', '12'][i];
      l.appendChild(inp);
      box.appendChild(l);
    });
    $('fDims').hidden = !DIM_LABELS[type] || DIM_LABELS[type].length === 0;
  }
  function refreshSelectors() {
    const model = shown();
    const mat = $('fMat');
    const keep = mat.value;
    mat.innerHTML = '<option value="">none</option>';
    Object.keys(model.materials || {}).forEach((k) => {
      const o = document.createElement('option'); o.value = k; o.textContent = k; mat.appendChild(o);
    });
    mat.value = keep;
    const par = $('fParent');
    const keepP = par.value;
    par.innerHTML = '<option value="">none</option>';
    model.objects.filter((o) => o.type === 'group').forEach((g) => {
      const o = document.createElement('option'); o.value = g.uuid; o.textContent = g.name; par.appendChild(o);
    });
    par.value = keepP;
  }

  function submitAdd(e) {
    e.preventDefault();
    const err = $('fErr');
    err.hidden = true;
    const type = $('fType').value;
    const need = DIM_LABELS[type] ? DIM_LABELS[type].length : 0;
    const dims = [];
    for (let i = 0; i < need; i++) dims.push(M.parseLength($(`fDim${i}`).value));
    const pos = ['fX', 'fY', 'fZ'].map((id) => M.parseLength($(id).value));
    const bad = dims.some((d) => !Number.isFinite(d)) || pos.some((p) => !Number.isFinite(p));
    if (bad) { err.textContent = 'Some lengths are not readable. Try 36, 3′ 6″, or 3 1/2.'; err.hidden = false; return; }
    const obj = {
      uuid: M.newUuid(),
      name: $('fName').value.trim() || 'Untitled',
      description: $('fDesc').value.trim(),
      type,
      dimensions: dims,
      position: pos,
      rotation_y: Number($('fRot').value) || 0,
      parent: $('fParent').value || null,
      material: $('fMat').value || null,
    };
    const r = applyOp({ op: 'add', object: obj });
    if (r.outcome !== 'reject') { st.selected = obj.uuid; $('fName').value = ''; $('fDesc').value = ''; render(); }
  }

  // ---------- paste box
  function applyPaste() {
    const err = $('pasteErr');
    const out = $('pasteResults');
    err.hidden = true; out.innerHTML = '';
    let items;
    try {
      const parsed = JSON.parse($('pasteBox').value);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) { err.textContent = 'That is not valid JSON.'; err.hidden = false; return; }
    for (const op of items) {
      if (op.op === 'add' && op.object && !op.object.uuid) op.object.uuid = M.newUuid();
      const r = applyOp(op);
      const li = document.createElement('li');
      li.className = r.outcome === 'reject' ? 'reject' : (r.outcome === 'accept_with_warnings' ? 'warning' : '');
      li.textContent = `${op.op}: ${r.outcome === 'blocked' ? 'blocked' : r.outcome.replace(/_/g, ' ')}`;
      out.appendChild(li);
      if (r.outcome === 'reject' || r.outcome === 'blocked') break;
    }
  }

  // ---------- files
  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function saveFile() {
    const bundle = M.makeBundle({ history: st.history, world: st.world });
    download(`${st.history.model_id}.make3d.json`, bundle);
    setStatus('Saved file downloaded', '');
  }
  function openFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        const { history, world } = M.readBundle(obj, clone(SAMPLES[SAMPLE_ID].world));
        if (!confirm(`Open "${history.header && history.header.name || history.model_id}" and replace the current model?`)) return;
        setState({ history, world });
        setStatus('File opened', '');
      } catch (e) {
        setStatus(`Could not open: ${e.message}`, 'bad');
      }
    };
    reader.readAsText(file);
  }
  function setState({ history, world }) {
    st.history = history; st.world = world;
    st.cursor = history.operations.length;
    st.selected = null; st.rejected = null; st.preview = null; st.last = null; st.check = null;
    st.fit = true; st.groundZ = null;
    save();
    render();
  }

  // ---------- events
  function bind() {
    $('gearBtn').addEventListener('click', () => {
      const open = $('gearPanel').hidden;
      $('gearPanel').hidden = !open;
      $('gearBtn').setAttribute('aria-expanded', String(open));
    });
    $('closeGear').addEventListener('click', () => { $('gearPanel').hidden = true; $('gearBtn').setAttribute('aria-expanded', 'false'); });
    $('upSel').addEventListener('change', (e) => { st.up = e.target.value; st.fit = true; st.groundZ = null; render(); });
    $('displaySel').addEventListener('change', (e) => { st.display = e.target.value; render(); });
    $('unitsSel').addEventListener('change', (e) => { st.units = e.target.value; render(); });
    $('groundOn').addEventListener('change', (e) => { st.groundOn = e.target.checked; render(); });
    $('groundSlider').addEventListener('input', (e) => { st.groundZ = Number(e.target.value); render(); });
    $('showErrors').addEventListener('change', (e) => { st.showErrors = e.target.checked; render(); });
    $('checkBtn').addEventListener('click', () => { st.check = M.checkModel(shown(), st.world); render(); });
    $('rulesChip').addEventListener('click', () => { st.check = M.checkModel(shown(), st.world); st.showErrors = true; $('showErrors').checked = true; render(); });
    $('saveBtn').addEventListener('click', saveFile);
    $('openFile').addEventListener('change', (e) => { if (e.target.files[0]) openFile(e.target.files[0]); e.target.value = ''; });
    $('loadSample').addEventListener('click', () => {
      if (!confirm('Replace the current model with the sample? Save a file first to keep it.')) return;
      const b = sampleBundle($('sampleSel').value);
      setState(b);
      $('gearPanel').hidden = true;
    });
    $('resetView').addEventListener('click', () => { st.fit = true; render(); });

    $('scrub').addEventListener('input', (e) => { st.cursor = Number(e.target.value); st.preview = null; st.rejected = null; render(); });
    $('latestBtn').addEventListener('click', () => { st.cursor = st.history.operations.length; render(); });

    $('modelName').addEventListener('change', (e) => applyOp({ op: 'set_header', set: { name: e.target.value.trim() || st.history.model_id } }));
    $('modelDesc').addEventListener('change', (e) => applyOp({ op: 'set_header', set: { description: e.target.value.trim() } }));

    $('selDelete').addEventListener('click', () => { if (st.selected) applyOp({ op: 'delete', uuid: st.selected }); });

    $('tabAdd').addEventListener('click', () => showTab('add'));
    $('tabPaste').addEventListener('click', () => showTab('paste'));
    $('addForm').addEventListener('submit', submitAdd);
    $('pasteApply').addEventListener('click', applyPaste);

    $('rejectDelete').addEventListener('click', deleteAndRetry);
    $('rejectPreview').addEventListener('click', previewRejected);
    $('rejectDismiss').addEventListener('click', () => { st.rejected = null; st.preview = null; render(); });
    $('previewDiscard').addEventListener('click', discardPreview);
  }

  function showTab(which) {
    const add = which === 'add';
    $('addForm').hidden = !add;
    $('pastePanel').hidden = add;
    $('tabAdd').setAttribute('aria-pressed', String(add));
    $('tabPaste').setAttribute('aria-pressed', String(!add));
  }

  function fillSamples() {
    const sel = $('sampleSel');
    sel.innerHTML = '';
    Object.keys(SAMPLES).forEach((id) => {
      const o = document.createElement('option');
      o.value = id; o.textContent = SAMPLES[id].history.header.name || id;
      sel.appendChild(o);
    });
  }

  // ---------- start
  function start() {
    const b = loadInitial();
    st.history = b.history; st.world = b.world;
    st.cursor = st.history.operations.length;
    st.viewer = M.createViewer($('view'));
    st.viewer.onSelect(select);
    buildTypeControls();
    fillSamples();
    bind();
    render();
    save();
    window.addEventListener('resize', () => st.viewer.resize());
  }
  // The script sits at the end of <body>, so the DOM is ready when it runs.
  start();
})();
