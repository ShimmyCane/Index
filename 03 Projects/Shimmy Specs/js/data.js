// Shimmy Specs — loads the data files. Uses fetch over HTTP; falls back to js/data.bundle.js (file:// or failed fetch).
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var BASE = 'data/';

  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }

  function fromBundle() {
    if (!root.SS_DATA) throw new Error('No data bundle (js/data.bundle.js). Run node tools/bundle_data.js.');
    return Object.assign({}, root.SS_DATA, { source: 'bundle' });
  }

  function load() {
    if (!root.fetch || (root.location && root.location.protocol === 'file:')) {
      return Promise.resolve(fromBundle());
    }
    return Promise.all([
      getJSON(BASE + 'drivers.json'),
      getJSON(BASE + 'survey.json'),
      getJSON(BASE + 'keywords.json'),
      getJSON(BASE + 'rules.json'),
      getJSON(BASE + 'uniformat.json'),
      getJSON(BASE + 'sections/index.json'),
      getJSON('samples/sketch-project.json')
    ]).then(function (all) {
      var data = {
        drivers: all[0], survey: all[1], keywords: all[2], rules: all[3],
        uniformat: all[4], sections: all[5], sample: all[6], templates: {}, source: 'fetch'
      };
      var files = {};
      data.sections.sections.forEach(function (s) { if (s.template) files[s.template] = true; });
      return Promise.all(Object.keys(files).map(function (f) {
        return getJSON(BASE + 'sections/' + f).then(function (t) { data.templates[f] = t; });
      })).then(function () { return data; });
    }).catch(function (err) {
      if (SS.errors) SS.errors.log(err);
      return fromBundle();
    });
  }

  SS.data = { load: load };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.data;
})(typeof window !== 'undefined' ? window : globalThis);
