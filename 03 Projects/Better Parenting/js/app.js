// Better Parenting: filters, scenario cards, practice, my own scenarios, toolkit, stages, library, settings.
// All page text is built with textContent (no innerHTML), so typed or pasted text can never run as code.
var APP_VERSION = '0.1.0';
var CHANGELOG = [
  '0.1.0 (2026-11-16): first build. 144 scenarios in 16 topics and 3 stages, 18 skills, practice with self-rating, my own scenario with an AI prompt loop, watch and read list, one-minute pause, family sign-in.'
];

var errors = [];
function logError(msg, err) {
  errors.push(new Date().toLocaleTimeString() + '  ' + msg + (err && err.message ? ': ' + err.message : ''));
  if (window.BPApp) BPApp.renderErrors();
}
window.addEventListener('error', function (e) { logError(e.message || 'Page error'); });
window.addEventListener('unhandledrejection', function (e) { logError('Unhandled', e.reason); });

(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  // h('div', {class:'x', onclick:fn}, [children or strings])
  function h(tag, attrs, kids) {
    var el = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (k === 'class') el.className = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    [].concat(kids == null ? [] : kids).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  function load(key, def) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage full or blocked */ } }
  function uid(p) { return p + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  var DEFAULTS = { myGrades: [], setSize: 3, textSize: 'm', showErrors: 0 };
  var settings = Object.assign({}, DEFAULTS, load('bp.settings', {}));
  var favs = load('bp.favs', []);
  var practice = load('bp.practice', []);   // { id, sid, rating 1..3, text, at }
  var own = load('bp.own', []);             // scenarios written here: { id, own:true, updated, deleted, ... }
  var view = { grade: load('bp.grade', 'all'), topic: '', q: '', favOnly: false, shown: 12 };
  var GRADES = ['K', '1', '2', '3', '4', '5'];
  var DAY = 86400000, DUE_DAYS = { 1: 2, 2: 7, 3: 30 };
  var sheetUndo = null;

  // ---------- data helpers ----------
  function allScenarios() { return own.filter(function (o) { return !o.deleted; }).concat(BP.scenarios); }
  function findScenario(id) { return byId(own, id) || byId(BP.scenarios, id); }
  function stagesInView() {
    if (view.grade === 'all') return null;
    if (view.grade === 'mine') return settings.myGrades.map(function (g) { return BP.gradeStage[g]; });
    return [BP.gradeStage[view.grade]];
  }
  function matches(sc) {
    var st = stagesInView();
    if (st && !sc.b.some(function (b) { return st.indexOf(b) >= 0; })) return false;
    if (view.topic && sc.topic !== view.topic) return false;
    if (view.favOnly && favs.indexOf(sc.id) < 0) return false;
    if (view.q) {
      var topic = byId(BP.topics, sc.topic);
      var hay = [sc.t, sc.s, sc.why, sc.say, sc.later, topic ? topic.name : ''].concat(sc.now).join(' ').toLowerCase();
      return view.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
    }
    return true;
  }
  function filtered() { return allScenarios().filter(matches); }
  function lastPractice(sid) {
    var best = null;
    practice.forEach(function (p) { if (p.sid === sid && (!best || p.at > best.at)) best = p; });
    return best;
  }
  function dueIn(p) { return new Date(p.at).getTime() + DUE_DAYS[p.rating] * DAY - Date.now(); }
  function stageNames(sc) {
    return sc.b.map(function (b) { var s = byId(BP.stages, b); return s ? (b === 'K' ? 'K' : s.name.replace('Grades ', 'G')) : b; });
  }
  function ytSearch(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }
  function link(text, url) { return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, text); }

  // ---------- filters ----------
  function renderChips() {
    var box = $('gradeChips'); box.textContent = '';
    var opts = [['all', 'All']];
    if (settings.myGrades.length) opts.push(['mine', '★ Mine']);
    GRADES.forEach(function (g) { opts.push([g, g === 'K' ? 'K' : 'G' + g]); });
    if (view.grade === 'mine' && !settings.myGrades.length) view.grade = 'all';
    opts.forEach(function (o) {
      box.appendChild(h('button', { class: 'chip' + (view.grade === o[0] ? ' on' : ''), type: 'button', 'aria-pressed': String(view.grade === o[0]), 'data-grade': o[0],
        onclick: function () { view.grade = o[0]; save('bp.grade', o[0]); view.shown = 12; renderAll(); } }, o[1]));
    });
  }
  function renderTopics() {
    var grid = $('topicGrid'); grid.textContent = '';
    var st = stagesInView();
    BP.topics.forEach(function (t) {
      var n = allScenarios().filter(function (sc) { return sc.topic === t.id && (!st || sc.b.some(function (b) { return st.indexOf(b) >= 0; })); }).length;
      grid.appendChild(h('button', { class: 'tile' + (view.topic === t.id ? ' on' : ''), type: 'button', 'aria-pressed': String(view.topic === t.id), 'data-topic': t.id,
        onclick: function () { view.topic = view.topic === t.id ? '' : t.id; view.shown = 12; renderAll(); } },
        [h('span', { class: 'ic' }, t.icon), t.name, h('small', null, n + ' scenarios')]));
    });
    var card = $('topicCard'); card.textContent = '';
    var topic = byId(BP.topics, view.topic);
    if (topic) card.appendChild(topicCard(topic));
  }
  function topicCard(t) {
    var st = stagesInView();
    var notes = BP.stages.filter(function (s) { return !st || st.indexOf(s.id) >= 0; }).map(function (s) {
      return h('li', null, [h('b', null, s.name + ': '), t.st[s.id]]);
    });
    return h('div', { class: 'card' }, [
      h('h3', null, t.icon + ' ' + t.name + ': the general approach'),
      h('p', null, t.why),
      h('div', { class: 'sec now' }, [h('h4', null, '✅ In the moment'), h('ol', null, t.now.map(function (x) { return h('li', null, x); }))]),
      h('div', { class: 'sec say' }, '💬 "' + t.say + '"'),
      h('div', { class: 'sec later' }, [h('h4', null, '🌙 Later'), h('p', null, t.later)]),
      h('div', { class: 'sec' }, [h('h4', null, '🌱 By stage'), h('ul', null, notes)]),
      skillTags(t.skills)
    ]);
  }
  function skillTags(ids) {
    return h('div', { class: 'tags' }, ids.map(function (id) {
      var sk = byId(BP.skills, id);
      return sk ? h('button', { class: 'tag', type: 'button', onclick: function () { openSkill(sk); } }, sk.icon + ' ' + sk.name) : null;
    }));
  }

  // ---------- list ----------
  function itemButton(sc) {
    var topic = byId(BP.topics, sc.topic) || { icon: '✍️', name: '' };
    var p = lastPractice(sc.id);
    var mark = (favs.indexOf(sc.id) >= 0 ? '⭐' : '') + (p ? ['', '🌱', '🙂', '💪'][p.rating] : '');
    return h('button', { class: 'item', type: 'button', 'data-sid': sc.id, onclick: function () { openScenario(sc); } }, [
      h('span', { class: 'ic' }, sc.own ? '✍️' : topic.icon),
      h('span', { class: 'tx' }, [sc.t, h('small', null, [].concat(stageNames(sc).map(function (n) { return h('span', { class: 'badge' }, n); }), [topic.name]))]),
      h('span', { class: 'mk' }, mark)
    ]);
  }
  function renderList() {
    var list = filtered(), box = $('scenarioList'); box.textContent = '';
    $('listCount').textContent = list.length + ' of ' + allScenarios().length + ' scenarios' + (list.length ? '' : '. Try another grade, topic or word, or write your own below.');
    list.slice(0, view.shown).forEach(function (sc) { box.appendChild(itemButton(sc)); });
    $('moreBtn').hidden = list.length <= view.shown;
  }

  // ---------- scenario card ----------
  function scenarioBody(sc, opts) {
    opts = opts || {};
    var out = [];
    if (!opts.hideSituation) out.push(h('div', { class: 'sec sit' }, [h('h4', null, '📍 The situation'), h('p', null, sc.s)]));
    if (opts.situationOnly) return out;
    out.push(h('div', { class: 'sec why' }, [h('h4', null, '🧠 What is going on'), h('p', null, sc.why)]));
    out.push(h('div', { class: 'sec now' }, [h('h4', null, '✅ In the moment'), h('ol', null, sc.now.map(function (x) { return h('li', null, x); }))]));
    out.push(h('div', { class: 'sec say' }, '💬 "' + sc.say + '"'));
    out.push(h('div', { class: 'sec avoid' }, [h('h4', null, '🚫 Instead of'), h('p', null, sc.avoid)]));
    out.push(h('div', { class: 'sec later' }, [h('h4', null, '🌙 Later, when calm'), h('p', null, sc.later)]));
    out.push(skillTags(sc.skills || []));
    // Best match first: links that share a skill with this scenario, then links for its topic.
    var lib = BP.library.map(function (l) {
      var n = l.skills.filter(function (s) { return (sc.skills || []).indexOf(s) >= 0; }).length * 2 + (l.topics.indexOf(sc.topic) >= 0 ? 1 : 0);
      return [n, l];
    }).filter(function (x) { return x[0] > 0; }).sort(function (x, y) { return y[0] - x[0]; }).slice(0, 4).map(function (x) { return x[1]; });
    out.push(h('div', { class: 'sec' }, [h('h4', null, '📺 Watch and read'), h('ul', { class: 'links' },
      lib.map(function (l) { return h('li', null, [l.k === 'v' ? '▶ ' : '📄 ', link(l.t, l.u)]); })
        .concat([h('li', null, ['🔍 ', link('Search YouTube for this situation', ytSearch(sc.t + ' child parenting advice'))])]))]));
    return out;
  }
  function openSheet(title, nodes, ctx) {
    $('sheetTitle').textContent = title;
    var body = $('sheetBody'); body.textContent = '';
    nodes.forEach(function (n) { if (n) body.appendChild(n); });
    $('sheetWrap').hidden = false;
    $('sheetWrap').querySelector('.sheet').scrollTop = 0;
    if (window.AppNotes) AppNotes.setContext(ctx || { item: '', label: '' });
  }
  function closeSheet() { $('sheetWrap').hidden = true; if (window.AppNotes) AppNotes.setContext({ item: '', label: '' }); renderList(); }
  function openScenario(sc) {
    var isFav = favs.indexOf(sc.id) >= 0;
    var nodes = [h('p', { class: 'hint' }, stageNames(sc).join(' · '))].concat(scenarioBody(sc));
    nodes.push(h('div', { class: 'row' }, [
      h('button', { class: 'btn small', type: 'button', 'aria-pressed': String(isFav), id: 'favBtn', onclick: function () {
        var i = favs.indexOf(sc.id); if (i >= 0) favs.splice(i, 1); else favs.push(sc.id);
        save('bp.favs', favs); openScenario(sc);
      } }, isFav ? '⭐ Saved' : '☆ Save'),
      h('button', { class: 'btn small go', type: 'button', id: 'practiceThis', onclick: function () { closeSheet(); startPractice([sc]); } }, '🎯 Practise this')
    ]));
    if (sc.own) nodes.push(ownTools(sc));
    openSheet(sc.t, nodes, { item: sc.id, label: sc.t });
  }
  function openSkill(sk) {
    var lib = BP.library.filter(function (l) { return l.skills.indexOf(sk.id) >= 0; });
    var uses = allScenarios().filter(function (sc) { return (sc.skills || []).indexOf(sk.id) >= 0; });
    openSheet(sk.icon + ' ' + sk.name, [
      h('p', { class: 'hint' }, 'From: ' + sk.from),
      h('div', { class: 'sec now' }, [h('h4', null, 'How'), h('ol', null, sk.how.map(function (x) { return h('li', null, x); }))]),
      h('div', { class: 'sec say' }, '💬 "' + sk.ex + '"'),
      h('div', { class: 'sec' }, [h('h4', null, '📺 Watch and read'), h('ul', { class: 'links' },
        lib.map(function (l) { return h('li', null, [l.k === 'v' ? '▶ ' : '📄 ', link(l.t, l.u)]); })
          .concat([h('li', null, ['🔍 ', link('Search YouTube for this skill', ytSearch(sk.name + ' parenting ' + sk.from.split(',')[0]))])]))]),
      h('div', { class: 'sec' }, [h('h4', null, 'Used in ' + uses.length + ' scenarios'),
        h('div', { class: 'list' }, uses.slice(0, 6).map(itemButton))])
    ], { item: 'skill-' + sk.id, label: 'Skill: ' + sk.name });
  }

  // ---------- practice ----------
  var pr = null; // { queue, i, revealed }
  function buildQueue() {
    var pool = filtered(), due = [], fresh = [], rest = [];
    pool.forEach(function (sc) {
      var p = lastPractice(sc.id);
      if (!p) fresh.push(sc); else if (dueIn(p) <= 0) due.push([dueIn(p), sc]); else rest.push([dueIn(p), sc]);
    });
    due.sort(function (a, b) { return a[0] - b[0]; }); rest.sort(function (a, b) { return a[0] - b[0]; });
    fresh.sort(function () { return Math.random() - 0.5; });
    return due.map(function (d) { return d[1]; }).concat(fresh, rest.map(function (d) { return d[1]; })).slice(0, +settings.setSize || 3);
  }
  function startPractice(queue) {
    pr = { queue: queue || buildQueue(), i: 0, revealed: false };
    var panel = document.querySelector('[data-panel=practice]');
    if (panel.dataset.collapsed === 'true') panel.querySelector('.panelHead').click();
    renderPractice();
    panel.scrollIntoView({ block: 'start' });
  }
  function renderPractice() {
    var pool = filtered(), done = 0, due = 0;
    pool.forEach(function (sc) { var p = lastPractice(sc.id); if (p) { done++; if (dueIn(p) <= 0) due++; } });
    $('practiceStats').textContent = 'Practised ' + done + ' of ' + pool.length + ' in this filter' + (due ? ' · ' + due + ' due again' : '') + '. Answer first, then compare.';
    $('practiceCount').textContent = practice.length;
    var area = $('practiceArea'); area.textContent = '';
    if (!pr) {
      area.appendChild(h('button', { class: 'btn go', type: 'button', id: 'practiceStart', disabled: !pool.length, onclick: function () { startPractice(); } },
        '▶ Give me ' + settings.setSize + (+settings.setSize === 1 ? ' scenario' : ' scenarios')));
      return;
    }
    if (pr.i >= pr.queue.length) {
      area.appendChild(h('p', { class: 'done' }, pr.queue.length ? '🌟 Done. ' + pr.queue.length + ' practised.' : 'Nothing in this filter yet.'));
      area.appendChild(h('button', { class: 'btn go', type: 'button', id: 'practiceAgain', onclick: function () { startPractice(); } }, '▶ Another set'));
      pr = null; return;
    }
    var sc = pr.queue[pr.i], topic = byId(BP.topics, sc.topic) || { icon: '✍️', name: 'My own' };
    if (window.AppNotes) AppNotes.setContext({ item: sc.id, label: 'Practice: ' + sc.t });
    var card = h('div', { class: 'card', 'data-sid': sc.id }, [
      h('p', { class: 'hint' }, (pr.i + 1) + ' of ' + pr.queue.length + ' · ' + topic.icon + ' ' + topic.name + ' · ' + stageNames(sc).join(', ')),
      h('h3', null, sc.t)
    ].concat(scenarioBody(sc, { situationOnly: true })));
    if (!pr.revealed) {
      card.appendChild(h('textarea', { id: 'practiceText', rows: '3', placeholder: 'What would you do first? What exact words would you say? (optional, stays private)' }));
      card.appendChild(h('div', { class: 'row', style: 'margin-top:10px' }, [
        h('button', { class: 'btn go', type: 'button', id: 'practiceReveal', onclick: function () { pr.text = $('practiceText').value.trim(); pr.revealed = true; renderPractice(); } }, '👀 Compare with the coach'),
        h('button', { class: 'btn small', type: 'button', onclick: function () { pr.i++; pr.revealed = false; renderPractice(); } }, 'Skip')
      ]));
    } else {
      if (pr.text) card.appendChild(h('div', { class: 'sec' }, [h('h4', null, '✍️ Your answer'), h('p', null, pr.text)]));
      scenarioBody(sc, { hideSituation: true }).forEach(function (n) { card.appendChild(n); });
      card.appendChild(h('p', { class: 'hint' }, 'How close was your answer?'));
      card.appendChild(h('div', { class: 'rate' }, [[1, '🌱 Not yet', 'back in 2 days'], [2, '🙂 Close', 'back in a week'], [3, '💪 Got it', 'back in a month']].map(function (r) {
        return h('button', { class: 'btn', type: 'button', 'data-rate': r[0], onclick: function () { rate(sc, r[0]); } }, [r[1], h('br'), h('small', null, r[2])]);
      })));
    }
    area.appendChild(card);
  }
  function rate(sc, rating) {
    var rec = { id: uid('p'), sid: sc.id, rating: rating, text: pr.text || '', at: new Date().toISOString() };
    practice.push(rec); save('bp.practice', practice);
    if (window.Family && Family.signedIn()) Family.pushPractice([rec]).catch(function (e) { logError('Practice was not sent to the family database', e); });
    pr.i++; pr.revealed = false; pr.text = '';
    renderPractice(); renderList();
    document.querySelector('[data-panel=practice]').scrollIntoView({ block: 'start' });
  }

  // ---------- my own scenario ----------
  function buildOwn(title, text, grade, topicId) {
    var t = byId(BP.topics, topicId), stage = BP.gradeStage[grade], st = byId(BP.stages, stage);
    return { id: uid('own'), own: true, schema: 'bp/1', t: title, s: text, b: [stage], grade: grade, topic: topicId,
      why: t.why + ' At this stage: ' + st.changing, now: t.now.concat(['For this age: ' + t.st[stage]]),
      say: t.say, avoid: t.avoid, later: t.later, skills: t.skills.slice(), source: 'built from the topic', updated: new Date().toISOString() };
  }
  function saveOwn(sc) {
    sc.updated = new Date().toISOString();
    if (!byId(own, sc.id)) own.unshift(sc);
    save('bp.own', own);
    if (window.Family && Family.signedIn()) Family.pushOwn([sc]).catch(function (e) { logError('Scenario was not sent to the family database', e); });
    renderAll();
  }
  function renderOwn() {
    var box = $('ownList'); box.textContent = '';
    own.filter(function (o) { return !o.deleted; }).forEach(function (sc) { box.appendChild(itemButton(sc)); });
  }
  function aiPrompt(sc) {
    var topic = byId(BP.topics, sc.topic), stage = byId(BP.stages, sc.b[0]);
    return [
      'You are a parenting coach who uses evidence-based approaches (emotion coaching, collaborative problem solving, labeled praise, calm limits, the SPACE approach for anxiety).',
      'Child: ' + stage.name + ' (' + stage.ages + '). Topic: ' + topic.name + '.',
      'Situation, in the parent\'s words:', sc.s, '',
      'Reply with ONE JSON object inside a ```json fence and nothing else. Fields:',
      '"why": one or two sentences on what is going on for a child this age (max 400 characters).',
      '"now": an array of 3 to 5 short steps for the moment.',
      '"say": one sentence the parent can say, in plain words.',
      '"avoid": what the parent should not say or do.',
      '"later": what to do afterwards, when calm (max 400 characters).',
      '"skills": optional array, chosen only from: ' + BP.skills.map(function (s) { return s.id; }).join(', ') + '.',
      'Be specific to this situation. No diagnosis. Say when to ask a pediatrician if it applies.'
    ].join('\n');
  }
  // Accept a JSON object in a fence, or the first balanced { ... } among other words.
  function parseReply(text) {
    var m = /```(?:json)?\s*([\s\S]*?)```/.exec(text), src = m ? m[1] : text;
    var a = src.indexOf('{'), depth = 0, inStr = false, esc = false, i;
    if (a < 0) throw new Error('No JSON object found. The reply starts: ' + text.slice(0, 200));
    for (i = a; i < src.length; i++) {
      var c = src[i];
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
      else if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return JSON.parse(src.slice(a, i + 1));
    }
    throw new Error('The JSON object is not closed. The reply starts: ' + text.slice(0, 200));
  }
  function validateReply(r) {
    var bad = [], str = function (k, max) {
      if (typeof r[k] !== 'string' || !r[k].trim()) bad.push('"' + k + '" must be a sentence.');
      else if (r[k].length > max) bad.push('"' + k + '" is longer than ' + max + ' characters.');
    };
    if (!r || typeof r !== 'object' || Array.isArray(r)) return ['The reply is not a JSON object.'];
    str('why', 600); str('say', 300); str('avoid', 300); str('later', 600);
    if (!Array.isArray(r.now) || r.now.length < 2 || r.now.length > 6) bad.push('"now" must be a list of 2 to 6 steps.');
    else if (r.now.some(function (x) { return typeof x !== 'string' || !x.trim() || x.length > 300; })) bad.push('Each step in "now" must be a short sentence.');
    if (r.skills != null) {
      if (!Array.isArray(r.skills)) bad.push('"skills" must be a list.');
      else r.skills.forEach(function (s) { if (!byId(BP.skills, s)) bad.push('Unknown skill "' + String(s).slice(0, 30) + '".'); });
    }
    return bad;
  }
  function ownTools(sc) {
    var out = h('p', { class: 'problems', id: 'aiProblems' });
    var paste = h('textarea', { id: 'aiReply', rows: '4', placeholder: 'Paste the AI reply here' });
    return h('div', { class: 'sec' }, [
      h('h4', null, '🤖 Sharpen with any AI chat'),
      h('p', { class: 'hint' }, 'Nothing is sent from this page. Copy the prompt, paste it into an AI chat, then paste the reply back. The prompt holds only what you typed. Source of the current plan: ' + (sc.source || 'built from the topic') + '.'),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn small', type: 'button', id: 'aiCopy', onclick: function () {
          var p = aiPrompt(sc);
          if (navigator.clipboard) navigator.clipboard.writeText(p).then(function () { out.textContent = 'Prompt copied.'; }, function () { window.prompt('Copy the prompt:', p); });
          else window.prompt('Copy the prompt:', p);
        } }, '📋 Copy AI prompt'),
        h('button', { class: 'btn small', type: 'button', id: 'ownDelete', onclick: function () {
          if (!window.confirm('Delete this scenario?')) return;
          sc.deleted = true; saveOwn(sc); closeSheet();
        } }, '🗑 Delete')
      ]),
      paste,
      h('div', { class: 'row', style: 'margin-top:8px' }, [
        h('button', { class: 'btn small go', type: 'button', id: 'aiApply', onclick: function () {
          var r, bad;
          try { r = parseReply(paste.value); } catch (e) { out.textContent = e.message; return; }
          bad = validateReply(r);
          if (bad.length) { out.textContent = bad.join(' '); return; }
          sheetUndo = { id: sc.id, prev: JSON.parse(JSON.stringify(sc)) };
          sc.why = r.why.trim(); sc.now = r.now.map(function (x) { return x.trim(); }); sc.say = r.say.trim();
          sc.avoid = r.avoid.trim(); sc.later = r.later.trim(); if (r.skills && r.skills.length) sc.skills = r.skills.slice();
          sc.source = 'pasted AI reply, ' + new Date().toLocaleString();
          saveOwn(sc); openScenario(sc);
        } }, '✅ Apply reply'),
        sheetUndo && sheetUndo.id === sc.id ? h('button', { class: 'btn small', type: 'button', id: 'aiUndo', onclick: function () {
          var prev = sheetUndo.prev; sheetUndo = null;
          Object.keys(sc).forEach(function (k) { delete sc[k]; }); Object.assign(sc, prev);
          saveOwn(sc); openScenario(sc);
        } }, '↩️ Undo') : null
      ]),
      out
    ]);
  }

  // ---------- toolkit, stages, library ----------
  function renderToolkit() {
    var grid = $('skillGrid'); grid.textContent = '';
    BP.skills.forEach(function (sk) {
      grid.appendChild(h('button', { class: 'tile', type: 'button', 'data-skill': sk.id, onclick: function () { openSkill(sk); } }, [h('span', { class: 'ic' }, sk.icon), sk.name]));
    });
  }
  function renderStages() {
    var box = $('stageCards'); box.textContent = '';
    var mine = settings.myGrades.map(function (g) { return BP.gradeStage[g]; });
    BP.stages.forEach(function (s) {
      box.appendChild(h('div', { class: 'card' }, [
        h('h3', null, [s.icon + ' ' + s.name + ' ', h('span', { class: 'badge' }, s.ages), mine.indexOf(s.id) >= 0 ? h('span', { class: 'badge mine' }, 'MINE') : null]),
        h('div', { class: 'sec why' }, [h('h4', null, 'What is changing'), h('p', null, s.changing)]),
        h('div', { class: 'sec now' }, [h('h4', null, 'What they need'), h('p', null, s.needs)]),
        h('div', { class: 'sec avoid' }, [h('h4', null, 'What is hard'), h('p', null, s.hard)]),
        h('div', { class: 'sec later' }, [h('h4', null, 'Your shift'), h('p', null, s.you)])
      ]));
    });
  }
  function renderLibrary() {
    var box = $('libraryList'); box.textContent = '';
    var items = BP.library.filter(function (l) { return !view.topic || l.topics.indexOf(view.topic) >= 0; });
    var topic = byId(BP.topics, view.topic);
    box.appendChild(h('p', { class: 'hint' }, (topic ? 'For ' + topic.name + '. ' : '') + 'Links open in a new tab. Video links were found by web search and are worth a quick look before you rely on them.'));
    [['v', '▶ Videos'], ['r', '📄 Articles, courses and guides']].forEach(function (g) {
      var list = items.filter(function (l) { return l.k === g[0]; });
      if (!list.length) return;
      box.appendChild(h('div', { class: 'sec' }, [h('h4', null, g[1]), h('ul', { class: 'links' }, list.map(function (l) { return h('li', null, link(l.t, l.u)); }))]));
    });
    box.appendChild(h('p', null, ['🔍 ', link('Search YouTube' + (topic ? ' for ' + topic.name.toLowerCase() : ' for parenting, ages 5 to 11'),
      ytSearch((topic ? topic.name : 'positive parenting') + ' elementary school child psychologist advice'))]));
  }

  // ---------- settings ----------
  function renderSettings() {
    document.body.classList.toggle('large', settings.textSize === 'l');
    document.querySelectorAll('.seg[data-key]').forEach(function (seg) {
      var v = String(settings[seg.dataset.key]);
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', String(b.dataset.v === v)); });
    });
    var mg = $('myGrades'); mg.textContent = '';
    GRADES.forEach(function (g) {
      var on = settings.myGrades.indexOf(g) >= 0;
      mg.appendChild(h('button', { type: 'button', class: on ? 'on' : '', 'aria-pressed': String(on), 'data-g': g, onclick: function () {
        var i = settings.myGrades.indexOf(g); if (i >= 0) settings.myGrades.splice(i, 1); else settings.myGrades.push(g);
        save('bp.settings', settings); renderAll();
      } }, g));
    });
    $('version').textContent = APP_VERSION;
    $('dataCounts').textContent = BP.scenarios.length + ' scenarios · ' + BP.topics.length + ' topics · ' + BP.skills.length + ' skills · ' + BP.library.length + ' links · ' + own.filter(function (o) { return !o.deleted; }).length + ' of my own';
    var cl = $('changelog'); cl.textContent = '';
    CHANGELOG.forEach(function (c) { cl.appendChild(h('li', null, c)); });
    renderErrors();
  }
  function renderErrors() {
    var box = $('errorsPanel'); if (!box) return;
    box.hidden = !+settings.showErrors;
    box.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
  }
  function setStatus(kind) {
    $('statusPill').textContent = { device: '💾 this device', family: '☁️ family', check: '⚠️ check' }[kind] || kind;
  }
  function renderAll() { renderChips(); renderTopics(); renderList(); renderPractice(); renderOwn(); renderStages(); renderLibrary(); renderSettings(); }

  // ---------- panels (collapsible; state remembered per device) ----------
  function initPanels() {
    var saved = load('bp.panels', {});
    document.querySelectorAll('.panel').forEach(function (section) {
      var id = section.dataset.panel;
      var open = id in saved ? saved[id] : section.dataset.open !== 'false';
      function apply() { section.dataset.collapsed = String(!open); section.querySelector('.panelHead').setAttribute('aria-expanded', String(open)); }
      apply();
      section.querySelector('.panelHead').addEventListener('click', function () { open = !open; apply(); saved[id] = open; save('bp.panels', saved); });
    });
  }

  // ---------- pause ----------
  var pauseTimer = null;
  function openPause() {
    var left = 60; $('pauseWrap').hidden = false; $('pauseCount').textContent = left;
    clearInterval(pauseTimer);
    pauseTimer = setInterval(function () {
      left--; var phase = (60 - left) % 10;
      $('breathWord').textContent = phase < 4 ? 'Breathe in…' : 'Breathe out, slowly…';
      $('pauseCount').textContent = left > 0 ? left : 'Ready when you are.';
      if (left <= 0) clearInterval(pauseTimer);
    }, 1000);
  }
  function closePause() { clearInterval(pauseTimer); $('pauseWrap').hidden = true; }

  // ---------- wire up ----------
  function init() {
    GRADES.forEach(function (g) { $('ownGrade').appendChild(h('option', { value: g }, g === 'K' ? 'Kindergarten' : 'Grade ' + g)); });
    BP.topics.forEach(function (t) { $('ownTopic').appendChild(h('option', { value: t.id }, t.icon + ' ' + t.name)); });
    if (settings.myGrades.length) $('ownGrade').value = settings.myGrades[0];
    initPanels();
    renderToolkit();
    renderAll();

    $('search').addEventListener('input', function () { view.q = this.value.trim(); view.shown = 12; renderList(); renderPractice(); });
    $('favOnly').addEventListener('click', function () { view.favOnly = !view.favOnly; this.setAttribute('aria-pressed', String(view.favOnly)); view.shown = 12; renderList(); renderPractice(); });
    $('moreBtn').addEventListener('click', function () { view.shown += 24; renderList(); });
    $('ownForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var sc = buildOwn($('ownTitle').value.trim(), $('ownText').value.trim(), $('ownGrade').value, $('ownTopic').value);
      saveOwn(sc); $('ownTitle').value = ''; $('ownText').value = ''; openScenario(sc);
    });
    $('sheetClose').addEventListener('click', closeSheet);
    $('sheetWrap').addEventListener('click', function (ev) { if (ev.target === this) closeSheet(); });
    $('pauseBtn').addEventListener('click', openPause);
    $('pauseClose').addEventListener('click', closePause);
    $('pauseWrap').addEventListener('click', function (ev) { if (ev.target === this) closePause(); });

    var gear = $('gear'), drawer = $('drawer');
    function setOpen(open) { drawer.hidden = !open; gear.setAttribute('aria-expanded', String(open)); }
    gear.addEventListener('click', function () { setOpen(drawer.hidden); });
    $('closeDrawer').addEventListener('click', function () { setOpen(false); });
    $('statusPill').addEventListener('click', function () { setOpen(true); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { setOpen(false); closeSheet(); closePause(); } });
    document.querySelectorAll('.seg[data-key] button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.v; settings[b.parentElement.dataset.key] = /^\d+$/.test(v) ? +v : v;
        save('bp.settings', settings); if (!pr) renderPractice(); renderSettings();
      });
    });
    $('resetPractice').addEventListener('click', function () {
      if (!window.confirm('Clear the practice record on this device?')) return;
      practice = []; save('bp.practice', practice); pr = null; renderAll();
    });
  }

  // Used by family.js (sync) and by the headless tests.
  window.BPApp = {
    version: APP_VERSION, renderErrors: renderErrors, setStatus: setStatus, renderAll: function () { renderAll(); },
    data: function () { return { own: own.slice(), practice: practice.slice() }; },
    merge: function (remoteOwn, remotePractice) {
      (remoteOwn || []).forEach(function (r) {
        var mine = byId(own, r.id);
        if (!mine) own.push(r); else if ((r.updated || '') > (mine.updated || '')) { Object.keys(mine).forEach(function (k) { delete mine[k]; }); Object.assign(mine, r); }
      });
      (remotePractice || []).forEach(function (r) { if (!byId(practice, r.id)) practice.push(r); });
      save('bp.own', own); save('bp.practice', practice); renderAll();
    },
    info: function () { return { filtered: filtered().length, total: allScenarios().length, practice: practice.length, own: own.filter(function (o) { return !o.deleted; }).length, view: view, queue: pr ? pr.queue.map(function (s) { return s.id; }) : null }; },
    parseReply: parseReply, validateReply: validateReply
  };
  init();
})();
