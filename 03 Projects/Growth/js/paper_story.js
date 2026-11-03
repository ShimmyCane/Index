// The Growth story for one white paper sheet: ten steps (time).
// This is the record. The engine (paper_engine.js) replays steps 1..n from a clean sheet.
// Synthetic test story. Environment is a placeholder (outdoors) until chosen.
// Coordinates: u across (0 to 1), v along (0 to 1). Sizes in inches.
(function (root) {
  var story = {
    schema: 1,
    subject: { id: 'paper-sheet', name: 'White paper', base: { w: 8.5, h: 11, unit: 'in' } },
    environment: { id: 'outdoors', label: 'Outdoors (placeholder)' },
    seed: 20261103,
    steps: [
      { age: 1, label: 'Floating, then a boot', description: 'The sheet drifts in the air, then a boot stamps it onto the ground: a print in the middle and a bent corner.',
        events: [
          { op: 'float', amp: 0.12 },
          { op: 'stamp', u: 0.5, v: 0.42, r: 0.9, depth: 0.35 },
          { op: 'bend', corner: 'tr', amount: 0.4 }
        ] },
      { age: 2, label: 'Truck and crease', description: 'A truck runs over the sheet, leaving a wheel track across the lower half. A big crease runs through the middle.',
        events: [
          { op: 'track', v: 0.33, halfWidth: 0.6, depth: 0.22 },
          { op: 'crease', v: 0.55, angle: 0.3 }
        ] },
      { age: 3, label: 'Wind', description: 'The wind lifts the sheet and folds the edges back. The crease softens and the surface starts to curl.',
        events: [
          { op: 'wind', curl: 0.35, relax: 0.15 }
        ] },
      { age: 4, label: 'Tear', description: 'A corner catches on a branch and tears, leaving a ragged edge.',
        events: [
          { op: 'tear', corner: 'tr', size: 0.2 }
        ] },
      { age: 5, label: 'Junk picked up', description: 'Scraps and litter catch on the sheet and stick to it.',
        events: [
          { op: 'junk', items: [
            { u: 0.3, v: 0.7, r: 0.35, h: 0.12, color: [0.6, 0.45, 0.25] },
            { u: 0.7, v: 0.25, r: 0.3, h: 0.1, color: [0.4, 0.7, 0.35] }
          ] }
        ] },
      { age: 6, label: 'Wet and fluffy', description: 'Rain soaks the paper. It swells, goes soft and fluffy at the edges, and the surface turns slightly grey.',
        events: [
          { op: 'wet', amount: 0.8 }
        ] },
      { age: 7, label: 'First cut', description: 'Something cuts the sheet in two along a clean line. A loose strip stays on one side.',
        events: [
          { op: 'cut', piece: 0, line: { u0: 0, v0: 0.62, u1: 1, v1: 0.58 }, gap: 0.08, push: 0.25 }
        ] },
      { age: 8, label: 'Second cut', description: 'One of the two pieces is cut again, so the story now has three pieces.',
        events: [
          { op: 'cut', piece: 0, line: { u0: 0, v0: 0.3, u1: 1, v1: 0.33 }, gap: 0.08, push: 0.25 }
        ] },
      { age: 9, label: 'Nest starts', description: 'Insects move in. Small holes appear in one corner, and shredded bits gather there.',
        events: [
          { op: 'holes', items: [
            { u: 0.1, v: 0.1, r: 0.3 },
            { u: 0.16, v: 0.13, r: 0.22 },
            { u: 0.07, v: 0.17, r: 0.25 }
          ] },
          { op: 'junk', items: [
            { u: 0.14, v: 0.12, r: 0.1, h: 0.05, color: [0.7, 0.62, 0.5] },
            { u: 0.09, v: 0.17, r: 0.08, h: 0.05, color: [0.7, 0.62, 0.5] }
          ] }
        ] },
      { age: 10, label: 'Nest with animals', description: 'Animals use the nest. Paper is pulled into a bundle in one corner, with nest scraps around it.',
        events: [
          { op: 'junk', items: [
            { u: 0.12, v: 0.12, r: 0.22, h: 0.25, color: [0.72, 0.6, 0.42] },
            { u: 0.2, v: 0.2, r: 0.08, h: 0.06, color: [0.7, 0.62, 0.5] }
          ] },
          { op: 'holes', items: [
            { u: 0.05, v: 0.05, r: 0.15 }
          ] }
        ] }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = story;
  else root.PAPER_STORY = story;
})(typeof window !== 'undefined' ? window : this);
