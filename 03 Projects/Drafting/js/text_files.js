/* Drafting — plain-text .LIN (line types) and .PAT (hatch patterns) writers.
   Both are ASCII text (convo v0.2, Q4). Inputs are REAL inches (see libraries.js realLineType/realPattern).
   writeLIN([{name, desc, dashes}]) and writePAT([{name, desc, lines:[{angle,x0,y0,dx,dy,dashes}]}]). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { writeLIN: api.writeLIN, writePAT: api.writePAT });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  function n(x) {
    if (!isFinite(x)) throw new Error('text file: non-finite number ' + x);
    var s = Number(x).toFixed(6).replace(/\.?0+$/, '');
    return s === '' || s === '-' || s === '-0' ? '0' : s;
  }

  // .LIN: "*NAME, description" then "A,dash,dash,..." (A = alignment). Dashes: + pen down, - pen up, 0 dot.
  function writeLIN(defs) {
    var out = ['; Drafting line types (real inches)'];
    (defs || []).forEach(function (d) {
      out.push('*' + d.name + ', ' + d.desc);
      out.push(['A'].concat(d.dashes.map(n)).join(','));
    });
    return out.join('\n') + '\n';
  }

  // .PAT: "*NAME, description", then one line per family: angle, x0, y0, dx, dy, dashes...
  // A blank line must follow the last pattern (Autodesk help), or the last pattern is not read.
  function writePAT(defs) {
    var out = ['; Drafting hatch patterns (real inches)'];
    (defs || []).forEach(function (d) {
      out.push('*' + d.name + ', ' + d.desc);
      d.lines.forEach(function (l) {
        var row = [l.angle, l.x0, l.y0, l.dx, l.dy].map(n);
        if (l.dashes && l.dashes.length) row = row.concat(l.dashes.map(n));
        out.push(row.join(','));
      });
    });
    return out.join('\n') + '\n\n';
  }

  return { writeLIN: writeLIN, writePAT: writePAT };
});
