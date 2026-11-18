/* Mind Palace: the splat page. It reads the same palace as the Build page and draws it with Gaussian splats.
   database (model.js) -> layout (layout.js) -> shapes (scene.js) -> splats (gauss.js) -> picture (splatview.js) */
(function () {
  'use strict';
  var MP = window.MP, M = MP.Model, L = MP.Layout, S = MP.Splat, esc = MP.esc;
  var $ = function (id) { return document.getElementById(id); };
  var BUDGET = { low: 80000, medium: 170000, high: 300000 }, FOV = 48 * Math.PI / 180, NEAR_TO_READ = 3.4;

  var desc = null, scene = null, signs = [], gauss = null, ok = true;
  var cam = { target: [0, 0, 0], yaw: 0.6, pitch: 0.8, dist: 120 }, goal = { target: [0, 0, 0], yaw: 0.6, pitch: 0.8, dist: 120 }, eye = [0, 0, 0];
  var av = { pos: [0, MP.Scene.FLOOR, 4.5], heading: 0, travel: null, input: [0, 0], bob: 0 };
  var follow = false, walk = false, wander = null, dirty = true, lastT = 0, near = null, nearOpen = false, results = [], selected = null, cssW = 1, cssH = 1;

  var toastTimer = 0;
  function toast(msg, ms) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  function emojiOf(asset) {
    if (!asset) return '⭐';
    if (asset.representation === 'emoji' && asset.glyph) return asset.glyph;
    var k = MP.objectShapes.kinds[asset.kind]; return k ? k.emoji : '⭐';
  }

  /* ---------- build the splats ---------- */
  function fuzzOf(shape) {
    var g = MP.settings.fuzz / 100;
    if (shape.pick && M.node(shape.pick)) {
      if (!MP.settings.fuzzByPractice) return g * 0.8;
      return g * (0.1 + 0.9 * (5 - M.recallState(shape.pick, 'what').box) / 5);       // practised = sharp, never practised = vague
    }
    return g * 0.3;
  }
  function rebuild() {
    desc = L.build(M.data);
    scene = MP.Scene.build(desc, MP.objectShapes);
    var deco = MP.Scene.decorate(desc);                 // trees, and the things that move
    motions = deco.motions;
    var meShapes = MP.Scene.avatar(); meShapes.forEach(function (sh) { sh.group = 1; });   // little-me is block 1
    var world = MP.Gauss.build(scene.shapes.concat(deco.shapes), { budget: BUDGET[MP.settings.quality] || BUDGET.medium, fuzzOf: fuzzOf,
      // Memory objects get the most splats, moving things many, rooms the usual amount, the big islands fewer.
      detailOf: function (sh) { if (sh.group > 1) return 3; return sh.pick && M.node(sh.pick) ? 5 : sh.pick && M.world(sh.pick) ? 0.3 : 1; } });
    var me = MP.Gauss.build(meShapes, { budget: 6000, density: 1600, seed: 7 });
    gauss = MP.Gauss.join(world, me);
    if (ok) S.setData(gauss);
    buildSigns(); dirty = true;
    $('howNumbers').textContent = 'This palace is ' + gauss.n.toLocaleString() + ' blobs made from ' + scene.shapes.length + ' simple shapes.';
    $('aboutLine').textContent = 'Mind Palace ' + MP.VERSION + ' · ' + M.data.worlds.length + ' worlds, ' + M.data.places.length + ' rooms, ' + M.data.nodes.length + ' memories.';
    $('whose').textContent = MP.palaces.current().name.toUpperCase();
  }
  function buildSigns() {
    var box = $('signs'); box.textContent = ''; signs = [];
    scene.signs.forEach(function (s) {
      var el = document.createElement('div'); el.className = 'sign ' + s.kind; el.textContent = s.text; box.appendChild(el);
      el.style.display = 'none';
      signs.push({ el: el, kind: s.kind, id: s.id, pos: s.pos, w: 0, shown: false });
    });
  }

  /* ---------- little-me ---------- */
  function goTo(id, after) {
    if (!desc.byId[id]) return;
    selected = id;
    var from = [av.pos[0], av.pos[1] - MP.Scene.FLOOR, av.pos[2]], route = L.route(desc, from, id), len = L.routeLength(route);
    if (route.length < 2) { if (after) after(); return; }
    av.travel = { pts: route, i: 1, speed: Math.max({ slow: 5, normal: 8, fast: 14 }[MP.settings.speed] || 8, len / 9), done: after, face: id };
    follow = true; goal.dist = Math.min(Math.max(goal.dist, 8), 13); goal.pitch = Math.max(0.4, Math.min(goal.pitch, 0.75)); cam.dist = Math.min(cam.dist, 60);
    MP.sound('go');
  }
  function stepAvatar(dt) {
    var moved = false, F = MP.Scene.FLOOR;
    if (av.travel) {
      var tr = av.travel, left = tr.speed * dt;
      while (left > 0 && tr.i < tr.pts.length) {
        var to = tr.pts[tr.i], dx = to[0] - av.pos[0], dy = to[1] + F - av.pos[1], dz = to[2] - av.pos[2], d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (Math.abs(dx) + Math.abs(dz) > 0.001) av.heading = Math.atan2(dx, dz);
        if (d <= left) { av.pos = [to[0], to[1] + F, to[2]]; left -= d; tr.i++; }
        else { av.pos = [av.pos[0] + dx / d * left, av.pos[1] + dy / d * left, av.pos[2] + dz / d * left]; left = 0; }
      }
      moved = true;
      if (tr.i >= tr.pts.length) {
        av.travel = null;
        var f = desc.byId[tr.face];
        if (f && f.roomId) { av.heading = Math.atan2(f.pos[0] - av.pos[0], f.pos[2] - av.pos[2]); var r = desc.byId[f.roomId]; goal.yaw = nearestTurn(Math.atan2(r.side[0], r.side[1]) + 0.35); goal.pitch = 0.62; goal.dist = 9; }
        MP.sound('arrive'); if (tr.done) tr.done();
      }
    } else if (walk && (av.input[0] || av.input[1])) {
      var fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
      var mx = fx * -av.input[1] + rx * av.input[0], mz = fz * -av.input[1] + rz * av.input[0], ml = Math.sqrt(mx * mx + mz * mz) || 1, sp = 6.5 * Math.min(1, ml);
      av.pos[0] += mx / ml * sp * dt; av.pos[2] += mz / ml * sp * dt; av.heading = Math.atan2(mx, mz);
      var gy = L.groundAt(desc, av.pos[0], av.pos[2], av.pos[1] - F);
      if (gy != null) av.pos[1] += (gy + F - av.pos[1]) * Math.min(1, dt * 10);
      moved = true;
    }
    av.bob += dt * (moved ? 11 : 0);
    if (moved) dirty = true;
    return moved;
  }

  /* ---------- the pop-up when little-me is near a memory ---------- */
  function findNear() {
    var best = null, bd = NEAR_TO_READ, chosen = selected && desc.byId[selected];
    // The memory little-me was sent to wins while little-me still stands by it.
    if (chosen && chosen.roomId && Math.hypot(chosen.pos[0] - av.pos[0], chosen.pos[2] - av.pos[2]) < 2.4) return selected;
    desc.objects.forEach(function (o) {
      if (Math.abs(o.pos[1] - (av.pos[1] - MP.Scene.FLOOR)) > 1.5) return;
      var d = Math.hypot(o.pos[0] - av.pos[0], o.pos[2] - av.pos[2]); if (d < bd) { bd = d; best = o.id; }
    });
    return best;
  }
  function renderBubble() {
    var b = $('bubble');
    if (!near || !M.node(near)) { b.hidden = true; MP.Notes.setContext({ page: 'index.html', item: '', label: 'Whole palace (splats)' }); return; }
    var n = M.node(near), a = M.asset(n.asset_id), p = M.place(n.place_id), w = p && M.world(p.parent_id);
    var first = (n.description || '').split(/(?<=[.!?])\s/)[0] || '';
    var html = '<h2><span>' + esc(emojiOf(a)) + '</span>' + esc(n.title) + '</h2>';
    if (!nearOpen) html += (first ? '<p>' + esc(first) + '</p>' : '') + '<div class="rowBtns"><button class="btn sun small" type="button" data-b="more">📖 Read more</button></div>';
    else {
      var topic = n.parent_id ? (M.world(n.parent_id) ? M.world(n.parent_id).name : (M.node(n.parent_id) || {}).title) : null;
      html += (n.description ? '<p>' + esc(n.description) + '</p>' : '') +
        (n.question ? '<details><summary>🤔 ' + esc(n.question) + '</summary><p class="answer">' + esc(n.answer || n.description) + '</p></details>' : '') +
        (n.tags.length ? '<div class="tags">' + n.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<p class="meta">🚪 Lives in <b>' + esc(p ? p.name : '?') + '</b>' + (w ? ', ' + esc(w.name) : '') + '<br>🗂️ Belongs to <b>' + esc(topic || 'no topic yet') + '</b></p>';
      var rels = M.relsOf(n.id);
      if (rels.length) html += '<ul class="links">' + rels.map(function (r) {
        var out = r.source === n.id, other = M.node(out ? r.target : r.source);
        return '<li><button type="button" class="item" data-go="' + esc(other.id) + '"><small>' + (out ? esc(M.relLabel(r.type)) + ' →' : '← ' + esc(M.relLabel(r.type))) + '</small><b>' + esc(emojiOf(M.asset(other.asset_id))) + ' ' + esc(other.title) + '</b></button></li>';
      }).join('') + '</ul>';
      html += '<div class="rowBtns"><button class="btn small" type="button" data-b="less">Close</button></div>';
    }
    b.innerHTML = html; b.hidden = false;
    MP.Notes.setContext({ page: 'index.html', item: n.id, label: 'Memory (splats): ' + n.title });
  }
  function updateNear() {
    var id = av.travel && !wander ? null : findNear();
    if (id !== near) { near = id; nearOpen = false; renderBubble(); if (id) MP.sound('tap'); }
  }

  /* ---------- wander: little-me visits every memory once ---------- */
  function setWander(on) {
    $('bar').querySelector('[data-act=wander]').setAttribute('aria-pressed', String(on));
    if (!on) { if (wander) { clearTimeout(wander.timer); wander = null; av.travel = null; } return; }
    if (!desc.objects.length) return toast('Nothing to visit yet. Add memories in Build.');
    setWalk(false);
    wander = { ids: desc.objects.map(function (o) { return o.id; }), i: 0, timer: 0 };
    toast('Wandering past every memory. Tap anywhere to stop.', 3200);
    (function next() {
      if (!wander) return;
      if (wander.i >= wander.ids.length) { setWander(false); toast('That was every memory.'); return; }
      goTo(wander.ids[wander.i++], function () { if (wander) wander.timer = setTimeout(next, 4200); });
    })();
  }
  function setWalk(on) {
    walk = on; $('bar').querySelector('[data-act=walk]').setAttribute('aria-pressed', String(on)); $('stick').hidden = !on;
    if (on) { follow = true; goal.dist = Math.min(goal.dist, 9); goal.pitch = Math.min(goal.pitch, 0.6); } else av.input = [0, 0];
  }

  /* ---------- camera ---------- */
  function nearestTurn(yaw) { while (yaw - goal.yaw > Math.PI) yaw -= Math.PI * 2; while (yaw - goal.yaw < -Math.PI) yaw += Math.PI * 2; return yaw; }
  function frameAll() {
    if (!desc.worlds.length) return;
    var c = [0, 0, 0], R = 0;
    desc.worlds.forEach(function (w) { c[0] += w.pos[0] / desc.worlds.length; c[1] += w.pos[1] / desc.worlds.length; c[2] += w.pos[2] / desc.worlds.length; });
    desc.worlds.forEach(function (w) { R = Math.max(R, Math.hypot(w.pos[0] - c[0], w.pos[2] - c[2]) + w.radius); });
    goal.target = c; goal.dist = R * 2.05 / Math.min(1, cssW / cssH); goal.pitch = 0.8; follow = false; dirty = true;
  }
  function stepCamera(dt) {
    // On a phone the pop-up covers the lower half, so look a little below little-me to lift the scene above it.
    if (follow) goal.target = [av.pos[0], av.pos[1] + 1.15 - (near && cssW <= 760 ? goal.dist * 0.26 : 0), av.pos[2]];
    goal.dist = Math.max(follow ? 2.2 : 2.5, Math.min(700, goal.dist)); goal.pitch = Math.max(0.08, Math.min(1.5, goal.pitch));
    var k = 1 - Math.exp(-dt * 7), kt = follow ? 1 - Math.exp(-dt * 12) : k, before = cam.yaw + cam.pitch + cam.dist + cam.target[0] + cam.target[1] + cam.target[2];
    for (var i = 0; i < 3; i++) cam.target[i] += (goal.target[i] - cam.target[i]) * kt;
    cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k;
    if (Math.abs(cam.yaw + cam.pitch + cam.dist + cam.target[0] + cam.target[1] + cam.target[2] - before) > 1e-4) dirty = true;
    var cp = Math.cos(cam.pitch);
    eye = [cam.target[0] + cam.dist * cp * Math.sin(cam.yaw), cam.target[1] + cam.dist * Math.sin(cam.pitch), cam.target[2] + cam.dist * cp * Math.cos(cam.yaw)];
    S.lookAt(eye, cam.target);
  }
  function placeSigns() {
    var showTags = MP.settings.labels !== 'off';
    signs.forEach(function (s) {
      var p = S.toScreen(s.pos, cssW, cssH), on = !!p && p.x > -80 && p.x < cssW + 80 && p.y > -40 && p.y < cssH + 40;
      // Names fade with the fog too: no name for a place little-me cannot see.
      if (on && MP.settings.fog && Math.hypot(s.pos[0] - av.pos[0], s.pos[2] - av.pos[2]) > fogRadius() * 0.9) on = false;
      if (on && s.kind === 'node') on = showTags && p.d < 34;
      if (on && s.kind === 'emoji') on = p.d < 90;
      if (on && s.kind === 'room') on = p.d < 150;
      s.screen = on ? p : null;
      if (!on) { if (s.shown) { s.el.style.display = 'none'; s.shown = false; } return; }
      if (!s.shown) { s.el.style.display = ''; s.shown = true; }
      if (!s.w) { s.w = s.el.offsetWidth; s.h = s.el.offsetHeight; }
      var scale = s.kind === 'emoji' ? Math.max(0.35, Math.min(2.2, 14 / p.d)) : 1;
      s.el.style.transform = 'translate(' + (p.x - s.w / 2).toFixed(1) + 'px,' + (p.y - s.h / 2).toFixed(1) + 'px) scale(' + scale.toFixed(2) + ')';
    });
  }

  /* ---------- pointers ---------- */
  var pointers = {}, gesture = null, canvas;
  function count() { return Object.keys(pointers).length; }
  function pinch() { var k = Object.keys(pointers), a = pointers[k[0]], b = pointers[k[1]]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
  function pan(dx, dy) {
    var s = goal.dist * 0.0016, fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
    goal.target = [goal.target[0] + (-dx * rx + dy * fx) * s, goal.target[1], goal.target[2] + (-dx * rz + dy * fz) * s];
    if (!walk) follow = false;
  }
  function onDown(e) {
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (wander) setWander(false);
    if (count() === 1) gesture = { type: 'orbit', x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, pan: e.button === 2 || e.shiftKey };
    else if (count() === 2) gesture = { type: 'pinch', moved: true, last: pinch() };
  }
  function onMove(e) {
    var p = pointers[e.pointerId]; if (!p || !gesture) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (gesture.type === 'pinch' && count() >= 2) { var now = pinch(); goal.dist *= gesture.last.d / now.d; pan(now.mx - gesture.last.mx, now.my - gesture.last.my); gesture.last = now; return; }
    if (!gesture.moved && Math.hypot(e.clientX - gesture.x0, e.clientY - gesture.y0) < 8) return;
    gesture.moved = true;
    if (gesture.pan) pan(dx, dy); else { goal.yaw -= dx * 0.0065; goal.pitch += dy * 0.005; }
  }
  function onUp(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    var g = gesture; gesture = count() ? { type: 'orbit', x0: 0, y0: 0, moved: true } : null;
    if (g && !g.moved && e.type === 'pointerup' && performance.now() - g.t0 < 600) tap(e.clientX, e.clientY);
  }
  /* A tap walks little-me to the memory under the finger, or (in Walk) to that spot on the floor. */
  function tap(x, y) {
    var best = null, bd = 46;
    desc.objects.forEach(function (o) {
      var p = S.toScreen([o.pos[0], o.pos[1] + 1.1, o.pos[2]], cssW, cssH); if (!p) return;
      var d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = o.id; }
    });
    if (best) { goTo(best); return; }
    if (!walk) return;
    var r = S.ray(x, y, cssW, cssH, eye), floor = av.pos[1] - MP.Scene.FLOOR; if (r.d[1] > -0.02) return;
    var t = (floor - r.o[1]) / r.d[1], hit = [r.o[0] + r.d[0] * t, floor, r.o[2] + r.d[2] * t], gy = L.groundAt(desc, hit[0], hit[2], floor);
    if (t > 0 && t < 400) av.travel = { pts: [[av.pos[0], floor, av.pos[2]], [hit[0], gy == null ? floor : gy, hit[2]]], i: 1, speed: 8 };
  }

  /* ---------- search ---------- */
  function runSearch(go) {
    var q = $('q').value.trim(), list = $('results');
    results = q ? M.search(q).filter(function (r) { return r.type === 'node'; }) : [];
    list.hidden = !results.length || go;
    list.innerHTML = results.map(function (r) { return '<li><button type="button" class="item" data-go="' + esc(r.id) + '"><b>' + esc(emojiOf(M.asset(M.node(r.id).asset_id))) + ' ' + esc(r.title) + '</b><small>' + esc(r.sub) + '</small></button></li>'; }).join('');
    if (!go) return;
    if (!results.length) return toast(q ? 'Nothing found for “' + q + '”' : 'Type a word first.');
    toast('Going to “' + results[0].title + '”' + (results.length > 1 ? ' (1 of ' + results.length + ' found)' : ''));
    goTo(results[0].id);
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    document.querySelectorAll('.drawer .seg').forEach(function (seg) {
      var v = String(MP.settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    });
    $('fuzz').value = MP.settings.fuzz; $('fuzzVal').textContent = MP.settings.fuzz;
    $('sight').value = MP.settings.sight; $('sightVal').textContent = MP.settings.sight < 25 ? 'near' : MP.settings.sight > 75 ? 'far' : 'middle';
    $('showErrors').checked = !!MP.settings.showErrors; renderErrors();
    var cur = MP.palaces.current();
    $('palacePick').innerHTML = MP.palaces.list().map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === cur.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
  }
  function renderErrors() { var box = $('errorsPanel'); box.hidden = !MP.settings.showErrors; box.textContent = MP.errors.length ? MP.errors.join('\n') : 'No problems so far.'; }
  function loadPalace() {
    var saved = MP.palaces.load();
    M.load(saved && saved.worlds ? saved : (MP.palaces.list().length === 1 ? MP.sample() : M.empty())).forEach(function (p) { MP.logError('repair: ' + p); });
  }
  var fuzzTimer = 0;
  function initGear() {
    var gear = $('gear'), drawer = $('drawer');
    function setOpen(open) { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); }
    gear.addEventListener('click', function () { setOpen(drawer.hidden); });
    $('closeDrawer').addEventListener('click', function () { setOpen(false); });
    $('pill').addEventListener('click', function () { setOpen(true); });
    document.querySelectorAll('.drawer .seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.parentElement.dataset.key, v = b.dataset.v; MP.settings[key] = (v === '0' || v === '1') ? +v : v;
        MP.saveSettings(); renderSettings(); MP.sound('tap');
        if (key === 'quality' || key === 'fuzzByPractice') { resize(); rebuild(); } else dirty = true;
      });
    });
    $('fuzz').addEventListener('input', function (e) {
      MP.settings.fuzz = +e.target.value; $('fuzzVal').textContent = MP.settings.fuzz; MP.saveSettings();
      clearTimeout(fuzzTimer); fuzzTimer = setTimeout(rebuild, 120);
    });
    $('sight').addEventListener('input', function (e) {
      MP.settings.sight = +e.target.value; $('sightVal').textContent = MP.settings.sight < 25 ? 'near' : MP.settings.sight > 75 ? 'far' : 'middle'; MP.saveSettings(); dirty = true;
    });
    $('palacePick').addEventListener('change', function (e) {
      MP.palaces.choose(e.target.value); setWander(false); near = null; renderBubble(); loadPalace(); rebuild(); home(); frameAll(); toast('This is ' + MP.palaces.current().name + '.');
    });
    $('showErrors').addEventListener('change', function (e) { MP.settings.showErrors = e.target.checked; MP.saveSettings(); renderErrors(); });
    $('plyBtn').addEventListener('click', function () {
      var blob = new Blob([MP.Gauss.toPly(gauss, gauss.split)], { type: 'application/octet-stream' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'mind-palace-splats.ply'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); toast('Saved ' + gauss.split.toLocaleString() + ' splats.');
    });
    MP.onError = renderErrors;
    window.addEventListener('error', function (e) { MP.logError(e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '')); });
    renderSettings();
  }

  /* ---------- moving things: each motion moves one block of splats rigidly, on a loop ---------- */
  var clock = 0, motions = [];
  function rx(a) { var c = Math.cos(a), sn = Math.sin(a); return [1, 0, 0, 0, c, sn, 0, -sn, c]; }
  function ry(a) { var c = Math.cos(a), sn = Math.sin(a); return [c, 0, -sn, 0, 1, 0, sn, 0, c]; }
  function rz(a) { var c = Math.cos(a), sn = Math.sin(a); return [c, sn, 0, -sn, c, 0, 0, 0, 1]; }
  function rot(axis, a) { return axis === 'x' ? rx(a) : axis === 'y' ? ry(a) : rz(a); }
  function mv(R, v) { return [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]]; }
  /* How far little-me can see. Zooming out widens the view, so the whole palace can still be looked over. */
  function fogRadius() { return MP.settings.fog ? 12 + MP.settings.sight * 0.9 + cam.dist * 0.7 : 0; }   // doubled in 0.3.1
  /* Where every block is this frame. Each motion is periodic, so it loops exactly. */
  function blockMats() {
    var out = [], t = clock, bob = Math.abs(Math.sin(av.bob)) * 0.07;
    out[1] = { R: ry(av.heading), P: [av.pos[0], av.pos[1] + bob, av.pos[2]] };       // little-me
    motions.forEach(function (m) {
      var ph = 2 * Math.PI * t / m.period + (m.phase || 0), R, P;
      if (m.type === 'spin') { R = rot(m.axis, ph); var q = mv(R, m.pivot); P = [m.pivot[0] - q[0], m.pivot[1] - q[1], m.pivot[2] - q[2]]; }
      else if (m.type === 'orbit') {
        R = ry(-ph);                                                                  // turns to face along the path
        var pos = [m.centre[0] + m.radius * Math.cos(ph), m.centre[1], m.centre[2] + m.radius * Math.sin(ph)], qr = mv(R, m.rest);
        P = [pos[0] - qr[0], pos[1] - qr[1], pos[2] - qr[2]];
      } else { R = [1, 0, 0, 0, 1, 0, 0, 0, 1]; P = [0, m.amp * Math.sin(ph), 0]; }   // bob
      out[m.block] = { R: R, P: P };
    });
    return out;
  }

  /* ---------- start and loop ---------- */
  function home() { var w = desc.worlds[0]; if (w) { av.pos = [w.pos[0], w.pos[1] + MP.Scene.FLOOR, w.pos[2] + 4.5]; av.heading = 0; av.travel = null; } }
  function resize() {
    cssW = window.innerWidth; cssH = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, MP.settings.quality === 'low' ? 1 : 1.5);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    S.perspective(FOV, cssW / cssH, 0.2, 2500); signs.forEach(function (s) { s.w = 0; }); dirty = true;
  }
  function loop(t) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
    if (!desc || !ok) return;
    try {
      stepAvatar(dt); stepCamera(dt); updateNear();
      if (MP.settings.animate && motions.length) { clock += dt; dirty = true; }     // moving things keep the picture changing
      if (!dirty) return;
      dirty = false;
      S.setBlocks(blockMats());
      // Fog of war: what little-me can see stays lit; beyond it the palace fades to black. Zooming out widens the view a little.
      S.setFog(fogRadius(), [av.pos[0], av.pos[1] + 1, av.pos[2]]);
      S.draw(); placeSigns();
    } catch (e) { MP.logError('draw: ' + e.message); ok = false; }
  }
  function start() {
    canvas = $('scene');
    initGear(); MP.Notes.init();
    try { ok = S.init(canvas); } catch (e) { ok = false; MP.logError('splats could not start: ' + e.message); }
    if (!ok) toast('This browser cannot draw splats (it needs WebGL 2). The Build page still works.', 8000);
    loadPalace(); resize(); rebuild(); home(); frameAll();
    cam.target = goal.target.slice(); cam.dist = goal.dist;
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); goal.dist *= Math.exp(e.deltaY * 0.0012); }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('resize', resize);
    $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); $('q').blur(); setWander(false); runSearch(true); });
    $('q').addEventListener('input', function () { runSearch(false); });
    $('bar').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var act = b.dataset.act;
      if (act === 'all') { setWander(false); frameAll(); }
      else if (act === 'me') { follow = true; goal.dist = 10; goal.pitch = 0.6; }
      else if (act === 'walk') { setWander(false); setWalk(!walk); if (walk) toast(cssW > 760 ? 'Walk: arrow keys or W A S D. Drag to look. Walk up to a memory to read it.' : 'Walk: use the stick. Drag to look. Walk up to a memory to read it.', 3800); }
      else if (act === 'wander') setWander(!wander);
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go],[data-b]'); if (!b) return;
      if (b.dataset.go) { $('results').hidden = true; setWander(false); goTo(b.dataset.go); }
      else { nearOpen = b.dataset.b === 'more'; renderBubble(); }
    });
    var keys = {};
    function keyInput() { av.input = [(keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0)]; if (av.input[0] || av.input[1]) av.travel = null; }
    window.addEventListener('keydown', function (e) {
      var t = e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      var k = e.key.toLowerCase();
      if (k === '/') { e.preventDefault(); $('q').focus(); return; }
      if (!walk) return;
      if (k === 'q') goal.yaw += 0.25; else if (k === 'e') goal.yaw -= 0.25;
      else if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0) { e.preventDefault(); keys[k] = true; keyInput(); }
    });
    window.addEventListener('keyup', function (e) { var k = e.key.toLowerCase(); if (keys[k]) { keys[k] = false; keyInput(); } });
    var stick = $('stick'), knob = $('knob'), active = null;
    function stickAt(e) {
      var r = stick.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2), l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; } knob.style.transform = 'translate(' + x * 34 + 'px,' + y * 34 + 'px)'; av.input = [x, y]; av.travel = null;
    }
    stick.addEventListener('pointerdown', function (e) { active = e.pointerId; stick.setPointerCapture(e.pointerId); stickAt(e); });
    stick.addEventListener('pointermove', function (e) { if (e.pointerId === active) stickAt(e); });
    function stickEnd(e) { if (e.pointerId !== active) return; active = null; knob.style.transform = ''; av.input = [0, 0]; }
    stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);

    MP.debug = function () {
      return { version: MP.VERSION, ok: ok, splats: gauss ? gauss.n : 0, shapes: scene ? scene.shapes.length : 0, signs: signs.filter(function (s) { return s.shown; }).length,
        cam: { yaw: goal.yaw, pitch: goal.pitch, dist: goal.dist, target: goal.target.slice() }, avatar: av.pos.slice(), traveling: !!av.travel, follow: follow, walk: walk,
        wander: !!wander, near: near, nearOpen: nearOpen, moving: motions.length, clock: +clock.toFixed(2), fogR: fogRadius(), results: results.map(function (r) { return r.id; }), errors: MP.errors.slice(), palace: MP.palaces.current() };
    };
    MP.debugScreen = function (id) { var o = desc.byId[id]; return o ? S.toScreen([o.pos[0], o.pos[1] + 1.1, o.pos[2]], cssW, cssH) : null; };
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
