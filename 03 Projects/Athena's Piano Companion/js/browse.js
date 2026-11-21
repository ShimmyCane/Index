// Browse: every take, best first, with a star filter, quick rename and rating ("promote"), play, and delete
// (to the recycle bin, which holds takes for 30 days).
(function () {
  'use strict';
  var h = PC.h, $ = function (id) { return document.getElementById(id); };
  var minStars = 0, selected = {}, playingId = null, timers = {}, all = [];
  function stars(t, onChange) {
    var box = h('span', { 'class': 'stars' });
    for (var i = 1; i <= 5; i++) (function (i) {
      var b = h('button', { type: 'button', 'aria-label': i + ' star' + (i > 1 ? 's' : ''), text: '★', 'class': i <= t.rating ? 'on' : '' });
      b.addEventListener('click', function () { t.rating = t.rating === i ? 0 : i; box.querySelectorAll('button').forEach(function (x, k) { x.classList.toggle('on', k < t.rating); }); onChange(); });
      box.appendChild(b);
    })(i);
    return box;
  }
  function save(t) { clearTimeout(timers[t.id]); timers[t.id] = setTimeout(function () { Store.save('takes', t); }, 400); }
  function dayName(t) { return new Date(PC.sessionOf(t).slice(2) + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
  async function play(t, btn) {
    if (playingId === t.id) { PC.stopPlayback(); return; }
    try { var blob = await Store.blobFor(t); playingId = t.id; paintPlay(); PC.playBlob(blob); Notes.setContext({ item: t.id, label: t.name + ' (' + t.player + ')' }); }
    catch (e) { PC.err('Could not play ' + t.name, e); }
  }
  function paintPlay() { document.querySelectorAll('.brow .play').forEach(function (b) { var on = b.dataset.id === playingId; b.classList.toggle('on', on); b.textContent = on ? '■' : '▶'; }); }
  function row(t, inBin) {
    var chk = h('input', { type: 'checkbox', 'aria-label': 'Select ' + t.name }); chk.checked = !!selected[t.id];
    chk.addEventListener('change', function () { if (chk.checked) selected[t.id] = 1; else delete selected[t.id]; paintSel(); });
    var pl = h('button', { 'class': 'play', type: 'button', 'aria-label': 'Play ' + t.name, text: '▶' }); pl.dataset.id = t.id; pl.addEventListener('click', function () { play(t); });
    var name = h('input', { type: 'text', 'class': 'fld', value: t.name, 'aria-label': 'Name' }); name.addEventListener('input', function () { t.name = name.value; save(t); });
    var line = h('div', { 'class': 'line' }, [name, inBin ? null : stars(t, function () { save(t); })]);
    if (inBin) {
      line.appendChild(h('button', { 'class': 'btn small', type: 'button', text: '↩ Restore', onclick: async function () { await Bin.restore(t); } }));
      line.appendChild(h('button', { 'class': 'btn small danger', type: 'button', text: 'Delete for good', onclick: function () { Bin.forever(t); } }));
    } else line.appendChild(h('button', { 'class': 'btn small', type: 'button', 'aria-label': 'Delete ' + t.name, text: '🗑', onclick: function () { Bin.remove(t); } }));
    var sub = t.player + ' · ' + (t.album || 'No album') + ' · ' + PC.fmt((t.duration_ms || 0) / 1000) + ' · ' + dayName(t) + (inBin ? ' · ' + Bin.daysLeft(t) + ' days left in the bin' : '');
    var r = h('div', { 'class': 'brow' + (inBin ? ' gone' : '') }, [inBin ? h('span') : chk, pl, h('div', { 'class': 'main' }, [line, h('div', { 'class': 'sub', text: sub })])]);
    return r;
  }
  function shown() {
    var q = $('q').value.trim().toLowerCase(), fp = $('fPlayer').value;
    var list = Store.live(all).filter(function (t) {
      return (!fp || t.player === fp) && t.rating >= minStars && (!q || (t.name + ' ' + t.album + ' ' + t.description + ' ' + t.player).toLowerCase().indexOf(q) >= 0);
    });
    var mode = $('fSort').value;
    list.sort(function (a, b) {
      if (mode === 'stars' && b.rating !== a.rating) return b.rating - a.rating;
      return a.taken_at < b.taken_at ? 1 : -1;
    });
    return list;
  }
  function paintSel() {
    var n = Object.keys(selected).length; $('delSel').textContent = '🗑 Delete selected (' + n + ')'; $('delSel').disabled = !n;
  }
  async function render() {
    all = await Store.all('takes');
    var sel = $('fPlayer'), names = {}; Store.live(all).forEach(function (t) { names[t.player] = 1; });
    if (sel.options.length - 1 !== Object.keys(names).length) { var cur = sel.value; sel.innerHTML = '<option value="">Everyone</option>'; Object.keys(names).sort().forEach(function (n) { sel.appendChild(h('option', { value: n, text: n })); }); sel.value = cur; }
    var list = shown(), box = $('list'); box.textContent = '';
    $('count').textContent = list.length + ' shown of ' + Store.live(all).length + ' takes';
    if (!list.length) box.appendChild(h('div', { 'class': 'empty', text: 'No takes match.' }));
    if ($('fSort').value === 'days') {
      var last = '';
      list.forEach(function (t) { var d = PC.sessionOf(t); if (d !== last) { last = d; box.appendChild(h('div', { 'class': 'dayHead', text: dayName(t) })); } box.appendChild(row(t, false)); });
    } else list.forEach(function (t) { box.appendChild(row(t, false)); });
    var gone = all.filter(function (t) { return t.deleted_at; }).sort(function (a, b) { return a.deleted_at < b.deleted_at ? 1 : -1; }), bin = $('bin'); bin.textContent = '';
    $('binTitle').textContent = 'Recycle bin (' + gone.length + ')';
    if (!gone.length) bin.appendChild(h('div', { 'class': 'empty', text: 'Nothing in the bin.' }));
    gone.forEach(function (t) { bin.appendChild(row(t, true)); });
    paintSel(); paintPlay();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var sf = $('starFilter');
    [[0, 'Any'], [1, '★ 1+'], [2, '★ 2+'], [3, '★ 3+'], [4, '★ 4+ keepers'], [5, '★ 5']].forEach(function (o) {
      var b = h('button', { type: 'button', text: o[1], 'class': o[0] === 0 ? 'on' : '' });
      b.addEventListener('click', function () { minStars = o[0]; sf.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); render(); });
      sf.appendChild(b);
    });
    ['q', 'fPlayer', 'fSort'].forEach(function (id) { $(id).addEventListener('input', render); });
    $('selAll').addEventListener('click', function () { shown().forEach(function (t) { selected[t.id] = 1; }); render(); });
    $('selNone').addEventListener('click', function () { selected = {}; render(); });
    $('delSel').addEventListener('click', async function () {
      var ids = Object.keys(selected), takes = all.filter(function (t) { return ids.indexOf(t.id) >= 0; });
      if (await Bin.remove(takes)) { selected = {}; }
    });
    Chrome.init({ page: 'browse', desc: 'Look through every take, best first. Give stars to promote the good ones, and delete the rest; deleted takes wait in the recycle bin for 30 days.', sections: [] });
    PC.on('bin', render); PC.on('store', function (c) { if (c === 'pulled' && !(document.activeElement && document.activeElement.closest('.brow'))) render(); });
    PC.on('playing', function (on) { if (!on) { playingId = null; paintPlay(); } });
    Store.idleWhen(function () { return PC.isPlaying() || !!(document.activeElement && document.activeElement.closest('.brow')); });
    render();
  });
})();
