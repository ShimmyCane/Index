// Review data for Adventure Coaster Park: merged from adventure_park, adventure_park_compact.
// The originals are kept in data/archive/. Images are read relative to viewer.html.
window.REVIEW_DATA = {
  title: "Adventure Coaster Park: V01 to V16",
  subtitle: "A family theme park with one adventure coaster, growing from 250 to 1,000 guests an hour in ten steps (V01 to V10). From V11 the park is compact, about half its footprint, and each ride gets motion in turn; each loop is one real lap of Thunder Trail, about 18 s. Capacity is seats x 3600 / dispatch interval. Sizes are planning estimates in feet.",
  items: [
    {
      id: "V01", title: "Blockout: 250 an hour",
      image: "../Make 3D/renders/adventure_park/v01.png",
      description: "Gate, paths and plaza, and Pip's Little Loop, an oval kiddie coaster with two five-seat cars (10 seats, 144 s dispatch = 250 an hour).",
      changes: ["Gate with beam and posts at the south end", "Main path, plaza and east and west walks", "Pip's oval track, 12 points, 5 to 9 ft high, with station and two cars"],
      gaps: ["Park is mostly empty", "Track is two rails on posts, no ties", "Cars are plain boxes"]
    },
    {
      id: "V02", title: "Bumble River: 350 an hour",
      image: "../Make 3D/renders/adventure_park/v02.png",
      description: "A short river with four boats (4 seats, 144 s = 100 an hour), a station and a path from the plaza.",
      changes: ["Mint water 110 ft long, 1.5 ft deep", "Four boats and a boarding station", "Path from the plaza to the river"],
      gaps: ["Water is a flat slab, no banks", "Boats sit on the surface, no hull shape"]
    },
    {
      id: "V03", title: "Teacup Twirl: 450 an hour",
      image: "../Make 3D/renders/adventure_park/v03.png",
      description: "Turntable with four teacups (8 seats, 288 s = 100 an hour) under a coral canopy.",
      changes: ["30 ft turntable with a centre pole", "Coral canopy over four pink cups"],
      gaps: ["Cups are cylinders, no handles", "No queue area yet (see V04)"]
    },
    {
      id: "V04", title: "Safety: queues and signs",
      image: "../Make 3D/renders/adventure_park/v04.png",
      description: "Safety step with no new capacity: queue fences for Pip and the teacups, a 36 in height sign, and a clear emergency walkway along the south edge.",
      changes: ["Queue fence for Pip, south of the station", "Queue fence around the teacups", "Height sign at Pip, 36 in", "Emergency walkway 560 ft long, 8 ft wide"],
      gaps: ["Only one height sign so far", "No exit signs yet"]
    },
    {
      id: "V05", title: "Thunder Trail: 850 an hour",
      image: "../Make 3D/renders/adventure_park/v05.png",
      description: "The adventure family coaster: a 60 ft lift hill, a 55 ft drop, two hills and a bend back to the station. Two cars of five seats, 90 s dispatch = 400 an hour.",
      changes: ["Closed track of 15 points, 2 ft gauge", "Lift hill to 60 ft, then a drop", "Station 36 ft by 20 ft, lift motor house", "Steel supports under each high point"],
      gaps: ["Track is straight segments, not smooth curves", "Brake and station details not yet modelled", "Clash check not run on the coaster"]
    },
    {
      id: "V06", title: "Coaster safety",
      image: "../Make 3D/renders/adventure_park/v06.png",
      description: "Safety step with no new capacity: a low guard rail beside the lift hill and a canopy over the Thunder queue.",
      changes: ["Guard rail beside the lift hill, 4 ft high", "Canopy over the Thunder station on four posts"],
      gaps: ["Guard rail is a single bar, no posts", "No restraint or lap-bar check yet"]
    },
    {
      id: "V07", title: "Splash Falls: 1,000 an hour",
      image: "../Make 3D/renders/adventure_park/v07.png",
      description: "Log flume with a 43 degree lift, a 48 degree drop into the pool, three boats of two seats (6 seats, 144 s = 150 an hour). This completes the 1,000 an hour target.",
      changes: ["Pool 110 ft long with rails on both sides", "Lift 41 ft long at 43 degrees", "Drop 37 ft long at 48 degrees", "Station and roof"],
      gaps: ["Flume is outside the default camera frame; check it in the viewer", "Boats are plain blocks"]
    },
    {
      id: "V08", title: "Fineness: trees and lamps",
      image: "../Make 3D/renders/adventure_park/v08.png",
      description: "Trees, benches, lamps and flower beds. No change to capacity.",
      changes: ["Nine trees with round crowns", "Two benches by the plaza", "Six lamps along the main path", "Three flower beds"],
      gaps: ["Trees are all the same shape", "Lamps are plain posts"]
    },
    {
      id: "V09", title: "Safety check",
      image: "../Make 3D/renders/adventure_park/v09.png",
      description: "Second height sign at Thunder Trail, a first-aid hut, two exit signs, two stop buttons and a staff fence around the lift motor house.",
      changes: ["Height sign at Thunder, 48 in", "First-aid hut beside the plaza", "Exit signs by the gate", "Stop buttons at Thunder and Splash Falls", "Staff fence round the motor house"],
      gaps: ["Exit signs are small", "No fire-exit route marked in the plaza"]
    },
    {
      id: "V10", title: "Finish: flags and balloons",
      image: "../Make 3D/renders/adventure_park/v10.png",
      description: "Park sign over the gate, two flags, and three balloons on sticks. Capacity stays at 1,000 an hour.",
      changes: ["Park sign 60 ft wide over the gate", "Two flagpoles with pastel flags", "Three balloons on sticks"],
      gaps: ["Park sign is one flat board", "Default camera does not frame the whole park"]
    },
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
