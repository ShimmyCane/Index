/* Drafting — libraries: line types and hatch patterns, defined in PAPER inches.
   realLineType(name, factor) and realPattern(name, factor) give real inches at a scale
   (paper inch × factor, schematic §3). Starting values: to tune with Jimmy.
   Dashes: positive = pen down, negative = pen up, 0 = dot (AutoCAD convention).
   Patterns: lines { angle (deg), x0, y0 (origin), dx (shift along the line), dy (spacing across), dashes }.
   Quick Detail's own hatch library is NOT ported yet: keys not listed here are reported by the linter. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { realLineType: api.realLineType, realPattern: api.realPattern, LINE_TYPES: api.LINE_TYPES, PATTERNS: api.PATTERNS });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var LINE_TYPES = {
    continuous: { name: 'CONTINUOUS', desc: 'Solid line', dashes: [] },
    dashed:     { name: 'DASHED', desc: 'Dashed __ __ __', dashes: [0.125, -0.0625] },
    dashdot:    { name: 'DASHDOT', desc: 'Dash dot ____ . ____ .', dashes: [0.125, -0.0625, 0, -0.0625] }
  };

  var PATTERNS = {
    diag:  { name: 'DIAG', desc: 'Diagonal lines at 45 degrees', lines: [{ angle: 45, x0: 0, y0: 0, dx: 0, dy: 0.125, dashes: [] }] },
    horiz: { name: 'HORIZ', desc: 'Horizontal lines', lines: [{ angle: 0, x0: 0, y0: 0, dx: 0, dy: 0.125, dashes: [] }] },
    brick: { name: 'BRICK', desc: 'Brick courses with joints', lines: [
      { angle: 0, x0: 0, y0: 0, dx: 0, dy: 0.25, dashes: [] },
      { angle: 90, x0: 0, y0: 0, dx: 0, dy: 0.5, dashes: [0.25, -0.125] }
    ] }
  };

  function mul(list, f) { return list.map(function (v) { return v * f; }); }

  function realLineType(key, factor) {
    var d = LINE_TYPES[key];
    if (!d) return null;
    return { name: d.name, desc: d.desc, dashes: mul(d.dashes, factor) };
  }

  function realPattern(key, factor) {
    var p = PATTERNS[key];
    if (!p) return null;
    return {
      name: p.name, desc: p.desc,
      lines: p.lines.map(function (l) {
        return { angle: l.angle, x0: l.x0 * factor, y0: l.y0 * factor, dx: l.dx * factor, dy: l.dy * factor, dashes: mul(l.dashes, factor) };
      })
    };
  }

  return { LINE_TYPES: LINE_TYPES, PATTERNS: PATTERNS, realLineType: realLineType, realPattern: realPattern };
});
