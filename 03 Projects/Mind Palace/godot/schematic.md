# Mind Palace — Godot application schematic

**Status: increment G1, written 2026-11-17, never run.** The engine could not be started in the build session. Expect errors on first open; see `../todo.md`.

Engine: Godot 4.3, Compatibility renderer (desktop, web export and phones from one project). GDScript only. No add-ons.

## Purpose

The main renderer for the palace. It reads the same `palace.json` the web page saves, and draws it two ways: solid shapes, and Gaussian splats.

## How to run

1. Install Godot 4.3 (standard build).
2. In the project list choose **Import**, pick this `godot/` folder, then press ▶.
3. "Open palace" loads a copy saved by the web page ("Save a copy"). It is kept in the app's own folder for next time.

## The pipeline

```
data/palace.json      the knowledge database (same schema as the web page)
   │  scripts/palace_layout.gd     where everything is: worlds, rooms, objects, paths, bridges, routes
   ▼
layout (dictionaries)
   │  scripts/palace_builder.gd    a flat list of simple shapes ("specs"): box, cylinder, sphere, ring, prism, sign
   ▼
scene description (specs)   ← data/objects.json: the object library, exported from the web page's js/objects.js
   │
   ├─ scripts/palace_renderer.gd   solid look: one mesh per spec, colliders for floors and walls, signs
   └─ scripts/splat_cloud.gd       splat look: samples those meshes into splats, draws them as one MultiMesh,
                                    saves them as .ply          (shader: shaders/splat.gdshader)
scripts/main.gd       camera, little-me, search, the card, the buttons
```

Rule kept from the web version: the database is the substance. Nothing below the first arrow changes it.

## Splats (how this first version works)

| Step | What happens |
|---|---|
| Sample | Every mesh is cut into triangles. Points are scattered over them, more on larger surfaces (55 per square unit, 10 to 5,000 per shape, 260,000 in all) |
| Make a splat | Each point becomes a flat disc: position, facing (the surface normal), radius (wide enough to overlap its neighbours), colour |
| Light | Baked into the colour from one sun direction, with a little variation per splat |
| Draw | One MultiMesh of quads. The shader fades each disc like a bell curve and keeps or drops each pixel by a fine dither, so no sorting is needed |
| Save | `.ply`, binary, in the usual 3-D Gaussian splatting layout (position, normal, `f_dc`, opacity, log scales, rotation) |

What it is not: not a trained or scanned splat scene, not blended with sorting, no view-dependent colour. Splats are flat discs on surfaces. Close up they look grainy.

## Controls

| Input | Does |
|---|---|
| Drag | Turn and tilt |
| Wheel or pinch | Zoom. All the way in is first person |
| Right drag, Shift drag, two-finger slide | Slide the view |
| Tap a stand | Choose that memory: card, ring, beam, its connections as arcs of beads |
| Search box, Go | Little-me walks the route to the best match |
| Walk | Arrow keys or W A S D. Walls, floors, stands and bridges are solid. A sloped path is a ramp. Falling off returns you to the plaza |
| Look | Solid or Splat |
| Save splats | Writes `palace_splats.ply` to the app's own folder and shows the path |

## Parity with the web page

| Feature | Web (three.js) | Godot G1 |
|---|---|---|
| Read `palace.json` | yes | yes |
| Islands, rooms, objects, bridges | yes | yes (ported) |
| Search and walk | yes | yes (simpler scoring) |
| Solid walls, ramps | no | yes |
| Splat look, `.ply` | no | yes |
| Card with topic and room | yes | yes (read only) |
| Add, change, move, connect, undo | yes | **no** |
| Practice | yes | **no** |
| Repair of a broken file | yes | **no** (open copies saved by the web page) |
| Save the palace | yes | no (it only reads) |
| ⚙️, notes, sound | yes | no |

## Planned increments

| | What | Why this order |
|---|---|---|
| G1 | Read, draw, walk, search, splats | Prove the pipeline in the engine |
| G2 | First run and fix; screenshots from several angles; export presets (desktop, web) | Nothing else is safe until it runs |
| G3 | Editing with undo, saving, repair on load (port of `js/model.js`) | Makes Godot the main app, not a viewer |
| G4 | Practice (what, where), tour mode | Jimmy's answers 10 |
| G5 | Two looks: childish and grand (materials, room pieces, light) | Jimmy's answer 6 |
| G6 | Family sign-in and sync (HTTP to the family database) | After the tables exist |
| G7 | Splats: sorted and blended, load a scanned `.ply`, splat as a memory object | The "grand" look and childhood places |
| G8 | Stairs, floors in towers, hidden rooms, portals; growth of worlds and bridges | Jimmy's answers 8 and 9 |
| G9 | AI architect by copy and paste, with preview | Jimmy's answer 5 |

## Export notes

- `data/*.json` are read with `FileAccess`. In an export preset, add `*.json` to "Filters to export non-resource files", or they are left out.
- Web export needs the Compatibility renderer (set) and the export templates for 4.3.
- The default font has no colour emoji. Emoji objects (the whale) may show as boxes until a font is added.

## Files

| File | What it does |
|---|---|
| `project.godot`, `main.tscn` | The project and its one scene (a node with `main.gd`) |
| `scripts/palace_layout.gd` | Database → layout and routes. Port of `../js/layout.js` |
| `scripts/palace_builder.gd` | Layout → specs. Room and world shapes, styles, object placement |
| `scripts/palace_renderer.gd` | Specs → meshes, colliders, signs |
| `scripts/splat_cloud.gd` | Meshes → splats; `.ply` |
| `shaders/splat.gdshader` | One splat |
| `scripts/main.gd` | The scene |
| `data/palace.json`, `data/objects.json` | Made by `../tools/export_godot_data.js`. Do not edit by hand |
