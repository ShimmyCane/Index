/* Drafting — linter. Two results, as decided in convo v0.2 (Q9):
   1. validity   — pass or fail per check, blocking. A failure says why.
   2. confidence — 0 to 100%, from weighted checks (pass 1, warn 0.5, fail 0). Below 80%, the
                   page opens the viewer so the output can be seen.
   Both run on what the file reads back as (parseDXF), not on the source, so the result is what
   a CAD program would see. Thresholds: schematic.md §4 (starting values, to tune with Jimmy). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DRAFT = Object.assign(root.DRAFT || {}, { lintExport: api.lintExport, VIEWER_BELOW: api.VIEWER_BELOW });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var VIEWER_BELOW = 80;           // percent: open the viewer below this
  var MIN_LINE = 1 / 64;           // real inches: shorter segments are "clean lines" warnings
  var SOLID_KEYS = { solid: true, steel: true };

  function segLen(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }

  function lintExport(args) {
    var built = args.built, parsed = args.parsed, version = args.version;
    var prims = built.prims, factor = built.factor;
    var validity = [], checks = [];

    // ---- validity (blocking)
    validity.push({ id: 'parses', label: 'File parses', ok: parsed.errors.length === 0,
      reason: parsed.errors.length ? parsed.errors.join('; ') : '' });
    validity.push({ id: 'units', label: 'Units set (inches)', ok: parsed.insunits === 1,
      reason: parsed.insunits === 1 ? '' : 'the header does not set inches' });
    validity.push({ id: 'geometry', label: 'Has geometry', ok: parsed.entities.length > 0,
      reason: parsed.entities.length ? '' : 'no entities were written' });
    var badPts = prims.some(function (p) {
      var pts = p.k === 'text' ? [p.at] : p.pts;
      return pts.some(function (q) { return !isFinite(q[0]) || !isFinite(q[1]); });
    });
    validity.push({ id: 'finite', label: 'Every coordinate is a number', ok: !badPts,
      reason: badPts ? 'a coordinate is not a finite number' : '' });
    var openHatch = prims.some(function (p) { return p.k === 'hatch' && (p.pts.length < 3); });
    validity.push({ id: 'closed-hatch', label: 'Hatch boundaries closed', ok: !openHatch,
      reason: openHatch ? 'a hatch boundary has fewer than 3 points' : '' });
    validity.push({ id: 'read-back', label: 'Read back matches the list', ok: parsed.entities.length === prims.length,
      reason: parsed.entities.length === prims.length ? '' : 'wrote ' + prims.length + ' items, read back ' + parsed.entities.length });

    // ---- confidence (weighted checks)
    var shortLine = false, cleanHint = '';
    prims.forEach(function (p) {
      if (p.k !== 'line') return;
      for (var i = 0; i + 1 < p.pts.length; i++) {
        if (segLen(p.pts[i], p.pts[i + 1]) < MIN_LINE) { shortLine = true; }
      }
    });
    checks.push({ id: 'clean-lines', label: 'Clean lines', w: 2, status: shortLine ? 'warn' : 'pass',
      hint: shortLine ? 'some segments are shorter than 1/64 in: remove the duplicate or zero-length points' : '' });

    var minText = 0.125 * factor, smallText = prims.some(function (p) { return p.k === 'text' && p.height < minText; });
    checks.push({ id: 'text-size', label: 'Text readable at scale', w: 2, status: smallText ? 'warn' : 'pass',
      hint: smallText ? 'a note is smaller than 1/8 paper inch at this scale: raise its size' : '' });

    var patternHatch = prims.filter(function (p) { return p.boundaryOnly; });
    checks.push({ id: 'pattern-hatch', label: 'Hatch patterns', w: 2, status: patternHatch.length ? 'warn' : 'pass',
      hint: patternHatch.length ? patternHatch.length + ' hatch(es) use a pattern not exported yet (increment 2): drawn as outline' : '' });

    var solidHatch = prims.some(function (p) { return p.k === 'hatch' && p.solid; });
    var r12Fill = version === 'AC1009' && solidHatch;
    checks.push({ id: 'r12-fill', label: 'Fill in this DXF version', w: 1, status: r12Fill ? 'warn' : 'pass',
      hint: r12Fill ? 'R12 output has no hatch fill here: solid areas are outlines. Use AC1027 for fills' : '' });

    var layer0 = prims.some(function (p) { return (p.layer || '0') === '0'; });
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

    // Dropped items are listed, not scored (schematic §4).
    var info = built.dropped.map(function (d) { return { id: d.id, kind: d.kind, reason: d.reason }; });

    var valid = validity.every(function (v) { return v.ok; });
    return {
      valid: valid,
      validity: validity,
      checks: checks,
      score: score,
      showViewer: score < VIEWER_BELOW,
      dropped: info
    };
  }

  return { lintExport: lintExport, VIEWER_BELOW: VIEWER_BELOW };
});
