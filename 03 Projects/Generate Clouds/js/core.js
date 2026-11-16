/* Generate Clouds — shared basics: version, settings, error list, small helpers. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  GC.VERSION = '0.4.0';

  var KEY = 'gc.settings';
  GC.DEFAULTS = { quality: 'med', speed: 60, autoplay: 1, compass: 1, turn: 60, sound: 1, showErrors: false };
  GC.settings = {};
  (function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    Object.keys(GC.DEFAULTS).forEach(function (k) { GC.settings[k] = (k in saved) ? saved[k] : GC.DEFAULTS[k]; });
    if (!{ low: 1, med: 1, high: 1 }[GC.settings.quality]) GC.settings.quality = 'med';
    if ([30, 60, 120, 300].indexOf(+GC.settings.speed) < 0) GC.settings.speed = 60;
    if ([30, 60, 120].indexOf(+GC.settings.turn) < 0) GC.settings.turn = 60;
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
