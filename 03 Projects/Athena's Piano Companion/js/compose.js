// Compose: four layers of takes on a timeline. Snip, cut, transform (speed, reverse, volume, fades),
// extend, repeat and shift clips. The mix is made in the page; "Save as a take" puts it back in the library.
(function () {
  'use strict';
  var h = PC.h, $ = function (id) { return document.getElementById(id); };
  var LAYER_COL = ['#ffb5a3', '#bfe8d2', '#bfe3f5', '#dcc9f0'], LH = 84, GAP = 6, Y0 = 24, RULER = 22;
  var project = null, sources = {}, cache = {}, SR = 44100, px = 40, playhead = 0, selId = null, selLayer = 0;
  var undoS = [], redoS = [], mixed = null, mixTimer = null, saveTimer = null, loopOn = false, takesCache = [];
  var play = { src: null, startedAt: 0, offset: 0, on: false };
  var lanes, scroller, canvases = [], rulerCv, drawQueued = false, drag = null, msgTimer = null, quick = null, ptrs = {}, pinch = null;

  // ---- project
  function newProject(name) {
    return { id: PC.uid('pj'), name: name || 'My piece', created_at: new Date().toISOString(),
      data: { layers: [0, 1, 2, 3].map(function (i) { return { name: 'Layer ' + (i + 1), vol: 1, mute: false, clips: [] }; }) } };
  }
  function layers() { return project.data.layers; }
  function allClips() { var o = []; layers().forEach(function (L, li) { L.clips.forEach(function (c) { o.push({ c: c, li: li }); }); }); return o; }
  function findClip(id) { var r = null; layers().forEach(function (L, li) { L.clips.forEach(function (c, ci) { if (c.id === id) r = { c: c, li: li, ci: ci }; }); }); return r; }
  function note(text) { var el = $('addHint'); el.textContent = text; clearTimeout(msgTimer); msgTimer = setTimeout(paintAddHint, 3500); }
  function paintAddHint() { $('addHint').textContent = 'Adds to layer ' + (selLayer + 1) + ' at the play position (' + playhead.toFixed(1) + ' s). Tap a layer name on the left to choose the layer.'; }

  // ---- sources and rendered clips
  async function ensureSource(takeId) {
    if (sources[takeId]) return sources[takeId];
    var rec = await Store.get('takes', takeId);
    if (!rec) throw new Error('A take used in this piece is not on this device and not in the family database');
    var blob = await Store.blobFor(rec), s = await PC.decode(blob);
    SR = s.sr; return (sources[takeId] = s);
  }
  function key(c) { return [c.take_id, c['in'], c.out, c.rate, c.gain, c.reverse, c.fadeIn, c.fadeOut, c.repeat, c.extend].join('|'); }
  function rendered(c) {
    var s = sources[c.take_id]; if (!s) return null;
    var k = key(c), hit = cache[c.id];
    if (hit && hit.k === k) return hit.d;
    var d = Mixer.renderClip(s.data, s.sr, c); cache[c.id] = { k: k, d: d }; return d;
  }
  function clipDur(c) { var d = rendered(c); return d ? d.length / SR : Math.max(0.1, (c.out - c['in']) / (c.rate || 1)); }
  function totalDur() { var e = 0; allClips().forEach(function (x) { e = Math.max(e, x.c.start + clipDur(x.c)); }); return e; }

  async function loadAll() {
    var ids = {}; allClips().forEach(function (x) { ids[x.c.take_id] = 1; });
    for (var id in ids) { try { await ensureSource(id); } catch (e) { PC.err('Clip source', e); note('A take could not be loaded: ' + e.message); } }
    scheduleMix(0); draw();
  }

  // ---- mixing and playing
  function scheduleMix(delay) { clearTimeout(mixTimer); mixTimer = setTimeout(remix, delay == null ? 120 : delay); }
  function remix() {
    var was = play.on ? position() : null;
    mixed = Mixer.mix(layers(), SR, rendered);
    if (play.on) { stopSource(); if (mixed.data.length) startPlay(Math.min(was, mixed.data.length / SR - 0.01)); else play.on = false; paintPlayBtn(); }
    paintClock();
  }
  function position() {
    if (!play.on) return playhead;
    var c = PC.ctx(), t = play.offset + (c.currentTime - play.startedAt), d = mixed ? mixed.data.length / SR : 0;
    return loopOn && d ? t % d : Math.min(t, d);
  }
  function stopSource() { if (play.src) { play.src.onended = null; try { play.src.stop(); } catch (e) { /* done */ } play.src = null; } }
  function startPlay(from) {
    if (!mixed || !mixed.data.length) { note('Add a take first.'); return; }
    var c = PC.ctx(), buf = c.createBuffer(1, mixed.data.length, SR); buf.copyToChannel(mixed.data, 0);
    var src = c.createBufferSource(), g = c.createGain(); g.gain.value = PC.settings.volume / 100;
    src.buffer = buf; src.loop = loopOn; src.connect(g); g.connect(c.destination);
    src.onended = function () { if (play.src === src) { play.on = false; play.src = null; playhead = 0; paintPlayBtn(); movePlayhead(); } };
    play.src = src; play.offset = from; play.startedAt = c.currentTime; play.on = true; src.start(0, from);
    (function tick() { if (!play.on) return; playhead = position(); movePlayhead(); requestAnimationFrame(tick); })();
    paintPlayBtn();
  }
  function togglePlay() {
    if (play.on) { playhead = position(); play.on = false; stopSource(); paintPlayBtn(); movePlayhead(); return; }
    if (!mixed) remix();
    var d = mixed && mixed.data.length / SR; if (playhead >= d - 0.05) playhead = 0;
    startPlay(playhead);
  }
  function paintPlayBtn() { $('play').textContent = play.on ? '⏸' : '▶'; $('loop').setAttribute('aria-pressed', loopOn); }
  function paintClock() { var d = mixed ? mixed.data.length / SR : 0; $('clock').textContent = PC.fmt(playhead) + ' / ' + PC.fmt(d || totalDur()); }
  function movePlayhead() { $('playhead').style.left = (playhead * px) + 'px'; paintClock(); paintAddHint();
    if (play.on) { var x = playhead * px; if (x < scroller.scrollLeft || x > scroller.scrollLeft + scroller.clientWidth - 40) scroller.scrollLeft = Math.max(0, x - 60); } }

  // ---- history and saving
  function pushUndo() { undoS.push(JSON.stringify(project.data)); if (undoS.length > 60) undoS.shift(); redoS = []; }
  function restore(s) { project.data = JSON.parse(s); selId = null; changed(true); loadAll(); }
  function undo() { if (!undoS.length) return; redoS.push(JSON.stringify(project.data)); restore(undoS.pop()); }
  function redo() { if (!redoS.length) return; undoS.push(JSON.stringify(project.data)); restore(redoS.pop()); }
  function mutate(fn) { pushUndo(); fn(); changed(); }
  function changed(noMix) { draw(); renderInspector(); if (!noMix) scheduleMix(); clearTimeout(saveTimer); saveTimer = setTimeout(saveProject, 800); }
  async function saveProject() { try { await Store.save('projects', project); PC.store.set('lastProject', project.id); } catch (e) { PC.err('Saving the piece', e); } }

  // ---- drawing
  function draw() { if (drawQueued) return; drawQueued = true; requestAnimationFrame(function () { drawQueued = false; paint(); }); }
  function paint() {
    var w = Math.max(scroller.clientWidth - 6, Math.ceil((totalDur() + 8) * px));
    w = Math.min(w, 30000);
    if (!rulerCv) return;
    [rulerCv].concat(canvases).forEach(function (cv) { if (cv.width !== w) cv.width = w; });
    var g = rulerCv.getContext('2d'); g.clearRect(0, 0, w, RULER); g.fillStyle = '#fff3d6'; g.fillRect(0, 0, w, RULER); g.fillStyle = '#2f2d3d'; g.font = '700 11px sans-serif';
    var step = px >= 60 ? 1 : px >= 25 ? 5 : 10;
    for (var s = 0; s * px < w; s += step) { g.fillRect(s * px, 12, 1, 10); g.fillText(PC.fmt(s), s * px + 3, 10); }
    layers().forEach(function (L, li) {
      var cv = canvases[li], c = cv.getContext('2d'); c.clearRect(0, 0, w, LH);
      c.fillStyle = li % 2 ? '#fffaf0' : '#fff'; c.fillRect(0, 0, w, LH);
      c.fillStyle = 'rgba(47,45,61,.08)'; for (var t = 0; t * px < w; t += (px >= 25 ? 1 : 5)) c.fillRect(t * px, 0, 1, LH);
      L.clips.forEach(function (clip) { drawClip(c, clip, li, L.mute); });
    });
    $('playhead').style.height = (Y0 + 4 * (LH + GAP)) + 'px'; $('lanes').style.width = w + 'px';
    if (pinch) scroller.scrollLeft = Math.max(0, pinch.t * px - pinch.sx);
    movePlayhead(); placeQuick();
  }
  function drawClip(c, clip, li, muted) {
    var d = rendered(clip), x = clip.start * px, wd = Math.max(8, clipDur(clip) * px), sel = clip.id === selId;
    c.globalAlpha = muted ? 0.45 : 1; c.fillStyle = d ? LAYER_COL[li] : '#ffd6d0';
    rr(c, x, 4, wd, LH - 8, 10); c.fill(); c.lineWidth = sel ? 4 : 2.5; c.strokeStyle = sel ? '#b3261e' : '#2f2d3d'; c.stroke();
    if (d) {                                              // the shape of the sound
      c.fillStyle = 'rgba(47,45,61,.65)'; var per = Math.max(1, Math.floor(d.length / wd)), mid = LH / 2, stride = Math.max(1, Math.floor(per / 48));
      for (var i = 0; i < wd - 4; i += 2) {
        var m = 0, a = Math.floor(i * d.length / wd), b = Math.min(d.length, a + per);
        for (var k = a; k < b; k += stride) { var v = Math.abs(d[k]); if (v > m) m = v; }
        var hh = Math.min(LH / 2 - 10, m * (LH - 28)); c.fillRect(x + 2 + i, mid - hh, 1.6, Math.max(1, hh * 2));
      }
    }
    c.fillStyle = '#2f2d3d'; c.font = '700 12px sans-serif';
    var tag = clip.take_name || 'take'; if (clip.repeat > 1) tag += ' ×' + clip.repeat; if (clip.extend) tag += ' +' + clip.extend + 's'; if (clip.rate !== 1) tag += ' ' + clip.rate + '×'; if (clip.reverse) tag += ' ⇄';
    c.fillText(tag, x + 8, 17);
    c.fillStyle = 'rgba(47,45,61,.35)'; c.fillRect(x, 8, 5, LH - 16); c.fillRect(x + wd - 5, 8, 5, LH - 16);   // snip handles
    c.globalAlpha = 1;
  }
  function rr(c, x, y, w, hgt, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hgt, r); c.arcTo(x + w, y + hgt, x, y + hgt, r); c.arcTo(x, y + hgt, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  // ---- touching the timeline
  function hit(x, y) {
    var li = Math.floor((y - Y0) / (LH + GAP)); if (li < 0 || li > 3 || (y - Y0) % (LH + GAP) > LH) return { li: li < 0 ? 0 : Math.min(3, li) };
    var found = null; layers()[li].clips.forEach(function (c) { var sx = c.start * px, ex = sx + Math.max(8, clipDur(c) * px); if (x >= sx && x <= ex) found = c; });
    return { li: li, c: found };
  }
  function dist(a, b) { return Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)); }
  function startPinch() {                                     // two fingers: zoom the timeline
    if (drag && drag.mode !== 'pan' && !drag.moved) undoS.pop();
    drag = null; var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]];
    var sx = (a.x + b.x) / 2 - scroller.getBoundingClientRect().left;
    pinch = { d0: dist(a, b), px0: px, sx: sx, t: (scroller.scrollLeft + sx) / px };
  }
  function onDown(e) {
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; try { $('lanes').setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
    if (Object.keys(ptrs).length === 2) { startPinch(); return; }
    if (Object.keys(ptrs).length > 2) return;
    var r = $('lanes').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, ht = hit(x, y);
    selLayer = ht.li; paintHeads();
    if (y < Y0) { playhead = Math.max(0, x / px); if (play.on) { stopSource(); startPlay(playhead); } movePlayhead(); return; }
    if (ht.c) {
      selId = ht.c.id; var c = ht.c, sx = c.start * px, ex = sx + Math.max(8, clipDur(c) * px);
      pushUndo(); drag = { id: c.id, mode: ex - x < 16 ? 'out' : (x - sx < 16 ? 'in' : 'move'), x0: e.clientX, orig: JSON.parse(JSON.stringify(c)), li0: ht.li, moved: false };
    } else drag = { mode: 'pan', x0: e.clientX, sl: scroller.scrollLeft, tap: x, moved: false };
    renderInspector(); draw();
  }
  function onMove(e) {
    if (ptrs[e.pointerId]) ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (pinch) {
      var k = Object.keys(ptrs); if (k.length < 2) return;
      px = Math.max(10, Math.min(120, Math.round(pinch.px0 * dist(ptrs[k[0]], ptrs[k[1]]) / pinch.d0))); $('zoom').value = px; draw(); return;
    }
    if (!drag) return;
    var dx = e.clientX - drag.x0; if (Math.abs(dx) > 4) drag.moved = true;
    if (drag.mode === 'pan') { scroller.scrollLeft = drag.sl - dx; return; }
    var f = findClip(drag.id); if (!f) return; var c = f.c, o = drag.orig, ds = dx / px;
    if (drag.mode === 'move') {
      c.start = Math.max(0, o.start + ds);
      var r = $('lanes').getBoundingClientRect(), li = Math.max(0, Math.min(3, Math.floor((e.clientY - r.top - Y0) / (LH + GAP))));
      if (li !== f.li) { layers()[f.li].clips.splice(f.ci, 1); layers()[li].clips.push(c); selLayer = li; paintHeads(); }
    } else if (drag.mode === 'in') {
      var ni = Math.max(0, Math.min(o.out - 0.05, o['in'] + ds * (o.rate || 1))); c['in'] = ni; c.start = Math.max(0, o.start + (ni - o['in']) / (o.rate || 1));
    } else c.out = Math.max(o['in'] + 0.05, Math.min(sources[c.take_id] ? sources[c.take_id].data.length / sources[c.take_id].sr : o.out + 60, o.out + ds * (o.rate || 1)));
    draw();
  }
  function onUp(e) {
    if (e) delete ptrs[e.pointerId];
    if (pinch) { if (Object.keys(ptrs).length < 2) { pinch = null; } drag = null; return; }
    if (!drag) return;
    if (drag.mode === 'pan' && !drag.moved) { playhead = Math.max(0, drag.tap / px); if (play.on) { stopSource(); startPlay(playhead); } movePlayhead(); }
    else if (drag.mode !== 'pan') { if (!drag.moved) undoS.pop(); changed(); }
    drag = null;
  }

  // ---- the picked clip
  function sel() { return selId ? findClip(selId) : null; }
  function btn(label, fn, cls) { return h('button', { 'class': 'btn ' + (cls || ''), type: 'button', text: label, onclick: fn }); }
  function stepper(label, get, fmt, dec, inc) {
    return h('div', { 'class': 'btns' }, [h('span', { text: label }), btn('−', dec), h('span', { 'class': 'val', text: fmt(get()) }), btn('+', inc)]);
  }
  function renderInspector() {
    var box = $('inspector'), f = sel(); box.textContent = '';
    $('clipTitle').textContent = f ? (f.c.take_name || 'Clip') + ' · layer ' + (f.li + 1) : 'The picked clip';
    if (!f) { box.appendChild(h('p', { 'class': 'hint', text: 'Tap a clip on the timeline to snip, cut, change, extend, repeat or shift it.' })); return; }
    var c = f.c, ins = h('div', { 'class': 'insp' });
    function set(fn) { return function () { mutate(function () { fn(c); }); }; }
    var round = function (v) { return Math.round(v * 100) / 100; };
    var srcDur = sources[c.take_id] ? sources[c.take_id].data.length / sources[c.take_id].sr : c.out;
    ins.appendChild(h('div', { 'class': 'grp' }, [h('h4', { text: '✂️ Snip' }),
      stepper('Start', function () { return c['in']; }, function (v) { return v.toFixed(2) + 's'; }, set(function (c) { c['in'] = Math.max(0, round(c['in'] - 0.1)); }), set(function (c) { c['in'] = Math.min(round(c.out - 0.1), round(c['in'] + 0.1)); })),
      stepper('End', function () { return c.out; }, function (v) { return v.toFixed(2) + 's'; }, set(function (c) { c.out = Math.max(round(c['in'] + 0.1), round(c.out - 0.1)); }), set(function (c) { c.out = Math.min(round(srcDur), round(c.out + 0.1)); })),
      h('div', { 'class': 'btns' }, [btn('✂ Start at play position', set(function (c) {
        var d = clipDur(c); if (playhead > c.start && playhead < c.start + d) { var delta = (playhead - c.start) * c.rate; c['in'] = round(c['in'] + delta); c.start = round(playhead); } else note('Move the play position over the clip first.'); })),
        btn('✂ End at play position', set(function (c) {
          var d = clipDur(c); if (playhead > c.start && playhead < c.start + d && c.repeat === 1 && !c.extend) c.out = round(c['in'] + (playhead - c.start) * c.rate); else note('Move the play position over the clip first (repeat 1, no extend).'); }))])]));
    ins.appendChild(h('div', { 'class': 'grp' }, [h('h4', { text: '🔪 Cut' }),
      h('div', { 'class': 'btns' }, [btn('Split at play position', function () { split(c); })]),
      h('div', { 'class': 'btns' }, [btn('Duplicate', function () { dupClip(f); }), btn('Delete', function () { delClip(f); }, '')])]));
    ins.appendChild(h('div', { 'class': 'grp' }, [h('h4', { text: '↔️ Shift' }),
      h('div', { 'class': 'btns' }, [btn('◀ 1s', set(function (c) { c.start = Math.max(0, round(c.start - 1)); })), btn('◀ .1', set(function (c) { c.start = Math.max(0, round(c.start - 0.1)); })),
        btn('.1 ▶', set(function (c) { c.start = round(c.start + 0.1); })), btn('1s ▶', set(function (c) { c.start = round(c.start + 1); }))]),
      h('div', { 'class': 'btns' }, [btn('⇥ To play position', set(function (c) { c.start = round(playhead); })),
        btn('▲ Layer', function () { moveLayer(f, -1); }), btn('▼ Layer', function () { moveLayer(f, 1); })])]));
    var speed = h('div', { 'class': 'btns' }, [0.5, 0.75, 1, 1.25, 1.5, 2].map(function (r) { return btn(r + '×', set(function (c) { c.rate = r; }), c.rate === r ? 'on' : ''); }));
    function rg(label, k, min, max, step, scale, unit) {
      var out = h('span', { 'class': 'val', text: Math.round(c[k] * scale) + unit }), inp = h('input', { type: 'range', min: min, max: max, step: step, value: c[k] });
      inp.addEventListener('pointerdown', function () { pushUndo(); });
      inp.addEventListener('input', function () { c[k] = Number(inp.value); out.textContent = Math.round(c[k] * scale) + unit; draw(); scheduleMix(); });
      inp.addEventListener('change', function () { changed(); });
      return h('div', { 'class': 'btns' }, [h('span', { text: label }), inp, out]);
    }
    ins.appendChild(h('div', { 'class': 'grp' }, [h('h4', { text: '🎚️ Change' }), h('div', { 'class': 'btns' }, [h('span', { text: 'Speed' })]), speed,
      h('div', { 'class': 'btns' }, [btn('⇄ Reverse', set(function (c) { c.reverse = !c.reverse; }), c.reverse ? 'on' : '')]),
      rg('Volume', 'gain', 0, 2, 0.05, 100, '%'), rg('Fade in', 'fadeIn', 0, 3, 0.05, 1, 's'), rg('Fade out', 'fadeOut', 0, 3, 0.05, 1, 's')]));
    ins.appendChild(h('div', { 'class': 'grp' }, [h('h4', { text: '🔁 Repeat and extend' }),
      stepper('Repeat', function () { return c.repeat; }, function (v) { return v + '×'; }, set(function (c) { c.repeat = Math.max(1, c.repeat - 1); }), set(function (c) { c.repeat = Math.min(32, c.repeat + 1); })),
      stepper('Extend', function () { return c.extend; }, function (v) { return '+' + v + 's'; }, set(function (c) { c.extend = Math.max(0, c.extend - 1); }), set(function (c) { c.extend = Math.min(60, c.extend + 1); })),
      h('div', { 'class': 'hint', text: 'Extend keeps the last moment of the clip going, like holding the pedal down.' })]));
    box.appendChild(ins);
  }
  function dupClip(f) { mutate(function () { var n = JSON.parse(JSON.stringify(f.c)); n.id = PC.uid('c'); n.start = Math.round((f.c.start + clipDur(f.c)) * 100) / 100; layers()[f.li].clips.push(n); selId = n.id; }); }
  function delClip(f) { mutate(function () { layers()[f.li].clips.splice(f.ci, 1); selId = null; }); }
  // A small bar right above the picked clip: Split, Duplicate, Delete, Undo (Delete asks nothing; Undo is one tap).
  function placeQuick() {
    if (!quick) return; var f = sel();
    if (!f) { quick.hidden = true; return; }
    quick.hidden = false; quick.style.left = Math.max(0, Math.min(f.c.start * px, parseFloat($('lanes').style.width || 0) - 190)) + 'px';
    quick.style.top = Math.max(0, Y0 + f.li * (LH + GAP) - 44) + 'px';
  }
  function split(c) {
    var d = clipDur(c), f = findClip(c.id);
    if (!(playhead > c.start + 0.05 && playhead < c.start + d - 0.05)) { note('Move the play position over the clip first.'); return; }
    if (c.repeat !== 1) { note('Set repeat to 1 before cutting.'); return; }
    mutate(function () {
      var at = Math.round((c['in'] + (playhead - c.start) * c.rate) * 100) / 100, n = JSON.parse(JSON.stringify(c));
      n.id = PC.uid('c'); n['in'] = at; n.start = Math.round(playhead * 100) / 100; n.fadeIn = 0.02;
      c.out = at; c.fadeOut = 0.02; c.extend = 0; n.rate = c.rate;
      layers()[f.li].clips.push(n);
    });
  }
  function moveLayer(f, d) {
    var to = f.li + d; if (to < 0 || to > 3) return;
    mutate(function () { layers()[f.li].clips.splice(f.ci, 1); layers()[to].clips.push(f.c); selLayer = to; paintHeads(); });
  }

  // ---- layers on the left, takes to add, projects
  function paintHeads() {
    var box = $('heads'); box.textContent = '';
    layers().forEach(function (L, i) {
      var vol = h('input', { type: 'range', min: 0, max: 1.5, step: 0.05, value: L.vol, 'aria-label': 'Layer ' + (i + 1) + ' volume' });
      vol.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); vol.addEventListener('click', function (e) { e.stopPropagation(); });
      vol.addEventListener('input', function () { L.vol = Number(vol.value); scheduleMix(); clearTimeout(saveTimer); saveTimer = setTimeout(saveProject, 800); });
      var mute = h('button', { type: 'button', 'class': L.mute ? 'on' : '', text: '🔇', 'aria-label': 'Mute layer ' + (i + 1), onclick: function (e) { e.stopPropagation(); L.mute = !L.mute; changed(); paintHeads(); } });
      var hd = h('div', { 'class': 'head' + (i === selLayer ? ' sel' : ''), style: 'background:' + LAYER_COL[i], onclick: function () { selLayer = i; paintHeads(); paintAddHint(); } },
        [h('b', { text: L.name }), h('div', { 'class': 'hb' }, [mute]), vol]);
      box.appendChild(hd);
    });
  }
  async function paintPick() {
    takesCache = Store.live(await Store.all('takes')).sort(function (a, b) { return a.taken_at < b.taken_at ? 1 : -1; });
    var box = $('pick'); box.textContent = '';
    if (!takesCache.length) box.appendChild(h('p', { 'class': 'hint', text: 'No takes yet. Record some on the first page.' }));
    takesCache.forEach(function (t) {
      box.appendChild(h('button', { 'class': 'pickItem', type: 'button', style: 'border-left: 14px solid ' + (t.color || '#ccc'), onclick: function () { addTake(t); } },
        [t.name + ' · ' + t.player, h('small', { text: PC.fmt(t.duration_ms / 1000) + (t.source === 'composer' ? ' · mix' : '') })]));
    });
  }
  async function addTake(t) {
    try { await ensureSource(t.id); } catch (e) { PC.err('Adding ' + t.name, e); note('Could not load that take: ' + e.message); return; }
    mutate(function () { var c = Mixer.newClip(t, Math.round(playhead * 100) / 100, PC.uid('c')); layers()[selLayer].clips.push(c); selId = c.id; });
    Notes.setContext({ item: project.id, label: 'Piece: ' + project.name });
  }
  async function paintProject() {
    var box = $('projectBody'); box.textContent = '';
    var name = h('input', { type: 'text', 'class': 'fld', value: project.name, 'aria-label': 'Piece name' });
    name.addEventListener('input', function () { project.name = name.value; clearTimeout(saveTimer); saveTimer = setTimeout(saveProject, 600); });
    var all = (await Store.all('projects')).sort(function (a, b) { return a.updated_at < b.updated_at ? 1 : -1; });
    var sel2 = h('select', { 'aria-label': 'Open a piece' }, [h('option', { value: '', text: 'Open another piece…' })].concat(all.map(function (p) { return h('option', { value: p.id, text: p.name }); })));
    sel2.addEventListener('change', function () { var p = all.filter(function (x) { return x.id === sel2.value; })[0]; if (p) openProject(p); });
    box.appendChild(h('div', { 'class': 'projRow' }, [name]));
    box.appendChild(h('div', { 'class': 'projRow' }, [btn('＋ New piece', async function () { await saveProject(); openProject(newProject('My piece ' + (all.length + 1))); }), sel2,
      btn('🗑 Delete this piece', async function () { if (!window.confirm('Delete "' + project.name + '"? The takes stay.')) return; await Store.del('projects', project.id); openProject(newProject()); })]));
    box.appendChild(h('div', { 'class': 'projRow' }, [btn('🎵 Save the mix as a take', exportTake), btn('⬇ Download the mix', downloadMix)]));
    box.appendChild(h('p', { 'class': 'hint', text: 'The piece is saved on this device as you work, and copied to the family database when signed in.' }));
  }
  function mixNow() { remix(); return mixed && mixed.data.length ? mixed : null; }
  async function exportTake() {
    var m = mixNow(); if (!m) { note('Nothing to save yet.'); return; }
    var d = new Date(), player = PC.settings.player, all = await Store.all('takes');
    var n = all.filter(function (t) { return t.source === 'composer'; }).length + 1, blob = PC.encodeWav(m.data, m.sr);
    var slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mix';
    var take = { id: PC.uid('t'), name: project.name + ' (mix ' + n + ')', player: player, album: 'Compositions', take_no: n,
      file_name: player.toLowerCase() + '-' + PC.stamp(d) + '-' + slug + '.wav', file_path: '', mime: 'audio/wav', duration_ms: Math.round(m.data.length / m.sr * 1000),
      size_bytes: blob.size, sample_rate: m.sr, rating: 0, description: 'Made in Compose from ' + allClips().length + ' clips.', color: PC.colorFor(n + 5),
      peaks: PC.peaks(m.data, 64), source: 'composer', taken_at: d.toISOString(), blob: blob };
    await Store.save('takes', take); Cues.saved(); note('Saved as “' + take.name + '” in the library.'); paintPick();
  }
  function downloadMix() {
    var m = mixNow(); if (!m) { note('Nothing to download yet.'); return; }
    var a = h('a', { href: URL.createObjectURL(PC.encodeWav(m.data, m.sr)), download: (project.name.replace(/[^\w]+/g, '-') || 'mix') + '.wav' });
    document.body.appendChild(a); a.click(); a.remove();
  }
  async function openProject(p) {
    project = p; undoS = []; redoS = []; selId = null; cache = {}; playhead = 0; if (play.on) { play.on = false; stopSource(); }
    PC.store.set('lastProject', p.id); paintHeads(); renderInspector(); paintProject(); paintPick(); paintAddHint(); draw(); await loadAll();
  }

  document.addEventListener('DOMContentLoaded', async function () {
    lanes = $('lanes'); scroller = $('scroller');
    rulerCv = h('canvas', { height: RULER, style: 'display:block;margin-bottom:2px' }); lanes.insertBefore(rulerCv, $('playhead'));
    for (var i = 0; i < 4; i++) { var cv = h('canvas', { height: LH }); canvases.push(cv); lanes.insertBefore(cv, $('playhead')); }
    lanes.style.touchAction = 'none';
    quick = h('div', { 'class': 'quickBar', hidden: true }, [
      h('button', { type: 'button', 'aria-label': 'Split at the play position', text: '✂️', onclick: function () { var f = sel(); if (f) split(f.c); } }),
      h('button', { type: 'button', 'aria-label': 'Duplicate', text: '⧉', onclick: function () { var f = sel(); if (f) dupClip(f); } }),
      h('button', { type: 'button', 'aria-label': 'Delete', text: '🗑', onclick: function () { var f = sel(); if (f) delClip(f); } }),
      h('button', { type: 'button', 'aria-label': 'Undo', text: '↩️', onclick: undo })]);
    ['pointerdown', 'pointermove', 'pointerup'].forEach(function (n) { quick.addEventListener(n, function (ev) { ev.stopPropagation(); }); });
    lanes.appendChild(quick);
    lanes.addEventListener('pointerdown', onDown); lanes.addEventListener('pointermove', onMove); lanes.addEventListener('pointerup', onUp); lanes.addEventListener('pointercancel', onUp);
    $('play').addEventListener('click', togglePlay);
    $('stop').addEventListener('click', function () { playhead = 0; if (play.on) { stopSource(); startPlay(0); } movePlayhead(); scroller.scrollLeft = 0; });
    $('loop').addEventListener('click', function () { loopOn = !loopOn; if (play.on) { var p = position(); stopSource(); startPlay(p); } paintPlayBtn(); });
    $('undo').addEventListener('click', undo); $('redo').addEventListener('click', redo);
    $('zoom').addEventListener('input', function () { px = Number($('zoom').value); draw(); });
    Chrome.init({ page: 'compose', desc: 'Compose with up to four layers of takes. Everything here is optional; the timeline is the main thing.', sections: [
      { id: 'sound', icon: '🔊', title: 'Sound', open: true, build: function () { return [Chrome.range('volume', 'Volume', 10, 100, 5, '%')]; } }] });
    Store.idleWhen(function () { return play.on; });
    var last = PC.store.get('lastProject', null), start = null;
    if (last) start = await Store.get('projects', last);
    await openProject(start || newProject());
    PC.on('store', function (c) { if (c === 'takes' || c === 'pulled') paintPick(); });
    window.addEventListener('beforeunload', function () { saveProject(); });
    window.Comp = { project: function () { return project; }, addTake: addTake, mix: mixNow, select: function (id) { selId = id; renderInspector(); }, split: function () { var f = sel(); if (f) split(f.c); }, setPlayhead: function (t) { playhead = t; movePlayhead(); }, undo: undo, redo: redo };
  });
})();
