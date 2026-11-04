// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = "0.1.0";
window.APP_CHANGELOG = [
  { version: "0.1.0", date: "2026-10-27", changes: [
    "MVP: story page, world page and under the hood.",
    "Database tables are written but not applied yet."
  ] }
];

// Builds the version list. Safe to call again: apps that redraw their settings call it after each redraw.
window.renderVersionLog = function () {
  var now = document.getElementById('versionNow'), list = document.getElementById('versionList');
  if (!now || !list) return;                      // the drawer is not on the page
  now.textContent = 'v' + window.APP_VERSION;
  list.textContent = '';
  window.APP_CHANGELOG.forEach(function (entry) {
    var li = document.createElement('li'), head = document.createElement('b'), ul = document.createElement('ul');
    head.textContent = 'v' + entry.version + ' · ' + entry.date;
    entry.changes.forEach(function (c) { var x = document.createElement('li'); x.textContent = c; ul.appendChild(x); });
    li.appendChild(head); li.appendChild(ul); list.appendChild(li);
  });
};
window.renderVersionLog();
