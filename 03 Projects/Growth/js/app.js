// Growth page: a world written like a prompt. The page edits one world object (see growth_model.js),
// recalculates its numbers as you type, and saves your edits on this device (localStorage).
(function () {
  'use strict';

  var M = window.GrowthModel;
  var EXAMPLES = window.GROWTH_WORLDS || {};
  var LIST = (window.GROWTH_WORLD_LIST || []).filter(function (e) { return EXAMPLES[e.id]; });
  var DRAFT_KEY = 'growth.draft.';
  var LAST_KEY = 'growth.last';
  var BLANK_ID = 'my_world';
  var BASE_VIEWER = '../Increment Viewer/viewer.html';
  var MAX_HASH = 60000;   // longest draft that is passed to the viewer inside a link

  var world = null, computed = null, ui = {}, saveTimer = null, saveOk = true, errors = [];

  function $(id) { return document.getElementById(id); }

  // ------------------------------------------------------------------ small helpers

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'className') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'value') el.value = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function svgEl(tag, attrs, text) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function input(value, label, onInput, inputmode) {
    var el = h('input', { type: 'text', placeholder: label, 'aria-label': label, inputmode: inputmode });
    el.value = value === null || value === undefined ? '' : String(value);
    el.addEventListener('input', function () { onInput(el.value, el); });
    return el;
  }

  function textarea(value, label, rows, onInput) {
    var el = h('textarea', { rows: String(rows), placeholder: label, 'aria-label': label });
    el.value = value || '';
    el.addEventListener('input', function () { onInput(el.value); });
    return el;
  }

  // A number field that keeps what you typed if it is not a number, and marks it.
  function numInput(getVal, label, setVal, isBad) {
    var el = input(getVal(), label, function (v, node) {
      var n = Number(v);
      setVal(v.trim() !== '' && isFinite(n) ? n : v);
      node.classList.toggle('bad', isBad());
    }, 'decimal');
    el.classList.toggle('bad', isBad());
    return el;
  }

  function button(text, cls, onClick, label) {
    return h('button', { type: 'button', className: 'btn ' + (cls || ''), text: text, onclick: onClick, 'aria-label': label });
  }

  function removeBtn(onClick) { return button('✕', 'small x', onClick, 'Remove this row'); }
  function splitList(v, sep) { return String(v).split(sep || ';').map(function (s) { return s.trim(); }).filter(Boolean); }

  function uniqueId(list, base) {
    var n = list.length + 1, id = base + '_' + n;
    while (list.some(function (x) { return x.id === id; })) { n++; id = base + '_' + n; }
    return id;
  }

  function section(num, title, say, kids) {
    return h('section', { className: 'sec' },
      [h('h2', null, [h('span', { className: 'badge', text: String(num) }), title]), h('p', { className: 'say', text: say })].concat(kids));
  }

  function cell(el, token, cls) {
    return h('div', { className: 'cell ' + (cls || '') }, [el, token ? h('span', { className: 'tag', text: 'token {' + token + '}' }) : null]);
  }

  function setMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + (text ? (ok ? 'ok' : 'err') : '');
  }

  // ------------------------------------------------------------------ errors (shown only when asked for)

  function logError(msg) {
    errors.push(new Date().toLocaleTimeString() + '  ' + msg);
    paintErrors();
  }
  function paintErrors() {
    var list = $('errorList'), count = $('errCount');
    if (!list || !count) return;
    list.textContent = errors.length ? errors.join('\n') : 'No errors.';
    count.textContent = errors.length ? String(errors.length) : '';
    count.hidden = !errors.length;
  }
  window.addEventListener('error', function (e) { logError(e.message || 'Script error'); });

  // ------------------------------------------------------------------ storage (drafts on this device)

  function store(fn) { try { return fn(); } catch (e) { return undefined; } }

  function loadDraft(id) {
    var raw = store(function () { return localStorage.getItem(DRAFT_KEY + id); });
    if (!raw) return null;
    try {
      var w = JSON.parse(raw), problems = M.validate(w);
      if (problems.length) { logError('The saved draft of ' + id + ' was ignored: ' + problems[0]); return null; }
      return w;
    } catch (e) { logError('The saved draft of ' + id + ' could not be read.'); return null; }
  }
  function saveDraft() {
    saveOk = store(function () { localStorage.setItem(DRAFT_KEY + world.id, JSON.stringify(world)); return true; }) === true;
    paintStatus();
  }
  function clearDraft(id) { store(function () { localStorage.removeItem(DRAFT_KEY + id); }); }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 400); }

  function isEdited() { return !EXAMPLES[world.id] || JSON.stringify(world) !== JSON.stringify(EXAMPLES[world.id]); }

  function paintStatus() {
    var s = $('status');
    if (!s) return;
    if (!isEdited()) s.textContent = 'This is the example, unchanged.';
    else if (saveOk) s.textContent = 'Edited. Saved on this device.';
    else s.textContent = 'Edited. This browser is blocking storage, so download the JSON to keep it.';
  }

  // ------------------------------------------------------------------ worlds

  function blankStep(n) { return { label: 'Step ' + n, narrative: '', events: [], landscape: '', state: {} }; }

  function blankWorld() {
    return {
      schema: 2, id: BLANK_ID, title: 'My world', kind: 'growth',
      seed: { prompt: '', scene: [], entities: [] },
      environment: { prompt: '', variables: [] },
      time: { unit: 'step', increments: 5, perStep: '', rules: [], notModelled: [], model: { type: 'recorded' } },
      chart: [],
      steps: [1, 2, 3, 4, 5].map(blankStep),
      outputs: { viewer: { world: BLANK_ID }, model3d: null }
    };
  }

  function validId(id) { return /^[a-z0-9_]+$/i.test(id || ''); }

  function startWorld(id) {
    var w = null;
    if (validId(id)) w = loadDraft(id) || (EXAMPLES[id] ? M.clone(EXAMPLES[id]) : null);
    world = w || loadDraft(BLANK_ID) || blankWorld();
    store(function () { localStorage.setItem(LAST_KEY, world.id); });
    try { history.replaceState(null, '', location.pathname + '?world=' + encodeURIComponent(world.id)); } catch (e) { /* file:// or blocked */ }
    fillPicker();
    saveOk = true;
    render();
  }

  function fillPicker() {
    var sel = $('worldPick');
    sel.textContent = '';
    var items = LIST.slice();
    if (!items.some(function (e) { return e.id === world.id; })) {
      items.push({ id: world.id, label: world.title + (world.id === BLANK_ID ? ' (blank world)' : ' (imported)') });
    }
    if (!items.some(function (e) { return e.id === BLANK_ID; })) items.push({ id: BLANK_ID, label: 'A blank world' });
    items.forEach(function (e) {
      var o = h('option', { value: e.id, text: e.label });
      if (e.id === world.id) o.selected = true;
      sel.appendChild(o);
    });
  }

  // ------------------------------------------------------------------ sections

  function render() {
    var doc = $('doc');
    doc.textContent = '';
    ui = { steps: [], rules: [] };
    [sec1, sec2, sec3, sec4, sec5, sec6].forEach(function (fn) { doc.appendChild(fn()); });
    refresh();
  }

  function changed(structural) {
    if (structural) render(); else refresh();
    scheduleSave();
    paintStatus();
  }

  // 1. what we start with
  function sec1() {
    var kids = [];
    kids.push(h('h3', { text: 'Name of this world' }));
    kids.push(input(world.title, 'Name', function (v) { world.title = v; changed(); }));

    kids.push(h('h3', { text: 'What kind of change is it?' }));
    var kinds = h('div', { className: 'kinds', role: 'radiogroup', 'aria-label': 'Kind of change' });
    M.KINDS.forEach(function (k) {
      var id = 'kind_' + k;
      var r = h('input', { type: 'radio', name: 'kind', id: id, value: k });
      r.checked = world.kind === k;
      r.addEventListener('change', function () { world.kind = k; changed(); });
      kinds.appendChild(r);
      kinds.appendChild(h('label', { for: id, text: k.charAt(0).toUpperCase() + k.slice(1) }));
    });
    kids.push(kinds);
    kids.push(h('p', { className: 'help', text: 'Growth is more of something. Decay is less of it, or worse. Collaboration is things that affect each other.' }));

    kids.push(h('h3', { text: 'The starting object or place' }));
    kids.push(textarea(world.seed.prompt, 'Describe what we start with…', 4, function (v) { world.seed.prompt = v; changed(); }));

    kids.push(h('h3', { text: 'Things in it, with their starting amounts' }));
    world.seed.entities.forEach(function (e, i) {
      var nm = input(e.name, 'Name', function (v) { e.name = v; changed(); });
      var st = numInput(function () { return e.start; }, 'Start', function (v) { e.start = v; changed(); }, function () { return !isFinite(Number(e.start)) || String(e.start).trim() === ''; });
      var un = input(e.unit, 'Unit', function (v) { e.unit = v; changed(); });
      var nt = input(e.note, 'Note', function (v) { e.note = v; changed(); });
      kids.push(h('div', { className: 'row r5' }, [cell(nm, e.id, 'wide'), st, un, cell(nt, null, 'wide'), removeBtn(function () { world.seed.entities.splice(i, 1); changed(true); })]));
    });
    kids.push(button('+ Add a thing', 'alt small', function () {
      world.seed.entities.push({ id: uniqueId(world.seed.entities, 'thing'), name: '', start: 0, unit: '', note: '' });
      changed(true);
    }));

    kids.push(h('h3', { text: 'Scenery (not counted)' }));
    kids.push(input((world.seed.scene || []).join('; '), 'River; bushes; grass', function (v) { world.seed.scene = splitList(v); changed(); }));
    return section(1, 'Start with', 'Here is the object or place we begin with.', kids);
  }

  function refVar(id) {
    var ex = EXAMPLES[world.id];
    if (!ex) return null;
    var list = ex.environment.variables;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function numericVar(v) { var r = refVar(v.id); return typeof v.value === 'number' || (r && typeof r.value === 'number'); }

  // 2. the environment
  function sec2() {
    var kids = [];
    kids.push(textarea(world.environment.prompt, 'Describe the place and its conditions…', 3, function (v) { world.environment.prompt = v; changed(); }));
    kids.push(h('h3', { text: 'Environmental variables' }));
    kids.push(h('p', { className: 'help', text: 'Each variable has a token, like {hawk_start}. Use tokens in the rules and in the story. Changing a number here changes the story\'s numbers.' }));
    var varBox = h('details', { className: 'fold', open: true }, [h('summary', { text: world.environment.variables.length + ' variables (tap to fold)' })]);
    kids.push(varBox);
    world.environment.variables.forEach(function (v, i) {
      var nm = input(v.name, 'Name', function (x) { v.name = x; changed(); });
      var val = numericVar(v)
        ? numInput(function () { return v.value; }, 'Value', function (x) { v.value = x; changed(); }, function () { return typeof v.value !== 'number'; })
        : input(v.value, 'Value', function (x) { v.value = x; changed(); });
      var un = input(v.unit, 'Unit', function (x) { v.unit = x; changed(); });
      var nt = input(v.note, 'What it does', function (x) { v.note = x; changed(); });
      varBox.appendChild(h('div', { className: 'row r5' }, [cell(nm, v.id, 'wide'), val, un, cell(nt, null, 'wide'), removeBtn(function () { world.environment.variables.splice(i, 1); changed(true); })]));
    });
    varBox.appendChild(button('+ Add a variable', 'alt small', function () {
      world.environment.variables.push({ id: uniqueId(world.environment.variables, 'variable'), name: '', value: 0, unit: '', note: '' });
      changed(true);
    }));
    return section(2, 'The place and its rules', 'Here are the environmental variables.', kids);
  }

  // 3. how time works
  function sec3() {
    var kids = [];
    var unit = input(world.time.unit, 'season, day, year…', function (v) { world.time.unit = v; changed(); });
    var inc = h('input', { type: 'number', min: '1', max: '60', 'aria-label': 'Number of increments' });
    inc.value = String(world.time.increments);
    if (world.time.model.type === 'recorded') inc.readOnly = true;
    inc.addEventListener('change', function () { setIncrements(parseInt(inc.value, 10)); });
    kids.push(h('div', { className: 'row r4' }, [
      h('div', { className: 'cell wide' }, [h('span', { className: 'tag', text: 'One increment is a' }), unit]),
      h('div', { className: 'cell' }, [h('span', { className: 'tag', text: 'Increments' }), inc]),
      h('span'), h('span')
    ]));
    kids.push(textarea(world.time.perStep, 'What one increment means, in a sentence…', 2, function (v) { world.time.perStep = v; changed(); }));

    var cal = world.time.calendar;
    if (cal && cal.seasons) {
      kids.push(h('h3', { text: 'The calendar' }));
      kids.push(h('p', { className: 'help', text: 'Each season scales breeding and plant growth. 1 is the best time, 0 is none.' }));
      cal.seasons.forEach(function (s) {
        var nm = input(s.name, 'Season', function (v) { s.name = v; changed(); });
        var br = numInput(function () { return s.breed; }, 'Breeding', function (v) { s.breed = v; changed(); }, function () { return typeof s.breed !== 'number'; });
        var gr = numInput(function () { return s.grow; }, 'Plant growth', function (v) { s.grow = v; changed(); }, function () { return typeof s.grow !== 'number'; });
        kids.push(h('div', { className: 'row r4' }, [cell(nm, null, 'wide'), br, gr, h('span')]));
      });
    }

    kids.push(h('h3', { text: 'Rules, in plain words' }));
    kids.push(h('p', { className: 'help', text: 'Write {variable} tokens in a rule and it shows the current number.' }));
    world.time.rules.forEach(function (r, i) {
      var inp = input(r, 'A rule', function (v) { world.time.rules[i] = v; changed(); });
      var prev = h('p', { className: 'reads' });
      ui.rules.push({ index: i, preview: prev });
      kids.push(h('div', { className: 'cell' }, [h('div', { className: 'row r2' }, [inp, removeBtn(function () { world.time.rules.splice(i, 1); changed(true); })]), prev]));
    });
    kids.push(button('+ Add a rule', 'alt small', function () { world.time.rules.push(''); changed(true); }));

    kids.push(h('h3', { text: 'Not modelled yet' }));
    (world.time.notModelled || []).forEach(function (r, i) {
      kids.push(h('div', { className: 'row r2' }, [
        input(r, 'Something the numbers leave out', function (v) { world.time.notModelled[i] = v; changed(); }),
        removeBtn(function () { world.time.notModelled.splice(i, 1); changed(true); })
      ]));
    });
    kids.push(button('+ Add a limit', 'alt small', function () { (world.time.notModelled = world.time.notModelled || []).push(''); changed(true); }));

    var modelText = world.time.model.type === 'ecosystem'
      ? 'Time model: ecosystem. The numbers are computed from the variables and the calendar, so the same settings always give the same story.'
      : 'Time model: recorded. The numbers come from a run and are shown as they were recorded.';
    kids.push(h('p', { className: 'help', text: modelText + ' If you change a number a lot, the story\'s words may need a rewrite: use section 5.' }));
    return section(3, 'How time works', 'Here is how time moves, and what a step means.', kids);
  }

  function setIncrements(n) {
    if (!(n >= 1 && n <= 60)) { logError('Increments should be from 1 to 60.'); render(); return; }
    while (world.steps.length < n) world.steps.push(blankStep(world.steps.length + 1));
    world.steps.length = n;
    world.time.increments = n;
    changed(true);
  }

  // 4. what happens
  function sec4() {
    ui.chart = h('div', { className: 'chartbox' });
    ui.legend = h('div', { className: 'legend' });
    ui.read = h('div', { className: 'reads read' });
    ui.tokens = h('p', { className: 'help' });
    var kids = [ui.chart, ui.legend, ui.read, ui.tokens];
    world.steps.forEach(function (step, i) {
      var head = h('div', { className: 'stephead' });
      var label = input(step.label, 'Short name for this step', function (v) { step.label = v; changed(); });
      var narr = textarea(step.narrative, 'What happens in this step…', 4, function (v) { step.narrative = v; changed(); });
      var story = h('p', { className: 'story' });
      var nums = h('div', { className: 'nums' });
      var land = textarea(step.landscape || '', 'How the place looks at this point…', 2, function (v) { step.landscape = v; changed(); });
      var landRead = h('p', { className: 'story land' });
      var events = input((step.events || []).join('; '), 'Events, separated by semicolons', function (v) { step.events = splitList(v); changed(); });
      var edit = h('details', { className: 'fold' }, [h('summary', { text: 'Edit this step' }), label, narr, land, events]);
      kids.push(h('article', { className: 'stepcard' }, [head, story, landRead, nums, edit]));
      ui.steps.push({ head: head, read: story, nums: nums, landRead: landRead });
    });
    return section(4, 'What happens', 'Here are the steps that happen to it, written by the AI or by hand.', kids);
  }

  // 5. ask the AI
  function sec5() {
    ui.prompt = h('textarea', { className: 'mono', rows: '9', readonly: true, 'aria-label': 'Prompt for the AI' });
    ui.copyMsg = h('p', { className: 'msg' });
    ui.reply = h('textarea', { className: 'mono', rows: '5', placeholder: 'Paste the AI\'s reply here…', 'aria-label': 'The AI\'s reply' });
    ui.replyMsg = h('p', { className: 'msg' });
    var kids = [
      h('p', { className: 'help', text: 'Copy this prompt into Claude. It asks questions if the rules disagree, then writes the steps. Paste the reply below and use it.' }),
      ui.prompt,
      button('Copy the prompt', 'small', function () { copyText(ui.prompt.value, ui.copyMsg); }),
      ui.copyMsg,
      ui.reply,
      button('Use these steps', 'alt small', useReply),
      ui.replyMsg
    ];
    return section(5, 'Ask the AI', 'Now ask the AI to write or revise the steps.', kids);
  }

  function useReply() {
    try {
      var next = M.applySteps(world, M.parseReply(ui.reply.value));
      var problems = M.validate(next);
      if (problems.length) throw new Error(problems[0]);
      var count = next.steps.length;
      world = next;
      changed(true);
      setMsg(ui.replyMsg, 'Now using ' + count + ' steps from the reply.', true);
    } catch (e) {
      setMsg(ui.replyMsg, e.message, false);
    }
  }

  // 6. then
  function sec6() {
    ui.outs = h('div', { className: 'outs' });
    return section(6, 'Then', 'Then look at it, keep it, and later run it.', [ui.outs]);
  }

  // ------------------------------------------------------------------ painting

  function refresh() {
    try { computed = M.compute(world); } catch (e) { logError('Could not work out the numbers: ' + e.message); return; }
    paintChart(); paintRead(); paintSteps(); paintRules(); paintPrompt(); paintOutputs(); paintStatus();
  }

  function paintChart() {
    var data = M.chartData(world, computed);
    ui.chart.textContent = '';
    ui.legend.textContent = '';
    if (!data.series.length) {
      ui.chart.appendChild(h('p', { className: 'help', text: 'This world has no numbers to chart yet.' }));
      return;
    }
    var W = 640, H = 280, L = 48, R = 16, T = 14, B = 52, n = data.labels.length - 1;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', style: 'color: var(--ink)',
      'aria-label': 'Line chart of ' + data.series.map(function (s) { return s.name; }).join(', ') + ' over ' + n + ' steps' });
    function X(i) { return L + (n ? i * (W - L - R) / n : 0); }
    function Y(f) { return T + (1 - f) * (H - T - B); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
      svg.appendChild(svgEl('line', { x1: L, x2: W - R, y1: Y(f), y2: Y(f), stroke: 'currentColor', 'stroke-opacity': f === 0 ? '0.9' : '0.18', 'stroke-width': f === 0 ? '2' : '1' }));
      if (f === 0 || f === 0.5 || f === 1) svg.appendChild(svgEl('text', { x: L - 6, y: Y(f) + 4, 'text-anchor': 'end', 'font-size': '12', fill: 'currentColor' }, Math.round(f * 100) + '%'));
    });
    data.labels.forEach(function (lab, i) {
      svg.appendChild(svgEl('text', { x: X(i), y: H - 30, 'text-anchor': 'middle', 'font-size': '13', fill: 'currentColor' }, String(lab)));
      var season = computed.states[i].season;
      if (season) svg.appendChild(svgEl('text', { x: X(i), y: H - 14, 'text-anchor': 'middle', 'font-size': '11', fill: 'currentColor', 'fill-opacity': '0.7' }, String(season).slice(0, 2)));
    });
    svg.appendChild(svgEl('text', { x: (L + W - R) / 2, y: H - 1, 'text-anchor': 'middle', 'font-size': '11', fill: 'currentColor', 'fill-opacity': '0.7' }, 'step (' + (world.time.unit || 'time') + ')'));
    data.series.forEach(function (s) {
      var pts = s.values.map(function (v, i) { return X(i) + ',' + Y(s.max ? v / s.max : 0); }).join(' ');
      svg.appendChild(svgEl('polyline', { points: pts, fill: 'none', stroke: s.color, 'stroke-width': '3.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      s.values.forEach(function (v, i) {
        svg.appendChild(svgEl('circle', { cx: X(i), cy: Y(s.max ? v / s.max : 0), r: '4.5', fill: s.color, stroke: 'currentColor', 'stroke-width': '1.5' }));
      });
    });
    ui.chart.appendChild(svg);
    data.series.forEach(function (s) {
      ui.legend.appendChild(h('span', { style: '--c:' + s.color, text: s.name + ' (top of the line = ' + s.max + ')' }));
    });
  }

  function paintRead() {
    ui.read.textContent = '';
    ui.read.appendChild(h('p', { className: 'help', text: 'How to read this: each line is scaled to its own highest point, so the chart shows when things rise and fall, not how many. The real counts are under each step.' }));
    var lines = M.describeSeries(world, computed);
    if (lines.length) {
      var ul = h('ul');
      lines.forEach(function (l) { ul.appendChild(h('li', { text: l })); });
      ui.read.appendChild(ul);
    }
    var keys = Object.keys(computed.states[1] || {}).filter(function (k) { return k !== 'step'; });
    ui.tokens.textContent = keys.length ? 'Numbers you can use in the story: ' + keys.map(function (k) { return '{' + k + '}'; }).join(' ') : '';
  }

  function paintSteps() {
    var keys = world.chart || [];
    ui.steps.forEach(function (card, i) {
      var step = world.steps[i], st = computed.states[i + 1];
      card.head.textContent = '';
      card.head.appendChild(document.createTextNode('Step ' + (i + 1)));
      card.head.appendChild(h('small', { text: '· ' + st.time }));
      if (!step.narrative || !step.narrative.trim()) card.head.appendChild(h('span', { className: 'needs', text: 'needs writing' }));
      var hasText = step.narrative && step.narrative.trim();
      card.read.textContent = hasText ? M.resolveText(step.narrative, st) : 'Nothing written yet. Open "Edit this step" or ask the AI in section 5.';
      card.read.classList.toggle('empty', !hasText);
      card.landRead.textContent = step.landscape ? M.resolveText(step.landscape, st) : '';
      card.nums.textContent = '';
      keys.forEach(function (c) { card.nums.appendChild(h('span', { text: c.name + ': ' + st[c.key] })); });
    });
  }

  function paintRules() {
    ui.rules.forEach(function (r) {
      var raw = world.time.rules[r.index] || '';
      var text = M.ruleText(world, raw);
      r.preview.textContent = text !== raw ? 'Reads as: ' + text : '';
    });
  }

  function paintPrompt() {
    try { ui.prompt.value = M.buildPrompt(world); } catch (e) { logError('Could not build the prompt: ' + e.message); }
  }

  function draftHash() {
    try { return '#draft=' + btoa(unescape(encodeURIComponent(JSON.stringify(world)))); } catch (e) { return ''; }
  }

  function paintOutputs() {
    var outs = ui.outs;
    outs.textContent = '';
    var viewer = world.outputs && world.outputs.viewer;
    var href = null, title = 'Increment Viewer', note;
    if (viewer && viewer.set) {
      href = BASE_VIEWER + '?set=' + encodeURIComponent(viewer.set);
      note = 'Shows the saved frames for this world.';
    } else if (EXAMPLES[world.id] && !isEdited()) {
      href = BASE_VIEWER + '?world=' + encodeURIComponent(world.id);
      note = 'Opens the saved world. Add &step=3 to the link to jump to one step.';
    } else {
      var hash = draftHash();
      if (hash && hash.length < MAX_HASH) {
        href = BASE_VIEWER + '?world=' + encodeURIComponent(world.id) + hash;
        title = 'Increment Viewer (draft)';
        note = 'Opens your current edits in the viewer. Nothing is saved to the repo.';
      } else note = 'This draft is too long for a link. Download the JSON instead.';
    }
    outs.appendChild(h('div', { className: 'out' }, [
      h('strong', { text: title }),
      h('p', { text: note }),
      href ? h('a', { className: 'btn', href: href, text: 'Open ▶' }) : h('button', { className: 'btn', type: 'button', disabled: true, text: 'Open ▶' })
    ]));

    var copyMsg = h('p', { className: 'msg' });
    outs.appendChild(h('div', { className: 'out' }, [
      h('strong', { text: 'Keep it' }),
      h('p', { text: 'Download the world as one JSON file, or copy it.' }),
      button('Download JSON ⬇', 'alt', function () { download(world.id + '.json', JSON.stringify(world, null, 2)); }),
      button('Copy JSON', 'alt small', function () { copyText(JSON.stringify(world, null, 2), copyMsg); }),
      copyMsg
    ]));

    outs.appendChild(h('div', { className: 'out' }, [
      h('strong', { text: 'Save to the cloud' }),
      h('p', { text: 'The tables are drafted in supabase/001_grw_worlds.sql. They are not created yet.' }),
      h('button', { className: 'btn', type: 'button', disabled: true, text: 'Save ☁' })
    ]));

    var m3 = world.outputs && world.outputs.model3d;
    outs.appendChild(h('div', { className: 'out' }, [
      h('strong', { text: '3-D run' }),
      h('p', { text: m3 ? 'This world already has a 3-D page.' : 'Not built yet for this world. It is on the to-do list.' }),
      m3 ? h('a', { className: 'btn', href: m3.href, text: (m3.label || 'Open 3-D') + ' ▶' }) : h('button', { className: 'btn', type: 'button', disabled: true, text: 'Run in 3-D' })
    ]));

    outs.appendChild(h('div', { className: 'out' }, [
      h('strong', { text: 'Animate' }),
      h('p', { text: 'Later. Playing the steps as moving scenes is on the to-do list.' }),
      h('button', { className: 'btn', type: 'button', disabled: true, text: 'Animate' })
    ]));
  }

  // ------------------------------------------------------------------ copy and download

  function copyText(text, msgEl) {
    function ok() { setMsg(msgEl, 'Copied.', true); }
    function fallback() {
      var ta = h('textarea', { 'aria-hidden': 'true' });
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      ta.remove();
      if (done) ok(); else setMsg(msgEl, 'Could not copy. Select the text and copy it by hand.', false);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  }

  function download(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // ------------------------------------------------------------------ settings drawer

  function bindDrawer() {
    var gear = $('gear'), drawer = $('drawer');
    function toggle(open) {
      drawer.hidden = !open;
      gear.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    gear.addEventListener('click', function () { toggle(drawer.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });

    $('showErrors').addEventListener('change', function (e) { $('errors').hidden = !e.target.checked; });

    var reset = $('resetWorld'), resetTimer = null;
    reset.addEventListener('click', function () {
      if (!reset.dataset.armed) {
        reset.dataset.armed = '1';
        reset.textContent = 'Tap again to reset';
        resetTimer = setTimeout(function () { delete reset.dataset.armed; reset.textContent = 'Reset to the example'; }, 3000);
        return;
      }
      clearTimeout(resetTimer);
      delete reset.dataset.armed;
      reset.textContent = 'Reset to the example';
      clearDraft(world.id);
      if (EXAMPLES[world.id]) startWorld(world.id); else { world = blankWorld(); fillPicker(); render(); }
    });

    $('importWorld').addEventListener('click', function () {
      var msg = $('importMsg');
      try {
        var w = JSON.parse($('importText').value);
        var problems = M.validate(w);
        if (problems.length) throw new Error(problems[0]);
        world = w;
        saveDraft();
        fillPicker();
        render();
        setMsg(msg, 'Now using "' + w.title + '".', true);
      } catch (e) {
        setMsg(msg, e instanceof SyntaxError ? 'That is not valid JSON.' : e.message, false);
      }
    });
  }

  // ------------------------------------------------------------------ start

  function init() {
    paintErrors();
    bindDrawer();
    $('worldPick').addEventListener('change', function (e) { startWorld(e.target.value); });
    var wanted = null;
    try { wanted = new URLSearchParams(location.search).get('world'); } catch (e) { wanted = null; }
    if (!validId(wanted)) wanted = store(function () { return localStorage.getItem(LAST_KEY); });
    if (!validId(wanted) || (!EXAMPLES[wanted] && !loadDraft(wanted))) wanted = LIST.length ? LIST[0].id : BLANK_ID;
    startWorld(wanted);
  }

  init();
})();
