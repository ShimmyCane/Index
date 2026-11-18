/* Drafting — DXF reader (ASCII). Pure JS, no libraries. Small on purpose: it reads what we write
   and the common entities of other files. Binary DXF is reported, not read.
   parseDXF(text) -> { ok, errors, warnings, version, insunits, extents, layers, entities, unknown }
   entities: { type: 'LINE'|'POLYLINE'|'TEXT'|'HATCH'|'INSERT', layer, pts?, closed?, text?, at?, height?, solid?, pattern? } */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { parseDXF: api.parseDXF });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  function pairsOf(text, errors) {
    if (/^﻿?\s*AutoCAD Binary DXF/.test(text)) { errors.push('binary DXF is not read'); return []; }
    var lines = String(text).replace(/\r/g, '').split('\n');
    var out = [];
    for (var i = 0; i + 1 < lines.length; i += 2) {
      var c = lines[i].trim();
      if (!/^-?\d+$/.test(c)) { errors.push('line ' + (i + 1) + ': group code is not a whole number (' + c.slice(0, 20) + ')'); break; }
      out.push({ code: parseInt(c, 10), value: lines[i + 1] === undefined ? '' : lines[i + 1].trim(), line: i + 1 });
    }
    return out;
  }

  function num(v, errors, where) {
    var n = parseFloat(v);
    if (!isFinite(n)) { errors.push(where + ': not a finite number (' + v + ')'); return 0; }
    return n;
  }

  // Split the groups of a section into entities (each starts at a group code 0).
  function entitiesOf(groups) {
    var list = [], cur = null;
    groups.forEach(function (g) {
      if (g.code === 0) { cur = { type: g.value, groups: [] }; list.push(cur); }
      else if (cur) cur.groups.push(g);
    });
    return list;
  }

  function val(groups, code) {
    for (var i = 0; i < groups.length; i++) if (groups[i].code === code) return groups[i].value;
    return undefined;
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

  function parseDXF(text) {
    var errors = [], warnings = [], unknown = {};
    var groups = pairsOf(text, errors);
    var out = { ok: false, errors: errors, warnings: warnings, version: null, insunits: null, extents: null, layers: [], entities: [], unknown: unknown, sections: [] };
    if (errors.length) return out;

    var section = null, sectionGroups = [], sawEOF = false, sawEnd = false;
    var sections = {};
    groups.forEach(function (g, idx) {
      if (g.code === 0 && g.value === 'SECTION') { section = null; sectionGroups = []; return; }
      if (g.code === 2 && section === null && sectionGroups.length === 0 && idx > 0 && groups[idx - 1].value === 'SECTION') {
        section = g.value; sections[section] = sections[section] || []; out.sections.push(section); return;
      }
      if (g.code === 0 && g.value === 'ENDSEC') { section = null; return; }
      if (g.code === 0 && g.value === 'EOF') { sawEOF = true; return; }
      if (section) sections[section].push(g);
    });
    if (!sawEOF) warnings.push('no EOF marker');
    if (!sections.ENTITIES) errors.push('no ENTITIES section');

    // HEADER
    var hdr = sections.HEADER || [];
    for (var i = 0; i < hdr.length; i++) {
      if (hdr[i].code === 9) {
        var name = hdr[i].value, v = hdr[i + 1];
        if (name === '$ACADVER' && v) out.version = v.value;
        if (name === '$INSUNITS' && v) out.insunits = parseInt(v.value, 10);
        if (name === '$EXTMIN' || name === '$EXTMAX') {
          out.extents = out.extents || {};
          var px = hdr[i + 1], py = hdr[i + 2];
          if (px && py) out.extents[name === '$EXTMIN' ? 'min' : 'max'] = [num(px.value, errors, name), num(py.value, errors, name)];
        }
      }
    }
    if (out.insunits === null) warnings.push('no $INSUNITS in the header');

    // LAYER names
    var tables = sections.TABLES || [];
    // each LAYER entry starts with 0 LAYER, then its name in group 2
    for (var j = 0; j < tables.length; j++) {
      if (tables[j].code === 0 && tables[j].value === 'LAYER') {
        for (var k = j + 1; k < tables.length && tables[k].code !== 0; k++) {
          if (tables[k].code === 2) { out.layers.push(tables[k].value); break; }
        }
      }
    }

    // ENTITIES
    var ents = entitiesOf(sections.ENTITIES || []);
    var polyCur = null;
    ents.forEach(function (e) {
      var gs = e.groups, layer = val(gs, 8) || '0';
      var where = e.type + ' on ' + layer;
      if (e.type === 'LINE') {
        out.entities.push({ type: 'LINE', layer: layer, pts: [pointsAfter(gs, 0, 1, errors, where)[0], [num(val(gs, 11), errors, where), num(val(gs, 21), errors, where)]] });
      } else if (e.type === 'LWPOLYLINE') {
        out.entities.push({ type: 'POLYLINE', layer: layer, closed: (parseInt(val(gs, 70), 10) & 1) === 1, pts: pointsAfter(gs, 0, Infinity, errors, where) });
      } else if (e.type === 'POLYLINE') {
        polyCur = { type: 'POLYLINE', layer: layer, closed: (parseInt(val(gs, 70), 10) & 1) === 1, pts: [] };
        out.entities.push(polyCur);
      } else if (e.type === 'VERTEX') {
        if (polyCur) polyCur.pts.push([num(val(gs, 10), errors, 'VERTEX'), num(val(gs, 20), errors, 'VERTEX')]);
      } else if (e.type === 'SEQEND') {
        polyCur = null;
      } else if (e.type === 'TEXT') {
        out.entities.push({ type: 'TEXT', layer: layer, at: [num(val(gs, 10), errors, where), num(val(gs, 20), errors, where)], height: num(val(gs, 40), errors, where), text: val(gs, 1) || '', rot: num(val(gs, 50) || 0, errors, where) });
      } else if (e.type === 'HATCH') {
        out.entities.push(hatchOf(gs, errors, warnings, where, layer));
      } else if (e.type === 'INSERT') {
        out.entities.push({ type: 'INSERT', layer: layer, name: val(gs, 2) || '', at: [num(val(gs, 10), errors, where), num(val(gs, 20), errors, where)] });
      } else {
        unknown[e.type] = (unknown[e.type] || 0) + 1;
      }
    });
    Object.keys(unknown).forEach(function (t) { warnings.push('entity not read: ' + t + ' (' + unknown[t] + ')'); });

    out.ok = errors.length === 0;
    return out;
  }

  // HATCH: read polyline boundary paths (path type flag 2). Edge-based paths are reported, not read.
  function hatchOf(gs, errors, warnings, where, layer) {
    var solid = (parseInt(val(gs, 70), 10) === 1);
    var pattern = val(gs, 2) || '';
    var ent = { type: 'HATCH', layer: layer, solid: solid, pattern: pattern, pts: null, closed: true };
    var paths = parseInt(val(gs, 91), 10) || 0;
    var i = 0, first = null, pathsRead = 0;
    while (i < gs.length && gs[i].code !== 75) {
      if (gs[i].code === 92) {
        var flags = parseInt(gs[i].value, 10);
        pathsRead++;
        if (flags & 2) {
          // polyline path: 72 bulge flag, 73 closed, 93 count, then the vertices
          var n = parseInt(val(gs.slice(i + 1), 93), 10) || 0;
          var start = i + 1;
          while (start < gs.length && gs[start].code !== 93) start++;
          var pts = pointsAfter(gs, start + 1, n, errors, where);
          if (first === null) first = pts;
          i = start + 1;
          continue;
        } else {
          warnings.push('hatch edge path not read (' + where + ')');
        }
      }
      i++;
    }
    if (paths > pathsRead) warnings.push('hatch path not read (' + where + ')');
    ent.pts = first || [];
    return ent;
  }

  return { parseDXF: parseDXF };
});
