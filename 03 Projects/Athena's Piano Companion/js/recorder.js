// The recording loop for index.html:
//   wake (one tap, the microphone needs it) -> waiting -> start (voice or big circle) -> count-in -> recording
//   -> stop (pause, stop notes, "stop recording", or the circle) -> trim -> save -> waiting again.
(function () {
  'use strict';
  var S = PC.settings, h = PC.h, $ = function (id) { return document.getElementById(id); };
  var state = 'idle', token = null, capStartT = 0, gesture = PC.store.get('gesture', null), learn = null, flashTimer = null;
  var big, word, icon, count, dotsEl, hint, skipBtn;

  var LOOK = {
    idle: ['🎹', 'Tap to wake'], waiting: ['🎤', 'Listening'], countin: ['✨', 'Get ready'], recording: ['⏺', 'Recording'],
    ending: ['⏺', 'Recording'], saving: ['💾', 'Saved'], learning: ['🎵', 'Play your stop notes'], error: ['🎤', 'Tap to try again']
  };
  function setState(s, hintText) {
    state = s; big.dataset.state = s; document.body.dataset.state = s;
    icon.textContent = LOOK[s][0]; word.textContent = LOOK[s][1];
    if (hintText !== undefined) hint.textContent = hintText;
    if (s !== 'ending') { count.textContent = ''; big.classList.remove('blink'); }
    if (s !== 'countin') dotsEl.querySelectorAll('i').forEach(function (d) { d.classList.remove('on'); });
    dotsEl.hidden = !(s === 'countin');
  }
  function flash(text, ms) { hint.textContent = text; clearTimeout(flashTimer); flashTimer = setTimeout(function () { if (state === 'waiting') hint.textContent = waitingHint(); }, ms || 2600); }
  function waitingHint() {
    return (Voice.supported && S.voice ? 'Say “start recording” or tap the circle' : 'Tap the circle to start') +
      (S.stopNote && !gesture ? '\nNo stop notes yet: see ⚙️' : '');
  }

  // ---- waking up (a tap is needed for the microphone and for sound)
  async function wake() {
    try { PC.ctx(); await Listen.start(); }
    catch (e) {
      PC.err('Microphone', e);
      setState('error', 'The microphone is blocked or busy. ' + (e && e.name === 'NotAllowedError' ? 'Allow it in the browser settings.' : 'Another app or tab may be using it.'));
      return;
    }
    if (S.stopNote && !gesture) startLearn(); else enterWaiting();
  }
  function enterWaiting() {
    setState('waiting', waitingHint());
    Voice.listen(S.voice ? 'start' : 'off', onVoice);
  }

  // ---- start
  function startRecording() {
    if (state !== 'waiting') return;
    setState('countin', 'Play when the high sound comes');
    Voice.listen('off');
    token = { cancelled: false };
    var dots = dotsEl.querySelectorAll('i');
    Cues.countIn(S.cue, function (i) { if (dots[i]) dots[i].classList.add('on'); }, token).then(function () {
      if (!token.cancelled) beginCapture();
    });
  }
  function cancelCountIn() { if (token) token.cancelled = true; enterWaiting(); }
  function beginCapture() {
    Listen.beginCapture(); capStartT = Listen.t;
    setState('recording', S.stopPause ? 'Stop playing for a moment and it will finish by itself' : 'Tap the circle to finish');
    if (S.stopVoice && S.voice) Voice.listen('stop', onVoice);
  }

  // ---- stop
  function onVoice(kind) {
    if (kind === 'start') startRecording();
    else if (kind === 'stop' && (state === 'recording' || state === 'ending')) finish('voice', { voiceHeard: Listen.t - capStartT - 0.2 });
  }
  PC.on('chunk', function (L) {
    if (state === 'learning') return learnStep(L);
    if (state !== 'recording' && state !== 'ending') return;
    var length = L.t - capStartT;
    if (L.onsets.length === 0 && length > 20) { Listen.endCapture(); Voice.listen('off'); setState('waiting'); flash('No playing heard, so nothing was saved'); enterWaiting(); return; }
    if (length > 20 * 60) return finish('long', {});
    if (!S.stopPause || L.onsets.length === 0) return;
    var silent = L.t - L.lastActiveAt, rem = S.pause - silent;
    if (rem <= 0) return finish('pause', {});
    if (silent >= 1.5 && rem <= 3) {                          // the 3, 2, 1 shows over the last three seconds of the pause
      if (state !== 'ending') { state = 'ending'; big.dataset.state = 'ending'; big.classList.add('blink'); }
      var n = String(Math.ceil(rem));
      if (count.textContent !== n) { count.textContent = n; Cues.tick(); }
    } else if (state === 'ending') {                          // she played again: cancel the countdown
      state = 'recording'; big.dataset.state = 'recording'; big.classList.remove('blink'); count.textContent = '';
    }
  });
  PC.on('pitch', function (o) {                               // the stop notes: the end of the take matches what she taught
    if ((state !== 'recording' && state !== 'ending') || !S.stopNote || !gesture) return;
    var list = Listen.onsets;
    if (list[list.length - 1] !== o || !Listen.matches(list, gesture)) return;
    var first = list.length - gesture.n, prev = list[first - 1], startT = list[first].t;
    if (prev && startT - prev.t < 0.8) return;                // a stop is a pause, then the notes: not a run in the middle of playing
    finish('note', { cutAt: startT - capStartT - 0.05 });
  });

  async function finish(reason, o) {
    if (state !== 'recording' && state !== 'ending') return;
    var c = Listen.endCapture(); Voice.listen('off');
    setState('saving');
    try {
      var cut = o.cutAt != null ? o.cutAt : null;
      if (o.voiceHeard != null) cut = Trim.voiceCut(c.data, c.sr, o.voiceHeard, Listen.thr);
      var tr = Trim.run(c.data, c.sr, { thr: Listen.thr, cut: cut });
      if (!tr) { enterWaiting(); flash('Nothing to keep that time'); return; }
      var take = await saveTake(tr.data, c.sr);
      word.textContent = take.name + ' saved'; hint.textContent = '';
      Cues.saved();
      setTimeout(function () { if (state === 'saving') enterWaiting(); }, 1800);
    } catch (e) { PC.err('Saving the take', e); enterWaiting(); flash('Could not save that take'); }
  }

  async function saveTake(data, sr) {
    var d = new Date(), player = S.player, all = await Store.all('takes');
    var n = all.filter(function (t) { return t.player === player; }).reduce(function (m, t) { return Math.max(m, t.take_no || 0); }, 0) + 1;
    var blob = PC.encodeWav(data, sr);
    var take = {
      id: PC.uid('t'), name: 'Take ' + n, player: player,
      album: S.album || 'Free play ' + d.getFullYear() + '-' + PC.pad(d.getMonth() + 1),
      take_no: n, file_name: (player + '-' + PC.stamp(d) + '-take' + n + '.wav').toLowerCase(), file_path: '',
      mime: 'audio/wav', duration_ms: Math.round(data.length / sr * 1000), size_bytes: blob.size, sample_rate: sr,
      rating: 0, description: '', color: PC.colorFor(n + (player === 'Felix' ? 3 : 0)),
      peaks: PC.peaks(data, 64), source: 'recorder', taken_at: d.toISOString(), blob: blob
    };
    await Store.save('takes', take);
    Notes.setContext({ item: take.id, label: take.name + ' (' + take.player + ')' });
    return take;
  }

  // ---- learning the stop notes (first use, or again from ⚙️)
  function startLearn() {
    learn = { step: 'play', tries: 0, sig: null };
    Listen.reset(); Voice.listen('off');
    setState('learning', 'Play 3 to 5 notes you would like to mean “stop”, then wait a moment.');
    skipBtn.hidden = false;
  }
  function learnStep(L) {
    var list = L.onsets, last = list[list.length - 1];
    if (!last || L.t - last.t < 1.6) return;                  // wait for her to finish
    var n = list.length;
    if (learn.step === 'play') {
      if (n < 3) { hint.textContent = 'Try at least 3 notes, so it never happens by accident.'; Listen.onsets = []; return; }
      if (n > 8) { hint.textContent = 'That is a lot. Try 3 to 5 notes.'; Listen.onsets = []; return; }
      learn.sig = Listen.signature(list.slice()); learn.step = 'confirm'; Listen.onsets = [];
      hint.textContent = 'Got it. Play the same notes once more to check.';
    } else if (Listen.matches(list, learn.sig)) {
      gesture = learn.sig; PC.store.set('gesture', gesture); Cues.saved(); PC.emit('gesture');
      endLearn('Your stop notes are saved.');
    } else {
      learn.tries++; Listen.onsets = [];
      if (learn.tries >= 2) { learn.step = 'play'; learn.tries = 0; hint.textContent = 'Not quite. Let us start again: play your 3 to 5 notes.'; }
      else hint.textContent = 'Not quite the same. Try once more.';
    }
  }
  function endLearn(msg) {
    learn = null; skipBtn.hidden = true; Listen.onsets = []; enterWaiting(); flash(msg || '', 3000);
  }

  // ---- the big circle
  function onBig() {
    if (state === 'idle' || state === 'error') wake();
    else if (state === 'waiting') { PC.ctx(); startRecording(); }
    else if (state === 'countin') cancelCountIn();
    else if (state === 'recording' || state === 'ending') finish('button', {});
  }

  // ---- ⚙️ for this page
  function sections() {
    var learnState = h('div', { 'class': 'hint' });
    function paintGesture() { learnState.textContent = gesture ? 'Stop notes saved: ' + gesture.n + ' notes.' : 'No stop notes yet.'; }
    paintGesture(); PC.on('gesture', paintGesture);
    var learnBtn = h('button', { 'class': 'btn wide', type: 'button', text: '🎵 Learn the stop notes', onclick: function () {
      Chrome.open(false);
      if (state === 'waiting' || state === 'learning') startLearn(); else if (state === 'idle' || state === 'error') { gesture = null; wake(); }
    } });
    var forget = h('button', { 'class': 'btn wide', type: 'button', text: 'Forget the stop notes', onclick: function () { gesture = null; PC.store.set('gesture', null); paintGesture(); } });
    var meter = h('div', { 'class': 'meter' }, [h('i')]);
    (function loop() { var m = meter.firstChild; m.style.width = Math.min(100, Listen.level * 600) + '%'; m.style.background = Listen.active ? '#7fd6a6' : '#d9d3c4'; requestAnimationFrame(loop); })();
    return [
      { id: 'rec', icon: '🎙️', title: 'Recording', open: true, build: function () { return [
        h('div', { 'class': 'row' }, [h('span', { text: 'How the page hears you' })]), meter,
        Chrome.seg('sens', [{ v: 'low', label: 'Loud room' }, { v: 'mid', label: 'Normal' }, { v: 'high', label: 'Quiet room' }]),
        h('div', { 'class': 'row' }, [h('span', {}, ['Count-in', h('small', { text: 'Try each one; the choice is kept' })])]),
        Chrome.seg('cue', Cues.kinds.map(function (k) { return { v: k.v, label: k.label, hint: k.hint }; }), 'grid2', function (v) { if (state === 'waiting' || state === 'idle') Cues.preview(v); }),
        h('div', { 'class': 'row' }, [h('span', {}, ['Pause that ends a take', h('small', { text: 'Seconds of quiet. The 3, 2, 1 shows during the last three.' })])]),
        Chrome.seg('pause', [3, 4, 5, 6, 8, 10].map(function (n) { return { v: n, label: n + 's' }; })),
        Chrome.range('volume', 'Sound volume', 10, 100, 5, '%')
      ]; } },
      { id: 'stops', icon: '🛑', title: 'Ways to stop', build: function () { return [
        h('div', { 'class': 'hint', text: 'Tapping the circle always stops. Turn on any of these as well:' }),
        Chrome.check('stopPause', 'A pause', 'The circle blinks, counts 3, 2, 1, then stops. Playing again cancels it.'),
        Chrome.check('stopNote', 'Your stop notes', 'A few notes you choose, after a short pause. They are cut off the take.'),
        learnState, learnBtn, forget,
        Chrome.check('stopVoice', 'Saying “stop recording”', 'Needs voice commands to work')
      ]; } },
      { id: 'voice', icon: '🗣️', title: 'Voice', build: function () {
        var st = h('div', { 'class': 'hint', text: Voice.status });
        PC.on('voice', function (s) { st.textContent = s; });
        return [Chrome.check('voice', 'Voice commands', 'Say a start phrase and the count-in begins'), st,
          Chrome.text('startPhrases', 'Start phrases', 'Separate with commas'), Chrome.text('stopPhrases', 'Stop phrases', 'Separate with commas'),
          h('div', { 'class': 'hint', text: 'Voice commands need an internet connection and may not work on every device. The big circle always works.' })]; } },
      { id: 'cards', icon: '🃏', title: 'Take cards', build: function () { return [
        h('div', { 'class': 'hint', text: 'What each take card shows. Try them on and off to see which you like.' }),
        Chrome.check('cardColor', 'Colour'), Chrome.check('cardWave', 'Picture of the sound'), Chrome.check('cardNumber', 'Take number'),
        Chrome.text('album', 'Album name for new takes', 'Empty means “Free play” and the month')
      ]; } }
    ];
  }

  document.addEventListener('DOMContentLoaded', function () {
    big = $('big'); word = $('bigWord'); icon = $('bigIcon'); count = $('count'); dotsEl = $('dots'); hint = $('hint'); skipBtn = $('skip');
    big.addEventListener('click', onBig);
    skipBtn.addEventListener('click', function () { endLearn('You can set the stop notes later in ⚙️.'); });
    // who is playing
    var who = $('who');
    function paintWho() {
      who.textContent = '';
      ['Athena', 'Felix'].forEach(function (name) {
        var b = h('button', { 'class': 'chip' + (S.player === name ? ' on' : ''), type: 'button', text: name });
        b.addEventListener('click', function () { PC.set('player', name); paintWho(); });
        who.appendChild(b);
      });
    }
    paintWho();
    Chrome.init({ page: 'index', desc: 'Everything you can change about recording lives here, so the front stays calm.', sections: sections() });
    Strip.init($('strip'), $('stripEmpty')); Strip.locked = function () { return state === 'countin' || state === 'recording' || state === 'ending'; };
    Store.idleWhen(function () { return state !== 'waiting' || Listen.t - Listen.lastActiveAt < 8 || PC.isPlaying(); });
    setState('idle', 'The page listens while you play, and keeps what you play.');
    (function pulse() {                                       // the circle breathes with the sound
      big.style.setProperty('--lv', Math.min(1, Listen.level * 9).toFixed(3)); requestAnimationFrame(pulse);
    })();
    window.Rec = { state: function () { return state; }, finish: finish, start: startRecording, gesture: function () { return gesture; } };
  });
})();
