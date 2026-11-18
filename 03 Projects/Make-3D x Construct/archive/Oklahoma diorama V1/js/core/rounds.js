/*
 * Make 3D x Construct: the rounds loop (Construct's masterpiece rounds, in plain JS).
 * DOM-free. Browser: window.M3DXC.rounds. Node: module.exports.
 *
 * A run keeps a ledger of defects. Each round works at most `max_items_per_round` ledger items,
 * and every change names the item it works. A round is judged against the best version kept so far:
 * won = keep it (it becomes the best); lost or tie = the best stays, and the next round tries a different fix.
 * The run stops after `stop_after_no_win` rounds in a row without a win, or when every criterion
 * reaches the top score. There is no time cap; a round cap is off unless set.
 *
 * Judgement comes from a person (Jimmy, from the packet's renders) or later from a model critic.
 * This module only records the verdict; it never decides what "won" means by itself.
 */
(function (root) {
  'use strict';

  var SCHEMA = 'm3dxc.rounds/0.1';
  var PACKET_SCHEMA = 'm3dxc.packet/0.1';
  var VERDICTS = ['won', 'lost', 'tie'];
  var SEVERITIES = ['critical', 'major', 'minor'];
  var STATUSES = ['open', 'fixed', 'regressed', 'known-limit'];
  var MAX_ITEMS_DEFAULT = 4;
  var STOP_NO_WIN_DEFAULT = 2;
  var NO_PROGRESS_FOR_LIMIT = 3;   // a defect worked this many times without a win becomes a known limit

  function createRun(opts) {
    opts = opts || {};
    var criteria = opts.criteria || ['silhouette', 'proportion', 'identity', 'finish'];
    var settings = {
      max_items_per_round: MAX_ITEMS_DEFAULT,
      stop_after_no_win: STOP_NO_WIN_DEFAULT,
      criteria_top: 3
    };
    if (opts.round_cap) settings.round_cap = opts.round_cap; // off unless the author sets it
    return {
      schema: SCHEMA,
      subject: opts.subject || 'make-3d-x-construct',
      criteria: criteria,
      settings: settings,
      ledger: [],
      rounds: [],
      best_round: 0,
      no_win: 0,
      status: 'running',
      stop_reason: null
    };
  }

  function nextId(run) { return 'D' + (run.ledger.length + 1); }

  function addDefect(run, item) {
    var errors = [];
    if (!item || typeof item.title !== 'string' || item.title.trim() === '') errors.push('a defect needs a title');
    if (run.criteria.indexOf(item && item.criterion) < 0) errors.push('criterion must be one of: ' + run.criteria.join(', '));
    if (SEVERITIES.indexOf(item && item.severity) < 0) errors.push('severity must be one of: ' + SEVERITIES.join(', '));
    if (errors.length) return { ok: false, errors: errors };
    var entry = {
      id: nextId(run),
      title: item.title.trim(),
      criterion: item.criterion,
      severity: item.severity,
      status: 'open',
      first_round: run.rounds.length + 1,
      attempts: 0
    };
    run.ledger.push(entry);
    return { ok: true, id: entry.id, run: run };
  }

  function findItem(run, id) {
    for (var i = 0; i < run.ledger.length; i++) if (run.ledger[i].id === id) return run.ledger[i];
    return null;
  }

  // Records one round's verdict. Returns { ok, errors } without changing the run when the round is refused.
  function recordRound(run, round) {
    var errors = [];
    if (run.status !== 'running') errors.push('the run has stopped: ' + run.stop_reason);
    if (!round || VERDICTS.indexOf(round.verdict) < 0) errors.push('verdict must be won, lost or tie');
    var changes = (round && round.changes) || [];
    var ids = [];
    changes.forEach(function (c) { if (ids.indexOf(c.ledger_id) < 0) ids.push(c.ledger_id); });
    if (round && round.scores !== undefined && round.scores !== null) {
      run.criteria.forEach(function (k) {
        var v = round.scores[k];
        if (!(Number.isInteger(v) && v >= 0 && v <= 3)) errors.push('score for ' + k + ' must be a whole number from 0 to 3');
      });
    }
    if (ids.length > run.settings.max_items_per_round) {
      errors.push('at most ' + run.settings.max_items_per_round + ' ledger items per round (this round has ' + ids.length +
        '); check the round in first, then work the rest');
    }
    ids.forEach(function (id) {
      var item = findItem(run, id);
      if (!item) errors.push('no ledger item ' + id);
      else if (item.status === 'known-limit') errors.push(id + ' is a known limit and is not worked again');
    });
    changes.forEach(function (c) {
      if (typeof c.text !== 'string' || c.text.trim() === '') errors.push('each change needs a text saying what changed');
    });
    if (errors.length) return { ok: false, errors: errors };

    var number = run.rounds.length + 1;
    var won = round.verdict === 'won';

    ids.forEach(function (id) {
      var item = findItem(run, id);
      item.attempts += 1;
      if (won) {
        item.status = 'fixed';
      } else {
        item.status = 'open';
        if (item.attempts >= NO_PROGRESS_FOR_LIMIT) item.status = 'known-limit';
      }
    });

    run.rounds.push({
      round: number,
      verdict: round.verdict,
      kept: won,
      changes: changes.map(function (c) { return { ledger_id: c.ledger_id, text: c.text.trim() }; }),
      scores: round.scores || null,
      note: round.note || ''
    });

    if (won) { run.best_round = number; run.no_win = 0; }
    else { run.no_win += 1; }

    var reason = null;
    if (run.no_win >= run.settings.stop_after_no_win) {
      reason = run.settings.stop_after_no_win + ' rounds in a row did not beat the best';
    } else if (round.scores && run.criteria.every(function (k) {
      return round.scores[k] >= run.settings.criteria_top;
    })) {
      reason = 'every criterion is at the top score';
    } else if (run.settings.round_cap && run.rounds.length >= run.settings.round_cap) {
      reason = 'the round cap of ' + run.settings.round_cap + ' was reached';
    }
    if (reason) { run.status = 'stopped'; run.stop_reason = reason; }
    return { ok: true, run: run, stopped: run.status === 'stopped', reason: run.stop_reason };
  }

  function stop(run, reason) {
    run.status = 'stopped';
    run.stop_reason = reason || 'stopped by the author';
    return run;
  }

  function openItems(run) {
    return run.ledger.filter(function (i) { return i.status === 'open' || i.status === 'regressed'; });
  }

  // The packet for one critic (or for Jimmy): the renders, the request and the open defects.
  // It never carries the round history, the notes or the author's reasons. Which version is A and
  // which is B is set by a fixed rule, so the same round always gives the same packet.
  function buildPacket(run, opts) {
    opts = opts || {};
    var number = run.rounds.length + 1;
    // A fixed, seed-free rule: the same round number always puts the current version in the same slot.
    var sum = ('round' + number).split('').reduce(function (a, c) { return (a + c.charCodeAt(0)) % 997; }, 0);
    var currentIsA = sum % 2 === 0;
    return {
      schema: PACKET_SCHEMA,
      round: number,
      request: opts.request || '',
      views: opts.views || ['front', 'side', 'top', 'oblique'],
      candidates: currentIsA ? { A: 'current', B: 'best' } : { A: 'best', B: 'current' },
      best_round: run.best_round,
      criteria: run.criteria.slice(),
      open_defects: openItems(run).map(function (i) {
        return { id: i.id, title: i.title, criterion: i.criterion, severity: i.severity };
      })
    };
  }

  function report(run) {
    var lines = [];
    lines.push('Rounds: ' + run.rounds.length + ' · best round ' + (run.best_round || 'none') + ' · status ' + run.status +
      (run.stop_reason ? ' (' + run.stop_reason + ')' : ''));
    run.rounds.forEach(function (r) {
      lines.push('Round ' + r.round + ': ' + r.verdict + (r.kept ? ' (kept)' : ' (reverted)') + ' · ' +
        r.changes.map(function (c) { return c.ledger_id + ' ' + c.text; }).join('; '));
    });
    var known = run.ledger.filter(function (i) { return i.status === 'known-limit'; });
    if (known.length) lines.push('Known limits: ' + known.map(function (i) { return i.id + ' ' + i.title; }).join('; '));
    return lines.join('\n');
  }

  var api = {
    SCHEMA: SCHEMA, PACKET_SCHEMA: PACKET_SCHEMA, VERDICTS: VERDICTS, SEVERITIES: SEVERITIES, STATUSES: STATUSES,
    createRun: createRun, addDefect: addDefect, recordRound: recordRound, stop: stop,
    openItems: openItems, buildPacket: buildPacket, report: report
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { rounds: api });
})(typeof globalThis !== 'undefined' ? globalThis : this);
