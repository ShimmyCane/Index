// Delete with a recycle bin. A deleted take is only marked (deleted_at). It can be restored from the bin;
// takes that have sat there for 30 days are removed for good (the page does it when signed in, see Store.purgeOld).
(function () {
  'use strict';
  var h = PC.h, bar = null, timer = null, tick = null;
  function hide() { if (bar) bar.hidden = true; clearTimeout(timer); clearInterval(tick); }
  // The undo message stays up for five minutes.
  function toast(takes, undo) {
    if (!bar) {
      bar = h('div', { 'class': 'undoBar', role: 'status' }); document.body.appendChild(bar);
    }
    var left = 300, msg = h('span'), btn = h('button', { 'class': 'btn small', type: 'button', text: '↩ Undo' }), x = h('button', { 'class': 'btn small icon', type: 'button', 'aria-label': 'Dismiss', text: '✖' });
    function paint() { msg.textContent = '🗑 ' + (takes.length === 1 ? '“' + takes[0].name + '”' : takes.length + ' takes') + ' moved to the recycle bin for 30 days. Undo for ' + PC.fmt(left); }
    btn.addEventListener('click', function () { undo(); hide(); });
    x.addEventListener('click', hide);
    bar.textContent = ''; [msg, btn, x].forEach(function (n) { bar.appendChild(n); }); bar.hidden = false; paint();
    clearTimeout(timer); clearInterval(tick);
    tick = setInterval(function () { left--; paint(); }, 1000); timer = setTimeout(hide, 300000);
  }
  var Bin = window.Bin = {
    // Ask, then move the takes to the bin (a second message offers Undo for five minutes).
    remove: async function (takes) {
      takes = [].concat(takes); if (!takes.length) return false;
      var q = takes.length === 1 ? 'Delete “' + takes[0].name + '”?' : 'Delete ' + takes.length + ' takes?';
      if (!window.confirm(q)) return false;
      var now = new Date().toISOString();
      for (var i = 0; i < takes.length; i++) await Store.save('takes', takes[i], { deleted_at: now });
      toast(takes, function () { Bin.restore(takes); });
      PC.emit('bin'); return true;
    },
    restore: async function (takes) {
      takes = [].concat(takes);
      for (var i = 0; i < takes.length; i++) await Store.save('takes', takes[i], { deleted_at: null });
      PC.emit('bin');
    },
    // Delete forever (only from the bin).
    forever: async function (take) {
      if (!window.confirm('Delete “' + take.name + '” for good? This cannot be undone.')) return false;
      try { if (Family.signedIn() && take.file_path) await Family.remove(take.file_path); } catch (e) { PC.err('Removing the audio file', e); }
      await Store.del('takes', take.id); PC.emit('bin'); return true;
    },
    daysLeft: function (t) { return Math.max(0, 30 - Math.floor((Date.now() - new Date(t.deleted_at).getTime()) / 86400000)); }
  };
  document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { Store.purgeOld().catch(function (e) { PC.err('Purge', e); }); }, 4000); });
  PC.on('family', function () { Store.purgeOld().catch(function (e) { PC.err('Purge', e); }); });
})();
