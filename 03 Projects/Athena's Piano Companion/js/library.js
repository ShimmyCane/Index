// Library: every take, with its details editable (name, artist, album, rating, description, file name) and playback.
// Edits are kept on the device and copied to the family database when signed in.
(function () {
  'use strict';
  var h = PC.h, list, playingId = null, timers = {}, takes = [];
  function stars(t, onChange) {
    var box = h('span', { 'class': 'stars' });
    for (var i = 1; i <= 5; i++) (function (i) {
      var b = h('button', { type: 'button', 'aria-label': i + ' star' + (i > 1 ? 's' : ''), text: '★', 'class': i <= t.rating ? 'on' : '' });
      b.addEventListener('click', function () { var v = t.rating === i ? 0 : i; t.rating = v; box.querySelectorAll('button').forEach(function (x, k) { x.classList.toggle('on', k < v); }); onChange(); });
      box.appendChild(b);
    })(i);
    return box;
  }
  function field(label, input) { return h('div', {}, [h('label', { text: label }), input]); }
  function save(t) { clearTimeout(timers[t.id]); timers[t.id] = setTimeout(function () { Store.save('takes', t); }, 400); }
  function row(t) {
    var play = h('button', { 'class': 'play', type: 'button', 'aria-label': 'Play ' + t.name, text: '▶' });
    play.addEventListener('click', async function () {
      if (playingId === t.id) { PC.stopPlayback(); return; }
      try { var blob = await Store.blobFor(t); playingId = t.id; paintPlay(); PC.playBlob(blob); Notes.setContext({ item: t.id, label: t.name }); }
      catch (e) { PC.err('Could not play ' + t.name, e); }
    });
    play.dataset.id = t.id;
    var name = h('input', { type: 'text', 'class': 'fld', value: t.name }); name.addEventListener('input', function () { t.name = name.value; save(t); });
    var player = h('input', { type: 'text', 'class': 'fld', value: t.player, list: 'players' }); player.addEventListener('input', function () { t.player = player.value; save(t); });
    var album = h('input', { type: 'text', 'class': 'fld', value: t.album }); album.addEventListener('input', function () { t.album = album.value; save(t); });
    var fname = h('input', { type: 'text', 'class': 'fld', value: t.file_name }); fname.addEventListener('input', function () { t.file_name = fname.value; save(t); });
    var desc = h('textarea', { rows: 2, placeholder: 'A few words about it' }); desc.value = t.description || ''; desc.addEventListener('input', function () { t.description = desc.value; save(t); });
    var cv = h('canvas', { width: 600, height: 34 }); PC.drawPeaks(cv, t.peaks || [], '#2f2d3d');
    var dl = h('button', { 'class': 'btn small', type: 'button', text: '⬇ File' });
    dl.addEventListener('click', async function () {
      try { var b = await Store.blobFor(t), a = h('a', { href: URL.createObjectURL(b), download: t.file_name || (t.name + '.wav') }); document.body.appendChild(a); a.click(); a.remove(); }
      catch (e) { PC.err('Download', e); }
    });
    return h('div', { 'class': 'trow', style: 'border-left-color:' + (t.color || '#2f2d3d') }, [play, h('div', {}, [
      h('div', { 'class': 'fields' }, [field('Name', name), field('Artist', player), field('Album', album), field('File name', fname),
        h('div', { 'class': 'wide' }, [cv]), h('div', { 'class': 'wide' }, [field('Description', desc)])]),
      h('div', { 'class': 'meta' }, [stars(t, function () { save(t); }), h('span', { text: PC.fmt((t.duration_ms || 0) / 1000) }),
        h('span', { text: new Date(t.taken_at).toLocaleString() }), h('span', { text: Math.round((t.size_bytes || 0) / 1024) + ' KB' }),
        h('span', { text: t.source === 'composer' ? '🎛️ composed' : '🎹 recorded' }),
        h('span', { text: t._up ? '☁️ in the family database' : '💾 this device only' }), dl])])]);
  }
  function paintPlay() { document.querySelectorAll('.trow .play').forEach(function (b) { var on = b.dataset.id === playingId; b.classList.toggle('on', on); b.textContent = on ? '■' : '▶'; }); }

  async function render() {
    takes = (await Store.all('takes')).sort(function (a, b) { return a.taken_at < b.taken_at ? 1 : -1; });
    var q = document.getElementById('q').value.trim().toLowerCase(), fp = document.getElementById('fPlayer').value,
      fr = Number(document.getElementById('fRating').value), fs = document.getElementById('fSource').value;
    var sel = document.getElementById('fPlayer'), names = {}; takes.forEach(function (t) { names[t.player] = 1; });
    if (sel.options.length - 1 !== Object.keys(names).length) {
      sel.innerHTML = '<option value="">Everyone</option>'; Object.keys(names).sort().forEach(function (n) { sel.appendChild(h('option', { value: n, text: n })); }); sel.value = fp;
    }
    var shown = takes.filter(function (t) {
      return (!fp || t.player === fp) && t.rating >= fr && (!fs || t.source === fs) &&
        (!q || (t.name + ' ' + t.album + ' ' + t.description + ' ' + t.player).toLowerCase().indexOf(q) >= 0);
    });
    list.textContent = '';
    document.getElementById('count').textContent = shown.length + ' of ' + takes.length + ' takes';
    if (!shown.length) list.appendChild(h('div', { 'class': 'empty', text: takes.length ? 'No takes match.' : 'No takes yet. Record some on the first page.' }));
    shown.forEach(function (t) { list.appendChild(row(t)); });
    paintPlay();
  }
  document.addEventListener('DOMContentLoaded', function () {
    list = document.getElementById('list');
    var dl = h('datalist', { id: 'players' }, [h('option', { value: 'Athena' }), h('option', { value: 'Felix' })]); document.body.appendChild(dl);
    Chrome.init({ page: 'library', desc: 'The library shows every take. Change names, artists, albums, ratings and descriptions here; they are copied to the family database so other pages can use them.', sections: [] });
    ['q', 'fPlayer', 'fRating', 'fSource'].forEach(function (id) { document.getElementById(id).addEventListener('input', render); });
    var busy = false;
    PC.on('store', function (c) { if (c === 'pulled' && !document.activeElement.closest('.trow')) render(); });
    PC.on('playing', function (on) { if (!on) { playingId = null; paintPlay(); } });
    Store.idleWhen(function () { return PC.isPlaying() || !!document.activeElement.closest('.trow'); });
    render();
  });
})();
