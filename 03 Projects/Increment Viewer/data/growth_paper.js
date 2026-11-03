// Review data for the Growth story: one white paper sheet, ten steps.
// Synthetic test story. Frames are 3-D renders from the Growth engine (03 Projects/Growth/paper3d.html). Environment is a placeholder (outdoors).
// Images are read relative to viewer.html, so they go up one folder into the project.
window.REVIEW_DATA = {
  title: "Growth: white paper, ten steps",
  subtitle: "A test story for the growth engine. Steps 1 to 2 arrival, 3 to 4 weather, 5 to 10 life. Outdoors is a placeholder setting.",
  items: [
    {
      id: "1", title: "Floating, then a boot",
      image: "../Growth/renders/growth_3d_01.png",
      description: "The sheet drifts in the air, then a boot stamps it onto the ground: a print in the middle and a bent corner.",
      changes: ["Boot print in the middle", "Top corner bent"],
      gaps: ["Environment is a placeholder (outdoors)"]
    },
    {
      id: "2", title: "Truck and crease",
      image: "../Growth/renders/growth_3d_02.png",
      description: "A truck runs over the sheet, leaving a wheel track across the lower half. A big crease runs through the middle.",
      changes: ["Wheel track across the lower half", "Big crease across the middle"]
    },
    {
      id: "3", title: "Wind",
      image: "../Growth/renders/growth_3d_03.png",
      description: "The wind lifts the sheet and folds the edges back. The crease softens and the surface starts to curl.",
      changes: ["Edges curl up", "Crease softened"]
    },
    {
      id: "4", title: "Tear",
      image: "../Growth/renders/growth_3d_04.png",
      description: "A corner catches on a branch and tears, leaving a ragged edge.",
      changes: ["Torn corner with a ragged edge"]
    },
    {
      id: "5", title: "Junk picked up",
      image: "../Growth/renders/growth_3d_05.png",
      description: "Scraps and litter catch on the sheet and stick to it.",
      changes: ["A bottle cap and a leaf stuck to the surface"]
    },
    {
      id: "6", title: "Wet and fluffy",
      image: "../Growth/renders/growth_3d_06.png",
      description: "Rain soaks the paper. It swells, goes soft and fluffy at the edges, and the surface turns slightly grey.",
      changes: ["Edges swollen and fluffy", "Surface softer and greyer"]
    },
    {
      id: "7", title: "First cut",
      image: "../Growth/renders/growth_3d_07.png",
      description: "Something cuts the sheet in two along a clean line. A loose strip stays on one side.",
      changes: ["Sheet in two pieces", "Loose strip beside one piece"]
    },
    {
      id: "8", title: "Second cut",
      image: "../Growth/renders/growth_3d_08.png",
      description: "One of the two pieces is cut again, so the story now has three pieces.",
      changes: ["Third piece from the second cut"]
    },
    {
      id: "9", title: "Nest starts",
      image: "../Growth/renders/growth_3d_09.png",
      description: "Insects move in. Small holes appear in one corner, and shredded bits gather there.",
      changes: ["Holes in one corner", "Shredded bits gathered as nest material"],
      gaps: ["Insects are only shown by their traces"]
    },
    {
      id: "10", title: "Nest with animals",
      image: "../Growth/renders/growth_3d_10.png",
      description: "Animals use the nest. Paper is pulled into a bundle in one corner, with nest scraps around it.",
      changes: ["Bundled paper in one corner", "Nest scraps around the bundle"],
      gaps: ["Animals are only shown by their traces"]
    }
  ]
};
