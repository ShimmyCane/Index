// Collapsible panels written in the page HTML (header with icon, name and a ▸/▾ marker). State is remembered per device.
(function () {
  'use strict';
  var saved = PC.store.get('panels', {});
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('section.panel[data-panel]').forEach(function (sec) {
      var id = sec.dataset.panel, head = sec.querySelector('.panelHead'), open = id in saved ? saved[id] : sec.dataset.open !== 'false';
      function apply() { sec.dataset.collapsed = String(!open); head.setAttribute('aria-expanded', String(open)); }
      apply();
      head.addEventListener('click', function () { open = !open; apply(); saved[id] = open; PC.store.set('panels', saved); });
    });
  });
})();
