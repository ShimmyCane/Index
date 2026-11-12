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
      } else if (el.type === 'checkbox') { el.checked = !!v; }
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

  function renderErrors() {
    var ol = $('errList');
    ol.textContent = '';
    RS.errors.forEach(function (e) {
      var li = document.createElement('li');
      li.textContent = e.at.slice(11, 19) + '  ' + e.msg;
      ol.appendChild(li);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    gear = $('gear'); drawer = $('drawer');
    buildModeSeg(); bindControls(); bindPanels(); syncControls();
    gear.addEventListener('click', G.open);
    $('drawerClose').addEventListener('click', G.close);
    RS.onMode(function (id) {
      syncModeRows(id);
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
    $('shufflePads').addEventListener('click', function () { RS.modes.pads.shuffle(); });
    $('stopSound').addEventListener('click', function () { RS.modes.span.stopNote(); });
    $('newPattern').addEventListener('click', function () { RS.modes.ripples.newPattern(); });
    $('errClear').addEventListener('click', function () { RS.errors.length = 0; renderErrors(); });
    $('versionText').textContent = 'v' + RS.version;
    [
      '0.1.1: the microphone is asked for as seldom as the browser allows: never again after a refusal, silent restart where the browser remembers a yes, one request per visit elsewhere. Button to try again.',
      '0.1.0: first build. Six modes: ripples, beads (beat looper), shake pads, strings, two fingers, how the machine hears. Hidden gear, notes for improvement, family database link for notes.',
    ].forEach(function (t) { var li = document.createElement('li'); li.textContent = t; $('changelog').appendChild(li); });

    document.body.classList.toggle('showErrors', !!RS.settings.showErrors);
    RS.onSet(function (k) {
      if (k === 'showErrors') document.body.classList.toggle('showErrors', !!RS.settings.showErrors);
      if (k === 'keepGear') { if (RS.settings.keepGear) { gear.classList.add('show'); clearTimeout(hideTimer); } else if (!document.body.classList.contains('drawerOpen')) G.show(); }
      if (k === 'strings' && RS.curId === 'strings') RS.restart();
    });
    RS.onErr = renderErrors;
    renderErrors();
    if (RS.settings.keepGear) gear.classList.add('show');
  });
})();
