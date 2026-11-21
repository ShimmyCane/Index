/* QC keynotes: guideline model, the typed-in form, save / export / import.
   Version 2 is structured. Each check has a colour, a status (draft or approved) and a
   short description with a full narrative. Only approved checks run in the scan. */
(function () {
  'use strict';
  const QC = window.QC;

  QC.SCOPES = [
    { key: 'restroom', label: 'Restroom', words: 'RESTROOM, TOILET, LAVATORY' },
    { key: 'access', label: 'Accessibility and barrier removal', words: 'ACCESSIBLE, GRAB BAR, BARRIER' },
    { key: 'walls', label: 'Existing walls and tile', words: 'WALL TILE, CERAMIC, WALL' },
    { key: 'partitions', label: 'Partitions', words: 'PARTITION' },
    { key: 'fixtures', label: 'Faucets, towel holders and accessories', words: 'FAUCET, TOWEL, ACCESSORY, HOLDER' },
    { key: 'doors', label: 'Doors', words: 'DOOR, HARDWARE' },
    { key: 'fire', label: 'Fire rating', words: 'FIRE' },
    { key: 'other', label: 'Other (type your own words)', words: '' },
  ];

  // Draft rules. Each one: the colour it gives when broken, a short description and a full narrative.
  QC.CHECKS = [
    { key: 'badType', label: 'Keynote type not in the list', def: 'off',
      short: 'The keynote type must be one of the listed types (Demo, New).',
      narrative: 'Each keynote row names its type in the first column. Only the types in the guideline are allowed. Any other word in that column is red, because the keynote cannot be filed with the right scope.' },
    { key: 'badNumber', label: 'Number outside the digit range', def: 'off',
      short: 'The keynote number has too many or too few digits.',
      narrative: 'The keynote number sits in the second column. The guideline sets the fewest and most digits allowed. A number outside that range is red.' },
    { key: 'csi', label: 'CSI code not 4 digits', def: 'off',
      short: 'The CSI code is 4 digits, written as 02 00 or 0200.',
      narrative: 'The third column holds the CSI code. The code is four digits, written as two pairs (02 00). A row with no CSI code, or with a different count of digits, is red because it cannot be linked to the specification.' },
    { key: 'duplicate', label: 'Keynote number used twice', def: 'off',
      short: 'The same type and number must not appear twice.',
      narrative: 'Within one type, each number names one keynote. The second use of Demo 3 is red, because a reader cannot tell which one a callout means.' },
    { key: 'undefinedKeynote', label: 'Callout with no keynote row', def: 'off',
      short: 'Every number called out on the sheet has a keynote row.',
      narrative: 'A bubble on the sheet with a number and no matching keynote row is red. The bubble is boxed in red on the drawing so the reviewer can find it.' },
    { key: 'unusedKeynote', label: 'Keynote row with no callout', def: 'off',
      short: 'Every keynote row is called out on the sheet.',
      narrative: 'A keynote row whose number never appears as a callout is yellow. It may be correct (a note kept for the spec), so the reviewer decides.' },
    { key: 'sequence', label: 'Numbers out of order', def: 'off',
      short: 'Numbers within a type run in order.',
      narrative: 'Within one type, a number lower than an earlier one is yellow. Gaps are not checked.' },
    { key: 'verb', label: 'Opening word is not an approved verb', def: 'red',
      short: 'The keynote starts with an approved verb (REMOVE, INSTALL, PROVIDE and so on).',
      narrative: 'A keynote states what the work is. It opens with a verb from the approved list. A word that is not a verb in that list, such as BASH, is red and underlined, because the phrase does not follow the standard.' },
    { key: 'tooLong', label: 'More words than the maximum', def: 'yellow',
      short: 'A keynote description stays within the word maximum.',
      narrative: 'The guideline sets the most words in one description. The maximum is set high on purpose: a long keynote is a wording question, not a rule break. Over the maximum is yellow.' },
    { key: 'caseIssue', label: 'Lower-case letters', def: 'yellow',
      short: 'Descriptions are in upper case when the guideline asks for it.',
      narrative: 'When upper case is required, any lower-case letter in a description is yellow. The reviewer checks whether the wording is otherwise right.' },
    { key: 'missingScopeWord', label: 'No scope word', def: 'yellow',
      short: 'A description uses a word for one of the selected scopes.',
      narrative: 'The scopes the guideline covers each have scope words. A description with none of them is yellow: it may be right, but it does not say what it is about.' },
    { key: 'fireMissing', label: 'Fire keynote without a rating', def: 'red',
      short: 'A keynote that says FIRE gives the rating (for example 1-HR).',
      narrative: 'Any keynote that mentions FIRE must give a rating word from the guideline (HR or HOUR). Without one the fire requirement cannot be checked, so it is red.' },
    { key: 'punctCase', label: 'Approved text, different case or punctuation', def: 'yellow',
      short: 'Same words as an approved phrase, with different capitals or punctuation.',
      narrative: 'An exact match with the approved phrase is green. The same words with different capitals, periods or commas are yellow: the reviewer decides whether the difference matters.' },
    { key: 'nearApproved', label: 'Close to an approved phrase', def: 'yellow',
      short: 'Close to an approved phrase but not the same words.',
      narrative: 'The description is similar to an approved phrase, above the closeness setting. The closest phrase is shown so the reviewer can compare them.' },
    { key: 'notApproved', label: 'Not in the approved list', def: 'yellow',
      short: 'Not in the approved phrase list.',
      narrative: 'When an approved list is typed in, a description not on it and not close to it is yellow. Most new wording will be yellow until it is approved.' },
    { key: 'noText', label: 'Page with no text layer', def: 'yellow',
      short: 'A page with no text cannot be read.',
      narrative: 'A scanned or image-only page cannot be read in this version. It is marked yellow so nobody assumes it was checked.' },
  ];
  QC.CHECK_LABEL = Object.fromEntries(QC.CHECKS.map(c => [c.key, c.label]));

  const checkDefaults = () => Object.fromEntries(QC.CHECKS.map(c => [c.key, { colour: c.def, status: 'draft', short: c.short, narrative: c.narrative }]));

  QC.DEFAULT_GUIDE = {
    version: 2,
    name: '',
    cloud: 'local',
    scopes: [],
    scopeWords: Object.fromEntries(QC.SCOPES.map(s => [s.key, s.words])),
    types: ['Demo', 'New'],
    verbs: ['REMOVE', 'DEMOLISH', 'INSTALL', 'PROVIDE', 'PATCH', 'REPAIR', 'REPLACE', 'RELOCATE', 'PROTECT', 'FURNISH'],
    numberDigits: { min: 1, max: 3 },
    maxWords: 100,
    upperCase: true,
    fireWords: 'HR, HOUR',
    approved: [],
    similarity: 0.8,
    checks: checkDefaults(),
    syntax: { demolition: '', newWork: '' },
    examples: '',
    generalNotes: 'stub',
  };

  // Accepts any saved object, fills gaps with the defaults, migrates older shapes.
  QC.normalizeGuide = raw => {
    const D = QC.DEFAULT_GUIDE;
    if (!raw || typeof raw !== 'object') return structuredClone(D);
    if (raw.version === 1) {
      return { ...structuredClone(D), name: raw.name || '', cloud: raw.cloud === 'cloud' ? 'cloud' : 'local',
        scopes: raw.scopes || [], syntax: { ...D.syntax, ...(raw.syntax || {}) }, examples: raw.examples || '' };
    }
    if (raw.version !== 2) throw new Error('not a QC keynote guideline (version ' + raw.version + ')');
    const checks = checkDefaults();
    for (const [k, v] of Object.entries(raw.checks || {})) {
      if (!checks[k]) continue;
      if (typeof v === 'string') checks[k].colour = v;                  // older shape: colour only
      else if (v && typeof v === 'object') Object.assign(checks[k], v);
    }
    return {
      ...structuredClone(D), ...raw,
      types: Array.isArray(raw.types) ? raw.types : QC.splitList(raw.types || 'Demo, New'),
      verbs: Array.isArray(raw.verbs) ? raw.verbs : QC.splitList(raw.verbs || D.verbs.join(', ')),
      scopeWords: { ...D.scopeWords, ...(raw.scopeWords || {}) },
      numberDigits: { ...D.numberDigits, ...(raw.numberDigits || {}) },
      checks,
      syntax: { ...D.syntax, ...(raw.syntax || {}) },
      approved: Array.isArray(raw.approved) ? raw.approved : QC.lines(raw.approved),
      cloud: raw.cloud === 'cloud' ? 'cloud' : 'local',
    };
  };

  const $ = id => document.getElementById(id);

  QC.buildGuideForm = () => {
    $('scopeRows').innerHTML = QC.SCOPES.map(s => `
      <div class="scopeRow">
        <label class="check"><input type="checkbox" data-scope="${s.key}"> ${QC.esc(s.label)}</label>
        <input type="text" data-scopeword="${s.key}" aria-label="Scope words for ${QC.esc(s.label)}" placeholder="Words that show this scope, comma separated">
      </div>`).join('');
    $('checkRows').innerHTML = QC.CHECKS.map(c => `
      <details class="ruleDraft" data-rule="${c.key}">
        <summary>
          <span class="ruleName">${QC.esc(c.label)}</span>
          <span class="pill ${'' }" data-status-pill="${c.key}"></span>
        </summary>
        <div class="ruleBody">
          <div class="grid2">
            <div><label class="hint">Colour when broken</label>
              <select data-check="${c.key}" aria-label="Colour for ${QC.esc(c.label)}">
                <option value="red">Red</option><option value="yellow">Yellow</option><option value="off">Off</option>
              </select></div>
            <div><label class="check"><input type="checkbox" data-approve="${c.key}"> Approved (applies in the scan)</label></div>
          </div>
          <label class="hint" for="short_${c.key}">Short description</label>
          <input type="text" id="short_${c.key}" data-short="${c.key}">
          <label class="hint" for="narr_${c.key}">Full narrative</label>
          <textarea id="narr_${c.key}" data-narrative="${c.key}"></textarea>
        </div>
      </details>`).join('');
  };

  QC.readForm = cloud => {
    const checks = {};
    for (const c of QC.CHECKS) {
      const sel = document.querySelector(`[data-check="${c.key}"]`);
      checks[c.key] = {
        colour: sel.value,
        status: document.querySelector(`[data-approve="${c.key}"]`).checked ? 'approved' : 'draft',
        short: document.querySelector(`[data-short="${c.key}"]`).value.trim(),
        narrative: document.querySelector(`[data-narrative="${c.key}"]`).value.trim(),
      };
    }
    return {
      version: 2,
      name: $('gName').value.trim(),
      cloud: cloud === 'cloud' ? 'cloud' : 'local',
      scopes: [...document.querySelectorAll('[data-scope]')].filter(i => i.checked).map(i => i.dataset.scope),
      scopeWords: Object.fromEntries([...document.querySelectorAll('[data-scopeword]')].map(i => [i.dataset.scopeword, i.value.trim()])),
      types: QC.splitList($('types').value),
      verbs: QC.splitList($('verbs').value).map(v => v.toUpperCase()),
      numberDigits: { min: Math.max(1, +$('digMin').value || 1), max: Math.max(1, +$('digMax').value || 1) },
      maxWords: Math.max(1, +$('maxWords').value || 1),
      upperCase: $('upperCase').checked,
      fireWords: $('fireWords').value.trim(),
      approved: QC.lines($('approved').value),
      similarity: Math.min(100, Math.max(50, +$('similarity').value || 80)) / 100,
      checks,
      syntax: { demolition: $('syntaxDemo').value, newWork: $('syntaxNew').value },
      examples: $('examples').value,
      generalNotes: 'stub',
    };
  };

  QC.writeForm = g => {
    $('gName').value = g.name || '';
    document.querySelectorAll('[data-scope]').forEach(i => i.checked = g.scopes.includes(i.dataset.scope));
    document.querySelectorAll('[data-scopeword]').forEach(i => i.value = g.scopeWords[i.dataset.scopeword] || '');
    $('types').value = g.types.join(', ');
    $('verbs').value = g.verbs.join(', ');
    $('digMin').value = g.numberDigits.min;
    $('digMax').value = g.numberDigits.max;
    $('maxWords').value = g.maxWords;
    $('upperCase').checked = !!g.upperCase;
    $('fireWords').value = g.fireWords;
    $('approved').value = g.approved.join('\n');
    $('similarity').value = Math.round(g.similarity * 100);
    for (const c of QC.CHECKS) {
      const v = g.checks[c.key];
      document.querySelector(`[data-check="${c.key}"]`).value = v.colour;
      document.querySelector(`[data-approve="${c.key}"]`).checked = v.status === 'approved';
      document.querySelector(`[data-short="${c.key}"]`).value = v.short;
      document.querySelector(`[data-narrative="${c.key}"]`).value = v.narrative;
      const pill = document.querySelector(`[data-status-pill="${c.key}"]`);
      pill.textContent = v.status === 'approved' ? 'approved' : 'draft';
    }
    $('syntaxDemo').value = g.syntax.demolition;
    $('syntaxNew').value = g.syntax.newWork;
    $('examples').value = g.examples;
  };

  QC.guideSummary = g => {
    const applied = Object.values(g.checks).filter(v => v.status === 'approved' && v.colour !== 'off').length;
    const drafts = Object.values(g.checks).filter(v => v.status !== 'approved').length;
    return [g.name || 'untitled', g.scopes.length + ' scope(s)', applied + ' rule(s) applied', drafts + ' draft(s)',
      g.approved.length + ' approved phrase(s)', g.cloud === 'cloud' ? 'safe to cloud' : 'keep local'].join(' · ');
  };
})();
