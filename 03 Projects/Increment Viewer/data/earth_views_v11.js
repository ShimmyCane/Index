// Review data for the Earth view: V11 to V20 (tools/planet_views_v4.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Earth view: V11 to V20",
  subtitle: "Earth built up again: shaded continents and a drifting cloud shell, then mountains, a third storm, aurora, small satellites, more city lights, craters on the Moon, more launches, sea ice and a second cloud layer. Each version fills three quarters of the screen.",
  items: [
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
    }
  ]
};
