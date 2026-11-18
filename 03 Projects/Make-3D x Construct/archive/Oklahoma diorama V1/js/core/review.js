/*
 * Make 3D x Construct: AI review without a server (the nursery's AI JSON loop).
 * The page builds a prompt; Jimmy copies it to any AI chat and pastes the reply back; the reply is
 * validated here before anything is applied. The page never calls an AI service and holds no key.
 * DOM-free. Browser: window.M3DXC.review. Node: module.exports.
 */
(function (root) {
  'use strict';

  var CRITIC_SCHEMA = 'm3dxc.critic-reply/0.1';
  var FACTCHECK_SCHEMA = 'm3dxc.factcheck-reply/0.1';
  var FACT_STATUS = ['supported', 'unsupported', 'unclear'];

  // Finds the reply's JSON: a ```json fence first, then the first balanced {...} among other words.
  function extractJson(text) {
    if (typeof text !== 'string' || text.trim() === '') return { ok: false, error: 'The reply is empty.' };
    var fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    var candidates = [];
    if (fence) candidates.push(fence[1]);
    var start = text.indexOf('{');
    if (start >= 0) {
      var depth = 0, inStr = false, esc = false;
      for (var i = start; i < text.length; i++) {
        var c = text[i];
        if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
        if (c === '"') inStr = true;
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { candidates.push(text.slice(start, i + 1)); break; } }
      }
    }
    for (var j = 0; j < candidates.length; j++) {
      try { return { ok: true, value: JSON.parse(candidates[j]) }; } catch (e) { /* try the next */ }
    }
    return { ok: false, error: 'No JSON object could be read. The reply starts: "' + text.trim().slice(0, 200) + '"' };
  }

  // ----- round critic -----

  // The packet is the only input. The critic answers A or B (which one is better) and scores the current version.
  function buildCriticPrompt(packet) {
    return [
      'You are an art critic judging two renders of one 3-D model: A and B. Judge only what you can see.',
      'Compare the two versions on each criterion. Choose the better one overall, or "tie".',
      'Score the version you judged each criterion from 0 (missing) to 3 (no visible defect).',
      'Reply with one JSON object inside a ```json fence, and change nothing else.',
      'Shape: {"schema": "' + CRITIC_SCHEMA + '", "better": "A" | "B" | "tie", "scores": {' +
        packet.criteria.map(function (c) { return '"' + c + '": 0-3'; }).join(', ') + '}, "reasons": "one or two sentences"}',
      'The packet (renders are attached separately; the open defects are listed for you to check):',
      '```json',
      JSON.stringify(packet, null, 2),
      '```'
    ].join('\n');
  }

  // Maps the critic's A/B choice to the run's verdict using the packet's candidate labels.
  function parseCriticReply(text, packet) {
    var got = extractJson(text);
    if (!got.ok) return { ok: false, errors: [got.error] };
    var r = got.value, errors = [];
    if (r.schema !== CRITIC_SCHEMA) errors.push('schema must be "' + CRITIC_SCHEMA + '"');
    if (['A', 'B', 'tie'].indexOf(r.better) < 0) errors.push('better must be "A", "B" or "tie"');
    if (!r.scores || typeof r.scores !== 'object') errors.push('scores is missing');
    else packet.criteria.forEach(function (k) {
      var v = r.scores[k];
      if (!(Number.isInteger(v) && v >= 0 && v <= 3)) errors.push('score for ' + k + ' must be a whole number from 0 to 3');
    });
    if (errors.length) return { ok: false, errors: errors };
    var verdict = 'tie';
    if (r.better !== 'tie') {
      var chosen = packet.candidates[r.better];
      verdict = chosen === 'current' ? 'won' : 'lost';
    }
    return { ok: true, verdict: verdict, scores: r.scores, reasons: typeof r.reasons === 'string' ? r.reasons : '' };
  }

  // ----- story fact-check -----

  function buildFactcheckPrompt(story) {
    var claims = [];
    story.steps.forEach(function (s) { (s.claims || []).forEach(function (c) { claims.push({ id: c.id, text: c.text }); }); });
    return [
      'You are checking historical claims for a museum-style draft about a Southern Cheyenne camp move in the 1870s, Indian Territory.',
      'For each claim, say whether it is supported by what you know, unsupported, or unclear. Mark unclear where you are not sure.',
      'Do not invent sources. Name a source only if you are sure it exists.',
      'Reply with one JSON object inside a ```json fence, and change nothing else.',
      'Shape: {"schema": "' + FACTCHECK_SCHEMA + '", "claims": [{"id": "claim id", "status": "supported" | "unsupported" | "unclear", "note": "one sentence"}]}',
      '```json',
      JSON.stringify({ claims: claims }, null, 2),
      '```'
    ].join('\n');
  }

  function parseFactcheckReply(text, story) {
    var got = extractJson(text);
    if (!got.ok) return { ok: false, errors: [got.error] };
    var r = got.value, errors = [];
    var ids = [];
    story.steps.forEach(function (s) { (s.claims || []).forEach(function (c) { ids.push(c.id); }); });
    if (r.schema !== FACTCHECK_SCHEMA) errors.push('schema must be "' + FACTCHECK_SCHEMA + '"');
    if (!Array.isArray(r.claims)) errors.push('claims must be a list');
    else {
      var seen = {};
      r.claims.forEach(function (c, i) {
        if (ids.indexOf(c.id) < 0) errors.push('claims[' + i + ']: no claim with id ' + c.id);
        if (FACT_STATUS.indexOf(c.status) < 0) errors.push('claims[' + i + ']: status must be supported, unsupported or unclear');
        if (c.note !== undefined && typeof c.note !== 'string') errors.push('claims[' + i + ']: note must be text');
        if (seen[c.id]) errors.push('claims[' + i + ']: ' + c.id + ' is listed twice');
        seen[c.id] = true;
      });
      ids.forEach(function (id) { if (!seen[id]) errors.push('claim ' + id + ' is missing from the reply'); });
    }
    if (errors.length) return { ok: false, errors: errors };
    return { ok: true, claims: r.claims.map(function (c) { return { id: c.id, status: c.status, note: c.note || '' }; }) };
  }

  var api = {
    CRITIC_SCHEMA: CRITIC_SCHEMA, FACTCHECK_SCHEMA: FACTCHECK_SCHEMA, FACT_STATUS: FACT_STATUS,
    extractJson: extractJson, buildCriticPrompt: buildCriticPrompt, parseCriticReply: parseCriticReply,
    buildFactcheckPrompt: buildFactcheckPrompt, parseFactcheckReply: parseFactcheckReply
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { review: api });
})(typeof globalThis !== 'undefined' ? globalThis : this);
