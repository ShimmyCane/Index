/* Voice 0.2.0 — story shelf, read along (recorded voice or iPad voice), speed read, ⚙️.
   Plain script, no build. Stories: stories/<id>.js; audio + word timings: stories/<id>.audio.js. */
(function () {
  'use strict';
  var VERSION = '0.2.0';
  var STORIES = window.VOICE_STORIES || [];
  var AUDIO = window.VOICE_AUDIO || {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- errors (opt-in, bottom) ---------- */
  var errors = [];
  function logError(msg) {
    errors.push(new Date().toLocaleTimeString() + '  ' + msg);
    renderErrors();
  }
  function renderErrors() {
    var p = $('errorsPanel');
    p.hidden = !settings.showErrors;
    p.textContent = errors.length ? errors.join('\n') : 'No problems so far.';
    p.style.whiteSpace = 'pre-wrap';
  }
  window.addEventListener('error', function (e) { logError((e.message || 'Error') + (e.filename ? ' @ ' + e.filename.split('/').pop() + ':' + e.lineno : '')); });
  window.addEventListener('unhandledrejection', function (e) { logError('Promise: ' + (e.reason && e.reason.message || e.reason)); });

  /* ---------- settings ---------- */
  var KEY = 'voice.settings';
  var DEFAULTS = { size: 'm', highlight: '1', rate: '1', wpm: 200, voiceEn: '', voiceZh: '', track: {}, best: {}, showErrors: false };
  var settings = load(KEY, DEFAULTS);
  function load(k, def) {
    var out = JSON.parse(JSON.stringify(def));
    try { var s = JSON.parse(localStorage.getItem(k) || 'null'); if (s) for (var x in def) if (x in s) out[x] = s[x]; } catch (e) { /* storage blocked */ }
    return out;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* storage blocked */ } }

  /* ---------- stories and tokens ---------- */
  function freshTracks(story) {
    var all = AUDIO[story.id] || {}, list = [];
    var src = JSON.stringify(story.paragraphs);
    Object.keys(all).forEach(function (k) {
      var t = all[k];
      list.push({ key: k, track: t, fresh: JSON.stringify(t.source) === src });
    });
    return list;
  }
  var PUNCT = /^[\s"'“”‘’「」（）()，。！？；：、,.!?;:—-]+$/;
  function browserTokens(par, lang) {
    if (lang !== 'zh') return par.split(/\s+/).filter(Boolean);
    var parts = [];
    if (window.Intl && Intl.Segmenter) {
      var seg = new Intl.Segmenter('zh', { granularity: 'word' });
      for (var it = seg.segment(par)[Symbol.iterator](), s = it.next(); !s.done; s = it.next()) parts.push(s.value.segment);
    } else parts = par.split('');
    var out = [], carry = '';
    parts.forEach(function (w) {
      if (!w.trim()) return;
      if (/^[“‘「（(]+$/.test(w)) carry += w;
      else if (PUNCT.test(w) && out.length) out[out.length - 1] += w;
      else { out.push(carry + w); carry = ''; }
    });
    if (carry) out.push(carry);
    return out;
  }
  function buildFlat(story) {
    var fresh = freshTracks(story).filter(function (t) { return t.fresh; });
    var words = fresh.length ? fresh[0].track.words : null;
    var flat = [];
    story.paragraphs.forEach(function (par, p) {
      var toks = words ? words[p].map(function (w) { return w[0]; }) : browserTokens(par, story.lang);
      toks.forEach(function (w, i) { flat.push({ p: p, i: i, text: w }); });
    });
    return flat;
  }
  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

  /* ---------- home ---------- */
  function renderHome() {
    var home = $('home');
    home.innerHTML = '';
    STORIES.forEach(function (st) {
      var tr = freshTracks(st).filter(function (t) { return t.fresh; });
      var len = tr.length ? fmt(tr[0].track.duration) + ' min' : 'iPad voice';
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'card'; b.style.background = st.color || '#fff';
      b.innerHTML = '<span class="cover">' + st.cover + '</span><span class="t"></span><span class="sub"></span><span class="len"></span><span class="go">▶</span>';
      b.querySelector('.t').textContent = st.title;
      b.querySelector('.sub').textContent = st.subtitle || '';
      b.querySelector('.len').textContent = '🎧 ' + len;
      b.lang = st.lang;
      b.addEventListener('click', function () { location.hash = 'story=' + st.id + '&mode=read'; });
      home.appendChild(b);
    });
  }

  /* ---------- routing ---------- */
  var cur = null; // { story, flat, mode }
  function route() {
    stopAll();
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ''); });
    var story = STORIES.filter(function (s) { return s.id === q.story; })[0];
    var isStory = !!story;
    $('home').hidden = isStory; $('back').hidden = !isStory; $('modeSeg').hidden = !isStory;
    if (!isStory) { cur = null; $('title').textContent = '🎙️ Stories'; $('read').hidden = $('speed').hidden = true; updateNoteWhere(); return; }
    if (!cur || cur.story !== story) cur = { story: story, flat: buildFlat(story), pos: 0, r: 0 };
    cur.mode = q.mode === 'speed' ? 'speed' : 'read';
    $('title').textContent = story.cover + ' ' + story.title;
    document.documentElement.lang = story.lang === 'zh' ? 'zh-CN' : 'en';
    [].forEach.call($('modeSeg').children, function (b) { b.classList.toggle('on', b.dataset.mode === cur.mode); });
    $('read').hidden = cur.mode !== 'read'; $('speed').hidden = cur.mode !== 'speed';
    if (cur.mode === 'read') openRead(); else openSpeed();
    updateNoteWhere();
  }
  $('back').addEventListener('click', function () { location.hash = ''; });
  [].forEach.call($('modeSeg').children, function (b) {
    b.addEventListener('click', function () { if (cur) location.hash = 'story=' + cur.story.id + '&mode=' + b.dataset.mode; });
  });
  window.addEventListener('hashchange', route);

  /* ---------- read along ---------- */
  var audio = new Audio();
  audio.preload = 'auto';
  var raf = 0, nowEl = null, ipad = { on: false, g: 0 };
  audio.addEventListener('error', function () { if (audio.getAttribute('src')) logError('Audio could not load: ' + audio.getAttribute('src')); setPlayIcon(false); });
  audio.addEventListener('ended', function () { setPlayIcon(false); highlight(-1); });

  function trackChoices(story) {
    var list = freshTracks(story).map(function (t) {
      return { key: t.key, label: t.track.service + ' · ' + nice(t.track.voice), sub: t.fresh ? fmt(t.track.duration) + ' · made ' + t.track.made : 'older than the text', ok: t.fresh };
    });
    list.push({ key: 'ipad', label: 'iPad voice', sub: ipadVoiceName(story.lang) || 'built in', ok: !!window.speechSynthesis });
    list.push({ key: 'eleven', label: 'ElevenLabs', sub: 'not made yet (needs a key)', ok: false });
    return list;
  }
  function nice(v) { return ({ af_heart: 'Heart', bm_fable: 'Fable', zf_xiaoxiao: '晓晓', zm_yunxi: '云希' })[v] || v; }
  function currentTrack() {
    var choices = trackChoices(cur.story).filter(function (c) { return c.ok; });
    var want = settings.track[cur.story.id];
    var pick = choices.filter(function (c) { return c.key === want; })[0] || choices[0];
    return pick ? pick.key : 'ipad';
  }
  function trackData(key) { return key.indexOf('kokoro:') === 0 || key.indexOf('eleven:') === 0 ? AUDIO[cur.story.id][key] : null; }

  function openRead() {
    var st = cur.story, text = $('text');
    text.lang = st.lang === 'zh' ? 'zh' : 'en';
    text.innerHTML = '';
    var sep = st.lang === 'zh' ? '' : ' ', pEl = null, lastP = -1;
    cur.flat.forEach(function (tk, g) {
      if (tk.p !== lastP) { pEl = document.createElement('p'); text.appendChild(pEl); lastP = tk.p; }
      else if (sep) pEl.appendChild(document.createTextNode(sep));
      var s = document.createElement('span'); s.className = 'w'; s.dataset.g = g; s.textContent = tk.text;
      pEl.appendChild(s);
    });
    nowEl = null;
    renderVoices();
    loadTrack();
  }
  $('text').addEventListener('click', function (e) {
    var g = e.target && e.target.dataset && e.target.dataset.g;
    if (g == null) return;
    jumpTo(+g, true);
  });

  function renderVoices() {
    var box = $('voiceList'), key = currentTrack();
    box.innerHTML = '';
    trackChoices(cur.story).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'vbtn' + (c.key === key ? ' on' : ''); b.disabled = !c.ok;
      b.innerHTML = '<b></b><small></small>';
      b.querySelector('b').textContent = (c.key === key ? '🔊 ' : '') + c.label;
      b.querySelector('small').textContent = c.sub;
      b.addEventListener('click', function () {
        var g = position();
        stopAll();
        settings.track[cur.story.id] = c.key; save();
        renderVoices(); loadTrack(); jumpTo(g, true);
      });
      box.appendChild(b);
    });
    $('voiceHint').textContent = 'Same story, different voices. Tap one, then ▶. Kokoro is a free open voice model, made ahead of time. The iPad voice speaks live.';
  }

  function loadTrack() {
    var t = trackData(currentTrack());
    if (t) { if (audio.getAttribute('src') !== t.src) audio.src = t.src; audio.playbackRate = +settings.rate; }
    else { audio.removeAttribute('src'); audio.load(); }
    setPlayIcon(false); updateTime();
  }
  function position() {
    if (!cur) return 0;
    var t = trackData(currentTrack());
    return t ? gAt(t, audio.currentTime) : ipad.g;
  }
  function gAt(t, sec) {
    var g = 0, i = 0;
    for (var p = 0; p < t.words.length; p++) for (var k = 0; k < t.words[p].length; k++, i++) if (t.words[p][k][1] <= sec + 0.02) g = i;
    return g;
  }
  function tAt(t, g) { var tk = cur.flat[g]; return tk ? t.words[tk.p][tk.i][1] : 0; }

  function jumpTo(g, keepPlaying) {
    g = Math.max(0, Math.min(cur.flat.length - 1, g));
    var playing = isPlaying(), t = trackData(currentTrack());
    if (t) { audio.currentTime = tAt(t, g); if (keepPlaying && playing) audio.play(); }
    else { ipad.g = g; if (keepPlaying && playing) speakFrom(g); }
    highlight(g); updateTime();
  }
  function isPlaying() { return trackData(currentTrack()) ? !audio.paused : ipad.on; }

  function togglePlay() {
    if (!cur) return;
    var t = trackData(currentTrack());
    if (t) {
      if (audio.paused) { audio.playbackRate = +settings.rate; audio.play().then(function () { setPlayIcon(true); tick(); }).catch(function (e) { logError('Play: ' + e.message); }); }
      else { audio.pause(); setPlayIcon(false); }
    } else {
      if (ipad.on) { ipad.on = false; speechSynthesis.cancel(); setPlayIcon(false); }
      else speakFrom(ipad.g >= cur.flat.length - 1 ? 0 : ipad.g);
    }
  }
  function tick() {
    cancelAnimationFrame(raf);
    var t = trackData(currentTrack());
    if (!t || audio.paused) return;
    highlight(gAt(t, audio.currentTime)); updateTime();
    raf = requestAnimationFrame(tick);
  }
  function highlight(g) {
    if (nowEl) nowEl.classList.remove('now');
    nowEl = g >= 0 ? $('text').querySelector('[data-g="' + g + '"]') : null;
    if (!nowEl) return;
    nowEl.classList.add('now');
    if (isPlaying()) {
      var r = nowEl.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight - 120) nowEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  function setPlayIcon(on) { $('play').textContent = on ? '⏸' : '▶'; $('play').setAttribute('aria-label', on ? 'Pause' : 'Play'); }
  function updateTime() {
    if (!cur) return;
    var t = trackData(currentTrack());
    if (t) { $('seek').value = Math.round(1000 * audio.currentTime / t.duration); $('time').innerHTML = fmt(audio.currentTime) + '<span class="tot"> / ' + fmt(t.duration) + '</span>'; }
    else { $('seek').value = Math.round(1000 * ipad.g / Math.max(1, cur.flat.length - 1)); $('time').textContent = (cur.flat[ipad.g] ? cur.flat[ipad.g].p + 1 : 1) + ' / ' + cur.story.paragraphs.length; }
  }
  $('play').addEventListener('click', togglePlay);
  $('restart').addEventListener('click', function () { jumpTo(0, true); });
  $('seek').addEventListener('input', function () {
    var t = trackData(currentTrack()), v = +$('seek').value / 1000;
    if (t) { audio.currentTime = v * t.duration; highlight(gAt(t, audio.currentTime)); updateTime(); }
    else jumpTo(Math.round(v * (cur.flat.length - 1)), true);
  });

  /* iPad (Web Speech) voice */
  var voices = [];
  function loadVoices() {
    if (!window.speechSynthesis) return;
    voices = speechSynthesis.getVoices() || [];
    fillSelect($('voiceEn'), 'en', 'voiceEn'); fillSelect($('voiceZh'), 'zh', 'voiceZh');
    if (cur && cur.mode === 'read') renderVoices();
  }
  function rank(v) { var n = v.name; return (/premium/i.test(n) ? 30 : /enhanced|neural|natural/i.test(n) ? 20 : /siri/i.test(n) ? 10 : 0) + (v.localService ? 1 : 0) + (/zh-CN|en-GB|en-US/i.test(v.lang) ? 2 : 0); }
  function langVoices(lang) { return voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(lang) === 0; }).sort(function (a, b) { return rank(b) - rank(a); }); }
  function pickVoice(lang) {
    var list = langVoices(lang), want = settings[lang === 'zh' ? 'voiceZh' : 'voiceEn'];
    return list.filter(function (v) { return v.name === want; })[0] || list[0] || null;
  }
  function ipadVoiceName(lang) { var v = pickVoice(lang === 'zh' ? 'zh' : 'en'); return v ? v.name : ''; }
  function fillSelect(sel, lang, key) {
    var list = langVoices(lang), chosen = pickVoice(lang);
    sel.innerHTML = '';
    if (!list.length) { var o = document.createElement('option'); o.textContent = 'No voice found'; sel.appendChild(o); return; }
    list.forEach(function (v) { var o = document.createElement('option'); o.value = v.name; o.textContent = v.name + ' (' + v.lang + ')'; o.selected = chosen && v.name === chosen.name; sel.appendChild(o); });
    sel.onchange = function () { settings[key] = sel.value; save(); if (cur && cur.mode === 'read') renderVoices(); };
  }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', loadVoices) : (speechSynthesis.onvoiceschanged = loadVoices); }

  var speakId = 0;
  function speakFrom(g) {
    if (!window.speechSynthesis) { logError('This browser has no speech voice.'); return; }
    speechSynthesis.cancel();
    var id = ++speakId, lang = cur.story.lang;
    ipad.on = true; ipad.g = g; setPlayIcon(true);
    function para(g0) {
      if (id !== speakId || !ipad.on) return;
      if (g0 >= cur.flat.length) { ipad.on = false; ipad.g = 0; setPlayIcon(false); highlight(-1); updateTime(); return; }
      var p = cur.flat[g0].p, sep = lang === 'zh' ? '' : ' ', text = '', starts = [], gs = [];
      for (var k = g0; k < cur.flat.length && cur.flat[k].p === p; k++) {
        if (text) text += sep;
        starts.push(text.length); gs.push(k); text += cur.flat[k].text;
      }
      var u = new SpeechSynthesisUtterance(text), v = pickVoice(lang === 'zh' ? 'zh' : 'en');
      if (v) u.voice = v;
      u.lang = v ? v.lang : (lang === 'zh' ? 'zh-CN' : 'en-US');
      u.rate = +settings.rate;
      highlight(g0); ipad.g = g0; updateTime();
      u.onboundary = function (e) {
        if (id !== speakId) return;
        var j = 0; while (j + 1 < starts.length && starts[j + 1] <= e.charIndex) j++;
        ipad.g = gs[j]; highlight(gs[j]); updateTime();
      };
      u.onend = function () { if (id === speakId && ipad.on) para(gs[gs.length - 1] + 1); };
      u.onerror = function (e) { if (e.error !== 'interrupted' && e.error !== 'canceled') { logError('iPad voice: ' + e.error); if (id === speakId) { ipad.on = false; setPlayIcon(false); } } };
      speechSynthesis.speak(u);
    }
    para(g);
  }

  function stopAll() {
    audio.pause(); cancelAnimationFrame(raf);
    if (window.speechSynthesis) { speakId++; ipad.on = false; speechSynthesis.cancel(); }
    rsvpStop(); setPlayIcon(false);
  }

  /* ---------- speed read ---------- */
  var rTimer = 0, rOn = false;
  function splitWord(w, lang) {
    if (lang === 'zh') {
      var m = w.match(/^([^一-鿿]*)(.*?)([^一-鿿]*)$/), core = m[2] || w;
      var k = Math.floor((core.length - 1) / 2);
      return [m[1] + core.slice(0, k), core.charAt(k), core.slice(k + 1) + m[3]];
    }
    var mm = w.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/), c = mm[2] || w, n = c.length;
    var o = n <= 1 ? 0 : n <= 5 ? 1 : n <= 9 ? 2 : n <= 13 ? 3 : 4;
    return [mm[1] + c.slice(0, o), c.charAt(o), c.slice(o + 1) + mm[3]];
  }
  function showWord(r) {
    var tk = cur.flat[r];
    if (!tk) return;
    var parts = splitWord(tk.text, cur.story.lang);
    $('wL').textContent = parts[0]; $('wF').textContent = parts[1]; $('wR').textContent = parts[2];
    $('rsvpBar').style.width = (100 * (r + 1) / cur.flat.length) + '%';
  }
  function delay(r) {
    var tk = cur.flat[r], base = 60000 / settings.wpm, w = tk.text, end = w.replace(/["'”’」）)]+$/, '').slice(-1);
    var len = cur.story.lang === 'zh' ? w.replace(/[^一-鿿]/g, '').length * 2.5 : w.replace(/[^A-Za-z0-9]/g, '').length;
    var f = 1 + Math.max(0, len - 6) * 0.08;
    if (/[.!?。！？]/.test(end)) f *= 2.2; else if (/[,;:，；：、]/.test(end)) f *= 1.5;
    var next = cur.flat[r + 1];
    if (next && next.p !== tk.p) f *= 1.4;
    return base * f;
  }
  function rsvpStep() {
    if (!rOn) return;
    showWord(cur.r);
    rTimer = setTimeout(function () {
      if (cur.r >= cur.flat.length - 1) { rsvpFinish(); return; }
      cur.r++; rsvpStep();
    }, delay(cur.r));
  }
  function rsvpFinish() {
    rsvpStop();
    var lang = cur.story.lang, best = settings.best[lang] || 0;
    if (settings.wpm > best) { settings.best[lang] = settings.wpm; save(); }
    $('wL').textContent = ''; $('wF').textContent = '⭐'; $('wR').textContent = '';
    renderBest(); cur.r = 0;
  }
  function rsvpStop() { rOn = false; clearTimeout(rTimer); $('rsvpPlay').textContent = '▶'; $('rsvpPlay').setAttribute('aria-label', 'Play'); }
  function rsvpToggle() {
    if (rOn) { rsvpStop(); return; }
    rOn = true; $('rsvpPlay').textContent = '⏸'; $('rsvpPlay').setAttribute('aria-label', 'Pause');
    rsvpStep();
  }
  function sentenceStart(r) {
    var ends = function (k) { return k >= 0 && /[.!?。！？]["'”’」）)]*$/.test(cur.flat[k].text); };
    var k = r - 1;
    while (k >= 0 && !ends(k)) k--;
    if (k + 1 === r && r > 0) { k--; while (k >= 0 && !ends(k)) k--; }
    return k + 1;
  }
  function renderBest() {
    var b = settings.best[cur.story.lang];
    $('best').textContent = b ? '⭐ Best: ' + b + ' words a minute, a whole story' : '';
  }
  function openSpeed() {
    $('wpm').value = settings.wpm; $('wpmVal').textContent = settings.wpm;
    if (cur.r) showWord(cur.r); else { $('wL').textContent = ''; $('wF').textContent = '▶'; $('wR').textContent = ''; $('rsvpBar').style.width = '0'; }
    renderBest();
  }
  $('rsvpPlay').addEventListener('click', rsvpToggle);
  $('stage').addEventListener('click', rsvpToggle);
  $('rsvpBack').addEventListener('click', function () { cur.r = sentenceStart(cur.r); showWord(cur.r); });
  $('rsvpStart').addEventListener('click', function () { cur.r = 0; showWord(0); });
  $('wpm').addEventListener('input', function () { settings.wpm = +$('wpm').value; $('wpmVal').textContent = settings.wpm; save(); });

  /* ---------- ⚙️ drawer ---------- */
  function openDrawer(open) { $('drawer').hidden = !open; $('gear').setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) { updateNoteWhere(); renderNotes(); } }
  $('gear').addEventListener('click', function () { openDrawer($('drawer').hidden); });
  $('closeDrawer').addEventListener('click', function () { openDrawer(false); });
  function renderSettings() {
    [].forEach.call(document.querySelectorAll('.drawer .seg[data-key]'), function (seg) {
      [].forEach.call(seg.children, function (b) { b.classList.toggle('on', String(settings[seg.dataset.key]) === b.dataset.v); });
    });
    document.body.className = 'size-' + settings.size + (settings.highlight === '1' ? '' : ' nohl');
    $('showErrors').checked = !!settings.showErrors;
    audio.playbackRate = +settings.rate;
  }
  [].forEach.call(document.querySelectorAll('.drawer .seg[data-key]'), function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      settings[seg.dataset.key] = b.dataset.v; save(); renderSettings();
    });
  });
  $('showErrors').addEventListener('change', function () { settings.showErrors = $('showErrors').checked; save(); renderErrors(); });

  /* collapsible panels */
  [].forEach.call(document.querySelectorAll('.panelHead'), function (h) {
    h.addEventListener('click', function () {
      var body = $(h.getAttribute('aria-controls')), open = body.hidden;
      body.hidden = !open; h.setAttribute('aria-expanded', open ? 'true' : 'false');
      h.querySelector('.panelMark').textContent = open ? '▾' : '▸';
    });
  });

  /* ---------- notes for improvement ---------- */
  var NKEY = 'voice.notes', noteFilter = 'open';
  function notes() { try { return JSON.parse(localStorage.getItem(NKEY) || '[]'); } catch (e) { return []; } }
  function saveNotes(n) { try { localStorage.setItem(NKEY, JSON.stringify(n)); return true; } catch (e) { logError('Notes could not be saved on this device.'); return false; } }
  function where() {
    if (!cur) return { page: 'index.html', item: 'home', label: 'Story shelf' };
    var tk = cur.mode === 'read' ? currentTrack() : 'speed ' + settings.wpm + ' wpm';
    return { page: 'index.html', item: cur.story.id + '@v' + cur.story.version, label: cur.story.title + ' · ' + (cur.mode === 'read' ? 'read along' : 'speed read') + ' · ' + tk };
  }
  function updateNoteWhere() { $('noteWhere').textContent = 'About: ' + where().label; }
  function renderNotes() {
    var list = $('noteList'), all = notes();
    [].forEach.call($('noteFilter').children, function (b) { b.classList.toggle('on', b.dataset.f === noteFilter); });
    list.innerHTML = '';
    all.filter(function (n) { return noteFilter === 'all' || n.status === noteFilter; })
      .sort(function (a, b) { return (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || (a.at < b.at ? 1 : -1); })
      .forEach(function (n) {
        var li = document.createElement('li');
        li.innerHTML = '<span></span><small></small>';
        li.querySelector('span').textContent = n.text;
        li.querySelector('small').textContent = n.where.label + ' · ' + new Date(n.at).toLocaleString();
        if (n.status === 'open') {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = '✓ Done';
          b.addEventListener('click', function () { var a = notes(); a.forEach(function (x) { if (x.id === n.id) { x.status = 'done'; x.text = 'Done- ' + x.text; } }); saveNotes(a); renderNotes(); });
          li.appendChild(b);
        }
        list.appendChild(li);
      });
    if (!list.children.length) { var e = document.createElement('li'); e.textContent = 'No notes here yet.'; list.appendChild(e); }
  }
  $('noteSave').addEventListener('click', function () {
    var t = $('noteText').value.trim(); if (!t) return;
    var a = notes();
    a.push({ id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), status: 'open', text: t, where: where(), version: VERSION });
    if (saveNotes(a)) { $('noteText').value = ''; renderNotes(); }
  });
  $('noteCopy').addEventListener('click', function () {
    var s = JSON.stringify(notes(), null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(s).catch(function () { logError('Copy was blocked.'); });
  });
  $('noteFilter').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { noteFilter = b.dataset.f; renderNotes(); } });

  /* ---------- start ---------- */
  if (!STORIES.length) logError('No stories loaded.');
  renderSettings(); renderErrors(); renderHome(); route();
  window.VoiceApp = { version: VERSION, logError: logError };
})();
