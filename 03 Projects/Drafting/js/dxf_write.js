/* Drafting — DXF writer (ASCII). Pure JS, no libraries.
   writeDXF(prims, opts) -> text. Works in the page and in Node.

   prims: [
     { k: 'line',  layer, pts: [[x, y], ...], closed: bool },
     { k: 'hatch', layer, pts: [[x, y], ...] (closed, at least 3), solid: bool },
     { k: 'text',  layer, at: [x, y], text, height, rot }
   ]
   Coordinates are real inches (schematic §3). The sheet's y runs down, as in Quick Detail,
   so y is flipped on export (y' = ymin + ymax - y) and the drawing reads upright in CAD.

   opts.version: 'AC1027' (AutoCAD 2013, default) or 'AC1009' (R12, alternate).
   R12 has no HATCH fill here: a solid hatch is written as a closed polyline (linter warns). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { writeDXF: api.writeDXF, flipBounds: api.flipBounds });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var LAYER_COLOURS = { '0': 7, 'DRAFT-LINE': 7, 'DRAFT-HATCH': 8, 'DRAFT-TEXT': 3 };

  function num(x) {
    if (typeof x !== 'number' || !isFinite(x)) throw new Error('DXF writer: non-finite number ' + x);
    var s = x.toFixed(6);
    s = s.replace(/\.?0+$/, '');
    return s === '' || s === '-' || s === '-0' ? '0' : s;
  }

  function bounds(prims) {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    prims.forEach(function (p) {
      var pts = p.k === 'text' ? [p.at] : p.pts;
      pts.forEach(function (q) {
        if (q[0] < minx) minx = q[0];
        if (q[1] < miny) miny = q[1];
        if (q[0] > maxx) maxx = q[0];
        if (q[1] > maxy) maxy = q[1];
      });
    });
    if (minx === Infinity) return { minx: 0, miny: 0, maxx: 1, maxy: 1 };
    return { minx: minx, miny: miny, maxx: maxx, maxy: maxy };
  }

  // Flip the sheet's y (down) to CAD's y (up), keeping the drawing in the positive quadrant.
  function flipBounds(b) {
    return { minx: b.minx, miny: b.miny, maxx: b.maxx, maxy: b.maxy };
  }
  function fy(b, y) { return b.miny + b.maxy - y; }

  function writer() {
    var L = [];
    return {
      add: function (code, value) { L.push(String(code)); L.push(String(value)); },
      text: function () { return L.join('\n') + '\n'; }
    };
  }

  function layerColour(name) { return LAYER_COLOURS[name] || 7; }

  function layerNames(prims) {
    var seen = { '0': true };
    prims.forEach(function (p) { seen[p.layer || '0'] = true; });
    return Object.keys(seen);
  }

  function writeDXF(prims, opts) {
    opts = opts || {};
    var ver = opts.version === 'AC1009' ? 'AC1009' : 'AC1027';
    var r2013 = ver === 'AC1027';
    var b = bounds(prims);
    var w = writer();
    var h = 0x20;
    function nh() { return (h++).toString(16).toUpperCase(); }
    var handles = {};

    // ---- HEADER
    var rootDict = r2013 ? nh() : null;
    w.add(0, 'SECTION'); w.add(2, 'HEADER');
    w.add(9, '$ACADVER'); w.add(1, ver);
    w.add(9, '$INSUNITS'); w.add(70, 1);
    w.add(9, '$MEASUREMENT'); w.add(70, 0);
    w.add(9, '$EXTMIN'); w.add(10, num(b.minx)); w.add(20, num(b.miny)); w.add(30, 0);
    w.add(9, '$EXTMAX'); w.add(10, num(b.maxx)); w.add(20, num(b.maxy)); w.add(30, 0);
    if (r2013) { w.add(9, '$ACADMAINDICT'); w.add(5, rootDict); w.add(9, '$HANDSEED'); w.add(5, 'FFFFF'); }
    w.add(0, 'ENDSEC');

    // ---- TABLES
    var ltypeTable = r2013 ? nh() : null, layerTable = r2013 ? nh() : null, styleTable = r2013 ? nh() : null;
    var appidTable = r2013 ? nh() : null, brTable = r2013 ? nh() : null;
    var msRecord = r2013 ? nh() : null, psRecord = r2013 ? nh() : null;

    function tableHead(name, owner, handle, count) {
      w.add(0, 'TABLE'); w.add(2, name);
      if (r2013) { w.add(5, handle); w.add(330, 0); w.add(100, 'AcDbSymbolTable'); }
      w.add(70, count);
    }
    function rec(type, handle, owner, subclassRec) {
      w.add(0, type);
      if (r2013) { w.add(5, handle); w.add(330, owner); w.add(100, 'AcDbSymbolTableRecord'); w.add(100, subclassRec); }
    }

    w.add(0, 'SECTION'); w.add(2, 'TABLES');
    tableHead('LTYPE', 0, ltypeTable, 1);
    rec('LTYPE', nh(), ltypeTable, 'AcDbLinetypeTableRecord');
    w.add(2, 'CONTINUOUS'); w.add(70, 0); w.add(3, 'Solid line'); w.add(72, 65); w.add(73, 0); w.add(40, 0);
    w.add(0, 'ENDTAB');

    var names = layerNames(prims);
    tableHead('LAYER', 0, layerTable, names.length);
    names.forEach(function (n) {
      rec('LAYER', nh(), layerTable, 'AcDbLayerTableRecord');
      w.add(2, n); w.add(70, 0); w.add(62, layerColour(n)); w.add(6, 'CONTINUOUS');
    });
    w.add(0, 'ENDTAB');

    tableHead('STYLE', 0, styleTable, 1);
    rec('STYLE', nh(), styleTable, 'AcDbTextStyleTableRecord');
    w.add(2, 'STANDARD'); w.add(70, 0); w.add(40, 0); w.add(41, 1); w.add(50, 0); w.add(71, 0); w.add(42, 0.2); w.add(3, 'txt'); w.add(4, '');
    w.add(0, 'ENDTAB');

    if (r2013) {
      tableHead('APPID', 0, appidTable, 1);
      rec('APPID', nh(), appidTable, 'AcDbRegAppTableRecord');
      w.add(2, 'ACAD'); w.add(70, 0);
      w.add(0, 'ENDTAB');
      tableHead('BLOCK_RECORD', 0, brTable, 2);
      rec('BLOCK_RECORD', msRecord, brTable, 'AcDbBlockTableRecord');
      w.add(2, '*Model_Space');
      rec('BLOCK_RECORD', psRecord, brTable, 'AcDbBlockTableRecord');
      w.add(2, '*Paper_Space');
      w.add(0, 'ENDTAB');
    }
    w.add(0, 'ENDSEC');

    // ---- BLOCKS (R2013 needs the model and paper space blocks)
    if (r2013) {
      w.add(0, 'SECTION'); w.add(2, 'BLOCKS');
      [['*Model_Space', msRecord], ['*Paper_Space', psRecord]].forEach(function (s) {
        w.add(0, 'BLOCK'); w.add(5, nh()); w.add(330, s[1]); w.add(100, 'AcDbEntity'); w.add(8, '0');
        w.add(100, 'AcDbBlockBegin'); w.add(2, s[0]); w.add(70, 0); w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(3, s[0]);
        w.add(0, 'ENDBLK'); w.add(5, nh()); w.add(330, s[1]); w.add(100, 'AcDbEntity'); w.add(8, '0'); w.add(100, 'AcDbBlockEnd');
      });
      w.add(0, 'ENDSEC');
    }

    // ---- ENTITIES
    w.add(0, 'SECTION'); w.add(2, 'ENTITIES');
    function head(type, layer, sub) {
      w.add(0, type);
      if (r2013) { w.add(5, nh()); w.add(330, msRecord); w.add(100, 'AcDbEntity'); }
      w.add(8, layer);
      if (r2013 && sub) w.add(100, sub);
    }

    prims.forEach(function (p) {
      var layer = p.layer || '0';
      if (p.k === 'line' || (p.k === 'hatch' && !(p.solid && r2013))) {
        // Polyline (R2013 LWPOLYLINE; R12 POLYLINE + VERTEX). Hatch boundaries outside R2013 solids land here.
        var pts = p.pts.map(function (q) { return [q[0], fy(b, q[1])]; });
        var closed = !!(p.closed || p.k === 'hatch');
        if (r2013) {
          head('LWPOLYLINE', layer, 'AcDbPolyline');
          w.add(90, pts.length); w.add(70, closed ? 1 : 0); w.add(43, 0);
          pts.forEach(function (q) { w.add(10, num(q[0])); w.add(20, num(q[1])); });
        } else {
          head('POLYLINE', layer, null);
          w.add(66, 1); w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(70, closed ? 1 : 0);
          pts.forEach(function (q) {
            w.add(0, 'VERTEX'); w.add(8, layer); w.add(10, num(q[0])); w.add(20, num(q[1])); w.add(30, 0);
          });
          w.add(0, 'SEQEND'); w.add(8, layer);
        }
      } else if (p.k === 'hatch') {
        // R2013 solid HATCH with one polyline boundary.
        var hp = p.pts.map(function (q) { return [q[0], fy(b, q[1])]; });
        head('HATCH', layer, 'AcDbHatch');
        w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(210, 0); w.add(220, 0); w.add(230, 1);
        w.add(2, 'SOLID'); w.add(70, 1); w.add(71, 0);
        w.add(91, 1);
        w.add(92, 3); w.add(72, 0); w.add(73, 1); w.add(93, hp.length);
        hp.forEach(function (q) { w.add(10, num(q[0])); w.add(20, num(q[1])); });
        w.add(75, 0); w.add(76, 1); w.add(98, 0);
      } else if (p.k === 'text') {
        head('TEXT', layer, 'AcDbText');
        w.add(10, num(p.at[0])); w.add(20, num(fy(b, p.at[1]))); w.add(30, 0);
        w.add(40, num(p.height || 0.125)); w.add(1, String(p.text)); w.add(50, num(p.rot || 0));
        w.add(7, 'STANDARD');
      }
    });
    w.add(0, 'ENDSEC');

    // ---- OBJECTS (R2013: the root dictionary the header points to)
    if (r2013) {
      w.add(0, 'SECTION'); w.add(2, 'OBJECTS');
      w.add(0, 'DICTIONARY'); w.add(5, rootDict); w.add(330, 0); w.add(100, 'AcDbDictionary'); w.add(281, 1);
      w.add(0, 'ENDSEC');
    }

    w.add(0, 'EOF');
    return w.text();
  }

  return { writeDXF: writeDXF, flipBounds: flipBounds };
});
