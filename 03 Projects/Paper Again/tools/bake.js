// Bake the Paper Again frames into a cache the page can load fast (file:// safe).
// The cache is derived: it can always be rebuilt from js/paper_story.js with this script.
// Run: node tools/bake.js   (about 45 seconds; writes data/paper_again_cache.js)
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');
var S = require(path.join(root, 'js', 'paper_sim.js'));
var story = require(path.join(root, 'js', 'paper_story.js'));

var t0 = Date.now();
var s = S.startSheet(story.seed);
var frames = [];
function r3(a) { var out = new Array(a.length); for (var i = 0; i < a.length; i++) out[i] = Math.round(a[i] * 1000) / 1000; return out; }
frames.push({ n: 0, stats: S.stats(s), pieces: [] });
story.steps.forEach(function (inc) {
  S.runIncrement(s, inc);
  var pcs = S.toPieces(s).map(function (p) {
    return { id: p.id, positions: r3(Array.from(p.positions)), colors: r3(Array.from(p.colors)), indices: Array.from(p.indices) };
  });
  frames.push({ n: inc.age, stats: S.stats(s), pieces: pcs });
  console.log('increment ' + inc.age + ' done');
});
var out = 'window.PAPER_AGAIN_CACHE = ' + JSON.stringify({ hash: S.storyHash(story), frames: frames }) + ';\n';
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'paper_again_cache.js'), out);
console.log('wrote data/paper_again_cache.js, ' + Math.round(out.length / 1024) + ' KB, ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
