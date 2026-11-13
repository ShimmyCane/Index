// Start-up: pick a random mode (never the same one twice in a row) unless the address names one, e.g. index.html#strings.
(function () {
  'use strict';
  function pickMode() {
    var fromHash = (location.hash || '').replace('#', '');
    if (RS.modes[fromHash]) return fromHash;
    var last = '';
    try { last = localStorage.getItem('rs.last') || ''; } catch (e) { /* storage blocked */ }
    var choices = RS.order.filter(function (id) { return id !== last && RS.hidden.indexOf(id) < 0; });
    return choices[Math.floor(Math.random() * choices.length)];
  }
  document.addEventListener('DOMContentLoaded', function () {
    RS.init();
    RS.setMode(pickMode());
    window.addEventListener('hashchange', function () {            // a bookmarked #mode also works while the page is open
      var id = (location.hash || '').replace('#', '');
      if (RS.modes[id] && id !== RS.curId) RS.setMode(id);
    });
  });
})();
