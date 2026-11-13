// Sound lag check, in the gear panel. Shows what the audio engine reports, and measures a round trip:
// a click leaves the speaker and the microphone hears it. This is output + air + microphone + detection,
// the same path a clap takes to a drum, minus the clap itself.
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function ms(x) { return Math.round(x * 1000) + ' ms'; }

  function describe() {
    var i = RS.audio.info();
    if (!i) { $('lagInfo').textContent = 'The audio engine starts on your first touch of the screen.'; return; }
    var parts = ['Audio engine: ' + i.state, 'base delay ' + ms(i.base)];
    parts.push(i.output ? 'output delay reported ' + ms(i.output) : 'output delay not reported by this browser');
    parts.push('microphone listening: ' + (RS.mic.engine === 'worklet' ? 'fast (audio thread)' : RS.mic.engine === 'analyser' ? 'slower (screen frames)' : 'off'));
    $('lagInfo').textContent = parts.join(' · ') + '.';
  }

  function run() {
    var out = $('lagResult'), btn = $('lagRun');
    RS.audio.wake();
    btn.disabled = true; out.textContent = 'Starting the microphone…';
    var wasWanted = RS.mic.want;
    RS.mic.start().then(function () {
      if (RS.mic.state !== 'on') { out.textContent = 'The microphone is not on, so the round trip cannot be measured. Use the button in this panel to try the microphone again.'; btn.disabled = false; return; }
      var results = [], i = 0, expect = 0, unsub = RS.mic.onOnset(function () {
        var arrived = performance.now();
        if (expect && arrived - expect > -20 && arrived - expect < 700) { results.push(arrived - expect); expect = 0; }
      });
      out.textContent = 'Listening…';
      (function next() {
        if (i >= 5) {
          unsub();
          if (!wasWanted && !RS.cur.mic) RS.mic.stop();
          if (!results.length) out.textContent = 'The microphone did not hear the clicks. Turn the volume up and hold the speaker closer to it, then try again.';
          else {
            results.sort(function (a, b) { return a - b; });
            out.textContent = 'Heard ' + results.length + ' of 5 clicks. Round trip: ' + Math.round(results[Math.floor(results.length / 2)]) + ' ms (fastest ' + Math.round(results[0]) + ' ms).';
          }
          btn.disabled = false; describe();
          return;
        }
        i++;
        expect = performance.now() + 50;
        RS.audio.testBurst(0.05);
        setTimeout(next, 900);
      })();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('lagRun').addEventListener('click', run);
    $('gear').addEventListener('click', describe);
    document.querySelector('.panel[data-panel="lag"] .panelHead').addEventListener('click', describe);
    describe();
  });
  RS.lag = { describe: describe, run: run };
})();
