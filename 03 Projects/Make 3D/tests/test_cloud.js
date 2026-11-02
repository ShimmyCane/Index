// Cloud client against a fake supabase-js. Checks table names, filters, payloads and error messages.
// Run: node tests/test_cloud.js
const assert = require('assert');
const path = require('path');
const C = require(path.join(__dirname, '../js/cloud/cloud.js'));

function fakeLib({ rows = [], fail = null, sessionOut = null } = {}) {
  const calls = [];
  const builder = (table) => {
    const q = { table, ops: [] };
    const chain = new Proxy(q, {
      get(target, prop) {
        if (prop === 'then') return (res, rej) => (fail ? Promise.resolve({ data: null, error: fail }) : Promise.resolve({ data: rows, error: null })).then(res, rej);
        if (prop === 'single') return () => { q.ops.push(['single']); return Promise.resolve({ data: rows[0] || null, error: fail }); };
        return (...args) => { q.ops.push([prop, ...args]); return chain; };
      },
    });
    calls.push(q);
    return chain;
  };
  return {
    calls,
    createClient(url, key, opts) {
      this.url = url; this.key = key; this.opts = opts;
      return {
        from: builder,
        auth: {
          getSession: async () => ({ data: { session: sessionOut } }),
          signInWithOtp: async (o) => { this.otp = o; return { error: fail }; },
          verifyOtp: async () => ({ data: { session: { user: { email: 'x' } } }, error: null }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: {} } }),
        },
      };
    },
  };
}

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('ok', name); };

(async () => {
  await t('cloud: unavailable when the library did not load', async () => {
    const c = C.createCloud(null);
    assert.strictEqual(c.available, false);
  });

  await t('cloud: uses the Architecture project and the publishable key, with session persistence', async () => {
    const lib = fakeLib();
    C.createCloud(lib);
    assert.strictEqual(lib.url, 'https://xabgankckrcuhcgdolrg.supabase.co');
    assert.match(lib.key, /^sb_publishable_/);
    assert.strictEqual(lib.opts.auth.persistSession, true);
  });

  await t('cloud: sign-in never creates a new user from the page', async () => {
    const lib = fakeLib();
    const c = C.createCloud(lib, undefined, { redirectTo: 'https://example.github.io/Make%203D/' });
    await c.sendCode('owner@example.com');
    assert.strictEqual(lib.otp.options.shouldCreateUser, false);
    assert.strictEqual(lib.otp.options.emailRedirectTo, 'https://example.github.io/Make%203D/');
  });

  await t('cloud: no redirect from file:// (code entry still works)', async () => {
    const lib = fakeLib();
    const c = C.createCloud(lib);
    await c.sendCode('owner@example.com');
    assert.strictEqual('emailRedirectTo' in lib.otp.options, false);
  });

  await t('cloud: references read sketch_details by the make 3-D tag, not deleted rows', async () => {
    const lib = fakeLib({ rows: [{ id: 'd1', name: 'Window head', tags: ['make 3-D'] }] });
    const c = C.createCloud(lib);
    const rows = await c.listReferences();
    assert.strictEqual(rows[0].name, 'Window head');
    const q = lib.calls[lib.calls.length - 1];
    assert.strictEqual(q.table, 'sketch_details');
    assert.deepStrictEqual(q.ops.find((o) => o[0] === 'contains'), ['contains', 'tags', ['make 3-D']]);
    assert.deepStrictEqual(q.ops.find((o) => o[0] === 'is'), ['is', 'deleted_at', null]);
  });

  await t('cloud: references never write', async () => {
    const lib = fakeLib({ rows: [] });
    await C.createCloud(lib).listReferences();
    const names = lib.calls[lib.calls.length - 1].ops.map((o) => o[0]);
    for (const w of ['insert', 'upsert', 'update', 'delete']) assert.ok(!names.includes(w));
  });

  await t('cloud: saving upserts one row per model_id into m3d_scenes with the bundle and model', async () => {
    const lib = fakeLib();
    const c = C.createCloud(lib);
    const bundle = { schema: 'make3d.bundle/0.1', model: { model_id: 'kitchen', name: 'Kitchen', description: 'd', version: 29, objects: [] }, history: {}, world: {} };
    const id = await c.saveScene(bundle, '2026-11-02T00:00:00Z');
    assert.strictEqual(id, 'kitchen');
    const q = lib.calls[lib.calls.length - 1];
    assert.strictEqual(q.table, 'm3d_scenes');
    const up = q.ops.find((o) => o[0] === 'upsert');
    assert.strictEqual(up[1].model_id, 'kitchen');
    assert.strictEqual(up[1].version, 29);
    assert.deepStrictEqual(up[2], { onConflict: 'model_id' });
  });

  await t('cloud: errors are plain, and network failures say so', async () => {
    const lib = fakeLib({ fail: { message: 'Failed to fetch' } });
    await assert.rejects(C.createCloud(lib).listScenes(), /No connection/);
    const lib2 = fakeLib({ fail: { message: 'JWT expired' } });
    await assert.rejects(C.createCloud(lib2).listScenes(), /sign in again/);
  });

  console.log(`\n${n} cloud test groups passed`);
})().catch((e) => { console.error(e); process.exit(1); });
