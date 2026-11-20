/* QC keynotes: guideline model, the typed-in form, save / export / import.
   Guideline version 2 is structured, so every check can be run and tested. */
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

  // Each check: the colour it gives when it is broken. 'off' ignores the check.
  QC.CHECKS = [
    { key: 'badPrefix', label: 'Prefix not in the list', hint: 'e.g. X5 when only D and N are allowed.', def: 'red' },
    { key: 'badNumber', label: 'Number outside the digit range', hint: 'Too many or too few digits.', def: 'red' },
    { key: 'duplicate', label: 'Keynote number used twice', hint: 'Same code in two entries. The second is marked.', def: 'red' },
    { key: 'undefinedKeynote', label: 'Callout with no keynote entry', hint: 'A bubble on the sheet with no line in the keynote list.', def: 'red' },
    { key: 'unusedKeynote', label: 'Keynote entry with no callout', hint: 'Listed in the keynotes but never called out.', def: 'yellow' },
    { key: 'sequence', label: 'Numbers out of order', hint: 'A number lower than an earlier one with the same prefix.', def: 'yellow' },
    { key: 'tooLong', label: 'More words than the maximum', hint: 'Uses the maximum words set above.', def: 'yellow' },
    { key: 'caseIssue', label: 'Lower-case letters', hint: 'Only checked when upper case is required.', def: 'yellow' },
    { key: 'missingScopeWord', label: 'No scope word', hint: 'None of the scope words for the selected scopes.', def: 'yellow' },
    { key: 'fireMissing', label: 'Fire keynote without a rating', hint: 'Says FIRE but has no rating word such as HR or HOUR.', def: 'red' },
    { key: 'nearApproved', label: 'Close to an approved phrase', hint: 'Similar, not exact. The closest phrase is shown.', def: 'yellow' },
    { key: 'punctCase', label: 'Approved phrase, but case or punctuation differs', hint: 'Same words; only the capitals, periods or commas are different.', def: 'yellow' },
    { key: 'notApproved', label: 'Not in the approved list', hint: 'Only checked when an approved list is typed in.', def: 'yellow' },
    { key: 'noText', label: 'Page with no text layer', hint: 'Scanned or image-only page: cannot read.', def: 'yellow' },
  ];
  QC.CHECK_LABEL = Object.fromEntries(QC.CHECKS.map(c => [c.key, c.label]));

  QC.DEFAULT_GUIDE = {
    version: 2,
    name: '',
    cloud: 'local',
    scopes: [],
    scopeWords: Object.fromEntries(QC.SCOPES.map(s => [s.key, s.words])),
    prefixes: { demolition: 'D', newWork: 'N' },
    numberDigits: { min: 1, max: 3 },
    maxWords: 12,
    upperCase: true,
    fireWords: 'HR, HOUR',
    approved: [],
    similarity: 0.8,
    checks: Object.fromEntries(QC.CHECKS.map(c => [c.key, c.def])),
    syntax: { demolition: '', newWork: '' },
    examples: '',
    generalNotes: 'stub',
  };

  // Accepts any saved object and fills gaps with the defaults. Version 1 is migrated.
  QC.normalizeGuide = raw => {
    const D = QC.DEFAULT_GUIDE;
    if (!raw || typeof raw !== 'object') return structuredClone(D);
    if (raw.version === 1) {
      return { ...structuredClone(D), name: raw.name || '', cloud: raw.cloud === 'cloud' ? 'cloud' : 'local',
        scopes: raw.scopes || [], syntax: { ...D.syntax, ...(raw.syntax || {}) }, examples: raw.examples || '' };
    }
    if (raw.version !== 2) throw new Error('not a QC keynote guideline (version ' + raw.version + ')');
    return {
      ...structuredClone(D), ...raw,
      scopeWords: { ...D.scopeWords, ...(raw.scopeWords || {}) },
      prefixes: { ...D.prefixes, ...(raw.prefixes || {}) },
      numberDigits: { ...D.numberDigits, ...(raw.numberDigits || {}) },
      checks: { ...D.checks, ...(raw.checks || {}) },
      syntax: { ...D.syntax, ...(raw.syntax || {}) },
      approved: Array.isArray(raw.approved) ? raw.approved : QC.lines(raw.approved),
      cloud: raw.cloud === 'cloud' ? 'cloud' : 'local',
    };
  };

  const $ = id => document.getElementById(id);

  // Build the scope rows and check rows once.
  QC.buildGuideForm = () => {
    $('scopeRows').innerHTML = QC.SCOPES.map(s => `
      <div class="scopeRow">
        <label class="check"><input type="checkbox" data-scope="${s.key}"> ${QC.esc(s.label)}</label>
        <input type="text" data-scopeword="${s.key}" aria-label="Scope words for ${QC.esc(s.label)}" placeholder="Words that show this scope, comma separated">
      </div>`).join('');
    $('checkRows').innerHTML = QC.CHECKS.map(c => `
      <div class="checkRow">
        <div><div class="checkName">${QC.esc(c.label)}</div><div class="hint">${QC.esc(c.hint || '')}</div></div>
        <select data-check="${c.key}" aria-label="Colour for ${QC.esc(c.label)}">
          <option value="red">Red</option><option value="yellow">Yellow</option><option value="off">Off</option>
        </select>
      </div>`).join('');
  };

  QC.readForm = cloud => ({
    version: 2,
    name: $('gName').value.trim(),
    cloud: cloud === 'cloud' ? 'cloud' : 'local',
    scopes: [...document.querySelectorAll('[data-scope]')].filter(i => i.checked).map(i => i.dataset.scope),
    scopeWords: Object.fromEntries([...document.querySelectorAll('[data-scopeword]')].map(i => [i.dataset.scopeword, i.value.trim()])),
    prefixes: { demolition: $('pDem').value.trim(), newWork: $('pNew').value.trim() },
    numberDigits: { min: Math.max(1, +$('digMin').value || 1), max: Math.max(1, +$('digMax').value || 1) },
    maxWords: Math.max(1, +$('maxWords').value || 1),
    upperCase: $('upperCase').checked,
    fireWords: $('fireWords').value.trim(),
    approved: QC.lines($('approved').value),
    similarity: Math.min(100, Math.max(50, +$('similarity').value || 80)) / 100,
    checks: Object.fromEntries([...document.querySelectorAll('[data-check]')].map(s => [s.dataset.check, s.value])),
    syntax: { demolition: $('syntaxDemo').value, newWork: $('syntaxNew').value },
    examples: $('examples').value,
    generalNotes: 'stub',
  });

  QC.writeForm = g => {
    $('gName').value = g.name || '';
    document.querySelectorAll('[data-scope]').forEach(i => i.checked = g.scopes.includes(i.dataset.scope));
    document.querySelectorAll('[data-scopeword]').forEach(i => i.value = g.scopeWords[i.dataset.scopeword] || '');
    $('pDem').value = g.prefixes.demolition;
    $('pNew').value = g.prefixes.newWork;
    $('digMin').value = g.numberDigits.min;
    $('digMax').value = g.numberDigits.max;
    $('maxWords').value = g.maxWords;
    $('upperCase').checked = !!g.upperCase;
    $('fireWords').value = g.fireWords;
    $('approved').value = g.approved.join('\n');
    $('similarity').value = Math.round(g.similarity * 100);
    document.querySelectorAll('[data-check]').forEach(s => s.value = g.checks[s.dataset.check] || 'off');
    $('syntaxDemo').value = g.syntax.demolition;
    $('syntaxNew').value = g.syntax.newWork;
    $('examples').value = g.examples;
  };

  QC.guideSummary = g => {
    const rules = Object.values(g.checks).filter(v => v !== 'off').length;
    return [g.name || 'untitled', g.scopes.length + ' scope(s)', rules + ' check(s) on', g.approved.length + ' approved phrase(s)',
      g.cloud === 'cloud' ? 'safe to cloud' : 'keep local'].join(' · ');
  };
})();
