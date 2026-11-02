// Review data for the Living Room Scene increments.
// Images are read relative to viewer.html, so they go up one folder into the project.
window.REVIEW_DATA = {
  title: "Living Room Scene: V1 to V10",
  subtitle: "Ten increments of one scene, rebuilt from a photo. Each step: render, compare with the photo, change about five things.",
  items: [
    {
      id: "V1", title: "First trace",
      image: "../Living Room Scene/renders/living_room_v1.png",
      description: "First trace from the photo's pixel grid: TV, yellow shelves, books, plants, windows, futon, table, chairs, rug, shoes, bin.",
      changes: ["Full layout placed on the photo's grid"],
      gaps: ["Table top too thin", "Chairs have no white frames", "Futon boxy", "Floor flat", "Monstera has no stems"]
    },
    {
      id: "V2", title: "Table, chairs, stems",
      image: "../Living Room Scene/renders/living_room_v2.png",
      description: "Thicker table top, white chair rails, futon back lowered with seams, monstera stems, floor plank seams.",
      changes: ["Table top thicker", "White rails under chair seats", "Futon back lowered", "Monstera stems added", "Floor seams added"],
      gaps: ["Floor seams read as bricks"]
    },
    {
      id: "V3", title: "Laminate planks",
      image: "../Living Room Scene/renders/living_room_v3.png",
      description: "Floor changed to long laminate planks; blinds darkened; ceiling line added at the top of the back wall.",
      changes: ["Long planks replace the brick seams", "Blinds darker", "Ceiling line added"],
      gaps: ["Monstera leaves too small"]
    },
    {
      id: "V4", title: "Fuller monstera",
      image: "../Living Room Scene/renders/living_room_v4.png",
      description: "Larger, fuller monstera leaves; futon darkened.",
      changes: ["Monstera leaves enlarged", "Futon darker"],
      gaps: ["Chair slats missing", "Little on the shelf tops"]
    },
    {
      id: "V5", title: "Chair slats, small items",
      image: "../Living Room Scene/renders/living_room_v5.png",
      description: "White slats across the chair backs; small items added to the shelf tops (bottle, box, speaker, card).",
      changes: ["Chair backs get white slats", "Bottle, box, speaker and card added"],
      gaps: ["Table top still flat"]
    },
    {
      id: "V6", title: "Floor shadows, sills",
      image: "../Living Room Scene/renders/living_room_v6.png",
      description: "Soft floor shadows under the furniture so it sits on the floor; white window sills.",
      changes: ["Soft shadows under furniture", "White window sills added"],
      gaps: ["Corner plant sparse"]
    },
    {
      id: "V7", title: "Fuller plant, table perspective",
      image: "../Living Room Scene/renders/living_room_v7.png",
      description: "Fuller corner plant; table top drawn in perspective.",
      changes: ["Corner plant gets more leaves", "Table top in perspective"],
      gaps: ["Table legs thin"]
    },
    {
      id: "V8", title: "Table legs, cable, cup",
      image: "../Living Room Scene/renders/living_room_v8.png",
      description: "Rounded, thicker table legs; TV cable; small cup on the table.",
      changes: ["Table legs rounded and thicker", "TV cable added", "Cup on the table"],
      gaps: ["Speaker and cable placement approximate"]
    },
    {
      id: "V9", title: "Window light, floor shade",
      image: "../Living Room Scene/renders/living_room_v9.png",
      description: "Soft window light on the wall; gentle shade toward the front of the floor.",
      changes: ["Soft window glow on the wall", "Floor darker toward the front"],
      gaps: ["Chair proportions simplified"]
    },
    {
      id: "V10", title: "Rug border, shoes",
      image: "../Living Room Scene/renders/living_room_v10.png",
      description: "Rug border added; shoes in darker tones. Final pass of this run.",
      changes: ["Rug border", "Shoes darker"],
      gaps: ["Chairs, futon shape and small item positions simplified"]
    }
  ]
};
