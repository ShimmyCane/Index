/* Sticker sheet data. One sheet = one plain main sticker (the body) and 5-10 smaller
   features (eyes, mouths, horns, wings, hats). Nothing is drawn on the body: features are
   peeled off the sheet and placed on it. Name follows the title rule:
   "Felix Stickers – <sheet name, 3 or more words>". Art is hand-drawn SVG (lookalike,
   not from any artist's sheet). Slots are % of the sheet card. Classic script (works from file://). */
window.FS_SHEET = {
  id: 'sheet-01',
  name: 'Little Monster Tea Party',
  main: {
    id: 'main', label: 'Plain body',
    slot: { x: 50, y: 50, size: 46 },
    svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M22 42 Q22 16 50 16 Q78 16 78 42 L78 74 Q78 84 68 84 L32 84 Q22 84 22 74 Z\" fill=\"#9fd8e8\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><ellipse cx=\"36\" cy=\"86\" rx=\"9\" ry=\"5\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><ellipse cx=\"64\" cy=\"86\" rx=\"9\" ry=\"5\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/></svg>"
  },
  stickers: [
    { id: 's01', label: "Pair of eyes", slot: { x: 16, y: 16, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><circle cx=\"34\" cy=\"50\" r=\"18\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"66\" cy=\"50\" r=\"18\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"38\" cy=\"54\" r=\"8\" fill=\"#2f3b4a\"/><circle cx=\"70\" cy=\"54\" r=\"8\" fill=\"#2f3b4a\"/><circle cx=\"41\" cy=\"51\" r=\"2.5\" fill=\"#fff\"/><circle cx=\"73\" cy=\"51\" r=\"2.5\" fill=\"#fff\"/></svg>" },
    { id: 's02', label: "Silly grin", slot: { x: 50, y: 13, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M18 40 Q50 88 82 40 Z\" fill=\"#ff8fa3\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M26 44 h12 v10 h-12 Z M40 44 h12 v12 h-12 Z M54 44 h12 v12 h-12 Z M68 44 h8 v8 h-8 Z\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"2\"/></svg>" },
    { id: 's03', label: "Open mouth", slot: { x: 84, y: 16, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M14 36 Q50 30 86 36 Q84 84 50 88 Q16 84 14 36 Z\" fill=\"#c2415d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><path d=\"M20 38 h10 l4 9 l5 -9 h8 l4 9 l5 -9 h8 l4 9 l5 -9 h8 l4 9 l5 -9 h8 v-3 Q50 34 20 38 Z\" fill=\"#fff\"/><ellipse cx=\"50\" cy=\"72\" rx=\"14\" ry=\"7\" fill=\"#ff8fa3\"/></svg>" },
    { id: 's04', label: "Striped horns", slot: { x: 14, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M18 78 Q8 40 30 14 Q44 40 38 78 Z\" fill=\"#ffb02e\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M62 78 Q56 40 70 14 Q92 40 82 78 Z\" fill=\"#ffb02e\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M14 52 L40 46 M12 36 L36 30 M66 46 L88 52 M70 30 L90 36\" stroke=\"#e8553d\" stroke-width=\"5\"/></svg>" },
    { id: 's05', label: "Purple wing", slot: { x: 86, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M8 62 Q22 20 52 28 Q48 36 58 40 Q62 48 52 50 Q60 62 40 66 Q42 78 22 74 Q14 80 8 62 Z\" fill=\"#8a4fd6\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M20 58 Q32 46 46 48\" stroke=\"#c9a6f5\" stroke-width=\"3\" fill=\"none\"/></svg>" },
    { id: 's06', label: "Gold wing", slot: { x: 18, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M92 62 Q78 20 48 28 Q52 36 42 40 Q38 48 48 50 Q40 62 60 66 Q58 78 78 74 Q86 80 92 62 Z\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M80 58 Q68 46 54 48\" stroke=\"#fff3b0\" stroke-width=\"3\" fill=\"none\"/></svg>" },
    { id: 's07', label: "Top hat", slot: { x: 50, y: 87, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><rect x=\"26\" y=\"66\" width=\"48\" height=\"10\" rx=\"4\" fill=\"#2f3b4a\"/><rect x=\"34\" y=\"20\" width=\"32\" height=\"48\" rx=\"4\" fill=\"#2f3b4a\"/><rect x=\"34\" y=\"54\" width=\"32\" height=\"8\" fill=\"#ff8a3d\"/></svg>" },
    { id: 's09', label: "Dotty bow tie", slot: { x: 82, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M48 50 L10 28 L10 72 Z M52 50 L90 28 L90 72 Z\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"50\" cy=\"50\" r=\"9\" fill=\"#ff8a3d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"24\" cy=\"42\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"24\" cy=\"60\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"76\" cy=\"42\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"76\" cy=\"60\" r=\"3\" fill=\"#ff8a3d\"/></svg>" }
  ]
};
