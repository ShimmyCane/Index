/* Make 3D — bundles (one file holding history, world and the replayed model). Pure JS. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3D = Object.assign(root.M3D || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const G = (typeof module !== 'undefined' && module.exports)
    ? { ...require('./schema.js'), ...require('./geometry.js') }
    : (typeof self !== 'undefined' ? self : globalThis).M3D;

  function makeBundle({ history, world }) {
    const model = G.replay(history);
    return { schema: G.SCHEMA.bundle, model, history, world };
  }

  // Accepts a bundle, a history, or a plain model. Returns { history, world } or throws.
  function readBundle(obj, fallbackWorld) {
    if (!obj || typeof obj !== 'object') throw new Error('not a JSON object');
    if (obj.schema === G.SCHEMA.bundle) {
      if (!obj.history) throw new Error('bundle has no history');
      return { history: obj.history, world: obj.world || fallbackWorld };
    }
    if (obj.schema === G.SCHEMA.history || Array.isArray(obj.operations)) {
      return { history: obj, world: fallbackWorld };
    }
    if (obj.schema === G.SCHEMA.model || Array.isArray(obj.objects)) {
      return { history: G.historyFromModel(obj), world: fallbackWorld };
    }
    throw new Error('unrecognised file: expected a Make 3D bundle, history or model');
  }

  return { makeBundle, readBundle };
});
