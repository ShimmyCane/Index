// Expansion Wars — saved maps, progress and high scores.
// Everything lives in this browser's localStorage for now. The Family Supabase
// table (xw_maps, see supabase/001_xw_maps.sql) replaces the map records later,
// behind the same functions.
window.XWStore = (function () {
  'use strict';

  var MAPS_KEY = 'xw_maps_v1';
  var PROGRESS_KEY = 'xw_progress_v1';
  var SCORES_KEY = 'xw_scores_v1';
  var LEVEL_COUNT = 4;
  var lastError = null;

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      lastError = 'Saved data could not be read: ' + e.message;
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      lastError = 'Saved data could not be written: ' + e.message;
      return false;
    }
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- saved maps ----------

  function list() { return readJSON(MAPS_KEY, []); }

  function add(rec) {
    var maps = list();
    rec.id = rec.id || uid();
    rec.created_at = rec.created_at || new Date().toISOString();
    rec.updated_at = rec.created_at;
    maps.push(rec);
    writeJSON(MAPS_KEY, maps);
    return rec;
  }

  // Apply fn to one record and save it. Returns the updated record or null.
  function update(id, fn) {
    var maps = list();
    for (var i = 0; i < maps.length; i++) {
      if (maps[i].id === id) {
        fn(maps[i]);
        maps[i].updated_at = new Date().toISOString();
        writeJSON(MAPS_KEY, maps);
        return maps[i];
      }
    }
    return null;
  }

  function recordGame(id, won) {
    return update(id, function (r) {
      r.times_played = (r.times_played || 0) + 1;
      if (won) r.wins = (r.wins || 0) + 1;
      else r.losses = (r.losses || 0) + 1;
    });
  }

  function addNote(id, text) {
    return update(id, function (r) {
      r.notes = r.notes || [];
      r.notes.push({ at: new Date().toISOString(), text: String(text).slice(0, 500) });
    });
  }

  function setRank(id, stars) {
    return update(id, function (r) { r.rank = stars; });
  }

  function winRate(r) {
    return r.times_played ? Math.round(100 * r.wins / r.times_played) : null;
  }

  // ---------- progression ----------
  // progress = { completed: { "1": { stars, bestScore, bestSeconds, wins } } }

  function progress() { return readJSON(PROGRESS_KEY, { completed: {} }); }

  function levelStatus(level) {
    var p = progress();
    if (p.completed[String(level)]) return 'done';
    if (level === 1) return 'open';
    return p.completed[String(level - 1)] ? 'open' : 'locked';
  }

  // Highest level the player may start now.
  function highestOpen() {
    var best = 1;
    for (var lvl = 1; lvl <= LEVEL_COUNT; lvl++) {
      if (levelStatus(lvl) !== 'locked') best = lvl;
    }
    return best;
  }

  function starsFor(seconds) {
    if (seconds <= 90) return 3;
    if (seconds <= 180) return 2;
    return 1;
  }

  // Record a win on a level. Returns the level entry.
  function completeLevel(level, seconds, score) {
    var p = progress();
    var key = String(level);
    var prev = p.completed[key] || { stars: 0, bestScore: 0, bestSeconds: null, wins: 0 };
    var stars = starsFor(seconds);
    p.completed[key] = {
      stars: Math.max(prev.stars, stars),
      bestScore: Math.max(prev.bestScore, score),
      bestSeconds: prev.bestSeconds === null ? seconds : Math.min(prev.bestSeconds, seconds),
      wins: prev.wins + 1
    };
    writeJSON(PROGRESS_KEY, p);
    return p.completed[key];
  }

  // ---------- high scores ----------

  function scores() { return readJSON(SCORES_KEY, []); }

  function addScore(entry) {
    var list = scores();
    list.push({ score: entry.score, level: entry.level, seconds: entry.seconds, at: new Date().toISOString() });
    list.sort(function (a, b) { return b.score - a.score; });
    list = list.slice(0, 10);
    writeJSON(SCORES_KEY, list);
    return list;
  }

  function lastErr() { return lastError; }

  return {
    LEVEL_COUNT: LEVEL_COUNT,
    list: list,
    add: add,
    update: update,
    recordGame: recordGame,
    addNote: addNote,
    setRank: setRank,
    winRate: winRate,
    uid: uid,
    progress: progress,
    levelStatus: levelStatus,
    highestOpen: highestOpen,
    completeLevel: completeLevel,
    scores: scores,
    addScore: addScore,
    lastError: lastErr
  };
})();
