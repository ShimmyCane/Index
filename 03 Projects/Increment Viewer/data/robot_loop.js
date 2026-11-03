// Review data for the robot loop: three increments built in Make 3D (tools/robot_loop.js). The robot with a banana
// now walks the loop from the Quick Detail "Robot Loop", and gets a frisbee and a top hat, each a visibility group
// (the Parts dropdown, upper right). Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Robot going for a stroll: V02 to V05, the sketched walk, frisbee, top hat and cape",
  subtitle: "A toy robot about 3 ft tall walks the loop from the Quick Detail \"Robot Loop\" (about 14 ft by 20 ft, about 70 ft round, estimated from the sketch's 19'-7\" label). Build on V01 (robot with a banana, Make 3D). Open the model in Make 3D (index.html?model=robot-loop-v04) to watch it and use the Parts dropdown.",
  items: [
    {
      id: "V2", title: "The sketched loop",
      image: "../Make 3D/renders/robot-loop/v02.png",
      description: "The walk now follows the sketch. The stroke does not join at its ends (the last point is about 8 in from the first, with a sharp turn), so the path is averaged round the loop to make the seam smooth: the heading turns by under 2 degrees there. The robot starts at the origin facing +X, and the stepping stones are laid along the new path. One 38 s lap, autoplays twice.",
      changes: ["Walk path from the sketch: 48 points, closed and smooth", "Stepping stones along the new path", "Banana is a visibility group (Parts dropdown)"],
      gaps: ["Scale is an estimate: the closed shape's longest side is taken as 19'-7\" (235 in)", "The path reads as one long oval with a tail, so check it against the sketch", "Length of the lap is about 70 ft at the estimated scale"]
    },
    {
      id: "V3", title: "Frisbee",
      image: "../Make 3D/renders/robot-loop/v03.png",
      description: "A coral frisbee with a raised ring, held in the left hand. It is a group of its own, so it swings with the arm and can be hidden from the Parts dropdown.",
      changes: ["Frisbee group on the left arm: a disc and a raised rim", "Frisbee is a visibility group"],
      gaps: ["The hand touches the rim rather than gripping the disc", "The disc is flat at hand height, so it does not turn in the walk"]
    },
    {
      id: "V4", title: "Top hat",
      image: "../Make 3D/renders/robot-loop/v04.png",
      description: "A black top hat with a coral band, sitting on the head. It rides the upper body, so it sways with the walk.",
      changes: ["Top hat group on the head: brim, crown and band", "Hat is a visibility group"],
      gaps: ["The antenna passes through the crown (the antenna was not moved)", "The hat sits flat, not tilted"]
    },
    {
      id: "V5", title: "Frisbee in the banana hand, and the cape",
      image: "../Make 3D/renders/robot-loop/v05.png",
      description: "The frisbee moves to the right hand, with the banana. The cape (from the Quick Detail \"Robot Cape\") hangs from the shoulders: a double-sided sheet with a yellow border, brown tassels and round holes. A wave runs down it all the time, and the lower cape swings out in tight turns.",
      changes: ["Frisbee moved to the right hand, beside the banana", "Cape: a sheet on a 7-joint skeleton, 22 in tall, about 8 to 11 in wide", "Cape motion: a wave down the cape (always) and a sideways swing on the turns, scaled by how sharply the walk turns", "Cape is a visibility group"],
      gaps: ["Sized to the robot (22 in), not to the drawn 7'-10\"; the proportions are the sketch's", "The holes are coloured discs on the back, not cut-outs (a sheet cannot have holes)", "The border is a row of small beads, not a continuous trim", "No sheen: the material is a flat colour", "The cape is a sheet, not a cloth: it does not collide with the robot"]
    }
  ]
};
