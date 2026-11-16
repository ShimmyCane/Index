/* Generate Clouds — thunder, made in the page with the Web Audio API (no sound files).
   Sound travels about 343 m each second, so the rumble arrives after the flash:
   count the seconds and divide by three for the distance in kilometres. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  var ctx = null, noise = null;
  var A = GC.Audio = { played: 0 };
  // Browsers only allow sound after a touch or a click, so this is called from the play button.
  A.unlock = function () {
    if (ctx || !+GC.settings.sound) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      ctx = new C();
      noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      var d = noise.getChannelData(0), last = 0;
      for (var i = 0; i < d.length; i++) { last = (last + (Math.random() * 2 - 1) * 0.06) * 0.985; d[i] = last * 6; }     // brown noise
    } catch (e) { ctx = null; }
  };
  // distanceKm: how far the bolt was. Returns the delay in seconds (for the page to show).
  A.thunder = function (distanceKm) {
    var delay = Math.min(distanceKm / 0.343, 25);
    if (!ctx || !+GC.settings.sound) return delay;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime + delay, len = 2.5 + Math.min(distanceKm, 15) * 0.25;
      var src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(distanceKm < 3 ? 900 : 260, t); lp.frequency.exponentialRampToValueAtTime(60, t + len);     // far thunder loses its crack
      var g = ctx.createGain(), vol = 0.9 / (1 + distanceKm / 4);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06);
      g.gain.exponentialRampToValueAtTime(vol * 0.35, t + len * 0.3); g.gain.exponentialRampToValueAtTime(vol * 0.5, t + len * 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t, Math.random() * 2); src.stop(t + len + 0.1);
      A.played++;
    } catch (e) { GC.logError('Sound: ' + e.message); }
    return delay;
  };
  A.ready = function () { return !!ctx; };
})();
