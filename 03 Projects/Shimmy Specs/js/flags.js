// Shimmy Specs — flags (auto / review / decision), raised from decisions and edits. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var LEVELS = ['auto', 'review', 'decision'];

  function raise(project, f) {
    project.flags = project.flags || [];
    var exists = project.flags.some(function (x) { return x.key === f.key && x.status === 'open'; });
    if (exists) return null;
    project.seq = (project.seq || 0) + 1;
    var flag = {
      id: 'f-' + String(project.seq).padStart(4, '0'),
      key: f.key,
      level: LEVELS.indexOf(f.level) >= 0 ? f.level : 'review',
      section: f.section,
      source: f.source || null,
      qid: f.qid || null,
      kind: f.kind || 'impact',
      from: f.from || null,
      note: f.note,
      detail: f.detail || null,
      status: 'open',
      at: new Date().toISOString()
    };
    project.flags.push(flag);
    return flag;
  }

  // Impacts of a chosen option and of its question. Impacts on sections not in the book are "decision".
  function raiseForDecision(project, decision, option, question) {
    var inBook = function (num) {
      var s = (project.sections || {})[num];
      return !!s && (s.status === 'accepted' || s.status === 'added');
    };
    var impacts = (question.impacts || []).concat(option.impacts || []);
    impacts.forEach(function (imp) {
      var book = inBook(imp.section);
      raise(project, {
        key: 'impact|' + decision.id + '|' + imp.section,
        level: book ? (imp.level || 'review') : 'decision',
        section: imp.section,
        source: decision.section,
        qid: question.id,
        from: decision.id,
        note: imp.note + (book ? '' : ' (section not in the book yet)')
      });
    });
  }

  // A new answer to the same question replaces the open impact flags for it.
  function supersede(project, section, qid) {
    (project.flags || []).forEach(function (f) {
      if (f.status === 'open' && f.kind === 'impact' && f.source === section && f.qid === qid) {
        f.status = 'superseded';
      }
    });
  }

  // Hand edits whose generated text changed raise one review flag each.
  function reconcile(project, data) {
    var DRAFT = SS.draft;
    Object.keys(project.sections || {}).forEach(function (num) {
      var st = project.sections[num].status;
      if (st !== 'accepted' && st !== 'added') return;
      var tpl = SS.recommend.templateFor(data, num);
      if (!tpl) return;
      var ctx = { drivers: SS.recommend.drivers(project, data), answers: SS.recommend.choicesFor(project, num) };
      var draft = DRAFT.build(tpl, num, ctx, { edits: project.edits });
      draft.stale.forEach(function (s) {
        raise(project, {
          key: 'edit|' + num + '|' + s.key + '|' + DRAFT.hash(s.generated),
          level: 'review',
          section: num,
          source: num,
          kind: 'edit',
          note: 'Generated text changed under a hand edit. Keep the edit or take the new text.',
          detail: { original: s.original, generated: s.generated, edit: s.edit }
        });
      });
    });
  }

  SS.flags = { raise: raise, raiseForDecision: raiseForDecision, supersede: supersede, reconcile: reconcile, LEVELS: LEVELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.flags;
})(typeof window !== 'undefined' ? window : globalThis);
