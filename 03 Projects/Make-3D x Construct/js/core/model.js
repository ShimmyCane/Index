/*
 * Make 3D x Construct: the model engine.
 * DOM-free. Runs in the browser (window.M3DXC) and in Node (module.exports).
 *
 * The history is the source of truth. replay() turns it into a model, checks each
 * operation before it is applied (a failed operation is rejected, never half-applied),
 * then checks the model as a whole. Every problem is a diagnostic with a path, a code,
 * a message and a fix hint, the way Construct's `check` reports them.
 *
 * Rules that the author can change live in a world file (worlds/*.json), not here.
 * Units: inches. Up: Z. Position is the world centre of each solid's box.
 * Unknown values are absent. null is refused (E110); a missing measurement becomes a flag.
 */
(function (root) {
  'use strict';

  var SCHEMA = { history: 'm3dxc.history/0.1', model: 'm3dxc.model/0.1', world: 'm3dxc.world/0.1' };
  var SOLID_TYPES = ['box', 'cylinder', 'cone', 'sphere'];
  var TYPES = SOLID_TYPES.concat(['group']);
  var BASES = ['measured', 'cited', 'user', 'inferred', 'placeholder', 'decorative'];
  var SETTABLE = {
    name: 'string', description: 'string', material: 'string', rotation_z: 'number', position: 'vector',
    'dimensions.x': 'number', 'dimensions.y': 'number', 'dimensions.z': 'number',
    'certainty.percent': 'percent', 'certainty.basis': 'basis', 'certainty.note': 'string'
  };
  var DEFAULT_WORLD = {
    schema: SCHEMA.world, units: 'in', up: 'z',
    max_dimension_in: 240, min_dimension_in: 0.05,
    warn_below_percent: 50
  };

  // ---------- small helpers ----------

  // Canonical JSON: sorted keys, no spaces. The same data always gives the same text.
  function canon(v) {
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    if (v && typeof v === 'object') {
      return '{' + Object.keys(v).sort().map(function (k) {
        return JSON.stringify(k) + ':' + canon(v[k]);
      }).join(',') + '}';
    }
    return JSON.stringify(v);
  }

  // FNV-1a, 32 bit, as 8 hex digits. Synchronous, so it runs in Node and in the page alike.
  function fnv1a(text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  function hashHistory(history) {
    return fnv1a(canon({ header: history.header || {}, operations: history.operations || [] }));
  }

  function diag(code, severity, path, message, fix, extra) {
    var d = { code: code, severity: severity, path: path, message: message, fix: fix };
    if (extra) for (var k in extra) d[k] = extra[k];
    return d;
  }

  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  // Walks a value and reports every null (E110). The fix is always "delete the key".
  function findNulls(value, path, out) {
    if (value === null) {
      out.push(diag('E110', 'error', path, 'null is not allowed; a missing value must be left out',
        'Delete this key. If the value is unknown, add a flag instead (op "flag").'));
      return out;
    }
    if (Array.isArray(value)) {
      value.forEach(function (v, i) { findNulls(v, path + '[' + i + ']', out); });
    } else if (value && typeof value === 'object') {
      Object.keys(value).forEach(function (k) { findNulls(value[k], path + '.' + k, out); });
    }
    return out;
  }

  function findObject(objects, uuid) {
    for (var i = 0; i < objects.length; i++) if (objects[i].uuid === uuid) return objects[i];
    return null;
  }

  function findFlag(flags, id) {
    for (var i = 0; i < flags.length; i++) if (flags[i].id === id) return flags[i];
    return null;
  }

  function childrenOf(objects, uuid) {
    return objects.filter(function (o) { return o.parent === uuid; });
  }

  function ancestorsAndSelf(objects, obj) {
    var list = [obj], cur = obj, guard = 0;
    while (cur && cur.parent && guard++ < 64) {
      cur = findObject(objects, cur.parent);
      if (cur) list.push(cur);
    }
    return list;
  }

  // ---------- object checks ----------

  // Checks one object as it would stand after the operation. Returns diagnostics (errors only).
  function checkObjectFields(obj, path, world) {
    var out = [];
    if (TYPES.indexOf(obj.type) < 0) {
      out.push(diag('E121', 'error', path + '.type', 'unknown type "' + obj.type + '"',
        'Use one of: ' + TYPES.join(', ') + '.'));
      return out;
    }
    if (typeof obj.name !== 'string' || obj.name.trim() === '') {
      out.push(diag('E127', 'error', path + '.name', 'every object needs a name', 'Give it a short readable name.'));
    }
    if (obj.type === 'group') return out;

    var d = obj.dimensions || {};
    ['x', 'y', 'z'].forEach(function (axis) {
      var v = d[axis];
      if (!isNum(v) || v < world.min_dimension_in || v > world.max_dimension_in) {
        out.push(diag('E120', 'error', path + '.dimensions.' + axis,
          'dimension ' + axis + ' must be a number from ' + world.min_dimension_in + ' to ' + world.max_dimension_in + ' in',
          'Set dimensions.' + axis + ' to a positive size in inches.'));
      }
    });
    if (out.length === 0) {
      if ((obj.type === 'cylinder' || obj.type === 'cone') && d.y !== d.x) {
        out.push(diag('E125', 'error', path + '.dimensions.y',
          obj.type + ' is round: y must equal x (the diameter)', 'Set dimensions.y to the same value as dimensions.x.'));
      }
      if (obj.type === 'sphere' && (d.y !== d.x || d.z !== d.x)) {
        out.push(diag('E125', 'error', path + '.dimensions',
          'sphere is round: x, y and z must be equal (the diameter)', 'Make dimensions.x, y and z the same.'));
      }
    }

    var p = obj.position;
    if (!Array.isArray(p) || p.length !== 3 || !p.every(isNum)) {
      out.push(diag('E124', 'error', path + '.position', 'position must be [x, y, z] in inches',
        'Give the centre of the solid as three numbers.'));
    }

    var c = obj.certainty;
    if (!c || !isNum(c.percent) || c.percent % 1 !== 0 || c.percent < 0 || c.percent > 100) {
      out.push(diag('E123', 'error', path + '.certainty.percent',
        'every solid needs a certainty percent from 0 to 100 (a whole number)',
        'Set certainty.percent. Use a flag if the value is unknown.'));
    }
    if (c && c.basis !== undefined && BASES.indexOf(c.basis) < 0) {
      out.push(diag('E128', 'error', path + '.certainty.basis', 'unknown basis "' + c.basis + '"',
        'Use one of: ' + BASES.join(', ') + '.'));
    }
    return out;
  }

  // ---------- operations ----------

  // Checks one operation against the state before it. Returns diagnostics.
  function checkOperation(state, op, world, path) {
    var out = findNulls(op, path, []);
    if (out.length) return out;
    if (!op || typeof op !== 'object') {
      return [diag('E115', 'error', path, 'operation must be an object', 'Write it as an object with an "op" field.')];
    }

    if (op.op === 'add') {
      if (!op.object || typeof op.object.uuid !== 'string') {
        return [diag('E116', 'error', path + '.object.uuid', 'add needs an object with a uuid', 'Give the object a uuid string.')];
      }
      if (findObject(state.objects, op.object.uuid)) {
        return [diag('E111', 'error', path + '.object.uuid', 'uuid ' + op.object.uuid + ' already exists', 'Use a new uuid.')];
      }
      var parentErr = [];
      if (op.object.parent !== undefined) {
        var parent = findObject(state.objects, op.object.parent);
        if (!parent) parentErr.push(diag('E112', 'error', path + '.object.parent', 'parent ' + op.object.parent + ' does not exist', 'Add the parent group first, or remove the parent field.'));
        else if (parent.type !== 'group') parentErr.push(diag('E112', 'error', path + '.object.parent', 'parent must be a group', 'Point parent at a group.'));
      }
      return parentErr.concat(checkObjectFields(op.object, path + '.object', world));
    }

    if (op.op === 'modify') {
      var target = findObject(state.objects, op.uuid);
      if (!target) return [diag('E114', 'error', path + '.uuid', 'no object with uuid ' + op.uuid, 'Check the uuid in the history.')];
      var errs = [];
      Object.keys(op.set || {}).forEach(function (key) {
        if (!SETTABLE.hasOwnProperty(key)) {
          errs.push(diag('E129', 'error', path + '.set.' + key, 'field "' + key + '" cannot be changed',
            'Settable fields: ' + Object.keys(SETTABLE).join(', ') + '.'));
        }
      });
      if (errs.length) return errs;
      var clone = JSON.parse(JSON.stringify(target));
      Object.keys(op.set || {}).forEach(function (key) { setPath(clone, key, op.set[key]); });
      return checkObjectFields(clone, path + '.uuid(' + op.uuid + ')', world);
    }

    if (op.op === 'delete') {
      if (!findObject(state.objects, op.uuid)) return [diag('E114', 'error', path + '.uuid', 'no object with uuid ' + op.uuid, 'Check the uuid in the history.')];
      if (childrenOf(state.objects, op.uuid).length) {
        return [diag('E113', 'error', path + '.uuid', 'the object has children and cannot be deleted yet',
          'Delete or move the children first.')];
      }
      return [];
    }

    if (op.op === 'flag') {
      if (typeof op.id !== 'string' || findFlag(state.flags, op.id)) {
        return [diag('E131', 'error', path + '.id', 'flag id must be a new string', 'Use a new flag id, for example F1.')];
      }
      if (!findObject(state.objects, op.target)) {
        return [diag('E130', 'error', path + '.target', 'flag target ' + op.target + ' does not exist', 'Point the flag at an object uuid.')];
      }
      if (typeof op.text !== 'string' || op.text.trim() === '') {
        return [diag('E133', 'error', path + '.text', 'a flag needs a sentence saying what is unknown or wrong', 'Write the flag text.')];
      }
      return [];
    }

    if (op.op === 'flag_close') {
      var f = findFlag(state.flags, op.id);
      if (!f) return [diag('E132', 'error', path + '.id', 'no flag ' + op.id, 'Check the flag id.')];
      if (f.status !== 'open') return [diag('E132', 'error', path + '.id', 'flag ' + op.id + ' is already closed', 'Nothing to do.')];
      return [];
    }

    return [diag('E115', 'error', path + '.op', 'unknown operation "' + op.op + '"',
      'Use add, modify, delete, flag or flag_close.')];
  }

  function setPath(obj, key, value) {
    var parts = key.split('.'), cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function applyOperation(state, op) {
    if (op.op === 'add') {
      state.objects.push(JSON.parse(JSON.stringify(op.object)));
    } else if (op.op === 'modify') {
      var target = findObject(state.objects, op.uuid);
      Object.keys(op.set).forEach(function (key) { setPath(target, key, op.set[key]); });
    } else if (op.op === 'delete') {
      state.objects.splice(state.objects.indexOf(findObject(state.objects, op.uuid)), 1);
    } else if (op.op === 'flag') {
      state.flags.push({ id: op.id, target: op.target, text: op.text, status: 'open', seq: op.seq });
    } else if (op.op === 'flag_close') {
      var f = findFlag(state.flags, op.id);
      f.status = 'closed';
      if (op.note) f.close_note = op.note;
    }
  }

  // ---------- model checks ----------

  // Warnings are explained when an open flag names the object or one of its groups.
  function explainedBy(objects, flags, obj) {
    var chain = ancestorsAndSelf(objects, obj);
    return flags.some(function (f) {
      return f.status === 'open' && chain.some(function (c) { return c.uuid === f.target; });
    });
  }

  function checkModel(model, world) {
    var out = [];
    model.objects.forEach(function (obj, i) {
      if (obj.type === 'group') return;
      var path = 'objects[' + i + '](' + obj.uuid + ')';
      var pct = obj.certainty.percent;
      if (pct < world.warn_below_percent) {
        var explained = explainedBy(model.objects, model.flags, obj);
        out.push(diag('W201', 'warn', path + '.certainty.percent',
          obj.name + ' is at ' + pct + '% certainty (below ' + world.warn_below_percent + '%)',
          explained ? 'Explained by an open flag.' : 'Add a flag that says what is uncertain, or raise the certainty after a check.',
          { explained: explained, uuid: obj.uuid }));
      }
      var half = obj.dimensions.z / 2;
      var bottom = obj.position[2] - half;
      if (bottom < -1e-9) {
        var ex2 = explainedBy(model.objects, model.flags, obj);
        out.push(diag('W202', 'warn', path + '.position',
          obj.name + ' goes below the ground by ' + (-bottom).toFixed(2) + ' in',
          ex2 ? 'Explained by an open flag.' : 'Raise position[2] so the bottom sits at or above 0.',
          { explained: ex2, uuid: obj.uuid }));
      }
    });
    return out;
  }

  // ---------- replay ----------

  function replay(history, worldIn) {
    var world = Object.assign({}, DEFAULT_WORLD, worldIn || {});
    var header = history.header || {};
    var state = { objects: [], flags: [] };
    var diagnostics = [];
    var rejected = [];

    if (history.schema !== SCHEMA.history) {
      diagnostics.push(diag('E100', 'error', 'schema', 'history schema is "' + history.schema + '", expected "' + SCHEMA.history + '"',
        'Write the schema field as "' + SCHEMA.history + '".'));
    }
    if (header.units !== 'in') diagnostics.push(diag('E101', 'error', 'header.units', 'units must be "in"', 'Set header.units to "in".'));
    if (header.up !== 'z') diagnostics.push(diag('E101', 'error', 'header.up', 'up must be "z"', 'Set header.up to "z".'));

    (history.operations || []).forEach(function (op, i) {
      var path = 'operations[' + i + ']';
      var d = checkOperation(state, op, world, path);
      diagnostics = diagnostics.concat(d);
      var errs = d.filter(function (x) { return x.severity === 'error'; });
      if (errs.length) {
        rejected.push({ index: i, seq: op && op.seq, codes: errs.map(function (x) { return x.code; }) });
        return;
      }
      applyOperation(state, op);
    });

    var model = {
      schema: SCHEMA.model,
      model_id: header.model_id,
      name: header.name,
      description: header.description || '',
      scale: header.scale || '',
      units: 'in',
      up: 'z',
      world: header.world,
      version: (history.operations || []).length,
      history_hash: hashHistory(history),
      objects: state.objects,
      flags: state.flags
    };
    if (header.scale === undefined) delete model.scale;
    diagnostics = diagnostics.concat(checkModel(model, world));
    return { model: model, diagnostics: diagnostics, rejected: rejected, world: world };
  }

  // Summary for the page and the tests. ok means: no errors and no unexplained warnings.
  function audit(result) {
    var errors = result.diagnostics.filter(function (d) { return d.severity === 'error'; }).length;
    var unexplained = result.diagnostics.filter(function (d) { return d.severity === 'warn' && !d.explained; });
    return { ok: errors === 0 && unexplained.length === 0, errors: errors, unexplained: unexplained.length,
      explained: result.diagnostics.filter(function (d) { return d.explained; }).length };
  }

  // ---------- geometry and certainty helpers ----------

  function bbox(obj) {
    if (obj.type === 'group' || !obj.dimensions) return null;
    var d = obj.dimensions, p = obj.position;
    return {
      min: [p[0] - d.x / 2, p[1] - d.y / 2, p[2] - d.z / 2],
      max: [p[0] + d.x / 2, p[1] + d.y / 2, p[2] + d.z / 2]
    };
  }

  // A plain-words band for a percentage. The number is what the user sorts and edits.
  function band(percent) {
    if (percent >= 90) return 'checked';
    if (percent >= 70) return 'good';
    if (percent >= 50) return 'estimate';
    if (percent >= 25) return 'guess';
    return 'placeholder';
  }

  // Sort parts by 'percent' or 'name'. Returns a new array; groups are left out.
  function sortSolids(objects, by, dir) {
    var list = objects.filter(function (o) { return o.type !== 'group'; });
    var sign = dir === 'desc' ? -1 : 1;
    return list.slice().sort(function (a, b) {
      var va = by === 'name' ? a.name : a.certainty.percent;
      var vb = by === 'name' ? b.name : b.certainty.percent;
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return a.uuid < b.uuid ? -1 : (a.uuid > b.uuid ? 1 : 0);
    });
  }

  var api = {
    SCHEMA: SCHEMA, TYPES: TYPES, BASES: BASES, SETTABLE: SETTABLE, DEFAULT_WORLD: DEFAULT_WORLD,
    canon: canon, fnv1a: fnv1a, hashHistory: hashHistory,
    replay: replay, checkOperation: checkOperation, checkModel: checkModel, audit: audit,
    bbox: bbox, band: band, sortSolids: sortSolids, childrenOf: childrenOf, findObject: findObject
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { model: api });
})(typeof globalThis !== 'undefined' ? globalThis : this);
