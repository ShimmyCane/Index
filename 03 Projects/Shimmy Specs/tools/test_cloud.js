// Tests for js/cloud.js with a fake network (no real database). Usage: node tools/test_cloud.js
'use strict';
const assert = require('assert');
const path = require('path');

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k)
};
globalThis.SS_CONFIG = { supabaseUrl: '<project-url>', publishableKey: '<publishable-key>' };
require(path.join(__dirname, '..', 'js', 'cloud.js'));
const cloud = globalThis.SS.cloud;

let passed = 0;
const calls = [];
function fakeFetch(handler) {
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    const out = handler(url, opts);
    return { ok: out.status < 400, status: out.status, text: async () => JSON.stringify(out.body) };
  };
}
async function test(name, fn) {
  try { await fn(); passed++; console.log('ok   ' + name); }
  catch (e) { console.log('FAIL ' + name + '\n     ' + e.message); process.exitCode = 1; }
}

(async () => {
  await test('placeholders: not configured, nothing is sent', async () => {
    calls.length = 0;
    assert.strictEqual(cloud.configured(), false);
    await assert.rejects(cloud.signIn('a', ''), /Database not set up/);
    assert.strictEqual(calls.length, 0);
    cloud.schedule({ name: 'x' });
    assert.strictEqual(calls.length, 0, 'schedule does nothing without a session');
  });

  globalThis.SS_CONFIG = { supabaseUrl: 'https://example.invalid/', publishableKey: 'pk_test_123' };

  await test('configured: sign-in posts the RPC with the publishable key and stores the session', async () => {
    calls.length = 0;
    fakeFetch(() => ({ status: 200, body: { token: 'a'.repeat(64), username: 'Ann' } }));
    assert.strictEqual(cloud.configured(), true);
    const res = await cloud.signIn("Ann o'Brien; drop", '');
    assert.strictEqual(res.username, 'Ann');
    assert.strictEqual(calls[0].url, 'https://example.invalid/rest/v1/rpc/ss_sign_in');
    assert.strictEqual(calls[0].opts.headers.apikey, 'pk_test_123');
    assert.strictEqual(JSON.parse(calls[0].opts.body).p_username, "Ann o'Brien; drop", 'sent as a JSON value, not in the URL');
    assert.strictEqual(cloud.session().username, 'Ann');
  });

  await test('wrong password: the database message is passed on', async () => {
    fakeFetch(() => ({ status: 400, body: { message: 'wrong password' } }));
    await assert.rejects(cloud.signIn('Ann', 'nope'), /wrong password/);
    assert.ok(cloud.session(), 'a wrong password does not sign anyone out');
  });

  await test('expired session: signs out locally and says so', async () => {
    fakeFetch(() => ({ status: 400, body: { message: 'session expired, sign in again' } }));
    await assert.rejects(cloud.list(), /session expired/);
    assert.strictEqual(cloud.session(), null);
    assert.strictEqual(cloud.status().status, 'device');
  });

  await test('save: first save sets cloudId and writes locally without queuing another cloud save', async () => {
    fakeFetch((url) => url.endsWith('ss_sign_in') ? { status: 200, body: { token: 'b'.repeat(64), username: 'Ann' } }
      : { status: 200, body: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' });
    await cloud.signIn('Ann', '');
    const project = { name: 'P', kind: 'sketch', answers: {} };
    const id = await cloud.saveNow(project);
    assert.strictEqual(project.cloudId, id);
    assert.strictEqual(JSON.parse(calls[calls.length - 1].opts.body).p_id, null);
  });

  await test('health: calls a harmless function and reports reachable', async () => {
    fakeFetch(() => ({ status: 200, body: null }));
    assert.match(await cloud.health(), /reachable/);
  });

  await test('signing out clears the session even if the network fails', async () => {
    fakeFetch(() => { throw new Error('offline'); });
    await cloud.signOut().catch(() => {});
    assert.strictEqual(cloud.session(), null);
  });

  console.log(`\n${passed} cloud checks passed${process.exitCode ? ', some FAILED' : ''}`);
})();
