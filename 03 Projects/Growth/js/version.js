// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = "0.1.0";
window.APP_CHANGELOG = [
  { version: "0.1.0", date: "2026-11-04", changes: [
    "Synced to the nursery standard: a version log in the settings.",
    "Planning page with the rabbit world and the paper decay world.",
    "Settings: show errors at the bottom, reset a world, import a world."
  ] }
];
(function () {
  var now = document.getElementById('versionNow'), list = document.getElementById('versionList');
  if (!now || !list) return;                      // the page has no version panel
  now.textContent = 'v' + window.APP_VERSION;
  list.textContent = '';
  window.APP_CHANGELOG.forEach(function (entry) {
    var li = document.createElement('li'), head = document.createElement('b'), ul = document.createElement('ul');
    head.textContent = 'v' + entry.version + ' · ' + entry.date;
    entry.changes.forEach(function (c) { var x = document.createElement('li'); x.textContent = c; ul.appendChild(x); });
    li.appendChild(head); li.appendChild(ul); list.appendChild(li);
  });
})();
