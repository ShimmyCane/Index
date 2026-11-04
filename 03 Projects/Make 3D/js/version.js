// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = "2.0.0";
window.APP_CHANGELOG = [
  { version: "2.0.0", date: "2026-11-03", changes: [
    "Materials: colour, roughness, metalness and patterns (wood, tile, stripes, leaf). Each change is a history step.",
    "Lighting reflects a generated room.",
    "Export a GLB (3-D) file.",
    "Staged passes: a material edit reruns only the material stage."
  ] },
  { version: "1.0.0", date: "2026-11-03", changes: [
    "First version kept as V1 (its own copy of the page, with its own saved state)."
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
