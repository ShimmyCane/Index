// Voice commands by the browser's speech recognition. It may be missing (some browsers) or slow;
// the big button always works. Phrases are matched whole-word, ignoring case, commas and apostrophes.
(function () {
  'use strict';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, want = 'off', cb = null, lastHit = 0, restarting = false;
  var V = window.Voice = {
    supported: !!SR, mode: 'off', status: SR ? 'off' : 'Voice commands are not available in this browser. Use the big button.',
    heardAt: 0
  };
  function norm(s) { return (' ' + s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '); }
  function phrases(key) {
    return PC.settings[key].split(',').map(norm).filter(function (p) { return p.trim(); });
  }
  V.match = function (text, list) { var t = norm(text); return list.some(function (p) { return t.indexOf(p) >= 0; }); };
  V.classify = function (text, mode) {                       // 'start' | 'stop' | null, for the current mode
    if (mode === 'start' && V.match(text, phrases('startPhrases'))) return 'start';
    if (mode === 'stop' && PC.settings.stopVoice && V.match(text, phrases('stopPhrases'))) return 'stop';
    return null;
  };
  function setStatus(s) { V.status = s; PC.emit('voice', s); }
  function make() {
    rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = function (ev) {
      var text = '';
      for (var i = ev.resultIndex; i < ev.results.length; i++) text += ' ' + ev.results[i][0].transcript;
      var kind = V.classify(text, want);
      if (kind && Date.now() - lastHit > 2500) {
        lastHit = Date.now(); V.heardAt = performance.now();
        try { rec.abort(); } catch (e) { /* restarts on end */ }   // forget this sentence so it cannot match twice
        if (cb) cb(kind, text);
      }
    };
    rec.onerror = function (ev) {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { V.supported = false; setStatus('Voice commands were blocked. Use the big button.'); }
      else if (ev.error === 'network') setStatus('Voice needs the internet. Use the big button.');
      else if (ev.error !== 'no-speech' && ev.error !== 'aborted') PC.err('Voice', ev.error);
    };
    rec.onend = function () {
      if (want !== 'off' && V.supported && PC.settings.voice && !restarting) {
        restarting = true; setTimeout(function () { restarting = false; run(); }, 350);
      }
    };
  }
  function run() {
    if (!V.supported || !PC.settings.voice || want === 'off') return;
    try { if (!rec) make(); rec.start(); setStatus(want === 'start' ? 'Listening for "start recording"' : 'Listening for "stop recording"'); }
    catch (e) { /* already running */ }
  }
  // mode: 'start' (waiting), 'stop' (recording) or 'off'
  V.listen = function (mode, callback) {
    want = mode; V.mode = mode; cb = callback;
    if (mode === 'off') { if (rec) { try { rec.abort(); } catch (e) { /* ok */ } } setStatus(SR ? 'off' : V.status); return; }
    run();
  };
  PC.on('setting', function (k) { if (k === 'voice' && !PC.settings.voice && rec) { try { rec.abort(); } catch (e) { /* ok */ } setStatus('off'); } else if (k === 'voice') run(); });
})();
