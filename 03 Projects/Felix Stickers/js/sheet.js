/* Sticker sheet data. One sheet = one plain body (the main sticker, on the sheet) and ten
   features from the parts identified on the "Create Your Monster" reference: eyes, mouths,
   wings, horns, a balloon and a flower. Each feature is redrawn as a lookalike SVG (not traced),
   since the reference is not ours to publish (convo v0.1 Q10). Name follows the title rule:
   "Felix Stickers – <sheet name, 3 or more words>". Slot x/y are % of the sheet; size is in
   cqmin (% of its shorter side). Classic script (works from file://). */
window.FS_SHEET = {
  id: 'sheet-01',
  name: 'Little Monster Tea Party',
  main: {
    id: 'main', label: 'Plain body',
    slot: { x: 50, y: 50, size: 46 },
    svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M22 42 Q22 16 50 16 Q78 16 78 42 L78 74 Q78 84 68 84 L32 84 Q22 84 22 74 Z\" fill=\"#9fd8e8\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><ellipse cx=\"36\" cy=\"86\" rx=\"9\" ry=\"5\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><ellipse cx=\"64\" cy=\"86\" rx=\"9\" ry=\"5\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/></svg>"
  },
  stickers: [
    { id: 'f01', label: "Big eye", slot: { x: 12, y: 16, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"50\" cy=\"52\" r=\"20\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"52\" r=\"10\" fill=\"#2f3b4a\"/><circle cx=\"56\" cy=\"46\" r=\"3.5\" fill=\"#fff\"/></svg>" },
    { id: 'f02', label: "Teal eye pair", slot: { x: 88, y: 16, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><circle cx=\"34\" cy=\"50\" r=\"22\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"66\" cy=\"50\" r=\"22\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"36\" cy=\"54\" r=\"12\" fill=\"#2ec4a0\" stroke=\"#2f3b4a\" stroke-width=\"2\"/><circle cx=\"64\" cy=\"54\" r=\"12\" fill=\"#2ec4a0\" stroke=\"#2f3b4a\" stroke-width=\"2\"/><circle cx=\"36\" cy=\"54\" r=\"5\" fill=\"#2f3b4a\"/><circle cx=\"64\" cy=\"54\" r=\"5\" fill=\"#2f3b4a\"/></svg>" },
    { id: 'f03', label: "Fang mouth", slot: { x: 12, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M14 34 Q50 26 86 34 Q82 80 50 86 Q18 80 14 34 Z\" fill=\"#c2415d\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M20 36 L28 52 L36 36 Z M64 36 L72 52 L80 36 Z\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"2\" stroke-linejoin=\"round\"/></svg>" },
    { id: 's02', label: "Fang grin", slot: { x: 88, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M18 40 Q50 88 82 40 Z\" fill=\"#ff8fa3\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M26 44 h12 v10 h-12 Z M40 44 h12 v12 h-12 Z M54 44 h12 v12 h-12 Z M68 44 h8 v8 h-8 Z\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"2\"/></svg>" },
    { id: 'f04', label: "Tongue mouth", slot: { x: 12, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M18 36 Q50 30 82 36 Q80 70 50 80 Q20 70 18 36 Z\" fill=\"#ff7a8a\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M40 74 Q50 96 60 74 Z\" fill=\"#ff8fa3\" stroke=\"#2f3b4a\" stroke-width=\"2.5\"/><rect x=\"42\" y=\"36\" width=\"8\" height=\"8\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"2\"/></svg>" },
    { id: 's04', label: "Striped horns", slot: { x: 88, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M18 78 Q8 40 30 14 Q44 40 38 78 Z\" fill=\"#ffb02e\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M62 78 Q56 40 70 14 Q92 40 82 78 Z\" fill=\"#ffb02e\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M14 52 L40 46 M12 36 L36 30 M66 46 L88 52 M70 30 L90 36\" stroke=\"#e8553d\" stroke-width=\"5\"/></svg>" },
    { id: 's05', label: "Purple wing", slot: { x: 32, y: 12, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M8 62 Q22 20 52 28 Q48 36 58 40 Q62 48 52 50 Q60 62 40 66 Q42 78 22 74 Q14 80 8 62 Z\" fill=\"#8a4fd6\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M20 58 Q32 46 46 48\" stroke=\"#c9a6f5\" stroke-width=\"3\" fill=\"none\"/></svg>" },
    { id: 'f05', label: "Teal wing", slot: { x: 68, y: 12, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M92 62 Q78 20 48 28 Q52 36 42 40 Q38 48 48 50 Q40 62 60 66 Q58 78 78 74 Q86 80 92 62 Z\" fill=\"#2ec4a0\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M80 58 Q68 46 54 48\" stroke=\"#b8f5e6\" stroke-width=\"3\" fill=\"none\"/></svg>" },
    { id: 's14', label: "Sunny flower", slot: { x: 32, y: 88, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><g fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"><circle cx=\"50\" cy=\"26\" r=\"15\"/><circle cx=\"74\" cy=\"42\" r=\"15\"/><circle cx=\"66\" cy=\"70\" r=\"15\"/><circle cx=\"34\" cy=\"70\" r=\"15\"/><circle cx=\"26\" cy=\"42\" r=\"15\"/></g><circle cx=\"50\" cy=\"50\" r=\"13\" fill=\"#ff8a3d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/></svg>" },
    { id: 's15', label: "Party balloon", slot: { x: 68, y: 88, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 74 Q46 86 54 96\" stroke=\"#2f3b4a\" stroke-width=\"2.5\" fill=\"none\"/><path d=\"M50 8 C68 8 78 24 76 40 C74 56 58 66 50 68 C42 66 26 56 24 40 C22 24 32 8 50 8 Z\" fill=\"#8fd1c4\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><path d=\"M36 26 Q40 18 48 18\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/></svg>" }
  ]
};
