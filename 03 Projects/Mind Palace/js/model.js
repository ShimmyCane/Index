/* Mind Palace: the knowledge database. This is the source of truth.
   No DOM and no 3-D here, so search, practice and editing work without a renderer (and in Node). */
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  var MP = root.MP = root.MP || {};

  var SCHEMA = 1;
  // A room grows with how much is kept in it. Size says "how much", never "how well known".
  var TIERS = [
    { min: 0, name: 'Nook', half: 3.2 },
    { min: 3, name: 'Room', half: 4.2 },
    { min: 6, name: 'Hall', half: 5.4 },
    { min: 10, name: 'Library', half: 6.8 },
    { min: 16, name: 'Tower', half: 8 }
  ];
  var REL_TYPES = [
    { id: 'related_to', label: 'goes with' },
    { id: 'leads_to', label: 'leads to' },
    { id: 'part_of', label: 'is part of' },
    { id: 'opposite_of', label: 'is the opposite of' },
    { id: 'reminds_me_of', label: 'reminds me of' }
  ];
  var ROOM_STYLES = ['meadow', 'peach', 'sky', 'lilac', 'sand', 'night'];
  var WORLD_STYLES = ['grass', 'beach', 'snow', 'moon', 'candy'];
  var INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];   // Leitner boxes 0 to 5
  var DAY = 86400000;
  var HISTORY_MAX = 60;

  var data = null, undoStack = [], redoStack = [], listeners = [];

  function now() { return new Date().toISOString(); }
  function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function arr(a) { return Array.isArray(a) ? a : []; }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function vec3(v, d) { v = arr(v); d = d || [0, 0, 0]; return [num(v[0], d[0]), num(v[1], d[1]), num(v[2], d[2])]; }
  function str(v, d) { return typeof v === 'string' ? v : (d || ''); }

  function empty() {
    return { project: 'Mind Palace', schema: SCHEMA, updated_at: now(), worlds: [], places: [], nodes: [],
      relationships: [], assets: [], routes: [], recall: [], proposals: [] };
  }

  /* Repair anything loaded from outside: missing fields, broken links, lost objects.
     Returns the cleaned data and a list of what was fixed, in plain words. */
  function validate(input) {
    var problems = [], d = empty();
    if (!input || typeof input !== 'object') return { data: d, problems: ['The file was not a palace. Started an empty one.'] };
    if (num(input.schema, 1) > SCHEMA) problems.push('This palace was saved by a newer version. Some things may be missing.');
    var seen = {};
    function fresh(id, prefix) {
      id = str(id); if (!id || seen[id]) { id = uid(prefix); }
      seen[id] = true; return id;
    }
    arr(input.worlds).forEach(function (w, i) {
      if (!w || typeof w !== 'object') return;
      d.worlds.push({ id: fresh(w.id, 'world'), name: str(w.name, 'World ' + (i + 1)),
        style: WORLD_STYLES.indexOf(w.style) >= 0 ? w.style : 'grass',
        transform: { position: vec3(w.transform && w.transform.position, [i * 55, 0, 0]) }, created_at: str(w.created_at, now()) });
    });
    var worldIds = {}; d.worlds.forEach(function (w) { worldIds[w.id] = true; });
    arr(input.places).forEach(function (p, i) {
      if (!p || typeof p !== 'object') return;
      var parent = str(p.parent_id);
      if (!worldIds[parent]) {
        if (!d.worlds.length) { d.worlds.push({ id: fresh('', 'world'), name: 'Lost and found', style: 'grass', transform: { position: [0, 0, 0] }, created_at: now() }); worldIds[d.worlds[0].id] = true; }
        parent = d.worlds[0].id; problems.push('Room "' + str(p.name, '?') + '" had no world. Moved to ' + d.worlds[0].name + '.');
      }
      var t = p.transform || {};
      d.places.push({ id: fresh(p.id, 'place'), name: str(p.name, 'Room ' + (i + 1)), type: str(p.type, 'room'), parent_id: parent,
        transform: { position: vec3(t.position), rotation: vec3(t.rotation), scale: vec3(t.scale, [1, 1, 1]) },
        style: ROOM_STYLES.indexOf(p.style) >= 0 ? p.style : 'meadow', created_at: str(p.created_at, now()) });
    });
    var placeIds = {}; d.places.forEach(function (p) { placeIds[p.id] = true; });
    arr(input.assets).forEach(function (a) {
      if (!a || typeof a !== 'object' || !a.id || seen['a:' + a.id]) return;
      seen['a:' + a.id] = true;
      d.assets.push({ id: String(a.id), type: str(a.type, 'object'), representation: a.representation === 'emoji' ? 'emoji' : 'procedural',
        kind: str(a.kind, 'star'), glyph: str(a.glyph), color: str(a.color), description: str(a.description) });
    });
    var assetIds = {}; d.assets.forEach(function (a) { assetIds[a.id] = true; });
    arr(input.nodes).forEach(function (n, i) {
      if (!n || typeof n !== 'object') return;
      var place = str(n.place_id);
      if (!placeIds[place]) {
        if (!d.places.length) {
          if (!d.worlds.length) { d.worlds.push({ id: fresh('', 'world'), name: 'Lost and found', style: 'grass', transform: { position: [0, 0, 0] }, created_at: now() }); }
          d.places.push({ id: fresh('', 'place'), name: 'Lost and found', type: 'room', parent_id: d.worlds[0].id,
            transform: { position: [14, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, style: 'sand', created_at: now() });
          placeIds[d.places[0].id] = true;
        }
        place = d.places[0].id; problems.push('"' + str(n.title, '?') + '" had no room. Put in ' + d.places[0].name + '.');
      }
      var asset = str(n.asset_id);
      if (!assetIds[asset]) {
        asset = uid('asset'); assetIds[asset] = true;
        d.assets.push({ id: asset, type: 'object', representation: 'procedural', kind: 'star', glyph: '', color: '', description: '' });
        if (n.asset_id) problems.push('"' + str(n.title, '?') + '" lost its object. Gave it a star.');
      }
      var pos = n.transform && n.transform.position;
      d.nodes.push({ id: fresh(n.id, 'node'), type: str(n.type, 'concept'), title: str(n.title, 'Memory ' + (i + 1)),
        description: str(n.description), tags: arr(n.tags).map(String).filter(Boolean),
        question: str(n.question), answer: str(n.answer), parent_id: n.parent_id ? String(n.parent_id) : null,
        place_id: place, asset_id: asset, transform: { position: pos ? vec3(pos) : null },
        created_at: str(n.created_at, now()), updated_at: str(n.updated_at, now()) });
    });
    var nodeIds = {}; d.nodes.forEach(function (n) { nodeIds[n.id] = true; });
    d.nodes.forEach(function (n) { if (n.parent_id && !nodeIds[n.parent_id] && !worldIds[n.parent_id]) n.parent_id = null; });
    var dropped = 0;
    arr(input.relationships).forEach(function (r) {
      if (!r || !nodeIds[r.source] || !nodeIds[r.target] || r.source === r.target) { dropped++; return; }
      d.relationships.push({ id: fresh(r.id, 'rel'), source: r.source, target: r.target,
        type: REL_TYPES.some(function (t) { return t.id === r.type; }) ? r.type : 'related_to',
        strength: Math.max(0, Math.min(1, num(r.strength, 0.5))) });
    });
    if (dropped) problems.push(dropped + ' connection(s) pointed at something missing and were removed.');
    arr(input.recall).forEach(function (r) {
      if (r && nodeIds[r.node_id] && (r.kind === 'what' || r.kind === 'where') && r.at)
        d.recall.push({ id: str(r.id, uid('rec')), node_id: r.node_id, kind: r.kind, result: str(r.result, 'almost'), at: String(r.at) });
    });
    d.routes = arr(input.routes); d.proposals = arr(input.proposals);
    d.updated_at = str(input.updated_at, now());
    // Give a spot to any object that has none.
    var prev = data; data = d;
    d.nodes.forEach(function (n) { if (!n.transform.position) n.transform.position = freeSlot(n.place_id, n.id); });
    data = prev;
    return { data: d, problems: problems };
  }

  /* ---------- lookups ---------- */
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function node(id) { return find(data.nodes, id); }
  function place(id) { return find(data.places, id); }
  function world(id) { return find(data.worlds, id); }
  function asset(id) { return find(data.assets, id); }
  function nodesIn(placeId) { return data.nodes.filter(function (n) { return n.place_id === placeId; }); }
  function roomsIn(worldId) { return data.places.filter(function (p) { return p.parent_id === worldId; }); }
  function relsOf(id) { return data.relationships.filter(function (r) { return r.source === id || r.target === id; }); }
  function tierFor(count) { var t = 0; TIERS.forEach(function (x, i) { if (count >= x.min) t = i; }); return t; }
  function relLabel(type) { var t = find(REL_TYPES, type); return t ? t.label : 'goes with'; }

  /* A free spot inside a room, as a position relative to the room's middle. */
  function freeSlot(placeId, ignoreId) {
    var others = data.nodes.filter(function (n) { return n.place_id === placeId && n.id !== ignoreId && n.transform.position; });
    var half = TIERS[tierFor(others.length + 1)].half, lim = half - 1.1, step = 2, slots = [];
    for (var x = -Math.floor(lim / step) * step; x <= lim; x += step)
      for (var z = -Math.floor(lim / step) * step; z <= lim; z += step) slots.push([x, 0, z]);
    // Edge spots first, like a gallery; the middle stays open to walk through.
    slots.sort(function (a, b) { return Math.max(Math.abs(b[0]), Math.abs(b[2])) - Math.max(Math.abs(a[0]), Math.abs(a[2])) || a[2] - b[2] || a[0] - b[0]; });
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i], taken = others.some(function (n) {
        var p = n.transform.position; return Math.abs(p[0] - s[0]) < 1.4 && Math.abs(p[2] - s[2]) < 1.4;
      });
      if (!taken) return s;
    }
    return [(Math.random() - 0.5) * lim, 0, (Math.random() - 0.5) * lim];
  }

  /* ---------- change, undo, redo ---------- */
  function emit(why) { listeners.forEach(function (fn) { try { fn(why); } catch (e) { MP.logError && MP.logError('listener: ' + e.message); } }); }
  function persist() { data.updated_at = now(); if (MP.store) MP.store.set(MP.palaces ? MP.palaces.key() : MP.KEYS.palace, data); }
  function commit(label, fn) {
    var before = JSON.stringify(data);
    var out = fn(data);
    if (JSON.stringify(data) === before) return out;
    undoStack.push({ label: label, snap: before });
    if (undoStack.length > HISTORY_MAX) undoStack.shift();
    redoStack = [];
    persist(); emit(label);
    return out;
  }
  function swap(from, to) {
    if (!from.length) return null;
    var step = from.pop(), recall = data.recall;         // practice history is never undone
    to.push({ label: step.label, snap: JSON.stringify(data) });
    data = JSON.parse(step.snap); data.recall = recall;
    persist(); emit('undo'); return step.label;
  }
  function load(input, keepHistory) {
    var v = validate(input);
    if (keepHistory && data) { undoStack.push({ label: 'load', snap: JSON.stringify(data) }); redoStack = []; }
    else { undoStack = []; redoStack = []; }
    data = v.data; persist(); emit('load');
    return v.problems;
  }

  /* ---------- editing ---------- */
  function addWorld(name, style) {
    return commit('add world', function (d) {
      var k = d.worlds.length, pos = [0, 0, 0];
      if (k) { var a = (k - 1) * Math.PI / 3, r = 58 + 58 * Math.floor((k - 1) / 6); pos = [Math.round(Math.cos(a) * r), [3, -2, 5, 1, -3, 4][(k - 1) % 6], Math.round(Math.sin(a) * r)]; }
      var w = { id: uid('world'), name: name || 'New world', style: style || WORLD_STYLES[k % WORLD_STYLES.length], transform: { position: pos }, created_at: now() };
      d.worlds.push(w); return w;
    });
  }
  function addRoom(worldId, name, style) {
    return commit('add room', function (d) {
      var w = world(worldId); if (!w) return null;
      var rooms = roomsIn(worldId), wp = w.transform.position, pos = null;
      for (var k = 0; k < 40 && !pos; k++) {
        var ring = Math.floor(k / 5), a = (k % 5) * Math.PI * 2 / 5 + ring * 0.63 + 0.5, r = 14 + ring * 15;
        var c = [wp[0] + Math.cos(a) * r, wp[1], wp[2] + Math.sin(a) * r];
        var clash = rooms.some(function (p) { var q = p.transform.position; return Math.abs(q[0] - c[0]) < 12 && Math.abs(q[2] - c[2]) < 12; });
        if (!clash) pos = c.map(function (v) { return Math.round(v * 10) / 10; });
      }
      var p = { id: uid('place'), name: name || 'New room', type: 'room', parent_id: worldId,
        transform: { position: pos || [wp[0], wp[1], wp[2] + 14], rotation: [0, 0, 0], scale: [1, 1, 1] },
        style: style || ROOM_STYLES[d.places.length % ROOM_STYLES.length], created_at: now() };
      d.places.push(p); return p;
    });
  }
  function cleanTags(t) {
    if (typeof t === 'string') t = t.split(/[,;#]+/);
    return arr(t).map(function (s) { return String(s).trim().toLowerCase(); }).filter(Boolean);
  }
  function addNode(f) {
    return commit('add memory', function (d) {
      if (!place(f.place_id)) return null;
      var a = { id: uid('asset'), type: 'object', representation: f.glyph ? 'emoji' : 'procedural', kind: f.kind || 'star', glyph: f.glyph || '', color: f.color || '', description: '' };
      d.assets.push(a);
      var n = { id: uid('node'), type: f.type || 'concept', title: f.title || 'New memory', description: f.description || '', tags: cleanTags(f.tags),
        question: f.question || '', answer: f.answer || '', parent_id: f.parent_id || null, place_id: f.place_id, asset_id: a.id,
        transform: { position: null }, created_at: now(), updated_at: now() };
      n.transform.position = freeSlot(f.place_id, n.id);
      d.nodes.push(n); return n;
    });
  }
  function updateNode(id, f) {
    return commit('edit memory', function () {
      var n = node(id); if (!n) return null;
      ['title', 'description', 'question', 'answer', 'type'].forEach(function (k) { if (k in f) n[k] = String(f[k]); });
      if ('tags' in f) n.tags = cleanTags(f.tags);
      if ('parent_id' in f) n.parent_id = f.parent_id && f.parent_id !== id ? f.parent_id : null;
      if ('place_id' in f && f.place_id !== n.place_id && place(f.place_id)) { n.place_id = f.place_id; n.transform.position = freeSlot(f.place_id, id); }
      var a = asset(n.asset_id);
      if (a) {
        if ('kind' in f) a.kind = f.kind;
        if ('color' in f) a.color = f.color;
        if ('glyph' in f) { a.glyph = f.glyph; a.representation = f.glyph ? 'emoji' : 'procedural'; }
      }
      n.updated_at = now(); return n;
    });
  }
  function removeNode(id) {
    return commit('remove memory', function (d) {
      var n = node(id); if (!n) return;
      d.nodes = d.nodes.filter(function (x) { return x.id !== id; });
      d.assets = d.assets.filter(function (a) { return a.id !== n.asset_id; });
      d.relationships = d.relationships.filter(function (r) { return r.source !== id && r.target !== id; });
      d.nodes.forEach(function (x) { if (x.parent_id === id) x.parent_id = null; });
      d.recall = d.recall.filter(function (r) { return r.node_id !== id; });
    });
  }
  function updateRoom(id, f) {
    return commit('edit room', function () {
      var p = place(id); if (!p) return null;
      if ('name' in f) p.name = String(f.name);
      if ('style' in f && ROOM_STYLES.indexOf(f.style) >= 0) p.style = f.style;
      if ('parent_id' in f && world(f.parent_id) && f.parent_id !== p.parent_id) {
        var from = world(p.parent_id).transform.position, to = world(f.parent_id).transform.position;
        p.parent_id = f.parent_id;
        p.transform.position = [p.transform.position[0] - from[0] + to[0], p.transform.position[1] - from[1] + to[1], p.transform.position[2] - from[2] + to[2]];
      }
      if ('level' in f) { var w = world(p.parent_id); p.transform.position[1] = w.transform.position[1] + Math.max(0, Math.min(6, num(f.level, 0))) * 3; }
      return p;
    });
  }
  function roomLevel(p) { var w = world(p.parent_id); return Math.round((p.transform.position[1] - (w ? w.transform.position[1] : 0)) / 3); }
  /* A room can only be removed when it is empty, so no memory is ever lost with it. */
  function removeRoom(id) {
    if (nodesIn(id).length) return false;
    commit('remove room', function (d) { d.places = d.places.filter(function (p) { return p.id !== id; }); });
    return true;
  }
  function updateWorld(id, f) {
    return commit('edit world', function () {
      var w = world(id); if (!w) return null;
      if ('name' in f) w.name = String(f.name);
      if ('style' in f && WORLD_STYLES.indexOf(f.style) >= 0) w.style = f.style;
      return w;
    });
  }
  function removeWorld(id) {
    if (roomsIn(id).length) return false;
    commit('remove world', function (d) {
      d.worlds = d.worlds.filter(function (w) { return w.id !== id; });
      d.nodes.forEach(function (n) { if (n.parent_id === id) n.parent_id = null; });
    });
    return true;
  }
  function connect(a, b, type, strength) {
    if (a === b || !node(a) || !node(b)) return null;
    return commit('connect', function (d) {
      var old = d.relationships.filter(function (r) { return (r.source === a && r.target === b) || (r.source === b && r.target === a); })[0];
      if (old) { old.type = type || old.type; old.source = a; old.target = b; return old; }
      var r = { id: uid('rel'), source: a, target: b, type: type || 'related_to', strength: strength == null ? 0.6 : strength };
      d.relationships.push(r); return r;
    });
  }
  function disconnect(relId) { commit('disconnect', function (d) { d.relationships = d.relationships.filter(function (r) { return r.id !== relId; }); }); }
  function moveNode(id, placeId, local) {
    return commit('move memory', function () {
      var n = node(id); if (!n || !place(placeId)) return;
      n.place_id = placeId; n.transform.position = [Math.round(local[0] * 100) / 100, 0, Math.round(local[2] * 100) / 100]; n.updated_at = now();
    });
  }
  function moveRoom(id, pos) {
    return commit('move room', function () {
      var p = place(id); if (!p) return;
      p.transform.position = [Math.round(pos[0] * 10) / 10, p.transform.position[1], Math.round(pos[2] * 10) / 10];
    });
  }
  function moveWorld(id, pos) {
    return commit('move world', function () {
      var w = world(id); if (!w) return;
      var dx = pos[0] - w.transform.position[0], dz = pos[2] - w.transform.position[2];
      w.transform.position = [Math.round(pos[0]), w.transform.position[1], Math.round(pos[2])];
      roomsIn(id).forEach(function (p) { p.transform.position[0] += dx; p.transform.position[2] += dz; });
    });
  }

  /* ---------- search (works with no 3-D at all) ---------- */
  var STOP = {}; ('a an the of in on at to is are was were be do did does i me my we our you your it its and or for with about from ' +
    'where what which when who how put keep kept find idea ideas thing things that this there have has had').split(' ').forEach(function (w) { STOP[w] = 1; });
  function words(s) { return String(s || '').toLowerCase().split(/[^a-z0-9À-￿]+/).filter(Boolean); }
  function scoreText(text, tok, weight) {
    var ws = words(text), best = 0;
    for (var i = 0; i < ws.length; i++) {
      if (ws[i] === tok) { best = 1; break; }
      if (ws[i].indexOf(tok) === 0) best = Math.max(best, 0.8);
      else if (tok.length >= 3 && ws[i].indexOf(tok) > 0) best = Math.max(best, 0.5);
    }
    return best * weight;
  }
  function search(q) {
    var toks = words(q), keep = toks.filter(function (t) { return !STOP[t] && t.length > 1; });
    if (!keep.length) keep = toks.filter(function (t) { return t.length > 1; });
    if (!keep.length) return [];
    var out = [];
    data.nodes.forEach(function (n) {
      var p = place(n.place_id), w = p && world(p.parent_id), a = asset(n.asset_id), total = 0, hit = 0, why = {};
      keep.forEach(function (t) {
        var parts = [['name', scoreText(n.title, t, 5)], ['tag', scoreText(n.tags.join(' '), t, 4)], ['words', scoreText(n.description + ' ' + n.question + ' ' + n.answer, t, 2)],
          ['room', scoreText(p && p.name, t, 2)], ['world', scoreText(w && w.name, t, 1)], ['object', scoreText(a && a.kind, t, 1)]];
        var s = 0; parts.forEach(function (x) { if (x[1] > 0) { s += x[1]; why[x[0]] = 1; } });
        if (s > 0) hit++; total += s;
      });
      if (total > 0) out.push({ type: 'node', id: n.id, title: n.title, sub: (p ? p.name : '?') + (w ? ' · ' + w.name : ''), score: total * (hit / keep.length), why: Object.keys(why) });
    });
    data.places.forEach(function (p) {
      var s = 0; keep.forEach(function (t) { s += scoreText(p.name, t, 3); });
      var w = world(p.parent_id);
      if (s > 0) out.push({ type: 'place', id: p.id, title: p.name, sub: 'a room in ' + (w ? w.name : '?'), score: s, why: ['room'] });
    });
    data.worlds.forEach(function (w) {
      var s = 0; keep.forEach(function (t) { s += scoreText(w.name, t, 2.5); });
      if (s > 0) out.push({ type: 'world', id: w.id, title: w.name, sub: 'a world', score: s, why: ['world'] });
    });
    out.sort(function (a, b) { return b.score - a.score || (a.title < b.title ? -1 : 1); });
    return out.slice(0, 12);
  }

  /* ---------- practice ----------
     Two kinds are kept apart on purpose:
       what  = standing at the object, can I say what it holds?   (real recall)
       where = given the name, can I point to its room?            (knowing the place) */
  function recallState(nodeId, kind, at) {
    var t = at || Date.now(), box = 0, last = 0, count = 0;
    data.recall.forEach(function (r) {
      if (r.node_id !== nodeId || r.kind !== kind) return;
      count++; last = Math.max(last, Date.parse(r.at) || 0);
      if (r.result === 'knew') box = Math.min(5, box + 1); else if (r.result === 'forgot') box = 0;
    });
    var due = count ? last + INTERVAL_DAYS[box] * DAY : 0;
    return { box: box, count: count, last: last, due: due, isDue: due <= t, isNew: !count };
  }
  function record(nodeId, kind, result) {
    if (!node(nodeId)) return;
    data.recall.push({ id: uid('rec'), node_id: nodeId, kind: kind, result: result, at: now() });
    persist(); emit('recall');
  }
  /* The next things to practise: the most overdue first, then the never-practised, then the oldest. */
  function practiceList(kind, max, at) {
    var t = at || Date.now();
    var all = data.nodes.map(function (n) { var s = recallState(n.id, kind, t); return { id: n.id, s: s }; });
    var due = all.filter(function (x) { return x.s.isDue; }).sort(function (a, b) { return (a.s.isNew ? 1 : 0) - (b.s.isNew ? 1 : 0) || a.s.due - b.s.due; });
    var rest = all.filter(function (x) { return !x.s.isDue; }).sort(function (a, b) { return a.s.due - b.s.due; });
    return { due: due.length, list: due.concat(rest).slice(0, max || 5).map(function (x) { return x.id; }) };
  }

  MP.Model = {
    SCHEMA: SCHEMA, TIERS: TIERS, REL_TYPES: REL_TYPES, ROOM_STYLES: ROOM_STYLES, WORLD_STYLES: WORLD_STYLES, INTERVAL_DAYS: INTERVAL_DAYS,
    get data() { return data; },
    empty: empty, validate: validate, load: load, uid: uid, clone: clone,
    onChange: function (fn) { listeners.push(fn); },
    undo: function () { return swap(undoStack, redoStack); }, redo: function () { return swap(redoStack, undoStack); },
    canUndo: function () { return undoStack.length > 0; }, canRedo: function () { return redoStack.length > 0; },
    node: node, place: place, world: world, asset: asset, nodesIn: nodesIn, roomsIn: roomsIn, relsOf: relsOf,
    tierFor: tierFor, relLabel: relLabel, roomLevel: roomLevel, freeSlot: freeSlot,
    addWorld: addWorld, addRoom: addRoom, addNode: addNode, updateNode: updateNode, removeNode: removeNode,
    updateRoom: updateRoom, removeRoom: removeRoom, updateWorld: updateWorld, removeWorld: removeWorld,
    connect: connect, disconnect: disconnect, moveNode: moveNode, moveRoom: moveRoom, moveWorld: moveWorld,
    search: search, recallState: recallState, record: record, practiceList: practiceList
  };
})();
