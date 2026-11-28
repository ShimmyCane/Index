/* Massage Map: app. Classic script, no build. Depends on js/data.js (MM). */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var LOOP = 20;                 // seconds per film loop
  var PRESS_CYCLES = 3;          // presses per step
  var SETTINGS_KEY = 'mm.settings';
  var RATINGS_KEY = 'mm.ratings';
  var NOTES_KEY = 'mm.notes';
  var PEOPLE = ['Ying', 'Jimmy'];
  var HEAT = { 1: '#fde3d6', 2: '#f9b99b', 3: '#f08a6a', 4: '#d9533c', 5: '#a8261c' };

  var FOOT = {
    sole:  'M100,20 C130,20 150,45 150,85 C150,130 145,160 150,230 C155,300 150,370 120,395 C100,410 70,410 55,390 C40,370 45,300 48,230 C50,160 50,130 50,85 C50,45 70,20 100,20 Z',
    top:   'M100,20 C130,20 150,45 150,85 C150,130 145,160 150,230 C155,300 150,370 120,395 C100,410 70,410 55,390 C40,370 45,300 48,230 C50,160 50,130 50,85 C50,45 70,20 100,20 Z',
    side:  'M30,260 C30,200 40,160 80,150 L120,150 C160,150 175,180 170,230 C165,290 150,330 120,350 L60,350 C40,350 30,320 30,260 Z',
    ankle: 'M60,0 L140,0 L135,190 C150,210 160,240 150,270 C140,300 110,300 100,280 C90,300 60,300 50,270 C40,240 50,210 65,190 Z'
  };

  var S = {
    lang: 'en', speed: 1, autoplay: 1, heat: 1, numbers: 1, kids: 0, who: 'Ying', errors: 0,
    view: 'sole', selMarker: null, selTech: null, selTechB: null,
    compare: false, colour: true, zoomed: false, plate: false, logWho: 'Ying', logKind: 'massage',
    playing: false, t: 0, loops: 0, last: 0, tab: 'map', noteFilter: 'open'
  };

  /* ---------- helpers ---------- */

  function logError(msg) {
    var list = document.getElementById('errorList');
    var li = document.createElement('li');
    li.textContent = new Date().toLocaleTimeString() + '  ' + msg;
    list.appendChild(li);
    if (list.children.length > 30) list.removeChild(list.firstChild);
    document.getElementById('errors').hidden = !S.errors;
  }

  function ui(key) { return (MM.ui[S.lang] && MM.ui[S.lang][key]) || MM.ui.en[key] || key; }
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function techs() { return MM.techniques[S.lang]; }
  function markersFor(view) { return MM.markers[S.lang][view] || {}; }
  function techById(id) {
    var list = techs();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function techName(tech) { return S.lang === 'cn' ? (tech.cn + '  ' + tech.en) : tech.en; }
  function markerLabel(id, m) { return S.lang === 'cn' ? id : m.en; }
  function usesMarker(tech, view, id) {
    return tech.steps.some(function (s) { return s[0] === view && s[1] === id; });
  }
  function firstTechUsing(view, id) {
    var list = techs();
    for (var i = 0; i < list.length; i++) if (usesMarker(list[i], view, id)) return list[i];
    return null;
  }
  function loadJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { logError('storage read ' + key + ': ' + e.message); return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { logError('storage write ' + key + ': ' + e.message); }
  }

  /* ---------- settings ---------- */

  function loadSettings() {
    var saved = loadJSON(SETTINGS_KEY, {});
    ['lang', 'speed', 'autoplay', 'heat', 'numbers', 'kids', 'who', 'errors', 'colour', 'plate'].forEach(function (k) {
      if (saved && saved[k] != null) S[k] = saved[k];
    });
    if (S.lang !== 'en' && S.lang !== 'cn') S.lang = 'en';
    if (PEOPLE.indexOf(S.who) < 0) S.who = 'Ying';
  }
  function saveSettings() {
    saveJSON(SETTINGS_KEY, { lang: S.lang, speed: S.speed, autoplay: S.autoplay, heat: S.heat,
      numbers: S.numbers, kids: S.kids, who: S.who, errors: S.errors, colour: S.colour, plate: S.plate });
  }
  var NUMERIC = { speed: true, autoplay: true, heat: true, numbers: true, kids: true, errors: true };

  function setSetting(key, value) {
    S[key] = NUMERIC[key] ? Number(value) : value;
    if (key === 'lang') { S.selTech = null; S.selTechB = null; S.selMarker = null; S.view = 'sole'; }
    saveSettings();
    renderAll();
  }

  /* ---------- labels ---------- */

  function renderLabels() {
    document.documentElement.lang = S.lang === 'cn' ? 'zh' : 'en';
    $('tagLine').textContent = ui('tag');
    document.querySelectorAll('.langBtn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === S.lang));
    });
    document.querySelectorAll('.tab').forEach(function (b) {
      var k = b.getAttribute('data-tab');
      b.textContent = ui(k === 'map' ? 'map' : k === 'learn' ? 'learn' : k === 'anat' ? 'anat' : 'favs');
      b.setAttribute('aria-selected', String(S.tab === k));
    });
    $('pickTitle').textContent = ui('technique');
    $('colourLabel').textContent = ui('colour');
    $('compareLabel').textContent = ui('compare');
    $('heatKey').textContent = ui('heatKey');
    $('loopNote').textContent = ui('loopNote');
    $('drawerTitle').textContent = ui('settings');
    $('setLangLabel').textContent = ui('lang');
    $('setSpeedLabel').textContent = ui('speed');
    $('setAutoLabel').textContent = ui('autoplay');
    $('setHeatLabel').textContent = ui('heat');
    $('setNumLabel').textContent = ui('numbers');
    $('setKidsLabel').textContent = ui('kids');
    $('kidsNote').textContent = ui('kidsNote');
    $('setWhoLabel').textContent = ui('who');
    $('setErrLabel').textContent = ui('errors');
    $('notesTitle').textContent = ui('notes');
    $('noteSave').textContent = ui('saveNote');
    $('noteCopy').textContent = S.lang === 'cn' ? '复制意见' : 'Copy notes';
    $('noteText').placeholder = ui('noteHint');
    $('favNote').textContent = ui('rated');
    $('gearBtn').setAttribute('aria-label', ui('settings'));
    $('filmSelect').setAttribute('aria-label', ui('technique'));
    $('filmSelectB').setAttribute('aria-label', ui('technique'));
    $('dbLine').textContent = ui('db') + ': ' + ui('dbLocal');
  }

  /* ---------- tabs and pages ---------- */

  function showTab(name) {
    S.tab = name;
    ['map', 'learn', 'anat', 'favs'].forEach(function (k) { $('page-' + k).hidden = (k !== name); });
    renderLabels();
  }

  /* ---------- map ---------- */

  function renderViewTabs() {
    var box = $('viewTabs');
    box.textContent = '';
    ['sole', 'top', 'side', 'ankle'].forEach(function (v) {
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(S.view === v), 'data-view': v },
        MM.views[v][S.lang]);
      b.addEventListener('click', function () {
        S.view = v; S.selMarker = null; S.zoomed = false; renderAll();
      });
      box.appendChild(b);
    });
  }

  function renderMap() {
    var svg = $('mapSvg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var vb = '0 0 200 420';
    if (S.zoomed) {
      var c = centreFor(S.selMarker);
      vb = (c.x - 50) + ' ' + (c.y - 52) + ' 100 105';
    }
    svg.setAttribute('viewBox', vb);
    svg.appendChild(svgEl('path', { d: FOOT[S.view], fill: '#fffdf8', stroke: '#2f2a3a', 'stroke-width': 3 }));
    var markers = markersFor(S.view);
    Object.keys(markers).forEach(function (id) {
      var m = markers[id];
      var tech = S.selTech ? techById(S.selTech) : null;
      var fill = '#ffffff';
      var dim = false;
      if (tech) {
        if (usesMarker(tech, S.view, id)) fill = tech.color; else dim = true;
      } else if (S.colour) {
        var first = firstTechUsing(S.view, id);
        if (first) fill = first.color;
      }
      var g = svgEl('g', { 'class': 'marker-g' });
      var c = svgEl('circle', { cx: m.x, cy: m.y, r: S.selMarker && S.selMarker.id === id ? 11 : 8,
        fill: fill, 'class': 'marker' + (dim ? ' dim' : ''), tabindex: 0, role: 'button' });
      c.addEventListener('click', function () { S.selMarker = { view: S.view, id: id }; renderAll(); });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.dispatchEvent(new Event('click')); } });
      g.appendChild(c);
      if (S.lang === 'cn' || S.zoomed) {
        var t = svgEl('text', { x: m.x + 10, y: m.y + 3, 'class': 'markerLabel' });
        t.textContent = markerLabel(id, m);
        g.appendChild(t);
      }
      svg.appendChild(g);
    });
  }

  function centreFor(sel) {
    if (sel) {
      var m = markersFor(sel.view)[sel.id];
      if (m) return { x: m.x, y: m.y };
    }
    return { x: 100, y: 210 };
  }

  function renderInfo() {
    var box = $('infoCard');
    box.textContent = '';
    if (!S.selMarker || S.selMarker.view !== S.view) {
      box.appendChild(el('p', null, ui('none')));
      return;
    }
    var id = S.selMarker.id;
    var m = markersFor(S.view)[id];
    if (!m) return;
    var title = S.lang === 'cn' ? (m.en) : m.en;
    box.appendChild(el('strong', null, title));
    box.appendChild(el('p', { 'class': 'note' }, m.where_en));
    var users = techs().filter(function (t) { return usesMarker(t, S.view, id); });
    if (users.length) {
      var p = el('p', { 'class': 'note' }, ui('technique') + ': ');
      users.forEach(function (t, i) {
        var b = el('button', { type: 'button', 'class': 'chip' }, techName(t));
        b.addEventListener('click', function () { S.selTech = t.id; renderAll(); });
        p.appendChild(b);
        if (i < users.length - 1) p.appendChild(document.createTextNode(' '));
      });
      box.appendChild(p);
    }
  }

  function renderChips() {
    var box = $('techChips');
    box.textContent = '';
    techs().forEach(function (t) {
      var on = S.selTech === t.id;
      var b = el('button', { type: 'button', 'class': 'chip', 'aria-pressed': String(on) });
      var dot = el('span', { 'class': 'chipDot' });
      dot.style.background = t.color;
      b.appendChild(dot);
      b.appendChild(document.createTextNode(techName(t)));
      b.addEventListener('click', function () {
        S.selTech = on ? null : t.id;
        renderAll();
      });
      box.appendChild(b);
    });
  }

  function renderFilmSelects() {
    [['filmSelect', S.selTech || techs()[0].id], ['filmSelectB', S.selTechB || techs()[1].id]].forEach(function (pair) {
      var sel = $(pair[0]);
      sel.textContent = '';
      techs().forEach(function (t) {
        var o = el('option', { value: t.id }, techName(t));
        if (t.id === pair[1]) o.selected = true;
        sel.appendChild(o);
      });
    });
    $('filmBCell').hidden = !S.compare;
    $('filmGrid').className = 'filmGrid' + (S.compare ? ' two' : '');
  }

  /* ---------- film ---------- */

  function filmTech(which) {
    var id = which === 'B' ? (S.selTechB || techs()[1].id) : (S.selTech || techs()[0].id);
    return techById(id) || techs()[0];
  }

  function easeInOut(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  // Build the static parts of a film svg once; frames only change attributes.
  var film = {};
  function buildFilm(key, svgId) {
    var svg = $(svgId);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var parts = {
      plate: svgEl('image', { x: 0, y: 0, width: 330, height: 800, opacity: 0, preserveAspectRatio: 'none' }),
      outline: svgEl('path', { 'stroke-width': 3, stroke: '#2f2a3a', fill: '#fffdf8' }),
      dots: svgEl('g', {}),
      heat: svgEl('circle', { r: 0, fill: '#f08a6a', opacity: 0 }),
      arrow: svgEl('line', { stroke: '#2f2a3a', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }),
      head: svgEl('polygon', { fill: '#2f2a3a', opacity: 0 }),
      hand: svgEl('circle', { r: 9, fill: '#ffd6c2', stroke: '#2f2a3a', 'stroke-width': 3 }),
      num: svgEl('text', { 'font-size': 16, 'font-weight': 700, fill: '#2f2a3a', opacity: 0 })
    };
    svg.appendChild(parts.plate);
    svg.appendChild(parts.outline);
    svg.appendChild(parts.dots);
    svg.appendChild(parts.heat);
    svg.appendChild(parts.arrow);
    svg.appendChild(parts.head);
    svg.appendChild(parts.hand);
    svg.appendChild(parts.num);
    film[key] = { svg: svg, parts: parts, shownDots: '', mode: false };
  }

  function heatColour(p) { return HEAT[p] || HEAT[3]; }

  function setLine(line, x1, y1, x2, y2) {
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  }

  // Gray's plate 444 (plantar view, heel at the top, plate 330 x 800) under the sole view.
  // The sole view box is 200 x 420 with the toes at the top. Points map by a fixed transform.
  function plateOn(view) { return !!S.plate && !!MM.plates[view]; }
  function toView(view, x, y) { return plateOn(view) ? MM.plateMap(view, x, y) : [x, y]; }
  function sizeOf(view) { return plateOn(view) ? MM.plateScale(view) : 1; }

  function drawFilm(key, tech, t) {
    var f = film[key];
    if (!f) return;
    var p = f.parts;
    var n = tech.steps.length;
    var seg = LOOP / n;
    var k = Math.min(n - 1, Math.floor(t / seg));
    var u = (t - k * seg) / seg;
    var step = tech.steps[k];
    var view = step[0];
    var target = markersFor(view)[step[1]];
    var prev = k > 0 ? tech.steps[k - 1] : null;
    var from = target;
    if (prev && prev[0] === view) from = markersFor(prev[0])[prev[1]] || target;

    // Plate or drawn foot: switch the view box, the picture and which outline is shown.
    var on = plateOn(view), q = sizeOf(view);
    var mode = on ? view : '';
    if (f.mode !== mode) {
      f.mode = mode;
      if (on) {
        var pl = MM.plates[view];
        p.plate.setAttribute('href', pl.href);
        p.plate.setAttribute('width', pl.w);
        p.plate.setAttribute('height', pl.h);
        f.svg.setAttribute('viewBox', '0 0 ' + pl.w + ' ' + pl.h);
      } else {
        f.svg.setAttribute('viewBox', '0 0 200 420');
      }
      p.plate.setAttribute('opacity', on ? 1 : 0);
      p.outline.setAttribute('opacity', on ? 0 : 1);
      f.shownDots = '';
    }
    if (!on && p.outline.getAttribute('data-view') !== view) {
      p.outline.setAttribute('d', FOOT[view]);
      p.outline.setAttribute('data-view', view);
    }
    var dotKey = tech.id + ':' + view;
    if (f.shownDots !== dotKey) {
      p.dots.textContent = '';
      var ms = markersFor(view);
      tech.steps.forEach(function (s) {
        if (s[0] !== view) return;
        var m = ms[s[1]];
        if (!m) return;
        var c = toView(view, m.x, m.y);
        p.dots.appendChild(svgEl('circle', { cx: c[0], cy: c[1], r: 4 * q, fill: tech.color, stroke: '#2f2a3a', 'stroke-width': 1.5 * q }));
      });
      f.shownDots = dotKey;
    }

    var hx, hy, press = 0;
    if (u < 0.35) {
      var e = easeInOut(u / 0.35);
      hx = from.x + (target.x - from.x) * e;
      hy = from.y + (target.y - from.y) * e;
    } else {
      var v = (u - 0.35) / 0.65;
      var ph = (v * PRESS_CYCLES) % 1;
      press = Math.sin(Math.PI * ph);
      var d = step[3];
      hx = target.x + d[0] * 10 * press;
      hy = target.y + d[1] * 10 * press;
    }
    var pressure = step[2];
    var showPress = u >= 0.35;
    var hp = toView(view, hx, hy), tp = toView(view, target.x, target.y);

    p.hand.setAttribute('cx', hp[0]);
    p.hand.setAttribute('cy', hp[1]);
    p.hand.setAttribute('r', 9 * q);
    p.hand.setAttribute('stroke-width', 3 * q);

    if (S.heat && showPress) {
      p.heat.setAttribute('cx', tp[0]);
      p.heat.setAttribute('cy', tp[1]);
      p.heat.setAttribute('r', (8 + 14 * press) * q);
      p.heat.setAttribute('fill', heatColour(pressure));
      p.heat.setAttribute('opacity', 0.25 + 0.55 * press);
    } else {
      p.heat.setAttribute('opacity', 0);
    }

    if (showPress && press > 0.05) {
      var dd = step[3];
      var len = 10 + 22 * press;
      var ep = toView(view, target.x + dd[0] * len, target.y + dd[1] * len);
      setLine(p.arrow, tp[0], tp[1], ep[0], ep[1]);
      p.arrow.setAttribute('stroke-width', 3 * q);
      p.arrow.setAttribute('opacity', 0.9);
      var ang = Math.atan2(ep[1] - tp[1], ep[0] - tp[0]), hs = 7 * q;
      var pts = [
        [ep[0], ep[1]],
        [ep[0] - hs * Math.cos(ang - 0.45), ep[1] - hs * Math.sin(ang - 0.45)],
        [ep[0] - hs * Math.cos(ang + 0.45), ep[1] - hs * Math.sin(ang + 0.45)]
      ];
      p.head.setAttribute('points', pts.map(function (r) { return r[0].toFixed(1) + ',' + r[1].toFixed(1); }).join(' '));
      p.head.setAttribute('opacity', 0.9);
    } else {
      p.arrow.setAttribute('opacity', 0);
      p.head.setAttribute('opacity', 0);
    }

    if (S.numbers && showPress) {
      p.num.setAttribute('x', tp[0] + 14 * q);
      p.num.setAttribute('y', tp[1] - 12 * q);
      p.num.setAttribute('font-size', 16 * q);
      p.num.textContent = String(pressure);
      p.num.setAttribute('opacity', 1);
    } else {
      p.num.setAttribute('opacity', 0);
    }
  }

  function drawFilms() {
    drawFilm('A', filmTech('A'), S.t);
    if (S.compare) drawFilm('B', filmTech('B'), S.t);
    $('timeLabel').textContent = S.t.toFixed(1) + ' s';
    $('scrub').value = S.t.toFixed(2);
    $('playBtn').textContent = S.playing ? '⏸' : '▶';
    if (!S.playing && S.loops >= 2 && S.autoplay) $('loopNote').textContent = ui('pausedNote');
    else $('loopNote').textContent = ui('loopNote');
  }

  function tick(now) {
    if (S.playing) {
      var dt = S.last ? (now - S.last) / 1000 : 0;
      S.last = now;
      S.t += dt * S.speed;
      if (S.t >= LOOP) {
        S.t -= LOOP;
        S.loops += 1;
        if (S.autoplay && S.loops >= 2) { S.playing = false; S.t = 0; }
      }
      drawFilms();
    } else {
      S.last = 0;
    }
    window.requestAnimationFrame(tick);
  }

  /* ---------- learn ---------- */

  function renderLearn() {
    var box = $('learnList');
    box.textContent = '';
    techs().forEach(function (t) {
      var card = el('article', { 'class': 'card' });
      var h = el('h2');
      var dot = el('span', { 'class': 'chipDot' });
      dot.style.background = t.color;
      h.appendChild(dot);
      h.appendChild(document.createTextNode(techName(t)));
      card.appendChild(h);
      card.appendChild(el('p', null, t.how_en));
      if (S.lang === 'cn') card.appendChild(el('p', { 'class': 'note' }, 'English description for now.'));
      card.appendChild(el('p', { 'class': 'note' }, ui('howto') + ': ' + (S.lang === 'cn'
        ? 'Each film plays one point after another; the number is the press from 1 (light) to 5 (firm).'
        : 'Each film plays one step after another; the number is the press from 1 (light) to 5 (firm).')));
      var sources = el('div');
      sources.appendChild(el('strong', null, ui('sources')));
      if (t.sources && t.sources.length) {
        var ul = el('ul');
        t.sources.forEach(function (sid) {
          var s = MM.sources[sid];
          if (!s) return;
          var li = el('li');
          var a = el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label);
          li.appendChild(a);
          ul.appendChild(li);
        });
        sources.appendChild(ul);
      } else {
        sources.appendChild(el('p', { 'class': 'note' }, ui('noSources')));
      }
      card.appendChild(sources);
      box.appendChild(card);
    });
  }

  /* ---------- favourites ---------- */

  function loadRatings() { return loadJSON(RATINGS_KEY, {}) || {}; }
  function setRating(person, key, stars) {
    var r = loadRatings();
    r[person] = r[person] || {};
    r[person][key] = stars;
    saveJSON(RATINGS_KEY, r);
  }

  // Log: one row per massage or touch-up, kept on this device until family sign-in is built.
  var LOG_KEY = 'mm.log';
  var AREA_NAMES = { sole: ['Sole', 'Sole'], top: ['Top of foot', 'Top of foot'], side: ['Outer side', 'Outer side'], ankle: ['Ankle', 'Ankle'] };
  function loadLog() { var v = loadJSON(LOG_KEY, []); return Array.isArray(v) ? v : []; }
  function saveLogEntry() {
    var log = loadLog();
    var tech = filmTech('A');
    log.push({ id: 'l-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(),
      person: S.logWho, kind: S.logKind, area: S.view, technique: tech.id });
    saveJSON(LOG_KEY, log);
    renderAll();
  }
  function renderLogPanel() {
    document.querySelectorAll('.logSeg').forEach(function (seg) {
      var key = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(String(S[key]) === b.getAttribute('data-v')));
        b.onclick = function () { S[key] = b.getAttribute('data-v'); renderLogPanel(); };
      });
    });
    var where = $('logWhere');
    if (where) where.textContent = 'Area: ' + (AREA_NAMES[S.view] ? AREA_NAMES[S.view][0] : S.view) + '. Technique: ' + filmTech('A').en + '.';
    var list = $('logList');
    if (!list) return;
    list.textContent = '';
    loadLog().slice(-5).reverse().forEach(function (e) {
      var li = el('li', null, e.person + ' · ' + (e.kind === 'massage' ? 'massage' : 'touch-up') + ' · ' +
        (AREA_NAMES[e.area] ? AREA_NAMES[e.area][0] : e.area) + ' · ' + e.technique + ' · ' + e.at.slice(0, 10));
      list.appendChild(li);
    });
  }
  function renderAreaSummary() {
    var box = $('areaSummary');
    if (!box) return;
    box.textContent = '';
    var log = loadLog();
    var table = el('table', { 'class': 'fav' });
    var head = el('tr');
    ['Area', 'Ying massages', 'Ying touch-ups', 'Jimmy massages', 'Jimmy touch-ups'].forEach(function (h) { head.appendChild(el('th', null, h)); });
    table.appendChild(head);
    Object.keys(AREA_NAMES).forEach(function (view) {
      var tr = el('tr');
      tr.appendChild(el('td', null, AREA_NAMES[view][0]));
      PEOPLE.forEach(function (person) {
        ['massage', 'touch-up'].forEach(function (kind) {
          var n = log.filter(function (e) { return e.person === person && e.area === view && e.kind === kind; }).length;
          tr.appendChild(el('td', null, String(n)));
        });
      });
      table.appendChild(tr);
    });
    box.appendChild(table);
    PEOPLE.forEach(function (person) {
      var counts = {};
      log.forEach(function (e) { if (e.person === person) counts[e.area] = (counts[e.area] || 0) + 1; });
      var best = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
      box.appendChild(el('p', { 'class': 'note' }, person + ' most often: ' + (best ? AREA_NAMES[best][0] + ' (' + counts[best] + ')' : 'nothing logged yet')));
    });
  }

  // Body-part favourites: one list per region, a heart per person. Device only for now.
  var BODY_FLAGS_KEY = 'mm.flags.local';
  function setBodyFlag(person, key, liked) {
    var all = loadJSON(BODY_FLAGS_KEY, {}) || {};
    all[person] = all[person] || {};
    if (liked) all[person][key] = true; else delete all[person][key];
    saveJSON(BODY_FLAGS_KEY, all);
  }
  function renderBodyFavs() {
    var box = $('bodyFavList');
    if (!box || !window.MM_ANATOMY) return;
    box.textContent = '';
    var flags = loadJSON(BODY_FLAGS_KEY, {}) || {};
    var list = MM_ANATOMY.structures();
    var lastRegion = null, card = null;
    list.forEach(function (st) {
      if (st.region !== lastRegion) {
        lastRegion = st.region;
        card = el('article', { 'class': 'card' });
        card.appendChild(el('h2', null, S.lang === 'cn' ? st.regionCn : st.region));
        box.appendChild(card);
      }
      var row = el('div', { 'class': 'starRow' });
      row.appendChild(el('span', { 'class': 'note' }, (S.lang === 'cn' ? st.cn : st.en) + ' · ' + st.kind));
      PEOPLE.forEach(function (person) {
        var on = !!(flags[person] && flags[person][st.key]);
        var b = el('button', { type: 'button', 'class': 'star' + (on ? ' on' : ''), 'aria-pressed': String(on),
          'aria-label': person + ' ' + (on ? 'likes' : 'does not like') + ' ' + st.en }, (on ? '♥ ' : '♡ ') + person);
        b.addEventListener('click', function () { setBodyFlag(person, st.key, !on); renderBodyFavs(); });
        row.appendChild(b);
      });
      card.appendChild(row);
    });
  }

  function renderFavs() {
    var box = $('favList');
    box.textContent = '';
    var ratings = loadRatings();
    techs().forEach(function (t) {
      var key = S.lang + ':' + t.id;
      var card = el('article', { 'class': 'card' });
      var h = el('h2', null, techName(t));
      card.appendChild(h);
      PEOPLE.forEach(function (person) {
        var row = el('div', { 'class': 'starRow' });
        row.appendChild(el('span', { 'class': 'note' }, person + ': '));
        var mine = (ratings[person] && ratings[person][key]) || 0;
        for (var i = 1; i <= 5; i++) {
          var b = el('button', { type: 'button', 'class': 'star' + (i <= mine ? ' on' : ''),
            'aria-label': person + ' ' + i + ' ' + ui('stars') }, i <= mine ? '★' : '☆');
          (function (value, p) {
            b.addEventListener('click', function () {
              setRating(p, key, value === mine ? 0 : value);
              renderFavs();
            });
          })(i, person);
          row.appendChild(b);
        }
        row.appendChild(el('span', { 'class': 'note' }, mine ? mine + ' ' + ui('stars') : ''));
        card.appendChild(row);
      });
      box.appendChild(card);
    });
    var table = el('table', { 'class': 'fav' });
    var head = el('tr');
    head.appendChild(el('th', null, ui('technique')));
    PEOPLE.forEach(function (p) { head.appendChild(el('th', null, p)); });
    head.appendChild(el('th', null, ui('average')));
    table.appendChild(head);
    techs().forEach(function (t) {
      var key = S.lang + ':' + t.id;
      var tr = el('tr');
      tr.appendChild(el('td', null, techName(t)));
      var sum = 0, n = 0;
      PEOPLE.forEach(function (p) {
        var v = (ratings[p] && ratings[p][key]) || 0;
        tr.appendChild(el('td', null, v ? String(v) : '–'));
        if (v) { sum += v; n += 1; }
      });
      tr.appendChild(el('td', null, n ? (sum / n).toFixed(1) : '–'));
      table.appendChild(tr);
    });
    box.appendChild(table);
  }

  /* ---------- notes ---------- */

  function loadNotes() { var v = loadJSON(NOTES_KEY, []); return Array.isArray(v) ? v : []; }

  function renderNotes() {
    var list = $('noteList');
    list.textContent = '';
    var notes = loadNotes().filter(function (n) {
      return S.noteFilter === 'all' || n.status === 'open';
    }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    if (!notes.length) { list.appendChild(el('li', null, '—')); return; }
    notes.forEach(function (n) {
      var li = el('li');
      li.textContent = (n.where && n.where.label ? '[' + n.where.label + '] ' : '') + n.text;
      list.appendChild(li);
    });
  }

  function saveNote() {
    var text = $('noteText').value.trim();
    if (!text) return;
    var where = {
      page: 'index.html',
      item: S.view + '/' + (S.selMarker ? S.selMarker.id : (S.selTech || 'none')),
      label: (S.lang === 'cn' ? 'CN' : 'EN') + ' ' + MM.views[S.view].en + ' ' + (S.selMarker ? S.selMarker.id : (S.selTech || ''))
    };
    var id = 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    var notes = loadNotes();
    notes.push({ id: id, at: new Date().toISOString(), status: 'open', text: text, where: where, version: MM.VERSION });
    saveJSON(NOTES_KEY, notes);
    $('noteText').value = '';
    renderNotes();
  }

  function copyNotes() {
    var text = JSON.stringify(loadNotes(), null, 2);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function (e) { logError('copy: ' + e.message); });
      } else {
        logError('copy: clipboard not available');
      }
    } catch (e) { logError('copy: ' + e.message); }
  }

  /* ---------- render all ---------- */

  function renderSettingsButtons() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var key = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(String(S[key]) === b.getAttribute('data-v')));
      });
    });
    $('errors').hidden = !S.errors;
  }

  function renderAll() {
    renderLabels();
    renderViewTabs();
    renderMap();
    renderInfo();
    renderChips();
    renderFilmSelects();
    drawFilms();
    renderLearn();
    renderFavs();
    renderAreaSummary();
    renderLogPanel();
    renderBodyFavs();
    renderNotes();
    renderSettingsButtons();
    $('colourToggle').checked = !!S.colour;
    $('compareToggle').checked = !!S.compare;
    $('plateToggle').checked = !!S.plate;
    $('zoomIn').disabled = !S.selMarker;
  }

  /* ---------- wiring ---------- */

  function wire() {
    document.querySelectorAll('.langBtn').forEach(function (b) {
      b.addEventListener('click', function () { setSetting('lang', b.getAttribute('data-lang')); });
    });
    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); renderAll(); });
    });
    document.querySelectorAll('.seg').forEach(function (seg) {
      var key = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { setSetting(key, b.getAttribute('data-v')); });
      });
    });
    document.querySelectorAll('.panelHead').forEach(function (h) {
      h.addEventListener('click', function () {
        var panel = h.parentElement;
        var collapsed = panel.getAttribute('data-collapsed') === '1';
        panel.setAttribute('data-collapsed', collapsed ? '0' : '1');
        h.setAttribute('aria-expanded', String(collapsed));
      });
    });
    $('colourToggle').addEventListener('change', function (e) { S.colour = e.target.checked; saveSettings(); renderAll(); });
    $('compareToggle').addEventListener('change', function (e) { S.compare = e.target.checked; renderAll(); });
    $('plateToggle').addEventListener('change', function (e) { S.plate = e.target.checked; saveSettings(); drawFilms(); });
    $('filmSelect').addEventListener('change', function (e) { S.selTech = e.target.value; S.t = 0; S.loops = 0; renderAll(); });
    $('filmSelectB').addEventListener('change', function (e) { S.selTechB = e.target.value; S.t = 0; S.loops = 0; renderAll(); });
    $('playBtn').addEventListener('click', function () {
      if (!S.playing && S.t >= LOOP - 0.05) { S.t = 0; S.loops = 0; }
      S.playing = !S.playing;
      if (S.playing && S.loops >= 2 && S.autoplay) { S.loops = 0; }
      S.last = 0;
      drawFilms();
    });
    $('backBtn').addEventListener('click', function () { S.t = 0; S.loops = 0; drawFilms(); });
    $('scrub').addEventListener('input', function (e) { S.t = Number(e.target.value); S.playing = false; drawFilms(); });
    $('zoomIn').addEventListener('click', function () { S.zoomed = true; renderMap(); });
    $('zoomOut').addEventListener('click', function () { S.zoomed = false; renderMap(); });
    $('gearBtn').addEventListener('click', function () {
      var d = $('drawer'); d.hidden = !d.hidden;
      $('gearBtn').setAttribute('aria-expanded', String(!d.hidden));
    });
    $('drawerClose').addEventListener('click', function () {
      $('drawer').hidden = true; $('gearBtn').setAttribute('aria-expanded', 'false');
    });
    $('noteSave').addEventListener('click', saveNote);
    $('logSave').addEventListener('click', saveLogEntry);
    $('noteCopy').addEventListener('click', copyNotes);
    $('noteFilter').addEventListener('change', function (e) { S.noteFilter = e.target.value; renderNotes(); });
    window.addEventListener('error', function (e) { logError(e.message || 'error'); });
    window.addEventListener('unhandledrejection', function (e) { logError('promise: ' + (e.reason && e.reason.message || e.reason)); });
  }

  function init() {
    loadSettings();
    buildFilm('A', 'filmA');
    buildFilm('B', 'filmB');
    wire();
    S.tab = 'map';
    showTab('map');
    renderAll();
    window.requestAnimationFrame(tick);
  }

  try { init(); } catch (e) { logError('init: ' + e.message); }
})();
