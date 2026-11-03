// World: one sheet of white paper, ten increments of decay. The numbers were recorded from the Paper Again
// simulation (03 Projects/Paper Again): pieces, triangles on the surface, and the tallest point.
// This is the same story as Paper Again, written in the Growth world format to show the format also
// handles decay and a recorded run, not only a computed one. The 3-D frames are in Paper Again.
(function (root) {
  var world = {
    schema: 2,
    id: 'paper_decay',
    title: 'Paper decay, outdoors',
    kind: 'decay',
    seed: {
      prompt: 'One sheet of white paper, 8.5 by 11 inches, floating in the air outdoors. Over ten increments it is folded, crumpled, torn, wetted, cut, burned and nested in.',
      scene: ['outdoors (placeholder)', 'hard ground'],
      entities: [
        { id: 'pieces', name: 'Pieces', start: 1, unit: 'pieces', note: 'one sheet' },
        { id: 'faces', name: 'Surface triangles', start: 1536, unit: 'triangles', note: 'how much paper is left (24 by 32 cells)' },
        { id: 'height', name: 'Tallest point', start: 0.02, unit: 'inches', note: 'flat on the ground to begin with' }
      ]
    },
    environment: {
      prompt: 'Outdoors, as a placeholder. The place is not chosen yet. The events below are what the story does to the sheet.',
      variables: [
        { id: 'place', name: 'Place', value: 'outdoors (placeholder)', unit: '', note: 'To be chosen: outdoors, subway, damp room.' },
        { id: 'ground', name: 'Ground', value: 'hard floor', unit: '', note: 'A floor at height zero. Paper lands on it and rests.' },
        { id: 'wind', name: 'Wind', value: 'gusts at increment 3', unit: '', note: 'Rolls the sheet into a ball.' },
        { id: 'rain', name: 'Rain', value: 'soaks one side at increment 6', unit: '', note: 'Water softens the paper and feeds mould.' },
        { id: 'fire', name: 'Fire', value: 'a match at increment 9', unit: '', note: 'Scorches and curls a corner.' },
        { id: 'animals', name: 'Insects and animals', value: 'increments 9 and 10', unit: '', note: 'Holes, then a nest.' }
      ]
    },
    time: {
      unit: 'increment',
      increments: 10,
      perStep: 'Each increment is run from the one before, then the sheet tumbles and drops, so it lands in a new pose.',
      rules: [
        'Folds set: a bent crease stays after the force is gone.',
        'Paper layers cannot pass through each other, and they grip where they touch.',
        'A tear breaks the paper along a rough line. A cut breaks it along a straight line drawn on the flat sheet.',
        'Wet paper is softer. Mould grows where it stays wet. Dirt collects in folds. A burn darkens and curls the edge.'
      ],
      notModelled: [
        'The ball is held together by a soft shell until the first cut. Real crumpled paper holds itself.',
        'Tears and cuts follow a grid of about 0.35 inches, not single fibres.',
        'Dirt, mould and burns are simple colour changes.'
      ],
      model: { type: 'recorded' }
    },
    chart: [
      { key: 'pieces', name: 'Pieces', color: '#4f74d6' },
      { key: 'faces', name: 'Surface triangles', color: '#d9822b' },
      { key: 'height', name: 'Tallest point (in)', color: '#3f9b66' }
    ],
    steps: [
      { label: 'Floating, then a boot', narrative: 'The sheet hangs in the air, drifts, and falls flat. A boot stamps a dent and a dirty print into the middle.',
        events: ['Flat sheet falls to the floor', 'Dent from the boot', 'Dirt in the dent'], state: { pieces: 1, faces: 1536, height: 0.02 } },
      { label: 'Truck and a big crease', narrative: 'A wheel rolls over a band, then one half is folded over. The crease is plastic, so it holds after the fold.',
        events: ['Band flattened by the wheel', 'Big crease that stays'], state: { pieces: 1, faces: 1536, height: 0.98 } },
      { label: 'Wind rolls it into a ball', narrative: 'Gusts toss the sheet and it gathers into a crumpled ball. Creases set and the layers rest on each other.',
        events: ['Crumpled ball with many creases', 'Layers touch and push apart'], state: { pieces: 1, faces: 1536, height: 1.18 },
        open: ['The ball is held by a soft shell until the first cut; real jamming is not modelled.'] },
      { label: 'Tear', narrative: 'A strip is torn off the top edge along a rough line. Breaks are random, so the edge is jagged.',
        events: ['Torn strip along the top', 'Openings in the ball'], state: { pieces: 1, faces: 1511, height: 1.25 },
        open: ['Tear edges follow the grid, not single fibres.'] },
      { label: 'Junk caught in it', narrative: 'A bottle cap and a leaf press into the ball. Grime settles in the folds.',
        events: ['Two new dents', 'Dirt builds in the folds'], state: { pieces: 1, faces: 1511, height: 1.18 } },
      { label: 'Damp, then stained', narrative: 'Rain soaks one side. The wet paper softens and dries with a darker tide line at the edge.',
        events: ['Wet area spreads', 'Tide-line stain at the edge'], state: { pieces: 1, faces: 1511, height: 1.14 } },
      { label: 'First cut', narrative: 'Scissors cut across the middle. The two sides drop apart. The cut is straight.',
        events: ['Two pieces', 'Ball opened by the cut'], state: { pieces: 2, faces: 1463, height: 1.08 } },
      { label: 'Second cut', narrative: 'One piece is cut again, so there are three pieces. The damp area keeps darkening.',
        events: ['Three pieces', 'Mould begins in the wet area'], state: { pieces: 3, faces: 1415, height: 0.82 } },
      { label: 'Burn, holes and mould', narrative: 'A corner is scorched, which blackens and curls the edge. Insects eat holes, and mould grows where it stays wet.',
        events: ['Scorched, curled corner', 'Holes from insects', 'Mould spreads'], state: { pieces: 3, faces: 1391, height: 0.78 } },
      { label: 'Nest with animals', narrative: 'Animals pull shreds into a bundle in one corner. There are more holes, more mould, and a nest of scraps.',
        events: ['Shreds gathered into a bundle', 'More holes and mould'], state: { pieces: 3, faces: 1387, height: 0.80 } }
    ],
    outputs: {
      viewer: { set: 'paper_again' },
      model3d: { href: '../Paper Again/paper_again.html', label: 'Paper Again (3-D)' }
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = world;
  else { root.GROWTH_WORLDS = root.GROWTH_WORLDS || {}; root.GROWTH_WORLDS[world.id] = world; }
})(typeof window !== 'undefined' ? window : this);
