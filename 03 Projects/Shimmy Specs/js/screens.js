// Shimmy Specs — screen renderers. Each returns HTML; app.js wires the events.
(function (root) {
  'use strict';
  var SS = root.SS = root.SS || {};
  var ui = SS.ui = SS.ui || {};
  var store = SS.store;

  function needProject() {
    return '<h1>No project open</h1><p>Start a new project, load the sample, or open a saved one on the <a href="#/start">Start</a> page.</p>';
  }

  function shortDate(iso) { return iso ? String(iso).slice(0, 16).replace('T', ' ') : ''; }

  function driverLabel(data, id) {
    var d = data.drivers.drivers.find(function (x) { return x.id === id; });
    return d ? d.label : id;
  }

  function driversPanel(project, data) {
    var set = SS.recommend.drivers(project, data);
    var list = Array.from(set).sort();
    return '<details class="panel"><summary>Drivers now (' + list.length + ')</summary>' +
      (list.length ? '<ul class="plain">' + list.map(function (id) {
        var d = data.drivers.drivers.find(function (x) { return x.id === id; });
        return '<li><strong>' + ui.esc(driverLabel(data, id)) + '</strong>' +
          (d ? ' <span class="muted">' + ui.esc(d.explain) + '</span>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="muted">None yet. Answer the survey.</p>') + '</details>';
  }

  // ---- Start ----------------------------------------------------------------
  function accountCard(ui2) {
    var c = SS.cloud;
    var s = c.session();
    var err = ui2.authError ? '<p class="error-text">' + ui.esc(ui2.authError) + '</p>' : '';
    if (!c.configured()) {
      return '<section class="card account"><h2>Account</h2>' +
        '<p>Database not set up yet, so projects are saved on this device only. To turn on accounts, fill in the two values in <code>index.html</code> (see convo v0.3).</p></section>';
    }
    if (!s) {
      return '<section class="card account"><h2>Account</h2>' +
        '<p class="muted">Sign in to save projects to the database. The first sign-in sets the password (it can be blank for now). There is no password reset. Five wrong passwords lock the account for 15 minutes.</p>' +
        err +
        '<div class="row">' +
        '<label>Username <input id="authUser" type="text" autocomplete="username" maxlength="64" placeholder="any name or email" /></label>' +
        '<label>Password <input id="authPass" type="password" autocomplete="current-password" maxlength="200" placeholder="optional for now" /></label>' +
        '<button class="btn primary" data-act="sign-in">Sign in</button></div></section>';
    }
    var list = '';
    if (ui2.cloudError) list += '<p class="error-text">' + ui.esc(ui2.cloudError) + '</p>';
    if (ui2.cloudList === null) list += '<p class="muted">Loading your projects…</p>';
    else if (!ui2.cloudList.length) list += '<p class="muted">No projects on the account yet. Save one from any project, or create one below.</p>';
    else list += '<ul class="plain rows">' + ui2.cloudList.map(function (x) {
      return '<li><button class="btn small" data-act="cloud-open" data-id="' + ui.esc(x.id) + '">Open</button> ' +
        '<button class="btn small quiet" data-act="cloud-delete" data-id="' + ui.esc(x.id) + '">Delete</button> ' +
        '<strong>' + ui.esc(x.name) + '</strong> <span class="muted">' + ui.esc(x.kind) + ' · ' + shortDate(x.updated_at) + '</span></li>';
    }).join('') + '</ul>';
    return '<section class="card account"><h2>Account</h2>' +
      '<p>Signed in as <strong>' + ui.esc(s.username) + '</strong></p>' +
      '<p><button class="btn small" data-act="sign-out">Sign out</button> ' +
      (store.current ? '<button class="btn small" data-act="cloud-save-now">Save current project to account</button>' : '') + '</p>' +
      '<h3>Your projects on the account</h3>' + list + '</section>';
  }

  function start(ui2) {
    var p = store.current;
    var saved = store.list();
    return '<div class="hero"><h1>Shimmy Specs</h1>' +
      '<p class="lead">Work out which sections a project needs, answer the questions for each one, and keep a record of every decision.</p></div>' +
      accountCard(ui2 || {}) +
      '<section class="card"><h2>New project</h2>' +
      '<div class="row"><label>Name <input id="newName" type="text" placeholder="Sketch: name" /></label> ' +
      '<label>Kind <select id="newKind"><option value="sketch">Sketch / test</option><option value="own">Own project</option></select></label> ' +
      '<button class="btn primary" data-act="new-project">Create</button></div>' +
      '<p class="muted">Office project data never goes here. Use a sketch or your own project.</p></section>' +
      '<section class="card"><h2>Sample</h2><p>A synthetic six-story masonry walk-up, to try the framework.</p>' +
      '<button class="btn" data-act="load-sample">Load sample project</button></section>' +
      '<section class="card"><h2>On this device</h2>' + (saved.length ? '<ul class="plain rows">' + saved.map(function (x) {
        return '<li><button class="btn small" data-act="open-project" data-id="' + ui.esc(x.id) + '">Open</button> ' +
          '<strong>' + ui.esc(x.name) + '</strong> <span class="muted">' + ui.esc(x.kind) + ' · ' + shortDate(x.updated) + '</span></li>';
      }).join('') + '</ul>' : '<p class="muted">No saved projects in this browser yet.</p>') + '</section>' +
      '<section class="card"><h2>Files</h2>' +
      '<label>Open a state file or a project file (JSON) <input type="file" accept=".json,application/json" data-chg="import-file" /></label>' +
      (p ? '<p><button class="btn" data-act="export-state">Export "' + ui.esc(p.name) + '" as JSON</button></p>' : '') +
      '</section>';
  }

  // ---- Import ---------------------------------------------------------------
  function importPage() {
    var p = store.current;
    if (!p) return needProject();
    var hits = p.keywordHits || [];
    var report = p.importReport;
    return '<h1>Import</h1>' +
      '<p class="lead">Paste a text dump (a summary, code notes, a scope list). Keyword hits show the words they matched; accept the ones that are right.</p>' +
      '<section class="card"><h2>Text dump</h2>' +
      '<textarea id="dump" rows="6" placeholder="Paste text here">' + ui.esc(p.textDump || '') + '</textarea>' +
      '<p><button class="btn primary" data-act="read-dump">Read text</button></p>' +
      (hits.length ? '<table class="grid"><thead><tr><th>Hit</th><th>Matched</th><th>Drivers</th><th>Status</th><th></th></tr></thead><tbody>' +
        hits.map(function (h, i) {
          return '<tr class="' + h.status + '"><td>' + ui.esc(h.label) + '</td><td>' + ui.esc(h.matched.join(', ')) + '</td><td>' +
            ui.esc(h.sets.map(function (d) { return driverLabel(SS.store.data, d); }).join(', ')) + '</td><td>' + h.status + '</td><td>' +
            '<button class="btn small" data-act="hit-accept" data-idx="' + i + '">Accept</button> ' +
            '<button class="btn small" data-act="hit-reject" data-idx="' + i + '">Reject</button></td></tr>';
        }).join('') + '</tbody></table>' : '<p class="muted">No hits yet.</p>') + '</section>' +
      '<section class="card"><h2>Keynotes</h2>' +
      '<p class="muted">One per line: <code>07 54 23.A1 | TPO membrane, fully adhered</code></p>' +
      '<textarea id="keynotes" rows="4" data-chg="keynotes">' + ui.esc((p.keynotes || []).map(function (k) { return k.key + ' | ' + k.text; }).join('\n')) + '</textarea></section>' +
      '<section class="card"><h2>Project file</h2>' +
      '<p class="muted">JSON shaped like <code>samples/sketch-project.json</code>. Every key is optional; unknown keys are kept under Extra.</p>' +
      '<input type="file" accept=".json,application/json" data-chg="import-file" />' +
      (report ? '<p>Filled from file: ' + (report.recognized.length ? report.recognized.map(ui.esc).join(', ') : 'nothing') +
        '. Kept as extra: ' + (report.unknown.length ? report.unknown.map(ui.esc).join(', ') : 'nothing') + '.</p>' : '') +
      '</section>';
  }

  // ---- Survey ---------------------------------------------------------------
  function survey() {
    var p = store.current;
    if (!p) return needProject();
    var data = store.data;
    var answers = p.answers || {};
    var body = data.survey.groups.map(function (g) {
      return '<details class="panel" open><summary>' + ui.esc(g.title) + '</summary>' +
        g.questions.map(function (q) {
          var v = answers[q.id];
          var ids = Array.isArray(v) ? v : (v ? [v] : []);
          var type = q.type === 'many' ? 'checkbox' : 'radio';
          return '<fieldset class="q"><legend>' + ui.esc(q.ask) + '</legend>' +
            (q.from && p.importReport && p.importReport.recognized.indexOf(q.from) >= 0 ? '<p class="hint">Filled from import: ' + ui.esc(q.from) + '</p>' : '') +
            q.options.map(function (o) {
              return '<label class="opt"><input type="' + type + '" name="' + q.id + '" value="' + ui.esc(o.id) + '"' +
                (ids.indexOf(o.id) >= 0 ? ' checked' : '') + ' data-chg="survey" data-q="' + q.id + '" data-type="' + q.type + '" /> ' +
                ui.esc(o.label) + (o.sets && o.sets.length ? ' <span class="muted">→ ' + o.sets.map(function (d) { return ui.esc(driverLabel(data, d)); }).join(', ') + '</span>' : '') + '</label>';
            }).join('') + '</fieldset>';
        }).join('') + '</details>';
    }).join('');
    return '<h1>Project survey</h1><p class="lead">These answers set the drivers. Contract variants are labels for now; assume AIA and confirm each one with Jimmy.</p>' +
      driversPanel(p, data) + body;
  }

  // ---- Sections -------------------------------------------------------------
  function sectionsPage() {
    var p = store.current;
    if (!p) return needProject();
    var data = store.data;
    var rows = SS.recommend.recommend(p, data);
    var seen = {};
    rows.forEach(function (r) { seen[r.number] = true; });
    Object.keys(p.sections || {}).forEach(function (n) {
      if (!seen[n]) {
        var entry = SS.recommend.sectionEntry(data, n);
        rows.push({ number: n, title: entry ? entry.title : n, division: n.slice(0, 2), level: 'consider', reasons: [], inLibrary: !!entry });
        seen[n] = true;
      }
    });
    var libraryOptions = data.sections.sections.filter(function (s) { return !seen[s.number] || (p.sections[s.number] || {}).status === 'rejected'; });
    var count = SS.recommend.bookSections(p).length;
    var table = rows.map(function (r) {
      var st = (p.sections[r.number] || {}).status || 'suggested';
      var entry = SS.recommend.sectionEntry(data, r.number);
      var hasTpl = entry && entry.template;
      return '<tr class="' + st + ' ' + ui.divClass(r.number) + '">' +
        '<td class="num">' + ui.esc(r.number) + '</td>' +
        '<td>' + ui.esc(r.title) + (hasTpl ? ' <span class="badge">template</span>' : '') + '</td>' +
        '<td>' + ui.levelBadge(r.level) + '</td>' +
        '<td>' + st + '</td>' +
        '<td><details><summary>' + r.reasons.length + ' reason' + (r.reasons.length === 1 ? '' : 's') + '</summary><ul class="plain">' +
        r.reasons.map(function (x) { return '<li>' + ui.levelBadge(x.level) + ' ' + ui.esc(x.why) + '</li>'; }).join('') + '</ul></details></td>' +
        '<td class="acts">' +
        (st !== 'accepted' && st !== 'added' ? '<button class="btn small" data-act="sec-accept" data-num="' + ui.esc(r.number) + '">Accept</button> ' : '') +
        (st !== 'rejected' ? '<button class="btn small" data-act="sec-reject" data-num="' + ui.esc(r.number) + '">Reject</button> ' : '') +
        (st !== 'suggested' ? '<button class="btn small" data-act="sec-reset" data-num="' + ui.esc(r.number) + '">Reset</button> ' : '') +
        (hasTpl ? '<a class="btn small" href="#/section/' + ui.esc(r.number) + '">Open</a>' : '') +
        '</td></tr>';
    }).join('');
    return '<h1>Sections</h1>' +
      '<p class="lead">Recommended from the drivers. Each row says why. Accept what belongs in the book; rejected rows stay visible with the reason.</p>' +
      driversPanel(p, data) +
      '<p><strong>' + count + '</strong> in the book.</p>' +
      '<table class="grid"><thead><tr><th>Section</th><th>Title</th><th>Level</th><th>Status</th><th>Why</th><th></th></tr></thead><tbody>' +
      (table || '<tr><td colspan="6" class="muted">No recommendations yet. Answer the survey first.</td></tr>') + '</tbody></table>' +
      '<section class="card"><h2>Add from the library</h2>' +
      '<select id="addSec">' + libraryOptions.map(function (s) {
        return '<option value="' + ui.esc(s.number) + '">' + ui.esc(s.number + ' ' + s.title) + '</option>';
      }).join('') + '</select> <button class="btn" data-act="sec-add">Add to book</button></section>';
  }

  // ---- Section workspace ----------------------------------------------------
  function sectionPage(num, ui2) {
    var p = store.current;
    if (!p) return needProject();
    var data = store.data;
    var entry = SS.recommend.sectionEntry(data, num);
    if (!entry) return '<h1>Unknown section ' + ui.esc(num) + '</h1>';
    var tpl = SS.recommend.templateFor(data, num);
    var st = (p.sections[num] || {}).status || 'suggested';
    var head = '<h1>' + ui.esc(num) + ' ' + ui.esc(entry.title) + '</h1>' +
      '<p class="lead">Status: <strong>' + st + '</strong>. ' +
      (st === 'accepted' || st === 'added' ? '' : 'Accept it on the <a href="#/sections">Sections</a> page to put it in the book.') + '</p>';
    if (!tpl) {
      return head + '<section class="card"><p>No template yet. The section has to be written in a 5xx chapter first (see <code>knowledge/index.md</code>), then saved as <code>data/sections/' + ui.esc(num) + '.json</code>.</p></section>';
    }
    var ctx = { drivers: SS.recommend.drivers(p, data), answers: SS.recommend.choicesFor(p, num) };
    var visible = SS.template.visibleQuestions(tpl, ctx);
    var hidden = tpl.questions.length - visible.length;
    var focus = ui2.focus && ui2.focus.num === num ? ui2.focus.qid : (visible[0] && visible[0].id);
    var byPart = {};
    visible.forEach(function (q) { (byPart[q.part] = byPart[q.part] || []).push(q); });
    var questions = Object.keys(byPart).sort().map(function (part) {
      return '<h3>Part ' + part + '</h3>' + byPart[part].map(function (q) {
        var chosen = (ctx.answers || {})[q.id];
        return '<fieldset class="q' + (q.id === focus ? ' focused' : '') + '"><legend>' + ui.esc(q.ask) + ' ' + ui.levelBadge(q.level || 'likely') + '</legend>' +
          q.options.map(function (o) {
            return '<label class="opt" title="' + ui.esc(o.explain) + '"><input type="radio" name="q-' + ui.esc(q.id) + '" value="' + ui.esc(o.id) + '"' +
              (chosen === o.id ? ' checked' : '') + ' data-chg="choice" data-num="' + ui.esc(num) + '" data-q="' + ui.esc(q.id) + '" /> ' +
              ui.esc(o.label) + (o.default ? ' <span class="muted">(default)</span>' : '') + '</label>';
          }).join('') +
          '<input class="reason" type="text" id="reason-' + ui.esc(q.id) + '" placeholder="Why? (saved with the next change to this question)" />' +
          '</fieldset>';
      }).join('');
    }).join('') + (hidden ? '<p class="muted">' + hidden + ' question' + (hidden === 1 ? ' is' : 's are') + ' hidden by earlier answers.</p>' : '');

    var draft = SS.draft.build(tpl, num, ctx, { edits: p.edits });
    var sectionFlags = (p.flags || []).filter(function (f) { return f.section === num && f.status === 'open'; });
    var gutter = sectionFlags.length ? '<div class="gutter">' + sectionFlags.map(function (f) {
      return '<div class="flag ' + f.level + '">' + ui.levelBadge(f.level) + ' ' + ui.esc(f.note) +
        (f.kind === 'edit' ? ' <button class="btn small" data-act="take-new" data-id="' + f.id + '">Take new text</button> <button class="btn small" data-act="keep-edit" data-id="' + f.id + '">Keep my edit</button>' : ' <button class="btn small" data-act="flag-done" data-id="' + f.id + '">Done</button>') + '</div>';
    }).join('') + '</div>' : '';
    var paras = draft.parts.map(function (pt) {
      return '<h3>PART ' + pt.part + ' - ' + ui.esc(pt.title) + '</h3>' + pt.articles.map(function (a) {
        return '<h4>' + ui.esc(a.num) + ' ' + ui.esc(a.title) + '</h4>' + a.paras.map(function (pp) {
          var editing = ui2.editing === pp.key;
          var body;
          if (editing) {
            body = '<textarea id="edit-' + ui.esc(pp.key) + '" rows="3">' + ui.esc(pp.text) + '</textarea> ' +
              '<button class="btn small primary" data-act="save-para" data-key="' + ui.esc(pp.key) + '">Save</button> ' +
              '<button class="btn small" data-act="cancel-edit">Cancel</button> ' +
              (pp.edited ? '<button class="btn small" data-act="revert-para" data-key="' + ui.esc(pp.key) + '">Revert to generated</button>' : '');
          } else if (pp.edited) {
            body = '<span class="edited" title="Hand-edited">' + ui.esc(pp.text) + '</span> ' +
              '<button class="btn small" data-act="edit-para" data-key="' + ui.esc(pp.key) + '">Edit</button>';
          } else {
            body = pp.chips.map(function (c) {
              if (c.text !== undefined) return ui.esc(c.text);
              return '<button class="chip" data-act="focus" data-num="' + ui.esc(num) + '" data-q="' + ui.esc(c.qid) + '" title="' + ui.esc(c.explain) + '">' +
                ui.esc(c.label !== null ? c.label : '[choose: ' + c.ask + ']') + '</button>';
            }).join('') + ' <button class="btn small" data-act="edit-para" data-key="' + ui.esc(pp.key) + '">Edit</button>';
          }
          return '<p class="para lvl' + pp.level + '"><span class="mark">' + ui.esc(pp.mark) + '</span> ' + body + '</p>';
        }).join('');
      }).join('');
    }).join('');

    // Right panel: explanation, perspectives and decisions, in the order the user chose.
    var fq = tpl.questions.find(function (q) { return q.id === focus; });
    var fopt = fq && SS.template.findOption(fq, (ctx.answers || {})[fq.id]);
    var explain = '<p><strong>' + ui.esc(fq ? fq.ask : '') + '</strong></p>' + (fq
      ? (fopt ? '<p>' + ui.esc(fopt.explain) + '</p>' +
        (fopt.impacts && fopt.impacts.length ? '<p class="muted">Impacts: ' + fopt.impacts.map(function (i) { return ui.esc(i.section + ' (' + i.note + ')'); }).join('; ') + '</p>' : '')
        : '<p class="muted">Choose an option to see its explanation.</p>') +
        '<p class="muted">Options: ' + fq.options.map(function (o) { return ui.esc(o.label); }).join(' · ') + '</p>'
      : '<p class="muted">No questions visible.</p>');
    var persp = '<ul class="plain">' + Object.keys(tpl.perspectives || {}).map(function (k) {
      return '<li><strong>' + ui.esc(k) + ':</strong> ' + ui.esc(tpl.perspectives[k] || '—') + '</li>';
    }).join('') + '</ul>';
    var decs = '<ul class="plain">' + (p.decisions || []).filter(function (d) { return d.section === num; }).slice(-8).reverse().map(function (d) {
      return '<li><code>' + ui.esc(d.id) + '</code> ' + ui.esc(d.kind) + ': ' + ui.esc(d.chosen) + (d.reason ? ' — ' + ui.esc(d.reason) : '') + '</li>';
    }).join('') + '</ul>';
    var bodies = { explain: explain, perspectives: persp, decisions: decs };
    var titles = { explain: 'Explanation', perspectives: 'Perspectives', decisions: 'Decisions here' };
    var layout = ui2.layout || SS.layoutDefaults;
    var aside = layout.sideOrder.map(function (k, i) {
      return '<details class="panel" open><summary>' + titles[k] +
        '<span class="mv">' +
        '<button class="btn small" data-act="side-move" data-key="' + k + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move ' + titles[k] + ' up">▲</button>' +
        '<button class="btn small" data-act="side-move" data-key="' + k + '" data-dir="1"' + (i === layout.sideOrder.length - 1 ? ' disabled' : '') + ' aria-label="Move ' + titles[k] + ' down">▼</button>' +
        '</span></summary>' + bodies[k] + '</details>';
    }).join('');

    return '<div class="ws">' + head +
      '<div class="ws-cols' + (layout.sideHidden ? ' side-hidden' : '') + '"><div class="ws-left">' +
      '<h2>Questions</h2>' + questions +
      '<h2>Draft</h2>' + gutter +
      '<div class="draft">' + paras + '</div>' +
      '<details class="panel"><summary>Plain text</summary><pre>' + ui.esc(draft.plain) + '</pre></details>' +
      '</div>' +
      '<div class="splitter" data-splitter role="separator" aria-label="Drag to resize the notes panel" title="Drag to resize"></div>' +
      '<aside class="side">' + aside + '</aside></div></div>';
  }

  // ---- Flags ----------------------------------------------------------------
  function flagsPage(ui2) {
    var p = store.current;
    if (!p) return needProject();
    var f = ui2.flagFilter || 'open';
    var list = (p.flags || []).filter(function (x) {
      if (f === 'all') return true;
      if (f === 'open') return x.status === 'open';
      return x.level === f;
    });
    return '<h1>Flags</h1><p class="lead">Impacts of decisions and hand edits that need a look. <strong>auto</strong> is applied and logged, <strong>review</strong> needs a check, <strong>decision</strong> needs a choice.</p>' +
      '<p>Show: <select data-chg="filter-flags"><option value="open"' + (f === 'open' ? ' selected' : '') + '>Open</option>' +
      '<option value="all"' + (f === 'all' ? ' selected' : '') + '>All</option>' +
      SS.ui.LEVELS.map(function (l) { return '<option value="' + l + '"' + (f === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></p>' +
      '<table class="grid"><thead><tr><th>Level</th><th>Section</th><th>From</th><th>Note</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (x) {
        var acts = x.status !== 'open' ? '' : (x.kind === 'edit'
          ? '<button class="btn small" data-act="take-new" data-id="' + x.id + '">Take new text</button> <button class="btn small" data-act="keep-edit" data-id="' + x.id + '">Keep my edit</button>'
          : '<button class="btn small" data-act="flag-done" data-id="' + x.id + '">Done</button> <button class="btn small" data-act="flag-dismiss" data-id="' + x.id + '">Dismiss</button>');
        return '<tr class="' + x.level + '"><td>' + ui.levelBadge(x.level) + '</td><td class="num"><a href="#/section/' + ui.esc(x.section) + '">' + ui.esc(x.section) + '</a></td><td>' +
          ui.esc(x.from || x.kind) + '</td><td>' + ui.esc(x.note) + '</td><td>' + x.status + '</td><td class="acts">' + acts + '</td></tr>';
      }).join('') : '<tr><td colspan="6" class="muted">Nothing here.</td></tr>') + '</tbody></table>';
  }

  // ---- Decisions ------------------------------------------------------------
  function decisionsPage(ui2) {
    var p = store.current;
    if (!p) return needProject();
    var sec = ui2.decSection || '';
    var kind = ui2.decKind || '';
    var list = (p.decisions || []).filter(function (d) {
      return (!sec || d.section.indexOf(sec) >= 0) && (!kind || d.kind === kind);
    });
    var kinds = Array.from(new Set((p.decisions || []).map(function (d) { return d.kind; }))).sort();
    return '<h1>Decisions</h1><p class="lead">Every choice, with its alternatives and reason. Nothing here is deleted; a changed answer adds a new record.</p>' +
      '<p><input type="text" placeholder="Section (e.g. 07 54)" value="' + ui.esc(sec) + '" data-chg="filter-dec-section" /> ' +
      '<select data-chg="filter-dec-kind"><option value="">All kinds</option>' + kinds.map(function (k) {
        return '<option value="' + ui.esc(k) + '"' + (k === kind ? ' selected' : '') + '>' + ui.esc(k) + '</option>';
      }).join('') + '</select> <button class="btn" data-act="export-decisions">Export decisions (JSON)</button></p>' +
      '<table class="grid"><thead><tr><th>Id</th><th>When</th><th>By</th><th>Section</th><th>Question</th><th>Chosen</th><th>Alternatives</th><th>Reason</th></tr></thead><tbody>' +
      (list.length ? list.slice().reverse().map(function (d) {
        return '<tr><td><code>' + ui.esc(d.id) + '</code></td><td>' + shortDate(d.at) + '</td><td>' + ui.esc(d.by) + '</td><td class="num">' + ui.esc(d.section) +
          '</td><td>' + ui.esc(d.qid || d.kind) + '</td><td>' + ui.esc(d.chosen) + '</td><td>' + ui.esc(d.alternatives.join(', ')) + '</td><td>' + ui.esc(d.reason) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="muted">No decisions yet.</td></tr>') + '</tbody></table>';
  }

  // ---- Outputs --------------------------------------------------------------
  function outputsPage() {
    var p = store.current;
    if (!p) return needProject();
    var data = store.data;
    var show = store.settings().showNotes;
    var texts = {
      ppd: SS.outputs.ppd(p, data, show),
      outline: SS.outputs.outline(p, data, show),
      full: SS.outputs.full(p, data, show)
    };
    var titles = { ppd: 'PPD (by UniFormat element)', outline: 'Outline specification', full: 'Full three-part sections' };
    return '<h1>Outputs</h1><p class="lead">Generated from the book. Notes are hidden unless <em>Show decision notes</em> is on in ⚙️.</p>' +
      Object.keys(texts).map(function (k) {
        return '<details class="panel" open><summary>' + titles[k] + '</summary>' +
          '<p><button class="btn small" data-act="download-output" data-type="' + k + '" data-ext="txt">Download .txt</button> ' +
          '<button class="btn small" data-act="download-output" data-type="' + k + '" data-ext="md">Download .md</button> ' +
          '<button class="btn small" data-act="copy-output" data-type="' + k + '">Copy</button></p>' +
          '<pre>' + ui.esc(texts[k]) + '</pre></details>';
      }).join('');
  }

  SS.screens = {
    start: start,
    import: importPage,
    survey: survey,
    sections: sectionsPage,
    section: sectionPage,
    flags: flagsPage,
    decisions: decisionsPage,
    outputs: outputsPage,
    texts: { needProject: needProject, shortDate: shortDate }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SS.screens;
})(typeof window !== 'undefined' ? window : globalThis);
