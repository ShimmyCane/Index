// Review data for the Honda CR-V test model: five increments built in Make 3D (tools/honda_crv.js).
// Images are read relative to viewer.html, so they go up one folder into the Make 3D project.
window.REVIEW_DATA = {
  title: "Honda CR-V test model: V01 to V05",
  subtitle: "Five increments of one car, built from published spec figures (about 185 in long, 73.5 in wide, 66.5 in high). Each step: render, check the proportions, change a few things.",
  items: [
    {
      id: "V1", title: "Blockout",
      image: "../Make 3D/renders/honda-crv-test/v01.png",
      description: "Lower body, a cabin box and four plain wheels. Gets the length, wheelbase and wheel size right.",
      changes: ["Lower body from 8 in to 27 in above the ground", "Cabin box 96 in long, 40 in tall", "Four tyres, 29 in across, on a 106 in wheelbase"],
      gaps: ["Cabin is a plain box", "No glass", "Wheels look like plain discs"]
    },
    {
      id: "V2", title: "Greenhouse",
      image: "../Make 3D/renders/honda-crv-test/v02.png",
      description: "The cabin becomes a glass house with a separate roof panel, a sloped windscreen and rear glass, and a bonnet.",
      changes: ["Glass house replaces the cabin box", "Roof panel in body colour", "Sloped windscreen and rear glass", "Bonnet on the front"],
      gaps: ["Windscreen slope hard to read from this angle", "No rims or hub caps", "Glass is very dark"]
    },
    {
      id: "V3", title: "Wheels",
      image: "../Make 3D/renders/honda-crv-test/v03.png",
      description: "Rims and hub caps, dark fender lips over each tyre, and dark cladding along the bottom of the sides.",
      changes: ["18 in alloy rims and hub caps", "Dark fender lips above each wheel", "Dark sill cladding along both sides"],
      gaps: ["Fender lips may look too thin", "Front and back still bare"]
    },
    {
      id: "V4", title: "Front and back",
      image: "../Make 3D/renders/honda-crv-test/v04.png",
      description: "Grille, bumpers, headlights, tail lights, a blank plate and an exhaust tip.",
      changes: ["Dark grille and front bumper", "Headlights and red tail lights", "Rear bumper, plate and exhaust tip"],
      gaps: ["Lights are flat boxes", "Front and back look similar"]
    },
    {
      id: "V5", title: "Finish",
      image: "../Make 3D/renders/honda-crv-test/v05.png",
      description: "Roof rails, side mirrors, door seams and a shark-fin aerial.",
      changes: ["Roof rails on both sides", "Side mirrors at the base of the front doors", "Door seams and a shark-fin aerial"],
      gaps: ["Cabin shape still boxy", "Mirrors and aerial are small; check them at full size", "Not checked against a photo"]
    }
  ]
};
