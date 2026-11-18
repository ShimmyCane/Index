/* Drafting — page script (increment 1). Plain JS, no build. Text is set with textContent. */
(function () {
  'use strict';
  var D = window.DRAFT;
  var $ = function (id) { return document.getElementById(id); };
  var state = { detail: null, res: null };

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

  // ---- Export and legibility
  function run() {
    if (!state.detail) return;
    state.res = D.exportDetail(state.detail, { version: $('ver').value });
    $('download').disabled = !(state.res && state.res.ok);
    renderLegibility(state.res);
    drawViewer(state.res.parsed);
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
    $('scoreNote').textContent = lint.showViewer ? 'Under 80%: the viewer is open below.' : 'Confidence: at or above 80%.';

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
        dt.appendChild(el('div', 'muted', '· ' + d.kind + ' ' + d.id + ': ' + d.reason));
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

  // ---- Viewer: draws what the file reads back as (CAD coordinates, y up, shown upright)
  function drawViewer(parsed) {
    var cv = $('view'), ctx = cv.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssW = cv.clientWidth || 880, cssH = cv.clientHeight || 360;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fffdf7'; ctx.fillRect(0, 0, cssW, cssH);
    if (!parsed || !parsed.entities.length) {
      ctx.fillStyle = '#6f695c'; ctx.font = '16px system-ui'; ctx.fillText('Nothing to show.', 16, 28);
      return;
    }
    var xs = [], ys = [];
    parsed.entities.forEach(function (e) {
      (e.pts || []).forEach(function (q) { xs.push(q[0]); ys.push(q[1]); });
      if (e.at) { xs.push(e.at[0]); ys.push(e.at[1]); }
    });
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs);
    var miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var pad = 24, w = Math.max(1e-9, maxx - minx), h = Math.max(1e-9, maxy - miny);
    var s = Math.min((cssW - 2 * pad) / w, (cssH - 2 * pad) / h);
    function X(x) { return pad + (x - minx) * s; }
    function Y(y) { return cssH - pad - (y - miny) * s; }   // y up in the file, shown upright

    parsed.entities.forEach(function (e) {
      if (e.type === 'POLYLINE' || e.type === 'LINE') {
        ctx.beginPath();
        e.pts.forEach(function (q, i) { i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); });
        if (e.closed) ctx.closePath();
        ctx.strokeStyle = '#2b2a26'; ctx.lineWidth = 1.5; ctx.stroke();
      } else if (e.type === 'HATCH') {
        if (!e.pts.length) return;
        ctx.beginPath();
        e.pts.forEach(function (q, i) { i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); });
        ctx.closePath();
        if (e.solid) { ctx.fillStyle = 'rgba(43,42,38,0.35)'; ctx.fill(); }
        ctx.strokeStyle = '#8a8373'; ctx.lineWidth = 1; ctx.setLineDash(e.solid ? [] : [4, 3]); ctx.stroke(); ctx.setLineDash([]);
      } else if (e.type === 'TEXT') {
        var px = Math.max(8, e.height * s);
        ctx.fillStyle = '#2b2a26'; ctx.font = Math.round(px) + 'px system-ui';
        ctx.fillText(e.text, X(e.at[0]), Y(e.at[1]));
      }
    });
  }

  // ---- Wire up
  $('q').addEventListener('input', renderList);
  $('ver').addEventListener('change', run);
  $('download').addEventListener('click', function () {
    if (!state.res || !state.res.ok) return;
    var blob = new Blob([state.res.dxf], { type: 'application/dxf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = state.res.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  document.querySelectorAll('.panelHead').forEach(function (h) {
    h.addEventListener('click', function () {
      var p = h.parentElement;
      setCollapsed(p.dataset.panel, p.dataset.collapsed !== 'true');
      if (p.dataset.panel === 'viewer' && state.res) drawViewer(state.res.parsed);
    });
  });
  window.addEventListener('resize', function () { if (state.res) drawViewer(state.res.parsed); });

  renderList();
  choose(0);
})();
