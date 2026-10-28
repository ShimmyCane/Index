// Shimmy Specs — drivers from answers, and the section recommender. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var LEVEL_RANK = { required: 0, likely: 1, consider: 2, unlikely: 3 };
  var MAX_PASSES = 10;

  function sectionEntry(data, number) {
    return data.sections.sections.find(function (s) { return s.number === number; }) || null;
  }

  function templateFor(data, number) {
    var entry = sectionEntry(data, number);
    if (!entry || !entry.template) return null;
    return (data.templates && data.templates[entry.template]) || null;
  }

  // Chosen answers for a section, keyed by question id.
  function choicesFor(project, number) {
    return (project.choices && project.choices[number]) || {};
  }

  // Every driver the project has: survey answers, accepted text hits, and
  // options chosen in book sections (cascading until nothing new appears).
  function drivers(project, data) {
    var set = new Set();
    var answers = project.answers || {};
    data.survey.groups.forEach(function (g) {
      g.questions.forEach(function (q) {
        var v = answers[q.id];
        var ids = Array.isArray(v) ? v : (v ? [v] : []);
        q.options.forEach(function (o) {
          if (ids.indexOf(o.id) >= 0) (o.sets || []).forEach(function (d) { set.add(d); });
        });
      });
    });
    (project.keywordHits || []).forEach(function (h) {
      if (h.status === 'accepted') h.sets.forEach(function (d) { set.add(d); });
    });
    var bookNumbers = bookSections(project).map(function (s) { return s.number; });
    for (var pass = 0; pass < MAX_PASSES; pass++) {
      var before = set.size;
      bookNumbers.forEach(function (num) {
        var tpl = templateFor(data, num);
        if (!tpl) return;
        SS.template.templateSets(tpl, choicesFor(project, num), set).forEach(function (d) { set.add(d); });
      });
      if (set.size === before) return set;
    }
    if (SS.errors) SS.errors.log(new Error('Driver cascade did not settle in ' + MAX_PASSES + ' passes'));
    return set;
  }

  // Sections the user has accepted or added to the book.
  function bookSections(project) {
    var sections = project.sections || {};
    return Object.keys(sections)
      .filter(function (n) { return sections[n].status === 'accepted' || sections[n].status === 'added'; })
      .map(function (n) { return { number: n, status: sections[n].status }; })
      .sort(function (a, b) { return a.number < b.number ? -1 : 1; });
  }

  function keynoteNumber(key) {
    var m = /^(\d{2} \d{2} \d{2})/.exec(key || '');
    return m ? m[1] : null;
  }

  // Recommendations: one row per section, with its best level and every reason.
  function recommend(project, data) {
    var set = drivers(project, data);
    var ctx = { drivers: set, answers: {} };
    var rows = {};
    function row(number) {
      if (!rows[number]) {
        var entry = sectionEntry(data, number);
        rows[number] = {
          number: number,
          title: entry ? entry.title : number,
          division: number.slice(0, 2),
          level: 'unlikely',
          reasons: [],
          inLibrary: !!entry
        };
      }
      return rows[number];
    }
    data.rules.rules.forEach(function (r) {
      if (!SS.template.evalWhen(r.when, ctx)) return;
      var rw = row(r.section);
      rw.reasons.push({ level: r.level, why: r.why });
      if (LEVEL_RANK[r.level] < LEVEL_RANK[rw.level]) rw.level = r.level;
    });
    (project.keynotes || []).forEach(function (k) {
      var num = keynoteNumber(k.key);
      if (!num) return;
      var rw = row(num);
      rw.reasons.push({ level: 'required', why: 'Keynote ' + k.key + ': ' + k.text });
      rw.level = 'required';
    });
    return Object.keys(rows).map(function (n) { return rows[n]; }).sort(function (a, b) {
      return (LEVEL_RANK[a.level] - LEVEL_RANK[b.level]) || (a.number < b.number ? -1 : 1);
    });
  }

  SS.recommend = {
    drivers: drivers,
    recommend: recommend,
    bookSections: bookSections,
    templateFor: templateFor,
    sectionEntry: sectionEntry,
    choicesFor: choicesFor,
    keynoteNumber: keynoteNumber,
    LEVEL_RANK: LEVEL_RANK
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.recommend;
})(typeof window !== 'undefined' ? window : globalThis);
