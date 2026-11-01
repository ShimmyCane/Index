// Builds the garden planter sample from its operation list, replays it, checks it,
// writes models/garden-planter/{history,model}.json and js/samples.bundle.js.
// Run: node tools/build_samples.js   (from the project folder)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const G = require(path.join(root, 'js/core/geometry.js'));
const R = require(path.join(root, 'js/core/rules.js'));
const S = require(path.join(root, 'js/core/schema.js'));
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds/default-world.json'), 'utf8'));

const header = {
  model_id: 'garden-planter',
  name: 'Garden planter',
  description: 'A sunny trough planter with snap peas and lettuce, on a stone path by a short picket fence. Sample for v0.1.',
  units: 'in',
  up: 'z',
  world: 'default-world',
  materials: {
    clay:    { color: '#e8a07a', opacity: 1 },
    soil:    { color: '#7a5a43', opacity: 1 },
    pea:     { color: '#7fc97a', opacity: 1 },
    stem:    { color: '#5f9e5a', opacity: 1 },
    lettuce: { color: '#c4e8b0', opacity: 1 },
    stone:   { color: '#e9e4d8', opacity: 1 },
    wood:    { color: '#f6e7c8', opacity: 1 },
    sun:     { color: '#ffd96a', opacity: 1 },
  },
};

// Object definitions: [key, object]. Keys become stable uuids for the sample (readable, unique).
const defs = [
  ['pot',      { name: 'Trough', description: 'the planter box', type: 'box', dimensions: [36, 12, 14], position: [0, 0, 7], material: 'clay' }],
  ['soil',     { name: 'Soil', description: 'sits inside the rim', type: 'box', dimensions: [34, 10, 1.5], position: [0, 0, 14.75], material: 'soil' }],
  ['peas',     { name: 'Snap peas', description: 'climbing peas on the left', type: 'group', dimensions: [], position: [-10, 0, 0] }],
  ['lettuce',  { name: 'Lettuce', description: 'three heads on the right', type: 'group', dimensions: [], position: [11, 0, 0] }],
  ['pea1',     { name: 'Pea stem 1', description: '', type: 'cylinder', dimensions: [0.3, 12], position: [-12, 0, 21.5], material: 'stem', parent: 'peas' }],
  ['pea2',     { name: 'Pea stem 2', description: '', type: 'cylinder', dimensions: [0.3, 14], position: [-8, 0, 22.5], material: 'stem', parent: 'peas' }],
  ['pea3',     { name: 'Pea stem 3', description: 'tip bends over', type: 'cylinder', dimensions: [0.3, 10], position: [-4, 0, 20.5], material: 'stem', parent: 'peas', rotation_y: 20 }],
  ['pod1',     { name: 'Pea pod 1', description: '', type: 'sphere', dimensions: [1.2], position: [-12.5, 0, 25], material: 'pea', parent: 'peas' }],
  ['pod2',     { name: 'Pea pod 2', description: '', type: 'sphere', dimensions: [1.2], position: [-7.5, 0, 27], material: 'pea', parent: 'peas' }],
  ['pod3',     { name: 'Pea pod 3', description: '', type: 'sphere', dimensions: [1.2], position: [-3.5, 0, 24], material: 'pea', parent: 'peas' }],
  ['tip',      { name: 'Pea tendril', description: 'a small cone tip', type: 'cone', dimensions: [0.6, 2.5], position: [-12, 0, 28.25], material: 'stem', parent: 'peas' }],
  ['head1',    { name: 'Lettuce head 1', description: '', type: 'sphere', dimensions: [3.5], position: [7, 0, 19], material: 'lettuce', parent: 'lettuce' }],
  ['head2',    { name: 'Lettuce head 2', description: '', type: 'sphere', dimensions: [3.5], position: [11, 0, 19.5], material: 'lettuce', parent: 'lettuce' }],
  ['head3',    { name: 'Lettuce head 3', description: '', type: 'sphere', dimensions: [3.5], position: [15, 0, 19], material: 'lettuce', parent: 'lettuce' }],
  ['path',     { name: 'Stone path', description: 'in front of the trough', type: 'box', dimensions: [72, 18, 0.5], position: [0, -20, 0.25], material: 'stone' }],
  ['fence',    { name: 'Picket fence', description: 'behind the trough', type: 'group', dimensions: [], position: [0, 0, 0] }],
  ['picket1',  { name: 'Picket 1', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [-24, 22, 15], material: 'wood', parent: 'fence' }],
  ['picket2',  { name: 'Picket 2', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [-20, 22, 15], material: 'wood', parent: 'fence' }],
  ['picket3',  { name: 'Picket 3', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [-16, 22, 15], material: 'wood', parent: 'fence' }],
  ['picket4',  { name: 'Picket 4', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [16, 22, 15], material: 'wood', parent: 'fence' }],
  ['picket5',  { name: 'Picket 5', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [20, 22, 15], material: 'wood', parent: 'fence' }],
  ['picket6',  { name: 'Picket 6', description: '', type: 'box', dimensions: [1.5, 0.75, 30], position: [24, 22, 15], material: 'wood', parent: 'fence' }],
  ['sun',      { name: 'Sun', description: 'high and to the left, sets the light', type: 'sphere', dimensions: [6], position: [-70, -40, 110], material: 'sun' }],
];

const ops = [];
let seq = 0;
const t0 = Date.parse('2026-11-01T10:00:00Z');
const stamp = () => new Date(t0 + seq * 60000).toISOString();
const uuidOf = (key) => `pl-${key}`;
const objectFor = (key, d) => {
  const o = { uuid: uuidOf(key), name: d.name, description: d.description, type: d.type,
    dimensions: d.dimensions, position: d.position, rotation_y: d.rotation_y || 0,
    parent: d.parent ? uuidOf(d.parent) : null, material: d.material || null };
  return o;
};
const keyToUuid = new Map(defs.map(([k]) => [k, uuidOf(k)]));

// Add groups first so children can refer to a parent that already exists.
for (const [key, d] of defs) {
  seq++;
  ops.push({ seq, op: 'add', time: stamp(), author: 'jimmy', note: `add ${d.name}`,
    object: objectFor(key, { ...d, parent: d.parent }) });
}
// v0.6 history demo: a later change to one lettuce head, recorded as an operation, not an overwrite.
seq++;
ops.push({ seq, op: 'modify', time: stamp(), author: 'chat', note: 'larger middle lettuce head',
  uuid: uuidOf('head2'), set: { dimensions: [4] } });

// Sanity: every parent reference resolves, and the history replays cleanly.
const history = { schema: S.SCHEMA.history, model_id: header.model_id, header, operations: ops };
let model = G.emptyModel(header);
for (const op of ops) {
  const r = R.checkOperation(model, op, world);
  if (r.outcome === 'reject') throw new Error(`sample op ${op.seq} rejected: ${JSON.stringify(r.issues)}`);
  model = G.applyOperation(model, op);
}
const check = R.checkModel(model, world);
console.log(`sample: ${model.objects.length} objects, version ${model.version}, model check: ${check.outcome} (${check.issues.length} issue(s))`);
for (const i of check.issues) console.log('  -', i.severity, i.message, i.uuid);

const dir = path.join(root, 'models/garden-planter');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'history.json'), JSON.stringify(history, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'model.json'), JSON.stringify(G.replay(history), null, 2) + '\n');

const bundle = { schema: S.SCHEMA.bundle, model: G.replay(history), history, world };
const js = '/* Generated by tools/build_samples.js. Do not edit by hand. */\n' +
  'window.M3D_SAMPLES = ' + JSON.stringify({ 'garden-planter': bundle }) + ';\n';
fs.writeFileSync(path.join(root, 'js/samples.bundle.js'), js);
console.log('wrote models/garden-planter/{history,model}.json and js/samples.bundle.js');
