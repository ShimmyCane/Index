// Shared by the tools: load the engine in Node (no browser needed) and write data files.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");

function load(files = ["js/engine.js", "js/art.js", "js/sheet.js", "js/doodle.js", "js/score.js", "js/designs.js", "data/catalog.js", "data/scores.js", "data/rework.js"]) {
  const ctx = { console, Math };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of files) {
    const p = path.join(root, f);
    if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  }
  return ctx;
}

// Write `window.<name> = <json>;` with a header, one entry per line so diffs stay readable.
function writeData(file, name, value, header) {
  const lines = Array.isArray(value)
    ? "[\n" + value.map(v => "  " + JSON.stringify(v)).join(",\n") + "\n]"
    : "{\n" + Object.keys(value).map(k => "  " + JSON.stringify(k) + ": " + JSON.stringify(value[k])).join(",\n") + "\n}";
  fs.writeFileSync(path.join(root, file), "/* " + header.replace(/\n/g, "\n   ") + " */\nwindow." + name + " = " + lines + ";\n");
}

module.exports = { root, load, writeData };
