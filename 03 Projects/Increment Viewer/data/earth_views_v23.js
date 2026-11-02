// Review data for the Earth view: V23 (tools/earth_v23.js, scene planet-earth-v23).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Earth view: V23, launch sites, deployment, large satellites only, mountain ranges",
  subtitle: "Six real launch sites. Each launch climbs its local vertical and comes back to its pad (four), or its first stage falls into the sea (two). Each rocket carries a new satellite that is released at the top and drops out of sight. Only the large satellites stay: the ISS, Tiangong, Hubble and a geostationary weather satellite. The mountains are small peaks along four ranges.",
  items: [
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
