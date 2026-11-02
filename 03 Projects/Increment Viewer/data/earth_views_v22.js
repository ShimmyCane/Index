// Review data for the Earth view: V22 (tools/earth_v22.js, scene planet-earth-v22).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Earth view: V22, satellites on faded orbits, storms and rockets to scale",
  subtitle: "The floating parts are brought closer to scale: about ten times the satellites (the ISS, Hubble, a constellation on four rings, navigation and geostationary rings, a polar weather satellite), faded orbit lines, storms about 2.5 in across, clouds just above the ground and rockets about 0.85 in tall. Exaggerated where the real size would vanish.",
  items: [
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
    }
  ]
};
