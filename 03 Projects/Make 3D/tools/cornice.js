// Cornice profile in two rooms: a museum (24 ft wall, 14 ft picture) and a small home (9 ft wall), side by side.
// Source: Quick Detail "Profile for Cornice" (sketch_details 5b87bdcb-9cac-452b-b70d-1fb0e0031e9f, tags make3d),
// 3"=1'-0". Read 2026-11-03. Seven strokes: three closed outlines (the big "package" 8'-1", steps 1'-8 9/16"
// and 1'-4 5/16"), three freehand curves and a line. The curves and line are not modelled (see below).
//
// Sizes in inches, Z up, ground z = 0. Walls are 6 in thick. The two rooms share one wall (x = 0 to 6).
//   Museum: x -360 to 0 (30 ft), y -120 to 120 (20 ft), walls to 288 in (24 ft). Picture on the far wall.
//   Home:   x 6 to 180 (about 14 ft 6 in), y -120 to 120, walls to 108 in (9 ft).
// Each room has one person. They stand back to back across the shared wall, each facing away from it.
//
// Scale (estimate): one sketch unit = S inches. S is set by the labelled 8'-1" outline: 97 in over its
// 25.59-unit height. The sketch's other labels (for example 11 1/4" for the "tall thin step") would give a
// different scale (about 4 in per unit), so this is an estimate. Confirm with Jimmy.
//
// How the profile becomes solid: the schema has boxes, cylinders, spheres, cones and skeleton meshes, but no
// extruded outline. Each closed outline is therefore cut into horizontal slices, one sketch unit tall. Each
// slice is a box as wide as the outline is at that height (its leftmost and rightmost points). Concave
// notches are filled in, so the slices show the outline's envelope, not its exact shape. The profile is
// extruded along the whole wall (240 in). Freehand curves and the line are not included.
//
// Increments (defsFor(v)):
//   V01 blockout: rooms, people, picture, lights, and the cornice as one box (its bounding box).
//   V02 profile:  the cornice as slices of the traced outlines. The box is removed (v < 2).

const WORLD_ID = 'default-world';
const S = 3.79;          // inches per sketch unit (estimate, see above)
const REF_X = 1.53;      // sketch x at the wall face (the thin fin sits on the wall)
const LEN = 240;         // cornice length along the wall (20 ft, the room depth)

// Outline slices from the sketch: [band, xmin, xmax], band = floor(y), in sketch units.
const PROFILE = { ymin: -13.5483, ymax: 12.0457, rows: [
  [-14, 7.25, 23.23], [-13, 0.30, 21.68], [-12, 0.52, 1.80], [-11, 0.57, 1.80], [-10, 0.68, 1.80],
  [-9, 0.73, 1.80], [-8, 0.78, 1.69], [-7, 0.89, 1.69], [-6, 1.05, 1.64], [-5, 1.27, 1.64],
  [-4, 1.59, 1.64], [-3, 1.59, 1.69], [-2, 1.53, 1.85], [-1, 1.53, 1.85], [0, 1.53, 1.85],
  [1, 1.85, 1.85], [2, 1.53, 1.85], [3, 1.53, 1.91], [4, 1.53, 1.91], [5, 1.53, 1.91],
  [6, 1.53, 1.91], [7, 1.64, 1.91], [8, 1.91, 1.91], [9, 1.75, 1.91], [10, 1.91, 1.91],
  [11, 1.91, 1.91], [12, 1.91, 1.91],
] };
// Step 1'-8 9/16": a block at the foot of the profile, out to x = 22.2.
const STEP_A = { ymin: -12.8079, ymax: -7.1592, rows: [
  [-13, 21.77, 22.21], [-12, 21.77, 22.13], [-11, 21.85, 22.01], [-10, 21.38, 22.01],
  [-9, 20.11, 21.69], [-8, 15.65, 20.03],
] };
// Step 1'-4 5/16": a smaller block above it, out to x = 16.3.
const STEP_B = { ymin: -7.7523, ymax: -2.0972, rows: [
  [-8, 13.18, 16.29], [-7, 12.31, 16.00], [-6, 11.88, 12.89], [-5, 11.69, 12.22],
  [-4, 11.69, 11.88], [-3, 11.69, 11.79],
] };
const PROFILE_H = (PROFILE.ymax - PROFILE.ymin) * S;   // 97 in
const ENVELOPE_W = (23.23 - REF_X) * S;                // 82 in out from the wall

// Room geometry (absolute)
const MUSEUM = { wallX: -360, dir: 1, top: 288, zBase: 288 - PROFILE_H };   // wall face at x = -360, cornice grows toward +x
const HOME = { wallX: 180, dir: -1, top: 108, zBase: 108 - PROFILE_H };     // wall face at x = 180, cornice grows toward -x

const MATERIALS = {
  wall: { color: '#f4efe4', opacity: 1 },
  floor: { color: '#c9b89a', opacity: 1 },
  cornice: { color: '#f0d9a8', opacity: 1 },
  step: { color: '#e8c27a', opacity: 1 },
  envelope: { color: '#f0d9a8', opacity: 0.35 },
  frame: { color: '#7a5a3a', opacity: 1 },
  canvas: { color: '#9fc5e8', opacity: 1 },
  lamp: { color: '#fff2a8', opacity: 1 },
  shirt: { color: '#7fb3d5', opacity: 1 },
  pants: { color: '#3c4a5c', opacity: 1 },
  skin: { color: '#e8b894', opacity: 1 },
  ink: { color: '#2d2a26', opacity: 1 },
};

// One person, 6 ft tall, facing +X (facing = 1) or -X (facing = -1). Parts are absolute positions, as in the
// other scenes.
function person(tag, label, xc, facing) {
  const e = xc + facing * 5.2; // eyes on the front of the head
  return [
    [tag, { name: `${label} person`, type: 'group', dimensions: [], position: [0, 0, 0] }],
    [`${tag}-legL`, { name: 'Left leg', type: 'box', dimensions: [4, 5, 30], position: [xc, -3.5, 15], material: 'pants', parent: tag }],
    [`${tag}-legR`, { name: 'Right leg', type: 'box', dimensions: [4, 5, 30], position: [xc, 3.5, 15], material: 'pants', parent: tag }],
    [`${tag}-torso`, { name: 'Torso', type: 'box', dimensions: [8, 16, 26], position: [xc, 0, 43], material: 'shirt', parent: tag }],
    [`${tag}-armL`, { name: 'Left arm', type: 'box', dimensions: [3, 3, 24], position: [xc, -9.5, 42], material: 'shirt', parent: tag }],
    [`${tag}-armR`, { name: 'Right arm', type: 'box', dimensions: [3, 3, 24], position: [xc, 9.5, 42], material: 'shirt', parent: tag }],
    [`${tag}-neck`, { name: 'Neck', type: 'cylinder', dimensions: [2, 5], position: [xc, 0, 58.5], material: 'skin', parent: tag }],
    [`${tag}-head`, { name: 'Head', type: 'sphere', dimensions: [5.5], position: [xc, 0, 66.5], material: 'skin', parent: tag }],
    [`${tag}-eyeL`, { name: 'Left eye', type: 'sphere', dimensions: [1], position: [e, -2, 67.5], material: 'ink', parent: tag }],
    [`${tag}-eyeR`, { name: 'Right eye', type: 'sphere', dimensions: [1], position: [e, 2, 67.5], material: 'ink', parent: tag }],
  ];
}

// Horizontal slices of one outline, as boxes. Each slice is one sketch unit tall (or what the outline
// takes up at its ends). Slices narrower than 1.2 in are widened to 1.2 in (the minimum-dimension rule).
function slices(shape, prefix, mat, room, group) {
  const out = [];
  shape.rows.forEach(([b, xmin, xmax]) => {
    const lo = Math.max(b, shape.ymin), hi = Math.min(b + 1, shape.ymax);
    const h = (hi - lo) * S;
    if (h < 1) return; // too thin to model; the outline's top sliver
    const zc = ((lo + hi) / 2 - PROFILE.ymin) * S;   // height above the profile base
    const u0 = Math.max(0, (xmin - REF_X) * S);      // distance out from the wall
    const u1 = Math.max((xmax - REF_X) * S, u0 + 1.2);
    out.push([`${prefix}-${b}`, { name: `${prefix === 'pm' || prefix === 'ph' ? 'Profile' : 'Step'} slice ${b}`, type: 'box', dimensions: [u1 - u0, LEN, h],
      position: [room.wallX + room.dir * (u0 + u1) / 2, 0, room.zBase + zc], material: mat, parent: group }]);
  });
  return out;
}

// v >= 1: rooms, people, picture, lamps; v < 2: the cornice as one box (blockout); v >= 2: the traced profile.
function defsFor(v) {
  const d = [];
  const add = (k, o) => d.push([k, o]);

  // Rooms
  add('ground', { name: 'Floor', description: 'both rooms', type: 'box', dimensions: [372, 252, 1], position: [-90, 0, -0.5], material: 'floor' });
  add('wall-museum-back', { name: 'Museum picture wall', type: 'box', dimensions: [6, 252, 288], position: [-363, 0, 144], material: 'wall' });
  add('wall-museum-left', { name: 'Museum side wall (left)', type: 'box', dimensions: [372, 6, 288], position: [-180, -123, 144], material: 'wall' });
  add('wall-museum-right', { name: 'Museum side wall (right)', type: 'box', dimensions: [372, 6, 288], position: [-180, 123, 144], material: 'wall' });
  add('wall-shared', { name: 'Shared wall', description: 'between the two rooms', type: 'box', dimensions: [6, 252, 288], position: [3, 0, 144], material: 'wall' });
  add('wall-home-far', { name: 'Home far wall', type: 'box', dimensions: [6, 252, 108], position: [183, 0, 54], material: 'wall' });
  add('wall-home-left', { name: 'Home side wall (left)', type: 'box', dimensions: [174, 6, 108], position: [93, -123, 54], material: 'wall' });
  add('wall-home-right', { name: 'Home side wall (right)', type: 'box', dimensions: [174, 6, 108], position: [93, 123, 54], material: 'wall' });

  // Picture: 14 ft tall, 10 ft wide, under the cornice
  add('frame', { name: 'Picture frame', description: '14 ft by 10 ft', type: 'box', dimensions: [2, 124, 172], position: [-359, 0, 96], material: 'frame' });
  add('canvas', { name: 'Picture', description: 'canvas', type: 'box', dimensions: [0.6, 112, 160], position: [-357.7, 0, 96], material: 'canvas' });

  // Lamps under the cornice, aimed at the picture
  [-80, -40, 0, 40, 80].forEach((y, i) => add(`lamp-${i + 1}`, { name: `Lamp ${i + 1}`, description: 'picture light', type: 'sphere', dimensions: [3], position: [-300, y, 186], material: 'lamp' }));

  // People, back to back across the shared wall
  d.push(...person('p-museum', 'Museum', -8, -1));
  d.push(...person('p-home', 'Home', 14, 1));

  // v < 2: blockout box for each cornice
  if (v < 2) {
    add('env-museum', { name: 'Museum cornice (blockout)', description: 'bounding box of the profile', type: 'box', dimensions: [ENVELOPE_W, LEN, PROFILE_H], position: [MUSEUM.wallX + ENVELOPE_W / 2, 0, MUSEUM.zBase + PROFILE_H / 2], material: 'envelope' });
    add('env-home', { name: 'Home cornice (blockout)', description: 'bounding box of the profile', type: 'box', dimensions: [ENVELOPE_W, LEN, PROFILE_H], position: [HOME.wallX - ENVELOPE_W / 2, 0, HOME.zBase + PROFILE_H / 2], material: 'envelope' });
  }

  // v >= 2: the traced profile in each room, with its two steps
  if (v >= 2) {
    for (const [room, tag, label] of [[MUSEUM, 'pm', 'Museum'], [HOME, 'ph', 'Home']]) {
      const gid = `${tag}-cornice`;
      add(gid, { name: `${label} cornice`, description: 'the traced profile, with its two steps', type: 'group', dimensions: [], position: [0, 0, 0] });
      const sliceDefs = [
        ...slices(PROFILE, tag, 'cornice', room, gid),
        ...slices(STEP_A, `${tag}-a`, 'step', room, gid),
        ...slices(STEP_B, `${tag}-b`, 'step', room, gid),
      ];
      for (const [k, o] of sliceDefs) add(k, o);
    }
  }

  return d;
}

const CORNICE_V01 = {
  id: 'cornice-v01',
  header: {
    model_id: 'cornice-v01',
    name: 'Cornice V01',
    description: 'Museum (24 ft wall, 14 ft picture under the cornice) and a 9 ft home, side by side, one person in each, back to back across the shared wall. V01: the cornice as one box.',
    units: 'in', up: 'z', world: WORLD_ID, materials: MATERIALS,
  },
  defs: defsFor(1),
};

const CORNICE_V02 = {
  id: 'cornice-v02',
  header: {
    model_id: 'cornice-v02',
    name: 'Cornice V02',
    description: 'Same two rooms. V02: the cornice from the traced profile (slices of its outline, with the two steps).',
    units: 'in', up: 'z', world: WORLD_ID, materials: MATERIALS,
  },
  defs: defsFor(2),
};

module.exports = { CORNICE: [CORNICE_V01, CORNICE_V02], PROFILE_H, S };
