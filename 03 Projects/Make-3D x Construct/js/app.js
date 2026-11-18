/*
 * Make 3D x Construct: the page. Wires the engine (js/core), the AI review loop (js/core/review.js),
 * the viewer (js/viewer) and the panels.
 * Every change is an operation appended to the history. It is replayed and checked BEFORE it is saved;
 * a change the checks refuse is not saved. AI replies are validated before anything is applied.
 * Text from the page is written with textContent, never innerHTML.
 * Storage: this device only (localStorage, in try/catch). Nothing is sent anywhere.
 */
(function () {
  'use strict';

  var M = window.M3DXC.model, RD = window.M3DXC.rounds, RV = window.M3DXC.review, VW = window.M3DXC.viewer;
  var BASE = window.M3DXC_SAMPLE;
  var KEYS = { history: 'm3dxc.history.v1', rounds: 'm3dxc.rounds.v1', notes: 'm3dxc.notes.v1',
    settings: 'm3dxc.settings.v1', panels: 'm3dxc.panels.v1', factcheck: 'm3dxc.factcheck.v1' };
  var CRITERIA_LABEL = { silhouette: 'silhouette', proportion: 'proportion', identity: 'identity', finish: 'finish' };

  // Every item that needs a review by a person or an AI, with a switch in ⚙️.
  var REVIEW_ITEMS = [
    { key: 'person_verdict', who: 'You', def: true, label: 'I record each round\'s verdict (won, lost or tie)' },
    { key: 'person_scores', who: 'You', def: true, label: 'I score the four criteria (0–3) for each round' },
    { key: 'ai_critic', who: 'AI', def: false, label: 'An AI critic judges each round from the packet (paste reply)' },
    { key: 'ai_factcheck', who: 'AI', def: false, label: 'An AI fact-checks the story claims (paste reply)' },
  ];

  var $ = function (id) { return document.getElementById(id); };
  var state = {
    history: null, result: null, audit: null, run: null, notes: [], story: null,
    settings: { showErrors: false, roundCap: null, reviews: {} }, selected: null, mode: 'material', viewer: null,
    factcheck: {}
  };
  REVIEW_ITEMS.forEach(function (r) { state.settings.reviews[r.key] = r.def; });
  function on(key) { return !!state.settings.reviews[key]; }

  // ---------- the library and the cloud (the home page signs in; the studio saves) ----------
  var LIBRARY = window.M3DXC.library.createLibrary(window.M3DXC.library.browserStore(window.localStorage));
  var CLOUD = window.M3DXC.cloud.createCloud(window.supabase, window.M3DXC.cloud.CONFIG,
    { redirectTo: (location.protocol.indexOf('http') === 0) ? location.href : undefined });

  function saveToLibrary() {
    var r = LIBRARY.save({ model: state.result.model, history: state.history, world: BASE.world });
    return r.ok ? 'Saved to the library on this device.' : r.error;
  }
  async function saveToCloud() {
    if (!CLOUD.available) return CLOUD.reason;
    var session = null;
    try { session = await CLOUD.session(); } catch (e) { session = null; }
    if (!session) return 'Sign in on the home page first. Nothing was sent.';
    try {
      await CLOUD.saveScene({ model: state.result.model, history: state.history, world: BASE.world });
      return 'Saved to the cloud library.';
    } catch (e) { return window.M3DXC.cloud.cloudFriendly(e); }
  }

  // ---------- storage (this device only; never throws) ----------
  var storageOk = true;
  function load(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { storageOk = false; return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { storageOk = false; return false; }
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  // ---------- history ----------
  function initHistory() {
    var saved = load(KEYS.history, null);
    if (saved && saved.schema === M.SCHEMA.history && saved.header && saved.header.model_id === BASE.model.model_id) return saved;
    return JSON.parse(JSON.stringify(BASE.history));
  }

  function recompute() {
    state.result = M.replay(state.history, BASE.world);
    state.audit = M.audit(state.result);
  }

  // Appends one operation. Refused (and not saved) if the replay rejects it.
  function commitOp(op, doneText) {
    var next = JSON.parse(JSON.stringify(state.history));
    var last = next.operations.length ? next.operations[next.operations.length - 1].seq : 0;
    op.seq = last + 1;
    op.time = new Date().toISOString();
    op.author = 'you';
    next.operations.push(op);
    var r = M.replay(next, BASE.world);
    var before = state.result.rejected.length;
    if (r.rejected.length > before) {
      var newest = r.diagnostics.filter(function (d) { return d.severity === 'error' && d.path.indexOf('operations[' + (next.operations.length - 1) + ']') === 0; });
      return { ok: false, errors: (newest.length ? newest : r.diagnostics.filter(function (d) { return d.severity === 'error'; })).map(function (d) { return d.message + ' (' + d.fix + ')'; }) };
    }
    state.history = next;
    if (!save(KEYS.history, next)) setDbMessage();
    recompute();
    renderAll();
    if (state.viewer) state.viewer.setModel(state.result.model);
    return { ok: true, text: doneText };
  }

  function rootUuid() {
    var root = state.result.model.objects.filter(function (o) { return o.type === 'group' && !o.parent; })[0];
    return root ? root.uuid : null;
  }

  function objectByUuid(uuid) { return M.findObject(state.result.model.objects, uuid); }

  // ---------- rendering ----------
  function renderHeader() {
    var a = state.audit, pill = $('pill-audit');
    pill.className = 'pill ' + (a.ok ? 'ok' : 'bad');
    pill.textContent = a.ok ? 'checks: clean' : 'checks: ' + a.errors + ' error(s), ' + a.unexplained + ' unexplained warning(s)';
    var r = state.run;
    $('pill-rounds').textContent = 'rounds: ' + r.rounds.length + ' · best ' + (r.best_round || 'none') +
      (r.status === 'stopped' ? ' · stopped' : '');
  }

  function depthOf(objects, obj) {
    var d = 0, cur = obj, guard = 0;
    while (cur && cur.parent && guard++ < 32) { d++; cur = M.findObject(objects, cur.parent); }
    return d;
  }

  function renderTree() {
    var list = $('tree'); list.textContent = '';
    state.result.model.objects.forEach(function (o) {
      var d = depthOf(state.result.model.objects, o);
      list.appendChild(el('li', { class: d ? 'nested' : '', role: 'option', 'aria-selected': String(state.selected === o.uuid),
        onclick: function () { select(o.uuid); } }, [
        el('span', { text: o.name }),
        el('span', { class: 'meta', text: o.type === 'group' ? 'group' : o.type + ' · ' + o.certainty.percent + '%' })
      ]));
    });
  }

  function renderCert() {
    var list = $('cert-list'); list.textContent = '';
    M.sortSolids(state.result.model.objects, $('sort-by').value, $('sort-dir').value).forEach(function (o) {
      var pct = o.certainty.percent;
      list.appendChild(el('li', { 'aria-selected': String(state.selected === o.uuid), onclick: function () { select(o.uuid); } }, [
        el('span', { text: o.name }),
        el('span', { class: 'bar', 'aria-hidden': 'true' }, [el('span', { style: 'width:' + pct + '%' })]),
        el('span', { class: 'meta', text: pct + '% · ' + M.band(pct) })
      ]));
    });
  }

  function renderFlags() {
    var list = $('flag-list'); list.textContent = '';
    state.result.model.flags.forEach(function (f) {
      var target = objectByUuid(f.target);
      var kindTag = f.kind === 'consultation' ? 'consultation' : 'uncertain';
      list.appendChild(el('li', {}, [
        el('span', { class: 'tag', text: f.id }),
        el('span', { class: 'tag ' + kindTag, text: kindTag }),
        el('span', { text: f.text + ' (' + (target ? target.name : f.target) + ')' }),
        f.status === 'open'
          ? el('button', { type: 'button', class: 'btn small ghost meta', text: 'Close flag', onclick: function () { closeFlag(f); } })
          : el('span', { class: 'meta', text: 'closed' + (f.close_note ? ': ' + f.close_note : '') })
      ]));
    });
    if (!state.result.model.flags.length) list.appendChild(el('li', { text: 'No flags.' }));
  }

  function renderStory() {
    var s = state.story;
    $('story-status').textContent = s.status;
    $('story-intro').textContent = s.intro;
    var list = $('story-steps'); list.textContent = '';
    s.steps.forEach(function (st, i) {
      var objs = st.objects.map(function (u) {
        var o = objectByUuid(u);
        return el('button', { type: 'button', class: 'btn small ghost', text: o ? o.name : u, onclick: function () { select(u); } });
      });
      list.appendChild(el('li', { class: 'stack' }, [
        el('span', { text: (i + 1) + '. ' + st.text }),
        objs.length ? el('span', { class: 'row' }, objs) : null,
        el('ul', { class: 'plain' }, st.claims.map(function (c) {
          var src = c.source === 'scene' ? 'scene choice' : c.source;
          var fc = state.factcheck[c.id];
          var status = fc ? ' · AI: ' + fc.status : '';
          return el('li', { text: c.text + ' [' + src + ', ' + c.certainty + '%' + status + ']' + (c.note ? ' ' + c.note : '') });
        }))
      ]));
    });
    var not = $('story-not'); not.textContent = '';
    s.not_depicted.forEach(function (t) { not.appendChild(el('li', { text: t })); });
    $('factcheck').hidden = !on('ai_factcheck');
  }

  function renderLedger() {
    var list = $('ledger-list'); list.textContent = '';
    state.run.ledger.forEach(function (i) {
      list.appendChild(el('li', {}, [
        el('span', { class: 'tag', text: i.id }),
        el('span', { text: i.title }),
        el('span', { class: 'meta', text: i.criterion + ' · ' + i.severity + ' · ' + i.status + (i.attempts ? ' · tried ' + i.attempts : '') })
      ]));
    });
    if (!state.run.ledger.length) list.appendChild(el('li', { text: 'No defects logged yet.' }));
    var crit = $('defect-criterion');
    if (!crit.options.length) state.run.criteria.forEach(function (c) { crit.appendChild(el('option', { value: c, text: CRITERIA_LABEL[c] || c })); });
    renderRoundItems();
    renderRoundControls();
  }

  // Checkboxes for the open defects; at most four may be ticked.
  function renderRoundItems() {
    var box = $('round-items'), prev = {};
    box.querySelectorAll('input[type=text]').forEach(function (t) { prev[t.dataset.id] = t.value; });
    box.textContent = '';
    var open = RD.openItems(state.run);
    if (!open.length) { box.appendChild(el('p', { class: 'help', text: 'No open defects to work.' })); return; }
    open.forEach(function (i) {
      var cb = el('input', { type: 'checkbox', 'data-id': i.id, onchange: limitTicks });
      var txt = el('input', { type: 'text', 'data-id': i.id, placeholder: 'what changed for ' + i.id, value: prev[i.id] || '' });
      box.appendChild(el('label', { class: 'row' }, [el('span', {}, [cb, ' ' + i.id + ' ' + i.title]), txt]));
    });
    limitTicks();
  }

  function limitTicks() {
    var boxes = $('round-items').querySelectorAll('input[type=checkbox]');
    var ticked = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
    var max = state.run.settings.max_items_per_round;
    Array.prototype.forEach.call(boxes, function (b) { b.disabled = !b.checked && ticked >= max; });
    $('round-msg').textContent = ticked + ' of ' + max + ' ticked for this round.';
  }

  // Score selects (only when the person scores) and the review controls that follow the switches in ⚙️.
  function renderRoundControls() {
    var sel = $('score-selects');
    if (!sel.childNodes.length) {
      state.run.criteria.forEach(function (c) {
        var s = el('select', { 'data-criterion': c }, [el('option', { value: '', text: '–' })].concat([0, 1, 2, 3].map(function (v) {
          return el('option', { value: String(v), text: v + ' ' + CRITERIA_LABEL[c] });
        })));
        sel.appendChild(el('label', {}, [CRITERIA_LABEL[c], s]));
      });
    }
    $('scores').hidden = !on('person_scores');
    $('verdicts').hidden = !on('person_verdict');
    $('critic').hidden = !on('ai_critic');
  }

  function renderErrors() {
    var show = state.settings.showErrors;
    $('errors').hidden = !show;
    $('show-errors').checked = show;
    if (!show) return;
    var list = $('error-list'); list.textContent = '';
    var items = state.result.diagnostics.filter(function (d) { return d.severity === 'error' || !d.explained; });
    items.forEach(function (d) {
      list.appendChild(el('li', { class: 'stack' }, [
        el('span', { class: 'code', text: d.code + ' · ' + d.path }),
        el('span', { text: d.message }),
        el('span', { class: 'help', text: 'Fix: ' + d.fix })
      ]));
    });
    if (!items.length) list.appendChild(el('li', { text: 'No errors. ' + state.audit.explained + ' warnings are explained by open flags.' }));
  }

  function renderInspector() {
    var obj = state.selected ? objectByUuid(state.selected) : null;
    var form = $('insp-form'), empty = $('insp-empty');
    $('f-focus').hidden = !obj;
    empty.textContent = 'Tap a part in the view, or pick one from the Model list.';
    empty.hidden = !!obj && obj.type !== 'group';
    form.hidden = !obj || obj.type === 'group';
    if (!obj) return;
    if (obj.type === 'group') {
      empty.textContent = 'A group holds parts. Pick a part inside it to edit it. Flags on a group cover its parts.';
      return;
    }
    $('f-name').value = obj.name;
    $('f-pct').value = obj.certainty.percent;
    $('f-band').textContent = M.band(obj.certainty.percent);
    $('f-basis').value = obj.certainty.basis || 'inferred';
    $('f-note').value = obj.certainty.note || '';
    $('f-dx').value = obj.dimensions.x; $('f-dy').value = obj.dimensions.y; $('f-dz').value = obj.dimensions.z;
    $('f-pz').value = obj.position[2];
  }

  function renderNotes() {
    var about = state.selected ? objectByUuid(state.selected) : null;
    $('note-about').textContent = 'About: ' + (about ? about.name : 'the whole model');
    var list = $('note-list'); list.textContent = '';
    state.notes.slice().reverse().forEach(function (n) {
      var t = n.about === 'model' ? 'the whole model' : (objectByUuid(n.about) ? objectByUuid(n.about).name : n.about);
      list.appendChild(el('li', { class: 'stack' }, [
        el('span', { text: n.text }),
        el('span', { class: 'help', text: t + ' · ' + new Date(n.time).toLocaleString() })
      ]));
    });
    if (!state.notes.length) list.appendChild(el('li', { text: 'No notes yet.' }));
  }

  function renderReviewToggles() {
    var box = $('review-toggles'); box.textContent = '';
    REVIEW_ITEMS.forEach(function (r) {
      var cb = el('input', { type: 'checkbox', 'data-review': r.key, onchange: function () {
        state.settings.reviews[r.key] = cb.checked;
        saveSettings();
        renderAll();
      } });
      cb.checked = on(r.key);
      box.appendChild(el('label', { class: 'switch' }, [cb, el('span', { text: r.label + ' · ' + r.who })]));
    });
  }

  function renderAll() {
    renderHeader(); renderTree(); renderCert(); renderFlags(); renderStory(); renderLedger();
    renderErrors(); renderInspector(); renderNotes(); renderReviewToggles();
  }

  function saveSettings() { save(KEYS.settings, state.settings); }

  function select(uuid) {
    state.selected = uuid || null;
    if (state.viewer) state.viewer.select(state.selected);
    renderTree(); renderCert(); renderInspector(); renderNotes(); renderStory();
    $('insp-msg').textContent = '';
  }

  // ---------- edits ----------
  function num(v) { return v === '' || v === null || isNaN(Number(v)) ? NaN : Number(v); }

  function saveInspector(e) {
    e.preventDefault();
    var obj = objectByUuid(state.selected);
    if (!obj || obj.type === 'group') return;
    var set = {}, bad = [];
    var pct = num($('f-pct').value), dx = num($('f-dx').value), dy = num($('f-dy').value), dz = num($('f-dz').value), pz = num($('f-pz').value);
    if (obj.name !== $('f-name').value.trim()) set.name = $('f-name').value.trim();
    if (pct !== obj.certainty.percent) set['certainty.percent'] = pct;
    if ($('f-basis').value !== obj.certainty.basis) set['certainty.basis'] = $('f-basis').value;
    if ($('f-note').value !== (obj.certainty.note || '')) set['certainty.note'] = $('f-note').value;
    if (dx !== obj.dimensions.x) set['dimensions.x'] = dx;
    if (dy !== obj.dimensions.y) set['dimensions.y'] = dy;
    if (dz !== obj.dimensions.z) set['dimensions.z'] = dz;
    if (pz !== obj.position[2]) set.position = [obj.position[0], obj.position[1], pz];
    Object.keys(set).forEach(function (k) { if (typeof set[k] === 'number' && isNaN(set[k])) bad.push(k); });
    if (bad.length) { $('insp-msg').textContent = 'Enter a number for: ' + bad.join(', ') + '. Nothing was saved.'; return; }
    if (!Object.keys(set).length) { $('insp-msg').textContent = 'Nothing changed.'; return; }
    var r = commitOp({ op: 'modify', uuid: obj.uuid, set: set, note: 'edit in page' }, 'Saved.');
    $('insp-msg').textContent = r.ok ? 'Saved. The change is in the history and the checks ran again.' : 'Not saved: ' + r.errors.join(' ');
  }

  function deleteSelected() {
    var obj = objectByUuid(state.selected);
    if (!obj) return;
    var r = commitOp({ op: 'delete', uuid: obj.uuid, note: 'delete in page' }, 'Deleted.');
    if (r.ok) select(null);
    $('insp-msg').textContent = r.ok ? 'Deleted (it stays in the history).' : 'Not deleted: ' + r.errors.join(' ');
  }

  // Closing a consultation flag: with the note switch on, a note saying who reviewed, role and date, is required.
  function closeFlag(f) {
    var note = '';
    if (f.kind === 'consultation') {
      note = window.prompt('What was decided about this flag (optional):', '') || '';
    }
    var r = commitOp({ op: 'flag_close', id: f.id, note: note.trim() || 'closed in page' }, 'Closed.');
    if (!r.ok) $('round-msg').textContent = 'Not closed: ' + r.errors.join(' ');
  }

  function addFlag(e) {
    e.preventDefault();
    var text = $('flag-text').value.trim();
    if (!text) { $('flag-text').focus(); return; }
    var target = state.selected || rootUuid();
    var n = state.result.model.flags.length + 1, id;
    do { id = 'F' + n++; } while (state.result.model.flags.some(function (f) { return f.id === id; }));
    var r = commitOp({ op: 'flag', id: id, kind: $('flag-kind').value, target: target, text: text, note: 'flag in page' }, 'Flag added.');
    if (r.ok) $('flag-text').value = '';
    else $('round-msg').textContent = 'Flag not added: ' + r.errors.join(' ');
  }

  // ---------- rounds ----------
  function addDefect(e) {
    e.preventDefault();
    var res = RD.addDefect(state.run, { title: $('defect-title').value.trim(), criterion: $('defect-criterion').value, severity: $('defect-severity').value });
    if (!res.ok) { $('round-msg').textContent = res.errors.join('; '); return; }
    save(KEYS.rounds, state.run);
    $('defect-title').value = '';
    renderAll();
  }

  function tickedChanges() {
    var boxes = $('round-items').querySelectorAll('input[type=checkbox]');
    var changes = [];
    Array.prototype.forEach.call(boxes, function (b) {
      if (!b.checked) return;
      var text = $('round-items').querySelector('input[type=text][data-id="' + b.dataset.id + '"]').value.trim();
      changes.push({ ledger_id: b.dataset.id, text: text || 'changed (no note)' });
    });
    return changes;
  }

  function readScores() {
    var scores = {}, missing = [];
    $('score-selects').querySelectorAll('select').forEach(function (s) {
      if (s.value === '') missing.push(s.dataset.criterion); else scores[s.dataset.criterion] = Number(s.value);
    });
    return { scores: scores, missing: missing };
  }

  function finishRound(res, verdict, note) {
    save(KEYS.rounds, state.run);
    var last = state.run.rounds[state.run.rounds.length - 1];
    var msg = 'Round ' + last.round + ' recorded: ' + verdict + (last.kept ? ' (kept as the best).' : ' (reverted; the best stays).');
    if (note) msg += ' Reason: ' + note;
    if (res.stopped) msg += ' The run stopped: ' + res.reason + '.';
    renderAll();
    $('round-msg').textContent = msg;
  }

  function recordVerdict(verdict) {
    var round = { verdict: verdict, changes: tickedChanges() };
    if (on('person_scores')) {
      var got = readScores();
      if (got.missing.length) { $('round-msg').textContent = 'Score every criterion first (or turn round scores off in Reviews). Missing: ' + got.missing.join(', ') + '.'; return; }
      round.scores = got.scores;
    }
    var res = RD.recordRound(state.run, round);
    if (!res.ok) { $('round-msg').textContent = 'Round not recorded: ' + res.errors.join(' '); return; }
    finishRound(res, verdict, '');
  }

  function currentPacket() {
    return RD.buildPacket(state.run, { request: state.story.title });
  }

  function copyText(text, msgEl, box) {
    var done = function () { msgEl.textContent = 'Prompt copied. Paste it into your AI chat.'; };
    var fallback = function () { box.value = text; box.select && box.select(); msgEl.textContent = 'Copy is not allowed here. The prompt is in the box: select all and copy it.'; };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  function applyCriticReply() {
    var packet = currentPacket();
    var parsed = RV.parseCriticReply($('critic-reply').value, packet);
    if (!parsed.ok) { $('round-msg').textContent = 'Reply not applied: ' + parsed.errors.join(' '); return; }
    var round = { verdict: parsed.verdict, changes: tickedChanges(), scores: parsed.scores, note: parsed.reasons };
    var res = RD.recordRound(state.run, round);
    if (!res.ok) { $('round-msg').textContent = 'Round not recorded: ' + res.errors.join(' '); return; }
    $('critic-reply').value = '';
    finishRound(res, parsed.verdict + ' (AI critic)', parsed.reasons);
  }

  function downloadText(name, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadPacket() {
    if (!state.viewer) { $('round-msg').textContent = 'The 3-D view did not load, so there are no renders to pack.'; return; }
    var packet = currentPacket();
    packet.model_hash = state.result.model.history_hash;
    packet.model_name = state.result.model.name;
    state.viewer.snapshotViews(packet.views).forEach(function (s) {
      var a = el('a', { href: s.dataUrl, download: 'packet-round' + packet.round + '-' + s.view + '.png' });
      document.body.appendChild(a); a.click(); a.remove();
    });
    downloadText('packet-round' + packet.round + '.json', JSON.stringify(packet, null, 2) + '\n', 'application/json');
    $('round-msg').textContent = 'Packet for round ' + packet.round + ' downloaded: 4 views and a JSON file (no history, no notes).';
  }

  // ---------- AI fact-check of the story ----------
  function applyFactcheck() {
    var parsed = RV.parseFactcheckReply($('factcheck-reply').value, state.story);
    if (!parsed.ok) { $('factcheck-msg').textContent = 'Reply not applied: ' + parsed.errors.join(' '); return; }
    var map = {};
    parsed.claims.forEach(function (c) { map[c.id] = { status: c.status, note: c.note, time: new Date().toISOString() }; });
    state.factcheck = map;
    save(KEYS.factcheck, map);
    $('factcheck-reply').value = '';
    $('factcheck-msg').textContent = 'Applied: ' + parsed.claims.length + ' claims checked. Unclear and unsupported claims need a person to decide.';
    renderStory();
  }

  // ---------- settings, notes, database check ----------
  function setDbMessage() {
    var txt = storageOk
      ? 'This device only. Saved here: ' + state.history.operations.length + ' operations, ' + state.run.rounds.length + ' rounds, ' + state.notes.length + ' notes.'
      : 'This browser will not save. Changes last until the page is reloaded.';
    $('db-status').textContent = txt;
  }

  function saveNote(e) {
    e.preventDefault();
    var text = $('note-text').value.trim();
    if (!text) { $('note-text').focus(); return; }
    state.notes.push({ id: 'n' + Date.now(), text: text, about: state.selected || 'model', time: new Date().toISOString() });
    save(KEYS.notes, state.notes);
    $('note-text').value = '';
    renderNotes();
    setDbMessage();
  }

  function applyRoundCap() {
    var v = $('round-cap').value.trim();
    var n = parseInt(v, 10);
    if (v && n > 0) { state.settings.roundCap = n; state.run.settings.round_cap = n; }
    else { state.settings.roundCap = null; delete state.run.settings.round_cap; }
    saveSettings();
    save(KEYS.rounds, state.run);
    renderHeader();
  }

  function checkDevice() {
    var ok = false;
    try { localStorage.setItem('m3dxc.check', '1'); ok = localStorage.getItem('m3dxc.check') === '1'; localStorage.removeItem('m3dxc.check'); }
    catch (e) { ok = false; }
    storageOk = ok;
    setDbMessage();
    CLOUD.session().then(function (session) {
      if (!session) { $('db-status').textContent += ' Cloud: signed out.'; return; }
      return CLOUD.check().then(function (r) { $('db-status').textContent += ' Cloud: ' + r.text; });
    }).catch(function () { $('db-status').textContent += ' Cloud: not reachable.'; });
  }

  // ---------- panels and drawer ----------
  function setupPanels() {
    var stored = load(KEYS.panels, {});
    document.querySelectorAll('.panel[data-panel]').forEach(function (sec) {
      var id = sec.dataset.panel;
      var open = id in stored ? stored[id] : sec.dataset.open !== 'false';
      apply(open);
      sec.querySelector('.panelHead').addEventListener('click', function () {
        open = sec.dataset.collapsed === 'true';
        apply(open);
        stored[id] = open;
        save(KEYS.panels, stored);
      });
      function apply(isOpen) {
        sec.dataset.collapsed = String(!isOpen);
        sec.querySelector('.panelHead').setAttribute('aria-expanded', String(isOpen));
      }
    });
  }

  function setupDrawer() {
    var drawer = $('drawer'), gear = $('gear');
    function toggle(force) {
      var open = typeof force === 'boolean' ? force : drawer.hidden;
      drawer.hidden = !open;
      gear.setAttribute('aria-expanded', String(open));
    }
    gear.addEventListener('click', function () { toggle(); });
    $('drawer-close').addEventListener('click', function () { toggle(false); });
  }

  // ---------- boot ----------
  function start(givenHistory, sceneName) {
    state.story = BASE.story;
    state.history = givenHistory || initHistory();
    if (sceneName) state.sceneName = sceneName;
    state.run = load(KEYS.rounds, null) || RD.createRun({ subject: 'plains-camp-move' });
    if (!state.run.settings) state.run.settings = RD.createRun({}).settings;
    state.notes = load(KEYS.notes, []) || [];
    state.factcheck = load(KEYS.factcheck, {}) || {};
    var s = load(KEYS.settings, null);
    if (s) {
      state.settings.showErrors = !!s.showErrors;
      state.settings.roundCap = s.roundCap || null;
      if (s.reviews) Object.keys(state.settings.reviews).forEach(function (k) {
        if (typeof s.reviews[k] === 'boolean') state.settings.reviews[k] = s.reviews[k];
      });
    }
    recompute();

    $('subtitle').textContent = state.result.model.name + ' · ' + BASE.model.scale + ' · inches, Z up';
    setupPanels();
    setupDrawer();

    if (state.settings.roundCap) { state.run.settings.round_cap = state.settings.roundCap; $('round-cap').value = state.settings.roundCap; }
    $('show-errors').checked = state.settings.showErrors;
    $('show-errors').addEventListener('change', function () {
      state.settings.showErrors = $('show-errors').checked;
      saveSettings();
      renderErrors();
    });
    $('round-cap').addEventListener('change', applyRoundCap);
    $('sort-by').addEventListener('change', renderCert);
    $('sort-dir').addEventListener('change', renderCert);
    $('insp-form').addEventListener('submit', saveInspector);
    $('f-delete').addEventListener('click', deleteSelected);
    $('f-focus').addEventListener('click', function () {
      if (!state.viewer || !state.selected) return;
      // the selected part, or a group and every part inside it
      var ids = [state.selected], grew = true;
      while (grew) {
        grew = false;
        state.result.model.objects.forEach(function (o) {
          if (o.parent && ids.indexOf(o.parent) >= 0 && ids.indexOf(o.uuid) < 0) { ids.push(o.uuid); grew = true; }
        });
      }
      state.viewer.focus(ids);
    });
    $('flag-form').addEventListener('submit', addFlag);
    $('defect-form').addEventListener('submit', addDefect);
    document.querySelectorAll('button[data-verdict]').forEach(function (b) {
      b.addEventListener('click', function () { recordVerdict(b.dataset.verdict); });
    });
    $('packet').addEventListener('click', downloadPacket);
    $('critic-copy').addEventListener('click', function () {
      copyText(RV.buildCriticPrompt(currentPacket()), $('round-msg'), $('critic-reply'));
    });
    $('critic-apply').addEventListener('click', applyCriticReply);
    $('factcheck-copy').addEventListener('click', function () {
      copyText(RV.buildFactcheckPrompt(state.story), $('factcheck-msg'), $('factcheck-reply'));
    });
    $('factcheck-apply').addEventListener('click', applyFactcheck);
    $('note-form').addEventListener('submit', saveNote);
    $('db-check').addEventListener('click', checkDevice);
    $('save-library').addEventListener('click', function () { $('lib-msg').textContent = saveToLibrary(); });
    $('save-cloud').addEventListener('click', function () { saveToCloud().then(function (m) { $('lib-msg').textContent = m; }); });
    document.querySelectorAll('button[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { if (state.viewer) { state.viewer.setView(b.dataset.view); state.viewer.render(); } });
    });
    var MODE_NEXT = { material: 'provenance', provenance: 'plain', plain: 'material' };
    var MODE_LABEL = { material: 'Colour: material', provenance: 'Colour: certainty', plain: 'Colour: paper and ink' };
    $('mode').textContent = MODE_LABEL[state.mode];
    $('mode').addEventListener('click', function () {
      state.mode = MODE_NEXT[state.mode];
      $('mode').textContent = MODE_LABEL[state.mode];
      if (state.viewer) state.viewer.setMode(state.mode, state.result.model);
    });

    if (typeof THREE !== 'undefined') {
      state.viewer = VW.create($('view'));
      state.viewer.onSelect(select);
      state.viewer.start();
      state.viewer.setModel(state.result.model);
    } else {
      $('subtitle').textContent += ' · the 3-D engine did not load; the lists and checks still work.';
    }

    renderAll();
    setDbMessage();
    if (!storageOk) $('db-status').textContent = 'This browser will not save. Changes last until the page is reloaded.';
  }

  // Opened from the home page: ?src=local&id=... (the library), ?src=cloud&id=... (the cloud), or the sample.
  function bootstrap() {
    var q = new URLSearchParams(location.search);
    var src = q.get('src'), id = q.get('id');
    if (src === 'local' && id) {
      var saved = LIBRARY.get(id);
      if (saved && saved.history) return start(saved.history, saved.name);
      $('subtitle').textContent = 'That scene is not on this device. Showing the sample.';
      return start(null);
    }
    if (src === 'cloud' && id) {
      if (!CLOUD.available) { $('subtitle').textContent = CLOUD.reason; return start(null); }
      CLOUD.loadScene(id).then(function (bundle) {
        start(bundle && bundle.history ? bundle.history : null, id);
      }).catch(function (e) {
        $('subtitle').textContent = window.M3DXC.cloud.cloudFriendly(e) + ' Showing the sample.';
        start(null);
      });
      return;
    }
    start(null);
  }
  bootstrap();
})();
