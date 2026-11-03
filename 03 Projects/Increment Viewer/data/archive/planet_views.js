// Review data for the planet views: V02 and V03 for the eight planets (tools/planet_views.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
// Textures are simple and placed by latitude and longitude; sizes are rough.
window.REVIEW_DATA = {
  title: "Planet views: V02 and V03",
  subtitle: "Each planet on its own, with textures: spots, caps, craters and extra moons. Open a planet from the Solar System view. The button at the top left returns to the Solar System. Sizes are rough.",
  items: [
    {
      id: "Mercury V02", title: "Mercury: textures",
      image: "../Make 3D/renders/planets/mercury-v02.png",
      description: "Mercury on its own, increment 2: craters. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Dark craters on the surface (14)"],
      gaps: ["Craters are dots, not real shapes"]
    },
    {
      id: "Mercury V03", title: "Mercury: more textures and moons",
      image: "../Make 3D/renders/planets/mercury-v03.png",
      description: "Mercury on its own, increment 3: bright rays and more craters. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Bright ray craters", "Six more craters"],
      gaps: ["Rays are dots"]
    },
    {
      id: "Venus V02", title: "Venus: textures",
      image: "../Make 3D/renders/planets/venus-v02.png",
      description: "Venus on its own, increment 2: cloud bands. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Cloud bands (venusb1 and venusb2 stripes)"],
      gaps: ["Clouds are flat stripes, not swirls"]
    },
    {
      id: "Venus V03", title: "Venus: more textures and moons",
      image: "../Make 3D/renders/planets/venus-v03.png",
      description: "Venus on its own, increment 3: polar vortices. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Polar vortices, two discs"],
      gaps: ["Vortices are flat"]
    },
    {
      id: "Mars V02", title: "Mars: textures",
      image: "../Make 3D/renders/planets/mars-v02.png",
      description: "Mars on its own, increment 2: polar caps, a dark region, Olympus Mons. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Polar caps", "Dark region", "Olympus Mons, a cone on the surface", "No extra moons added"],
      gaps: ["Canyons not shown"]
    },
    {
      id: "Mars V03", title: "Mars: more textures and moons",
      image: "../Make 3D/renders/planets/mars-v03.png",
      description: "Mars on its own, increment 3: dust clouds. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Five dust clouds, translucent"],
      gaps: ["No canyons"]
    },
    {
      id: "Jupiter V02", title: "Jupiter: textures",
      image: "../Make 3D/renders/planets/jupiter-v02.png",
      description: "Jupiter on its own, increment 2: the Great Red Spot and white ovals. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Great Red Spot, a red disc", "A white oval", "Amalthea and Himalia added"],
      gaps: ["Spot is flat and round, not oval"]
    },
    {
      id: "Jupiter V03", title: "Jupiter: more textures and moons",
      image: "../Make 3D/renders/planets/jupiter-v03.png",
      description: "Jupiter on its own, increment 3: more ovals and a small red spot. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Two more white ovals and a second small red spot", "Thebe added"],
      gaps: ["Bands still look stepped up close"]
    },
    {
      id: "Saturn V02", title: "Saturn: textures",
      image: "../Make 3D/renders/planets/saturn-v02.png",
      description: "Saturn on its own, increment 2: a hexagon at the north pole and four more moons. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["North hexagon, a flat disc", "Mimas, Tethys, Dione and Rhea added"],
      gaps: ["Hexagon is round"]
    },
    {
      id: "Saturn V03", title: "Saturn: more textures and moons",
      image: "../Make 3D/renders/planets/saturn-v03.png",
      description: "Saturn on its own, increment 3: the Cassini gap and Iapetus. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Cassini gap, a dark ring", "Iapetus added"],
      gaps: ["Rings are still discs"]
    },
    {
      id: "Uranus V02", title: "Uranus: textures",
      image: "../Make 3D/renders/planets/uranus-v02.png",
      description: "Uranus on its own, increment 2: thin dark rings and a polar cap. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Two thin dark rings", "Polar cap", "Umbriel, Titania and Oberon added"],
      gaps: ["Rings are plain discs"]
    },
    {
      id: "Uranus V03", title: "Uranus: more textures and moons",
      image: "../Make 3D/renders/planets/uranus-v03.png",
      description: "Uranus on its own, increment 3: a bright spot and Puck. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["A bright spot", "Puck added"],
      gaps: ["No tilt shown"]
    },
    {
      id: "Neptune V02", title: "Neptune: textures",
      image: "../Make 3D/renders/planets/neptune-v02.png",
      description: "Neptune on its own, increment 2: the Great Dark Spot and white clouds. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Great Dark Spot", "Four white clouds", "Proteus added"],
      gaps: ["Spot is round"]
    },
    {
      id: "Neptune V03", title: "Neptune: more textures and moons",
      image: "../Make 3D/renders/planets/neptune-v03.png",
      description: "Neptune on its own, increment 3: more clouds and a dark patch. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Four more white clouds and a dark patch", "Nereid added"],
      gaps: ["Patch is round"]
    },
    {
      id: "Pluto V02", title: "Pluto: textures",
      image: "../Make 3D/renders/planets/pluto-v02.png",
      description: "Pluto on its own, increment 2: the bright heart-shaped plain. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Heart-shaped plain (a light disc)", "Nix and Hydra added"],
      gaps: ["Heart is round"]
    },
    {
      id: "Pluto V03", title: "Pluto: more textures and moons",
      image: "../Make 3D/renders/planets/pluto-v03.png",
      description: "Pluto on its own, increment 3: a nitrogen cap and mountains. Textures are placed by latitude and longitude, and sizes are rough. Spins, and its moons go round it.",
      changes: ["Nitrogen cap", "Four small mountains"],
      gaps: ["Mountains are dots"]
    }
  ]
};
