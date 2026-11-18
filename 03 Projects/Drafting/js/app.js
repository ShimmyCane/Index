/* Drafting — page script. Plain JS, no build. Text is set with textContent. */
(function () {
  'use strict';
  var D = window.DRAFT;
  var $ = function (id) { return document.getElementById(id); };
  var state = { detail: null, res: null };
  var LIBRARY = {};
  (window.DRAFT_SAMPLES || []).forEach(function (d) { LIBRARY[d.id] = d; });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ---- Find
  function renderList() {
    var q = ($('q').value || '').toLowerCase();
    var box = $('list');
    box.textContent = '';
    (window.DRAFT_SAMPLES || []).forEach(function (d, i) {
      var hay = (d.name + ' ' + (d.tags || []).join(' ')).toLowerCase();
      if (q && hay.indexOf(q) < 0) return;
      var b = el('button', 'sample', d.name + '  ·  tags: ' + (d.tags || []).join(', '));
      b.type = 'button';
      b.style.marginBottom = '8px';
      b.addEventListener('click', function () { choose(i); });
      box.appendChild(b);
    });
    if (!box.childNodes.length) box.appendChild(el('p', 'muted', 'No detail matches.'));
  }

  function choose(i) {
    state.detail = window.DRAFT_SAMPLES[i];
    $('current').textContent = 'Detail: ' + state.detail.name + '. Scale ' + state.detail.scale + '.';
    run();
  }

  // ---- Export, legibility and viewers
  function run() {
    if (!state.detail) return;
    state.res = D.exportDetail(state.detail, { version: $('ver').value, library: LIBRARY });
    $('download').disabled = !(state.res && state.res.ok);
    $('dlLin').hidden = !(state.res && state.res.ok && state.res.lin);
    $('dlPat').hidden = !(state.res && state.res.ok && state.res.pat);
    renderLegibility(state.res);
    drawDrawing(state.res.parsed);
    drawLineTypes(state.res.parsed);
    drawPatterns(state.res.parsed);
    if (state.res.lint.showViewer) setCollapsed('viewer', false);
  }

  function renderLegibility(res) {
    var lint = res.lint;
    $('valid').textContent = lint.valid ? 'Validity: pass' : 'Validity: fail. This file cannot be used.';
    $('valid').className = lint.valid ? 'ok' : 'bad';

    var vt = $('validity');
    vt.textContent = '';
    lint.validity.forEach(function (v) {
      var row = el('div', null, (v.ok ? '✓ ' : '✗ ') + v.label + (v.ok ? '' : ': ' + v.reason));
      row.className = v.ok ? 'ok' : 'bad';
      vt.appendChild(row);
    });

    $('score').textContent = lint.score + '%';
    $('score').className = 'score ' + (lint.score >= 80 ? 'ok' : 'warn');
    $('scoreNote').textContent = lint.showViewer ? 'Under 80%: the viewers are open below.' : 'Confidence: at or above 80%.';

    var ct = $('checks');
    ct.textContent = '';
    var t = el('table');
    var head = el('tr'); ['Check', 'Result', 'Note'].forEach(function (h) { head.appendChild(el('th', null, h)); });
    t.appendChild(head);
    lint.checks.forEach(function (c) {
      var tr = el('tr');
      tr.appendChild(el('td', null, c.label));
      tr.appendChild(el('td', c.status === 'pass' ? 'ok' : c.status === 'warn' ? 'warn' : 'bad', c.status));
      tr.appendChild(el('td', null, c.hint || ''));
      t.appendChild(tr);
    });
    ct.appendChild(t);

    var dt = $('dropped');
    dt.textContent = '';
    if (lint.dropped.length) {
      dt.appendChild(el('p', 'muted', 'Not in this file (listed, not scored):'));
      lint.dropped.forEach(function (d) {
        dt.appendChild(el('div', 'muted', '· ' + d.kind + ' ' + d.id + (d.where && d.where !== 'drawing' ? ' (in ' + d.where + ')' : '') + ': ' + d.reason));
      });
    }
  }

  function setCollapsed(name, collapsed) {
    var p = document.querySelector('[data-panel="' + name + '"]');
    if (!p) return;
    p.dataset.collapsed = String(collapsed);
    var h = p.querySelector('.panelHead');
    if (h) h.setAttribute('aria-expanded', String(!collapsed));
  }

  // Expand entities, including block inserts, into drawable shapes in CAD coordinates (y up).
  // A block's content is (x, -y) about its insertion point, scaled by the insert's scale.
  function expand(entities, blocks, tx, depth) {
    var out = [];
    (entities || []).forEach(function (e) {
      if (e.type === 'INSERT') {
        if (depth > 4 || !blocks[e.name]) return;
        var s = e.scale || 1;
        var ntx = function (q) { return [e.at[0] + s * q[0], e.at[1] - s * q[1]]; };
        expand(blocks[e.name], blocks, ntx, depth + 1).forEach(function (x) { out.push(x); });
        return;
      }
      var copy = Object.assign({}, e);
      if (e.pts) copy.pts = e.pts.map(tx);
      if (e.at) copy.at = tx(e.at);
      out.push(copy);
    });
    return out;
  }

  // ---- Viewer: the drawing as read back from the file (CAD coordinates, shown upright)
  function fit(cv, shapes) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = cv.clientWidth || 880, cssH = cv.clientHeight || 360;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, cssW, cssH);
    var xs = [], ys = [];
    shapes.forEach(function (e) {
      (e.pts || []).forEach(function (q) { xs.push(q[0]); ys.push(q[1]); });
      if (e.at) { xs.push(e.at[0]); ys.push(e.at[1]); }
    });
    if (!xs.length) { ctx.fillStyle = '#6f695c'; ctx.font = '16px system-ui'; ctx.fillText('Nothing to show.', 16, 28); return null; }
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs);
    var miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var pad = 24, w = Math.max(1e-9, maxx - minx), h = Math.max(1e-9, maxy - miny);
    var s = Math.min((cssW - 2 * pad) / w, (cssH - 2 * pad) / h);
    return {
      ctx: ctx, s: s,
      X: function (x) { return pad + (x - minx) * s; },
      Y: function (y) { return cssH - pad - (y - miny) * s; }
    };
  }

  function drawDrawing(parsed) {
    var cv = $('view');
    if (!parsed) return;
    var shapes = expand(parsed.entities, parsed.blocks, function (q) { return q; }, 0);
    var v = fit(cv, shapes);
    if (!v) return;
    var ctx = v.ctx;
    shapes.forEach(function (e) {
      if (e.type === 'POLYLINE' || e.type === 'LINE') {
        ctx.beginPath();
        e.pts.forEach(function (q, i) { i ? ctx.lineTo(v.X(q[0]), v.Y(q[1])) : ctx.moveTo(v.X(q[0]), v.Y(q[1])); });
        if (e.closed) ctx.closePath();
        ctx.strokeStyle = '#2b2a26'; ctx.lineWidth = 1.5;
        ctx.setLineDash(e.lt ? dashFor(parsed, e.lt, v.s) : []);
        ctx.stroke(); ctx.setLineDash([]);
      } else if (e.type === 'HATCH') {
        if (!e.pts.length) return;
        ctx.beginPath();
        e.pts.forEach(function (q, i) { i ? ctx.lineTo(v.X(q[0]), v.Y(q[1])) : ctx.moveTo(v.X(q[0]), v.Y(q[1])); });
        ctx.closePath();
        if (e.solid) { ctx.fillStyle = 'rgba(43,42,38,0.35)'; ctx.fill(); }
        ctx.strokeStyle = '#8a8373'; ctx.lineWidth = 1; ctx.setLineDash(e.solid ? [] : [4, 3]); ctx.stroke(); ctx.setLineDash([]);
      } else if (e.type === 'TEXT') {
        var px = Math.max(8, e.height * v.s);
        ctx.fillStyle = '#2b2a26'; ctx.font = Math.round(px) + 'px system-ui';
        ctx.fillText(e.text, v.X(e.at[0]), v.Y(e.at[1]));
      }
    });
  }

  // Canvas dash array for a named line type, scaled to the drawing (real inches × view scale).
  function dashFor(parsed, name, s) {
    var t = (parsed.ltypes || []).filter(function (x) { return x.name === name; })[0];
    if (!t) return [];
    // canvas dashes alternate on and off by position, so the sign is dropped here
    return t.dashes.map(function (v) { return Math.abs(v) * s; });
  }

  // ---- Line-type viewer: each line type in the file, drawn as its dash pattern
  function drawLineTypes(parsed) {
    var box = $('ltList');
    box.textContent = '';
    if (!parsed || !parsed.ltypes.length) {
      box.appendChild(el('p', 'muted', 'No line types in this file. Only solid lines are used.'));
      return;
    }
    parsed.ltypes.forEach(function (t) {
      var row = el('div', 'ltRow');
      row.appendChild(el('div', 'muted', t.name + ' — dashes (positive = pen down, negative = gap, 0 = dot), real inches: ' + t.dashes.join(', ')));
      var cv = el('canvas', 'ltCanvas');
      cv.setAttribute('aria-label', 'line type ' + t.name);
      row.appendChild(cv);
      box.appendChild(row);
      var dpr = window.devicePixelRatio || 1;
      var w = box.clientWidth || 600, h = 56;
      cv.style.height = h + 'px';
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      var ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, w, h);
      var total = t.dashes.reduce(function (s, v) { return s + Math.abs(v); }, 0) || 1;
      var k = (w - 40) / (total * 3);        // show three repeats, scaled to fit
      var dashes = t.dashes.map(function (v) { return Math.abs(v) * k; });
      ctx.strokeStyle = '#2b2a26'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(20, h / 2); ctx.lineTo(w - 20, h / 2);
      ctx.setLineDash(dashes.length ? dashes : []); ctx.stroke(); ctx.setLineDash([]);
      // dots (0) are drawn as small marks
      var x = 20;
      t.dashes.forEach(function (v) {
        var len = Math.abs(v) * k;
        if (v === 0) { ctx.fillStyle = '#2b2a26'; ctx.beginPath(); ctx.arc(x + 2, h / 2, 2.5, 0, Math.PI * 2); ctx.fill(); }
        x += len;
      });
    });
  }

  // ---- Hatch viewer: each pattern used, drawn at real size in a box, from the pattern lines in the file
  function drawPatterns(parsed) {
    var box = $('patList');
    box.textContent = '';
    if (!parsed) return;
    var seen = {};
    var pats = [];
    parsed.entities.concat([].concat.apply([], Object.keys(parsed.blocks).map(function (n) { return parsed.blocks[n]; })))
      .forEach(function (e) {
        if (e.type === 'HATCH' && e.patternLines && e.patternLines.length && !seen[e.pattern]) {
          seen[e.pattern] = true;
          pats.push({ name: e.pattern, lines: e.patternLines });
        }
      });
    if (!pats.length) {
      box.appendChild(el('p', 'muted', 'No pattern hatches in this file. Solid fills and outlines only.'));
      return;
    }
    pats.forEach(function (p) {
      var row = el('div', 'ptRow');
      row.appendChild(el('div', 'muted', p.name + ' — ' + p.lines.length + ' line family(ies). Shown at real size: each square is 2 real inches.'));
      var cv = el('canvas', 'ptCanvas');
      cv.setAttribute('aria-label', 'pattern ' + p.name);
      row.appendChild(cv);
      box.appendChild(row);
      drawPattern(cv, p.lines);
    });
  }

  function drawPattern(cv, lines) {
    var dpr = window.devicePixelRatio || 1;
    var cssW = Math.min(cv.parentElement.clientWidth || 300, 320), cssH = cssW;
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, cssW, cssH);
    var boxIn = 2;                              // real inches shown
    var s = cssW / boxIn;                       // px per real inch
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, cssW, cssH); ctx.clip();
    lines.forEach(function (l) {
      var a = l.angle * Math.PI / 180;
      var ux = Math.cos(a), uy = Math.sin(a);   // along the line
      var nx = -uy, ny = ux;                    // across the lines
      var spacing = Math.abs(l.dy) || 0.5;
      var cx = cssW / 2, cy = cssH / 2;
      for (var k = -12; k <= 12; k++) {
        var ox = cx + (l.x0 * s) + k * spacing * s * nx;
        var oy = cy - (l.y0 * s) + k * spacing * s * ny;   // sheet y down on screen
        ctx.beginPath();
        ctx.moveTo(ox - ux * cssW * 2, oy - uy * cssH * 2);
        ctx.lineTo(ox + ux * cssW * 2, oy + uy * cssH * 2);
        ctx.strokeStyle = '#2b2a26'; ctx.lineWidth = 1;
        ctx.setLineDash(l.dashes.length ? l.dashes.map(function (v) { return Math.abs(v) * s; }) : []);
        ctx.stroke(); ctx.setLineDash([]);
      }
    });
    ctx.restore();
    ctx.strokeStyle = '#2b2a26'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, cssW - 2, cssH - 2);
  }

  // ---- Downloads (on the device only)
  function download(text, filename, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ---- Wire up
  $('q').addEventListener('input', renderList);
  $('ver').addEventListener('change', run);
  $('download').addEventListener('click', function () {
    if (!state.res || !state.res.ok) return;
    download(state.res.dxf, state.res.filename, 'application/dxf');
  });
  $('dlLin').addEventListener('click', function () {
    if (!state.res || !state.res.lin) return;
    download(state.res.lin, state.res.filename.replace(/\.dxf$/, '.lin'), 'text/plain');
  });
  $('dlPat').addEventListener('click', function () {
    if (!state.res || !state.res.pat) return;
    download(state.res.pat, state.res.filename.replace(/\.dxf$/, '.pat'), 'text/plain');
  });
  document.querySelectorAll('.panelHead').forEach(function (h) {
    h.addEventListener('click', function () {
      var p = h.parentElement;
      setCollapsed(p.dataset.panel, p.dataset.collapsed !== 'true');
      if (state.res) {
        if (p.dataset.panel === 'viewer') drawDrawing(state.res.parsed);
        if (p.dataset.panel === 'linetypes') drawLineTypes(state.res.parsed);
        if (p.dataset.panel === 'hatches') drawPatterns(state.res.parsed);
      }
    });
  });
  window.addEventListener('resize', function () {
    if (!state.res) return;
    drawDrawing(state.res.parsed); drawLineTypes(state.res.parsed); drawPatterns(state.res.parsed);
  });

  renderList();
  choose(0);
})();
