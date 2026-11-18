/* Drafting — pipeline: one entry point for the page and the tests.
   exportDetail(detail, { version }) -> { ok, filename, dxf, built, parsed, lint }
   Steps: primitives -> DXF text -> read back -> lint. If the writer refuses (for example a
   non-finite coordinate), ok is false and lint.validity says why. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { exportDetail: api.exportDetail, slug: api.slug });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var P = (typeof require === 'function' && typeof module !== 'undefined') ? require('./primitives.js') : root_or_draft('buildPrims');
  var W = (typeof require === 'function' && typeof module !== 'undefined') ? require('./dxf_write.js') : root_or_draft('writeDXF');
  var R = (typeof require === 'function' && typeof module !== 'undefined') ? require('./dxf_read.js') : root_or_draft('parseDXF');
  var L = (typeof require === 'function' && typeof module !== 'undefined') ? require('./linter.js') : root_or_draft('lintExport');

  function root_or_draft(name) {
    var g = typeof self !== 'undefined' ? self : globalThis;
    var d = g.DRAFT || {};
    if (!d[name]) throw new Error('pipeline: ' + name + ' not loaded (load the js files in order)');
    return d;
  }

  function slug(s) {
    return String(s || 'detail').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'detail';
  }

  function exportDetail(detail, opts) {
    opts = opts || {};
    var version = opts.version === 'AC1009' ? 'AC1009' : 'AC1027';
    var built = (P.buildPrims || root_or_draft('buildPrims').buildPrims)(detail);
    var filename = slug(detail && detail.name) + '.dxf';
    var dxf;
    try {
      dxf = (W.writeDXF || root_or_draft('writeDXF').writeDXF)(built.prims, { version: version });
    } catch (e) {
      return {
        ok: false, filename: filename, dxf: null, built: built, parsed: null,
        lint: { valid: false, validity: [{ id: 'writer', label: 'Writer', ok: false, reason: e.message }], checks: [], score: 0, showViewer: false, dropped: built.dropped }
      };
    }
    var parsed = (R.parseDXF || root_or_draft('parseDXF').parseDXF)(dxf);
    var lint = (L.lintExport || root_or_draft('lintExport').lintExport)({ built: built, parsed: parsed, version: version });
    return { ok: lint.valid, filename: filename, dxf: dxf, built: built, parsed: parsed, lint: lint, version: version };
  }

  return { exportDetail: exportDetail, slug: slug };
});
