// Review data for the Earth view: V02 to V10 (tools/planet_views.js, earthScene).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Earth view: V02 to V10",
  subtitle: "Earth on its own, built up from a plain ball: continents, deserts and ice caps, clouds, a station, a launch, a storm, a polar satellite, city lights and a second launch. Version 10 has a loop twice as long. Sizes are rough.",
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
    }
  ]
};
