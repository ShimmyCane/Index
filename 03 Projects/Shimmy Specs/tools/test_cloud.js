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
    fakeFetch(() => ({ status: 200, body: { ok: true, token: 'a'.repeat(64), username: 'Ann' } }));
    assert.strictEqual(cloud.configured(), true);
    const res = await cloud.signIn("Ann o'Brien; drop", '');
    assert.strictEqual(res.username, 'Ann');
    assert.strictEqual(calls[0].url, 'https://example.invalid/rest/v1/rpc/ss_sign_in');
    assert.strictEqual(calls[0].opts.headers.apikey, 'pk_test_123');
    assert.strictEqual(JSON.parse(calls[0].opts.body).p_username, "Ann o'Brien; drop", 'sent as a JSON value, not in the URL');
    assert.strictEqual(cloud.session().username, 'Ann');
  });

  await test('wrong password and lockout: returned as ok false, message passed on, session kept', async () => {
    fakeFetch(() => ({ status: 200, body: { ok: false, error: 'wrong password' } }));
    await assert.rejects(cloud.signIn('Ann', 'nope'), /wrong password/);
    fakeFetch(() => ({ status: 200, body: { ok: false, error: 'too many wrong passwords: wait 15 minutes and try again' } }));
    await assert.rejects(cloud.signIn('Ann', ''), /too many wrong passwords/);
    assert.ok(cloud.session(), 'a failed sign-in does not sign anyone out');
  });

  await test('a database refusal (unlisted username) reaches the user', async () => {
    fakeFetch(() => ({ status: 400, body: { message: 'this username is not allowed to sign in' } }));
    await assert.rejects(cloud.signIn('stranger', ''), /not allowed/);
  });

  await test('expired session: signs out locally and says so', async () => {
    fakeFetch(() => ({ status: 400, body: { message: 'session expired, sign in again' } }));
    await assert.rejects(cloud.list(), /session expired/);
    assert.strictEqual(cloud.session(), null);
    assert.strictEqual(cloud.status().status, 'device');
  });

  await test('save: first save sets cloudId and writes locally without queuing another cloud save', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    fakeFetch((url) => url.endsWith('ss_sign_in') ? { status: 200, body: { ok: true, token: 'b'.repeat(64), username: 'Ann' } }
      : url.endsWith('ss_list_projects') ? { status: 200, body: [{ id, name: 'P', kind: 'sketch', updated_at: 'T1' }] }
      : { status: 200, body: id });
    await cloud.signIn('Ann', '');
    const project = { name: 'P', kind: 'sketch', answers: {} };
    const saved = await cloud.saveNow(project);
    assert.strictEqual(saved, id);
    assert.strictEqual(project.cloudId, id);
    assert.strictEqual(project.cloudBase.updatedAt, 'T1');
    assert.strictEqual(JSON.parse(calls.filter((c) => c.url.endsWith('ss_save_project'))[0].opts.body).p_id, null);
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

  // ---- sync rules, with a small in-memory stand-in for the device store
  const local = new Map();
  let nextId = 0;
  globalThis.SS.store = {
    newId: () => 'local-' + (++nextId),
    writeProject: (p) => local.set(p.id, JSON.parse(JSON.stringify(p))),
    findByCloudId: (cid) => [...local.values()].find((p) => p.cloudId === cid),
    settings: () => ({ databaseManagement: true, autoSave: true, keepNames: 'Keep me' })
  };
  localStorage.setItem('ss.session', JSON.stringify({ token: 'a'.repeat(64), username: 'Ann' }));
  const CID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const row = (updated) => ({ id: CID, name: 'Shared', kind: 'sketch', updated_at: updated });
  // A local copy that was last synced when the cloud row was at 'T1'.
  function linked(extra) {
    const p = Object.assign({ id: 'L1', name: 'Shared', kind: 'sketch', answers: { a: 1 }, cloudId: CID }, extra || {});
    p.cloudBase = { updatedAt: 'T1', hash: cloud.hashOf(p) };
    return p;
  }

  await test('sync: each case of the rule', async () => {
    const base = linked();
    assert.strictEqual(cloud.syncStatus(row('T1'), undefined), 'download', 'no local copy');
    assert.strictEqual(cloud.syncStatus(row('T1'), { id: 'x', answers: {} }), 'conflict', 'local copy without a base');
    assert.strictEqual(cloud.syncStatus(row('T1'), base), 'same');
    assert.strictEqual(cloud.syncStatus(row('T2'), base), 'download', 'only the cloud changed');
    const edited = Object.assign({}, base, { answers: { a: 2 } });
    assert.strictEqual(cloud.syncStatus(row('T1'), edited), 'upload', 'only this device changed');
    assert.strictEqual(cloud.syncStatus(row('T2'), edited), 'conflict', 'both changed');
  });

  await test('sync: the timestamp alone does not count as a change', async () => {
    const base = linked({ updated: '2026-11-19T10:00:00Z' });
    base.updated = '2026-11-19T11:00:00Z';
    assert.strictEqual(cloud.syncStatus(row('T1'), base), 'same');
  });

  await test('conflict: an auto save never overwrites a changed cloud copy', async () => {
    local.clear();
    calls.length = 0;
    fakeFetch((url) => url.endsWith('ss_list_projects') ? { status: 200, body: [row('T2')] } : { status: 200, body: CID });
    const project = linked({ answers: { a: 9 } });
    const out = await cloud.saveNow(project);
    assert.strictEqual(out, null);
    assert.strictEqual(cloud.status().status, 'conflict');
    assert.strictEqual(calls.filter((c) => c.url.endsWith('ss_save_project')).length, 0, 'nothing written to the cloud');
  });

  await test('sync button: uploads when only this device changed', async () => {
    local.clear();
    calls.length = 0;
    const edited = linked();
    edited.answers = { a: 3 };
    local.set('L1', edited);
    fakeFetch((url) => url.endsWith('ss_list_projects') ? { status: 200, body: [row('T1')] } : { status: 200, body: CID });
    const status = await cloud.syncRow(row('T1'));
    assert.strictEqual(status, 'upload');
    assert.strictEqual(calls.filter((c) => c.url.endsWith('ss_save_project')).length, 1);
  });

  await test('conflict choice "both": two projects, the cloud copy in the original', async () => {
    local.clear();
    calls.length = 0;
    local.set('L1', linked({ answers: { a: 5 } }));
    fakeFetch((url, opts) => {
      if (url.endsWith('ss_list_projects')) return { status: 200, body: [row('T2')] };
      if (url.endsWith('ss_save_project')) return { status: 200, body: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' };
      if (url.endsWith('ss_load_project')) return { status: 200, body: { id: 'cloud-side', name: 'Shared', kind: 'sketch', answers: { a: 7 } } };
      return { status: 200, body: null };
    });
    assert.strictEqual(await cloud.resolve(row('T2'), 'both'), 'both');
    const original = local.get('L1');
    assert.strictEqual(original.answers.a, 7, 'original holds the cloud copy');
    assert.strictEqual(original.cloudBase.updatedAt, 'T2');
    const copies = [...local.values()].filter((p) => p.id !== 'L1');
    assert.strictEqual(copies.length, 1, 'device copy kept as a second project');
    assert.strictEqual(copies[0].answers.a, 5);
    assert.match(copies[0].name, /device copy/);
    assert.strictEqual(copies[0].cloudId, 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
  });

  await test('delete everything: keeps the named projects, unlinks the rest, sends one delete per removed project', async () => {
    local.clear();
    calls.length = 0;
    const keepRow = { id: 'k', name: 'keep me', kind: 'sketch', updated_at: 'T1' };
    const goRow = { id: 'g', name: 'Other', kind: 'sketch', updated_at: 'T1' };
    local.set('LG', { id: 'LG', name: 'Other', cloudId: 'g', answers: {} });
    fakeFetch((url) => url.endsWith('ss_list_projects') ? { status: 200, body: [keepRow, goRow] } : { status: 200, body: null });
    const res = await cloud.deleteAll('Keep me');
    assert.deepStrictEqual({ removed: res.removed, kept: res.kept }, { removed: 1, kept: 1 });
    const deletes = calls.filter((c) => c.url.endsWith('ss_delete_project'));
    assert.strictEqual(deletes.length, 1);
    assert.strictEqual(JSON.parse(deletes[0].opts.body).p_id, 'g');
    assert.strictEqual(local.get('LG').cloudId, undefined, 'local copy kept, unlinked');
  });

  await test('sync to cloud: sends the saved notes, reads them back, reports verified', async () => {
    local.clear();
    calls.length = 0;
    const newId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    let sent = null;
    fakeFetch((url, opts) => {
      if (url.endsWith('ss_save_project')) { sent = JSON.parse(opts.body).p_state; return { status: 200, body: newId }; }
      if (url.endsWith('ss_list_projects')) return { status: 200, body: [{ id: newId, name: 'Notes', kind: 'sketch', updated_at: 'T9' }] };
      if (url.endsWith('ss_load_project')) return { status: 200, body: sent };
      return { status: 200, body: null };
    });
    const p = { id: 'N1', name: 'Notes', kind: 'sketch', answers: {}, textNotes: [{ id: 'n1', text: 'old text', at: 'x' }] };
    const out = await cloud.syncProject(p);
    assert.strictEqual(out.status, 'verified');
    assert.strictEqual(out.notes, 1);
    assert.strictEqual(p.cloudId, newId);
  });

  await test('auto save is per project: a project with auto save off is never sent', async () => {
    calls.length = 0;
    fakeFetch(() => ({ status: 200, body: null }));
    SS.store.current = { id: 'off', name: 'Off', autoSave: false };
    cloud.schedule(SS.store.current);
    await new Promise((r) => setTimeout(r, 2300));
    assert.strictEqual(calls.filter((c) => c.url.endsWith('ss_save_project')).length, 0);
    SS.store.current = null;
  });

  console.log(`\n${passed} cloud checks passed${process.exitCode ? ', some FAILED' : ''}`);
})();
