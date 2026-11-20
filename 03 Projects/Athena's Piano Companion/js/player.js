// Listen: a small music player for the takes. Browse by album, artist or rating, or make playlists.
// The page can also change the database: rating a take, and making, renaming, ordering and deleting playlists.
(function () {
  'use strict';
  var h = PC.h, $ = function (id) { return document.getElementById(id); };
  var takes = [], lists = [], items = [], view = { kind: 'all', key: '' }, queue = [], idx = -1, shuffle = false, repeat = false, audio = new Audio(), url = null;
  audio.preload = 'auto';

  function byDate(a, b) { return a.taken_at < b.taken_at ? 1 : -1; }
  function group(keyFn) {
    var g = {}; takes.forEach(function (t) { var k = keyFn(t); (g[k] = g[k] || []).push(t); });
    return Object.keys(g).sort().map(function (k) { return { key: k, takes: g[k].sort(byDate) }; });
  }
  function groupButtons(box, kind, groups, labelFn) {
    box.textContent = '';
    if (!groups.length) box.appendChild(h('div', { 'class': 'hint', text: 'Nothing here yet.' }));
    groups.forEach(function (g) {
      var b = h('button', { 'class': 'groupBtn' + (view.kind === kind && view.key === g.key ? ' on' : ''), type: 'button' },
        [h('span', { text: labelFn ? labelFn(g.key) : g.key }), h('small', { text: g.takes.length + (g.takes.length === 1 ? ' take' : ' takes') })]);
      b.addEventListener('click', function () { view = { kind: kind, key: g.key }; paintView(); play(0); });
      box.appendChild(b);
    });
  }
  function stars(n) { return n ? '★'.repeat(n) : 'unrated'; }
  function shown() {
    if (view.kind === 'album') return takes.filter(function (t) { return (t.album || 'No album') === view.key; }).sort(byDate);
    if (view.kind === 'artist') return takes.filter(function (t) { return t.player === view.key; }).sort(byDate);
    if (view.kind === 'rating') return takes.filter(function (t) { return String(t.rating) === view.key; }).sort(byDate);
    if (view.kind === 'list') {
      var order = items.filter(function (i) { return i.playlist_id === view.key; }).sort(function (a, b) { return a.position - b.position; });
      return order.map(function (i) { return takes.filter(function (t) { return t.id === i.take_id; })[0]; }).filter(Boolean);
    }
    return takes.slice().sort(byDate);
  }
  function viewTitle() {
    if (view.kind === 'album') return '💿 ' + view.key; if (view.kind === 'artist') return '🧑‍🎤 ' + view.key;
    if (view.kind === 'rating') return '⭐ ' + stars(Number(view.key));
    if (view.kind === 'list') { var l = lists.filter(function (x) { return x.id === view.key; })[0]; return '🎶 ' + (l ? l.name : 'Playlist'); }
    return 'All takes';
  }
  function paintView() {
    groupButtons($('albums'), 'album', group(function (t) { return t.album || 'No album'; }));
    groupButtons($('artists'), 'artist', group(function (t) { return t.player; }));
    groupButtons($('ratings'), 'rating', group(function (t) { return String(t.rating); }).reverse(), function (k) { return stars(Number(k)); });
    var lb = $('lists'); lb.textContent = '';
    lists.slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; }).forEach(function (l) {
      var n = items.filter(function (i) { return i.playlist_id === l.id; }).length;
      var b = h('button', { 'class': 'groupBtn' + (view.kind === 'list' && view.key === l.id ? ' on' : ''), type: 'button' }, [h('span', { text: l.name }), h('small', { text: n + ' takes' })]);
      b.addEventListener('click', function () { view = { kind: 'list', key: l.id }; paintView(); });
      lb.appendChild(b);
    });
    var addTo = $('addTo'); addTo.innerHTML = '<option value="">＋ Playlist</option>';
    lists.forEach(function (l) { addTo.appendChild(h('option', { value: l.id, text: l.name })); });
    $('tracksTitle').textContent = viewTitle();
    paintTools(); paintTracks();
  }
  function paintTools() {
    var box = $('listTools'); box.textContent = ''; box.hidden = view.kind !== 'list'; if (view.kind !== 'list') return;
    var l = lists.filter(function (x) { return x.id === view.key; })[0]; if (!l) return;
    box.appendChild(h('button', { 'class': 'btn small', type: 'button', text: '▶ Play all', onclick: function () { play(0); } }));
    box.appendChild(h('button', { 'class': 'btn small', type: 'button', text: '✏️ Rename', onclick: async function () {
      var n = window.prompt('Playlist name', l.name); if (n && n.trim()) { l.name = n.trim(); await Store.save('playlists', l); await load(); } } }));
    box.appendChild(h('button', { 'class': 'btn small', type: 'button', text: '🗑 Delete', onclick: async function () {
      if (!window.confirm('Delete the playlist "' + l.name + '"? The takes stay.')) return;
      for (var i of items.filter(function (x) { return x.playlist_id === l.id; })) await Store.del('items', i.id);
      await Store.del('playlists', l.id); view = { kind: 'all', key: '' }; await load(); } }));
  }
  function paintTracks() {
    var ol = $('tracks'); ol.textContent = ''; var list = shown(); queue = list;
    if (!list.length) ol.appendChild(h('li', { text: 'No takes here.' }));
    list.forEach(function (t, i) {
      var li = h('li', { 'class': queue[idx] && queue[idx].id === t.id ? 'on' : '' }, [
        h('div', { 'class': 'tt' }, [t.name, h('small', { text: t.player + ' · ' + (t.album || 'No album') + ' · ' + PC.fmt(t.duration_ms / 1000) + (t.rating ? ' · ' + stars(t.rating) : '') })])]);
      if (view.kind === 'list') {
        li.appendChild(h('button', { 'class': 'mini', type: 'button', text: '▲', 'aria-label': 'Move up', onclick: function (e) { e.stopPropagation(); move(i, -1); } }));
        li.appendChild(h('button', { 'class': 'mini', type: 'button', text: '▼', 'aria-label': 'Move down', onclick: function (e) { e.stopPropagation(); move(i, 1); } }));
        li.appendChild(h('button', { 'class': 'mini', type: 'button', text: '✖', 'aria-label': 'Remove from playlist', onclick: function (e) { e.stopPropagation(); removeItem(t.id); } }));
      }
      li.addEventListener('click', function () { play(i); });
      ol.appendChild(li);
    });
  }
  async function move(i, d) {
    var order = items.filter(function (x) { return x.playlist_id === view.key; }).sort(function (a, b) { return a.position - b.position; });
    var j = i + d; if (j < 0 || j >= order.length) return;
    var t = order[i]; order[i] = order[j]; order[j] = t;
    for (var k = 0; k < order.length; k++) { order[k].position = k; await Store.save('items', order[k]); }
    await load();
  }
  async function removeItem(takeId) {
    var it = items.filter(function (x) { return x.playlist_id === view.key && x.take_id === takeId; })[0];
    if (it) { await Store.del('items', it.id); await load(); }
  }

  // ---- playing
  async function play(i) {
    if (!queue.length) return;
    idx = (i + queue.length) % queue.length; var t = queue[idx];
    try {
      var blob = await Store.blobFor(t);
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob); audio.src = url; audio.volume = PC.settings.volume / 100; await audio.play();
      $('nowTitle').textContent = t.name; $('nowSub').textContent = t.player + ' · ' + (t.album || 'No album');
      Notes.setContext({ item: t.id, label: t.name + ' (' + t.player + ')' });
      paintNowStars(t); paintTracks();
    } catch (e) { PC.err('Could not play ' + t.name, e); $('nowSub').textContent = 'Could not play this one'; }
  }
  function nextIndex() {
    if (shuffle && queue.length > 1) { var n; do { n = Math.floor(Math.random() * queue.length); } while (n === idx); return n; }
    return idx + 1;
  }
  audio.addEventListener('ended', function () {
    if (!repeat && !shuffle && idx + 1 >= queue.length) { $('pp').textContent = '▶'; return; }
    play(nextIndex());
  });
  audio.addEventListener('play', function () { $('pp').textContent = '⏸'; });
  audio.addEventListener('pause', function () { $('pp').textContent = '▶'; });
  audio.addEventListener('timeupdate', function () {
    if (audio.duration) { $('seek').value = Math.round(audio.currentTime / audio.duration * 1000); $('time').textContent = PC.fmt(audio.currentTime) + ' / ' + PC.fmt(audio.duration); }
  });
  function paintNowStars(t) {
    var box = $('nowStars'); box.textContent = '';
    for (var i = 1; i <= 5; i++) (function (i) {
      var b = h('button', { type: 'button', text: '★', 'aria-label': i + ' stars', 'class': i <= t.rating ? 'on' : '' });
      b.addEventListener('click', async function () { t.rating = t.rating === i ? 0 : i; await Store.save('takes', t); paintNowStars(t); paintView(); });
      box.appendChild(b);
    })(i);
  }
  async function load() {
    takes = await Store.all('takes'); lists = await Store.all('playlists'); items = await Store.all('items');
    var cur = queue[idx]; paintView(); if (cur) { idx = queue.findIndex(function (t) { return t.id === cur.id; }); paintTracks(); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Chrome.init({ page: 'player', desc: 'Listen to the takes. Rating and playlists are saved in the family database too.', sections: [
      { id: 'sound', icon: '🔊', title: 'Sound', open: true, build: function () { return [Chrome.range('volume', 'Volume', 10, 100, 5, '%')]; } }] });
    PC.on('setting', function (k) { if (k === 'volume') audio.volume = PC.settings.volume / 100; });
    $('pp').addEventListener('click', function () { if (!audio.src) play(0); else if (audio.paused) audio.play(); else audio.pause(); });
    $('next').addEventListener('click', function () { play(nextIndex()); });
    $('prev').addEventListener('click', function () { if (audio.currentTime > 3) audio.currentTime = 0; else play(idx - 1); });
    $('seek').addEventListener('input', function () { if (audio.duration) audio.currentTime = $('seek').value / 1000 * audio.duration; });
    $('shuffle').addEventListener('click', function () { shuffle = !shuffle; $('shuffle').setAttribute('aria-pressed', shuffle); });
    $('repeat').addEventListener('click', function () { repeat = !repeat; $('repeat').setAttribute('aria-pressed', repeat); });
    $('newList').addEventListener('click', async function () {
      var n = window.prompt('Name for the new playlist'); if (!n || !n.trim()) return;
      var now = new Date().toISOString(), l = { id: PC.uid('pl'), name: n.trim(), description: '', created_at: now };
      await Store.save('playlists', l); view = { kind: 'list', key: l.id }; await load();
    });
    $('addTo').addEventListener('change', async function () {
      var id = $('addTo').value, t = queue[idx]; $('addTo').value = ''; if (!id || !t) return;
      if (items.some(function (i) { return i.playlist_id === id && i.take_id === t.id; })) { $('nowSub').textContent = 'Already in that playlist'; return; }
      var pos = items.filter(function (i) { return i.playlist_id === id; }).length;
      await Store.save('items', { id: PC.uid('pi'), playlist_id: id, take_id: t.id, position: pos, added_at: new Date().toISOString() });
      $('nowSub').textContent = 'Added to the playlist'; await load();
    });
    PC.on('store', function (c) { if (c === 'pulled') load(); });
    Store.idleWhen(function () { return !audio.paused; });
    load();
    window.PlayerDbg = { play: play, state: function () { return { idx: idx, q: queue.length, view: view }; } };
  });
})();
