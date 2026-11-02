// Review data for the Coastal Habitat Aquarium: four increments built in Make 3D (tools/habitat_aquarium.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Coastal Habitat Aquarium: V01 to V04",
  subtitle: "The Grand Ocean Aquarium rebuilt as a habitat instead of a glass box: an organic, modelled tank where the plants and animals live. Three increments for the habitat, then every marine asset from the first aquarium swims in it. Sizes are estimates.",
  items: [
    {
      id: "V01", title: "A curved, lobed outline",
      image: "../Make 3D/renders/habitat_aquarium/v01.png",
      description: "The rectangle is gone. The tank is a lobed oval, 110 ft long and about 65 ft across at most, 28 ft of water, built from 40 angled glass panels with a rim. A curved tunnel runs through it like a stream bed, with a lobby and an exit hall at the ends.",
      changes: ["40 angled glass panels and rim pieces following the outline", "Sand floor of discs that stays inside the outline, plus an edge ring", "A 120 ft S-shaped tunnel with a curved walkway and portals", "Water surface patches, entry lobby and exit hall"],
      gaps: ["The wall is still plain glass: it looks like a tub, not a place", "Floor is flat", "Nothing lives in it"]
    },
    {
      id: "V02", title: "Rockwork, caves and a rolling seabed",
      image: "../Make 3D/renders/habitat_aquarium/v02.png",
      description: "The walls disappear behind sculpted rock: four tiers of boulders, ledges and spires, three caves with dark mouths, and a tide shelf with terraces and pools. The seabed rolls in sand mounds that climb toward the rock. The front stays glass, as a curved window with slim frames, and three low round windows go through the rock for the small ones.",
      changes: ["About 220 boulders in four tiers, ledges and 24 rock spires", "Hide cave, Shark cave and Eel cave", "Tide shelf: five terraces with tide pools", "Rolling sand mounds that rise toward the wall", "Curved front window with mullions, three low round windows"],
      gaps: ["Boulders are spheres, so the rock looks pebbly rather than craggy", "No plants yet", "Still, nothing moves"]
    },
    {
      id: "V03", title: "The habitat: kelp, reef and meadows",
      image: "../Make 3D/renders/habitat_aquarium/v03.png",
      description: "Plants and reef make zones. A kelp forest of 24 curved strands in the north and west, eelgrass meadows on the sand flats in the south, coral heads, sea fans and anemones along the rock foot, and shafts of light from the surface. Kelp and eelgrass sway.",
      changes: ["24 kelp strands: four leaning stem pieces, three blades and a float each, swaying", "6 eelgrass meadows that sway", "26 coral heads and sea fans, 6 anemones", "6 light shafts slanting from the surface", "54 motions in one 60 second loop"],
      gaps: ["No animals yet", "Kelp stems are straight rods, joined at an angle", "Light shafts are fixed"]
    },
    {
      id: "V04", title: "Populated: every marine asset moves in",
      image: "../Make 3D/renders/habitat_aquarium/v04_front.png",
      description: "All the marine assets from the Grand Ocean Aquarium swim in the new volume: 5 sand tigers, zebra, leopard, bonnethead and blacktip sharks, sea bass, yellowtail, barracuda, garibaldi, rays, turtles, a moray at its cave, 11 schools of small fish, clownfish in anemones, 8 moon jellies, a diver, bubble vents and seabed critters. Guests watch from a curved front gallery and two walk the curved tunnel. Swim loops are tested against the rock wall, the floor and the tunnel.",
      changes: ["38 large animals and a moray, each tappable with a name and description", "11 schools, 8 jellies, a diver, 2 clownfish", "24 urchins, stars and abalone; 3 bubble vents", "Front gallery with rails, benches and 16 guests; 2 guests walk the curved tunnel", "Loops are generated to fit the lobed outline and avoid the S-shaped tunnel"],
      gaps: ["The rooms, sunroom, kids' den and touch pool from the first aquarium were not brought over: they belonged to the glass box. Need Jimmy's call on where they go", "Rocks are spheres: a more craggy look would need other shapes", "Rays, turtles and eels still glide stiffly"]
    }
  ]
};
