// Review data for the Solar System: five increments built in Make 3D (tools/solar_system.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
// Not to scale: sizes and distances are compressed so every body can be seen. Estimates from NASA fact sheets.
window.REVIEW_DATA = {
  title: "Solar System: V01 to V05",
  subtitle: "The Sun and nine planets on their orbits, with a 160-rock asteroid belt, banded gas giants with rings, and one 240 s loop of orbits and spins. Not to scale. Tap a planet in Make 3D to open its own view; each planet view has a pink marker to fly back. Sizes and distances are estimates.",
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
    }
  ]
};
