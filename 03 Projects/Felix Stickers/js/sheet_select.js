/* Loads the extra sheets that live in private/ (git-ignored: they stay on Jimmy's device and are never
   published). Every sheet is loaded, so the bottom ◀ ▶ can leaf through them. On the public copy these
   files are missing, so the broken script is removed and the page shows the Woods sheet from js/sheet.js.
   document.write runs only while the page is loading, before js/app.js, so the sheets are ready in time. */
(function () {
  'use strict';
  var EXTRA_SHEETS = [
    'private/thanksgiving/sheet.js',
    'private/motor-home-decoration/sheet.js'
  ];
  EXTRA_SHEETS.forEach(function (src) {
    document.write('<script src="' + src + '" onerror="this.remove()"><\/script>');
  });
})();
