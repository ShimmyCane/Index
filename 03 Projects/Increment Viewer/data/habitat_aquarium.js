// Review data for the Coastal Habitat Aquarium: four increments built in Make 3D (tools/habitat_aquarium.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Coastal Habitat Aquarium: V01 to V07",
  subtitle: "The Grand Ocean Aquarium rebuilt as a habitat instead of a glass box: an organic, modelled tank where the plants and animals live. Three increments for the habitat, then every marine asset from the first aquarium swims in it, then three more because the tank was still a vertical extrusion: leaning walls and a three-level floor (V05), bridges over and tunnels through (V06), and a repopulated plateau (V07). Sizes are estimates.",
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
    },
    {
      id: "V05", title: "Not an extrusion: leaning walls and three floor levels",
      image: "../Make 3D/renders/habitat_aquarium/v05.png",
      description: "Jimmy's note: the tank was still a vertical extrusion of the outline. Now the walls lean in and out as they rise (up to 10 percent, so some stretches overhang), the rim swings with them and the front window tilts out 7 degrees. The floor has three levels: a deep basin at 0 ft, a solid rock-and-sand terrace at 8 ft in the south-east, and a shelf plateau at 16 ft in the north-west with 12 ft of water over it. Underneath the shelf is a cavern gallery, 15 ft high, that looks into the deep basin through a glass wall. All the animals are re-fitted to the new volume.",
      changes: ["Wall lean by angle: the rock cliff, ledges and spires follow it", "Terrace: about 30 rock columns stepping up to 8 ft", "Shelf: about 30 slabs at 16 ft, held up by the cavern walls and four pillars", "Cavern gallery: floor, a curved glass window wall, benches, lamps, sign, guests", "Flat sand, mounds and the tide terraces replaced by the real terrain", "Swim loops tested against the leaning wall, terrace, plateau and shelf edge"],
      gaps: ["The cavern is hard to see from outside: see the cutaway", "No way into the cavern or onto the plateau yet", "No bridges yet"]
    },
    {
      id: "V06", title: "Bridges over, tunnels through",
      image: "../Make 3D/renders/habitat_aquarium/v06.png",
      description: "A deck ring runs round the pool at the top. An arched skybridge crosses the deep basin, 56 ft long and 4.5 ft high at the crown, and the Kelp Walk, a timber walkway, runs from the west deck over the plateau and kelp forest to meet it. A 32 ft clear tunnel runs through the plateau water just above the slab, and a spiral stair tube climbs from the cavern up through the shelf into the middle of it. Two guests cross the skybridge and return.",
      changes: ["Deck ring: 40 deck pieces, rails and posts round the pool", "Skybridge: 14 arched deck pieces with rails and posts", "Kelp Walk: 12 planks rising to meet the skybridge", "Plateau tunnel with floor and portals; stair tube with 12 spiral steps", "Two guests walk the skybridge"],
      gaps: ["No stairs from the deck down to the first floor yet", "The cavern door is only a marker", "Terrace tunnel (a tunnel through solid rock) not built"]
    },
    {
      id: "V07", title: "Repopulated: the plateau, the terrace and the bridges",
      image: "../Make 3D/renders/habitat_aquarium/v07_cutaway_front.png",
      description: "Seen in the cutaway, with the front half of the rock wall, glass and deck left out so the three levels show. The plateau gets its own residents (bat rays, a turtle, garibaldi, sheephead, a leopard shark, and two schools), the terrace gets kelp and coral, there are urchins, stars and anemones on the plateau sand, and two more guests walk the Kelp Walk.",
      changes: ["7 plateau animals and 2 schools over the plateau", "6 terrace kelp strands, 10 terrace corals", "Urchins, sea stars and anemones on the plateau", "Two guests on the Kelp Walk", "A cutaway scene (V07 cutaway) for review"],
      gaps: ["Rock is made of spheres", "Rays, turtles and eels still glide stiffly", "Rooms from the Grand Ocean Aquarium still not placed"]
    }
  ]
};
