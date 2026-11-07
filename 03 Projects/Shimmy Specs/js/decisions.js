// Shimmy Specs — decision records. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};

  // Adds one record to project.decisions and returns it.
  //   fields: { section, qid, chosen, alternatives, reason, sources, kind, by, at }
  function record(project, fields) {
    project.seq = (project.seq || 0) + 1;
    var d = {
      id: 'd-' + String(project.seq).padStart(4, '0'),
      at: fields.at || new Date().toISOString(),
      by: fields.by || 'unnamed',
      section: fields.section,
      qid: fields.qid || null,
      chosen: fields.chosen,
      alternatives: fields.alternatives || [],
      reason: fields.reason || '',
      sources: fields.sources || [],
      kind: fields.kind || 'answer'
    };
    project.decisions = project.decisions || [];
    project.decisions.push(d);
    return d;
  }

  SS.decisions = { record: record };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.decisions;
})(typeof window !== 'undefined' ? window : globalThis);
