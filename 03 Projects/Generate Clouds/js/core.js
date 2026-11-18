/* Generate Clouds — shared basics: version, settings, error list, small helpers. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  GC.VERSION = '0.7.1';

  var KEY = 'gc.settings';
  GC.DEFAULTS = { quality: 'med', mode: 'lapse', lapse: 60, wave: 1, clip: 15, figures: 0, autoplay: 1, compass: 1, turn: 60, sound: 1, bar: 1, relief: 1, clouds: 1, showErrors: false };
  GC.settings = {};
  (function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    Object.keys(GC.DEFAULTS).forEach(function (k) { GC.settings[k] = (k in saved) ? saved[k] : GC.DEFAULTS[k]; });
    if (!{ low: 1, med: 1, high: 1 }[GC.settings.quality]) GC.settings.quality = 'med';
    if (['lapse', 'clip'].indexOf(GC.settings.mode) < 0) GC.settings.mode = 'lapse';
    if ([60, 120, 240].indexOf(+GC.settings.lapse) < 0) GC.settings.lapse = 60;
    if ([0.5, 1, 2].indexOf(+GC.settings.wave) < 0) GC.settings.wave = 1;
    if ([15, 30, 60].indexOf(+GC.settings.clip) < 0) GC.settings.clip = 15;
    if (+GC.settings.figures !== 1) GC.settings.figures = 0;
    if ([30, 60, 120].indexOf(+GC.settings.turn) < 0) GC.settings.turn = 60;
    if ([1, 2, 4].indexOf(+GC.settings.relief) < 0) GC.settings.relief = 1;
    if (+GC.settings.bar !== 0) GC.settings.bar = 1;
    if (+GC.settings.clouds !== 0) GC.settings.clouds = 1;
  })();
  GC.saveSettings = function () { try { localStorage.setItem(KEY, JSON.stringify(GC.settings)); } catch (e) { /* storage blocked */ } };

  GC.store = {
    get: function (k, fallback) { try { var v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  GC.errors = [];
  GC.onError = null;
  GC.logError = function (msg) {
    GC.errors.push(new Date().toLocaleTimeString() + '  ' + msg);
    if (GC.errors.length > 60) GC.errors.shift();
    if (GC.onError) GC.onError();
  };
  window.addEventListener('error', function (e) { GC.logError(e.message || 'Script error'); });
  window.addEventListener('unhandledrejection', function (e) { GC.logError('Promise: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)); });

  GC.clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  GC.lerp = function (a, b, t) { return a + (b - a) * t; };
  GC.rad = function (d) { return d * Math.PI / 180; };
  GC.deg = function (r) { return r * 180 / Math.PI; };
  GC.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  GC.compass = function (degFromNorth) { return POINTS[Math.round((((degFromNorth % 360) + 360) % 360) / 22.5) % 16]; };
  GC.$ = function (id) { return document.getElementById(id); };
})();
