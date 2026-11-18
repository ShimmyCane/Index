/* Drafting — DXF reader (ASCII). Pure JS, no libraries. Small on purpose: it reads what we write
   and the common entities of other files. Binary DXF is reported, not read.
   parseDXF(text) -> {
     ok, errors, warnings, version, insunits, extents, layers,
     ltypes:  [{name, dashes}],                       from the LTYPE table
     blocks:  { NAME: entities },                     from the BLOCKS section
     entities: top-level entities,
     unknown, sections
   }
   entity: { type: 'LINE'|'POLYLINE'|'TEXT'|'HATCH'|'INSERT', layer, lt?, pts?, closed?, text?, at?,
             height?, solid?, pattern?, patternLines?, name?, scale? } */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { parseDXF: api.parseDXF });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  function pairsOf(text, errors) {
    var lines = String(text).replace(/\r/g, '').split('\n');
    var out = [];
    for (var i = 0; i + 1 < lines.length; i += 2) {
      var c = lines[i].trim();
      if (!/^-?\d+$/.test(c)) { errors.push('line ' + (i + 1) + ': group code is not a whole number (' + c.slice(0, 20) + ')'); break; }
      out.push({ code: parseInt(c, 10), value: lines[i + 1] === undefined ? '' : lines[i + 1].trim() });
    }
    return out;
  }

  function num(v, errors, where) {
    var n = parseFloat(v);
    if (!isFinite(n)) { errors.push(where + ': not a finite number (' + v + ')'); return 0; }
    return n;
  }

  function val(groups, code) {
    for (var i = 0; i < groups.length; i++) if (groups[i].code === code) return groups[i].value;
    return undefined;
  }

  function allVals(groups, code) {
    return groups.filter(function (g) { return g.code === code; }).map(function (g) { return g.value; });
  }

  // Split a list of groups into entities (each starts at a group code 0).
  function entitiesOf(groups) {
    var list = [], cur = null;
    groups.forEach(function (g) {
      if (g.code === 0) { cur = { type: g.value, groups: [] }; list.push(cur); }
      else if (cur) cur.groups.push(g);
    });
    return list;
  }

  function pointsAfter(groups, from, count, errors, where) {
    var pts = [];
    for (var i = from; i < groups.length && pts.length < count; i++) {
      if (groups[i].code === 10) {
        var x = num(groups[i].value, errors, where);
        var y = groups[i + 1] && groups[i + 1].code === 20 ? num(groups[i + 1].value, errors, where) : 0;
        pts.push([x, y]);
      }
    }
    return pts;
  }

  // HATCH: polyline boundary paths (path flag 2) and pattern lines (76 = 0, user-defined).
  function hatchOf(gs, errors, warnings, where, layer) {
    var ent = { type: 'HATCH', layer: layer, solid: parseInt(val(gs, 70), 10) === 1, pattern: val(gs, 2) || '', pts: [], closed: true, patternLines: null };
    var i = 0, first = null, pathsRead = 0, paths = parseInt(val(gs, 91), 10) || 0;
    while (i < gs.length && gs[i].code !== 75) {
      if (gs[i].code === 92) {
        var flags = parseInt(gs[i].value, 10);
        pathsRead++;
        if (flags & 2) {
          var start = i + 1;
          while (start < gs.length && gs[start].code !== 93) start++;
          var n = parseInt(gs[start] ? gs[start].value : '0', 10) || 0;
          var pts = pointsAfter(gs, start + 1, n, errors, where);
          if (first === null) first = pts;
          i = start + 1;
          continue;
        }
        warnings.push('hatch edge path not read (' + where + ')');
      }
      i++;
    }
    if (paths > pathsRead) warnings.push('hatch path not read (' + where + ')');
    ent.pts = first || [];
    // pattern definition after 75/76
    var p76 = null;
    for (var j = 0; j < gs.length; j++) if (gs[j].code === 76) { p76 = parseInt(gs[j].value, 10); break; }
    if (!ent.solid && p76 === 0) {
      var lines = [], k = 0, nlines = parseInt(val(gs, 78), 10) || 0;
      var at78 = gs.findIndex(function (g) { return g.code === 78; });
      k = at78 + 1;
      while (lines.length < nlines && k < gs.length) {
        if (gs[k].code === 53) {
          var l = { angle: 0, x0: 0, y0: 0, dx: 0, dy: 0, dashes: [] };
          l.angle = num(gs[k].value, errors, where);
          var ndash = 0;
          for (k = k + 1; k < gs.length && gs[k].code !== 53; k++) {
            var g = gs[k];
            if (g.code === 43) l.x0 = num(g.value, errors, where);
            else if (g.code === 44) l.y0 = num(g.value, errors, where);
            else if (g.code === 45) l.dx = num(g.value, errors, where);
            else if (g.code === 46) l.dy = num(g.value, errors, where);
            else if (g.code === 79) ndash = parseInt(g.value, 10) || 0;
            else if (g.code === 49 && l.dashes.length < ndash) l.dashes.push(num(g.value, errors, where));
            else if (g.code === 98) break;
          }
          lines.push(l);
        } else {
          k++;
        }
      }
      ent.patternLines = lines;
    }
    return ent;
  }

  function entitiesFrom(groups, errors, warnings, unknown) {
    var out = [];
    var polyCur = null;
    entitiesOf(groups).forEach(function (e) {
      var gs = e.groups, layer = val(gs, 8) || '0';
      var lt = val(gs, 6);
      var where = e.type + ' on ' + layer;
      var base = { layer: layer };
      if (lt && lt !== 'BYLAYER' && lt !== 'BYBLOCK') base.lt = lt;
      if (e.type === 'LINE') {
        out.push(Object.assign({ type: 'LINE', pts: [pointsAfter(gs, 0, 1, errors, where)[0], [num(val(gs, 11), errors, where), num(val(gs, 21), errors, where)]] }, base));
      } else if (e.type === 'LWPOLYLINE') {
        out.push(Object.assign({ type: 'POLYLINE', closed: (parseInt(val(gs, 70), 10) & 1) === 1, pts: pointsAfter(gs, 0, Infinity, errors, where) }, base));
      } else if (e.type === 'POLYLINE') {
        polyCur = Object.assign({ type: 'POLYLINE', closed: (parseInt(val(gs, 70), 10) & 1) === 1, pts: [] }, base);
        out.push(polyCur);
      } else if (e.type === 'VERTEX') {
        if (polyCur) polyCur.pts.push([num(val(gs, 10), errors, 'VERTEX'), num(val(gs, 20), errors, 'VERTEX')]);
      } else if (e.type === 'SEQEND') {
        polyCur = null;
      } else if (e.type === 'TEXT') {
        out.push(Object.assign({ type: 'TEXT', at: [num(val(gs, 10), errors, where), num(val(gs, 20), errors, where)], height: num(val(gs, 40), errors, where), text: val(gs, 1) || '', rot: num(val(gs, 50) || 0, errors, where) }, base));
      } else if (e.type === 'HATCH') {
        out.push(Object.assign(hatchOf(gs, errors, warnings, where, layer), lt && lt !== 'BYLAYER' ? { lt: lt } : {}));
      } else if (e.type === 'INSERT') {
        out.push(Object.assign({ type: 'INSERT', name: val(gs, 2) || '', at: [num(val(gs, 10), errors, where), num(val(gs, 20), errors, where)], scale: num(val(gs, 41) || 1, errors, where) }, base));
      } else {
        unknown[e.type] = (unknown[e.type] || 0) + 1;
      }
    });
    return out;
  }

  function parseDXF(text) {
    var errors = [], warnings = [], unknown = {};
    var groups = pairsOf(text, errors);
    var out = { ok: false, errors: errors, warnings: warnings, version: null, insunits: null, extents: null, layers: [], ltypes: [], blocks: {}, entities: [], unknown: unknown, sections: [] };
    if (errors.length) return out;

    // Split into sections by "0 SECTION", "2 NAME", until "0 ENDSEC".
    var sections = {}, cur = null, sawEOF = false;
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.code === 0 && g.value === 'SECTION') {
        var nm = groups[i + 1] && groups[i + 1].code === 2 ? groups[i + 1].value : null;
        cur = nm; i++;
        if (nm) { sections[nm] = sections[nm] || []; out.sections.push(nm); }
        continue;
      }
      if (g.code === 0 && g.value === 'ENDSEC') { cur = null; continue; }
      if (g.code === 0 && g.value === 'EOF') { sawEOF = true; cur = null; continue; }
      if (cur) sections[cur].push(g);
    }
    if (!sawEOF) warnings.push('no EOF marker');
    if (!sections.ENTITIES) errors.push('no ENTITIES section');

    // HEADER
    var hdr = sections.HEADER || [];
    for (var h = 0; h < hdr.length; h++) {
      if (hdr[h].code !== 9) continue;
      var name = hdr[h].value, v = hdr[h + 1];
      if (name === '$ACADVER' && v) out.version = v.value;
      if (name === '$INSUNITS' && v) out.insunits = parseInt(v.value, 10);
      if ((name === '$EXTMIN' || name === '$EXTMAX') && hdr[h + 1] && hdr[h + 2]) {
        out.extents = out.extents || {};
        out.extents[name === '$EXTMIN' ? 'min' : 'max'] = [num(hdr[h + 1].value, errors, name), num(hdr[h + 2].value, errors, name)];
      }
    }
    if (out.insunits === null) warnings.push('no $INSUNITS in the header');

    // TABLES: layers and line types
    var tables = sections.TABLES || [];
    for (var j = 0; j < tables.length; j++) {
      if (tables[j].code !== 0) continue;
      if (tables[j].value === 'LAYER' || tables[j].value === 'LTYPE') {
        var isLt = tables[j].value === 'LTYPE';
        var nameVal = null, dashes = [];
        for (var k = j + 1; k < tables.length && !(tables[k].code === 0 && (k > j + 1)); k++) {
          if (tables[k].code === 2 && nameVal === null) nameVal = tables[k].value;
          if (isLt && tables[k].code === 49) dashes.push(num(tables[k].value, errors, 'LTYPE ' + nameVal));
        }
        if (nameVal !== null) {
          if (isLt) { if (nameVal !== 'CONTINUOUS' && nameVal !== '') out.ltypes.push({ name: nameVal, dashes: dashes }); }
          else out.layers.push(nameVal);
        }
      }
    }

    // ENTITIES, and BLOCKS (block bodies, each from "0 BLOCK" to "0 ENDBLK")
    out.entities = entitiesFrom(sections.ENTITIES || [], errors, warnings, unknown);
    var bgroups = sections.BLOCKS || [];
    var bstart = [];
    for (var q = 0; q < bgroups.length; q++) {
      if (bgroups[q].code === 0 && bgroups[q].value === 'BLOCK') bstart.push(q);
    }
    bstart.forEach(function (s, idx) {
      var e = bstart[idx + 1] !== undefined ? bstart[idx + 1] : bgroups.length;
      var seg = bgroups.slice(s + 1, e);
      var bname = val(seg, 2);
      var cut = seg.findIndex(function (g) { return g.code === 0 && g.value === 'ENDBLK'; });
      var body = cut >= 0 ? seg.slice(0, cut) : seg;
      if (bname && bname[0] !== '*') out.blocks[bname] = entitiesFrom(body, errors, warnings, unknown);
    });
    Object.keys(unknown).forEach(function (t) { warnings.push('entity not read: ' + t + ' (' + unknown[t] + ')'); });

    out.ok = errors.length === 0;
    return out;
  }

  return { parseDXF: parseDXF };
});
