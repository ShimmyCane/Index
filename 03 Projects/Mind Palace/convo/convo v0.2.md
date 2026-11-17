# Mind Palace — convo v0.2 (2026-11-17)

Jimmy answered `convo v0.1.md` (his words are recorded there, under each question). This round acts on the answers. Answer inline; anything left blank keeps the choice made.

## What changed in direction

- **Godot is the main renderer now.** The three.js page stays as a placeholder and as the place where the data rules are proven.
- **Splats are started**, inside Godot.
- **One palace, shared by the family**, synced through the family database (planned, not built).
- **Two looks, childish and grand**, because memories are for the young and old.
- **Solid walls and ramps** when walking. Growth ideas and a tour mode are accepted.
- **Jimmy's first subject is childhood.** Felix's is still to ask.

## What I did

1. Added the Mind Palace tile to the nursery home page, and a step in `/start-project` that always adds it.
2. Started the Godot project in `godot/` (Godot 4.3). It reads the same `palace.json`, builds the same islands, rooms and objects, walks little-me to a searched memory, has solid walls and ramps in Walk, and has a splat look made by sampling the surfaces. It can save the splats as a `.ply` file.
3. Wrote `godot/schematic.md` for the desktop application.
4. Planned the family sync in `schematic.md` (tables `mp_palace`, `mp_recall`, `mp_notes`). No SQL written yet.

## What I could not do

**I could not run Godot in this session.** I downloaded the engine, but the session's permission rules refused to let me start it. So the Godot project has been read through carefully but never run. Expect errors on the first open. Please either open `godot/` in Godot 4.3 and tell me what the Output panel says, or allow me to run the engine here and I will test and fix it myself.

## Choices made without asking

1. **Godot 4.3 with the Compatibility renderer**, because you said all devices. It is the one that also exports to the web (for the iPad) and to phones.
2. **Splats are made from the palace, not scanned.** Each shape's surface is sampled into small discs with a position, a facing, a size and a colour. No scanned room yet.
3. **Splats are drawn with a dither, not blended**, so they need no sorting every frame. They look grainy close up. A sorted, blended version is a later step.
4. **Guided walks ignore walls** (so little-me can never get stuck on the way to a memory). Walls are solid only when you steer.
5. **The object library is shared.** `tools/export_godot_data.js` turns the 29 web objects into simple shapes that Godot reads, so there is one library, not two.
6. **"Different ones for family" read with "One" palace and "childish and grand":** one palace, and each person chooses how it looks. Question 1 checks this.

## Questions

1. **Did I read you right?** One shared palace, and each person picks a look (childish or grand). Or did you mean different palaces for different family members after all?

2. **The grand look.** What is grand to you: a stone hall with columns and vaults, a library, a cathedral of light, a garden with pavilions? One or two words are enough. I will take it from historical architecture.

3. **iPad.** Godot reaches the iPad two ways: a web export hosted on GitHub Pages (no install, slower, needs a build step each time), or a real app through Xcode (fast, needs your Mac and an Apple developer account). Which one? Until then the three.js page is what runs on the iPad.

4. **Running Godot.** Do you want to allow me to run the Godot engine in these sessions (a permission rule for it), so I can test before you see it?

5. **Childhood.** That is personal, and this repo is public. Your real palace will stay in the family database and on your devices, never in the repo. For the sample, may I add a made-up "Childhood" world (a street, a kitchen, a classroom) so the grand and childish looks have something to show?

6. **Splats from the real world.** Do you want to place a scanned splat (a real room or object, as a `.ply` or `.spz` file from a phone scan) as a memory object or a whole room? It is the natural next step for childhood places, and the files would stay private.

7. **Sync conflicts.** If two devices change the palace while one is offline, the simple rule is: the newer save wins and the older one is kept as a copy you can open. Practice answers are never lost, because they are added, not overwritten. Good enough?

8. **Tour mode.** Should a tour be a list you build by hand (tap memories in order), or the order little-me last walked? And should the tour test you (hide each name until you say it) or only show?
