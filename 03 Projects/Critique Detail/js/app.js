/* Critique Detail viewer. Classic script, no build. Opens from file:// and from GitHub Pages.
   Results only: this page never runs a review and never calls an AI service.
   Data, in order: cloud (owner signed in) -> this device's saved copy -> the bundled samples. */
(function () {
  'use strict';
  var CFG = window.DC_CONFIG, SAMPLE = window.DC_SAMPLE;
  var SEV = ['CRITICAL', 'MAJOR', 'ADVISORY'];
  var SVG = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked or full */ } }
  function drop(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  // ---------- state
  var DEFAULTS = { boxes: 1, sheet: 'clean', verdict: 1, proof: 1, layers: 1, good: 1, focus: 0, showErrors: false };
  var settings = Object.assign({}, DEFAULTS, load('dc.settings', {}));
  var statuses = load('dc.status', {});            // "<slug>#<n>" -> open | accepted | dismissed
  var errors = [];
  var session = null;                              // { token, refresh, email }
  var entries = [];                                // { id, source, report, image, markup, reviewId, file }
  var quick = [];                                  // Quick Detail cloud rows
  var current = null, selected = null, filter = 'ALL', focusIndex = 0;
  var extra = null;                                // { kind: 'evidence' | 'break', box, key } shown on the drawing

  function logError(msg) { errors.push(new Date().toLocaleTimeString() + '  ' + msg); renderErrors(); }
  function renderErrors() {
    var box = $('errorsPanel');
    box.hidden = !settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  window.addEventListener('error', function (e) { logError(e.message); });
  window.addEventListener('unhandledrejection', function (e) { logError(String(e.reason && e.reason.message || e.reason)); });

  // ---------- collapsible panels (project_track.md)
  var panelState = load('dc.panels', {});
  function setPanel(section, open) {
    section.dataset.collapsed = String(!open);
    section.querySelector('.panelHead').setAttribute('aria-expanded', String(open));
  }
  document.querySelectorAll('.panel').forEach(function (section) {
    var id = section.dataset.panel;
    setPanel(section, id in panelState ? panelState[id] : section.dataset.open !== 'false');
    section.querySelector('.panelHead').addEventListener('click', function () {
      var open = section.dataset.collapsed === 'true';
      setPanel(section, open); panelState[id] = open; store('dc.panels', panelState);
    });
  });
  function openPanel(name) {
    var section = document.querySelector('.panel[data-panel="' + name + '"]');
    setPanel(section, true); panelState[name] = true; store('dc.panels', panelState);
    return section;
  }

  // ---------- older reports (0.1) are read as they are; fill what they lack
  function normalise(r) {
    r.gate = r.gate || { verdict: 'pass', reasons: [], warnings: r.warnings || [], missing: (r.completeness || {}).missing || [], checks: r.completeness || {} };
    r.qc_list = r.qc_list || []; r.control_layers = r.control_layers || []; r.findings = r.findings || [];
    r.counts = r.counts || {}; r.schema = r.schema || {}; r.context = r.context || {};
    r.findings.forEach(function (f) { f.qc_id = f.qc_id || f.checklist_id || ''; });
    r.reviewer = r.reviewer || r.mode || '';
    return r;
  }

  // ---------- entries
  function addEntry(entry) {
    normalise(entry.report);
    entries = entries.filter(function (e) { return e.id !== entry.id; });
    entries.push(entry);
  }
  function seedEntries() {
    entries = [];
    SAMPLE.samples.forEach(function (s) {
      addEntry({ id: 'sample:' + s.report.detail.slug, source: 'sample', report: s.report, image: s.image, markup: s.report.markup });
    });
    load('dc.cache', []).forEach(function (c) {
      addEntry({ id: 'db:' + c.slug, source: 'cache', report: c.report, image: '', markup: '', reviewId: c.reviewId });
    });
  }

  // ---------- render: list, sheet
  function renderList() {
    var ul = $('detailList'); ul.textContent = '';
    var label = { sample: 'bundled sample', cache: 'saved copy, no image', database: 'cloud', file: 'working file, this device only' };
    entries.forEach(function (e) {
      var li = el('li'), b = el('button', 'pick' + (current && e.id === current.id ? ' on' : '')), c = e.report.counts;
      b.type = 'button';
      b.textContent = e.report.detail.title + '\n' + label[e.source] + ' · ' + (e.report.verdict ? e.report.verdict + ' · ' : '') +
        (c.CRITICAL || 0) + ' critical, ' + (c.MAJOR || 0) + ' major, ' + (c.ADVISORY || 0) + ' advisory';
      b.addEventListener('click', function () { show(e.id); });
      li.appendChild(b); ul.appendChild(li);
    });
    $('saveCloud').hidden = !(session && current && current.source === 'file');
    $('quickBox').hidden = !quick.length;
    var ql = $('quickList'); ql.textContent = '';
    quick.forEach(function (q) {
      ql.appendChild(el('li', '', (q.reviewed ? '✅ ' : '⬜ ') + q.name + '\n' + (q.tags || []).join(', ') + (q.reviewed ? ' · reviewed' : ' · not reviewed yet')));
    });
  }

  function statusOf(f) { return statuses[current.report.detail.slug + '#' + f.n] || f.status || 'open'; }
  function rect(box, cls) {
    var r = document.createElementNS(SVG, 'rect');
    r.setAttribute('x', box[1]); r.setAttribute('y', box[0]);
    r.setAttribute('width', box[3] - box[1]); r.setAttribute('height', box[2] - box[0]); r.setAttribute('rx', 6);
    if (cls) r.setAttribute('class', cls);
    return r;
  }

  function renderSheet() {
    var r = current.report, img = $('sheetImg');
    var src = settings.sheet === 'markup' && current.markup ? current.markup : current.image;
    $('sheetTitle').textContent = r.detail.title;
    $('sheet').hidden = !src;
    if (src && img.getAttribute('src') !== src) img.src = src;
    $('stamp').hidden = r.gate.verdict !== 'reject' || settings.sheet === 'markup';
    $('sheetMeta').textContent = (src ? '' : 'No image on this device for this detail. Sign in to load it. ') +
      r.detail.input + ' · ' + r.detail.width + ' × ' + r.detail.height + ' px · reviewed by ' + r.reviewer + ' · ' + new Date(r.run_at).toLocaleString();
    var svg = $('overlay'), bubbles = $('bubbles');
    svg.textContent = ''; bubbles.textContent = '';
    if (!src || settings.sheet === 'markup') return;
    if (extra && extra.box) svg.appendChild(rect(extra.box, extra.kind));
    if (!settings.boxes) return;
    var sheet = $('sheet'), placed = [];
    var gapX = 38 / (sheet.clientWidth || 800) * 100, gapY = 38 / (sheet.clientHeight || 600) * 100;
    r.findings.forEach(function (f) {
      if (!f.box_2d || statusOf(f) === 'dismissed') return;
      var b = f.box_2d;
      svg.appendChild(rect(b, selected === f.n ? 'on' : ''));
      var dot = el('button', 'bubble' + (selected === f.n ? ' on' : ''), String(f.n));
      dot.type = 'button'; dot.setAttribute('aria-label', 'Finding ' + f.n + ': ' + f.title);
      // the number sits on the box's top-left corner; it slides right if another number is already there
      var x = Math.max(gapX / 2, b[1] / 10), y = Math.max(gapY / 2, b[0] / 10);
      while (placed.some(function (q) { return Math.abs(q[0] - x) < gapX && Math.abs(q[1] - y) < gapY; })) x += gapX;
      placed.push([x, y]);
      dot.style.left = x + '%'; dot.style.top = y + '%';
      dot.addEventListener('click', function () { select(f.n, true); });
      bubbles.appendChild(dot);
    });
  }

  // ---------- render: verdict, findings
  function renderVerdict() {
    var r = current.report, box = $('verdictBox');
    box.hidden = !settings.verdict || !r.verdict;
    box.className = 'verdict ' + (r.verdict || '');
    $('verdictWord').textContent = r.verdict || ''; $('verdictNote').textContent = r.verdict_note || '';
  }

  function visibleFindings() {
    return current.report.findings.filter(function (f) { return filter === 'ALL' || f.severity === filter; });
  }
  function findingCard(f) {
    var st = statusOf(f), card = el('article', 'finding ' + f.severity + (selected === f.n ? ' on' : '') + (st === 'dismissed' ? ' dismissed' : ''));
    card.id = 'finding-' + f.n;
    var h = el('h3');
    h.appendChild(el('span', 'num', String(f.n)));
    h.appendChild(el('span', 'sev ' + f.severity, f.severity));
    h.appendChild(el('span', '', f.title));
    h.appendChild(el('code', '', f.qc_id));
    card.appendChild(h);
    card.appendChild(el('p', '', f.issue));
    var fix = el('p'); fix.appendChild(el('b', '', 'Fix: ')); fix.appendChild(document.createTextNode(f.recommendation)); card.appendChild(fix);
    if (settings.good && f.good) {
      var q = current.report.qc_list.filter(function (x) { return x.id === f.qc_id; })[0];
      var good = el('div', 'good'), pic = el('img'), words = el('div');
      pic.src = f.good; pic.alt = 'A correct detail for ' + f.qc_id; pic.loading = 'lazy';
      words.appendChild(el('small', '', '✓ What good looks like'));
      words.appendChild(document.createTextNode(q ? q.item : ''));
      good.appendChild(pic); good.appendChild(words);
      pic.addEventListener('click', function (ev) { ev.stopPropagation(); good.classList.toggle('big'); });
      card.appendChild(good);
    }
    if (!f.box_2d) card.appendChild(el('p', 'meta', 'No location on the drawing.'));
    var seg = el('div', 'seg small');
    [['open', 'Open'], ['accepted', 'Accepted'], ['dismissed', 'Dismissed']].forEach(function (o) {
      var b = el('button', st === o[0] ? 'on' : '', o[1]); b.type = 'button';
      b.addEventListener('click', function (ev) { ev.stopPropagation(); setStatus(f, o[0]); });
      seg.appendChild(b);
    });
    card.appendChild(seg);
    card.addEventListener('click', function () { select(f.n, false); });
    return card;
  }
  function renderFindings() {
    var r = current.report, c = r.counts, box = $('findingList'), rejected = r.gate.verdict === 'reject';
    $('counts').textContent = rejected ? '· rejected at the gate' : '· ' + (c.CRITICAL || 0) + ' critical · ' + (c.MAJOR || 0) + ' major · ' + (c.ADVISORY || 0) + ' advisory';
    $('summary').textContent = rejected ? 'This drawing was rejected before any audit. It cannot be reviewed as drawn:' : r.summary;
    var reasons = $('gateReasons'); reasons.textContent = ''; reasons.hidden = !rejected;
    r.gate.reasons.forEach(function (x) { reasons.appendChild(el('li', '', x)); });
    $('sevFilter').hidden = rejected;
    document.querySelectorAll('#sevFilter button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === filter); });
    box.textContent = '';
    var rows = visibleFindings();
    $('focusNav').hidden = !settings.focus || rows.length < 2;
    if (rejected) { if (r.gate.missing.length) box.appendChild(el('p', 'meta', 'Missing: ' + r.gate.missing.join('; ') + '.')); return; }
    if (!rows.length) { box.appendChild(el('p', 'meta', 'No findings at this level.')); return; }
    if (settings.focus) {
      focusIndex = Math.max(0, Math.min(rows.length - 1, focusIndex));
      $('focusCount').textContent = 'Fix ' + (focusIndex + 1) + ' of ' + rows.length;
      box.appendChild(findingCard(rows[focusIndex]));
    } else rows.forEach(function (f) { box.appendChild(findingCard(f)); });
  }
  function stepFocus(by) {
    var rows = visibleFindings();
    focusIndex = Math.max(0, Math.min(rows.length - 1, focusIndex + by));
    selected = rows[focusIndex] ? rows[focusIndex].n : null; extra = null;
    renderSheet(); renderFindings(); renderNotesWhere();
  }
  $('focusPrev').addEventListener('click', function () { stepFocus(-1); });
  $('focusNext').addEventListener('click', function () { stepFocus(1); });

  // ---------- render: proof ledger, control layers
  function featurePanels() {
    var r = current.report, rejected = r.gate.verdict === 'reject';
    document.querySelector('[data-panel="proof"]').hidden = !settings.proof || rejected || !r.proof;
    document.querySelector('[data-panel="layers"]').hidden = !settings.layers || rejected || !r.control_layers.length;
  }
  function renderProof() {
    var r = current.report, p = r.proof, t = $('proofTable'), bar = $('proofBar');
    t.textContent = ''; bar.textContent = '';
    if (!p) return;
    $('proofTitle').textContent = 'Proof: ' + p.verdict.toLowerCase() + ' · ' + p.proven + ' of ' + p.total + ' claims proven';
    ['proven', 'claimed', 'disproven', 'unproven'].forEach(function (k) {
      if (!p[k]) return; var i = el('i', k); i.style.width = (p[k] / p.total * 100) + '%'; i.title = p[k] + ' ' + k; bar.appendChild(i);
    });
    var head = el('tr'); ['Claim', 'A correct detail shows', 'Result'].forEach(function (h) { head.appendChild(el('th', '', h)); }); t.appendChild(head);
    var words = { proven: '✓ proven', claimed: '~ passed, no place shown', disproven: '✗ disproven', unproven: '? not shown', na: '– not applicable' };
    r.qc_list.forEach(function (q) {
      var tr = el('tr', 'tap' + (extra && extra.key === 'qc:' + q.id ? ' on' : ''));
      var a = el('td'); a.appendChild(el('code', '', q.id)); a.appendChild(document.createElement('br'));
      a.appendChild(el('span', 'sev ' + q.severity, q.severity)); a.appendChild(document.createTextNode(' ')); a.appendChild(el('span', 'chip', q.origin));
      var b = el('td', '', q.item); if (q.why) b.appendChild(el('div', 'meta', q.why));
      var d = el('td'); d.appendChild(el('span', 'pf ' + q.proof, words[q.proof] || q.proof)); d.appendChild(el('div', 'meta', q.note));
      tr.appendChild(a); tr.appendChild(b); tr.appendChild(d);
      tr.addEventListener('click', function () {
        var f = r.findings.filter(function (x) { return x.qc_id === q.id; })[0];
        if (q.evidence_box) { selected = null; extra = { kind: 'evidence', box: q.evidence_box, key: 'qc:' + q.id }; renderSheet(); renderFindings(); renderProof(); }
        else if (f) { extra = null; selected = null; select(f.n, true); renderProof(); }
      });
      t.appendChild(tr);
    });
    var skipped = r.skipped_by_condition || [];
    $('skippedNote').textContent = skipped.length ? 'Left off the list for this project: ' + skipped.map(function (s) { return s.id + ' (' + s.reason + ')'; }).join('; ') + '.' : '';
  }
  function renderLayers() {
    var box = $('layerList'); box.textContent = '';
    var words = { continuous: '✓ continuous', broken: '✗ broken', not_shown: '? not shown', na: '– n/a' };
    current.report.control_layers.forEach(function (l) {
      var b = el('button', 'layer ' + l.status + (extra && extra.key === 'layer:' + l.layer ? ' on' : '')); b.type = 'button';
      b.appendChild(el('b', '', l.layer)); b.appendChild(el('span', 'st', words[l.status])); b.appendChild(el('span', '', l.note));
      b.addEventListener('click', function () {
        selected = null;
        extra = l.break_box && !(extra && extra.key === 'layer:' + l.layer) ? { kind: 'break', box: l.break_box, key: 'layer:' + l.layer } : null;
        renderSheet(); renderFindings(); renderLayers(); renderProof();
      });
      box.appendChild(b);
    });
  }

  // ---------- render: steps, rulebooks
  function renderSteps() {
    var r = current.report, g = r.gate, ol = $('steps'); ol.textContent = '';
    var yn = function (v) { return v ? 'yes' : 'no'; }, ctx = r.context, k = g.checks || {};
    var origin = function (o) { return r.qc_list.filter(function (q) { return q.origin === o; }).length; };
    var lines = [
      'Gate: ' + (g.verdict === 'reject' ? 'REJECTED. ' + g.reasons.join(' ') : 'passed.') + ' Scale shown ' + yn(k.scale_shown) + ', materials labelled ' + yn(k.materials_labelled) +
        ', geometry clear ' + yn(k.geometry_clear) + '.' + (g.warnings.length ? ' Warnings: ' + g.warnings.join(' ') : ''),
      'QC list for this project: ' + r.qc_list.length + ' items (' + origin('rulebook') + ' from the rulebook, ' + origin('condition') + ' by project condition, ' +
        origin('mandate') + ' project mandates, ' + origin('lesson') + ' lessons). ' + [ctx.building_code, ctx.energy_code, ctx.climate_zone].filter(Boolean).join('; ') + '.'
    ];
    if (g.verdict !== 'reject') {
      lines.push('Audit: one pass by ' + r.reviewer + ' against ' + (r.schema.csi_section || '') + ' ' + (r.schema.title || '') + '.');
      lines.push('Priorities: ' + SEV.map(function (s) { return (r.counts[s] || 0) + ' ' + s.toLowerCase(); }).join(', ') + (r.proof ? '. Proof: ' + r.proof.proven + ' of ' + r.proof.total + ' claims proven.' : '.'));
    }
    lines.push('Output: report ' + r.detail.slug + '.json and .md, redline ' + r.markup + '.');
    lines.forEach(function (t) { ol.appendChild(el('li', '', t)); });
  }
  function renderRulebooks() {
    var box = $('rulebookList'), last = ''; box.textContent = '';
    var full = SAMPLE.schemas.filter(function (s) { return s.checklist.length; }).length;
    $('rulebooksTitle').textContent = 'Rulebooks by CSI division · ' + SAMPLE.schemas.length + ' detail types, ' + full + ' written';
    SAMPLE.schemas.slice().sort(function (a, b) { return a.csi_section < b.csi_section ? -1 : a.csi_section > b.csi_section ? 1 : 0; }).forEach(function (s) {
      if (s.csi_division !== last) { last = s.csi_division; box.appendChild(el('div', 'division', 'Division ' + s.csi_division + ' · ' + s.key.split('/')[0].replace(/^div_\d+_/, '').replace(/_/g, ' '))); }
      var d = el('details'), sum = el('summary', '', s.csi_section + ' ' + s.subcategory + ' · ' + s.title + ' ');
      sum.appendChild(el('span', 'chip ' + s.status, s.checklist.length ? s.checklist.length + ' items' : 'stub'));
      d.appendChild(sum);
      if (!s.checklist.length) d.appendChild(el('p', 'meta', 'Stub. The reviewer writes its six items the first time a detail of this type is reviewed.'));
      var ol = el('ol'); s.checklist.forEach(function (c) {
        ol.appendChild(el('li', '', c.id + ' [' + c.default_severity + '] ' + c.item + (c.when ? ' (only when ' + c.when.key + ' is ' + c.when.in.join(' or ') + ')' : '')));
      });
      d.appendChild(ol); box.appendChild(d);
    });
    var d = el('details'); d.appendChild(el('summary', '', 'Lessons learned (' + SAMPLE.lessons.length + ')'));
    var ul = el('ul'); SAMPLE.lessons.forEach(function (l) { ul.appendChild(el('li', '', l.id + ' · ' + l.category + ' · ' + l.text)); });
    d.appendChild(ul); box.appendChild(d);
  }

  function renderAll() { renderList(); renderSheet(); renderVerdict(); renderFindings(); featurePanels(); renderProof(); renderLayers(); renderSteps(); renderNotesWhere(); renderDefaults(); }

  function show(id) {
    current = entries.filter(function (e) { return e.id === id; })[0] || entries[0];
    selected = null; extra = null; focusIndex = 0; store('dc.last', current.id);
    renderAll(); $('colRight').scrollTop = 0;
    if (current.source === 'database' && !current.image) loadImages(current);
  }
  function select(n, scroll) {
    selected = selected === n ? null : n; extra = null;
    if (settings.focus && selected) focusIndex = Math.max(0, visibleFindings().map(function (f) { return f.n; }).indexOf(n));
    renderSheet(); renderFindings(); renderNotesWhere();
    if (!scroll || !selected) return;
    openPanel('findings');
    var card = $('finding-' + n);                    // the right column scrolls to the finding
    if (card) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function setStatus(f, status) {
    statuses[current.report.detail.slug + '#' + f.n] = status; store('dc.status', statuses);
    renderSheet(); renderFindings();
    if (session && current.reviewId) {
      api('PATCH', '/rest/v1/dc_findings?review_id=eq.' + current.reviewId + '&n=eq.' + f.n, { status: status })
        .catch(function (e) { logError('Could not save the status: ' + e.message); setPill('⚠️ check'); });
    }
  }
  document.querySelectorAll('#sevFilter button').forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.v; focusIndex = 0; renderFindings(); });
  });

  // ---------- project defaults: from the review's JSON, or the 2025 California code defaults
  var FIELDS = [['project', 'Project'], ['building_code', 'Building code'], ['energy_code', 'Energy code'], ['accessibility_code', 'Accessibility'],
    ['green_code', 'Green building code'], ['climate_zone', 'Climate zone'], ['seismic_design_category', 'Seismic design category'],
    ['construction_type', 'Construction type'], ['occupancy', 'Occupancy'], ['units', 'Units']];
  var defaults = load('dc.defaults', null), defaultsFrom = defaults ? 'edited on this device' : '';
  function mandateLines(ctx) { return (ctx.mandates || []).map(function (m) { return typeof m === 'string' ? m : m.text; }).join('\n'); }
  function renderDefaults() {
    var d = defaults || SAMPLE.defaults, form = $('defaultsForm'); form.textContent = '';
    $('defaultsFrom').textContent = 'Values from: ' + (defaultsFrom || '2025 California Building Standards Code defaults') + '.';
    FIELDS.forEach(function (f) {
      form.appendChild(el('label', '', f[1]));
      var input = el('input'); input.value = d[f[0]] == null ? '' : d[f[0]]; input.dataset.key = f[0]; form.appendChild(input);
    });
    form.appendChild(el('label', '', 'In a fire hazard severity zone'));
    var sel = el('select'); sel.dataset.key = 'fire_hazard_severity_zone';
    [['false', 'No'], ['true', 'Yes']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; sel.appendChild(op); });
    sel.value = String(!!d.fire_hazard_severity_zone); form.appendChild(sel);
    form.appendChild(el('label', '', 'Project mandates, one per line'));
    var ta = el('textarea'); ta.rows = 4; ta.dataset.key = 'mandates'; ta.value = mandateLines(d); form.appendChild(ta);
  }
  function readDefaults() {
    var out = {};
    document.querySelectorAll('#defaultsForm [data-key]').forEach(function (i) {
      var k = i.dataset.key;
      if (k === 'mandates') out[k] = i.value.split('\n').map(function (t) { return t.trim(); }).filter(Boolean).map(function (t, n) { return { id: 'PM-' + (n + 1), text: t, applies_to: '*', severity: 'MAJOR' }; });
      else if (k === 'fire_hazard_severity_zone') out[k] = i.value === 'true';
      else out[k] = i.value.trim();
    });
    return out;
  }
  $('defaultsForm').addEventListener('change', function () { defaults = readDefaults(); defaultsFrom = 'edited on this device'; store('dc.defaults', defaults); renderDefaults(); });
  $('defUse').addEventListener('click', function () { defaults = JSON.parse(JSON.stringify(current.report.context)); defaultsFrom = 'this review\'s JSON (' + current.report.detail.title + ')'; store('dc.defaults', defaults); renderDefaults(); });
  $('defReset').addEventListener('click', function () { defaults = null; defaultsFrom = ''; drop('dc.defaults'); renderDefaults(); });
  $('defDownload').addEventListener('click', function () {
    var data = Object.assign({ _note: 'Made on the Critique Detail page. Check every code line against the adopted edition and local amendments.' }, readDefaults());
    var a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' })); a.download = 'project_context.json';
    document.body.appendChild(a); a.click(); a.remove();
  });
  $('openDefaults').addEventListener('click', function () { setOpen(false); openPanel('defaults').scrollIntoView({ block: 'start', behavior: 'smooth' }); });

  // ---------- open a working detail from disk (stays on this device)
  var pending = { report: null, image: null, file: null };
  function tryOpenLocal() {
    if (!pending.report) return;
    addEntry({ id: 'file:' + pending.report.detail.slug, source: 'file', report: pending.report, image: pending.image || '', markup: '', file: pending.file });
    show('file:' + pending.report.detail.slug);
  }
  $('openReport').addEventListener('change', function (ev) {
    var file = ev.target.files[0]; if (!file) return;
    file.text().then(function (text) {
      var r = JSON.parse(text);
      if (!r.detail || !r.findings || !r.schema) throw new Error('This file is not a Critique Detail report.');
      pending.report = r; tryOpenLocal();
    }).catch(function (e) { logError('Could not open the report: ' + e.message); alert('Could not open that report. ' + e.message); });
  });
  $('openImage').addEventListener('change', function (ev) {
    var file = ev.target.files[0]; if (!file) return;
    pending.file = file; pending.image = URL.createObjectURL(file); tryOpenLocal();
  });

  // ---------- cloud (owner sign-in; publishable key only)
  function setPill(text) { $('statusPill').textContent = text; }
  function api(method, path, body, opts) {
    opts = opts || {};
    var headers = Object.assign({ apikey: CFG.key, Authorization: 'Bearer ' + (opts.anon ? CFG.key : (session && session.token) || CFG.key) }, opts.headers || {});
    if (body && !opts.raw) headers['Content-Type'] = 'application/json';
    return fetch(CFG.url + path, { method: method, headers: headers, body: body ? (opts.raw ? body : JSON.stringify(body)) : undefined }).then(function (res) {
      return res.text().then(function (text) {
        var data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) throw new Error((data && (data.msg || data.message || data.error_description)) || ('HTTP ' + res.status));
        return data;
      });
    });
  }
  function renderDb() {
    $('signInBox').hidden = !!session; $('dbSignOut').hidden = !session;
    if (!session) $('dbStatus').textContent = 'This device only. Sign in to load details from the cloud. You stay signed in on this device.';
  }
  function startSession(d, email) {
    session = { token: d.access_token, refresh: d.refresh_token, email: email };
    store('dc.session', { refresh: d.refresh_token, email: email });       // keeps you signed in; Sign out removes it
    renderDb(); return loadFromDb();
  }
  function signIn() {
    var email = $('dbEmail').value.trim(), password = $('dbPassword').value;
    if (!email || !password) return;
    $('dbStatus').textContent = 'Signing in…';
    api('POST', '/auth/v1/token?grant_type=password', { email: email, password: password }, { anon: true }).then(function (d) {
      $('dbPassword').value = ''; return startSession(d, email);
    }).catch(function (e) { session = null; renderDb(); $('dbStatus').textContent = 'Sign-in did not work: ' + e.message; logError('Sign-in: ' + e.message); });
  }
  function resumeSession() {
    var saved = load('dc.session', null);
    if (!saved || !saved.refresh) return;
    api('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: saved.refresh }, { anon: true })
      .then(function (d) { return startSession(d, saved.email); })
      .catch(function () { $('dbStatus').textContent = 'This device only. The saved sign-in could not be renewed (offline, or it expired). Sign in again when you need the cloud.'; });
  }
  function loadFromDb() {
    return api('GET', '/rest/v1/dc_details?select=slug,image_path,source_ref,dc_reviews(id,run_at,markup_path,report)&order=created_at.desc').then(function (rows) {
      var cache = [], refs = {};
      rows.forEach(function (d) {
        if (d.source_ref) refs[d.source_ref] = true;
        var reviews = (d.dc_reviews || []).sort(function (a, b) { return a.run_at < b.run_at ? 1 : -1; });
        if (!reviews.length) return;
        var rv = reviews[0];
        addEntry({ id: 'db:' + d.slug, source: 'database', report: rv.report, image: '', markup: '', reviewId: rv.id, imagePath: d.image_path, markupPath: rv.markup_path });
        cache.push({ slug: d.slug, reviewId: rv.id, report: rv.report });
      });
      store('dc.cache', cache);
      setPill('☁️ cloud');
      $('dbStatus').textContent = 'Signed in as ' + session.email + '. ' + cache.length + ' reviewed detail(s) in the cloud.' +
        (rows.length ? '' : ' An empty list can also mean this account is not the owner (row-level security).');
      if (cache.length && current.source !== 'file') show('db:' + cache[0].slug); else renderList();
      return api('GET', '/rest/v1/sketch_details?select=id,name,tags,updated_at&deleted_at=is.null&order=updated_at.desc&limit=60').then(function (list) {
        quick = list.map(function (q) { return { name: q.name, tags: q.tags, reviewed: !!refs['sketch_details:' + q.id] }; }); renderList();
      }).catch(function (e) { logError('Quick Detail list: ' + e.message); });
    }).catch(function (e) { setPill('⚠️ check'); logError('Cloud: ' + e.message); $('dbStatus').textContent = 'Could not read the cloud: ' + e.message; });
  }
  function fetchBlob(path) {
    if (!path) return Promise.resolve('');
    return fetch(CFG.url + '/storage/v1/object/authenticated/' + CFG.bucket + '/' + path, { headers: { apikey: CFG.key, Authorization: 'Bearer ' + session.token } })
      .then(function (res) { if (!res.ok) throw new Error('image HTTP ' + res.status); return res.blob(); })
      .then(function (b) { return URL.createObjectURL(b); });
  }
  function loadImages(entry) {
    Promise.all([fetchBlob(entry.imagePath), fetchBlob(entry.markupPath)]).then(function (urls) {
      entry.image = urls[0]; entry.markup = urls[1];
      if (current === entry) renderSheet();
    }).catch(function (e) { logError('Could not load the image: ' + e.message); });
  }
  function saveToCloud() {
    var e = current, r = e.report, out = $('saveCloudOut');
    if (!session || e.source !== 'file') return;
    if (!e.file) { out.textContent = 'Open the image of this detail first, so it can be saved with the review.'; return; }
    out.textContent = 'Saving…';
    var path = r.detail.slug + '/detail.' + (e.file.name.split('.').pop() || 'png').toLowerCase();
    var up = { headers: { Prefer: 'resolution=merge-duplicates,return=representation' } };
    var s = r.schema, full = SAMPLE.schemas.filter(function (x) { return x.key === s.key; })[0] || {};
    api('POST', '/storage/v1/object/' + CFG.bucket + '/' + path, e.file, { raw: true, headers: { 'Content-Type': e.file.type || 'image/png', 'x-upsert': 'true' } }).then(function () {
      return api('POST', '/rest/v1/dc_schemas?on_conflict=key', { key: s.key, csi_division: s.csi_division, csi_section: s.csi_section || '', subcategory: s.subcategory || '',
        title: s.title, checklist: full.checklist || [], source: s.source || 'seed', status: s.status || 'active' }, up);
    }).then(function () {
      return api('POST', '/rest/v1/dc_details?on_conflict=slug', { slug: r.detail.slug, title: r.detail.title, description: r.detail.description || '', csi_division: s.csi_division,
        schema_key: s.key, source_kind: r.detail.source_kind || 'own', source_ref: r.detail.source_ref || '', image_path: path, width: r.detail.width, height: r.detail.height }, up);
    }).then(function (rows) {
      return api('POST', '/rest/v1/dc_reviews', { detail_id: rows[0].id, run_at: r.run_at, mode: r.reviewer, status: r.status || 'reviewed', summary: r.summary || '',
        counts: r.counts, markup_path: '', report: r, version: r.version || CFG.version }, { headers: { Prefer: 'return=representation' } });
    }).then(function (rows) {
      e.reviewId = rows[0].id;
      if (!r.findings.length) return null;
      return api('POST', '/rest/v1/dc_findings', r.findings.map(function (f) {
        return { review_id: e.reviewId, n: f.n, severity: f.severity, checklist_id: f.qc_id, title: f.title, issue: f.issue, recommendation: f.recommendation, basis: f.basis || '', box_2d: f.box_2d, refs: [], status: statusOf(f) };
      }), { headers: { Prefer: 'return=minimal' } });
    }).then(function () { out.textContent = 'Saved to the cloud: ' + r.detail.title + '.'; setPill('☁️ cloud'); })
      .catch(function (err) { out.textContent = 'Not saved: ' + err.message; logError('Save to cloud: ' + err.message); setPill('⚠️ check'); });
  }
  function checkDatabase() {
    var out = $('dbCheckOut');
    if (!session) { out.textContent = 'This device only. Sign in to check the tables.'; return; }
    out.textContent = 'Checking…';
    Promise.all(CFG.tables.map(function (t) {
      return api('GET', '/rest/v1/' + t + '?select=*&limit=1')
        .then(function (rows) { return '✅ ' + t + (rows.length ? '' : ' (no rows visible; empty, or row-level security)'); })
        .catch(function (e) { return '❌ ' + t + ': ' + e.message; });
    })).then(function (lines) {
      out.textContent = lines.join('\n');
      if (lines.some(function (l) { return l.charAt(0) === '❌'; })) { setPill('⚠️ check'); lines.forEach(function (l) { if (l.charAt(0) === '❌') logError(l); }); }
    });
  }
  $('dbSignIn').addEventListener('click', signIn);
  $('dbCheck').addEventListener('click', checkDatabase);
  $('saveCloud').addEventListener('click', saveToCloud);
  $('dbSignOut').addEventListener('click', function () { session = null; quick = []; drop('dc.session'); setPill('💾 this device'); renderDb(); seedEntries(); show(entries[0].id); });

  // ---------- notes for improvement (feedback_notes.md): device first, cloud when signed in
  var notes = load('dc.notes', []);
  function noteWhere() {
    var r = current.report, f = selected && r.findings.filter(function (x) { return x.n === selected; })[0];
    return { page: 'index.html', item: r.detail.slug + (f ? '#' + f.n : ''), label: r.detail.title + (f ? ', finding ' + f.n : '') };
  }
  function renderNotesWhere() { if (current) $('noteWhere').textContent = 'About: ' + noteWhere().label; }
  function renderNotes() {
    var mode = $('noteFilter').value, list = $('noteList'); list.textContent = '';
    notes.filter(function (n) { return mode === 'all' || n.status === 'open'; })
      .sort(function (a, b) { return a.at < b.at ? 1 : -1; })
      .forEach(function (n) {
        list.appendChild(el('li', '', (n.status === 'done' ? '✅ ' : '📝 ') + (n.where && n.where.label ? n.where.label + ' · ' : '') + new Date(n.at).toLocaleString() + '\n' + n.text));
      });
  }
  $('noteSave').addEventListener('click', function () {
    var box = $('noteText'), text = box.value.trim(); if (!text) return;
    var n = { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), status: 'open', text: text, where: noteWhere(), version: CFG.version };
    notes.push(n); box.value = ''; store('dc.notes', notes); renderNotes();
    if (session) {
      api('POST', '/rest/v1/dc_notes', { id: n.id, text: n.text, page: n.where.page, item: n.where.item, label: n.where.label, version: n.version, status: n.status, noted_at: n.at })
        .catch(function (e) { logError('Note kept on this device; the cloud refused it: ' + e.message); });
    }
  });
  $('noteFilter').addEventListener('change', renderNotes);
  $('noteCopy').addEventListener('click', function () {
    var out = JSON.stringify(notes, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(out).catch(function () {}); else window.prompt('Copy the notes:', out);
  });

  // ---------- settings drawer (settings_gear.md)
  var gear = $('gear'), drawer = $('drawer');
  function setOpen(open) { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); }
  function renderSettings() {
    document.querySelectorAll('.seg[data-key]').forEach(function (seg) {
      var v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    });
    $('showErrors').checked = !!settings.showErrors; renderErrors();
  }
  gear.addEventListener('click', function () { setOpen(drawer.hidden); });
  $('closeDrawer').addEventListener('click', function () { setOpen(false); });
  $('statusPill').addEventListener('click', function () { setOpen(true); });
  document.querySelectorAll('.seg[data-key] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.v;
      settings[b.parentElement.dataset.key] = (v === '0' || v === '1') ? +v : v;
      store('dc.settings', settings); renderSettings(); focusIndex = 0; extra = null; renderAll();
    });
  });
  $('showErrors').addEventListener('change', function (e) { settings.showErrors = e.target.checked; store('dc.settings', settings); renderErrors(); });
  $('sheetImg').addEventListener('load', function () { renderSheet(); });
  window.addEventListener('resize', function () { if (current) renderSheet(); });

  // ---------- start
  seedEntries();
  $('info').textContent = 'Critique Detail ' + CFG.version + ' · ' + SAMPLE.schemas.length + ' rulebooks · ' + SAMPLE.lessons.length + ' lessons';
  renderSettings(); renderDb(); renderRulebooks(); renderNotes();
  show(load('dc.last', entries[0].id));
  resumeSession();
  window.DC = { state: function () {
    return { current: current.id, selected: selected, filter: filter, entries: entries.length, quick: quick.length, signedIn: !!session,
      boxes: document.querySelectorAll('#overlay rect:not(.evidence):not(.break)').length, extra: extra && extra.kind,
      cards: document.querySelectorAll('.finding').length, thumbs: document.querySelectorAll('.good img').length,
      proofRows: document.querySelectorAll('#proofTable tr.tap').length, layers: document.querySelectorAll('.layer').length,
      verdict: $('verdictBox').hidden ? '' : $('verdictWord').textContent, notes: notes.length, errors: errors.slice(), settings: settings }; } };
})();
