// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = "0.4";
window.APP_CHANGELOG = [
  { version: "0.4", date: "2026-11-03", changes: [
    "Combat: fish have health; small fish go in one bite, bigger fish take several bites.",
    "Danger at a glance: a coral dot for fish that can hurt you, a mint dot for fish you can eat.",
    "Chum from fish of size 4 or more draws small fish in to feed.",
    "Fish eat fish with bites, not instantly. Notes are sent once when signing in."
  ] },
  { version: "0.3", date: "2026-11-03", changes: [
    "Family sign-in is in ⚙️ only.",
    "Settings sections start collapsed.",
    "Notes go to the cloud database, kept on the device until sent."
  ] },
  { version: "0.2", date: "2026-11-03", changes: [
    "20 tiers, 88 species.",
    "Fish eat fish; the sea adapts to the player.",
    "Difficulty is the predator:prey ratio."
  ] },
  { version: "0.1", date: "2026-11-03", changes: [
    "First playable MVP: 20 levels, lock-on hunters, three lives."
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
