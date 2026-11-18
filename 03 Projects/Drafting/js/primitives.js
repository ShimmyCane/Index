/* Drafting — primitives: one list in real inches, built from a library detail (Quick Detail items).
   buildPrims(detail) -> { prims, dropped, factor, scale, warnings }
   Used by the writer, the linter and the page. One list feeds every output (nursery lesson).

   Item kinds (Quick Detail, sketch/core.js, hatch.js, annot.js):
     stroke  { pts: [[x, y, pressure, dt], ...] }          -> line
     hatch   { pattern, pts: [[x, y], ...] closed }         -> hatch (solid) or boundary line (pattern)
     note    { text, at: [x, y], size (paper inches) }     -> text lines
   Not exported yet, reported in `dropped`:
     dim     -> increment 2 (lines and text)
     block   -> increment 2 (BLOCK + INSERT)
     image   -> not exported (background picture)
   Units: real inches. The scale factor only sets paper size of notes (paper inch -> real inches). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { buildPrims: api.buildPrims, SCALE_FACTORS: api.SCALE_FACTORS });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // Real inches per paper inch (Quick Detail sketch/units.js).
  var SCALE_FACTORS = {
    '6"=1\'-0"': 2,
    '3"=1\'-0"': 4,
    '1 1/2"=1\'-0"': 8,
    '1"=1\'-0"': 12
  };
  var SOLID_KEYS = { solid: true, steel: true };
  var LINE_LAYER = 'DRAFT-LINE', HATCH_LAYER = 'DRAFT-HATCH', TEXT_LAYER = 'DRAFT-TEXT';

  function buildPrims(detail) {
    var warnings = [], dropped = [], prims = [];
    var scale = detail && detail.scale ? detail.scale : '3"=1\'-0"';
    var factor = SCALE_FACTORS[scale];
    if (!factor) { factor = SCALE_FACTORS['3"=1\'-0"']; warnings.push('unknown scale "' + scale + '", using 3"=1\'-0"'); }
    var items = (detail && detail.items) || [];

    items.forEach(function (it) {
      var id = it.id || '(no id)';
      if (it.kind === 'stroke') {
        var pts = (it.pts || []).map(function (q) { return [q[0], q[1]]; });
        if (pts.length < 2) { dropped.push({ id: id, kind: 'stroke', reason: 'single point' }); return; }
        prims.push({ k: 'line', layer: LINE_LAYER, pts: pts, closed: false, source: id });
      } else if (it.kind === 'hatch') {
        var hp = (it.pts || []).map(function (q) { return [q[0], q[1]]; });
        if (hp.length < 3) { dropped.push({ id: id, kind: 'hatch', reason: 'boundary has fewer than 3 points' }); return; }
        var solid = !!SOLID_KEYS[it.pattern];
        if (solid) prims.push({ k: 'hatch', layer: HATCH_LAYER, pts: hp, solid: true, pattern: it.pattern, source: id });
        else prims.push({ k: 'line', layer: HATCH_LAYER, pts: hp, closed: true, pattern: it.pattern, boundaryOnly: true, source: id });
      } else if (it.kind === 'note') {
        var size = it.size || 0.125;
        var h = size * factor;                  // real inches
        var lh = h * 1.5;                        // line pitch, as in Quick Detail (noteLayout)
        var lines = String(it.text || '').split('\n');
        lines.forEach(function (ln, i) {
          if (!ln) return;
          prims.push({ k: 'text', layer: TEXT_LAYER, at: [it.at[0], it.at[1] + i * lh], text: ln, height: h, rot: 0, source: id });
        });
      } else if (it.kind === 'dim') {
        dropped.push({ id: id, kind: 'dim', reason: 'dimensions come in increment 2' });
      } else if (it.kind === 'block') {
        dropped.push({ id: id, kind: 'block', reason: 'blocks come in increment 2' });
      } else if (it.kind === 'image') {
        dropped.push({ id: id, kind: 'image', reason: 'background pictures are not exported' });
      } else {
        dropped.push({ id: id, kind: it.kind || 'unknown', reason: 'unknown item kind' });
      }
    });

    return { prims: prims, dropped: dropped, factor: factor, scale: scale, warnings: warnings };
  }

  return { buildPrims: buildPrims, SCALE_FACTORS: SCALE_FACTORS };
});
