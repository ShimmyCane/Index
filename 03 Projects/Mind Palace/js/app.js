/* Mind Palace: the page. Panels, search, the card, practice, building, saving, ⚙️.
   It talks to the knowledge database (MP.Model) and asks the view (MP.View) to draw. */
(function () {
  'use strict';
  var MP = window.MP, M = MP.Model, V = MP.View, L = MP.Layout, esc = MP.esc;
  var $ = function (id) { return document.getElementById(id); };

  var desc = null, sel = null, results = [], outlineMode = 'place', practiceKind = 'what', practice = null, has3d = true;
  var modes = { walk: false, move: false }, sideBeforeWalk = false;

  /* ---------- helpers ---------- */
  var toastTimer = 0;
  function toast(msg, ms) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, ms || 2600);
  }
  function kindEmoji(asset) {
    if (!asset) return '⭐';
    if (asset.representation === 'emoji' && asset.glyph) return asset.glyph;
    var k = MP.Objects.KINDS.filter(function (x) { return x.id === asset.kind; })[0]; return k ? k.emoji : '⭐';
  }
  function wide() { return window.innerWidth > 760; }
  function view(fn) { if (has3d) try { fn(); } catch (e) { MP.logError('view: ' + e.message); } }
  function dots(box) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= box ? 'on' : 'off') + '">●</span>'; return '<span class="dots">' + s + '</span>'; }
  function parentName(n) {
    if (!n.parent_id) return null;
    var w = M.world(n.parent_id); if (w) return w.name;
    var p = M.node(n.parent_id); return p ? p.title : null;
  }

  /* ---------- redraw after any change ---------- */
  function rebuild() {
    desc = L.build(M.data);
    if (sel && !desc.byId[sel.id]) sel = null;
    view(function () { V.setScene(desc); });
    pushFlags(); renderOutline(); renderCard(); renderPracticeInfo(); renderBar(); renderAbout();
    if ($('q').value.trim()) runSearch(false);
    $('pill').textContent = MP.store.ok ? '💾 this device' : '⚠️ not saving';
  }
  function pushFlags(extra) {
    var f = { selected: sel && sel.kind === 'node' ? sel.id : null, hideNames: !!(practice && practice.hide) };
    if (extra) Object.keys(extra).forEach(function (k) { f[k] = extra[k]; });
    view(function () { V.setFlags(f); });
  }

  /* ---------- select and travel ---------- */
  function select(kind, id, quiet) {
    sel = id ? { kind: kind, id: id } : null;
    pushFlags(); renderCard(); renderOutline();
    var label = 'Whole palace';
    if (sel) { var o = kind === 'node' ? M.node(id) : kind === 'room' ? M.place(id) : M.world(id); if (o) label = (kind === 'node' ? 'Memory: ' : kind === 'room' ? 'Room: ' : 'World: ') + (o.title || o.name); }
    MP.Notes.setContext({ item: sel ? sel.id : '', label: label });
    if (!quiet) MP.sound('tap');
  }
  function goTo(id, after) {
    if (!desc.byId[id]) return;
    var kind = M.node(id) ? 'node' : M.place(id) ? 'room' : 'world';
    if (!practice) select(kind, id, true);
    if (!has3d) { if (after) after(); return; }
    var route = L.route(desc, V.avatarPos(), id);
    var beacons = results.filter(function (r) { return r.type === 'node'; }).map(function (r) { return r.id; });
    if (beacons.indexOf(id) < 0) beacons = [id];
    pushFlags({ route: route, beacons: beacons, main: id });
    MP.sound('go');
    V.travel(route, function () {
      MP.sound('arrive'); pushFlags({ route: null, beacons: [id], main: id });
      if (after) after();
    }, kind === 'node' ? id : null);
  }

  /* ---------- search ---------- */
  function runSearch(go) {
    var q = $('q').value.trim(), list = $('results');
    results = q ? M.search(q) : [];
    if (!q) { list.innerHTML = '<li class="hint">Type a word above. Little-me walks there.</li>'; pushFlags({ beacons: [], main: null, route: null }); return; }
    if (!results.length) { list.innerHTML = '<li class="hint">Nothing found for “' + esc(q) + '”. Try another word, or a tag.</li>'; if (go) toast('Nothing found for “' + q + '”'); return; }
    list.innerHTML = results.map(function (r) {
      var icon = r.type === 'node' ? kindEmoji(M.asset(M.node(r.id).asset_id)) : r.type === 'place' ? '🚪' : '🏝️';
      return '<li><button type="button" class="item" data-go="' + esc(r.id) + '"><b>' + icon + ' ' + esc(r.title) + '</b><small>' + esc(r.sub) + '</small></button></li>';
    }).join('');
    pushFlags({ beacons: results.filter(function (r) { return r.type === 'node'; }).map(function (r) { return r.id; }), main: null });
    if (go) {
      if (practice) endPractice(true);
      var top = results[0];
      toast('Going to “' + top.title + '”' + (results.length > 1 ? ' (1 of ' + results.length + ' found)' : ''));
      goTo(top.id);
    }
  }

  /* ---------- outline (works without 3-D) ---------- */
  function renderOutline() {
    var d = M.data, html = '';
    function nodeRow(n, note) {
      return '<button type="button" class="item lvl2' + (sel && sel.id === n.id ? ' on' : '') + '" data-pick="node:' + esc(n.id) + '">' + kindEmoji(M.asset(n.asset_id)) + ' ' + esc(n.title) +
        (note ? ' <span class="away">' + esc(note) + '</span>' : '') + '</button>';
    }
    if (outlineMode === 'place') {
      d.worlds.forEach(function (w) {
        html += '<button type="button" class="item lvl0' + (sel && sel.id === w.id ? ' on' : '') + '" data-pick="world:' + esc(w.id) + '">🏝️ ' + esc(w.name) + '</button>';
        M.roomsIn(w.id).forEach(function (p) {
          var inside = M.nodesIn(p.id);
          html += '<button type="button" class="item lvl1' + (sel && sel.id === p.id ? ' on' : '') + '" data-pick="room:' + esc(p.id) + '">🚪 ' + esc(p.name) + ' <span class="away">' + M.TIERS[M.tierFor(inside.length)].name + ' · ' + inside.length + '</span></button>';
          inside.forEach(function (n) { html += nodeRow(n); });
        });
      });
      $('outlineHow').textContent = 'By place: where each memory stands in the palace.';
    } else {
      var used = {};
      d.worlds.forEach(function (w) {
        var kids = d.nodes.filter(function (n) { return n.parent_id === w.id; }); if (!kids.length) return;
        html += '<button type="button" class="item lvl0" data-pick="world:' + esc(w.id) + '">🗂️ ' + esc(w.name) + '</button>';
        kids.forEach(function (n) { used[n.id] = 1; var p = M.place(n.place_id); html += nodeRow(n, p && p.parent_id !== w.id ? 'lives in ' + p.name : ''); });
      });
      var rest = d.nodes.filter(function (n) { return !used[n.id]; });
      if (rest.length) { html += '<div class="item lvl0">🗂️ No topic yet</div>'; rest.forEach(function (n) { html += nodeRow(n, n.parent_id && M.node(n.parent_id) ? 'under ' + M.node(n.parent_id).title : ''); }); }
      $('outlineHow').textContent = 'By topic: what each memory belongs to. A memory can belong to one topic and stand in the room of another.';
    }
    $('outline').innerHTML = '<div class="tree">' + (html || '<p class="hint">Empty. Open Build to add a world.</p>') + '</div>';
    $('outlineSeg').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === outlineMode); });
  }

  /* ---------- the card ---------- */
  /* Keep the palace in the free part of the screen: right of the panels, and above the card on a phone. */
  function updateInset() {
    var left = $('side').dataset.hidden !== 'true' && wide() ? 340 : 0, card = $('card');
    var bottom = !wide() && !card.hidden ? card.offsetHeight : 0;
    view(function () { V.setInset(left, bottom); });
  }
  function renderCard() { drawCard(); updateInset(); }
  function drawCard() {
    var card = $('card');
    if (practice) { renderPracticeCard(); return; }
    if (!sel) { card.hidden = true; return; }
    var html = '';
    if (sel.kind === 'node') {
      var n = M.node(sel.id), a = M.asset(n.asset_id), p = M.place(n.place_id), w = p && M.world(p.parent_id), topic = parentName(n);
      var what = M.recallState(n.id, 'what'), where = M.recallState(n.id, 'where');
      html = '<div class="cardHead"><span class="big">' + kindEmoji(a) + '</span><h2>' + esc(n.title) + '</h2><button class="iconBtn" type="button" data-act="close" aria-label="Close">✖</button></div>' +
        (n.description ? '<p>' + esc(n.description) + '</p>' : '') +
        (n.tags.length ? '<div class="tags">' + n.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<p class="meta">🚪 Lives in <b>' + esc(p ? p.name : '?') + '</b>' + (w ? ', ' + esc(w.name) : '') + '<br>🗂️ Belongs to <b>' + esc(topic || 'no topic yet') + '</b></p>' +
        '<div class="meter">🧠 What ' + dots(what.box) + (what.isNew ? ' new' : what.isDue ? ' due' : '') + '</div>' +
        '<div class="meter">📍 Where ' + dots(where.box) + (where.isNew ? ' new' : where.isDue ? ' due' : '') + '</div>';
      var rels = M.relsOf(n.id);
      if (rels.length) html += '<ul class="links">' + rels.map(function (r) {
        var out = r.source === n.id, other = M.node(out ? r.target : r.source), op = M.place(other.place_id);
        return '<li><button type="button" class="item" data-go="' + esc(other.id) + '"><small>' + (out ? esc(M.relLabel(r.type)) + ' →' : '← ' + esc(M.relLabel(r.type))) + '</small><b>' + kindEmoji(M.asset(other.asset_id)) + ' ' + esc(other.title) + '</b>' +
          (op && op.id !== n.place_id ? '<small>in ' + esc(op.name) + '</small>' : '') + '</button><button type="button" class="x" data-unlink="' + esc(r.id) + '" aria-label="Remove this connection">✖</button></li>';
      }).join('') + '</ul>';
      html += '<div class="rowBtns"><button class="btn sun small" type="button" data-act="go">🚶 Go there</button><button class="btn mint small" type="button" data-act="practise">🧠 Practise</button></div>' +
        '<div class="rowBtns"><button class="btn small" type="button" data-act="edit">✏️ Change</button><button class="btn small" type="button" data-act="connect">🔗 Connect</button><button class="btn small" type="button" data-act="remove">🗑 Remove</button></div>';
    } else if (sel.kind === 'room') {
      var room = M.place(sel.id), inside = M.nodesIn(room.id), tier = M.tierFor(inside.length), next = M.TIERS[tier + 1], rw = M.world(room.parent_id);
      html = '<div class="cardHead"><span class="big">🚪</span><h2>' + esc(room.name) + '</h2><button class="iconBtn" type="button" data-act="close" aria-label="Close">✖</button></div>' +
        '<p class="meta">A <b>' + M.TIERS[tier].name + '</b> in ' + esc(rw ? rw.name : '?') + ', floor ' + M.roomLevel(room) + '. It holds <b>' + inside.length + '</b> ' + (inside.length === 1 ? 'memory' : 'memories') + '.' +
        (next ? ' It grows into a ' + next.name + ' at ' + next.min + '.' : '') + '<br>Size shows how much is kept here, not how well you know it.</p>' +
        '<ul class="list">' + inside.map(function (x) { return '<li><button type="button" class="item" data-pick="node:' + esc(x.id) + '">' + kindEmoji(M.asset(x.asset_id)) + ' ' + esc(x.title) + '</button></li>'; }).join('') + '</ul>' +
        '<div class="rowBtns"><button class="btn sun small" type="button" data-act="go">🚶 Go there</button><button class="btn mint small" type="button" data-act="addHere">➕ Memory here</button></div>' +
        '<div class="rowBtns"><button class="btn small" type="button" data-act="up">▲ Up a floor</button><button class="btn small" type="button" data-act="down">▼ Down</button></div>' +
        '<div class="rowBtns"><button class="btn small" type="button" data-act="edit">✏️ Change</button><button class="btn small" type="button" data-act="remove">🗑 Remove</button></div>';
    } else {
      var wd = M.world(sel.id), rooms = M.roomsIn(wd.id);
      html = '<div class="cardHead"><span class="big">🏝️</span><h2>' + esc(wd.name) + '</h2><button class="iconBtn" type="button" data-act="close" aria-label="Close">✖</button></div>' +
        '<p class="meta">A world with <b>' + rooms.length + '</b> ' + (rooms.length === 1 ? 'room' : 'rooms') + '.</p>' +
        '<ul class="list">' + rooms.map(function (x) { return '<li><button type="button" class="item" data-pick="room:' + esc(x.id) + '">🚪 ' + esc(x.name) + '</button></li>'; }).join('') + '</ul>' +
        '<div class="rowBtns"><button class="btn sun small" type="button" data-act="go">🚶 Go there</button><button class="btn mint small" type="button" data-act="addRoomHere">➕ Room here</button></div>' +
        '<div class="rowBtns"><button class="btn small" type="button" data-act="edit">✏️ Change</button><button class="btn small" type="button" data-act="remove">🗑 Remove</button></div>';
    }
    card.innerHTML = html; card.hidden = false;
  }

  function cardAction(act) {
    if (!sel) return;
    var id = sel.id, kind = sel.kind;
    if (act === 'close') return select(null, null);
    if (act === 'go') return goTo(id);
    if (act === 'practise') return startPractice([{ id: id, kind: practiceKind === 'where' ? 'where' : 'what' }]);
    if (act === 'connect') return connectForm(id);
    if (act === 'addHere') return nodeForm(null, id);
    if (act === 'addRoomHere') return roomForm(null, id);
    if (act === 'up' || act === 'down') { var p = M.place(id); M.updateRoom(id, { level: M.roomLevel(p) + (act === 'up' ? 1 : -1) }); return; }
    if (act === 'edit') return kind === 'node' ? nodeForm(id) : kind === 'room' ? roomForm(id) : worldForm(id);
    if (act === 'remove') {
      if (kind === 'node') { var n = M.node(id); M.removeNode(id); toast('Removed “' + n.title + '”. Undo brings it back.'); }
      else if (kind === 'room') { if (!M.removeRoom(id)) toast('This room still holds memories. Move them out first, so nothing is lost.', 4000); }
      else if (!M.removeWorld(id)) toast('This world still has rooms. Move or remove them first.', 4000);
    }
  }

  /* ---------- forms ---------- */
  var sheetSubmit = null;
  function openSheet(title, body, okLabel, onSubmit) {
    $('sheet').innerHTML = '<h2>' + esc(title) + '</h2>' + body +
      '<div class="rowBtns"><button class="btn sun" type="submit">' + esc(okLabel) + '</button><button class="btn" type="button" data-act="cancel">Cancel</button></div>';
    sheetSubmit = onSubmit; $('sheetWrap').hidden = false;
    var first = $('sheet').querySelector('input[type=text]'); if (first && wide()) first.focus();
  }
  function closeSheet() { $('sheetWrap').hidden = true; sheetSubmit = null; }
  function options(list, value, labelFn) {
    return list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === value ? ' selected' : '') + '>' + esc(labelFn(x)) + '</option>'; }).join('');
  }
  function roomOptions(value) {
    return M.data.worlds.map(function (w) {
      return '<optgroup label="' + esc(w.name) + '">' + options(M.roomsIn(w.id), value, function (p) { return p.name; }) + '</optgroup>';
    }).join('');
  }
  function defaultRoom() {
    if (sel && sel.kind === 'room') return sel.id;
    if (sel && sel.kind === 'node') return M.node(sel.id).place_id;
    var at = has3d && desc ? V.avatarPos() : null, r = at && L.roomAt(desc, at[0], at[2], at[1]);
    return r ? r.id : (M.data.places[0] && M.data.places[0].id);
  }
  function nodeForm(id, roomId) {
    if (!M.data.places.length) return toast('Add a room first. A memory needs somewhere to stand.');
    var n = id ? M.node(id) : null, a = n ? M.asset(n.asset_id) : { kind: 'star', glyph: '', color: '' };
    var place = n ? n.place_id : (roomId || defaultRoom());
    var topics = '<option value="">No topic yet</option>' + options(M.data.worlds, n ? n.parent_id : (M.place(place) || {}).parent_id, function (w) { return 'Topic: ' + w.name; }) +
      options(M.data.nodes.filter(function (x) { return !n || x.id !== n.id; }), n ? n.parent_id : '', function (x) { return 'Under: ' + x.title; });
    openSheet(n ? 'Change this memory' : 'New memory',
      '<label>What do you want to remember?<input type="text" name="title" maxlength="80" required value="' + esc(n ? n.title : '') + '"></label>' +
      '<label>More about it<textarea name="description" rows="2">' + esc(n ? n.description : '') + '</textarea></label>' +
      '<div class="two"><label>A question to ask yourself <small>for practice (optional)</small><input type="text" name="question" value="' + esc(n ? n.question : '') + '"></label>' +
      '<label>The answer <small>(optional)</small><input type="text" name="answer" value="' + esc(n ? n.answer : '') + '"></label></div>' +
      '<label>Tags <small>words to find it by, with commas</small><input type="text" name="tags" value="' + esc(n ? n.tags.join(', ') : '') + '"></label>' +
      '<div class="two"><label>Lives in (the room)<select name="place_id">' + roomOptions(place) + '</select></label>' +
      '<label>Belongs to (the topic)<select name="parent_id">' + topics + '</select></label></div>' +
      '<label>Looks like</label><div class="kinds">' + MP.Objects.KINDS.map(function (k) {
        return '<label><input type="radio" name="kind" value="' + k.id + '"' + (k.id === a.kind ? ' checked' : '') + '><span><i>' + k.emoji + '</i>' + esc(k.label) + '</span></label>';
      }).join('') + '</div>' +
      '<div class="two"><label>Or any emoji <small>for example 🦖. Leave empty to use the object above.</small><input type="text" name="glyph" maxlength="8" value="' + esc(a.glyph || '') + '"></label>' +
      '<div><label>Colour</label><div class="swatches"><label><input type="radio" name="color" value=""' + (!a.color ? ' checked' : '') + '><span style="background:repeating-linear-gradient(45deg,#fff,#fff 6px,#eee 6px,#eee 12px)" title="Its own colour"></span></label>' +
      MP.Objects.COLORS.map(function (c) { return '<label><input type="radio" name="color" value="' + c + '"' + (c === a.color ? ' checked' : '') + '><span style="background:' + c + '"></span></label>'; }).join('') + '</div></div></div>',
      n ? 'Save' : 'Add it', function (f) {
        f.glyph = (f.glyph || '').trim(); f.parent_id = f.parent_id || null;
        if (n) { M.updateNode(n.id, f); select('node', n.id, true); }
        else { var made = M.addNode(f); if (made) { select('node', made.id, true); view(function () { V.frame('node', made.id); }); toast('“' + made.title + '” now lives in ' + M.place(made.place_id).name + '.'); } }
      });
  }
  function roomForm(id, worldId) {
    if (!M.data.worlds.length) return toast('Add a world first.');
    var p = id ? M.place(id) : null, w = p ? p.parent_id : (worldId || (sel && sel.kind === 'world' ? sel.id : sel && sel.kind === 'room' ? M.place(sel.id).parent_id : M.data.worlds[0].id));
    openSheet(p ? 'Change this room' : 'New room',
      '<label>Name of the room<input type="text" name="name" maxlength="40" required value="' + esc(p ? p.name : '') + '"></label>' +
      '<div class="two"><label>In which world?<select name="parent_id">' + options(M.data.worlds, w, function (x) { return x.name; }) + '</select></label>' +
      '<label>Colours<select name="style">' + M.ROOM_STYLES.map(function (s) { return '<option' + (p && p.style === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label></div>',
      p ? 'Save' : 'Build it', function (f) {
        if (p) M.updateRoom(p.id, f);
        else { var made = M.addRoom(f.parent_id, f.name, f.style); if (made) { select('room', made.id, true); view(function () { V.frame('room', made.id); }); } }
      });
  }
  function worldForm(id) {
    var w = id ? M.world(id) : null;
    openSheet(w ? 'Change this world' : 'New world',
      '<label>Name of the world <small>a big subject, like Space or Music</small><input type="text" name="name" maxlength="40" required value="' + esc(w ? w.name : '') + '"></label>' +
      '<label>Ground<select name="style">' + M.WORLD_STYLES.map(function (s) { return '<option' + (w && w.style === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label>',
      w ? 'Save' : 'Build it', function (f) {
        if (w) M.updateWorld(w.id, f);
        else { var made = M.addWorld(f.name, f.style); select('world', made.id, true); view(function () { V.frame('world', made.id); }); }
      });
  }
  function connectForm(id) {
    var n = M.node(id), others = M.data.nodes.filter(function (x) { return x.id !== id; });
    if (!others.length) return toast('Add another memory first.');
    var groups = M.data.places.map(function (p) {
      var inside = others.filter(function (x) { return x.place_id === p.id; });
      return inside.length ? '<optgroup label="' + esc(p.name) + '">' + options(inside, '', function (x) { return x.title; }) + '</optgroup>' : '';
    }).join('');
    openSheet('Connect “' + n.title + '”',
      '<label>How?<select name="type">' + M.REL_TYPES.map(function (t) { return '<option value="' + t.id + '">' + esc(t.label) + '</option>'; }).join('') + '</select></label>' +
      '<label>Which memory?<select name="target">' + groups + '</select></label>' +
      '<p class="how">The two stay where they are. A line joins them, even across rooms and worlds.</p>',
      'Connect', function (f) { M.connect(id, f.target, f.type); toast('Connected.'); });
  }

  /* ---------- practice ---------- */
  function renderPracticeInfo() {
    var n = M.data.nodes.length, w = M.practiceList('what', 99), h = M.practiceList('where', 99);
    var fresh = M.data.nodes.filter(function (x) { return M.recallState(x.id, 'what').isNew && M.recallState(x.id, 'where').isNew; }).length;
    $('practiceInfo').innerHTML = n ? 'To practise now: <b>' + w.due + '</b> “what” and <b>' + h.due + '</b> “where”, out of ' + n + '. Never practised: ' + fresh + '.' : 'Nothing to practise yet.';
    $('practiceSeg').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === practiceKind); });
  }
  function startRound() {
    if (!M.data.nodes.length) return toast('Add a memory first.');
    var items = [];
    if (practiceKind === 'mix') {
      var a = M.practiceList('what', 3).list, b = M.practiceList('where', 5).list.filter(function (id) { return a.indexOf(id) < 0; }).slice(0, 2);
      a.forEach(function (id) { items.push({ id: id, kind: 'what' }); }); b.forEach(function (id) { items.push({ id: id, kind: 'where' }); });
    } else M.practiceList(practiceKind, 5).list.forEach(function (id) { items.push({ id: id, kind: practiceKind }); });
    startPractice(items);
  }
  function startPractice(items) {
    if (!items.length) return;
    setMode('walk', false); setMode('move', false);
    practice = { items: items, i: -1, hide: true, score: { knew: 0, almost: 0, forgot: 0 }, phase: '' };
    sel = null; results = [];
    if (!wide()) setSide(false);
    nextItem();
  }
  function nextItem() {
    practice.i++; practice.shown = false; practice.hint = false; practice.result = null;
    if (practice.i >= practice.items.length) { practice.phase = 'done'; practice.hide = false; pushFlags({ beacons: [], main: null, route: null }); renderCard(); return; }
    var it = practice.items[practice.i];
    if (!M.node(it.id)) return nextItem();
    practice.hide = true;
    if (it.kind === 'what') {
      practice.phase = 'travel'; renderCard();
      goTo(it.id, function () { if (practice && practice.items[practice.i] === it) { practice.phase = 'ask'; renderCard(); } });
      if (!has3d) { practice.phase = 'ask'; renderCard(); }
    } else {
      practice.phase = 'point'; pushFlags({ beacons: [], main: null, route: null });
      view(function () { V.stopTravel(); V.frame('all'); });
      renderCard();
    }
  }
  function grade(result) {
    var it = practice.items[practice.i];
    M.record(it.id, it.kind, result); practice.score[result]++;
    MP.sound(result === 'knew' ? 'good' : result === 'almost' ? 'almost' : 'miss');
  }
  function pointAt(roomId) {            // the answer to a "where" question
    var it = practice.items[practice.i], n = M.node(it.id), right = roomId === n.place_id;
    practice.result = right ? 'knew' : 'forgot'; grade(practice.result);
    practice.phase = 'shown'; practice.hide = false; renderCard();
    goTo(it.id);
  }
  function endPractice(quiet) {
    practice = null; pushFlags({ beacons: [], main: null, route: null }); renderCard(); renderPracticeInfo();
    if (!quiet) view(function () { V.frame('all'); });
  }
  function renderPracticeCard() {
    var card = $('card'), p = practice, html;
    var head = function (icon, title) { return '<div class="cardHead"><span class="big">' + icon + '</span><h2>' + title + '</h2><button class="iconBtn" type="button" data-pr="stop" aria-label="Stop practice">✖</button></div>'; };
    if (p.phase === 'done') {
      html = head('🎉', 'Round done') + '<p>😀 Knew it: <b>' + p.score.knew + '</b><br>😐 Almost: <b>' + p.score.almost + '</b><br>😕 Forgot: <b>' + p.score.forgot + '</b></p>' +
        '<p class="how">What you knew waits longer before it comes back. What you missed comes back today.</p>' +
        '<div class="rowBtns"><button class="btn sun" type="button" data-pr="again">▶ Another round</button><button class="btn" type="button" data-pr="stop">Done</button></div>';
      card.innerHTML = html; card.hidden = false; return;
    }
    var it = p.items[p.i], n = M.node(it.id), room = M.place(n.place_id), a = M.asset(n.asset_id);
    var prog = '<p class="progress">' + (p.i + 1) + ' OF ' + p.items.length + '</p>';
    var reveal = '<div class="answer"><b>' + kindEmoji(a) + ' ' + esc(n.title) + '</b>' + (n.answer ? '<br>' + esc(n.answer) : n.description ? '<br>' + esc(n.description) : '') + '<br><small>in ' + esc(room.name) + '</small></div>';
    if (it.kind === 'what') {
      if (p.phase === 'travel') html = head('🚶', 'Walking there…') + prog + '<p class="ask">Look at the object. What do you keep here?</p>';
      else {
        html = head('🤔', 'What is here?') + prog + '<p class="ask">' + esc(n.question || 'What do you keep at this object?') + '</p>' +
          (p.hint ? '<div class="tags">' + (n.tags.length ? n.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') : '<span class="tag">no tags to hint with</span>') + '</div>' : '');
        if (!p.shown) html += '<div class="rowBtns"><button class="btn sun" type="button" data-pr="show">👀 Show me</button>' + (p.hint ? '' : '<button class="btn" type="button" data-pr="hint">💡 Hint</button>') + '</div><p class="how">Say it out loud first. Then check.</p>';
        else html += reveal + '<div class="rowBtns"><button class="btn mint" type="button" data-pr="knew">😀 Knew it</button><button class="btn sky" type="button" data-pr="almost">😐 Almost</button><button class="btn coral" type="button" data-pr="forgot">😕 Forgot</button></div>';
      }
    } else if (p.phase === 'point') {
      html = head('📍', 'Where is it?') + prog + '<p class="ask">Where do you keep “' + esc(n.title) + '”?</p><p class="how">Tap its room. Spin and zoom to look around. The name tags are hidden.</p>' +
        '<div class="rowBtns"><button class="btn" type="button" data-pr="dunno">I don’t know</button></div>';
    } else {
      html = head(p.result === 'knew' ? '😀' : '😕', p.result === 'knew' ? 'Yes, there!' : 'It is over here') + prog + reveal +
        '<div class="rowBtns"><button class="btn sun" type="button" data-pr="next">Next ▶</button></div>';
    }
    card.innerHTML = html; card.hidden = false;
  }
  function practiceAction(act) {
    var p = practice; if (!p) return;
    if (act === 'stop') return endPractice();
    if (act === 'again') { practice = null; return startRound(); }
    if (act === 'hint') { p.hint = true; return renderCard(); }
    if (act === 'show') { p.shown = true; p.hide = false; pushFlags(); return renderCard(); }
    if (act === 'dunno') return pointAt(null);
    if (act === 'next') return nextItem();
    if (act === 'knew' || act === 'almost' || act === 'forgot') { grade(act); nextItem(); }
  }

  /* ---------- taps and drops from the 3-D view ---------- */
  function onTap(hit) {
    if (practice) {
      if (practice.phase === 'point' && hit) {
        var roomId = hit.kind === 'room' ? hit.id : hit.kind === 'node' ? M.node(hit.id).place_id : null;
        if (roomId) pointAt(roomId); else toast('Tap a room.');
      }
      return;
    }
    if (!hit) { if (sel) select(null, null, true); return; }
    if (modes.walk && hit.kind !== 'node') {
      var from = V.avatarPos(), gy = L.groundAt(desc, hit.point[0], hit.point[2], hit.point[1]);
      V.travel([from, [hit.point[0], gy == null ? from[1] : gy, hit.point[2]]]); return;
    }
    select(hit.kind === 'worldHandle' ? 'world' : hit.kind, hit.id);
  }
  function onDrop(kind, id, pos, revert) {
    if (kind === 'node') {
      var n = M.node(id), room = L.roomAt(desc, pos[0], pos[2], pos[1]);
      if (!room) { revert(); rebuild(); return toast('Drop it inside a room.'); }
      var changed = room.id !== n.place_id;
      M.moveNode(id, room.id, [pos[0] - room.pos[0], 0, pos[2] - room.pos[2]]);
      if (changed) toast('“' + n.title + '” moved to ' + room.name + '. Its connections came along.', 3200);
    } else if (kind === 'room') M.moveRoom(id, pos);
    else if (kind === 'world') M.moveWorld(id, pos);
  }

  /* ---------- bottom bar, walking ---------- */
  function setMode(name, on) {
    modes[name] = on;
    if (on && name === 'walk') setMode('move', false);
    if (on && name === 'move') setMode('walk', false);
    view(function () { if (name === 'walk') V.setWalk(on); else V.setMove(on); });
    $('stick').hidden = !modes.walk;
    if (name === 'walk') {      // walking uses the whole screen; the panels come back when walking stops
      if (on) { sideBeforeWalk = $('side').dataset.hidden !== 'true'; setSide(false); }
      else if (sideBeforeWalk) { sideBeforeWalk = false; setSide(wide()); }
    }
    renderBar();
  }
  function renderBar() {
    $('bar').querySelectorAll('button').forEach(function (b) {
      var a = b.dataset.act;
      if (a === 'walk' || a === 'move') b.setAttribute('aria-pressed', String(modes[a]));
      if (a === 'undo') b.disabled = !M.canUndo();
      if (a === 'redo') b.disabled = !M.canRedo();
    });
  }
  function barAction(act, btn) {
    if (act === 'all') view(function () { V.frame('all'); });
    else if (act === 'focus') view(function () { if (sel) V.frame(sel.kind, sel.id); else V.followAvatar(10); });
    else if (act === 'walk') { if (practice) endPractice(true); setMode('walk', !modes.walk); if (modes.walk) toast(wide() ? 'Walk: arrow keys or W A S D. Drag to look. Tap a floor to walk there.' : 'Walk: use the stick. Drag to look. Tap a floor to walk there.', 3600); }
    else if (act === 'move') { if (practice) endPractice(true); setMode('move', !modes.move); if (modes.move) toast('Move: drag an object, a floor, or the ball in the middle of a world.', 3600); }
    else if (act === 'spin') { var on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', String(on)); view(function () { V.spin(on); }); }
    else if (act === 'undo') { var u = M.undo(); if (u) { MP.sound('undo'); toast('Took back: ' + u); } }
    else if (act === 'redo') { var r = M.redo(); if (r) { MP.sound('undo'); toast('Did again: ' + r); } }
  }
  var keys = {};
  function keyInput() {
    var x = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), y = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    view(function () { V.input(x, y); });
  }
  function typing(e) { var t = e.target.tagName; return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT'; }
  function initStick() {
    var stick = $('stick'), knob = $('knob'), active = null;
    function at(e) {
      var r = stick.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2), l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      knob.style.transform = 'translate(' + x * 34 + 'px,' + y * 34 + 'px)'; view(function () { V.input(x, y); });
    }
    stick.addEventListener('pointerdown', function (e) { active = e.pointerId; stick.setPointerCapture(e.pointerId); at(e); });
    stick.addEventListener('pointermove', function (e) { if (e.pointerId === active) at(e); });
    function end(e) { if (e.pointerId !== active) return; active = null; knob.style.transform = ''; view(function () { V.input(0, 0); }); }
    stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);
  }

  /* ---------- panels ---------- */
  function setSide(open) {
    $('side').dataset.hidden = String(!open); $('menuBtn').setAttribute('aria-expanded', String(open));
    updateInset();
  }
  function initPanels() {
    var saved = MP.store.get(MP.KEYS.panels, {}) || {};
    document.querySelectorAll('.panel').forEach(function (section) {
      var id = section.dataset.panel, open = id in saved ? saved[id] : section.dataset.open !== 'false';
      function apply() { section.dataset.collapsed = String(!open); section.querySelector('.panelHead').setAttribute('aria-expanded', String(open)); }
      apply();
      section.querySelector('.panelHead').addEventListener('click', function () { open = !open; apply(); saved[id] = open; MP.store.set(MP.KEYS.panels, saved); });
    });
    setSide(wide());
    $('menuBtn').addEventListener('click', function () { setSide($('side').dataset.hidden === 'true'); });
  }

  /* ---------- ⚙️ ---------- */
  function renderErrors() {
    var box = $('errorsPanel'); box.hidden = !MP.settings.showErrors;
    box.textContent = MP.errors.length ? MP.errors.join('\n') : 'No problems so far.';
  }
  function renderSettings() {
    document.querySelectorAll('.drawer .seg').forEach(function (seg) {
      var v = String(MP.settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    });
    $('showErrors').checked = !!MP.settings.showErrors; renderErrors();
  }
  function renderAbout() {
    var d = M.data;
    $('aboutLine').textContent = 'Mind Palace ' + MP.VERSION + ' · ' + d.worlds.length + ' worlds, ' + d.places.length + ' rooms, ' + d.nodes.length + ' memories, ' + d.relationships.length + ' connections, ' + d.recall.length + ' practice answers.';
  }
  function initGear() {
    var gear = $('gear'), drawer = $('drawer');
    function setOpen(open) { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); }
    gear.addEventListener('click', function () { setOpen(drawer.hidden); });
    $('closeDrawer').addEventListener('click', function () { setOpen(false); });
    $('pill').addEventListener('click', function () { setOpen(true); });
    document.querySelectorAll('.drawer .seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.v; MP.settings[b.parentElement.dataset.key] = (v === '0' || v === '1') ? +v : v;
        MP.saveSettings(); renderSettings(); pushFlags(); MP.sound('tap');
      });
    });
    $('showErrors').addEventListener('change', function (e) { MP.settings.showErrors = e.target.checked; MP.saveSettings(); renderErrors(); });
    $('checkStore').addEventListener('click', function () {
      var ok = MP.store.set('mindpalace.check', { at: Date.now() }) && MP.store.get('mindpalace.check', null), size = 0;
      try { size = Math.round(JSON.stringify(M.data).length / 1024); } catch (e) {}
      var saved = MP.palaces.load();
      $('dbLine').textContent = ok && saved ? '✅ Saving works on this device. The palace is ' + size + ' KB, with ' + (saved.nodes || []).length + ' memories saved. Nothing is sent anywhere.'
        : '❌ This browser is not keeping data (private mode, or storage is blocked). Use “Save a copy” to keep your palace.';
      $('pill').textContent = ok ? '💾 this device' : '⚠️ not saving';
    });
    MP.onError = renderErrors;
    window.addEventListener('error', function (e) { MP.logError(e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '')); });
    renderSettings();
  }

  /* ---------- save and open ---------- */
  function initSave() {
    $('exportBtn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(M.data, null, 2)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'mind-palace-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      toast('Saved a copy to your downloads.');
    });
    $('importFile').addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { openData(JSON.parse(reader.result), 'Opened “' + file.name + '”.'); }
        catch (err) { toast('That file could not be read as a palace.', 4000); MP.logError('open a copy: ' + err.message); }
        e.target.value = '';
      };
      reader.readAsText(file);
    });
    $('sampleBtn').addEventListener('click', function () { openData(MP.sample(), 'The sample palace is back. Undo returns to yours.'); });
    $('emptyBtn').addEventListener('click', function () { openData(M.empty(), 'An empty palace. Open Build to add a world. Undo returns to yours.'); });
  }
  /* Whose palace: each person has their own, kept apart on this device. */
  function renderPalaces() {
    var cur = MP.palaces.current();
    $('palacePick').innerHTML = MP.palaces.list().map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === cur.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    document.title = cur.name + ' · Mind Palace';
  }
  function switchPalace(msg) {
    if (practice) endPractice(true);
    sel = null; results = []; $('q').value = '';
    var saved = MP.palaces.load();
    M.load(saved && saved.worlds ? saved : M.empty()).forEach(function (p) { MP.logError('repair: ' + p); });
    renderPalaces(); homeAvatar(); view(function () { V.frame('all'); }); toast(msg, 3600);
  }
  function initPalaces() {
    renderPalaces();
    $('palacePick').addEventListener('change', function (e) { MP.palaces.choose(e.target.value); switchPalace('This is ' + MP.palaces.current().name + '.'); });
    $('palaceNew').addEventListener('click', function () {
      openSheet('New palace', '<label>Whose palace is it? <small>a first name is enough</small><input type="text" name="name" maxlength="30" required></label>' +
        '<p class="how">It starts empty. Open Build to add the first world. The other palaces stay as they are.</p>', 'Make it', function (f) {
        MP.palaces.add(f.name); switchPalace('A new, empty palace: ' + f.name + '. Open Build to add a world.');
      });
    });
    $('palaceRename').addEventListener('click', function () {
      openSheet('Rename this palace', '<label>Name<input type="text" name="name" maxlength="30" required value="' + esc(MP.palaces.current().name) + '"></label>', 'Save', function (f) {
        MP.palaces.rename(f.name); renderPalaces();
      });
    });
  }
  function openData(data, msg) {
    if (practice) endPractice(true);
    sel = null; results = []; $('q').value = '';
    var problems = M.load(data, true);
    problems.forEach(function (p) { MP.logError('repair: ' + p); });
    toast(msg + (problems.length ? ' ' + problems.length + ' thing(s) were repaired (see Show errors).' : ''), 4200);
    homeAvatar(); view(function () { V.frame('all'); });
  }
  function homeAvatar() {
    var w = desc && desc.worlds[0]; if (w) view(function () { V.placeAvatar([w.pos[0], w.pos[1], w.pos[2] + 4.5]); });
  }

  /* ---------- start ---------- */
  function start() {
    initGear(); MP.Notes.init(); initSave(); initStick();
    try { V.init($('scene')); } catch (e) { has3d = false; MP.logError('3-D could not start: ' + e.message); toast('3-D could not start here. Search, the map and practice still work.', 6000); }
    initPanels(); window.addEventListener('resize', function () { setSide($('side').dataset.hidden !== 'true' && wide()); });
    V.on('tap', onTap); V.on('drop', onDrop);
    V.on('spinEnd', function () { $('bar').querySelector('[data-act=spin]').setAttribute('aria-pressed', 'false'); });
    M.onChange(function (why) { rebuild(); if (why !== 'load' && why !== 'undo' && why !== 'recall') MP.sound('build'); });

    initPalaces();
    var saved = MP.palaces.load();
    var problems = M.load(saved && saved.worlds ? saved : MP.sample());
    problems.forEach(function (p) { MP.logError('repair: ' + p); });
    homeAvatar(); view(function () { V.frame('all'); });

    $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); $('q').blur(); runSearch(true); });
    $('q').addEventListener('input', function () { runSearch(false); });
    $('outlineSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { outlineMode = b.dataset.v; renderOutline(); } });
    $('practiceSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { practiceKind = b.dataset.v; renderPracticeInfo(); } });
    $('practiceStart').addEventListener('click', startRound);
    $('addNode').addEventListener('click', function () { nodeForm(null); });
    $('addRoom').addEventListener('click', function () { roomForm(null); });
    $('addWorld').addEventListener('click', function () { worldForm(null); });
    $('bar').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) barAction(b.dataset.act, b); });

    // One listener for everything made from templates (results, outline, card).
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go],[data-pick],[data-act],[data-pr],[data-unlink]'); if (!b || b.closest('#bar')) return;
      if (b.dataset.go) { if (!wide()) setSide(false); goTo(b.dataset.go); }
      else if (b.dataset.pick) { var parts = b.dataset.pick.split(':'); if (practice) endPractice(true); select(parts[0], parts[1]); view(function () { V.frame(parts[0], parts[1]); }); if (!wide()) setSide(false); }
      else if (b.dataset.unlink) M.disconnect(b.dataset.unlink);
      else if (b.dataset.pr) practiceAction(b.dataset.pr);
      else if (b.dataset.act === 'cancel') closeSheet();
      else if (b.closest('#card')) cardAction(b.dataset.act);
    });
    $('sheet').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = {}; new FormData($('sheet')).forEach(function (v, k) { f[k] = typeof v === 'string' ? v.trim() : v; });
      var fn = sheetSubmit; closeSheet(); if (fn) fn(f);
    });
    $('sheetWrap').addEventListener('pointerdown', function (e) { if (e.target === $('sheetWrap')) closeSheet(); });

    window.addEventListener('keydown', function (e) {
      if (typing(e)) return;
      var k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); barAction(e.shiftKey ? 'redo' : 'undo'); return; }
      if (k === 'escape') { if (!$('sheetWrap').hidden) closeSheet(); else if (!$('drawer').hidden) $('gear').click(); else if (sel) select(null, null, true); return; }
      if (k === '/') { e.preventDefault(); $('q').focus(); return; }
      if (!modes.walk) return;
      if (k === 'q') view(function () { V.turn(0.25); }); else if (k === 'e') view(function () { V.turn(-0.25); });
      else if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0) { e.preventDefault(); keys[k] = true; keyInput(); }
    });
    window.addEventListener('keyup', function (e) { var k = e.key.toLowerCase(); if (keys[k]) { keys[k] = false; keyInput(); } });

    // For checks in a headless browser.
    MP.debug = function () {
      return { version: MP.VERSION, has3d: has3d, sel: sel, results: results.map(function (r) { return r.id; }), practice: practice && { i: practice.i, phase: practice.phase, kind: practice.items[practice.i] && practice.items[practice.i].kind, id: practice.items[practice.i] && practice.items[practice.i].id, score: practice.score },
        modes: modes, view: has3d ? V.state() : null, counts: { worlds: M.data.worlds.length, rooms: M.data.places.length, nodes: M.data.nodes.length, links: M.data.relationships.length, recall: M.data.recall.length },
        errors: MP.errors.slice(), canUndo: M.canUndo(), canRedo: M.canRedo() };
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
