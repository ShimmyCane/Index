// Review data for Adventure Coaster Park, compact and animated: V11 to V15, built in Make 3D (tools/adventure_park_compact.js).
// Each version has a motion file (models/adventure-park-vNN/motion.json), played in the Make 3D viewer's play bar.
window.REVIEW_DATA = {
  title: "Adventure Coaster Park: compact and animated, V11 to V15",
  subtitle: "The park shrinks to about half its footprint, then each ride gets motion in turn. Each loop is one real lap of Thunder Trail, about 18 s. Capacity stays at 1,000 an hour.",
  items: [
    {
      id: "V11", title: "Compact footprint",
      image: "../Make 3D/renders/adventure_park_compact/v11.png",
      description: "The same rides on a tighter plan, about 300 by 250 ft instead of 600 by 400 ft. Thunder Trail's lift is 60 ft (a test model; more fun). The rides run faster than real time, then wait at the station.",
      changes: ["Plaza, paths and gate rebuilt at half the size", "Pip's oval, Bumble River, teacups, Thunder Trail and Splash Falls all moved closer", "Thunder Trail lift 60 ft"],
      gaps: ["Still static: no motion yet", "Default camera frames only part of the park"]
    },
    {
      id: "V12", title: "Cars on the track",
      image: "../Make 3D/renders/adventure_park_compact/v12.png",
      description: "Pip's two cars and Thunder Trail's two cars run their curved tracks, pitched to the slope. Thunder Trail reaches about 40 mph on the first drop (real time). The second car on each track starts halfway round.",
      changes: ["Pip's cars follow the oval, facing the way they travel", "Thunder Trail's cars follow the coaster track", "Path motion: each car faces along its track"],
      gaps: ["Cars run on the same spline as the rails", "Pip runs at a steady speed, as a kiddie ride would"]
    },
    {
      id: "V13", title: "Teacups, boats and bobbing",
      image: "../Make 3D/renders/adventure_park_compact/v13.png",
      description: "The four teacups spin three times per loop. Bumble River boats drift along the river and back. Splash Falls log boats climb the lift and drop into the pool, speed from gravity.",
      changes: ["Teacup spin: the four cups turn about the centre pole", "Bumble boats slide 16 ft along the river and back, staggered", "Splash boats follow the flume path, speed from gravity and drag"],
      gaps: ["Cups do not tilt as they spin", "Boats slide straight, not along a curve"]
    },
    {
      id: "V14", title: "Sky Wheel and waving flags",
      image: "../Make 3D/renders/adventure_park_compact/v14.png",
      description: "A new show ride: the Sky Wheel, with 12 bubble cars turning twice per loop. Flags wave by the gate and balloons bob over the plaza. The Sky Wheel is not counted in capacity.",
      changes: ["Sky Wheel: rim, spokes, tower and A-frame, turning about its hub", "Two flags swing 18 degrees each way", "Three balloons bob 2 ft"],
      gaps: ["Sky Wheel gondolas are spheres and turn with the wheel", "Decide whether the Sky Wheel counts toward capacity"]
    },
    {
      id: "V15", title: "Fountain wave: every ride moves",
      image: "../Make 3D/renders/adventure_park_compact/v15.png",
      description: "The plaza fountain's eight jets rise and fall in a wave round the basin. Every ride and feature in the park moves.",
      changes: ["Round fountain basin on the plaza", "Eight jets bob 3 ft, one eighth of a loop apart"],
      gaps: ["Jets are spheres, not spray", "Motion is a bob, not a full water show"]
    },
    {
      id: "V16", title: "Life in the park",
      image: "../Make 3D/renders/adventure_park_compact/v16.png",
      description: "Visitors walk in and out of the gate and round the plaza, four vendor stalls with awnings, five birds on a loop high over the park, and three free balloons drifting.",
      changes: ["Two visitors walk in and out of the gate, one loop each way", "Four visitors walk round the plaza", "Four vendor stalls with keepers", "Five birds fly a 3-D loop with a wing beat", "Three free balloons drift up, down and sideways"],
      gaps: ["Visitors are simple cylinders with heads", "Birds have fixed wings"]
    }
  ]
};
