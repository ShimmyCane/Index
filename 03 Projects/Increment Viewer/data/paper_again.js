// Review data for Paper Again: one sheet of white paper, ten increments.
// Synthetic test story. Frames are fixed-pose renders from the Paper Again simulation
// (03 Projects/Paper Again/paper_again.html). Environment is a placeholder (outdoors).
// Images are read relative to viewer.html, so they go up one folder into the project.
window.REVIEW_DATA = {
  title: "Paper Again: one sheet, ten increments",
  subtitle: "A particle-spring model of paper. Each increment is run physically from the one before, then the sheet tumbles and drops.",
  items: [
    {
      id: "1", title: "Floating, then a boot",
      image: "../Paper Again/renders/paper_again_01.png",
      description: "The sheet hangs in the air, drifts, and falls flat. A boot stamps a dent and a dirty print into the middle.",
      changes: ["Flat sheet falls to the floor", "Dent from the boot", "Dirt in the dent"],
      gaps: ["Environment is a placeholder (outdoors)"]
    },
    {
      id: "2", title: "Truck and a big crease",
      image: "../Paper Again/renders/paper_again_02.png",
      description: "A wheel rolls over a band, then one half is folded over. The crease is plastic, so it holds after the fold.",
      changes: ["Band flattened by the wheel", "Big crease that stays"],
      gaps: ["Fold is a rotation followed by settling, not a hand fold"]
    },
    {
      id: "3", title: "Wind rolls it into a ball",
      image: "../Paper Again/renders/paper_again_03.png",
      description: "Gusts toss the sheet and it gathers into a crumpled ball. Creases set and the layers rest on each other.",
      changes: ["Crumpled ball with many creases", "Layers touch and push apart"],
      gaps: ["The ball is held by a soft shell until the first cut; real jamming is not modelled"]
    },
    {
      id: "4", title: "Tear",
      image: "../Paper Again/renders/paper_again_04.png",
      description: "A strip is torn off the top edge along a rough line. Breaks are random, so the edge is jagged.",
      changes: ["Torn strip along the top", "Openings in the ball"],
      gaps: ["Tear edges follow the grid, not single fibres"]
    },
    {
      id: "5", title: "Junk caught in it",
      image: "../Paper Again/renders/paper_again_05.png",
      description: "A bottle cap and a leaf press into the ball. Grime settles in the folds.",
      changes: ["Two new dents", "Dirt builds in the folds"],
      gaps: ["Dirt is shown as a darker grey; colour is simple"]
    },
    {
      id: "6", title: "Damp, then stained",
      image: "../Paper Again/renders/paper_again_06.png",
      description: "Rain soaks one side. The wet paper softens and dries with a darker tide line at the edge.",
      changes: ["Wet area spreads", "Tide-line stain at the edge"],
      gaps: ["Fluffy edges are a small random jitter, not real fibre swelling"]
    },
    {
      id: "7", title: "First cut",
      image: "../Paper Again/renders/paper_again_07.png",
      description: "Scissors cut across the middle. The two sides drop apart; the cut is straight.",
      changes: ["Two pieces", "Ball opened by the cut"],
      gaps: ["Cut edge is a straight line of broken springs, one grid cell wide"]
    },
    {
      id: "8", title: "Second cut",
      image: "../Paper Again/renders/paper_again_08.png",
      description: "One piece is cut again, so there are three pieces. The damp area keeps darkening.",
      changes: ["Three pieces", "Mould begins in the wet area"],
      gaps: ["Mould colour is a placeholder"]
    },
    {
      id: "9", title: "Burn, holes and mould",
      image: "../Paper Again/renders/paper_again_09.png",
      description: "A corner is scorched, which blackens and curls the edge. Insects eat holes, and mould grows where it stays wet.",
      changes: ["Scorched, curled corner", "Holes from insects", "Mould spreads"],
      gaps: ["Burn is a soft dark patch, not a char line"]
    },
    {
      id: "10", title: "Nest with animals",
      image: "../Paper Again/renders/paper_again_10.png",
      description: "Animals pull shreds into a bundle in one corner. More holes, more mould, and the sheet keeps its tumbled pose.",
      changes: ["Shreds gathered into a bundle", "More holes and mould"],
      gaps: ["Animals are only shown by their traces"]
    }
  ]
};
