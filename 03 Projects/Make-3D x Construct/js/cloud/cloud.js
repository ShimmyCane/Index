/* Make 3D x Construct: cloud client (the Architecture project, same as Make 3D). Browser and Node.
   One table: public.m3dxc_scenes, one row per scene version (model_id). Owner only, by row-level security.
   Sign-in: an email code to an EXISTING account only (shouldCreateUser: false). The publishable key is meant for
   browsers; the database policies do the protecting. Nothing here is a secret. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.M3DXC = Object.assign(root.M3DXC || {}, { cloud: api });
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const CONFIG = {
    url: 'https://xabgankckrcuhcgdolrg.supabase.co',
    key: 'sb_publishable_kncKodoYJZ6ByexwWM_TtQ_OpW68M5f',
    scenesTable: 'm3dxc_scenes',
  };

  function friendly(err) {
    const msg = (err && err.message) || String(err);
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'No connection to the database. Try again when you are online.';
    if (/does not exist|schema cache|Could not find the table|relation .* does not exist/i.test(msg)) return 'The table is not applied yet. Ask Jimmy to copy supabase/002_m3dxc_scenes.sql into the project.';
    if (/JWT|expired|not authenticated|permission|row-level/i.test(msg)) return 'Please sign in again.';
    return msg;
  }

  // The row that goes to the table, from a saved scene. Pure, so tests can check it.
  function sceneRow(scene, now = new Date().toISOString()) {
    const m = scene.model || {};
    return {
      model_id: m.model_id || scene.model_id,
      name: m.name || scene.name || '',
      description: m.description || '',
      version: m.version || 0,
      bundle: { history: scene.history, world: scene.world, model: m },
      updated_at: now,
    };
  }

  // lib: the supabase-js module (window.supabase in the browser). Pass a fake in tests.
  function createCloud(lib, cfg = CONFIG, opts = {}) {
    if (!lib || typeof lib.createClient !== 'function') {
      return { available: false, reason: 'The cloud library did not load. Check the connection and reload.' };
    }
    const client = lib.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const redirect = opts.redirectTo;
    const ok = (r) => { if (r.error) throw new Error(friendly(r.error)); return r.data; };

    return {
      available: true,
      config: cfg,
      async session() { const r = await client.auth.getSession(); return (r.data && r.data.session) || null; },
      onChange(fn) { return client.auth.onAuthStateChange((event, session) => fn(event, session || null)); },
      async sendCode(email) {
        ok(await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, ...(redirect ? { emailRedirectTo: redirect } : {}) } }));
        return true;
      },
      async verifyCode(email, token) { return ok(await client.auth.verifyOtp({ email, token, type: 'email' })).session; },
      async signOut() { ok(await client.auth.signOut()); return true; },

      async listScenes() {
        return ok(await client.from(cfg.scenesTable)
          .select('model_id, name, description, version, updated_at')
          .order('updated_at', { ascending: false }));
      },
      async loadScene(modelId) {
        const row = ok(await client.from(cfg.scenesTable).select('bundle').eq('model_id', modelId).single());
        return row.bundle;
      },
      async saveScene(scene, now) {
        const row = sceneRow(scene, now);
        ok(await client.from(cfg.scenesTable).upsert(row, { onConflict: 'model_id' }));
        return row.model_id;
      },
      // A read that proves the table exists and the signed-in owner can see it. Returns a message for the page.
      async check() {
        try { ok(await client.from(cfg.scenesTable).select('model_id').limit(1)); return { ok: true, text: 'Cloud table reachable.' }; }
        catch (e) { return { ok: false, text: friendly(e) }; }
      },
    };
  }

  return { CONFIG, createCloud, sceneRow, cloudFriendly: friendly };
});
