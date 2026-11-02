// Scene definitions for the built-in samples. All sizes in inches, Z up, position = centre of each object's box.
// tools/build_samples.js turns these into operation lists, replays them and writes the files.
// Keys become readable uuids: "<scene>-<key>".

const WORLD_ID = 'default-world';

const PLANTER = {
  id: 'garden-planter',
  header: {
    model_id: 'garden-planter',
    name: 'Garden planter',
    description: 'A sunny trough planter with snap peas and lettuce, on a stone path by a short picket fence.',
    units: 'in', up: 'z', world: WORLD_ID,
    materials: {
      clay: { color: '#e8a07a', opacity: 1 }, soil: { color: '#7a5a43', opacity: 1 },
      pea: { color: '#7fc97a', opacity: 1 }, stem: { color: '#5f9e5a', opacity: 1 },
      lettuce: { color: '#c4e8b0', opacity: 1 }, stone: { color: '#e9e4d8', opacity: 1 },
      wood: { color: '#f6e7c8', opacity: 1 }, sun: { color: '#ffd96a', opacity: 1 },
    },
  },
  defs: [
    ['pot', { name: 'Trough', description: 'the planter box', type: 'box', dimensions: [36, 12, 14], position: [0, 0, 7], material: 'clay' }],
    ['soil', { name: 'Soil', description: 'sits inside the rim', type: 'box', dimensions: [34, 10, 1.5], position: [0, 0, 14.75], material: 'soil' }],
    ['peas', { name: 'Snap peas', description: 'climbing peas on the left', type: 'group', dimensions: [], position: [-10, 0, 0] }],
    ['lettuce', { name: 'Lettuce', description: 'three heads on the right', type: 'group', dimensions: [], position: [11, 0, 0] }],
    ['pea1', { name: 'Pea stem 1', description: '', type: 'cylinder', dimensions: [0.3, 12], position: [-12, 0, 21.5], material: 'stem', parent: 'peas' }],
    ['pea2', { name: 'Pea stem 2', description: '', type: 'cylinder', dimensions: [0.3, 14], position: [-8, 0, 22.5], material: 'stem', parent: 'peas' }],
    ['pea3', { name: 'Pea stem 3', description: 'tip bends over', type: 'cylinder', dimensions: [0.3, 10], position: [-4, 0, 20.5], material: 'stem', parent: 'peas', rotation_y: 20 }],
    ['pod1', { name: 'Pea pod 1', description: '', type: 'sphere', dimensions: [1.2], position: [-12.5, 0, 25], material: 'pea', parent: 'peas' }],
    ['pod2', { name: 'Pea pod 2', description: '', type: 'sphere', dimensions: [1.2], position: [-7.5, 0, 27], material: 'pea', parent: 'peas' }],
    ['pod3', { name: 'Pea pod 3', description: '', type: 'sphere', dimensions: [1.2], position: [-3.5, 0, 24], material: 'pea', parent: 'peas' }],
    ['tip', { name: 'Pea tendril', description: 'a small cone tip', type: 'cone', dimensions: [0.6, 2.5], position: [-12, 0, 28.25], material: 'stem', parent: 'peas' }],
    ['head1', { name: 'Lettuce head 1', description: '', type: 'sphere', dimensions: [3.5], position: [7, 0, 19], material: 'lettuce', parent: 'lettuce' }],
    ['head2', { name: 'Lettuce head 2', description: '', type: 'sphere', dimensions: [3.5], position: [11, 0, 19.5], material: 'lettuce', parent: 'lettuce' }],
    ['head3', { name: 'Lettuce head 3', description: '', type: 'sphere', dimensions: [3.5], position: [15, 0, 19], material: 'lettuce', parent: 'lettuce' }],
    ['path', { name: 'Stone path', description: 'in front of the trough', type: 'box', dimensions: [72, 18, 0.5], position: [0, -20, 0.25], material: 'stone' }],
    ['fence', { name: 'Picket fence', description: 'behind the trough', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ...[-24, -20, -16, 16, 20, 24].map((x, i) => [`picket${i + 1}`, { name: `Picket ${i + 1}`, description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [x, 22, 15], material: 'wood', parent: 'fence' }]),
    ['sun', { name: 'Sun', description: 'high and to the left, sets the light', type: 'sphere', dimensions: [6], position: [-70, -40, 110], material: 'sun' }],
  ],
  modify: [{ key: 'head2', set: { dimensions: [4] }, note: 'larger middle lettuce head' }],
};

// Outdoor table: 3 ft x 7 ft top (84 x 36 in), yellow metal frame, a bonsai-style tree, and a parasol
// with three canopies (one on the pole, one on each side arm).
const TABLE = {
  id: 'outdoor-table',
  header: {
    model_id: 'outdoor-table',
    name: 'Outdoor table with parasol',
    description: 'A 3 ft x 7 ft table top on a yellow metal frame, a bonsai-style tree, and a parasol with three canopies for broad shade.',
    units: 'in', up: 'z', world: WORLD_ID,
    materials: {
      teak: { color: '#b98a5e', opacity: 1 }, yellow: { color: '#f2c94c', opacity: 1 },
      canopy: { color: '#fff1b8', opacity: 1 }, pole: { color: '#9aa4ad', opacity: 1 },
      pot: { color: '#e8a07a', opacity: 1 }, trunk: { color: '#7a5a43', opacity: 1 },
      leaf: { color: '#8fbf7a', opacity: 1 }, ground: { color: '#c9c3b5', opacity: 1 },
    },
  },
  defs: [
    ['top', { name: 'Table top', description: '3 ft x 7 ft, centre at 30 in high', type: 'box', dimensions: [84, 36, 1.5], position: [0, 0, 30], material: 'teak' }],
    ['frame', { name: 'Yellow frame', description: 'metal frame under the top', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ...[[-36, -14], [-36, 14], [36, -14], [36, 14]].map(([x, y], i) => [`leg${i + 1}`, { name: `Leg ${i + 1}`, description: '', type: 'box', dimensions: [2, 2, 28], position: [x, y, 14], material: 'yellow', parent: 'frame' }]),
    ['rail1', { name: 'Rail front', description: '', type: 'box', dimensions: [84, 1.5, 2], position: [0, -14, 27], material: 'yellow', parent: 'frame' }],
    ['rail2', { name: 'Rail back', description: '', type: 'box', dimensions: [84, 1.5, 2], position: [0, 14, 27], material: 'yellow', parent: 'frame' }],
    ['brace1', { name: 'Low brace front', description: '', type: 'box', dimensions: [84, 1.5, 1.5], position: [0, -14, 6], material: 'yellow', parent: 'frame' }],
    ['brace2', { name: 'Low brace back', description: '', type: 'box', dimensions: [84, 1.5, 1.5], position: [0, 14, 6], material: 'yellow', parent: 'frame' }],
    ['parasol', { name: 'Parasol', description: 'one pole, three canopies', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ['pole', { name: 'Parasol pole', description: 'through the table centre', type: 'cylinder', dimensions: [0.75, 80], position: [0, 0, 70], material: 'pole', parent: 'parasol' }],
    ['canopy-mid', { name: 'Canopy middle', description: 'top canopy on the pole', type: 'cone', dimensions: [36, 12], position: [0, 0, 104], material: 'canopy', parent: 'parasol' }],
    ['arm-l', { name: 'Arm left', description: 'side arm, tilted out', type: 'cylinder', dimensions: [0.5, 44], position: [-22, 0, 92], rotation_y: 90, material: 'pole', parent: 'parasol' }],
    ['arm-r', { name: 'Arm right', description: 'side arm, tilted out', type: 'cylinder', dimensions: [0.5, 44], position: [22, 0, 92], rotation_y: 90, material: 'pole', parent: 'parasol' }],
    ['canopy-l', { name: 'Canopy left', description: 'side canopy', type: 'cone', dimensions: [22, 9], position: [-44, 0, 96], material: 'canopy', parent: 'parasol' }],
    ['canopy-r', { name: 'Canopy right', description: 'side canopy', type: 'cone', dimensions: [22, 9], position: [44, 0, 96], material: 'canopy', parent: 'parasol' }],
    ['bonsai', { name: 'Bonsai tree', description: 'branching, reaching, on the table end', type: 'group', dimensions: [], position: [-30, 0, 0] }],
    ['bpot', { name: 'Bonsai pot', description: '', type: 'cylinder', dimensions: [6, 4], position: [-30, 0, 32.75], material: 'pot', parent: 'bonsai' }],
    ['btrunk', { name: 'Trunk', description: 'leans a little', type: 'cylinder', dimensions: [0.9, 18], position: [-30, 0, 43.75], rotation_y: 12, material: 'trunk', parent: 'bonsai' }],
    ['bbranch1', { name: 'Branch reaching left', description: '', type: 'cylinder', dimensions: [0.4, 12], position: [-36, 0, 47], rotation_y: 70, material: 'trunk', parent: 'bonsai' }],
    ['bbranch2', { name: 'Branch reaching right', description: '', type: 'cylinder', dimensions: [0.4, 14], position: [-24, 0, 52], rotation_y: -65, material: 'trunk', parent: 'bonsai' }],
    ['bleaf1', { name: 'Foliage left', description: '', type: 'sphere', dimensions: [4.5], position: [-41, 0, 52], material: 'leaf', parent: 'bonsai' }],
    ['bleaf2', { name: 'Foliage right', description: '', type: 'sphere', dimensions: [5], position: [-19, 0, 58], material: 'leaf', parent: 'bonsai' }],
    ['bleaf3', { name: 'Foliage top', description: '', type: 'sphere', dimensions: [6], position: [-31, 0, 56], material: 'leaf', parent: 'bonsai' }],
  ],
  modify: [{ key: 'canopy-mid', set: { dimensions: [38, 12] }, note: 'slightly wider middle canopy' }],
};

// Kitchen: a run of cabinets along the back wall, fridge at the left, stove, a sink run with a triple sink
// and two faucets, a dishwasher, drawers and a door, and upper cabinets with a sliding acrylic cup display.
// Back wall is y = 0; base cabinets are 24 in deep; counter tops at 36 in.
const KITCHEN = {
  id: 'kitchen',
  header: {
    model_id: 'kitchen',
    name: 'Kitchen',
    description: 'Walk-in kitchen: fridge, counter and stove on the left; a sink run with a triple sink and two faucets; a dishwasher, drawers and a door on the right; upper cabinets with a sliding acrylic cup display over the sink.',
    units: 'in', up: 'z', world: WORLD_ID,
    view: { azimuth_deg: 214 },   // start from the room side, not behind the back wall
    materials: {
      wall: { color: '#fde3cf', opacity: 1 }, cabinet: { color: '#dfeadf', opacity: 1 },
      counter: { color: '#e9e4d8', opacity: 1 }, steel: { color: '#b9c0c6', opacity: 1 },
      fridge: { color: '#f4f6f8', opacity: 1 }, acrylic: { color: '#dbe7f6', opacity: 0.35 },
      cup: { color: '#ffffff', opacity: 1 }, faucet: { color: '#c7ced6', opacity: 1 },
    },
  },
  defs: [
    ['wall', { name: 'Back wall', description: 'context only', type: 'box', dimensions: [240, 1, 96], position: [120, -0.5, 48], material: 'wall' }],
    ['fridge', { name: 'Fridge', description: 'left end', type: 'box', dimensions: [36, 30, 70], position: [18, 15, 35], material: 'fridge' }],
    ['run1', { name: 'Counter run', description: 'after the fridge', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ['run1-base', { name: 'Base cabinets 1', description: '', type: 'box', dimensions: [36, 24, 34.5], position: [54, 12, 17.25], material: 'cabinet', parent: 'run1' }],
    ['run1-top', { name: 'Counter 1', description: '', type: 'box', dimensions: [36, 25.5, 1.5], position: [54, 12.75, 35.25], material: 'counter', parent: 'run1' }],
    ['stove', { name: 'Stove', description: 'four burners on top', type: 'box', dimensions: [30, 24, 36], position: [87, 12, 18], material: 'steel' }],
    ['run2-base', { name: 'Base cabinets 2', description: '', type: 'box', dimensions: [36, 24, 34.5], position: [120, 12, 17.25], material: 'cabinet' }],
    ['run2-top', { name: 'Counter 2', description: '', type: 'box', dimensions: [36, 25.5, 1.5], position: [120, 12.75, 35.25], material: 'counter' }],
    ['sink', { name: 'Sink run', description: 'corner run with the triple sink', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ['sink-base', { name: 'Sink base cabinets', description: '', type: 'box', dimensions: [54, 24, 34.5], position: [165, 12, 17.25], material: 'cabinet', parent: 'sink' }],
    ['sink-top', { name: 'Sink counter', description: '', type: 'box', dimensions: [54, 25.5, 1.5], position: [165, 12.75, 35.25], material: 'counter', parent: 'sink' }],
    ['bowl1', { name: 'Sink bowl 1', description: 'of three', type: 'box', dimensions: [12, 16, 5], position: [148, 12, 33.5], material: 'steel', parent: 'sink' }],
    ['bowl2', { name: 'Sink bowl 2', description: 'of three', type: 'box', dimensions: [12, 16, 5], position: [165, 12, 33.5], material: 'steel', parent: 'sink' }],
    ['bowl3', { name: 'Sink bowl 3', description: 'of three', type: 'box', dimensions: [12, 16, 5], position: [182, 12, 33.5], material: 'steel', parent: 'sink' }],
    ['faucet1', { name: 'Faucet 1', description: 'over bowl 1', type: 'cylinder', dimensions: [0.6, 12], position: [156, 3, 42], material: 'faucet', parent: 'sink' }],
    ['faucet2', { name: 'Faucet 2', description: 'over bowl 3', type: 'cylinder', dimensions: [0.6, 12], position: [174, 3, 42], material: 'faucet', parent: 'sink' }],
    ['dish', { name: 'Dishwasher', description: 'after the corner, with a gap', type: 'box', dimensions: [22, 24, 34.5], position: [205, 12, 17.25], material: 'steel' }],
    ['drawers', { name: 'Drawers and doors', description: 'far right', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ['dbase', { name: 'Drawer base', description: '', type: 'box', dimensions: [22, 24, 34.5], position: [229, 12, 17.25], material: 'cabinet', parent: 'drawers' }],
    ['drw1', { name: 'Drawer 1', description: 'top drawer front', type: 'box', dimensions: [20, 0.75, 7], position: [229, 24.4, 31], material: 'steel', parent: 'drawers' }],
    ['drw2', { name: 'Drawer 2', description: 'middle drawer front', type: 'box', dimensions: [20, 0.75, 7], position: [229, 24.4, 22.5], material: 'steel', parent: 'drawers' }],
    ['door', { name: 'Cupboard door', description: 'bottom door front', type: 'box', dimensions: [20, 0.75, 13], position: [229, 24.4, 9.5], material: 'steel', parent: 'drawers' }],
    ['upper', { name: 'Upper cabinets', description: 'over the sink run', type: 'group', dimensions: [], position: [0, 0, 0] }],
    ['upper-box', { name: 'Upper cabinet', description: 'bottom at 54 in', type: 'box', dimensions: [54, 12, 30], position: [165, 6, 69], material: 'cabinet', parent: 'upper' }],
    ['display', { name: 'Sliding acrylic display', description: 'slides in front of the cups', type: 'box', dimensions: [48, 0.25, 22], position: [165, 13, 66], material: 'acrylic', parent: 'upper' }],
    ['cup1', { name: 'Cup 1', description: 'on the shelf', type: 'cylinder', dimensions: [1.8, 4.5], position: [152, 7, 60], material: 'cup', parent: 'upper' }],
    ['cup2', { name: 'Cup 2', description: '', type: 'cylinder', dimensions: [1.8, 4.5], position: [165, 7, 60], material: 'cup', parent: 'upper' }],
    ['cup3', { name: 'Cup 3', description: '', type: 'cylinder', dimensions: [1.8, 4.5], position: [178, 7, 60], material: 'cup', parent: 'upper' }],
  ],
  modify: [{ key: 'display', set: { description: 'slides in front of the cups; a little higher' }, note: 'tidy the description' }],
};

// Mirror the kitchen across its centre line (x -> 240 - x), so that standing in front of the back wall,
// the fridge is on your left and the dishwasher and drawers on your right, as described.
KITCHEN.defs = KITCHEN.defs.map(([k, d]) => [k, { ...d, position: [240 - d.position[0], d.position[1], d.position[2]] }]);

const { LIVING_ROOM } = require('./living_room.js');

module.exports = { WORLD_ID, SCENES: [PLANTER, TABLE, KITCHEN, ...LIVING_ROOM] };
