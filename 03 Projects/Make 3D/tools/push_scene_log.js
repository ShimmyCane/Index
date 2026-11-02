// Loads every scene version into public.m3d_scene_log (Architecture project), one row per model_id.
// The table is the log of record; the JSON in models/ is build output for the viewer.
// Run from the project folder:
//   node tools/push_scene_log.js --dry-run     (no network: prints what would be written)
//   SUPABASE_ACCESS_TOKEN=<owner session token> node tools/push_scene_log.js
// The project URL and publishable key come from js/cloud/cloud.js (the same values the app uses).
// Only the access token is needed from you: the signed-in owner's session token. Never commit it, and never use the
// service-role key here.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// The app's public config (publishable key, project URL), read from js/cloud/cloud.js.
function appConfig() {
  const src = fs.readFileSync(path.join(root, 'js', 'cloud', 'cloud.js'), 'utf8');
  const url = (src.match(/url:\s*'([^']+)'/) || [])[1];
  const key = (src.match(/key:\s*'(sb_publishable_[^']+)'/) || [])[1];
  if (!url || !key) throw new Error('could not read url and publishable key from js/cloud/cloud.js');
  return { url, key };
}

// Scene family and label from the model id: living-room-v2-5 -> scene living-room, label V2.5.
function splitId(id, name) {
  const m = id.match(/^(.*)-v(\d+)(?:-(\d+))?$/);
  if (!m) return { scene: id, label: '' };
  return { scene: m[1], label: m[3] ? `V${m[2]}.${m[3]}` : `V${m[2].padStart(2, '0')}` };
}

const ids = fs.readdirSync(path.join(root, 'models')).filter((d) => fs.existsSync(path.join(root, 'models', d, 'history.json')));
const world = JSON.parse(fs.readFileSync(path.join(root, 'worlds', 'default-world.json'), 'utf8'));
const rows = ids.sort().map((id) => {
  const history = JSON.parse(fs.readFileSync(path.join(root, 'models', id, 'history.json'), 'utf8'));
  const model = JSON.parse(fs.readFileSync(path.join(root, 'models', id, 'model.json'), 'utf8'));
  const { scene, label } = splitId(id);
  return {
    model_id: id,
    scene,
    label,
    name: model.name || id,
    description: model.description || '',
    note: history.header && history.header.note ? history.header.note : '',
    version: model.version || history.operations.length,
    history,
    world,
    model,
  };
});

if (dryRun) {
  for (const r of rows) console.log(`${r.model_id}  scene=${r.scene}  label=${r.label || '-'}  ops=${r.version}  name="${r.name}"`);
  console.log(`dry run: ${rows.length} rows, nothing sent`);
  process.exit(0);
}

const { url, key } = appConfig();
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) { console.error('set SUPABASE_ACCESS_TOKEN to your signed-in session token (or use --dry-run)'); process.exit(2); }

(async () => {
  // Upsert on model_id, so re-running updates rows instead of duplicating them.
  const res = await fetch(`${url}/rest/v1/m3d_scene_log?on_conflict=model_id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) { console.error(`failed: ${res.status} ${await res.text()}`); process.exit(1); }
  console.log(`wrote ${rows.length} rows to m3d_scene_log`);
})().catch((e) => { console.error(e); process.exit(1); });
