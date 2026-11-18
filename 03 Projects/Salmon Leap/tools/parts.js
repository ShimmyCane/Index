// Shared part helpers for the salmon versions. Each part has a certainty (percent, basis, note).
// Lofts take joints (absolute, inches) and rings [t, w, h]; their position and size are the bounding box.
const round = (v) => Math.round(v * 100) / 100;

function makeList() {
  const objects = [], flags = [];
  const grp = (uuid, name, parent, description) =>
    objects.push({ uuid, name, type: 'group', parent, ...(description ? { description } : {}) });
  const part = (uuid, name, type, parent, dims, pos, material, cert, rot, description) => {
    const o = { uuid, name, type, parent, dimensions: dims, position: pos.map(round), material, certainty: cert, ...(rot || {}) };
    if (description) o.description = description;
    objects.push(o);
    return o;
  };
  // A lofted surface. facing = the direction of the half-width w.
  const loftPart = (uuid, name, parent, joints, rings, facing, material, cert, description) => {
    const maxR = Math.max(...rings.map(q => Math.max(q[1], q[2])));
    const lo = [0, 1, 2].map(k => Math.min(...joints.map(p => p[k])) - maxR);
    const hi = [0, 1, 2].map(k => Math.max(...joints.map(p => p[k])) + maxR);
    const o = {
      uuid, name, type: 'loft', parent,
      joints: joints.map(p => p.map(round)), rings: rings.map(q => q.map(round)),
      dimensions: { x: round(hi[0] - lo[0]), y: round(hi[1] - lo[1]), z: round(hi[2] - lo[2]) },
      position: [0, 1, 2].map(k => round((lo[k] + hi[k]) / 2)),
      material, certainty: cert,
    };
    if (facing) o.facing = facing;
    if (description) o.description = description;
    objects.push(o);
    return o;
  };
  const flag = (id, kind, target, text) => flags.push({ id, kind, target, text });
  return { objects, flags, grp, part, loftPart, flag };
}

const C = (percent, note, basis) => ({ percent, basis: basis || 'inferred', note });

module.exports = { makeList, C, round };
