// The take cards under the circle: colour, picture of the loudness, and the take number (each can be switched in ⚙️).
// Tap a card to hear it; tap again to stop.
(function () {
  'use strict';
  var h = PC.h, box, empty, playingId = null, max = 24;
  var Strip = window.Strip = {
    init: function (el, emptyEl) { box = el; empty = emptyEl; PC.on('store', function (c) { if (c === 'takes' || c === 'pulled') Strip.refresh(); });
      PC.on('setting', function (k) { if (/^card/.test(k)) Strip.refresh(); }); PC.on('playing', function (on) { if (!on) { playingId = null; mark(); } }); Strip.refresh(); },
    card: function (t, opts) {
      opts = opts || {};
      var s = PC.settings, col = s.cardColor ? (t.color || PC.colorFor(t.take_no || 0)) : '';
      var c = h('button', { 'class': 'card', type: 'button', 'data-id': t.id, style: col ? 'background:' + col : null, 'aria-label': t.name + ' by ' + t.player });
      if (s.cardWave) { var cv = h('canvas', { width: 160, height: 44 }); c.appendChild(cv); PC.drawPeaks(cv, t.peaks || [], '#2f2d3d'); }
      if (s.cardNumber || (!s.cardWave && !s.cardColor)) c.appendChild(h('span', { 'class': 'cardNum', text: s.cardNumber ? t.name : '♪' }));
      c.appendChild(h('span', { 'class': 'cardMeta', text: (t.player || '?').charAt(0) + ' · ' + PC.fmt((t.duration_ms || 0) / 1000) + (t._up ? ' ☁️' : '') }));
      if (!opts.noPlay) c.addEventListener('click', function () { Strip.toggle(t); });
      return c;
    },
    toggle: async function (t) {
      if (Strip.locked && Strip.locked()) return;             // never while a take is being recorded
      if (playingId === t.id) { PC.stopPlayback(); playingId = null; mark(); return; }
      try {
        var blob = await Store.blobFor(t); playingId = t.id; mark();
        Notes.setContext({ item: t.id, label: t.name + ' (' + t.player + ')' });
        PC.playBlob(blob);
      } catch (e) { PC.err('Could not play ' + t.name, e); playingId = null; mark(); }
    },
    refresh: async function () {
      if (!box) return;
      var list = Store.live(await Store.all('takes')).sort(function (a, b) { return a.taken_at < b.taken_at ? 1 : -1; }).slice(0, max);
      box.querySelectorAll('.card').forEach(function (n) { n.remove(); });
      empty.hidden = list.length > 0;
      list.forEach(function (t) { box.appendChild(Strip.card(t)); });
      mark();
    },
    locked: null
  };
  function mark() { if (box) box.querySelectorAll('.card').forEach(function (n) { n.classList.toggle('playing', n.dataset.id === playingId); }); }
})();
