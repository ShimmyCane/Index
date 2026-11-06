/* What to Cook — pantry, capture, swipe check-ins, settings. Device storage first (no database yet). */
(function () {
  'use strict';
  var KEY = { items: 'wtc.items', checks: 'wtc.checkins', transcripts: 'wtc.transcripts', members: 'wtc.members', notes: 'wtc.notes', errors: 'wtc.showErrors' };
  var VERSION = '0.1.0';
  var $ = function (id) { return document.getElementById(id); };
  var draft = [];
  var problems = [];

  // ---- storage (try/catch: the page works if storage is blocked) ----
  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { reportError('Could not read ' + key + ': ' + e.message); return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { reportError('Could not save (storage full or blocked): ' + e.message); return false; }
  }
  function id(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  var items = read(KEY.items, []);
  var checks = read(KEY.checks, []);
  var transcripts = read(KEY.transcripts, []);
  var members = read(KEY.members, ['Me']);
  var notes = read(KEY.notes, []);

  // ---- errors: stored at the bottom, shown only when the user opts in ----
  function reportError(msg) {
    problems.push(new Date().toLocaleTimeString() + ' ' + msg);
    if (problems.length > 20) problems.shift();
    renderErrors();
  }
  function renderErrors() {
    var panel = $('errorPanel');
    var show = read(KEY.errors, false) === true;
    panel.hidden = !(show && problems.length);
    panel.textContent = problems.join('\n');
  }

  // ---- tabs ----
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b === btn); });
      document.querySelectorAll('.view').forEach(function (v) { v.hidden = v.id !== 'tab-' + btn.dataset.tab; });
    });
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

  // ---- pantry ----
  function daysLeft(item) {
    if (!item.expires_on) return null;
    return Math.round((new Date(item.expires_on) - new Date(new Date().toDateString())) / 86400000);
  }
  function describe(item) {
    var bits = [];
    if (item.quantity != null) bits.push(item.quantity + (item.unit ? ' ' + item.unit : ''));
    if (item.stored_location) bits.push(item.stored_location);
    if (item.quality && item.quality !== 'unknown') bits.push(item.quality);
    var d = daysLeft(item);
    if (d != null) bits.push(d < 0 ? 'past date' : d === 0 ? 'use today' : 'use by ' + item.expires_on);
    return bits.join(' · ');
  }
  function renderStock() {
    var place = $('placeFilter').value;
    var list = $('stock');
    list.textContent = '';
    var shown = items.filter(function (it) {
      return it.status === 'in_stock' && (!place || it.stored_location === place);
    });
    $('stockEmpty').hidden = shown.length > 0;
    shown.forEach(function (it) { list.appendChild(stockCard(it)); });
  }
  function stockCard(it) {
    var li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = it.id;
    var hl = document.createElement('span'); hl.className = 'hintSwipe l'; hl.textContent = 'Toss ←';
    var hr = document.createElement('span'); hr.className = 'hintSwipe r'; hr.textContent = '→ Ate';
    var name = document.createElement('div'); name.className = 'name'; name.textContent = it.name;
    var meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = describe(it) || 'no details';
    var acts = document.createElement('div'); acts.className = 'acts';
    [['ate', '✅ Ate'], ['kept', 'Keep'], ['tossed', '🗑️ Toss']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tiny'; b.textContent = pair[1];
      b.addEventListener('click', function () { checkIn(it.id, pair[0]); });
      acts.appendChild(b);
    });
    li.appendChild(hl); li.appendChild(hr); li.appendChild(name); li.appendChild(meta); li.appendChild(acts);
    attachSwipe(li, it.id);
    return li;
  }

  // Swipe: drag a card left (toss) or right (ate). Buttons do the same thing for accessibility.
  function attachSwipe(li, itemId) {
    var startX = null, dx = 0, pid = null;
    li.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      startX = e.clientX; dx = 0; pid = e.pointerId;
      li.setPointerCapture(pid);
    });
    li.addEventListener('pointermove', function (e) {
      if (startX == null || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      li.style.transform = 'translateX(' + Math.max(-120, Math.min(120, dx)) + 'px)';
      li.querySelector('.hintSwipe.l').style.opacity = dx < -40 ? 1 : 0;
      li.querySelector('.hintSwipe.r').style.opacity = dx > 40 ? 1 : 0;
    });
    function end(e) {
      if (startX == null || e.pointerId !== pid) return;
      var moved = dx;
      startX = null; pid = null;
      li.style.transform = '';
      if (moved > 90) checkIn(itemId, 'ate');
      else if (moved < -90) checkIn(itemId, 'tossed');
      else renderStock();
    }
    li.addEventListener('pointerup', end);
    li.addEventListener('pointercancel', function () { startX = null; li.style.transform = ''; renderStock(); });
  }

  function checkIn(itemId, action) {
    var item = items.find(function (it) { return it.id === itemId; });
    if (!item) { reportError('Item not found: ' + itemId); renderStock(); return; }
    var who = $('member').value || members[0];
    checks.push({ id: id('c'), item_id: itemId, action: action, member: who, at: new Date().toISOString() });
    if (action === 'ate') item.status = 'eaten';
    if (action === 'tossed') item.status = 'tossed';
    item.updated_at = new Date().toISOString();
    write(KEY.items, items); write(KEY.checks, checks);
    renderStock();
  }
  $('placeFilter').addEventListener('change', renderStock);

  // ---- capture ----
  $('parse').addEventListener('click', function () {
    var text = $('transcript').value;
    var parsed = window.WTCParse.parseTranscript(text);
    draft = parsed.map(function (d) { return Object.assign({ keep: true }, d); });
    renderDraft();
    $('review').hidden = draft.length === 0;
    if (!draft.length) reportError('Nothing to sort. Type or say something first.');
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
        '<input type="text" class="dqty" inputmode="decimal" aria-label="Quantity">' +
        '<select class="dunit" aria-label="Unit"></select>' +
        '<select class="dkind" aria-label="Kind"><option>dry</option><option>wet</option><option>tool</option><option>space</option></select>' +
        '<select class="dplace" aria-label="Place"><option>fridge</option><option>pantry</option><option>freezer</option><option>other</option></select>' +
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
      li.querySelector('.meta').textContent = 'from: "' + d.raw + '"' + (d.category ? ' · ' + d.category : '');
      li.querySelector('.keep').addEventListener('change', function (e) { draft[idx].keep = e.target.checked; });
      li.querySelector('.dname').addEventListener('input', function (e) { draft[idx].name = e.target.value; });
      li.querySelector('.dqty').addEventListener('input', function (e) {
        var n = parseFloat(e.target.value); draft[idx].quantity = isNaN(n) ? null : n;
      });
      unit.addEventListener('change', function (e) { draft[idx].unit = e.target.value; });
      li.querySelector('.dkind').addEventListener('change', function (e) { draft[idx].kind = e.target.value; });
      li.querySelector('.dplace').addEventListener('change', function (e) { draft[idx].stored_location = e.target.value; });
      list.appendChild(li);
    });
  }

  $('save').addEventListener('click', function () {
    var keep = draft.filter(function (d) { return d.keep && d.name; });
    if (!keep.length) { reportError('Nothing ticked to save.'); return; }
    var now = new Date().toISOString();
    keep.forEach(function (d) {
      items.push({
        id: id('i'), name: d.name, kind: d.kind, category: d.category || '', subcategory: '',
        quality: d.quality || 'unknown', quantity: d.quantity, unit: d.unit || '', servings_left: null,
        expires_on: null, freshness: 'unknown', stored_location: d.stored_location || 'pantry',
        purchase_cost: null, notes: d.notes || '', status: 'in_stock', source: 'transcript',
        raw_text: d.raw, created_at: now, updated_at: now
      });
    });
    transcripts.push({ id: id('t'), text: $('transcript').value, method: 'transcript', parsed_count: keep.length, at: now });
    if (write(KEY.items, items) && write(KEY.transcripts, transcripts)) {
      draft = []; $('transcript').value = ''; $('review').hidden = true; renderDraft();
      renderStock();
      document.querySelector('.tab[data-tab="pantry"]').click();
    }
  });

  // Speech in, where the browser supports it. Typing always works.
  $('listen').addEventListener('click', function () {
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    var note = $('listenNote');
    if (!Rec) { note.hidden = false; note.textContent = 'Speech is not available in this browser. Type or use the keyboard microphone.'; return; }
    try {
      var rec = new Rec(); rec.lang = 'en-GB'; rec.interimResults = false; rec.maxAlternatives = 1;
      note.hidden = false; note.textContent = 'Listening… say the list, then pause.';
      rec.onresult = function (ev) {
        var said = ev.results[0][0].transcript;
        $('transcript').value = ($('transcript').value ? $('transcript').value + '\n' : '') + said;
        note.textContent = 'Heard it. Check the words, then sort.';
      };
      rec.onerror = function (ev) { note.textContent = 'Speech stopped: ' + ev.error + '. Type instead.'; reportError('Speech: ' + ev.error); };
      rec.start();
    } catch (e) { reportError('Speech could not start: ' + e.message); }
  });

  // ---- settings ----
  $('gear').addEventListener('click', function () {
    var open = $('drawer').hidden;
    $('drawer').hidden = !open;
    $('gear').setAttribute('aria-expanded', String(open));
  });
  $('closeDrawer').addEventListener('click', function () { $('drawer').hidden = true; $('gear').setAttribute('aria-expanded', 'false'); });
  document.querySelectorAll('.panelHead').forEach(function (head) {
    head.addEventListener('click', function () {
      var sec = head.parentElement;
      var collapsed = sec.dataset.collapsed !== 'true';
      sec.dataset.collapsed = String(collapsed);
      head.setAttribute('aria-expanded', String(!collapsed));
      head.querySelector('.mark').textContent = collapsed ? '▸' : '▾';
    });
  });
  $('showErrors').checked = read(KEY.errors, false) === true;
  $('showErrors').addEventListener('change', function (e) { write(KEY.errors, e.target.checked); renderErrors(); });

  function renderNotes() {
    var list = $('noteList'); list.textContent = '';
    notes.slice().reverse().forEach(function (n) {
      var li = document.createElement('li');
      li.textContent = new Date(n.at).toLocaleString() + ' · ' + n.where + '\n' + n.text;
      list.appendChild(li);
    });
  }
  $('noteSave').addEventListener('click', function () {
    var text = $('noteText').value.trim();
    if (!text) return;
    var where = document.querySelector('.tab.on') ? document.querySelector('.tab.on').dataset.tab : 'page';
    notes.push({ id: id('n'), at: new Date().toISOString(), status: 'open', text: text, where: where, version: VERSION });
    write(KEY.notes, notes); $('noteText').value = ''; renderNotes();
  });

  // ---- start ----
  window.addEventListener('error', function (e) { reportError('JS: ' + e.message); });
  renderMembers();
  renderStock();
  renderNotes();
  renderErrors();
})();
