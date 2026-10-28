// Shimmy Specs — text dump and project-file import. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};

  // Keyword hits from a text dump. Each hit keeps the matched words.
  function textHits(text, data) {
    var hits = [];
    data.keywords.rules.forEach(function (r) {
      var re = new RegExp(r.pattern, 'gi');
      var m;
      var found = [];
      while ((m = re.exec(text || ''))) {
        found.push(m[0]);
        if (m[0].length === 0) re.lastIndex++;
      }
      if (found.length) {
        hits.push({ label: r.label, sets: r.sets.slice(), matched: Array.from(new Set(found)), status: 'open' });
      }
    });
    return hits;
  }

  // Survey value for an import value. Option ids are matched as they are.
  function surveyValue(q, raw) {
    if (q.type === 'many') {
      var list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      return list.filter(function (v) { return q.options.some(function (o) { return o.id === v; }); });
    }
    if (typeof raw === 'boolean') raw = raw ? 'yes' : 'no';
    if (raw === undefined || raw === null || raw === '') return undefined;
    return q.options.some(function (o) { return o.id === String(raw); }) ? String(raw) : undefined;
  }

  // Maps a project file onto the project. Known keys fill answers; unknown keys go to extra.
  function applyFile(project, obj, data) {
    var known = ['format', 'kind', 'name', 'summary', 'code', 'contract', 'repair_types', 'keynotes', 'text_dump', 'extra'];
    var recognized = [];
    var unknown = [];
    var fieldPaths = {
      'summary.scope': 'scope', 'summary.occupied': 'occupied', 'summary.use': 'use',
      'code.construction_type': 'construction_type', 'code.sprinklered': 'sprinklered',
      'contract.family': 'contract_family', 'contract.agreement': 'contract_variant',
      'contract.delivery': 'delivery', 'repair_types': 'repair_types'
    };
    var qById = {};
    data.survey.groups.forEach(function (g) { g.questions.forEach(function (q) { qById[q.id] = q; }); });
    Object.keys(fieldPaths).forEach(function (path) {
      var raw = path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
      if (raw === undefined) return;
      var qid = fieldPaths[path];
      var v = surveyValue(qById[qid], raw);
      if (v !== undefined && !(Array.isArray(v) && !v.length)) {
        project.answers = project.answers || {};
        project.answers[qid] = v;
        recognized.push(path);
      }
    });
    if (Array.isArray(obj.keynotes)) {
      project.keynotes = obj.keynotes.filter(function (k) { return k && k.key; });
      recognized.push('keynotes');
    }
    if (typeof obj.text_dump === 'string') { project.textDump = obj.text_dump; recognized.push('text_dump'); }
    if (typeof obj.name === 'string' && obj.name) { project.name = obj.name; recognized.push('name'); }
    Object.keys(obj).forEach(function (k) {
      if (known.indexOf(k) < 0) unknown.push(k);
    });
    project.extra = Object.assign({}, project.extra || {}, obj.extra || {});
    unknown.forEach(function (k) { project.extra[k] = obj[k]; });
    project.importReport = { recognized: recognized, unknown: unknown, at: new Date().toISOString() };
    return project.importReport;
  }

  SS.importer = { textHits: textHits, applyFile: applyFile, surveyValue: surveyValue };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.importer;
})(typeof window !== 'undefined' ? window : globalThis);
