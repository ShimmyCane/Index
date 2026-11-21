// Who is playing: one button that steps through Athena, Felix, Ying, Jimmy and Guest, in that order.
// "Players" are only the name a take is saved under (not separate sign-ins). Guest asks for a name the first time.
(function () {
  'use strict';
  var h = PC.h, mounted = [];
  function label() {
    var p = PC.settings.player, g = PC.store.get('guestName', '');
    return p === 'Guest' && g ? 'Guest · ' + g : p;
  }
  // The name saved on a take: "Guest · Sam" for a named guest, otherwise the player's name.
  function saveName() { return label(); }
  function paint() {
    mounted.forEach(function (b) {
      b.textContent = ''; b.appendChild(h('span', { 'class': 'pIcon', text: PC.ICONS[PC.settings.player] || '🎵' }));
      b.appendChild(h('span', { text: label() })); b.appendChild(h('small', { text: 'tap for next' }));
    });
  }
  function next() {
    var i = PC.PLAYERS.indexOf(PC.settings.player), n = PC.PLAYERS[(i + 1) % PC.PLAYERS.length];
    PC.set('player', n);
    if (n === 'Guest' && !PC.store.get('guestAsked', false)) {
      PC.store.set('guestAsked', true);
      var name = window.prompt('Guest, what is your first name? (You can leave it empty.)', '');
      PC.store.set('guestName', (name || '').trim().slice(0, 20));
    }
    paint();
  }
  window.Players = {
    mount: function (el) { var b = h('button', { 'class': 'playerBtn', type: 'button', 'aria-label': 'Who is playing. Tap for the next person.' }); b.addEventListener('click', next); el.appendChild(b); mounted.push(b); paint(); return b; },
    name: saveName, next: next
  };
  PC.on('setting', function (k) { if (k === 'player') paint(); });
})();
