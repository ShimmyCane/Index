// Review data for the Grand Ocean Aquarium: five increments built in Make 3D (tools/aquarium.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Grand Ocean Aquarium: V01 to V05",
  subtitle: "A large imagined public aquarium in the style of the California Science Center kelp tank: a 100 x 60 ft tank, 28 ft deep, with a 100 ft walk-through tunnel, a viewing gallery, and a pool deck. Rough object counts of 100, 150, 200, 500 and 1,000. Tap an animal in Make 3D to read its name and description. Sizes are estimates.",
  items: [
    {
      id: "V01", title: "Blockout: about 100 objects",
      image: "../Make 3D/renders/aquarium/v01.png",
      description: "The envelope and the big parts: the tank with glass walls and a sand floor, a round acrylic tunnel along the floor, the entry lobby and exit hall, the glass viewing gallery, a pool deck, and a first few animals (three sand tiger sharks, a zebra shark, two giant sea bass, a turtle, a garibaldi) with four kelp strands and six rock piles. Still, no motion.",
      changes: ["Tank 100 x 60 ft, 28 ft of water, clear glass walls (taps go through the glass)", "Tunnel 100 ft long and 10 ft across, with a floor and portals", "Lobby, exit hall and gallery blocks; pool deck", "8 animals as a body and tail each (sharks also have a snout)", "4 kelp strands, 6 rock piles"],
      gaps: ["Animals are crude: no fins or eyes", "Nothing moves", "Tunnel has no ribs; gallery has no seating"]
    },
    {
      id: "V02", title: "Animated: about 150 objects",
      image: "../Make 3D/renders/aquarium/v02.png",
      description: "The same tank, now alive. Every animal swims its own closed loop through the water, their tails beat, and the kelp sways. Eight more animals join, and every animal gains a back fin. One 60 second loop; autoplays twice, then pauses.",
      changes: ["44 motions: swim loops, tail beats and kelp sway", "Eight more animals: blacktip and bonnethead sharks, a second zebra shark, two yellowtail, a barracuda, a bat ray, a second garibaldi", "Sharks get a dorsal fin; fish get a back fin", "Three more kelp strands", "Low swimmers keep to the sides, so nothing swims through the tunnel"],
      gaps: ["No eyes yet", "Rays and turtles glide stiffly, with no wing or flipper beat", "Still no guest furniture"]
    },
    {
      id: "V03", title: "Guest spaces: about 200 objects",
      image: "../Make 3D/renders/aquarium/v03.png",
      description: "The places guests actually stand and sit: steel ribs round the tunnel, long benches facing the glass, window piers, warm lamps, tank signs, deck railings, lobby benches and a welcome sign, and lights inside the tunnel.",
      changes: ["Six tunnel ribs, three steel arcs each", "Four gallery benches with backs, five window piers, five lamps, three tank signs", "Deck railing posts and a back handrail", "Lobby benches, welcome sign, exit sign, tunnel lights", "Walls of the gallery, lobby and exit hall made see-through so the inside shows"],
      gaps: ["No people yet", "Ribs are straight chords, not a smooth arch", "Nothing in the tank beyond the first animals"]
    },
    {
      id: "V04", title: "Life: about 500 objects",
      image: "../Make 3D/renders/aquarium/v04.png",
      description: "The tank fills up. Three schools of small fish (anchovies, blacksmith, opaleye) swim together, a kelp forest grows along the back, a reef of coral and sea fans sits on the rocks, a moray peeks from a crack, and more sharks, rays and turtles join. Guests watch from the gallery and two walk through the tunnel.",
      changes: ["Three schools of 10 to 22 small fish, each fish tappable", "Kelp forest: 8 more strands; reef with 12 coral heads and fans", "12 more large animals and a moray eel", "Eyes and side fins on every large animal", "6 gallery guests and 2 who walk the tunnel loop"],
      gaps: ["Few small bottom animals", "No jellyfish or bubbles", "Gallery has only a handful of guests"]
    },
    {
      id: "V05", title: "Full tank: about 1,000 objects",
      image: "../Make 3D/renders/aquarium/v05.png",
      description: "A full aquarium. Eight schools in all, eight drifting moon jellies that pulse, a staff diver feeding the fish, bubble vents, swaying eelgrass, anemones with clownfish, urchins, sea stars, abalone, pebbles, more kelp, a crowd in the gallery and on the deck, and lamps over the deck.",
      changes: ["Five more schools, so eight in all", "8 moon jellies that drift and pulse", "A diver with a bubble trail", "3 bubble vents, 6 eelgrass patches that sway", "3 anemones with 2 clownfish, 12 urchins, stars and abalone, 10 pebbles", "10 more large animals; 6 more gallery guests and 6 on the deck; 6 deck lamps"],
      gaps: ["Rays, turtles and eels don't beat wings or flippers", "Fish are boxes and cones, not smooth shapes", "Tapping a tail or fin reads its name but the text is short for school fish", "Tap-to-start motions and chained motions are not built yet"]
    }
  ]
};
