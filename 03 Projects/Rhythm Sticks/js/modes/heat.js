// Mode 6: How the machine hears. The microphone as a heat map (a spectrogram):
// time runs left to right, high sounds are at the top, loud sounds are hot. Tap to freeze.
(function () {
  'use strict';
  var M = RS.modes.heat = { id: 'heat', name: 'How the machine hears', icon: '🌡️' };
  var S, buf, bg, frozen = false, acc = 0, peak = 0;
  var STOPS = [[0, 255, 243, 214], [0.3, 255, 208, 181], [0.55, 255, 158, 138], [0.8, 190, 80, 120], [1, 70, 40, 95]];
  var FMIN = 80, FMAX = 8000, COL_W = 3;

  function heat(v) {
    for (var i = 1; i < STOPS.length; i++) {
      if (v <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i], t = (v - a[0]) / (b[0] - a[0]);
        return 'rgb(' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ',' + Math.round(a[3] + (b[3] - a[3]) * t) + ')';
      }
    }
    return 'rgb(70,40,95)';
  }
  function makeBuf() {
    buf = document.createElement('canvas');
    buf.width = Math.round(S.w); buf.height = Math.round(S.h);
    bg = buf.getContext('2d');
    bg.fillStyle = RS.pal.vanilla; bg.fillRect(0, 0, buf.width, buf.height);
  }
  M.start = function (stage) { S = stage; frozen = false; acc = 0; peak = 0; makeBuf(); RS.mic.start(); };
  M.stop = function () { RS.mic.stop(); };
  M.resize = function () { makeBuf(); };
  M.down = function () { frozen = !frozen; };

  M.draw = function (g, w, h, dt) {
    var an = RS.mic.analyser, data = RS.mic.freqData;
    if (an && data && !frozen) {
      acc += dt * 60 * RS.speed();                              // columns per frame follow the visual speed
      while (acc >= 1) {
        acc -= 1;
        an.getByteFrequencyData(data);
        bg.drawImage(buf, -COL_W, 0);
        var bh = an.context.sampleRate / an.fftSize, x = buf.width - COL_W, step = 3;
        bg.fillStyle = RS.pal.vanilla; bg.fillRect(x, 0, COL_W, buf.height);
        for (var y = 0; y < buf.height; y += step) {
          var f = FMIN * Math.pow(FMAX / FMIN, 1 - (y + step / 2) / buf.height);
          var k = Math.min(data.length - 1, Math.round(f / bh));
          var v = data[k] / 255;
          v = Math.min(1, Math.max(0, (v - 0.12) / 0.78));
          if (v > 0.02) { bg.fillStyle = heat(v); bg.fillRect(x, y, COL_W, step); }
          if (v > peak) peak = v;
        }
      }
    }
    g.drawImage(buf, 0, 0, w, h);
    // Octave ticks on the left edge, no words.
    g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.globalAlpha = 0.45;
    [110, 220, 440, 880, 1760, 3520].forEach(function (f) {
      var y = h * (1 - Math.log(f / FMIN) / Math.log(FMAX / FMIN));
      g.beginPath(); g.moveTo(0, y); g.lineTo(14, y); g.stroke();
    });
    g.globalAlpha = 1;
    if (frozen) {                                               // pause mark
      g.fillStyle = RS.pal.paper; g.strokeStyle = RS.pal.ink; g.lineWidth = 3;
      [28, 52].forEach(function (x) { g.beginPath(); g.rect(x, 24, 14, 40); g.fill(); g.stroke(); });
    }
    var ok = RS.mic.state === 'on';
    if (!ok) {                                                  // microphone off: crossed-out mic
      var mx = 40, my = h - 46;
      g.strokeStyle = RS.pal.ink; g.lineWidth = 3; g.fillStyle = RS.pal.peach;
      g.beginPath(); g.rect(mx - 9, my - 18, 18, 28); g.fill(); g.stroke();
      g.strokeStyle = RS.pal.coral; g.lineWidth = 4; g.beginPath(); g.moveTo(mx - 20, my - 22); g.lineTo(mx + 20, my + 24); g.stroke();
    }
  };
  M.info = function () { return { frozen: frozen, mic: RS.mic.state, peak: Math.round(peak * 100) / 100 }; };
})();
