// Review data for the Earth view: V21 (tools/planet_views_v4.js, scene planet-earth-v21).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Earth view: V21, dot map from real coastlines",
  subtitle: "The continents are redrawn as a dot map: one dot on each cell of a 5-degree grid that is land on a real coastline map. The grid is four times denser than V02 to V10, and the dots are smaller. The sea is plain, with no ellipses or noise continents.",
  items: [
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
    }
  ]
};
