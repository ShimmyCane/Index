/* Mind Palace: write the data the Godot project reads.
     node tools/export_godot_data.js
   - godot/data/objects.json : every object in js/objects.js as a list of simple shapes (so the two renderers share one object library)
   - js/objects_data.js      : the same library as a script, for index.html (the splat view)
   - godot/data/palace.json  : the sample palace, cleaned by the same repair step the page uses
   Run it again after changing js/objects.js or js/sample.js. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
global.THREE = require(path.join(root, 'js/vendor/three.min.js'));
require(path.join(root, 'js/core.js')); require(path.join(root, 'js/model.js')); require(path.join(root, 'js/sample.js')); require(path.join(root, 'js/objects.js'));
const T = global.THREE, r3 = v => Math.round(v * 10000) / 10000;

function hex(color) { return '#' + color.clone().convertLinearToSRGB().getHexString(); }
function shapesOf(kind) {
  // Build once more in a marker colour: the shapes that take it are the ones a chosen colour repaints.
  const marked = []; MP.Objects.build({ representation: 'procedural', kind: kind, color: '#804020' }).traverse(o => { if (o.isMesh) marked.push(hex(o.material.color) === '#804020'); });
  const g = MP.Objects.build({ representation: 'procedural', kind: kind, color: '' });
  g.updateMatrixWorld(true);
  const parts = [];
  g.traverse(o => {
    if (!o.isMesh) return;
    const p = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(); o.matrixWorld.decompose(p, q, s);
    const geo = o.geometry, a = geo.parameters, part = { c: hex(o.material.color), p: p.toArray().map(r3), q: q.toArray().map(r3), s: s.toArray().map(r3) };
    if (o.material.emissive && o.material.emissive.getHex() !== 0) part.glow = true;
    if (marked[parts.length]) part.main = true;
    if (geo.type === 'BoxGeometry') { part.t = 'box'; part.size = [a.width, a.height, a.depth]; }
    else if (geo.type === 'CylinderGeometry') { part.t = 'cyl'; part.rt = a.radiusTop; part.rb = a.radiusBottom; part.h = a.height; part.seg = a.radialSegments; }
    else if (geo.type === 'ConeGeometry') { part.t = 'cyl'; part.rt = 0; part.rb = a.radius; part.h = a.height; part.seg = a.radialSegments; }
    else if (geo.type === 'SphereGeometry') { part.t = 'sph'; part.r = a.radius; }
    else if (geo.type === 'TorusGeometry') { part.t = 'torus'; part.R = a.radius; part.r = a.tube; }      // lies in the x-y plane, as in three.js
    else if (geo.type === 'ExtrudeGeometry') { part.t = 'prism'; part.depth = a.options.depth; part.pts = a.shapes.getPoints(10).map(v => [r3(v.x), r3(v.y)]); const f = part.pts[0], l = part.pts[part.pts.length - 1]; if (f[0] === l[0] && f[1] === l[1]) part.pts.pop(); }  // outline in x-y, centred on z
    else throw new Error('unknown shape ' + geo.type + ' in ' + kind);
    parts.push(part);
  });
  return parts;
}
const objects = { note: 'Made by tools/export_godot_data.js from js/objects.js. Do not edit by hand.', defaults: MP.Objects.DEFAULT, kinds: {} };
MP.Objects.KINDS.forEach(k => { objects.kinds[k.id] = { label: k.label, emoji: k.emoji, parts: shapesOf(k.id) }; });
fs.writeFileSync(path.join(root, 'godot/data/objects.json'), JSON.stringify(objects));
// The same library for the splat page, as a script, so the page still opens from a double-click.
fs.writeFileSync(path.join(root, 'js/objects_data.js'), '/* Made by tools/export_godot_data.js from js/objects.js. Do not edit by hand. */\n(function () { var r = typeof window !== "undefined" ? window : globalThis; (r.MP = r.MP || {}).objectShapes = ' + JSON.stringify(objects) + '; })();\n');
MP.store = { set() {}, get(k, d) { return d; }, ok: true };
MP.Model.load(MP.sample());
const palace = MP.Model.clone(MP.Model.data); palace.updated_at = '2026-11-17T00:00:00.000Z';
palace.places.forEach(p => { delete p.created_at; }); palace.worlds.forEach(p => { delete p.created_at; }); palace.nodes.forEach(p => { delete p.created_at; delete p.updated_at; });
fs.writeFileSync(path.join(root, 'godot/data/palace.json'), JSON.stringify(palace, null, 1));
const n = Object.values(objects.kinds).reduce((s, k) => s + k.parts.length, 0);
console.log('objects.json: ' + Object.keys(objects.kinds).length + ' kinds, ' + n + ' shapes; palace.json: ' + palace.nodes.length + ' memories');
