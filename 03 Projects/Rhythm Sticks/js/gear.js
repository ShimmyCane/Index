// The hidden gear and its settings drawer.
// The gear is invisible until a circle is drawn in the lower-right corner. It fades after 2 seconds
// unless "Keep visible" is on. Panels collapse (project_track.md); settings use segmented buttons (settings_gear.md).
(function () {
  'use strict';
  var gear, drawer, hideTimer = 0, panelsKey = 'rs.panels';
  function $(id) { return document.getElementById(id); }

  var G = RS.gear = {
    show: function () {
      gear.classList.add('show');
      clearTimeout(hideTimer);
      if (!RS.settings.keepGear) hideTimer = setTimeout(function () { gear.classList.remove('show'); }, 2000);
    },
    open: function () {
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawerOpen');
      clearTimeout(hideTimer);
    },
    close: function () {
      drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawerOpen');
      G.show();
    },
  };

  function syncControls() {
    document.querySelectorAll('[data-key]').forEach(function (el) {
      var v = RS.settings[el.dataset.key];
      if (el.classList.contains('seg')) {
        el.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === String(v)); });
      } else if (el.tagName === 'SELECT') { el.value = String(v); }
      else if (el.type === 'checkbox') { el.checked = !!v; }
      else if (el.type === 'range') { el.value = v; }
    });
  }
  function syncModeRows(id) {
    document.querySelectorAll('[data-modes]').forEach(function (el) {
      var on = el.dataset.modes.split(' ').indexOf(id) >= 0;
      if (el.classList.contains('panel')) el.dataset.hidemode = String(!on); else el.hidden = !on;
    });
    document.querySelectorAll('#modeSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === id); });
  }

  function buildModeSeg() {
    var box = $('modeSeg');
    RS.order.forEach(function (id) {
      var m = RS.modes[id], b = document.createElement('button');
      b.type = 'button'; b.dataset.mode = id; b.textContent = m.icon + ' ' + m.name;
      b.addEventListener('click', function () { RS.setMode(id); });
      box.appendChild(b);
    });
  }

  function bindControls() {
    document.querySelectorAll('.seg[data-key]').forEach(function (seg) {
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { RS.set(seg.dataset.key, b.dataset.v); syncControls(); });
      });
    });
    document.querySelectorAll('input[type=checkbox][data-key]').forEach(function (el) {
      el.addEventListener('change', function () { RS.set(el.dataset.key, el.checked); });
    });
    document.querySelectorAll('select[data-key]').forEach(function (el) {
      el.addEventListener('change', function () { RS.set(el.dataset.key, el.value); });
    });
    document.querySelectorAll('input[type=range][data-key]').forEach(function (el) {
      el.addEventListener('input', function () { RS.set(el.dataset.key, parseFloat(el.value)); });
    });
  }

  function bindPanels() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(panelsKey) || '{}'); } catch (e) { /* storage blocked */ }
    document.querySelectorAll('.panel').forEach(function (section) {
      var id = section.dataset.panel, head = section.querySelector('.panelHead');
      var apply = function (open) { section.dataset.collapsed = String(!open); head.setAttribute('aria-expanded', String(open)); };
      apply(id in saved ? saved[id] : section.dataset.open !== 'false');
      head.addEventListener('click', function () {
        var open = section.dataset.collapsed === 'true';
        apply(open); saved[id] = open;
        try { localStorage.setItem(panelsKey, JSON.stringify(saved)); } catch (e) { /* storage blocked */ }
      });
    });
  }

  var errTimer = 0;
  function renderErrors() {
    ['errList', 'errList2'].forEach(function (id) {
      var ol = $(id);
      ol.textContent = '';
      RS.errors.forEach(function (e) {
        var li = document.createElement('li');
        li.textContent = e.at.slice(11, 19) + '  ' + e.msg;
        ol.appendChild(li);
      });
    });
  }
  // The bar shows for 5 seconds when an error arrives (or when you switch it on), then fades. Tap it to keep it.
  function flashErrors() {
    if (!RS.settings.showErrors) return;
    document.body.classList.add('errOn');
    clearTimeout(errTimer);
    errTimer = setTimeout(function () { document.body.classList.remove('errOn'); }, 5000);
  }

  // ---- The card that says what a mode does ----
  var infoTimer = 0;
  RS.info = {
    show: function (id) {
      var m = RS.modeInfo && RS.modeInfo[id || RS.curId];
      if (!m) return;
      $('infoTitle').textContent = m.title; $('infoText').textContent = m.text;
      $('infoCard').classList.add('show');
      clearTimeout(infoTimer);
      infoTimer = setTimeout(RS.info.hide, 14000);
    },
    hide: function () { clearTimeout(infoTimer); $('infoCard').classList.remove('show'); },
    toggle: function () { if ($('infoCard').classList.contains('show')) RS.info.hide(); else RS.info.show(); },
  };

  document.addEventListener('DOMContentLoaded', function () {
    gear = $('gear'); drawer = $('drawer');
    buildModeSeg(); bindControls(); bindPanels(); syncControls();
    gear.addEventListener('click', G.open);
    $('drawerClose').addEventListener('click', G.close);
    RS.onMode(function (id) {
      syncModeRows(id);
      var mi = RS.modeInfo && RS.modeInfo[id];
      $('modeHint').textContent = mi ? mi.text : '';
      RS.info.hide();
      if (window.AppNotes) AppNotes.setContext({ item: id, label: RS.modes[id].name });
    });
    $('homeLink').addEventListener('click', function (e) {          // a fresh page means a new random mode
      e.preventDefault();
      try { history.replaceState(null, '', location.pathname); } catch (err) { /* ignore */ }
      location.reload();
    });
    function micStatus() {
      var st = RS.mic.state, text = { on: 'The microphone is on. It is only listened to, never saved or sent.', starting: 'Waiting for the browser to answer…',
        off: 'The microphone is off until a microphone mode starts.', denied: 'The browser said no. Allow the microphone for this site in the browser settings, then tap the button.',
        unsupported: 'This page cannot use the microphone here (it needs https).' }[st] || st;
      $('micStatus').textContent = text;
    }
    $('micAgain').addEventListener('click', function () { RS.mic.again().then(micStatus); micStatus(); });
    gear.addEventListener('click', micStatus);
    $('openBreathe').addEventListener('click', function () { RS.setMode('breathe'); G.close(); });
    $('leaveBreathe').addEventListener('click', function () {
      try { history.replaceState(null, '', location.pathname); } catch (err) { /* ignore */ }
      location.reload();
    });
    $('clearDots').addEventListener('click', function () { RS.modes.dotloop.clear(); });
    function seedShow() { $('seedNow').textContent = 'now ' + RS.seed; $('seedInput').value = RS.seed; }
    RS.onSeed(seedShow); seedShow();
    $('seedUse').addEventListener('click', function () { var n = parseInt($('seedInput').value, 10); if (isFinite(n) && n >= 0) RS.setSeed(n); });
    $('seedNew').addEventListener('click', function () { RS.setSeed(RS.newSeedNumber()); });
    $('seedInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('seedUse').click(); });
    $('stopSound').addEventListener('click', function () { RS.modes.span.stopNote(); });
    $('newPattern').addEventListener('click', function () { RS.modes.ripples.newPattern(); });
    $('errClear').addEventListener('click', function () { RS.errors.length = 0; renderErrors(); });
    RS.order.concat(RS.hidden).forEach(function (id) {
      var m = RS.modeInfo[id]; if (!m) return;
      var h = document.createElement('h4'); h.textContent = (RS.modes[id].icon || '') + ' ' + m.title + (RS.hidden.indexOf(id) >= 0 ? ' (hidden)' : '');
      var p = document.createElement('p'); p.textContent = m.text;
      $('narrList').appendChild(h); $('narrList').appendChild(p);
    });
    $('versionText').textContent = 'v' + RS.version;
    [
      '0.3.1: notes marked done elsewhere show as done here, and notes from other devices appear; choose All to see the done ones.',
      '0.3.0: audio wakes from sleep and shows a crossed-out speaker when asleep; shorter error bar that fades; two fingers with colours, a volume slide and a pulse; desert Footsteps with a 15-rhythm road and tap-to-play objects; heat map with pitch and chord views; ripples up-and-down choice; more pad sounds with a seed number; dot loop with up to eight rings; Echo that learns your level, with a sung tone; what each mode does (upper-right corner and ⚙️).',
      '0.2.0: less lag (taps act at once, the microphone is heard on the audio thread, the string sounds are ready before you pluck, the audio engine is built before your first touch), a sound lag check, five new games (Echo, Marbles, Dot loop, Footsteps, Hum trail) and a hidden breathing garden with three gardens.',
      '0.1.1: the microphone is asked for as seldom as the browser allows: never again after a refusal, silent restart where the browser remembers a yes, one request per visit elsewhere. Button to try again.',
      '0.1.0: first build. Six modes: ripples, beads (beat looper), shake pads, strings, two fingers, how the machine hears. Hidden gear, notes for improvement, family database link for notes.',
    ].forEach(function (t) { var li = document.createElement('li'); li.textContent = t; $('changelog').appendChild(li); });

    document.body.classList.toggle('showErrors', !!RS.settings.showErrors);
    RS.onSet(function (k) {
      if (k === 'showErrors') { document.body.classList.toggle('showErrors', !!RS.settings.showErrors); if (RS.settings.showErrors && RS.errors.length) flashErrors(); }
      if (k === 'keepGear') { if (RS.settings.keepGear) { gear.classList.add('show'); clearTimeout(hideTimer); } else if (!document.body.classList.contains('drawerOpen')) G.show(); }
      if (k === 'strings' && RS.curId === 'strings') RS.restart();
    });
    RS.onErr = function () { renderErrors(); flashErrors(); };
    $('errors').addEventListener('click', function () { document.body.classList.toggle('errPin'); });
    $('infoClose').addEventListener('click', RS.info.hide);
    renderErrors();
    if (RS.settings.keepGear) gear.classList.add('show');
  });
})();
