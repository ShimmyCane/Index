// Review data for Earth view: merged from earth_views, earth_views_v11, earth_views_v21, earth_views_v22, earth_views_v23.
// The originals are kept in data/archive/. Images are read relative to viewer.html.
window.REVIEW_DATA = {
  title: "Earth view: V02 to V23",
  subtitle: "Earth built up in order, from a plain ball with coarse continents (V02) to launches, satellites and mountains (V23). V02 to V10: continents, deserts and ice caps, clouds, a station, a launch and a storm. V11 to V20: shaded continents, mountains, aurora, city lights and sea ice. V21: a dot map from real coastlines. V22: satellites on faded orbits, with storms and rockets to scale. V23: launch sites and large satellites only. Sizes are rough.",
  items: [
    {
      id: "V02", title: "Earth: Continents",
      image: "../Make 3D/renders/earth/v02.png",
      description: "Green continents on the blue ocean, built from a coarse grid of 10-degree cells, so the land has a bumpy edge. Sizes are rough and not to scale.",
      changes: ["Continents from a coarse land grid (about 375 cells)"],
      gaps: ["Continents are blobs, not real coastlines"]
    },
    {
      id: "V03", title: "Earth: Deserts and ice caps",
      image: "../Make 3D/renders/earth/v03.png",
      description: "Deserts in tan (the Sahara and central Australia) and white ice caps at both poles. Sizes are rough and not to scale.",
      changes: ["Desert cells in tan", "Ice caps at both poles"],
      gaps: ["Ice caps are flat discs"]
    },
    {
      id: "V04", title: "Earth: Clouds",
      image: "../Make 3D/renders/earth/v04.png",
      description: "A white cloud layer, a little see-through, drifting faster than the ground. Sizes are rough and not to scale.",
      changes: ["26 cloud blobs in their own layer", "The cloud layer spins faster than the Earth"],
      gaps: ["Clouds are blobs, not weather"]
    },
    {
      id: "V05", title: "Earth: A station in low orbit",
      image: "../Make 3D/renders/earth/v05.png",
      description: "A large satellite (a station with panels) in a low orbit. Sizes are rough and not to scale.",
      changes: ["Station core and panels, orbiting in 36 turns per loop"],
      gaps: ["Not to scale"]
    },
    {
      id: "V06", title: "Earth: A launch",
      image: "../Make 3D/renders/earth/v06.png",
      description: "A launch pad on the equator, and a rocket that lifts off once per loop and comes back down. Sizes are rough and not to scale.",
      changes: ["Pad, rocket, nose cone and plume", "Lift-off: bob along the surface normal, once per loop"],
      gaps: ["The rocket is a simple shape"]
    },
    {
      id: "V07", title: "Earth: A storm",
      image: "../Make 3D/renders/earth/v07.png",
      description: "A hurricane: three spiral arms of white clouds round a dark eye, north of the equator. Sizes are rough and not to scale.",
      changes: ["Storm: three arms of seven clouds, plus the eye"],
      gaps: ["Arms are spheres, not swirls"]
    },
    {
      id: "V08", title: "Earth: A polar satellite",
      image: "../Make 3D/renders/earth/v08.png",
      description: "A large satellite on a polar orbit, going over the north and south poles. Sizes are rough and not to scale.",
      changes: ["Polar satellite and panels, turning about the x axis"],
      gaps: ["Orbit is a circle"]
    },
    {
      id: "V09", title: "Earth: City lights",
      image: "../Make 3D/renders/earth/v09.png",
      description: "Small yellow lights on the land at night: Europe and the eastern United States. Sizes are rough and not to scale.",
      changes: ["Yellow city lights (9 spots)"],
      gaps: ["Lights are always on, not a night side"]
    },
    {
      id: "V10", title: "Earth: A second launch and storm, a longer loop",
      image: "../Make 3D/renders/earth/v10.png",
      description: "A second launch on the equator and a second storm in the south. The loop is 480 s, twice as long, so there is more in each lap. Sizes are rough and not to scale.",
      changes: ["Second rocket and storm", "Loop 480 s; all spins, clouds and orbits doubled"],
      gaps: ["The second launch is also on the equator"]
    },
    {
      id: "V11", title: "Earth: Shaded continents and clouds",
      image: "../Make 3D/renders/earth/v11.png",
      description: "Continents, deserts and ice shaded from a rough map, with ragged coasts from noise. The clouds are a drifting noise shell in place of blobs. Sizes are rough, not to scale.",
      changes: ["Shaded surface: land, desert, ice and ocean, from ellipses on the map and noise", "Noise cloud shell, drifting faster than the ground", "Storm arms are still the V07 spheres"],
      gaps: ["Continents are ellipses, not real coastlines"]
    },
    {
      id: "V12", title: "Earth: Mountain ranges",
      image: "../Make 3D/renders/earth/v12.png",
      description: "Cones along the Himalaya, the Andes, the Rockies and the Alps. Sizes are rough, not to scale.",
      changes: ["Four clusters of mountain cones"],
      gaps: ["Mountains are cones, not ranges"]
    },
    {
      id: "V13", title: "Earth: A third storm and aurora",
      image: "../Make 3D/renders/earth/v13.png",
      description: "A third storm in the north Atlantic, and green light over both poles. Sizes are rough, not to scale.",
      changes: ["Storm 3 in soft puffs", "Aurora discs at both poles"],
      gaps: ["Aurora is a flat disc"]
    },
    {
      id: "V14", title: "Earth: A constellation of small satellites",
      image: "../Make 3D/renders/earth/v14.png",
      description: "Six small satellites on low orbits, some round the equator, some over the poles. Sizes are rough, not to scale.",
      changes: ["Six small satellites, each on a spinning group", "Orbits at three tilts"],
      gaps: ["Circles, not real orbits"]
    },
    {
      id: "V15", title: "Earth: More city lights",
      image: "../Make 3D/renders/earth/v15.png",
      description: "City lights from Europe, the United States, Japan, India, and parts of Africa and South America. Sizes are rough, not to scale.",
      changes: ["About 20 city light spots"],
      gaps: ["Lights are always on"]
    },
    {
      id: "V16", title: "Earth: Craters on the Moon",
      image: "../Make 3D/renders/earth/v16.png",
      description: "Eight craters on the Moon, which move with it. Sizes are rough, not to scale.",
      changes: ["Eight craters"],
      gaps: ["Craters are dark dots"]
    },
    {
      id: "V17", title: "Earth: Two more launches",
      image: "../Make 3D/renders/earth/v17.png",
      description: "Two more rockets, on the equator on the far side, lifting off once per loop. Sizes are rough, not to scale.",
      changes: ["Launch 3 and Launch 4, bobbing outward from their pads"],
      gaps: ["The same simple rocket shape"]
    },
    {
      id: "V18", title: "Earth: Two more storms",
      image: "../Make 3D/renders/earth/v18.png",
      description: "Storms in the south Pacific and near the equator in the Indian Ocean. Sizes are rough, not to scale.",
      changes: ["Storm 4 and Storm 5 in soft puffs"],
      gaps: ["Storm arms are simple"]
    },
    {
      id: "V19", title: "Earth: Sea ice",
      image: "../Make 3D/renders/earth/v19.png",
      description: "A band of sea ice round the north, in twelve white patches. Sizes are rough, not to scale.",
      changes: ["Twelve white sea ice patches at 78 degrees north"],
      gaps: ["Patches are flat dots"]
    },
    {
      id: "V20", title: "Earth: A second cloud layer",
      image: "../Make 3D/renders/earth/v20.png",
      description: "A thinner second cloud shell turning on another axis: the clouds now have two layers. Sizes are rough, not to scale.",
      changes: ["Upper cloud shell, turning on the y axis"],
      gaps: ["Two shells are a layered look, not weather"]
    },
    {
      id: "V21", title: "Earth: Dot map from real coastlines",
      image: "../Make 3D/renders/earth/v21.png",
      description: "Land is 845 dots (144 of them Antarctic ice), one per land cell of a 5-degree grid, sampled from the Natural Earth 1:50m land outline. Deserts are sand dots in rough boxes. The sea and the clouds, storms, launches and the Moon are as in V20. Sizes are rough, not to scale.",
      changes: [
        "Continents from a real coastline map (5-degree cells) instead of ellipses",
        "Four times as many land dots as V02 to V10 (5 degrees, not 10), each about a third of the old diameter",
        "Sea is plain blue, with no noise continents",
        "Antarctica is white dots, and deserts are sand dots in rough boxes"
      ],
      gaps: [
        "Coastal cities can fall a cell off (Sydney and Tokyo are on the edge at 5 degrees)",
        "Deserts are rough boxes, not a desert map",
        "City lights (V15) still sit on the older boxes and grid"
      ]
    },
    {
      id: "V22", title: "Earth: Satellites on orbits, storms and rockets to scale",
      image: "../Make 3D/renders/earth/v22.png",
      description: "81 satellites (against 8 before) on faded orbit lines. Storms are about 2.5 in across, with puffs on the cloud shell. The cloud shells sit 0.1 and 0.2 in above the ground. Rockets are about 0.85 in tall and lift about 1 in before returning to their pads. The dot map, the sea, the Moon and the rest are as in V21. Scale and sizes are in the research note.",
      changes: [
        "Satellites: about 81 (was 8). Hubble added. ISS and polar satellite rebuilt with panels",
        "Faded orbit lines (opacity 0.3) on the planes the satellites really move in, and one for the Moon",
        "Storms about 2.5 in across (was about 20 in), made of small puffs on the cloud shell",
        "Cloud shells 0.1 and 0.2 in above the ground (were 0.3 and 0.5)",
        "Rockets about 0.85 in tall (was 8 in), pads 0.7 in across (was 6), lift about 1 in (was 26)",
        "Geostationary satellites turn with the Earth, so they stay over one spot"
      ],
      gaps: [
        "James Webb is not drawn (it would be off the page at this scale)",
        "Sizes are exaggerated: satellites and rockets are many times their real size against the Earth",
        "The mountains (V12, olive cones) are still large and are not part of this increment",
        "The Moon's distance is not to scale (30 in from the centre)"
      ]
    },
    {
      id: "V23", title: "Earth: Launches, deployment and large satellites",
      image: "../Make 3D/renders/earth/v23.png",
      description: "Launches from Kennedy, Baikonur, Kourou, Jiuquan, Vandenberg and Wenchang, one after another through the loop. The render shows a launch with a satellite just released. Sizes are exaggerated where the real size would vanish.",
      changes: [
        "Six real launch sites on land; each rocket climbs its local vertical (not an axis)",
        "Four rockets come back to their pads; two (Kourou, Wenchang) fall downrange and splash into the sea",
        "Each launch releases a new satellite at the top; it drops into the planet and is hoisted back to the nose so the loop closes",
        "Only the large satellites remain: ISS, Tiangong (new), Hubble and a geostationary weather satellite (new)",
        "Mountains: the V12 pyramids are replaced by small peaks along the Andes, Rockies, Alps and Himalaya"
      ],
      gaps: [
        "The deployed satellite drops into the planet rather than staying in orbit (a closed loop can't keep it there)",
        "The splash is a drop from the top of the climb; the first stage does not break up",
        "Sizes are exaggerated: rockets are about 0.85 in tall, far larger than to scale",
        "The Moon's distance is not to scale"
      ]
    }
  ]
};
