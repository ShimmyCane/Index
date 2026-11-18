/* Drafting — pipeline: one entry point for the page and the tests.
   exportDetail(detail, { version, library }) -> {
     ok, filename, version, dxf, lin, pat, built, parsed, lint
   }
   Steps: primitives (with blocks) -> DXF text -> .LIN and .PAT text (only if used) -> read the DXF
   back -> lint. If the writer refuses (for example a non-finite coordinate), ok is false and
   lint.validity says why. library: { id: detail } so a block item can find its source. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { exportDetail: api.exportDetail, slug: api.slug });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  function mod(file, name) {
    if (isNode) return require('./' + file);
    var g = typeof self !== 'undefined' ? self : globalThis;
    if (!g.DRAFT || !g.DRAFT[name]) throw new Error('pipeline: ' + file + ' not loaded (load the js files in order)');
    return g.DRAFT;
  }
  var P = mod('primitives.js', 'buildPrims');
  var W = mod('dxf_write.js', 'writeDXF');
  var R = mod('dxf_read.js', 'parseDXF');
  var L = mod('linter.js', 'lintExport');
  var T = mod('text_files.js', 'writeLIN');

  function slug(s) {
    return String(s || 'detail').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'detail';
  }

  function exportDetail(detail, opts) {
    opts = opts || {};
    var version = opts.version === 'AC1009' ? 'AC1009' : 'AC1027';
    var library = opts.library || {};
    var built = P.buildPrims(detail, library);
    var filename = slug(detail && detail.name) + '.dxf';
    var lin = null, pat = null;
    var realLT = built.lineTypes.filter(function (t) { return t && t.name !== 'CONTINUOUS'; });
    if (realLT.length) lin = T.writeLIN(realLT);
    if (built.patterns.length) pat = T.writePAT(built.patterns);

    var dxf;
    try {
      dxf = W.writeDXF(built.prims, { version: version, blocks: built.blocks, lineTypes: built.lineTypes, patterns: built.patterns });
    } catch (e) {
      return {
        ok: false, filename: filename, version: version, dxf: null, lin: lin, pat: pat, built: built, parsed: null,
        lint: { valid: false, validity: [{ id: 'writer', label: 'Writer', ok: false, reason: e.message }], checks: [], score: 0, showViewer: false, dropped: built.dropped }
      };
    }
    var parsed = R.parseDXF(dxf);
    var lint = L.lintExport({ built: built, parsed: parsed, version: version });
    return { ok: lint.valid, filename: filename, version: version, dxf: dxf, lin: lin, pat: pat, built: built, parsed: parsed, lint: lint };
  }

  return { exportDetail: exportDetail, slug: slug };
});
