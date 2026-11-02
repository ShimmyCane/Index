// Review data for the hawk: six increments built in Make 3D (tools/hawk.js). The first model made of closed meshes
// on a skeleton line (loft) and double-sided thin sheets, instead of box and cylinder extrusions.
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Hawk: closed meshes on a skeleton line, V01 to V07",
  subtitle: "A red-tailed hawk (about 22.5 in long, 50 in wingspan, estimates from Cornell Lab figures) that circles a meadow, stoops onto a mouse and climbs out. Bodies are closed meshes on a skeleton line so they bend when they move; leaves, grass, ears and a flag are double-sided sheets. Open the model in Make 3D (index.html?model=hawk-v07) to watch it.",
  items: [
    {
      id: "V1", title: "Blockout",
      image: "../Make 3D/renders/hawk/v01.png",
      description: "The body, tail and two wings are each one closed mesh on a straight skeleton line. No extrusions: smooth tubes with end caps, thicker where a hawk is thick.",
      changes: ["Body: one closed mesh from rump to head", "Flat closed fan for the tail", "Two wings as closed airfoils, about 50 in across"],
      gaps: ["Wings are straight, with no elbow or wrist", "No head detail", "Faceted: only 8 cross-sections"]
    },
    {
      id: "V2", title: "Wings and body",
      image: "../Make 3D/renders/hawk/v02.png",
      description: "The wing skeleton gets a shoulder, elbow, wrist and tip, so it can bend at each. The body gets five joints (rump, belly, chest, neck, head) and a smoother profile. The tail now rides the rump joint.",
      changes: ["Wing skeleton: 4 joints, wing profile widest at the elbow", "Body skeleton: 5 joints", "More cross-sections, smoother surfaces"],
      gaps: ["No beak, eyes or feet", "Wing outline is a plain taper, with no feather fingers"]
    },
    {
      id: "V3", title: "Head and feet",
      image: "../Make 3D/renders/hawk/v03.png",
      description: "A hooked beak, two eyes and two legs with feet. Each rides a joint of the body skeleton, so when the head dips, the beak and eyes go with it.",
      changes: ["Beak on the head joint", "Eyes on the head joint", "Legs and feet: closed meshes on their own 4-joint skeletons, tucked under the belly"],
      gaps: ["Eyes bulge above the head", "No brow or pale chest", "Still no scenery"]
    },
    {
      id: "V4", title: "Meadow",
      image: "../Make 3D/renders/hawk/v04.png",
      description: "A green meadow with 120 blades of grass, six wide leaves, a pennant flag on a post and a mouse. The grass, leaves, flag and the mouse's ears are thin double-sided sheets; the mouse body and tail are closed meshes.",
      changes: ["Grass blades: sheets, seen from both sides", "Six cupped leaves", "Pennant flag on a post", "Mouse: closed body and tail, sheet ears"],
      gaps: ["The ground is a flat disc", "Hawk is small against the meadow in the default view"]
    },
    {
      id: "V5", title: "Finish",
      image: "../Make 3D/renders/hawk/v05.png",
      description: "A cream breast (a second closed mesh mostly inside the body), brow ridges for the stern look, and smaller eyes set lower; the V03 eyes bulged.",
      changes: ["Cream breast", "Eye ridges", "Smaller eyes, set lower (V03 left as it was)"],
      gaps: ["No individual feathers", "Wing tips have no 'fingers'", "Tail has no bars"]
    },
    {
      id: "V6", title: "Motion",
      image: "../Make 3D/renders/hawk/v06.png",
      description: "A 23 s loop (frame shown: halfway down the stoop, feet reaching for the mouse). The hawk circles the meadow, folds its wings and stoops, flares with its tail down, skims the grass with its feet out and flaps back up to where it started. Wings bend at shoulder, elbow and wrist; the head looks down the dive; grass, leaves, flag and the mouse's tail move.",
      changes: ["Flight path with banking and pitch", "Flap, fold and flare on wing bends", "Legs drop, head dips, tail brakes", "Grass, leaves, flag and mouse tail sway"],
      gaps: ["Speeds are stylised (slow)", "The talons come within about 3 in of the mouse; they do not touch it", "The mouse does not react"]
    },
    {
      id: "V7", title: "Physical flight, larger loop",
      image: "../Make 3D/renders/hawk/v07-bolt.png",
      description: "Jimmy's note on V06: too slow, too small, too diagrammatic. V07 is a much larger arena (a 720 in meadow, a rock bluff, a warm patch of ground) and the speed now comes from physics. One 26 s lap: the hawk circles 2.5 turns up a thermal (rising warm air, drawn as spinning translucent bands) with no flapping, glides away, stoops onto the mouse at about 240 in/s (the height it lost, less drag), flares with the wings open (the drag slows it), flaps hard to climb (62 beats a lap, only while climbing), then rides the wind pushed up the bluff's face (blue ribbons) back into the thermal. The mouse bolts for its burrow as the hawk flares in (52 in at about 160 in/s), drops out of sight, comes up again later and walks home before the loop wraps. Frame shown: the mouse running for the hole as the hawk skims in (`renders/hawk/v07-bolt.png`). Banking follows the turn (a coordinated turn at g = 150 in/s^2 in this scaled world) and is capped near the ground so a wing tip never digs in. V01 to V06 are unchanged.",
      changes: ["Meadow 720 in across (was 240), bluff of three rock meshes, warm patch, flag and plant moved to fit", "Speed from gravity, drag (wings spread, tucked, flared) and flap thrust; rising air holds soaring speed; flap thrust solved so the lap closes", "Thermal: 2.5 turns, about 120 in of climb per turn, no flapping, banked about 40 degrees", "Flapping 2.4 beats per second, only on the climb out", "Rising air shown: thermal bands spin, bluff ribbons ripple", "Mouse bolts for a burrow hole, hides underground, then walks home"],
      gaps: ["The world is about a tenth of real size, so 'real' speeds are scaled (stoop 240 in/s, not 100 mph)", "Thermal and updraft are drawn as ribbons, not simulated air", "The mouse never gets caught: the talons skim 4 in above where it was"]
    }
  ]
};
