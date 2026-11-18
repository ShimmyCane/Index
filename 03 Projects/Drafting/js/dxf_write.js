/* Drafting — DXF writer (ASCII). Pure JS, no libraries.
   writeDXF(prims, opts) -> text. Works in the page and in Node.

   prims (see primitives.js):
     { k: 'line',   layer, pts, closed, lt }          lt = line-type NAME (CONTINUOUS, DASHED, ...)
     { k: 'hatch',  layer, pts, solid, pattern }      solid, or a pattern name (libraries.js)
     { k: 'text',   layer, at, text, height, rot }
     { k: 'insert', layer, name, at, k_scale }        INSERT of block NAME
   opts: {
     version: 'AC1027' (AutoCAD 2013, default) | 'AC1009' (R12),
     blocks: { NAME: prims }        block definitions, in the source's own coordinates,
     lineTypes: [{name, desc, dashes}]   real inches,
     patterns: [{name, desc, lines:[{angle,x0,y0,dx,dy,dashes}]}]   real inches
   }
   Coordinates are real inches. The sheet's y runs down (as in Quick Detail), so the top-level
   drawing is flipped (y' = ymin + ymax - y) and reads upright in CAD. A block's content uses
   (x, -y) around its insertion point, so the insert lands where it was placed on the sheet.

   R12 (AC1009): no HATCH fill or pattern here; a solid or pattern hatch is written as its closed
   boundary (the linter warns). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { writeDXF: api.writeDXF });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var LAYER_COLOURS = { '0': 7, 'DRAFT-LINE': 7, 'DRAFT-HATCH': 8, 'DRAFT-TEXT': 3, 'DRAFT-DIM': 5 };

  function num(x) {
    if (typeof x !== 'number' || !isFinite(x)) throw new Error('DXF writer: non-finite number ' + x);
    var s = x.toFixed(6).replace(/\.?0+$/, '');
    return s === '' || s === '-' || s === '-0' ? '0' : s;
  }

  function boundsOf(prims) {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    prims.forEach(function (p) {
      var pts = p.k === 'text' || p.k === 'insert' ? [p.at] : p.pts;
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

  function writer() {
    var L = [];
    return {
      add: function (code, value) { L.push(String(code)); L.push(String(value)); },
      text: function () { return L.join('\n') + '\n'; }
    };
  }

  function layerNames(list) {
    var seen = { '0': true };
    list.forEach(function (p) { seen[p.layer || '0'] = true; });
    return Object.keys(seen);
  }

  function writeDXF(prims, opts) {
    opts = opts || {};
    var ver = opts.version === 'AC1009' ? 'AC1009' : 'AC1027';
    var r2013 = ver === 'AC1027';
    var blocks = opts.blocks || {};
    var lineTypes = (opts.lineTypes || []).filter(function (t) { return t && t.name !== 'CONTINUOUS'; });
    var patterns = opts.patterns || [];
    var blockNames = Object.keys(blocks);

    var b = boundsOf(prims);
    var mapTop = function (p) { return [p[0], b.miny + b.maxy - p[1]]; };
    var mapBlock = function (p) { return [p[0], -p[1]]; };

    var allForLayers = prims.slice();
    blockNames.forEach(function (n) { allForLayers = allForLayers.concat(blocks[n]); });
    var layers = layerNames(allForLayers);

    var w = writer();
    var h = 0x20;
    function nh() { return (h++).toString(16).toUpperCase(); }

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
    var brHandle = {};
    blockNames.forEach(function (n) { brHandle[n] = r2013 ? nh() : null; });

    function tableHead(name, handle, count) {
      w.add(0, 'TABLE'); w.add(2, name);
      if (r2013) { w.add(5, handle); w.add(330, 0); w.add(100, 'AcDbSymbolTable'); }
      w.add(70, count);
    }
    function rec(type, handle, owner, sub) {
      w.add(0, type);
      if (r2013) { w.add(5, handle); w.add(330, owner); w.add(100, 'AcDbSymbolTableRecord'); w.add(100, sub); }
    }

    w.add(0, 'SECTION'); w.add(2, 'TABLES');
    tableHead('LTYPE', ltypeTable, 1 + lineTypes.length);
    rec('LTYPE', nh(), ltypeTable, 'AcDbLinetypeTableRecord');
    w.add(2, 'CONTINUOUS'); w.add(70, 0); w.add(3, 'Solid line'); w.add(72, 65); w.add(73, 0); w.add(40, 0);
    lineTypes.forEach(function (t) {
      var total = t.dashes.reduce(function (s, v) { return s + Math.abs(v); }, 0);
      rec('LTYPE', nh(), ltypeTable, 'AcDbLinetypeTableRecord');
      w.add(2, t.name); w.add(70, 0); w.add(3, t.desc); w.add(72, 65); w.add(73, t.dashes.length); w.add(40, num(total));
      t.dashes.forEach(function (v) { w.add(49, num(v)); if (r2013) w.add(74, 0); });
    });
    w.add(0, 'ENDTAB');

    tableHead('LAYER', layerTable, layers.length);
    layers.forEach(function (n) {
      rec('LAYER', nh(), layerTable, 'AcDbLayerTableRecord');
      w.add(2, n); w.add(70, 0); w.add(62, LAYER_COLOURS[n] || 7); w.add(6, 'CONTINUOUS');
    });
    w.add(0, 'ENDTAB');

    tableHead('STYLE', styleTable, 1);
    rec('STYLE', nh(), styleTable, 'AcDbTextStyleTableRecord');
    w.add(2, 'STANDARD'); w.add(70, 0); w.add(40, 0); w.add(41, 1); w.add(50, 0); w.add(71, 0); w.add(42, 0.2); w.add(3, 'txt'); w.add(4, '');
    w.add(0, 'ENDTAB');

    if (r2013) {
      tableHead('APPID', appidTable, 1);
      rec('APPID', nh(), appidTable, 'AcDbRegAppTableRecord');
      w.add(2, 'ACAD'); w.add(70, 0);
      w.add(0, 'ENDTAB');
      tableHead('BLOCK_RECORD', brTable, 2 + blockNames.length);
      rec('BLOCK_RECORD', msRecord, brTable, 'AcDbBlockTableRecord'); w.add(2, '*Model_Space');
      rec('BLOCK_RECORD', psRecord, brTable, 'AcDbBlockTableRecord'); w.add(2, '*Paper_Space');
      blockNames.forEach(function (n) { rec('BLOCK_RECORD', brHandle[n], brTable, 'AcDbBlockTableRecord'); w.add(2, n); });
      w.add(0, 'ENDTAB');
    }
    w.add(0, 'ENDSEC');

    // ---- entity emitters (shared by top level and block content)
    function head(type, layer, sub, owner) {
      w.add(0, type);
      if (r2013) { w.add(5, nh()); w.add(330, owner); w.add(100, 'AcDbEntity'); }
      w.add(8, layer);
    }
    function ltOf(p) { return p.lt && p.lt !== 'CONTINUOUS' ? p.lt : null; }

    function emitList(list, mapPt, owner) {
      list.forEach(function (p) {
        var layer = p.layer || '0';
        var lt = ltOf(p);
        if (p.k === 'line' || (p.k === 'hatch' && !(r2013 && (p.solid || p.pattern)))) {
          // Polyline. A pattern hatch under R12, or any hatch boundary, is written as a closed polyline.
          var pts = p.pts.map(mapPt);
          var closed = !!(p.closed || p.k === 'hatch');
          if (r2013) {
            head('LWPOLYLINE', layer, 'AcDbPolyline', owner);
            if (lt) w.add(6, lt);
            w.add(100, 'AcDbPolyline');
            w.add(90, pts.length); w.add(70, closed ? 1 : 0); w.add(43, 0);
            pts.forEach(function (q) { w.add(10, num(q[0])); w.add(20, num(q[1])); });
          } else {
            head('POLYLINE', layer, null, owner);
            if (lt) w.add(6, lt);
            w.add(66, 1); w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(70, closed ? 1 : 0);
            pts.forEach(function (q) { w.add(0, 'VERTEX'); w.add(8, layer); w.add(10, num(q[0])); w.add(20, num(q[1])); w.add(30, 0); });
            w.add(0, 'SEQEND'); w.add(8, layer);
          }
        } else if (p.k === 'hatch' && p.solid && r2013) {
          var hp = p.pts.map(mapPt);
          head('HATCH', layer, 'AcDbHatch', owner);
          w.add(100, 'AcDbHatch');
          w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(210, 0); w.add(220, 0); w.add(230, 1);
          w.add(2, 'SOLID'); w.add(70, 1); w.add(71, 0);
          w.add(91, 1); w.add(92, 3); w.add(72, 0); w.add(73, 1); w.add(93, hp.length);
          hp.forEach(function (q) { w.add(10, num(q[0])); w.add(20, num(q[1])); });
          w.add(75, 0); w.add(76, 1); w.add(98, 0);
        } else if (p.k === 'hatch' && p.pattern && r2013) {
          var pp = p.pts.map(mapPt);
          var def = patterns.filter(function (d) { return d.name === p.patternName; })[0];
          head('HATCH', layer, 'AcDbHatch', owner);
          w.add(100, 'AcDbHatch');
          w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(210, 0); w.add(220, 0); w.add(230, 1);
          w.add(2, p.patternName); w.add(70, 0); w.add(71, 0);
          w.add(91, 1); w.add(92, 3); w.add(72, 0); w.add(73, 1); w.add(93, pp.length);
          pp.forEach(function (q) { w.add(10, num(q[0])); w.add(20, num(q[1])); });
          w.add(75, 1); w.add(76, 0); w.add(52, 0); w.add(41, 1); w.add(77, 0);
          var lines = def ? def.lines : [];
          w.add(78, lines.length);
          lines.forEach(function (l) {
            w.add(53, num(l.angle)); w.add(43, num(l.x0)); w.add(44, num(l.y0)); w.add(45, num(l.dx)); w.add(46, num(l.dy));
            w.add(79, l.dashes.length);
            l.dashes.forEach(function (v) { w.add(49, num(v)); });
          });
          w.add(98, 0);
        } else if (p.k === 'text') {
          head('TEXT', layer, 'AcDbText', owner);
          if (r2013) w.add(100, 'AcDbText');
          var at = mapPt(p.at);
          w.add(10, num(at[0])); w.add(20, num(at[1])); w.add(30, 0);
          w.add(40, num(p.height || 0.125)); w.add(1, String(p.text)); w.add(50, num(p.rot || 0));
          w.add(7, 'STANDARD');
        } else if (p.k === 'insert') {
          var ip = mapPt(p.at);
          head('INSERT', layer, 'AcDbBlockReference', owner);
          if (r2013) w.add(100, 'AcDbBlockReference');
          w.add(2, p.name);
          w.add(10, num(ip[0])); w.add(20, num(ip[1])); w.add(30, 0);
          w.add(41, num(p.k_scale || 1)); w.add(42, num(p.k_scale || 1)); w.add(43, num(p.k_scale || 1));
          w.add(50, 0);
        }
      });
    }

    // ---- BLOCKS
    w.add(0, 'SECTION'); w.add(2, 'BLOCKS');
    if (r2013) {
      [['*Model_Space', msRecord], ['*Paper_Space', psRecord]].forEach(function (s) {
        w.add(0, 'BLOCK'); w.add(5, nh()); w.add(330, s[1]); w.add(100, 'AcDbEntity'); w.add(8, '0');
        w.add(100, 'AcDbBlockBegin'); w.add(2, s[0]); w.add(70, 0); w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(3, s[0]);
        w.add(0, 'ENDBLK'); w.add(5, nh()); w.add(330, s[1]); w.add(100, 'AcDbEntity'); w.add(8, '0'); w.add(100, 'AcDbBlockEnd');
      });
    }
    blockNames.forEach(function (n) {
      var owner = r2013 ? brHandle[n] : null;
      w.add(0, 'BLOCK');
      if (r2013) { w.add(5, nh()); w.add(330, owner); w.add(100, 'AcDbEntity'); }
      w.add(8, LAYER_LINE_FOR_BLOCK);
      if (r2013) w.add(100, 'AcDbBlockBegin');
      w.add(2, n); w.add(70, 0); w.add(10, 0); w.add(20, 0); w.add(30, 0); w.add(3, n);
      emitList(blocks[n], mapBlock, owner);
      w.add(0, 'ENDBLK');
      if (r2013) { w.add(5, nh()); w.add(330, owner); w.add(100, 'AcDbEntity'); }
      w.add(8, LAYER_LINE_FOR_BLOCK);
      if (r2013) w.add(100, 'AcDbBlockEnd');
    });
    w.add(0, 'ENDSEC');

    // ---- ENTITIES (top level)
    w.add(0, 'SECTION'); w.add(2, 'ENTITIES');
    emitList(prims, mapTop, msRecord);
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

  var LAYER_LINE_FOR_BLOCK = 'DRAFT-LINE';

  return { writeDXF: writeDXF };
});
