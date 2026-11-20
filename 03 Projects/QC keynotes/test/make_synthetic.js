// Makes the synthetic test sheet and guideline used by the smoke test.
// Nothing here is real project data. Run: node test/make_synthetic.js
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('../vendor/pdf-lib.min.js');

const here = __dirname;

// Keynote rows in the matrix layout: type, number, CSI, description.
const ROWS = [
  ['Demo', '1', '02 00', 'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS'],   // approved exact -> green
  ['Demo', '2', '10 00', 'remove existing lavatory faucet and supply lines'],      // lower case, not approved -> yellow
  ['Demo', '3', '10 00', 'REMOVE EXISTING PARTITION AND DOOR'],                   // approved -> green
  ['Demo', '3', '10 00', 'REMOVE EXISTING TOWEL DISPENSER'],                       // number used twice -> red
  ['Note', '5', '10 00', 'REMOVE EXISTING GRAB BAR'],                              // type not in the list -> red
  ['Demo', '4', '08 10', 'REMOVE EXISTING FIRE-RATED DOOR ASSEMBLY'],              // FIRE with no rating -> red
  ['Demo', '5', '08 10', 'Remove existing partition and door.'],                  // approved text, case and period -> yellow
  ['Demo', '6', '08 10', 'REMOVE EXISTING WALL TILES AT SHOWER AREA'],             // not approved -> yellow
  ['New', '11', '09 30', 'INSTALL NEW ACCESSIBLE LAVATORY, SEE DETAIL'],           // not approved -> yellow
  ['New', '12', '10 00', 'INSTALL NEW GRAB BAR, 36 INCH LONG'],                    // approved -> green
  ['New', '14', '09 30', 'INSTALL NEW 1-HR FIRE-RATED PARTITION'],                 // approved -> green
  ['New', '15', '10 00', 'install new towel holder'],                              // near approved, lower case -> yellow
  ['New', '17', '08 10', 'INSTALL NEW DOOR HARDWARE'],                             // no callout on sheet -> yellow
  ['New', '18', '', 'INSTALL NEW SIGNAGE'],                                        // no CSI code -> red
];

// Callouts on the plan: number and position (points from bottom-left).
const CALLOUTS = [
  ['1', 180, 470], ['2', 260, 430], ['3', 330, 400], ['4', 400, 370], ['5', 180, 330],
  ['6', 440, 300], ['11', 180, 250], ['12', 260, 220], ['14', 340, 190], ['15', 420, 160],
  ['18', 200, 130], ['30', 480, 110],  // 30 has no keynote row -> red
];

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([1008, 612]);
  const ink = rgb(0.17, 0.16, 0.2);

  page.drawText('A-101  RESTROOM DEMOLITION AND NEW WORK PLAN (SYNTHETIC TEST SHEET)', { x: 36, y: 580, size: 12, font: bold, color: ink });
  page.drawRectangle({ x: 60, y: 60, width: 480, height: 480, borderColor: ink, borderWidth: 1.5 });
  page.drawText('RESTROOM', { x: 230, y: 300, size: 14, font: bold, color: ink });
  for (const [num, x, y] of CALLOUTS) {
    page.drawCircle({ x: x + 8, y: y + 4, size: 9, borderColor: ink, borderWidth: 1 });
    page.drawText(num, { x: x + (num.length > 1 ? 2 : 4.5), y, size: 8, font: bold, color: ink });
  }

  // KEYNOTES matrix on the right: Type | No. | CSI | Description
  let y = 540;
  page.drawText('KEYNOTES', { x: 640, y, size: 11, font: bold, color: ink });
  y -= 20;
  for (const [h, x] of [['TYPE', 640], ['NO.', 700], ['CSI', 735], ['DESCRIPTION', 780]]) page.drawText(h, { x, y, size: 7, font: bold, color: ink });
  y -= 14;
  for (const [type, num, csi, desc] of ROWS) {
    page.drawText(type, { x: 640, y, size: 7.5, font, color: ink });
    page.drawText(num, { x: 700, y, size: 7.5, font, color: ink });
    if (csi) page.drawText(csi, { x: 735, y, size: 7.5, font, color: ink });
    page.drawText(desc, { x: 780, y, size: 7.5, font, color: ink });
    y -= 13;
  }

  page.drawText('GENERAL NOTES', { x: 640, y: y - 10, size: 9, font: bold, color: ink });
  page.drawText('1. VERIFY EXISTING CONDITIONS BEFORE DEMOLITION.', { x: 640, y: y - 22, size: 7, font, color: ink });

  fs.writeFileSync(path.join(here, 'synthetic_restroom_set.pdf'), await doc.save());

  const check = (colour, short, narrative) => ({ colour, status: 'approved', short, narrative });
  const guideline = {
    version: 2,
    name: 'SYNTHETIC restroom and accessibility keynotes (test)',
    cloud: 'local',
    scopes: ['restroom', 'access', 'walls', 'partitions', 'fixtures', 'doors', 'fire'],
    scopeWords: {
      restroom: 'RESTROOM, TOILET, LAVATORY', access: 'ACCESSIBLE, GRAB BAR, BARRIER', walls: 'WALL TILE, CERAMIC, WALL',
      partitions: 'PARTITION', fixtures: 'FAUCET, TOWEL, ACCESSORY, HOLDER', doors: 'DOOR, HARDWARE', fire: 'FIRE', other: '',
    },
    types: ['Demo', 'New'],
    numberDigits: { min: 1, max: 3 },
    maxWords: 100,
    upperCase: true,
    fireWords: 'HR, HOUR',
    approved: [
      'REMOVE EXISTING CERAMIC WALL TILE AT RESTROOM WALLS',
      'INSTALL NEW GRAB BAR, 36 INCH LONG',
      'INSTALL NEW 1-HR FIRE-RATED PARTITION',
      'REMOVE EXISTING PARTITION AND DOOR',
      'INSTALL NEW TOWEL HOLDERS',
    ],
    similarity: 0.8,
    checks: {
      badType: check('red', 'Type must be Demo or New', 'Control rule: the type column is checked against the list.'),
      badNumber: check('red', 'Digit count', 'Control rule: number digits.'),
      csi: check('red', 'CSI 4 digits', 'Control rule: CSI code.'),
      duplicate: check('red', 'No repeats', 'Control rule: duplicates.'),
      undefinedKeynote: check('red', 'Every callout has a row', 'Control rule: callouts.'),
      unusedKeynote: check('yellow', 'Every row is called out', 'Control rule: unused rows.'),
      sequence: check('yellow', 'In order', 'Control rule: order.'),
      tooLong: check('yellow', 'Within the maximum', 'Control rule: word maximum.'),
      caseIssue: check('yellow', 'Upper case', 'Control rule: case.'),
      missingScopeWord: check('yellow', 'Scope word', 'Control rule: scope words.'),
      fireMissing: check('red', 'Fire rating', 'Control rule: fire ratings.'),
      punctCase: check('yellow', 'Case and punctuation', 'Control rule: approved text with other case or punctuation.'),
      nearApproved: check('yellow', 'Close to approved', 'Control rule: near matches.'),
      notApproved: check('yellow', 'Approved list', 'Control rule: not approved.'),
      noText: check('yellow', 'Text layer', 'Control rule: unreadable pages.'),
    },
    syntax: { demolition: '', newWork: '' },
    examples: '',
    generalNotes: 'stub',
  };
  // Numbering and CSI are off: the phrasing is what is checked
  for (const k of ['badType', 'badNumber', 'csi', 'duplicate', 'undefinedKeynote', 'unusedKeynote', 'sequence']) guideline.checks[k].colour = 'off';
  fs.writeFileSync(path.join(here, 'synthetic_guideline.json'), JSON.stringify(guideline, null, 2) + '\n');
  console.log('wrote synthetic_restroom_set.pdf and synthetic_guideline.json');
}
main().catch(e => { console.error(e); process.exit(1); });
