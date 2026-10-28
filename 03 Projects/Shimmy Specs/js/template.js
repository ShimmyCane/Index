// Shimmy Specs — conditions, option sets, cascades. No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};

  // A "when" token is either a driver id ("occupied") or "question=option" ("thk=080").
  function tokenTrue(tok, ctx) {
    var eq = tok.indexOf('=');
    if (eq > 0) return ctx.answers[tok.slice(0, eq)] === tok.slice(eq + 1);
    return ctx.drivers.has(tok);
  }

  function evalWhen(when, ctx) {
    if (!when) return true;
    if (when.all && !when.all.every(function (t) { return tokenTrue(t, ctx); })) return false;
    if (when.any && when.any.length && !when.any.some(function (t) { return tokenTrue(t, ctx); })) return false;
    if (when.not && when.not.some(function (t) { return tokenTrue(t, ctx); })) return false;
    return true;
  }

  function findOption(question, optionId) {
    for (var i = 0; i < question.options.length; i++) {
      if (question.options[i].id === optionId) return question.options[i];
    }
    return null;
  }

  // Questions of a template that are visible for the given context.
  function visibleQuestions(tpl, ctx) {
    return tpl.questions.filter(function (q) { return evalWhen(q.when, ctx); });
  }

  // Drivers a template's chosen options add (only visible questions count).
  function templateSets(tpl, choices, drivers) {
    var out = [];
    var ctx = { drivers: drivers, answers: choices || {} };
    visibleQuestions(tpl, ctx).forEach(function (q) {
      var opt = choices && findOption(q, choices[q.id]);
      if (opt && opt.sets) opt.sets.forEach(function (d) { out.push(d); });
    });
    return out;
  }

  SS.template = {
    evalWhen: evalWhen,
    findOption: findOption,
    visibleQuestions: visibleQuestions,
    templateSets: templateSets
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.template;
})(typeof window !== 'undefined' ? window : globalThis);
