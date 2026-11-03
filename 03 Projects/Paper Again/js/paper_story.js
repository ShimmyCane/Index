// Paper Again: the story of one sheet of white paper, ten increments (time).
// This is the record. The engine (paper_sim.js) replays increments 1..n from a flat sheet.
// Every increment ends with a tumble: the whole sheet is turned and dropped, so it lands in a
// new pose. Synthetic test story. Environment is a placeholder (outdoors), chosen by Claude.
// Coordinates: u across (0 to 1), v along (0 to 1). Sizes in inches.
(function (root) {
  var story = {
    schema: 1,
    subject: { id: 'paper-sheet', name: 'White paper, 8.5 by 11 in', base: { w: 8.5, h: 11, unit: 'in' } },
    environment: { id: 'outdoors', label: 'Outdoors (placeholder)' },
    seed: 20261103,
    steps: [
      { age: 1, label: 'Floating, then a boot',
        description: 'The sheet hangs in the air, drifts, and falls. A boot stamps it into the ground: a dent and a dirty print.',
        events: [
          { op: 'float', steps: 60, gust: 0.02 },
          { op: 'stamp', u: 0.5, v: 0.45, r: 0.7, depth: 0.3 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 2, label: 'Truck and a big crease',
        description: 'A truck wheel rolls across the sheet and flattens a band. Someone folds one half over: a big crease that holds.',
        events: [
          { op: 'roller', r: 0.8, depth: 0.3, steps: 120 },
          { op: 'fold', v: 0.5, angle: 2.4 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 3, label: 'Wind rolls it into a ball',
        description: 'Gusts toss the sheet and it gathers into a loose, crumpled ball. The creases set and hold the shape.',
        events: [
          { op: 'wind', steps: 700, radius: 1.9, gust: 0.3 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 4, label: 'Tear',
        description: 'A torn strip peels off the top edge, along a rough line that follows the fibres. The edge is ragged, not cut.',
        events: [
          { op: 'tear', edge: 'top', length: 9 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 5, label: 'Junk caught in it',
        description: 'A bottle cap and a leaf get caught in the ball and press dents into it. Grime settles into the folds.',
        events: [
          { op: 'stamp', u: 0.3, v: 0.7, r: 0.4, depth: 0.12, steps: 60 },
          { op: 'stamp', u: 0.7, v: 0.3, r: 0.35, depth: 0.1, steps: 60 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 6, label: 'Damp, then stained',
        description: 'Rain soaks one side. The paper softens, the wet area spreads, and it dries with a darker tide line at its edge.',
        events: [
          { op: 'wet', u: 0.45, v: 0.4, r: 1.8, amount: 0.9, steps: 40 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 7, label: 'First cut',
        description: 'Scissors cut the ball open across the middle. The cut is straight and clean; the two sides drop apart.',
        events: [
          { op: 'cut', line: { u0: 0, v0: 0.56, u1: 1, v1: 0.6 }, push: 0.35 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 8, label: 'Second cut',
        description: 'One of the pieces is cut again, so there are three pieces. The damp area keeps darkening.',
        events: [
          { op: 'cut', line: { u0: 0, v0: 0.3, u1: 1, v1: 0.33 }, push: 0.3 },
          { op: 'mould', steps: 30, rate: 0.25 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 9, label: 'Burn, holes and mould',
        description: 'A corner is scorched by a match, and the edge curls and blackens. Insects eat holes, and mould grows in the wet area.',
        events: [
          { op: 'burn', u: 0.1, v: 0.04, r: 1.3 },
          { op: 'holes', items: [
            { u: 0.12, v: 0.12, r: 0.3 },
            { u: 0.18, v: 0.16, r: 0.22 },
            { u: 0.08, v: 0.2, r: 0.25 }
          ] },
          { op: 'mould', steps: 40, rate: 0.3 },
          { op: 'tumble', drop: 2.5 }
        ] },
      { age: 10, label: 'Nest with animals',
        description: 'Animals pull shreds into a bundle in one corner. The paper is more holes, more mould, and a nest of scraps.',
        events: [
          { op: 'gather', u: 0.2, v: 0.15, radius: 1.6, final: 0.8, steps: 200 },
          { op: 'holes', items: [
            { u: 0.22, v: 0.14, r: 0.18 },
            { u: 0.16, v: 0.1, r: 0.15 }
          ] },
          { op: 'mould', steps: 40, rate: 0.3 },
          { op: 'tumble', drop: 2.5 }
        ] }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = story;
  else root.PAPER_STORY = story;
})(typeof window !== 'undefined' ? window : this);
