// Shimmy Specs — builds the three-part draft (PageFormat numbering). No DOM.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var PART_TITLES = { 1: 'GENERAL', 2: 'PRODUCTS', 3: 'EXECUTION' };
  var TOKEN = /\[\[([\w-]+)\]\]/g;

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function letter(n, upper) { return String.fromCharCode((upper ? 64 : 96) + n) + '.'; }

  // FNV-1a, 32-bit, as hex. Used to tell whether generated text changed.
  function hash(text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  // Splits paragraph text into plain runs and bracket choices.
  function chipsFor(text, tpl, ctx) {
    var parts = [];
    var last = 0;
    var m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(text))) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index) });
      var q = tpl.questions.find(function (x) { return x.id === m[1]; });
      var opt = q && SS.template.findOption(q, ctx.answers[q.id]);
      parts.push({
        qid: m[1],
        label: opt ? opt.label : null,
        explain: opt ? opt.explain : '',
        ask: q ? q.ask : m[1]
      });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
  }

  function plainOf(chips) {
    return chips.map(function (c) {
      if (c.text !== undefined) return c.text;
      return c.label !== null ? c.label : '[to choose: ' + c.ask + ']';
    }).join('');
  }

  // build(tpl, number, title, ctx, opts)
  //   ctx: { drivers: Set, answers: { qid: optionId } }
  //   opts: { edits: { 'number/key': {text, basedOn, original} } }
  // Hidden paragraphs and empty articles are dropped before numbering,
  // so numbering never has gaps.
  function build(tpl, number, ctx, opts) {
    var edits = (opts && opts.edits) || {};
    var out = { number: number, title: tpl.title, parts: [], plain: '', stale: [] };
    var lines = ['SECTION ' + number + ' - ' + tpl.title.toUpperCase(), ''];
    tpl.parts.forEach(function (part) {
      if (!SS.template.evalWhen(part.when, ctx)) return;
      var partOut = { part: part.part, title: PART_TITLES[part.part] || '', articles: [] };
      var articleNo = 0;
      part.articles.forEach(function (art, ai) {
        if (!SS.template.evalWhen(art.when, ctx)) return;
        var paras = [];
        var counters = [0, 0, 0, 0];
        art.paragraphs.forEach(function (p, pi) {
          if (!SS.template.evalWhen(p.when, ctx)) return;
          var level = p.level || 1;
          for (var k = level + 1; k <= 3; k++) counters[k] = 0;
          counters[level]++;
          var mark = level === 1 ? letter(counters[1], true)
            : level === 2 ? counters[2] + '.'
            : letter(counters[3], false);
          var key = part.part + '.' + ai + '.' + pi;
          var chips = chipsFor(p.text, tpl, ctx);
          var generated = plainOf(chips);
          var fullKey = number + '/' + key;
          var edit = edits[fullKey];
          var text = generated;
          var edited = false;
          var stale = false;
          if (edit) {
            text = edit.text;
            edited = true;
            stale = edit.basedOn !== hash(generated);
            if (stale) out.stale.push({ key: key, original: edit.original, generated: generated, edit: edit.text });
          }
          paras.push({
            key: key, level: level, mark: mark, chips: chips, generated: generated,
            text: text, edited: edited, stale: stale, outline: !!p.outline
          });
        });
        if (!paras.length) return;
        articleNo++;
        partOut.articles.push({
          num: part.part + '.' + pad2(articleNo),
          title: art.title,
          paras: paras
        });
      });
      if (partOut.articles.length) out.parts.push(partOut);
    });
    out.parts.forEach(function (pt) {
      lines.push('PART ' + pt.part + ' - ' + pt.title);
      pt.articles.forEach(function (a) {
        lines.push(a.num + ' ' + a.title);
        a.paras.forEach(function (p) {
          var indent = p.level === 1 ? '  ' : p.level === 2 ? '     ' : '        ';
          lines.push(indent + p.mark + ' ' + p.text);
        });
      });
      lines.push('');
    });
    lines.push('END OF SECTION ' + number);
    out.plain = lines.join('\n');
    return out;
  }

  // Outline output: only paragraphs marked outline, in order.
  function outlineLines(draft) {
    var lines = [];
    draft.parts.forEach(function (pt) {
      pt.articles.forEach(function (a) {
        var keep = a.paras.filter(function (p) { return p.outline; });
        if (!keep.length) return;
        lines.push(a.num + ' ' + a.title);
        keep.forEach(function (p) { lines.push('  ' + p.mark + ' ' + p.text); });
      });
    });
    return lines;
  }

  SS.draft = { build: build, hash: hash, plainOf: plainOf, outlineLines: outlineLines, chipsFor: chipsFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.draft;
})(typeof window !== 'undefined' ? window : globalThis);
