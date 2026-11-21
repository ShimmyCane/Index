// Home: big buttons to every page, who is playing, and a line about today. Record is the biggest.
(function () {
  'use strict';
  var h = PC.h, $ = function (id) { return document.getElementById(id); };
  var NAMES = { record: 'Record', player: 'Listen', library: 'Library', browse: 'Browse', compose: 'Compose' };
  var HREF = { record: 'record.html', player: 'player.html', library: 'library.html', browse: 'browse.html', compose: 'compose.html' };
  async function paint() {
    var takes = Store.live(await Store.all('takes')), today = PC.sessionId(new Date());
    var mine = takes.filter(function (t) { return PC.sessionOf(t) === today; });
    $('today').textContent = mine.length ? 'Today: ' + mine.length + (mine.length === 1 ? ' take' : ' takes') + ' so far' : (takes.length ? 'A new day. The next take is Take 1.' : 'No takes yet. Tap Record to begin.');
    var days = {}; takes.forEach(function (t) { var d = PC.sessionOf(t); days[d] = (days[d] || 0) + 1; });
    var box = $('days'); box.textContent = '';
    Object.keys(days).sort().reverse().slice(0, 30).forEach(function (d) {
      box.appendChild(h('div', { 'class': 'dayRow' }, [new Date(d.slice(2) + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }), days[d] + (days[d] === 1 ? ' take' : ' takes')]));
    });
    if (!Object.keys(days).length) box.appendChild(h('div', { 'class': 'hint', text: 'Nothing yet.' }));
  }
  document.addEventListener('DOMContentLoaded', function () {
    Players.mount($('who'));
    Chrome.init({ page: 'home', desc: 'Pick where to go. Everything you can change is in ⚙️ on each page.', sections: [] });
    var last = PC.store.get('lastPage', null);
    if (last && last !== 'record' && HREF[last]) { $('cont').hidden = false; $('cont').href = HREF[last]; $('contName').textContent = 'Back to ' + NAMES[last]; }
    PC.on('store', paint); paint();
  });
})();
