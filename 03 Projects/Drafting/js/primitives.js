/* Drafting — primitives: one list in real inches, built from a library detail (Quick Detail items).
   buildPrims(detail, library) -> {
     prims,          top-level list (what the drawing shows)
     blocks,         { BLOCK_NAME: prims } — block definitions, in the source's own coordinates
     dropped,        items not exported, each with a reason
     factor, scale, warnings,
     lineTypes,      real line-type definitions used (for CONTINUOUS plus the rest)
     patterns        real hatch-pattern definitions used
   }
   library: { id: detail } so a block item can find its source.

   Item kinds (Quick Detail sketch/core.js, hatch.js, annot.js, blocks.js):
     stroke  { pts: [[x, y, pressure, dt], ...], lt? }     -> line (lt: continuous | dashed | dashdot)
     hatch   { pattern, pts: [[x, y], ...] closed }        -> solid hatch | pattern hatch | boundary (unknown pattern)
     note    { text, at: [x, y], size (paper inches) }     -> text lines
     dim     { mode: 'ortho', p1, p2, at, size }           -> extension lines, dimension line, length text
     block   { sourceId, at: [x, y], k }                   -> INSERT of a block made from the source detail
   Not exported (reported in dropped): dim aligned/angular, image, unknown kinds.
   Units: real inches. The scale factor turns paper sizes into real inches (libraries.js). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { buildPrims: api.buildPrims, SCALE_FACTORS: api.SCALE_FACTORS });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var LIB = (typeof require === 'function' && typeof module !== 'undefined')
    ? require('./libraries.js')
    : (root_draft().LINE_TYPES ? root_draft() : null);
  function root_draft() { var g = typeof self !== 'undefined' ? self : globalThis; return g.DRAFT || {}; }
  function lib() { return LIB && LIB.LINE_TYPES ? LIB : root_draft(); }

  // Real inches per paper inch (Quick Detail sketch/units.js).
  var SCALE_FACTORS = {
    '6"=1\'-0"': 2,
    '3"=1\'-0"': 4,
    '1 1/2"=1\'-0"': 8,
    '1"=1\'-0"': 12
  };
  var SOLID_KEYS = { solid: true, steel: true };
  var MAX_BLOCK_DEPTH = 5;
  var LINE_LAYER = 'DRAFT-LINE', HATCH_LAYER = 'DRAFT-HATCH', TEXT_LAYER = 'DRAFT-TEXT', DIM_LAYER = 'DRAFT-DIM';

  function slug(s) {
    return String(s || 'detail').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'DETAIL';
  }

  function fmtInches(v) {
    var s = (Math.round(v * 1000) / 1000).toString();
    return s + '"';
  }

  function buildPrims(detail, library) {
    library = library || {};
    var warnings = [], dropped = [];
    var scale = detail && detail.scale ? detail.scale : '3"=1\'-0"';
    var factor = SCALE_FACTORS[scale];
    if (!factor) { factor = SCALE_FACTORS['3"=1\'-0"']; warnings.push('unknown scale "' + scale + '", using 3"=1\'-0"'); }
    var L = lib();
    var blocks = {};
    var blockState = {};   // name -> 'building' | 'done' | 'failed'
    var usedLT = {}, usedPat = {};

    function noteLT(key) { if (key) usedLT[key] = true; }
    function notePat(key) { if (key) usedPat[key] = true; }

    // Convert one detail's items to prims. depth: nesting level (blocks inside blocks).
    function convert(d, depth, owner, sink) {
      var out = [];
      var items = (d && d.items) || [];
      items.forEach(function (it) {
        var id = it.id || '(no id)';
        function drop(reason) { sink.dropped.push({ id: id, kind: it.kind || 'unknown', reason: reason, where: owner }); }

        if (it.kind === 'stroke') {
          var pts = (it.pts || []).map(function (q) { return [q[0], q[1]]; });
          if (pts.length < 2) return drop('single point');
          var lt = it.lt && L.LINE_TYPES[it.lt] ? it.lt : 'continuous';
          if (it.lt && !L.LINE_TYPES[it.lt]) sink.warnings.push('unknown line type "' + it.lt + '" on ' + id + ', using continuous');
          noteLT(lt);
          out.push({ k: 'line', layer: LINE_LAYER, pts: pts, closed: false, lt: L.LINE_TYPES[lt].name, source: id });
        } else if (it.kind === 'hatch') {
          var hp = (it.pts || []).map(function (q) { return [q[0], q[1]]; });
          if (hp.length < 3) return drop('boundary has fewer than 3 points');
          if (SOLID_KEYS[it.pattern]) {
            out.push({ k: 'hatch', layer: HATCH_LAYER, pts: hp, solid: true, pattern: null, source: id });
          } else if (L.PATTERNS[it.pattern]) {
            notePat(it.pattern);
            out.push({ k: 'hatch', layer: HATCH_LAYER, pts: hp, solid: false, pattern: it.pattern, patternName: L.PATTERNS[it.pattern].name, source: id });
          } else {
            out.push({ k: 'line', layer: HATCH_LAYER, pts: hp, closed: true, lt: 'CONTINUOUS', boundaryOnly: true, unknownPattern: it.pattern || '(none)', source: id });
          }
        } else if (it.kind === 'note') {
          var size = it.size || 0.125;
          var h = size * factor;
          var lh = h * 1.5;
          String(it.text || '').split('\n').forEach(function (ln, i) {
            if (!ln) return;
            out.push({ k: 'text', layer: TEXT_LAYER, at: [it.at[0], it.at[1] + i * lh], text: ln, height: h, rot: 0, source: id });
          });
        } else if (it.kind === 'dim') {
          if (it.mode !== 'ortho' && it.mode !== undefined) return drop('only ortho dimensions are exported (aligned and angular later)');
          var p1 = it.p1, p2 = it.p2, at = it.at;
          if (!p1 || !p2 || !at) return drop('dimension has no points');
          var hgt = (it.size || 0.125) * factor;
          var dxs = p2[0] - p1[0], dys = p2[1] - p1[1];
          var len = Math.abs(dxs) >= Math.abs(dys) ? Math.abs(dxs) : Math.abs(dys);
          var label = fmtInches(len);
          if (Math.abs(dxs) >= Math.abs(dys)) {
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[p1[0], at[1]], [p2[0], at[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[p1[0], p1[1]], [p1[0], at[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[p2[0], p2[1]], [p2[0], at[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'text', layer: DIM_LAYER, at: [(p1[0] + p2[0]) / 2 - label.length * hgt * 0.3, at[1] - hgt * 0.5], text: label, height: hgt, rot: 0, source: id });
          } else {
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[at[0], p1[1]], [at[0], p2[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[p1[0], p1[1]], [at[0], p1[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'line', layer: DIM_LAYER, pts: [[p2[0], p2[1]], [at[0], p2[1]]], closed: false, lt: 'CONTINUOUS', source: id });
            out.push({ k: 'text', layer: DIM_LAYER, at: [at[0] + hgt * 0.4, (p1[1] + p2[1]) / 2], text: label, height: hgt, rot: 0, source: id });
          }
        } else if (it.kind === 'block') {
          if (depth >= MAX_BLOCK_DEPTH) return drop('blocks nested deeper than ' + MAX_BLOCK_DEPTH);
          var src = library[it.sourceId];
          if (!src) return drop('source detail "' + it.sourceId + '" is not in the library');
          if (it.sourceId === (d && d.id)) return drop('a block cannot contain itself');
          var bname = 'BLK_' + slug(src.name);
          var ok = buildBlock(bname, it.sourceId, src, depth + 1, sink);
          if (!ok) return drop('source "' + src.name + '" could not be made into a block');
          out.push({ k: 'insert', layer: LINE_LAYER, name: bname, at: [it.at[0], it.at[1]], k_scale: it.k > 0 ? it.k : 1, source: id });
        } else if (it.kind === 'image') {
          drop('background pictures are not exported');
        } else {
          drop('unknown item kind');
        }
      });
      return out;
    }

    function buildBlock(bname, srcId, src, depth, sink) {
      if (blockState[bname] === 'done') return true;
      if (blockState[bname] === 'building') return false;   // a loop through blocks
      blockState[bname] = 'building';
      var content = convert(src, depth, 'block ' + bname, sink);
      blocks[bname] = content;
      blockState[bname] = 'done';
      return true;
    }

    var sink = { dropped: dropped, warnings: warnings };
    var prims = convert(detail, 0, 'drawing', sink);

    var lineTypes = Object.keys(usedLT).map(function (k) { return L.realLineType(k, factor); });
    var patterns = Object.keys(usedPat).map(function (k) { return L.realPattern(k, factor); });

    return {
      prims: prims,
      blocks: blocks,
      dropped: dropped,
      factor: factor,
      scale: scale,
      warnings: warnings,
      lineTypes: lineTypes,
      patterns: patterns
    };
  }

  return { buildPrims: buildPrims, SCALE_FACTORS: SCALE_FACTORS };
});
