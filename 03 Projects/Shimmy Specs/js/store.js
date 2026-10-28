// Shimmy Specs — state, localStorage, JSON export/import, and the actions that change a project.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var INDEX_KEY = 'ss.projects';
  var SETTINGS_KEY = 'ss.settings';
  var CURRENT_KEY = 'ss.current';
  var SAVE_DELAY = 500;
  var saveTimer = null;

  function safeGet(key, fallback) {
    try {
      var raw = root.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      if (SS.errors) SS.errors.log(e);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (SS.errors) SS.errors.log(e);
      return false;
    }
  }

  var DEFAULT_SETTINGS = { name: '', theme: 'auto', showNotes: false, showErrors: false };

  function newProject(name, kind) {
    var now = new Date().toISOString();
    return {
      format: 'shimmy-state/1',
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name || 'Untitled sketch',
      kind: kind || 'sketch',
      created: now,
      updated: now,
      seq: 0,
      answers: {},
      choices: {},
      sections: {},
      keynotes: [],
      textDump: '',
      keywordHits: [],
      decisions: [],
      flags: [],
      edits: {},
      extra: {},
      importReport: null
    };
  }

  var store = {
    current: null,
    data: null,

    settings: function () {
      return Object.assign({}, DEFAULT_SETTINGS, safeGet(SETTINGS_KEY, {}));
    },
    setSetting: function (key, value) {
      var s = this.settings();
      s[key] = value;
      safeSet(SETTINGS_KEY, s);
    },

    list: function () {
      return safeGet(INDEX_KEY, []);
    },

    create: function (name, kind) {
      this.current = newProject(name, kind);
      this.saveNow();
      return this.current;
    },

    open: function (id) {
      var p = safeGet('ss.project.' + id, null);
      if (p) this.current = p;
      return this.current;
    },

    // Debounced autosave; flush() writes immediately.
    save: function () {
      if (!this.current) return;
      if (saveTimer) root.clearTimeout(saveTimer);
      saveTimer = root.setTimeout(function () { store.saveNow(); }, SAVE_DELAY);
    },

    saveNow: function () {
      if (!this.current) return;
      if (saveTimer) { root.clearTimeout(saveTimer); saveTimer = null; }
      var p = this.current;
      p.updated = new Date().toISOString();
      safeSet('ss.project.' + p.id, p);
      var list = this.list().filter(function (x) { return x.id !== p.id; });
      list.unshift({ id: p.id, name: p.name, kind: p.kind, updated: p.updated });
      safeSet(INDEX_KEY, list.slice(0, 50));
      safeSet(CURRENT_KEY, p.id);
    },

    // Reopens the project that was open when the page was last used.
    resume: function () {
      var id = safeGet(CURRENT_KEY, null);
      if (id && !this.current) this.open(id);
      return this.current;
    },

    exportState: function () {
      return JSON.stringify(this.current, null, 2);
    },

    // Restores a full state file as a new project (new id, so it never overwrites).
    restoreState: function (obj) {
      if (!obj || obj.format !== 'shimmy-state/1' || !obj.id) throw new Error('Not a Shimmy Specs state file');
      obj.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      this.current = obj;
      this.saveNow();
      return obj;
    },

    touch: function () {
      SS.flags.reconcile(this.current, this.data);
      this.save();
    },

    // --- actions -----------------------------------------------------------

    setSurvey: function (qid, value) {
      var p = this.current;
      p.answers = p.answers || {};
      if (value === undefined || (Array.isArray(value) && !value.length)) delete p.answers[qid];
      else p.answers[qid] = value;
      this.touch();
    },

    setKeynotes: function (text) {
      this.current.keynotes = String(text || '').split('\n')
        .map(function (line) {
          var parts = line.split('|');
          return { key: (parts[0] || '').trim(), text: (parts.slice(1).join('|') || '').trim() };
        })
        .filter(function (k) { return k.key; });
      this.touch();
    },

    setTextDump: function (text) {
      this.current.textDump = text;
      this.save();
    },

    setHitStatus: function (idx, status) {
      var hit = this.current.keywordHits[idx];
      if (!hit) return;
      hit.status = status;
      SS.decisions.record(this.current, {
        section: 'project', chosen: hit.label, kind: status === 'accepted' ? 'driver-accept' : 'driver-reject',
        by: this.settings().name || 'unnamed', reason: 'Text hit: ' + hit.matched.join(', ')
      });
      this.touch();
    },

    // Keeps the text hits from the dump, replacing old hits with new ones.
    readDump: function (text) {
      var old = {};
      (this.current.keywordHits || []).forEach(function (h) { old[h.label] = h.status; });
      this.current.textDump = text;
      this.current.keywordHits = SS.importer.textHits(text, this.data).map(function (h) {
        h.status = old[h.label] || 'open';
        return h;
      });
      this.touch();
    },

    setSection: function (number, status, reason) {
      var p = this.current;
      p.sections = p.sections || {};
      var kind = { accepted: 'section-accept', rejected: 'section-reject', added: 'section-add', reset: 'section-reset' }[status];
      if (status === 'reset') delete p.sections[number];
      else p.sections[number] = { status: status, reason: reason || '', at: new Date().toISOString() };
      SS.decisions.record(p, {
        section: number, kind: kind, chosen: status === 'reset' ? 'suggested' : status,
        reason: reason || '', by: this.settings().name || 'unnamed'
      });
      this.touch();
    },

    // Answers a question in a section. A changed answer is a decision; its impacts raise flags.
    setChoice: function (number, qid, optionId, reason) {
      var p = this.current;
      var tpl = SS.recommend.templateFor(this.data, number);
      if (!tpl) return null;
      var q = tpl.questions.find(function (x) { return x.id === qid; });
      var opt = q && SS.template.findOption(q, optionId);
      if (!opt) return null;
      p.choices = p.choices || {};
      p.choices[number] = p.choices[number] || {};
      var old = p.choices[number][qid];
      if (old === optionId && !reason) return null;
      p.choices[number][qid] = optionId;
      var alternatives = q.options.filter(function (o) { return o.id !== optionId; }).map(function (o) { return o.id; });
      var d = SS.decisions.record(p, {
        section: number, qid: qid, chosen: optionId, alternatives: alternatives,
        reason: reason || '', by: this.settings().name || 'unnamed', kind: 'answer', sources: opt.sources || []
      });
      SS.flags.supersede(p, number, qid);
      SS.flags.raiseForDecision(p, d, opt, q);
      this.touch();
      return d;
    },

    // Saves a hand edit. The current generated text is stored so later changes can be detected.
    setEdit: function (number, key, text) {
      var generated = this.generatedFor(number, key);
      if (generated === null) return;
      var p = this.current;
      p.edits = p.edits || {};
      p.edits[number + '/' + key] = {
        text: text,
        original: generated,
        basedOn: SS.draft.hash(generated),
        at: new Date().toISOString()
      };
      this.touch();
    },

    revertEdit: function (number, key) {
      delete this.current.edits[number + '/' + key];
      this.touch();
    },

    // Keeps the hand edit and marks the new generated text as seen.
    acknowledgeEdit: function (number, key) {
      var edit = this.current.edits[number + '/' + key];
      var generated = this.generatedFor(number, key);
      if (!edit || generated === null) return;
      edit.original = generated;
      edit.basedOn = SS.draft.hash(generated);
      this.touch();
    },

    generatedFor: function (number, key) {
      var tpl = SS.recommend.templateFor(this.data, number);
      if (!tpl) return null;
      var ctx = { drivers: SS.recommend.drivers(this.current, this.data), answers: SS.recommend.choicesFor(this.current, number) };
      var d = SS.draft.build(tpl, number, ctx, {});
      var hit = null;
      d.parts.forEach(function (pt) { pt.articles.forEach(function (a) { a.paras.forEach(function (p) { if (p.key === key) hit = p.generated; }); }); });
      return hit;
    },

    resolveFlag: function (id, status, note) {
      var f = (this.current.flags || []).find(function (x) { return x.id === id; });
      if (!f) return;
      f.status = status;
      f.resolution = note || '';
      if (f.kind === 'edit' && f.section) {
        var key = String(f.key).split('|')[2];
        if (status === 'dismissed') this.acknowledgeEdit(f.section, key);
      }
      SS.decisions.record(this.current, {
        section: f.section, kind: 'flag-' + status, chosen: f.id, reason: note || '', by: this.settings().name || 'unnamed'
      });
      this.touch();
    }
  };

  SS.store = store;
  if (typeof module !== 'undefined' && module.exports) module.exports = store;
})(typeof window !== 'undefined' ? window : globalThis);
