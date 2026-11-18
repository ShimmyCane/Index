/* Drafting — linter. Two results (convo v0.2, Q9):
   1. validity   — pass or fail per check, blocking. A failure says why.
   2. confidence — 0 to 100%, from weighted checks (pass 1, warn 0.5, fail 0). Below 80%, the
                   viewer opens so the output can be seen.
   Both run on what the file reads back as (parseDXF), not on the source.
   Thresholds: schematic.md §4, in PAPER inches converted with the detail's factor. Tune with Jimmy. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { lintExport: api.lintExport, VIEWER_BELOW: api.VIEWER_BELOW });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var VIEWER_BELOW = 80;        // percent: open the viewer below this
  var MIN_LINE_PAPER = 1 / 64;  // paper inches: shorter segments are "clean lines" warnings
  var MIN_TEXT_PAPER = 1 / 8;   // paper inches: smaller text is a warning
  var MIN_DASH_PAPER = 1 / 16;  // paper inches: shorter dashes or gaps are a warning
  var MIN_SPACING_PAPER = 1 / 32; // paper inches: hatch lines closer than this are a warning

  function segLen(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }

  function lintExport(args) {
    var built = args.built, parsed = args.parsed, version = args.version;
    var prims = built.prims, factor = built.factor;
    var blockDefs = built.blocks || {};
    var all = prims.slice();
    Object.keys(blockDefs).forEach(function (n) { all = all.concat(blockDefs[n]); });
    var validity = [], checks = [];

    // ---- validity (blocking)
    validity.push({ id: 'parses', label: 'File parses', ok: parsed.errors.length === 0,
      reason: parsed.errors.length ? parsed.errors.join('; ') : '' });
    validity.push({ id: 'units', label: 'Units set (inches)', ok: parsed.insunits === 1,
      reason: parsed.insunits === 1 ? '' : 'the header does not set inches' });
    validity.push({ id: 'geometry', label: 'Has geometry', ok: parsed.entities.length > 0,
      reason: parsed.entities.length ? '' : 'no entities were written' });
    var badPts = all.some(function (p) {
      var pts = p.k === 'text' || p.k === 'insert' ? [p.at] : p.pts;
      return pts.some(function (q) { return !isFinite(q[0]) || !isFinite(q[1]); });
    });
    validity.push({ id: 'finite', label: 'Every coordinate is a number', ok: !badPts,
      reason: badPts ? 'a coordinate is not a finite number' : '' });
    var openHatch = prims.some(function (p) { return p.k === 'hatch' && p.pts.length < 3; });
    validity.push({ id: 'closed-hatch', label: 'Hatch boundaries closed', ok: !openHatch,
      reason: openHatch ? 'a hatch boundary has fewer than 3 points' : '' });
    validity.push({ id: 'read-back', label: 'Read back matches the list', ok: parsed.entities.length === prims.length,
      reason: parsed.entities.length === prims.length ? '' : 'wrote ' + prims.length + ' items, read back ' + parsed.entities.length });
    var inserts = prims.filter(function (p) { return p.k === 'insert'; });
    var missing = inserts.filter(function (p) { return !parsed.blocks[p.name]; }).map(function (p) { return p.name; });
    validity.push({ id: 'blocks-defined', label: 'Every block used is defined', ok: missing.length === 0,
      reason: missing.length ? 'no definition for ' + missing.join(', ') : '' });
    var ltNames = {}; (parsed.ltypes || []).forEach(function (t) { ltNames[t.name] = true; });
    var usedLt = {};
    parsed.entities.concat([].concat.apply([], Object.keys(parsed.blocks).map(function (n) { return parsed.blocks[n]; })))
      .forEach(function (e) { if (e.lt) usedLt[e.lt] = true; });
    var missingLt = Object.keys(usedLt).filter(function (n) { return !ltNames[n]; });
    validity.push({ id: 'linetypes-defined', label: 'Every line type used is defined', ok: missingLt.length === 0,
      reason: missingLt.length ? 'no definition for ' + missingLt.join(', ') : '' });
    var badPat = parsed.entities.filter(function (e) { return e.type === 'HATCH' && !e.solid && e.pattern && !(e.patternLines && e.patternLines.length); });
    validity.push({ id: 'patterns-defined', label: 'Every hatch pattern has its lines', ok: badPat.length === 0,
      reason: badPat.length ? badPat.length + ' pattern hatch(es) with no pattern lines' : '' });

    // ---- confidence (weighted checks)
    var shortLine = false;
    all.forEach(function (p) {
      if (p.k !== 'line') return;
      for (var i = 0; i + 1 < p.pts.length; i++) if (segLen(p.pts[i], p.pts[i + 1]) < MIN_LINE_PAPER * factor) shortLine = true;
    });
    checks.push({ id: 'clean-lines', label: 'Clean lines', w: 2, status: shortLine ? 'warn' : 'pass',
      hint: shortLine ? 'some segments are shorter than 1/64 paper inch: remove the duplicate or zero-length points' : '' });

    var smallText = all.some(function (p) { return p.k === 'text' && p.height < MIN_TEXT_PAPER * factor; });
    checks.push({ id: 'text-size', label: 'Text readable at scale', w: 2, status: smallText ? 'warn' : 'pass',
      hint: smallText ? 'a note is smaller than 1/8 paper inch at this scale: raise its size' : '' });

    var unknownPat = all.filter(function (p) { return p.boundaryOnly; });
    var unknownNames = {}; unknownPat.forEach(function (p) { unknownNames[p.unknownPattern] = true; });
    checks.push({ id: 'pattern-unknown', label: 'Hatch patterns in the library', w: 2, status: unknownPat.length ? 'warn' : 'pass',
      hint: unknownPat.length ? 'pattern ' + Object.keys(unknownNames).join(', ') + ' is not in the library yet: drawn as an outline' : '' });

    var minSpacing = Infinity;
    parsed.entities.forEach(function (e) {
      if (e.type === 'HATCH' && e.patternLines) e.patternLines.forEach(function (l) { minSpacing = Math.min(minSpacing, Math.abs(l.dy)); });
    });
    var thin = isFinite(minSpacing) && minSpacing > 0 && minSpacing < MIN_SPACING_PAPER * factor;
    checks.push({ id: 'hatch-spacing', label: 'Hatch line spacing', w: 2, status: thin ? 'warn' : 'pass',
      hint: thin ? 'a hatch line is closer than 1/32 paper inch at this scale: the fill will read as grey' : '' });

    var shortDash = false;
    (parsed.ltypes || []).forEach(function (t) {
      t.dashes.forEach(function (v) { if (v !== 0 && Math.abs(v) < MIN_DASH_PAPER * factor) shortDash = true; });
    });
    parsed.entities.forEach(function (e) {
      if (e.type === 'HATCH' && e.patternLines) e.patternLines.forEach(function (l) {
        l.dashes.forEach(function (v) { if (v !== 0 && Math.abs(v) < MIN_DASH_PAPER * factor) shortDash = true; });
      });
    });
    checks.push({ id: 'dash-legibility', label: 'Dashes and gaps readable', w: 2, status: shortDash ? 'warn' : 'pass',
      hint: shortDash ? 'a dash or gap is shorter than 1/16 paper inch at this scale: lengthen the pattern' : '' });

    var solidHatch = prims.some(function (p) { return p.k === 'hatch'; });
    var r12Fill = version === 'AC1009' && solidHatch;
    checks.push({ id: 'r12-fill', label: 'Fill in this DXF version', w: 1, status: r12Fill ? 'warn' : 'pass',
      hint: r12Fill ? 'R12 output has no hatch fill here: filled areas are outlines. Use AC1027 for fills and patterns' : '' });

    var layer0 = all.some(function (p) { return (p.layer || '0') === '0'; });
    checks.push({ id: 'layers', label: 'Named layers', w: 1, status: layer0 ? 'warn' : 'pass',
      hint: layer0 ? 'some items are on layer 0' : '' });

    var readWarn = parsed.warnings.length > 0;
    checks.push({ id: 'read-warnings', label: 'Reader warnings', w: 2, status: readWarn ? 'warn' : 'pass',
      hint: readWarn ? parsed.warnings.join('; ') : '' });

    var totalW = 0, got = 0;
    checks.forEach(function (c) {
      totalW += c.w;
      got += c.w * (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0);
    });
    var score = totalW ? Math.round((got / totalW) * 100) : 0;

    // Items not exported are listed, not scored (schematic §4).
    var info = built.dropped.map(function (d) { return { id: d.id, kind: d.kind, reason: d.reason, where: d.where }; });

    var valid = validity.every(function (v) { return v.ok; });
    return { valid: valid, validity: validity, checks: checks, score: score, showViewer: score < VIEWER_BELOW, dropped: info };
  }

  return { lintExport: lintExport, VIEWER_BELOW: VIEWER_BELOW };
});
