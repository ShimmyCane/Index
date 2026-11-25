/* Picks a sheet from the page address. ?sheet=thanksgiving loads the test sheet in private/ (not in git,
   so the public page never asks for it). With no ?sheet=, the page keeps the Woods sheet from js/sheet.js.
   document.write runs only while the page is loading, before js/app.js, so the sheet is ready in time. */
(function () {
  'use strict';
  var TEST_SHEETS = {
    thanksgiving: 'private/thanksgiving/sheet.js',
    'motor-home': 'private/motor-home-decoration/sheet.js'
  };
  var name = '';
  try { name = (new URLSearchParams(window.location.search).get('sheet') || '').toLowerCase(); } catch (e) { name = ''; }
  if (Object.prototype.hasOwnProperty.call(TEST_SHEETS, name)) {
    document.write('<script src="' + TEST_SHEETS[name] + '"><\/script>');
  }
})();
