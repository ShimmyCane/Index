// Growth model: the generic "world" a story is written in, and the time models that run it.
// Pure JavaScript, no DOM, so it runs in the browser (Growth page, Increment Viewer) and in plain Node (tests/).
//
// A world is one JSON-like object with six parts, in the order Jimmy describes them:
//   kind          growth, decay or collaboration
//   seed          1. the starting object or place, and the things in it
//   environment   2. the environmental variables (name, value, unit, what it does)
//   time          3. how time works: the unit, the number of increments, the plain-words rules, the model
//   steps         4. what happens at each increment (written by the AI or by hand)
//   outputs       5. where to look at it (Increment Viewer, 3-D page)
// A time model turns the world into a state for every increment, so numbers follow from the rules.
//   "ecosystem"  plants, rabbits, hawks and coyotes, season by season (computed from the variables)
//   "recorded"   the numbers were recorded from a simulation run (for example Paper Again)
// New models are added to MODELS. Nothing else changes.

(function (root) {
  'use strict';

  var KINDS = ['growth', 'decay', 'collaboration'];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function slug(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'item';
  }

  // Environment variables with numbers, by id.
  function varsOf(world) {
    var out = {};
    ((world.environment && world.environment.variables) || []).forEach(function (v) {
      var n = Number(v.value);
      if (v.value !== '' && v.value !== null && isFinite(n)) out[v.id] = n;
    });
    return out;
  }

  function entityStart(world, id, dflt) {
    var list = (world.seed && world.seed.entities) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) { var n = Number(list[i].start); return isFinite(n) ? n : dflt; }
    return dflt;
  }

  function pick(vars, id, dflt) { return (id in vars) ? vars[id] : dflt; }

  // ------------------------------------------------------------------ time models

  // Rabbits on a hillside. One increment is one season.
  //   plants grow back each season, rabbits eat them, rabbits breed when they are fed,
  //   hawks settle when there are enough rabbits, coyotes when there are many.
  // Everything is a fixed formula, so the same variables always give the same story.
  function ecosystem(world) {
    var v = world.environment ? varsOf(world) : {};
    var cal = (world.time && world.time.calendar) || {};
    var seasons = cal.seasons && cal.seasons.length ? cal.seasons : [{ id: 'season', name: 'Season', breed: 1, grow: 1 }];
    var startSeason = cal.start || 0;
    var n = world.time.increments;

    var K = pick(v, 'carry_plants', 1200);
    var regrow = pick(v, 'plant_regrow', 0.9);
    var seedBank = pick(v, 'plant_seed_bank', 25);
    var eat = pick(v, 'eat_per_rabbit', 4);
    var litter = pick(v, 'litter_size', 5);
    var litters = pick(v, 'litters_per_season', 1.5);
    var kitSurvival = pick(v, 'kit_survival', 0.55);
    var mortality = pick(v, 'adult_mortality', 0.12);
    var starve = pick(v, 'starvation_rate', 0.8);
    var roots = pick(v, 'plant_roots', 0.12);    // share of the plants that survive grazing as roots and regrow
    var altFood = pick(v, 'alt_food', 0.3);      // share of a rabbit's food it can find as bark and roots
    var refuge = pick(v, 'refuge', 4);           // rabbits that always survive in deep burrows
    var hawkStart = pick(v, 'hawk_start', 15), hawkPer = pick(v, 'hawk_per_rabbits', 25), hawkMax = pick(v, 'hawk_max', 6), hawkEats = pick(v, 'hawk_eats', 10);
    var coyStart = pick(v, 'coyote_start', 120), coyPer = pick(v, 'coyote_per_rabbits', 60), coyMax = pick(v, 'coyote_max', 4), coyEats = pick(v, 'coyote_eats', 28);

    var R = entityStart(world, 'rabbits', 2);
    var P = entityStart(world, 'plants', K);   // plant units on the hillside
    var states = [];

    function snapshot(i, extra) {
      var s = {
        step: i,
        rabbits: Math.round(R), plants: Math.round(P), plants_pct: Math.round(100 * P / K),
        hawks: 0, coyotes: 0, burrows: Math.max(1, Math.ceil(R / 8)),
        landscape: landscapeWord(P / K)
      };
      for (var k in extra) s[k] = extra[k];
      return s;
    }
    states.push(snapshot(0, { time: 'Start', season: seasons[startSeason % seasons.length].name, year: 1, births: 0, deaths: 0, eaten_by_predators: 0 }));

    for (var i = 1; i <= n; i++) {
      var idx = (startSeason + i - 1) % seasons.length;
      var season = seasons[idx];
      var year = Math.floor((startSeason + i - 1) / seasons.length) + 1;

      // Predators follow the rabbits they saw last season.
      var hawks = R > hawkStart ? Math.min(hawkMax, Math.ceil((R - hawkStart) / hawkPer)) : 0;
      var coyotes = R > coyStart ? Math.min(coyMax, Math.ceil((R - coyStart) / coyPer)) : 0;
      var killedH = Math.min(0.5 * R, hawks * hawkEats);
      var killedC = Math.min(0.6 * R - killedH, coyotes * coyEats);
      if (killedC < 0) killedC = 0;
      // Predators cannot reach the rabbits in the deepest burrows.
      var reachable = Math.max(0, R - refuge);
      if (killedH + killedC > reachable) {
        var f = (killedH + killedC) > 0 ? reachable / (killedH + killedC) : 0;
        killedH *= f; killedC *= f;
      }

      // Food: rabbits eat what the plants allow.
      var wanted = R * eat;
      var eaten = Math.min(wanted, Math.max(0, P - roots * K));
      var fed = wanted > 0 ? Math.min(1, eaten / wanted + altFood) : 1;

      // Births and deaths.
      var births = (R / 2) * litters * season.breed * litter * kitSurvival * fed;
      var natural = mortality * R;
      var starving = (1 - fed) * starve * R;
      var deaths = natural + starving;

      var R2 = Math.max(Math.min(R, refuge), R + births - deaths - killedH - killedC);

      // Plants grow back, faster in the growing seasons.
      var Pbase = Math.max(P - eaten, roots * K);
      var Pgrown = (P - eaten) + regrow * season.grow * Pbase * (1 - Pbase / K) + seedBank * season.grow;
      P = Math.min(K, Math.max(0, Pgrown));
      R = R2;

      var st = snapshot(i, {
        time: season.name + ', year ' + year, season: season.name, year: year,
        hawks: hawks, coyotes: coyotes,
        births: Math.round(births), deaths: Math.round(deaths), eaten_by_predators: Math.round(killedH + killedC)
      });
      states.push(st);
    }
    return states;
  }

  function landscapeWord(frac) {
    if (frac >= 0.8) return 'lush';
    if (frac >= 0.55) return 'grazed';
    if (frac >= 0.3) return 'thinning';
    if (frac >= 0.1) return 'patchy';
    return 'barren';
  }

  // Numbers recorded from a simulation run (for example Paper Again). The state is written in the step.
  function recorded(world) {
    var states = [];
    var start = { step: 0, time: 'Start' };
    ((world.seed && world.seed.entities) || []).forEach(function (e) { start[e.id] = Number(e.start); });
    states.push(start);
    for (var i = 1; i <= world.time.increments; i++) {
      var step = world.steps[i - 1] || {};
      var st = { step: i, time: 'Increment ' + i };
      var rec = step.state || {};
      for (var k in rec) st[k] = rec[k];
      states.push(st);
    }
    return states;
  }

  var MODELS = { ecosystem: ecosystem, recorded: recorded };

  // ------------------------------------------------------------------ the world

  // Problems with a world, in plain words. An empty list means it can be used.
  function validate(world) {
    var p = [];
    if (!world || typeof world !== 'object') return ['The world is empty.'];
    if (world.schema !== 2) p.push('schema should be 2.');
    if (!/^[a-z0-9_]+$/.test(world.id || '')) p.push('id should be letters, digits and underscores only.');
    if (!world.title) p.push('The world needs a title.');
    if (KINDS.indexOf(world.kind) < 0) p.push('kind should be growth, decay or collaboration.');
    if (!world.seed || typeof world.seed.prompt !== 'string') p.push('The seed needs a prompt (what we start with).');
    if (!world.seed || !Array.isArray(world.seed.entities)) p.push('The seed needs a list of things.');
    if (!world.environment || !Array.isArray(world.environment.variables)) p.push('The environment needs a list of variables.');
    var t = world.time;
    if (!t || !t.unit) p.push('Time needs a unit (for example season).');
    if (!t || !(t.increments >= 1 && t.increments <= 60 && t.increments === Math.floor(t.increments))) p.push('Time needs a whole number of increments from 1 to 60.');
    if (!t || !t.model || !MODELS[t.model.type]) p.push('Time needs a model: ' + Object.keys(MODELS).join(' or ') + '.');
    if (!Array.isArray(world.steps)) p.push('The world needs a list of steps.');
    else if (t && world.steps.length !== t.increments) p.push('There are ' + world.steps.length + ' steps but ' + t.increments + ' increments.');
    return p;
  }

  function compute(world) {
    var m = MODELS[world.time.model.type];
    if (!m) throw new Error('Unknown time model: ' + world.time.model.type);
    return { type: world.time.model.type, states: m(world) };
  }

  // Put the numbers into text: {rabbits}, {plants_pct}, {season}, {year}, {step}, {landscape}.
  // An unknown name stays as written, so a typo is easy to spot.
  function resolveText(text, state) {
    return String(text == null ? '' : text).replace(/\{([a-z0-9_]+)\}/gi, function (m, key) {
      return (state && key in state) ? String(state[key]) : m;
    });
  }

  // A rule in plain words, with the variable values put in: "more than {hawk_start} rabbits" reads "more than 35 rabbits".
  function ruleText(world, text) { return resolveText(text, varsOf(world)); }

  // Series for the chart: each line scaled to its own highest value.
  function chartData(world, computed) {
    var list = world.chart || [];
    var labels = computed.states.map(function (s) { return s.step; });
    return {
      labels: labels,
      series: list.map(function (c) {
        var values = computed.states.map(function (s) { return Number(s[c.key]) || 0; });
        return { key: c.key, name: c.name, color: c.color, values: values, max: Math.max.apply(null, values) };
      })
    };
  }

  // Plain-words reading of the chart, with the current numbers worked out.
  function describeSeries(world, computed) {
    var data = chartData(world, computed);
    var out = [];
    data.series.forEach(function (s) {
      if (s.max === 0) { out.push(s.name + ' never appear.'); return; }
      var first = s.values[0], last = s.values[s.values.length - 1], peakAt = s.values.indexOf(s.max);
      var firstSeen = -1;
      for (var i = 0; i < s.values.length; i++) if (s.values[i] > 0) { firstSeen = i; break; }
      var line = s.name + ': ' + (first === 0 && firstSeen > 0 ? 'first seen at step ' + firstSeen + ', ' : 'start at ' + first + ', ');
      line += 'highest at ' + s.max + ' in step ' + peakAt + ', and end at ' + last + '.';
      out.push(line);
    });
    return out;
  }

  // ------------------------------------------------------------------ the AI loop (copy a prompt, paste the reply)

  function buildPrompt(world) {
    var computed = compute(world);
    var L = [];
    L.push('I am planning a world simulation as a story. Help me write the steps.');
    L.push('Kind of change: ' + world.kind + '.');
    L.push('');
    L.push('1. WHAT WE START WITH');
    L.push(world.seed.prompt);
    (world.seed.entities || []).forEach(function (e) {
      L.push('- ' + e.name + ': starts at ' + e.start + (e.unit ? ' ' + e.unit : '') + (e.note ? ' (' + e.note + ')' : ''));
    });
    L.push('');
    L.push('2. THE ENVIRONMENT AND ITS VARIABLES');
    if (world.environment.prompt) L.push(world.environment.prompt);
    world.environment.variables.forEach(function (v) {
      L.push('- ' + v.name + ' = ' + v.value + (v.unit ? ' ' + v.unit : '') + (v.note ? ' (' + v.note + ')' : ''));
    });
    L.push('');
    L.push('3. HOW TIME WORKS');
    L.push('One increment is ' + world.time.unit + '. There are ' + world.time.increments + ' increments.' + (world.time.perStep ? ' ' + world.time.perStep : ''));
    (world.time.rules || []).forEach(function (r) { L.push('- ' + ruleText(world, r)); });
    if ((world.time.notModelled || []).length) {
      L.push('Not modelled yet (do not invent numbers for these):');
      world.time.notModelled.forEach(function (r) { L.push('- ' + r); });
    }
    L.push('Time model: ' + world.time.model.type + (world.time.model.type === 'ecosystem' ? ' (the numbers below are computed from the variables, so write the story to match them)' : ' (the numbers below were recorded from a run)') + '.');
    L.push('');
    L.push('NUMBERS FOR EACH STEP');
    var keys = (world.chart || []).map(function (c) { return c.key; });
    computed.states.forEach(function (s) {
      L.push('step ' + s.step + ' (' + s.time + '): ' + keys.map(function (k) { return k + ' ' + s[k]; }).join(', ') + (s.landscape ? ', plants ' + s.landscape : ''));
    });
    L.push('');
    var have = world.steps.filter(function (s) { return s.narrative; });
    if (have.length) {
      L.push('STEPS SO FAR (revise them if you see problems)');
      world.steps.forEach(function (s, i) { L.push((i + 1) + '. ' + s.label + ': ' + s.narrative); });
      L.push('');
    }
    L.push('WHAT I WANT');
    L.push('Write or revise the ' + world.time.increments + ' steps. For each step give: label (short), narrative (two to four plain sentences), events (short phrases), landscape (one sentence on how the place looks).');
    L.push('In the narrative you may use {names} for numbers, such as {rabbits}, {hawks}, {plants_pct}, {season}, {year}, so the text stays true when I change a variable.');
    L.push('Ask me a question first if the rules are unclear or two rules disagree.');
    L.push('Reply with JSON only, in this shape:');
    L.push('{"steps":[{"label":"","narrative":"","events":[""],"landscape":""}]}');
    return L.join('\n');
  }

  // Read an AI reply: plain JSON, or JSON inside a code fence or surrounded by words.
  function parseReply(text) {
    var s = String(text || '').trim();
    var fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    var arrA = s.indexOf('['), arrB = s.lastIndexOf(']');
    var data;
    try {
      if (a >= 0 && b > a && (arrA < 0 || a < arrA)) data = JSON.parse(s.slice(a, b + 1));
      else if (arrA >= 0 && arrB > arrA) data = JSON.parse(s.slice(arrA, arrB + 1));
      else throw new Error('no JSON found');
    } catch (e) {
      throw new Error('That does not read as JSON. Ask the AI to reply with JSON only.');
    }
    var steps = Array.isArray(data) ? data : data.steps;
    if (!Array.isArray(steps) || steps.length === 0) throw new Error('The reply has no steps. Expected {"steps":[...]}.');
    return steps.map(function (s, i) {
      if (!s || typeof s.narrative !== 'string' || !s.narrative.trim()) throw new Error('Step ' + (i + 1) + ' has no narrative.');
      return {
        label: String(s.label || ('Step ' + (i + 1))),
        narrative: s.narrative,
        events: Array.isArray(s.events) ? s.events.map(String) : [],
        landscape: s.landscape ? String(s.landscape) : ''
      };
    });
  }

  // New steps from the AI into a copy of the world. Recorded numbers are kept by position.
  function applySteps(world, steps) {
    var w = clone(world);
    w.steps = steps.map(function (s, i) {
      var old = world.steps[i] || {};
      var out = { label: s.label, narrative: s.narrative, events: s.events, landscape: s.landscape };
      if (old.state) out.state = old.state;
      if (old.open) out.open = old.open;
      return out;
    });
    w.time.increments = w.steps.length;
    return w;
  }

  // The Increment Viewer reads a world as a review: one item per step, with a card when there is no picture.
  function toReview(world) {
    var computed = compute(world);
    var keys = world.chart || [];
    var maxes = {};
    keys.forEach(function (c) {
      maxes[c.key] = Math.max.apply(null, computed.states.map(function (s) { return Number(s[c.key]) || 0; })) || 1;
    });
    var items = world.steps.map(function (step, idx) {
      var st = computed.states[idx + 1], prev = computed.states[idx];
      var changes = (step.events || []).slice();
      keys.forEach(function (c) {
        if (st[c.key] !== prev[c.key]) changes.push(c.name + ': ' + prev[c.key] + ' to ' + st[c.key]);
      });
      var item = {
        id: String(step.step || idx + 1),
        title: step.label,
        description: resolveText(step.narrative, st) + (step.landscape ? ' ' + resolveText(step.landscape, st) : ''),
        changes: changes,
        gaps: step.open || [],
        card: {
          kicker: st.time,
          bars: keys.map(function (c) { return { label: c.name, value: st[c.key], max: maxes[c.key], color: c.color }; }),
          note: step.landscape ? resolveText(step.landscape, st) : ''
        }
      };
      if (step.image) item.image = step.image;
      return item;
    });
    var subtitleBits = [world.kind.charAt(0).toUpperCase() + world.kind.slice(1) + '.', world.seed.prompt];
    return { title: world.title, subtitle: subtitleBits.join(' '), items: items };
  }

  var api = {
    KINDS: KINDS, MODELS: MODELS, clone: clone, slug: slug, varsOf: varsOf,
    validate: validate, compute: compute, resolveText: resolveText, ruleText: ruleText, chartData: chartData, describeSeries: describeSeries,
    buildPrompt: buildPrompt, parseReply: parseReply, applySteps: applySteps, toReview: toReview
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrowthModel = api;
})(typeof window !== 'undefined' ? window : this);
