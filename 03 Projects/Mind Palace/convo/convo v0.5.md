# Mind Palace — convo v0.5 (2026-11-18)

Jimmy asked: "I would like to use SDF and splat. Are you saying that the web splat view is not using those? Tell me more about Godot, am I not using that right now?"

## What is used today, honestly

| Part | Splats (Gaussian) | SDF | Where it runs | Run? |
|---|---|---|---|---|
| **Web splat view** (`index.html`) | **Yes.** Every surface is sampled into Gaussian splats, drawn in plain WebGL 2 | **No** | Any browser, the iPad | Yes, tested here in headless Chromium |
| **Build page** (`build.html`) | No | No | Any browser (three.js meshes) | Yes, tested |
| **Godot project** (`godot/`) | **Yes, a port.** `splat_cloud.gd` samples the Godot meshes into splats and draws them | **No** | Godot 4.3 on your computer | **No, never run.** You said you would test it yourself |

So:
- The web splat view **does use splats**. It does **not** use SDF.
- Godot is **not in use** yet. It is written and has never been run, and it also does splats, not SDF. You would be the first to open it.
- **Nothing in the project uses SDF yet.** The word appears only as a future item in `schematic.md`.

## What SDF would mean here

An SDF (signed distance field) describes a shape as a function: for any point in space it gives the distance to the nearest surface, negative inside. A room, a rounded wall, a dome or a smooth blend between two shapes is a short formula. Two things follow:
- Blends are easy: join a wall to a dome and the seam smooths itself.
- Shapes can be sampled into splats, as now. The shape is the SDF; the splats are its look.

That fits your plan: the **palace stays the data** (rooms, walls, objects as numbers), the **SDF is how a room or object is shaped** (rounded, grand, childish), and the **splats are how it looks** (fuzzy, like memory). It changes the shape step only; the splat step stays.

## Options

1. **SDF in the web splat view.** Each room and object is described by an SDF; the sampler takes its surface points as now. Testable here, works on the iPad. Starts with rounded rooms and a dome for a grand look.
2. **SDF in Godot.** Godot has its own SDF tools. Only worth it once you have run Godot and want the desktop version.
3. **Both, with the same SDF formulas written once.** Write the shape rules as data that the web code and the Godot code both read, like the object library today. More work up front.

My recommendation: **option 1 first**, because it can be tested here and you can see it on the iPad. Option 3 later, when Godot is run.

## Questions

1. **Do you want SDF in the web splat view first?** It would give rounded rooms and smooth joins, and a grand dome for later.
2. **Godot.** Have you had a chance to open the `godot/` project in Godot 4.3? If you tell me what the Output panel says, I can fix what is broken. Until then I will not change it.
3. **Animals, boats and cars.** You asked for more life: animals on the islands, boats on water and cars on paths. Which one first? (Animals as small walking shapes on loops, boats bobbing on a pond, cars going round a path.)
4. **Glow.** Is the lantern glow in little-me's hand enough light for now, or do you want glowing windows on the rooms too?
