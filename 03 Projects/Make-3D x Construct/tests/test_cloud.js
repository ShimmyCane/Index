// Node tests for the cloud client and the library, with a fake Supabase. No network. Run: node tests/test_cloud.js
const assert = require('assert');
const C = require('../js/cloud/cloud.js');
const Lib = require('../js/library/library.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }

// A fake supabase-js: records calls, returns what the test sets.
function fakeLib(opts = {}) {
  const calls = [];
  const q = (table) => {
    const chain = {
      select(cols) { calls.push(['select', table, cols]); return chain; },
      eq(col, v) { calls.push(['eq', col, v]); return chain; },
      order() { return chain; }, limit() { return chain; },
      single() { return Promise.resolve(opts.single || { data: null, error: null }); },
      upsert(row, o) { calls.push(['upsert', table, row, o]); return Promise.resolve(opts.upsert || { data: null, error: null }); },
      then(res, rej) { return Promise.resolve(opts.select || { data: [], error: null }).then(res, rej); },
    };
    return chain;
  };
  return {
    calls,
    createClient(url, key) { calls.push(['client', url, key]); return {
      from: q,
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInWithOtp: async (a) => { calls.push(['otp', a]); return { error: opts.otpError || null }; },
        verifyOtp: async () => ({ data: { session: { user: { id: 'u' } } }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: {} } }),
      } }; },
  };
}

const scene = { model: { model_id: 'plains-diorama-v05', name: 'Camp', description: 'd', version: 9 },
  history: { operations: [] }, world: { name: 'w' } };

test('the client is built from the public URL and the publishable key, and says so', () => {
  const lib = fakeLib();
  C.createCloud(lib);
  assert.strictEqual(lib.calls[0][1], 'https://xabgankckrcuhcgdolrg.supabase.co');
  assert(String(lib.calls[0][2]).startsWith('sb_publishable_'));
});

test('a missing library says so, rather than failing', () => {
  assert.strictEqual(C.createCloud(null).available, false);
});

test('the sign-in code is sent only to an existing account (no new users from this page)', async () => {
  const lib = fakeLib();
  const cloud = C.createCloud(lib);
  await cloud.sendCode('owner@example.com');
  const otp = lib.calls.find(c => c[0] === 'otp');
  assert.strictEqual(otp[1].options.shouldCreateUser, false);
});

test('a failed code send gives a plain message', async () => {
  const cloud = C.createCloud(fakeLib({ otpError: new Error('Failed to fetch') }));
  await assert.rejects(cloud.sendCode('x@example.com'), /No connection/);
});

test('a scene row carries the history (source), the world (rules) and the model (replayed), keyed by model_id', () => {
  const row = C.sceneRow(scene, '2026-11-18T00:00:00Z');
  assert.strictEqual(row.model_id, 'plains-diorama-v05');
  assert.deepStrictEqual(Object.keys(row.bundle).sort(), ['history', 'model', 'world']);
  assert.strictEqual(row.version, 9);
});

test('saving upserts by model_id', async () => {
  const lib = fakeLib();
  const cloud = C.createCloud(lib);
  const id = await cloud.saveScene(scene, '2026-11-18T00:00:00Z');
  const up = lib.calls.find(c => c[0] === 'upsert');
  assert.strictEqual(id, 'plains-diorama-v05');
  assert.strictEqual(up[1], 'm3dxc_scenes');
  assert.deepStrictEqual(up[3], { onConflict: 'model_id' });
});

test('a missing table is explained, with the file to apply', async () => {
  const cloud = C.createCloud(fakeLib({ select: { data: null, error: new Error('relation "public.m3dxc_scenes" does not exist') } }));
  const r = await cloud.check();
  assert.strictEqual(r.ok, false);
  assert(r.text.includes('002_m3dxc_scenes.sql'));
});

test('the library saves by model_id, replaces on save, and lists newest first', () => {
  const lib = Lib.createLibrary(Lib.memoryStore());
  lib.save(scene, '2026-11-18T01:00:00Z');
  lib.save(Object.assign({}, scene, { model: Object.assign({}, scene.model, { name: 'Camp v2' }) }), '2026-11-18T02:00:00Z');
  assert.strictEqual(lib.count(), 1);
  assert.strictEqual(lib.get('plains-diorama-v05').name, 'Camp v2');
  lib.save({ model: { model_id: 'other', name: 'Other' }, history: {}, world: {} }, '2026-11-18T03:00:00Z');
  assert.deepStrictEqual(lib.list().map(s => s.model_id), ['other', 'plains-diorama-v05']);
});

test('a browser store that is blocked gives a message, not a crash', () => {
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const lib = Lib.createLibrary(Lib.browserStore(blocked));
  assert.deepStrictEqual(lib.list(), []);
  assert.strictEqual(lib.save(scene).ok, false);
});

console.log(passed + ' cloud and library tests passed');
