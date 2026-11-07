/* What to Cook — pantry, use-soon cards, swipe, predicted index, capture, settings.
 * Device storage first (local storage, each read and write in try/catch). The database link comes later. */
(function () {
  'use strict';

  var VERSION = '0.6.0';
  var VERSIONS = [
    { v: '0.6.0', date: '2026-11-07', text: 'Recipe book (explore): 50 starter cards from what the family buys, with pantry matches, favourites, start, a use-soon filter, and a search for versions online. Linked from Settings → Pages.' },
    { v: '0.5.0', date: '2026-11-07', text: 'Notes log shows ✅ for notes marked done in the database (it reads their status when signed in). To-do panel in Settings with ✅ for what is built. Text stays readable on white panels in dark mode.' },
    { v: '0.4.0', date: '2026-11-07', text: 'Food list page (from Settings → Pages): each food with its place (fridge, pantry, freezer, other), kind, category, fridge days and notes. Saves to the family database; blanks allowed. Notes now saved to the database too.' },
    { v: '0.3.0', date: '2026-11-06', text: 'Family database wired: sign in with the family login, changes sync to the family pantry, same name, expiry and place overwrite on the server, database check in settings. The device keeps its own copy and works offline.' },
    { v: '0.2.0', date: '2026-11-06', text: 'Use-soon cards for food about to expire. Swipe left for ate or tossed, right to remain, tap for a favourite. Quantity tweak with Save and next. Predicted index for things eaten over time, with ate more / about right / ate less. Apple Voice Memo input. Same name, expiry and place overwrites; a new expiry makes a new line. Settings: pages, transcript archive, version log, notes log.' },
    { v: '0.1.0', date: '2026-11-06', text: 'Pantry with swipe check-ins, transcript capture with review, notes for improvement, opt-in errors.' }
  ];
  var TODO = [
    { done: true, text: 'Pantry saves to the family database.' },
    { done: true, text: 'Notes save to the family database; done notes show ✅ here.' },
    { done: true, text: 'Food list page (Settings → Pages): each food with its place, kind, category, fridge days and notes. Master list of fridge life.' },
    { done: true, text: 'Place tabs: Fridge, Freezer, Pantry, Other, with each food tagged by place.' },
    { done: false, text: 'Paste supabase/what_to_cook_MVP.sql into the Family database (Jimmy), then check the food list saves.' },
    { done: false, text: 'Auto-stamp fridge life when a pantry item goes in (uses the food list).' },
    { done: false, text: 'Kitchen button (not added: places cover it for now).' },
    { done: false, text: 'Food journal (convo v0.3): questions still open.' },
    { done: false, text: 'Recipe book, week plan and shopping list (MVP-2 to MVP-5).' }
  ];
  var PAGES = [
    { label: '🥫 Pantry', tab: 'pantry' },
    { label: '🧾 Food list (fridge days and places)', href: 'foods.html' },
    { label: '📖 Recipe book (explore)', href: 'recipes.html' },
    { label: '🎙️ Add from a memo or list', tab: 'capture' },
    { label: '📖 Recipe book', planned: 'after the pantry is wired to the database' },
    { label: '🥘 Food Lab (cuisines; name to confirm)', planned: 'convo v0.3' },
    { label: '📅 Week plan', planned: 'MVP-4' },
    { label: '🛒 Shopping list', planned: 'MVP-5' },
    { label: '🍽️ Food journal', planned: 'convo v0.3' }
  ];
  var KEY = {
    items: 'wtc.items', checks: 'wtc.checkins', transcripts: 'wtc.transcripts',
    members: 'wtc.members', notes: 'wtc.notes', errors: 'wtc.showErrors'
  };

  var $ = function (id) { return document.getElementById(id); };
  var draft = [];

  // ---- storage (try/catch: the page still works if storage is blocked) ----
  function read(key, fallback) { return WTCStore.read(key, fallback, reportError); }
  function write(key, value) { return WTCStore.write(key, value, reportError); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  var items = read(KEY.items, []);
  var checks = read(KEY.checks, []);
  var transcripts = read(KEY.transcripts, []);
  var members = read(KEY.members, ['Me']);
  var notes = read(KEY.notes, []);

  function persist() {
    write(KEY.items, items);
    write(KEY.checks, checks);
    write(KEY.transcripts, transcripts);
    queueSync();
  }
  // Rows saved before sync existed are not on the server yet.
  items.forEach(function (it) { if (it.synced === undefined) { it.synced = false; it.dirty = true; } });
  checks.forEach(function (c) { if (c.synced === undefined) c.synced = false; });
  transcripts.forEach(function (t) { if (t.synced === undefined) t.synced = false; });
  function touch(item) { item.updated_at = nowIso(); item.dirty = true; }

  // ---- errors: kept at the bottom, shown only when the user opts in ----
  var errorLog = WTCErrors.create(function (lines) {
    var panel = $('errorPanel');
    var show = WTCStore.read(KEY.errors, false) === true;
    panel.hidden = !(show && lines.length);
    panel.textContent = lines.join('\n');
  }, 20);
  function reportError(msg) { errorLog.report(msg); }
  function renderErrors() { errorLog.redraw(); }

  // ---- dates and numbers ----
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayIso() { return isoDay(today()); }
  function parseDay(s) { if (!s) return null; var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  function nowIso() { return new Date().toISOString(); }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function round1(n) { return Math.round(n * 10) / 10; }
  function round2(n) { return Math.round(n * 100) / 100; }
  function find(id) { return items.find(function (it) { return it.id === id; }); }
  function whoChecks() { return $('member').value || members[0]; }

  // ---- tabs ----
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === name); });
    document.querySelectorAll('.view').forEach(function (v) { v.hidden = v.id !== 'tab-' + name; });
  }
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () { showTab(btn.dataset.tab); });
  });

  // ---- members ----
  function renderMembers() {
    var sel = $('member'), keep = sel.value;
    sel.textContent = '';
    members.forEach(function (m) {
      var o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o);
    });
    if (members.indexOf(keep) !== -1) sel.value = keep;
    $('memberList').value = members.join('\n');
  }
  $('saveMembers').addEventListener('click', function () {
    var list = $('memberList').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    members = list.length ? list : ['Me'];
    write(KEY.members, members);
    renderMembers();
  });

  // ---- expiry and the predicted index ----
  function daysUntilExpiry(item) {
    var e = parseDay(item.expires_on);
    return e ? daysBetween(today(), e) : null;
  }
  function expiryState(item) {
    var d = daysUntilExpiry(item);
    if (d == null) return 'none';
    if (d < 0) return 'past';
    if (d <= 3) return 'soon';
    return 'ok';
  }
  // Predicted remaining = quantity at the last count, minus the daily rate times the days since.
  function predict(item) {
    if (item.quantity == null || !item.daily_rate || !item.counted_on) return null;
    var days = Math.max(0, daysBetween(parseDay(item.counted_on), today()));
    var left = Math.max(0, item.quantity - item.daily_rate * days);
    var pct = item.quantity > 0 ? Math.round(100 * left / item.quantity) : 0;
    return { left: round1(left), pct: pct, days: days };
  }
  function inCleanup(item) {
    if (item.status !== 'in_stock') return false;
    if (item.reviewed_on === todayIso()) return false;
    var s = expiryState(item);
    return s === 'soon' || s === 'past';
  }
  function byExpiry(a, b) {
    var da = daysUntilExpiry(a), db = daysUntilExpiry(b);
    return (da == null ? 1e9 : da) - (db == null ? 1e9 : db);
  }
  function cleanupItems() { return items.filter(inCleanup).sort(byExpiry); }
  function stockItems() {
    var place = $('placeFilter').value;
    return items
      .filter(function (it) { return it.status === 'in_stock' && !inCleanup(it) && (!place || it.stored_location === place); })
      .sort(function (a, b) { return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.name.localeCompare(b.name); });
  }
  function describe(item) {
    var bits = [];
    if (item.quantity != null) bits.push(round1(item.quantity) + (item.unit ? ' ' + item.unit : ''));
    if (item.stored_location) bits.push(item.stored_location);
    var p = predict(item);
    if (p) bits.push('about ' + p.left + ' left (' + p.pct + '%, a guess)');
    var d = daysUntilExpiry(item);
    if (d != null) bits.push(d < 0 ? 'past its date' : d === 0 ? 'use today' : 'use by ' + item.expires_on);
    return bits.join(' · ');
  }

  // ---- rendering ----
  function renderAll(openId) {
    renderCleanup();
    renderStock();
    if (openId) openCard(openId);
  }

  function renderCleanup() {
    var list = cleanupItems();
    var ul = $('cleanup');
    ul.textContent = '';
    list.forEach(function (it) { ul.appendChild(card(it, true)); });
    $('cleanCount').textContent = String(list.length);
    $('cleanEmpty').hidden = list.length > 0;
    $('cleanupPanel').dataset.collapsed = list.length ? 'false' : 'true';
    $('cleanupPanel').querySelector('.mark').textContent = list.length ? '▾' : '▸';
  }

  function renderStock() {
    var ul = $('stock');
    ul.textContent = '';
    var shown = stockItems();
    shown.forEach(function (it) { ul.appendChild(card(it, false)); });
    $('stockEmpty').hidden = shown.length > 0;
  }

  function card(it, cleanup) {
    var li = document.createElement('li');
    li.className = 'card' + (cleanup ? ' clean' : '') + (it.fav ? ' fav' : '');
    li.dataset.id = it.id;
    li.innerHTML =
      '<span class="hintSwipe l">Ate / tossed ←</span>' +
      '<span class="hintSwipe r">→ Remain</span>' +
      '<div class="head"><span class="star"></span><span class="name"></span></div>' +
      '<div class="meta"></div>' +
      '<div class="choice" hidden>' +
        '<button type="button" class="tiny" data-act="ate">✅ Ate it</button>' +
        '<button type="button" class="tiny warm" data-act="tossed">🗑️ Tossed</button>' +
        '<button type="button" class="tiny" data-act="back">Back</button>' +
      '</div>' +
      '<div class="acts"></div>' +
      '<details><summary>Details and quantity</summary><div class="form"></div></details>';
    li.querySelector('.star').textContent = it.fav ? '⭐' : '☆';
    li.querySelector('.name').textContent = it.name;
    li.querySelector('.meta').textContent = describe(it) || 'no details yet';

    var acts = li.querySelector('.acts');
    if (it.daily_rate && it.quantity != null) {
      [['ate_more', 'Ate more'], ['ate_about_right', 'About right'], ['ate_less', 'Ate less']].forEach(function (pair) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tiny'; b.dataset.fb = pair[0]; b.textContent = pair[1];
        acts.appendChild(b);
      });
    } else {
      var hint = document.createElement('span');
      hint.className = 'hint';
      hint.textContent = 'Set "Eats per day" in Details for a guess.';
      acts.appendChild(hint);
    }

    var f = li.querySelector('.form');
    f.innerHTML =
      '<div class="pair">' +
        '<label>Quantity<input type="number" step="any" inputmode="decimal" class="fq"></label>' +
        '<label>Unit<input type="text" class="fu" list="units" autocomplete="off"></label>' +
      '</div>' +
      '<div class="pair">' +
        '<label>Eats per day<input type="number" step="any" inputmode="decimal" class="fr" placeholder="e.g. 5"></label>' +
        '<label>Expiry date<input type="date" class="fe"></label>' +
      '</div>' +
      '<label>Place<select class="fp"><option value="fridge">Fridge</option><option value="pantry">Pantry</option><option value="freezer">Freezer</option><option value="other">Other</option></select></label>' +
      '<label>Notes<textarea class="fn" rows="2"></textarea></label>' +
      '<div class="row wrap">' +
        '<button type="button" class="primary" data-save="stay">Save</button>' +
        (cleanup ? '<button type="button" class="primary" data-save="next">Save and next ▸</button>' : '') +
      '</div>';
    f.querySelector('.fq').value = it.quantity == null ? '' : String(it.quantity);
    f.querySelector('.fu').value = it.unit || '';
    f.querySelector('.fr').value = it.daily_rate == null ? '' : String(it.daily_rate);
    f.querySelector('.fe').value = it.expires_on || '';
    f.querySelector('.fp').value = ['fridge', 'pantry', 'freezer', 'other'].indexOf(it.stored_location) !== -1 ? it.stored_location : 'other';
    f.querySelector('.fn').value = it.notes || '';

    attachSwipe(li, it.id);
    return li;
  }

  function openCard(id) {
    var el = document.querySelector('.card[data-id="' + id + '"]');
    if (!el) return;
    el.querySelector('details').open = true;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    var fq = el.querySelector('.fq');
    if (fq) fq.focus();
  }

  // ---- actions ----
  function checkIn(itemId, action) {
    var item = find(itemId);
    if (!item) { reportError('Item not found: ' + itemId); return; }
    checks.push({ id: uid('c'), item_id: itemId, action: action, member: whoChecks(), at: nowIso(), synced: false });
    if (action === 'ate') item.status = 'eaten';
    if (action === 'tossed') item.status = 'tossed';
    if (action === 'kept') item.reviewed_on = todayIso();
    touch(item);
    persist();
    renderAll();
  }

  function toggleFav(itemId) {
    var item = find(itemId);
    if (!item) return;
    item.fav = !item.fav;
    touch(item);
    persist();
    renderAll();
  }

  // Feedback on the predicted index: the guess becomes the new count, and the rate moves.
  function feedback(itemId, kind) {
    var item = find(itemId);
    if (!item) return;
    if (item.quantity == null || !item.daily_rate) { reportError('Enter a quantity and "Eats per day" in Details first.'); return; }
    var p = predict(item);
    if (p) { item.quantity = p.left; item.counted_on = todayIso(); }
    if (kind === 'ate_more') item.daily_rate = round2(item.daily_rate * 1.25);
    if (kind === 'ate_less') item.daily_rate = round2(item.daily_rate * 0.8);
    checks.push({ id: uid('c'), item_id: itemId, action: kind, member: whoChecks(), at: nowIso(), synced: false });
    touch(item);
    persist();
    renderAll(itemId);
  }

  function saveForm(li, item, goNext) {
    var nextId = null;
    if (goNext) {
      var list = cleanupItems().map(function (it) { return it.id; });
      var idx = list.indexOf(item.id);
      nextId = idx >= 0 ? list[idx + 1] || null : null;
    }
    var f = li.querySelector('.form');
    var q = parseFloat(f.querySelector('.fq').value);
    var newQ = isNaN(q) ? null : q;
    if (newQ !== item.quantity) { item.quantity = newQ; item.counted_on = todayIso(); }
    item.unit = f.querySelector('.fu').value.trim();
    var r = parseFloat(f.querySelector('.fr').value);
    item.daily_rate = isNaN(r) || r < 0 ? null : r;
    if (item.daily_rate != null && !item.counted_on) item.counted_on = todayIso();
    item.expires_on = f.querySelector('.fe').value || null;
    item.stored_location = f.querySelector('.fp').value;
    item.notes = f.querySelector('.fn').value.trim();
    touch(item);
    persist();
    renderAll(goNext ? nextId : item.id);
    if (goNext && !nextId) {
      $('cleanHint').hidden = false;
      $('cleanHint').textContent = 'That was the last one in Use soon. ✅';
    }
  }

  // ---- swipe: left = ate or tossed (choose), right = remain, tap = favourite ----
  function attachSwipe(li, itemId) {
    var startX = null, dx = 0, pid = null;
    li.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button, input, select, textarea, summary, details, label')) return;
      startX = e.clientX; dx = 0; pid = e.pointerId;
      try { li.setPointerCapture(pid); } catch (err) { /* older browsers: swipe still works without capture */ }
    });
    li.addEventListener('pointermove', function (e) {
      if (startX == null || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      li.style.transform = 'translateX(' + Math.max(-120, Math.min(120, dx)) + 'px)';
      li.querySelector('.hintSwipe.l').style.opacity = dx < -40 ? 1 : 0;
      li.querySelector('.hintSwipe.r').style.opacity = dx > 40 ? 1 : 0;
    });
    function finish(e, cancelled) {
      if (startX == null || e.pointerId !== pid) return;
      var moved = dx;
      startX = null; pid = null;
      li.style.transform = '';
      li.querySelector('.hintSwipe.l').style.opacity = 0;
      li.querySelector('.hintSwipe.r').style.opacity = 0;
      if (cancelled) return;
      if (Math.abs(moved) < 10) toggleFav(itemId);
      else if (moved < -80) li.querySelector('.choice').hidden = false;
      else if (moved > 80) checkIn(itemId, 'kept');
    }
    li.addEventListener('pointerup', function (e) { finish(e, false); });
    li.addEventListener('pointercancel', function (e) { finish(e, true); });
  }

  // One listener for every card button, so new cards need no wiring.
  document.addEventListener('click', function (e) {
    var t = e.target;
    var el = t.closest ? t.closest('.card') : null;
    if (!el) return;
    if (t.dataset && t.dataset.act) {
      if (t.dataset.act === 'back') { el.querySelector('.choice').hidden = true; return; }
      checkIn(el.dataset.id, t.dataset.act);
      return;
    }
    if (t.dataset && t.dataset.fb) { feedback(el.dataset.id, t.dataset.fb); return; }
    if (t.dataset && t.dataset.save) {
      var item = find(el.dataset.id);
      if (item) saveForm(el, item, t.dataset.save === 'next');
    }
  });

  $('placeFilter').addEventListener('change', function () { renderAll(); });

  // ---- capture: sort a transcript into draft items, then save with duplicate rules ----
  function findDuplicate(name, expiresOn, place) {
    return items.find(function (it) {
      return it.status === 'in_stock' && norm(it.name) === norm(name) &&
        (it.expires_on || null) === (expiresOn || null) && it.stored_location === place;
    }) || null;
  }

  $('parse').addEventListener('click', function () {
    var source = $('source').value;
    var parsed = window.WTCParse.parseTranscript($('transcript').value);
    draft = parsed.map(function (d) {
      return Object.assign({ keep: true, expires_on: null, source: source }, d);
    });
    if (!draft.length) { reportError('Nothing to sort. Paste or type something first.'); $('review').hidden = true; return; }
    renderDraft();
    $('review').hidden = false;
  });

  function renderDraft() {
    var list = $('draft');
    list.textContent = '';
    draft.forEach(function (d, idx) {
      var li = document.createElement('li');
      li.className = 'card';
      li.innerHTML =
        '<div class="draft-row">' +
          '<label class="check"><input type="checkbox" class="keep"> keep</label>' +
          '<input type="text" class="dname" aria-label="Name">' +
          '<input type="number" step="any" inputmode="decimal" class="dqty" aria-label="Quantity">' +
          '<select class="dunit" aria-label="Unit"></select>' +
          '<select class="dkind" aria-label="Kind"><option>dry</option><option>wet</option><option>tool</option><option>space</option></select>' +
          '<select class="dplace" aria-label="Place"><option>fridge</option><option>pantry</option><option>freezer</option><option>other</option></select>' +
          '<input type="date" class="dexp" aria-label="Expiry date">' +
        '</div><div class="meta"></div>';
      li.querySelector('.keep').checked = d.keep;
      li.querySelector('.dname').value = d.name;
      li.querySelector('.dqty').value = d.quantity == null ? '' : String(d.quantity);
      var unit = li.querySelector('.dunit');
      ['', 'g', 'kg', 'ml', 'l', 'cup', 'tin', 'bag', 'box', 'pack', 'bottle', 'loaf', 'bunch', 'clove', 'slice', 'pot', 'tub', 'each'].forEach(function (u) {
        var o = document.createElement('option'); o.value = u; o.textContent = u || '(no unit)'; unit.appendChild(o);
      });
      unit.value = d.unit || '';
      li.querySelector('.dkind').value = d.kind;
      li.querySelector('.dplace').value = d.stored_location;
      li.querySelector('.dexp').value = d.expires_on || '';
      var dup = findDuplicate(d.name, d.expires_on, d.stored_location);
      li.querySelector('.meta').textContent = 'from: "' + d.raw + '" · ' +
        (dup ? 'already in the pantry, will update that line' : 'new line');

      li.querySelector('.keep').addEventListener('change', function (e) { draft[idx].keep = e.target.checked; });
      li.querySelector('.dname').addEventListener('input', function (e) { draft[idx].name = e.target.value; });
      li.querySelector('.dqty').addEventListener('input', function (e) {
        var n = parseFloat(e.target.value); draft[idx].quantity = isNaN(n) ? null : n;
      });
      unit.addEventListener('change', function (e) { draft[idx].unit = e.target.value; });
      li.querySelector('.dkind').addEventListener('change', function (e) { draft[idx].kind = e.target.value; });
      li.querySelector('.dplace').addEventListener('change', function (e) { draft[idx].stored_location = e.target.value; });
      li.querySelector('.dexp').addEventListener('change', function (e) { draft[idx].expires_on = e.target.value || null; });
      list.appendChild(li);
    });
  }

  $('save').addEventListener('click', function () {
    var keep = draft.filter(function (d) { return d.keep && d.name; });
    if (!keep.length) { reportError('Nothing ticked to save.'); return; }
    var now = nowIso(), day = todayIso(), added = 0, updated = 0;
    keep.forEach(function (d) {
      var dup = findDuplicate(d.name, d.expires_on, d.stored_location);
      if (dup) {
        if (d.quantity != null) dup.quantity = d.quantity;
        if (d.unit) dup.unit = d.unit;
        dup.kind = d.kind;
        dup.category = d.category || dup.category;
        dup.counted_on = day;
        dup.raw_text = d.raw;
        dup.source = d.source;
        touch(dup);
        updated++;
      } else {
        items.push({
          id: uid('i'), name: d.name, kind: d.kind, category: d.category || '', subcategory: '',
          quality: d.quality || 'unknown', quantity: d.quantity, unit: d.unit || '', servings_left: null,
          expires_on: d.expires_on || null, freshness: 'unknown', stored_location: d.stored_location || 'pantry',
          purchase_cost: null, notes: d.notes || '', status: 'in_stock', source: d.source,
          raw_text: d.raw, purchased_on: day, counted_on: day, daily_rate: null,
          fav: false, reviewed_on: null, created_at: now, updated_at: now, dirty: true, synced: false
        });
        added++;
      }
    });
    // The raw transcript is archived in full, whatever was saved.
    transcripts.push({
      id: uid('t'), text: $('transcript').value, method: $('source').value,
      parsed_count: keep.length, added: added, updated: updated, at: now, synced: false
    });
    persist();
    draft = [];
    $('transcript').value = '';
    $('review').hidden = true;
    renderDraft();
    renderArchive();
    $('saveNote').hidden = false;
    $('saveNote').textContent = 'Saved: ' + added + ' new, ' + updated + ' updated. The transcript is in the archive.';
    showTab('pantry');
    renderAll();
  });

  // Speech in, where the browser supports it. Typing always works.
  $('listen').addEventListener('click', function () {
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    var note = $('listenNote');
    if (!Rec) {
      note.hidden = false;
      note.textContent = 'Speech is not available in this browser. Type, or use the keyboard microphone.';
      return;
    }
    try {
      var rec = new Rec();
      rec.lang = 'en-GB'; rec.interimResults = false; rec.maxAlternatives = 1;
      note.hidden = false; note.textContent = 'Listening… say the list, then pause.';
      rec.onresult = function (ev) {
        var said = ev.results[0][0].transcript;
        $('transcript').value = ($('transcript').value ? $('transcript').value + '\n' : '') + said;
        note.textContent = 'Heard it. Check the words, then sort.';
      };
      rec.onerror = function (ev) {
        note.textContent = 'Speech stopped: ' + ev.error + '. Type instead.';
        reportError('Speech: ' + ev.error);
      };
      rec.start();
    } catch (e) { reportError('Speech could not start: ' + e.message); }
  });

  // ---- settings drawer ----
  $('gear').addEventListener('click', function () {
    var open = $('drawer').hidden;
    $('drawer').hidden = !open;
    $('gear').setAttribute('aria-expanded', String(open));
  });
  $('closeDrawer').addEventListener('click', function () {
    $('drawer').hidden = true;
    $('gear').setAttribute('aria-expanded', 'false');
  });
  // Panels marked data-open="false" start closed; their header stays visible.
  document.querySelectorAll('.panel').forEach(function (sec) {
    var closed = sec.dataset.open === 'false';
    sec.dataset.collapsed = String(closed);
    var head = sec.querySelector('.panelHead');
    head.setAttribute('aria-expanded', String(!closed));
    head.querySelector('.mark').textContent = closed ? '▸' : '▾';
  });
  document.querySelectorAll('.panelHead').forEach(function (head) {
    head.addEventListener('click', function () {
      var sec = head.parentElement;
      var collapsed = sec.dataset.collapsed !== 'true';
      sec.dataset.collapsed = String(collapsed);
      head.setAttribute('aria-expanded', String(!collapsed));
      head.querySelector('.mark').textContent = collapsed ? '▸' : '▾';
    });
  });

  function renderPages() {
    var ul = $('pageLinks');
    ul.textContent = '';
    PAGES.forEach(function (p) {
      var li = document.createElement('li');
      if (p.href) {
        var a = document.createElement('a');
        a.className = 'tiny'; a.href = p.href; a.textContent = p.label;
        li.appendChild(a);
      } else if (p.tab) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tiny'; b.textContent = p.label;
        b.addEventListener('click', function () { showTab(p.tab); $('drawer').hidden = true; });
        li.appendChild(b);
      } else {
        li.textContent = p.label + ' · planned (' + p.planned + ')';
      }
      ul.appendChild(li);
    });
  }

  function renderArchive() {
    var ul = $('archiveList');
    ul.textContent = '';
    if (!transcripts.length) {
      var empty = document.createElement('li'); empty.textContent = 'No transcripts yet.'; ul.appendChild(empty);
      return;
    }
    transcripts.slice().reverse().forEach(function (t) {
      var li = document.createElement('li');
      var d = document.createElement('details');
      var s = document.createElement('summary');
      s.textContent = new Date(t.at).toLocaleString() + ' · ' + (t.method === 'apple_memo' ? 'Apple Voice Memo' : t.method) +
        ' · ' + (t.added || 0) + ' new, ' + (t.updated || 0) + ' updated';
      var pre = document.createElement('pre');
      pre.textContent = t.text;
      d.appendChild(s); d.appendChild(pre);
      li.appendChild(d);
      ul.appendChild(li);
    });
  }

  function renderVersions() {
    var ul = $('versionList');
    ul.textContent = '';
    VERSIONS.forEach(function (v) {
      var li = document.createElement('li');
      li.textContent = 'v' + v.v + ' · ' + v.date + '\n' + v.text;
      ul.appendChild(li);
    });
  }

  function renderNotes() {
    var ul = $('noteList');
    ul.textContent = '';
    notes.slice().reverse().forEach(function (n) {
      var li = document.createElement('li');
      li.textContent = (n.status === 'done' ? '✅ ' : '') + new Date(n.at).toLocaleString() + ' · ' + n.where + ' · v' + n.version + '\n' + n.text;
      ul.appendChild(li);
    });
  }
  $('noteSave').addEventListener('click', function () {
    var text = $('noteText').value.trim();
    if (!text) return;
    var current = document.querySelector('.tab.on');
    var where = current ? current.dataset.tab : 'page';
    notes.push({ id: uid('n'), at: nowIso(), status: 'open', text: text, where: where, version: VERSION, synced: false });
    write(KEY.notes, notes);
    $('noteText').value = '';
    renderNotes();
    if (DB.session()) pushAll();   // sends it to wtc_notes; if that fails it stays on this device and is retried
  });

  $('showErrors').checked = read(KEY.errors, false) === true;
  $('showErrors').addEventListener('change', function (e) { write(KEY.errors, e.target.checked); renderErrors(); });

  // ---- family database (optional: the page keeps working on this device without it) ----
  var DB = window.WTCDb;
  // The sync engine (js/sync.js) gets the state it needs; items are replaced only by its pull.
  var sync = WTCSync.create({
    DB: DB, KEY: KEY,
    checks: checks, transcripts: transcripts, notes: notes,
    getItems: function () { return items; },
    setItems: function (v) { items = v; },
    find: find, write: write, reportError: reportError, renderAll: renderAll, renderNotes: renderNotes
  });
  var isUuid = WTCUtil.isUuid, newUuid = WTCUtil.newUuid;
  var toRow = sync.toRow, fromRow = sync.fromRow, unsentCount = sync.unsentCount, setStatusPill = sync.setStatusPill;
  var pull = sync.pull, pullNotes = sync.pullNotes, pushAll = sync.pushAll, queueSync = sync.queueSync;


  function renderTodo() {
    var ul = $('todoList');
    ul.textContent = '';
    TODO.forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = (t.done ? '✅ ' : '⬜ ') + t.text;
      ul.appendChild(li);
    });
  }

  // Notes: the database's status and text win, so a note marked done shows its tick here.
  // Rows from other devices are added to this list.

  // Server rows win, except items this device changed and has not sent yet.





  // Sign-in and the database check (settings panel).
  $('signIn').addEventListener('click', function () {
    var email = $('dbEmail').value.trim(), password = $('dbPassword').value;
    if (!email || !password) { $('dbStatus').textContent = 'Enter the family email and password.'; return; }
    $('dbStatus').textContent = 'Signing in…';
    DB.signIn(email, password).then(function () {
      $('dbPassword').value = '';
      $('dbStatus').textContent = 'Signed in. Syncing…';
      return pull().then(pullNotes).then(pushAll);
    }).then(function () {
      $('dbStatus').textContent = 'Signed in.';
      setStatusPill();
    }, function (e) {
      $('dbStatus').textContent = 'Sign-in failed. ' + DB.explain(e);
      reportError('Sign-in: ' + DB.explain(e));
    });
  });
  $('signOut').addEventListener('click', function () {
    DB.signOut();
    $('dbStatus').textContent = 'Signed out. This device keeps its own copy.';
    setStatusPill();
  });
  $('dbCheck').addEventListener('click', function () {
    var out = $('dbResult');
    if (!DB.session()) { out.textContent = 'Not signed in. Sign in first; until then this device keeps its own copy.'; return; }
    out.textContent = 'Checking…';
    Promise.all(window.WTC_CONFIG.tables.map(function (t) {
      return DB.count(t).then(function (n) { return t + ': ok, ' + n + ' rows'; },
        function (e) { return t + ': ' + DB.explain(e); });
    })).then(function (lines) { out.textContent = lines.join('\n'); });
  });

  // ---- start ----
  window.addEventListener('error', function (e) { reportError('Page error: ' + e.message); });
  window.addEventListener('unhandledrejection', function (e) {
    var msg = e.reason && e.reason.message ? e.reason.message : String(e.reason);
    reportError('Unexpected: ' + msg.slice(0, 160));
  });
  renderMembers();
  renderPages();
  renderVersions();
  renderArchive();
  renderNotes();
  renderTodo();
  renderAll();
  renderErrors();
  setStatusPill();
  if (DB.session()) {
    pull().then(pullNotes).then(pushAll, function (e) {
      setStatusPill('offline, this device');
      reportError(DB.explain(e));
    });
  }
})();
