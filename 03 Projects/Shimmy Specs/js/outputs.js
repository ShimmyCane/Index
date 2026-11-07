// Shimmy Specs — PPD, outline and full outputs. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};

  function sectionDraft(project, data, num) {
    var tpl = SS.recommend.templateFor(data, num);
    if (!tpl) return null;
    var ctx = { drivers: SS.recommend.drivers(project, data), answers: SS.recommend.choicesFor(project, num) };
    return SS.draft.build(tpl, num, ctx, { edits: project.edits });
  }

  function decisionNotes(project, num) {
    return (project.decisions || [])
      .filter(function (d) { return d.section === num && d.reason; })
      .map(function (d) { return '[Note ' + d.id + ' by ' + d.by + ': ' + d.reason + ']'; });
  }

  function bookList(project, data) {
    return SS.recommend.bookSections(project).map(function (s) {
      var entry = SS.recommend.sectionEntry(data, s.number);
      return { number: s.number, title: entry ? entry.title : s.number, entry: entry };
    });
  }

  // PPD: accepted sections grouped by UniFormat element, with the chosen answers.
  function ppd(project, data, showNotes) {
    var groups = {};
    bookList(project, data).forEach(function (s) {
      var code = s.entry && s.entry.uniformat ? s.entry.uniformat[0] : 'Unassigned';
      (groups[code] = groups[code] || []).push(s);
    });
    var lines = ['PRELIMINARY PROJECT DESCRIPTION - ' + (project.name || 'Untitled'), ''];
    Object.keys(groups).sort().forEach(function (code) {
      var el = (data.uniformat.elements || []).find(function (e) { return e.code === code; });
      lines.push(code === 'Unassigned' ? 'Unassigned' : code + ' ' + (el ? el.title : ''));
      groups[code].forEach(function (s) {
        lines.push('  ' + s.number + ' ' + s.title);
        var tpl = SS.recommend.templateFor(data, s.number);
        if (tpl) {
          var choices = SS.recommend.choicesFor(project, s.number);
          tpl.questions.forEach(function (q) {
            var opt = SS.template.findOption(q, choices[q.id]);
            if (opt) lines.push('    - ' + q.ask + ': ' + opt.label);
          });
        }
        if (showNotes) decisionNotes(project, s.number).forEach(function (n) { lines.push('    ' + n); });
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  function outline(project, data, showNotes) {
    var lines = ['OUTLINE SPECIFICATION - ' + (project.name || 'Untitled'), ''];
    bookList(project, data).forEach(function (s) {
      var d = sectionDraft(project, data, s.number);
      if (!d) return;
      lines.push('SECTION ' + s.number + ' - ' + d.title.toUpperCase());
      lines = lines.concat(SS.draft.outlineLines(d).map(function (l) { return '  ' + l; }));
      if (showNotes) decisionNotes(project, s.number).forEach(function (n) { lines.push('  ' + n); });
      lines.push('');
    });
    return lines.join('\n');
  }

  function full(project, data, showNotes) {
    var out = [];
    bookList(project, data).forEach(function (s) {
      var d = sectionDraft(project, data, s.number);
      if (!d) {
        out.push('SECTION ' + s.number + ' - ' + s.title.toUpperCase() + '\n[No template yet.]\n');
        return;
      }
      out.push(d.plain);
      if (showNotes) decisionNotes(project, s.number).forEach(function (n) { out.push(n); });
      out.push('');
    });
    return out.join('\n');
  }

  SS.outputs = { ppd: ppd, outline: outline, full: full };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.outputs;
})(typeof window !== 'undefined' ? window : globalThis);
