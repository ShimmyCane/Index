/* Make 3D — schema constants, defaults and shape checks. Pure JS. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3D = Object.assign(root.M3D || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const SCHEMA = {
    model: 'make3d.model/0.1',
    history: 'make3d.history/0.1',
    world: 'make3d.world/0.1',
    bundle: 'make3d.bundle/0.1',
  };
  const TYPES = ['group', 'box', 'cylinder', 'sphere', 'cone'];
  // dimensions per type: box [x, y, z]; cylinder/cone [radius, height]; sphere [radius]; group []
  const DIM_COUNT = { group: 0, box: 3, cylinder: 2, sphere: 1, cone: 2 };

  function newUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-4${s.slice(13, 16)}-a${s.slice(17, 20)}-${s.slice(20)}`;
  }

  // Fill defaults without dropping unknown fields.
  function normaliseObject(o) {
    return Object.assign({
      description: '',
      rotation_y: 0,
      parent: null,
      material: null,
      tags: [],
      allowed_overlap: [],
    }, o);
  }

  // Header fields that are not objects. Kept on history.header and copied into each model.
  function headerFromModel(model) {
    const { objects, version, ...header } = model; // eslint-disable-line no-unused-vars
    return header;
  }

  return { SCHEMA, TYPES, DIM_COUNT, newUuid, normaliseObject, headerFromModel };
});
