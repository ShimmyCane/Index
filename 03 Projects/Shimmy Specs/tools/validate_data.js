// Checks every data file: parses, ids exist where referenced, regex compiles,
// template questions and paragraph refs line up, and the bundle is up to date.
// Usage: node tools/validate_data.js   (exit code 1 on any error)
'use strict';
const fs = require('fs');
const path = require('path');
const { buildBundle, ROOT } = require('./bundle_data');

const errors = [];
const err = (m) => errors.push(m);
const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const drivers = readJSON('data/drivers.json').drivers;
const driverIds = new Set(drivers.map((d) => d.id));
const dupes = drivers.map((d) => d.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) err('duplicate driver ids: ' + dupes.join(', '));

const survey = readJSON('data/survey.json');
const surveyQ = new Set();
survey.groups.forEach((g) => g.questions.forEach((q) => {
  surveyQ.add(q.id);
  q.options.forEach((o) => (o.sets || []).forEach((d) => driverIds.has(d) || err(`survey ${q.id}.${o.id} sets unknown driver ${d}`)));
}));

const keywords = readJSON('data/keywords.json');
keywords.rules.forEach((r) => {
  try { new RegExp(r.pattern, 'i'); } catch (e) { err(`keyword "${r.label}" regex: ${e.message}`); }
  r.sets.forEach((d) => driverIds.has(d) || err(`keyword "${r.label}" sets unknown driver ${d}`));
});

const uni = readJSON('data/uniformat.json').elements.map((e) => e.code);
const index = readJSON('data/sections/index.json').sections;
const sectionNums = new Set(index.map((s) => s.number));
if (sectionNums.size !== index.length) err('duplicate section numbers in index');
index.forEach((s) => {
  if (s.uniformat && !s.uniformat.every((c) => uni.includes(c))) err(`section ${s.number} uniformat not in uniformat.json`);
  if (s.template && !fs.existsSync(path.join(ROOT, 'data/sections', s.template))) err(`section ${s.number} template file missing: ${s.template}`);
});

function checkWhen(when, where, qids) {
  if (!when) return;
  ['all', 'any', 'not'].forEach((k) => (when[k] || []).forEach((t) => {
    const eq = t.indexOf('=');
    if (eq > 0) {
      if (!qids.has(t.slice(0, eq))) err(`${where}: when refers to unknown question ${t}`);
    } else if (!driverIds.has(t)) err(`${where}: when refers to unknown driver ${t}`);
  }));
}

const rules = readJSON('data/rules.json').rules;
const levels = ['required', 'likely', 'consider', 'unlikely'];
rules.forEach((r) => {
  if (!sectionNums.has(r.section)) err(`rule section not in index: ${r.section}`);
  if (!levels.includes(r.level)) err(`rule ${r.section}: bad level ${r.level}`);
  checkWhen(r.when, `rule ${r.section}`, new Set());
});

index.filter((s) => s.template).forEach((s) => {
  const tpl = readJSON('data/sections/' + s.template);
  const qids = new Set();
  tpl.questions.forEach((q) => {
    if (qids.has(q.id)) err(`${s.number}: duplicate question ${q.id}`);
    qids.add(q.id);
  });
  tpl.questions.forEach((q) => {
    const optIds = new Set();
    q.options.forEach((o) => {
      if (optIds.has(o.id)) err(`${s.number}.${q.id}: duplicate option ${o.id}`);
      optIds.add(o.id);
      (o.sets || []).forEach((d) => driverIds.has(d) || err(`${s.number}.${q.id}.${o.id} sets unknown driver ${d}`));
      (o.impacts || []).forEach((i) => sectionNums.has(i.section) || err(`${s.number}.${q.id}.${o.id} impact on unknown section ${i.section}`));
    });
    (q.impacts || []).forEach((i) => sectionNums.has(i.section) || err(`${s.number}.${q.id} impact on unknown section ${i.section}`));
    checkWhen(q.when, `${s.number}.${q.id}`, qids);
  });
  tpl.parts.forEach((pt) => pt.articles.forEach((a) => {
    checkWhen(a.when, `${s.number} article ${a.title}`, qids);
    a.paragraphs.forEach((p) => {
      checkWhen(p.when, `${s.number} paragraph`, qids);
      (p.text.match(/\[\[([\w-]+)\]\]/g) || []).forEach((tok) => {
        const id = tok.slice(2, -2);
        if (!qids.has(id)) err(`${s.number}: paragraph refers to unknown question ${id}`);
      });
    });
  }));
});

const bundlePath = path.join(ROOT, 'js/data.bundle.js');
const bundleNow = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, 'utf8') : '';
if (bundleNow !== buildBundle()) err('js/data.bundle.js is stale: run node tools/bundle_data.js');

if (errors.length) {
  console.error(errors.map((e) => 'ERROR ' + e).join('\n'));
  console.error(`${errors.length} error(s)`);
  process.exit(1);
}
console.log(`data ok: ${drivers.length} drivers, ${index.length} sections, ${rules.length} rules`);
