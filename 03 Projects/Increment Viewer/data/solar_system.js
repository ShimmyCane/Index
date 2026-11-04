// Review data for the Solar System: five increments built in Make 3D (tools/solar_system.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
// Not to scale: sizes and distances are compressed so every body can be seen. Estimates from NASA fact sheets.
window.REVIEW_DATA = {
  title: "Solar System: V01 to V08",
  subtitle: "The Sun and nine planets, now with true orbits (V06). The Sun and nine planets on their orbits, with a 160-rock asteroid belt, banded gas giants with rings, and one 240 s loop of orbits and spins. Not to scale. Tap a planet in Make 3D to open its own view; each planet view has a pink marker to fly back. Sizes and distances are estimates.",
  items: [
    {
      id: "V01", title: "Blockout: the Sun and nine planets",
      image: "../Make 3D/renders/solar-system/v01.png",
      description: "The Sun in the middle, the four small planets (Mercury, Venus, Earth, Mars), the four gas giants (Jupiter, Saturn, Uranus, Neptune), and Pluto on the outside. Each orbit is a one-pixel line of short boxes. Still, no motion.",
      changes: ["Sun, 40 in radius (stylised)", "Nine planets on orbit groups, with their spinning bodies in place", "Orbit lines: 60 short boxes per orbit, about one pixel thick", "Planets are exaggerated, orbits compressed; the order is kept"],
      gaps: ["Planets are plain colours: no bands or rings yet", "No asteroids", "Nothing moves"]
    },
    {
      id: "V02", title: "Asteroid belt",
      image: "../Make 3D/renders/solar-system/v02.png",
      description: "The asteroid belt between Mars and Jupiter: 160 rocks, scattered in a ring from 240 to 290 in out from the Sun, with a few sizes and two shades.",
      changes: ["160 rocks in a flat ring (seeded, so the layout never changes)", "Two rock colours, sizes from 0.8 to 2.4 in"],
      gaps: ["Rocks do not turn on their own", "The belt does not move yet"]
    },
    {
      id: "V03", title: "Gas giants: bands and rings",
      image: "../Make 3D/renders/solar-system/v03.png",
      description: "Jupiter, Saturn, Uranus and Neptune get stripes of cloud, and Saturn gets its rings. The stripes are flat slices stacked up the planet, so they show from the side.",
      changes: ["Jupiter: eight cloud bands in three tans", "Saturn: eight bands and two flat rings", "Neptune: six deep-blue bands", "Uranus: one pale blue"],
      gaps: ["Bands look stepped, not smooth", "Earth, Mars and Venus still plain"]
    },
    {
      id: "V04", title: "Motion: orbits and spins",
      image: "../Make 3D/renders/solar-system/v04.png",
      description: "The whole system moves on one 240 second loop. Each planet goes round the Sun (Mercury fastest, Pluto slowest) and spins on its own axis, and the belt turns. Each speed is a whole number of turns, so the loop closes with no jump. Autoplays twice, then pauses. Speeds are stylised.",
      changes: ["Orbit: 24, 16, 12, 8, 4, 3, 2, 1, 1 turns per loop from Mercury to Pluto", "Spin: whole turns per loop; Uranus spins about its sideways axis", "Belt turns 6 times per loop", "Motion file: 19 spin motions"],
      gaps: ["Venus and Pluto spin the normal way (real spin is backwards; this model cannot flip it yet)", "Orbits are flat circles, not ellipses; Pluto's tilt is not shown", "Speeds are not to scale"]
    },
    {
      id: "V05", title: "Atmospheres and the Sun's glow",
      image: "../Make 3D/renders/solar-system/v05.png",
      description: "Each planet with air gets a faint see-through haze, and the Sun gets a glow. Taps pass through the haze and glow to the planet. Tap a planet to get a button in the upper right that opens its own view with a zoom; each planet view has a way back.",
      changes: ["Atmosphere haze on Venus, Earth, Mars and the gas giants", "Sun glow", "Each planet tagged to open its own view (link:planet-<name>:zoom)", "Planet views: Mercury to Pluto, each with its moons and a fade back"],
      gaps: ["Haze is a flat colour, not a real atmosphere", "Planet surfaces are plain, with no textures", "Moons are only in the planet views, not here"]
    }    ,
    {
      id: "V06", title: "True orbits, one lap of Pluto",
      image: "../Make 3D/renders/solar-system/v06.png",
      description: "Every orbit is now true: its shape (eccentricity), its tilt, and where each planet is on 2 November 2026. Orbits are scaled by the square root of their distance so the inner planets are not crowded. The whole animation is one lap of Pluto (about 248 years) in 240 s. It plays once and holds. Faster planets lap many times, so their spins blur at this pace. The month and year tracker at the lower right follows the timeline; scroll or drag it to move through time.",
      changes: ["Real eccentricities and tilts (Pluto 17 degrees, Mercury 7 degrees)", "Start positions from JPL approximate elements for 2 November 2026 (Earth at about 40 degrees, as it should be)", "One-shot timeline: no loop; Pluto's lap sets the pace", "Spins are real in direction: Venus, Uranus and Pluto turn backwards", "Every belt rock on its own orbit, from a fixed pattern (not real asteroids)", "Month and year tracker, lower right: scroll or drag", "Tap a planet to open its own view; the view's Back button returns here"],
      gaps: ["Speeds at this pace blur the spins of the fast planets", "Orbits are drawn as one-pixel boxes, so they look thin at a distance", "Sizes are rough and exaggerated; distances are square-root compressed", "Belt rocks are a pattern, not real asteroid positions"]
    }    ,
    {
      id: "V07", title: "From Explorer 1 (1958), with comets",
      image: "../Make 3D/renders/solar-system/v07.png",
      description: "The timeline now starts on 31 January 1958, when Explorer 1, the first US satellite, launched. The planets are placed on that day. Halley's Comet, Encke and Tempel 1 are added on their true orbits. Halley's real perihelion is inside Mercury's orbit, so in this view it dips inside the drawn Sun. The tracker steps by year when far out, and by day when close in; zoomed in, the animation slows down so the Earth moves smoothly.",
      changes: ["Start on 31 January 1958 (Explorer 1)", "Halley's Comet, Encke and Tempel 1 on true orbits", "Tracker steps by year, month, week or day, following the zoom", "Playback slows as you zoom in (about 0.1 times at close range)"],
      gaps: ["Halley's perihelion is inside the drawn Sun", "Hale-Bopp is not added (its orbit is too far for this scale)", "Comet elements are approximate and must be checked against the JPL Small-Body Database", "Comets have no tails"]
    },
    {
      id: "V08", title: "The five dwarf planets",
      image: "../Make 3D/renders/solar-system/v08.png",
      description: "Pluto is one of five dwarf planets. The other four are added on their own orbits: Ceres, in the asteroid belt between Mars and Jupiter; Haumea, a stretched, fast-spinning body far out past Neptune; Makemake, a reddish icy body a little farther out; and Eris, the most distant of the five, on a very tilted, stretched orbit. Eris takes about 560 years to go round, so in the 240 s loop it does not finish one lap. How to read this: the outer ellipses are the dwarf planets' orbits; the bodies are not to scale.",
      changes: ["Ceres, Haumea, Makemake and Eris added, each with its own true-shaped orbit line and spin", "Pluto's five-dwarf-planet family complete: Ceres, Pluto, Haumea, Makemake, Eris", "Sizes from published diameters: Ceres about 940 km, Haumea about 1,400 km, Makemake about 1,430 km, Eris about 2,330 km"],
      gaps: ["Starting places of the four new dwarfs are a placeholder (each starts at perihelion on J2000), not their true place on 31 January 1958", "Inclination, node and perihelion for Ceres, Haumea, Makemake and Eris are from memory of the JPL Small-Body Database and must be checked there", "Haumea is drawn as a sphere, though it is elongated", "Eris's and Makemake's diameters differ between sources (Makemake 1,430 vs 1,500 km)"]
    }
  ]
};
