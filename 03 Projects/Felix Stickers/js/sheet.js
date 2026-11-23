/* Sticker sheet data. Walking Through the Woods: one plain body (the main sticker, on the sheet)
   and eight features from the woods: eyes, a nose, a smile, a mushroom cap, leaves, a bow, a flower and an
   acorn backpack. Each feature is redrawn as a lookalike SVG (not traced) from the reference sheet, which
   is not ours to publish (convo v0.1 Q10). Name follows the title rule:
   "Felix Stickers – <sheet name, 3 or more words>". Slot x/y are % of the sheet; size is in
   cqmin (% of its shorter side). Classic script (works from file://). */
window.FS_SHEET = {
  id: 'sheet-woods-01',
  name: 'Walking Through the Woods',
  main: {
    id: 'body', label: 'Plain body',
    slot: { x: 50, y: 50, size: 46 },
    svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 12 C74 12 84 34 84 56 C84 80 92 90 80 94 C66 98 34 98 20 94 C8 90 16 80 16 56 C16 34 26 12 50 12 Z\" fill=\"#bcd3a0\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/></svg>"
  },
  stickers: [
    { id: 'eyes', label: "Pair of eyes", slot: { x: 14, y: 16, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><ellipse cx=\"30\" cy=\"52\" rx=\"24\" ry=\"30\" fill=\"#fff\" stroke=\"#5b3b26\" stroke-width=\"3\"/><ellipse cx=\"70\" cy=\"52\" rx=\"24\" ry=\"30\" fill=\"#fff\" stroke=\"#5b3b26\" stroke-width=\"3\"/><circle cx=\"34\" cy=\"56\" r=\"13\" fill=\"#2f4a3f\"/><circle cx=\"74\" cy=\"56\" r=\"13\" fill=\"#2f4a3f\"/><circle cx=\"29\" cy=\"50\" r=\"4\" fill=\"#fff\"/><circle cx=\"69\" cy=\"50\" r=\"4\" fill=\"#fff\"/></svg>" },
    { id: 'nose', label: "Round nose", slot: { x: 50, y: 12, size: 13 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 22 Q78 30 80 54 Q80 76 50 80 Q20 76 20 54 Q22 30 50 22 Z\" fill=\"#f08a6c\" stroke=\"#5b3b26\" stroke-width=\"3\"/><ellipse cx=\"40\" cy=\"42\" rx=\"6\" ry=\"4\" fill=\"#ffd0c0\" transform=\"rotate(-20 40 42)\"/></svg>" },
    { id: 'smile', label: "Big smile", slot: { x: 86, y: 16, size: 26 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M12 30 Q50 92 88 30 Q86 62 50 66 Q14 62 12 30 Z\" fill=\"#6b3a2a\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M30 60 Q50 88 70 60 Q50 72 30 60 Z\" fill=\"#f4a09a\"/><path d=\"M8 26 Q12 22 16 26 M84 26 Q88 22 92 26\" stroke=\"#5b3b26\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/></svg>" },
    { id: 'mushroom', label: "Spotted mushroom cap", slot: { x: 12, y: 50, size: 26 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M8 58 Q8 16 50 16 Q92 16 92 58 Q92 66 84 64 Q50 60 16 64 Q8 66 8 58 Z\" fill=\"#f08a6c\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M16 64 Q50 60 84 64 Q82 80 50 80 Q18 80 16 64 Z\" fill=\"#fff3e0\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><ellipse cx=\"30\" cy=\"36\" rx=\"8\" ry=\"6\" fill=\"#fff3e0\"/><ellipse cx=\"62\" cy=\"30\" rx=\"10\" ry=\"7\" fill=\"#fff3e0\"/><ellipse cx=\"78\" cy=\"48\" rx=\"5\" ry=\"4\" fill=\"#fff3e0\"/></svg>" },
    { id: 'leaves', label: "Pair of leaves", slot: { x: 88, y: 50, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M48 82 Q10 70 8 34 Q30 14 48 30 Z\" fill=\"#a9c9a0\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M52 82 Q90 70 92 34 Q70 14 52 30 Z\" fill=\"#a9c9a0\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M46 76 Q30 50 16 36 M54 76 Q70 50 84 36\" stroke=\"#4f7a5a\" stroke-width=\"2.5\" fill=\"none\"/></svg>" },
    { id: 'bow', label: "Golden bow", slot: { x: 16, y: 84, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 50 Q30 18 10 30 Q6 50 12 52 Q6 74 10 76 Q30 88 50 50 Z\" fill=\"#f5b84a\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M50 50 Q70 18 90 30 Q94 50 88 52 Q94 74 90 76 Q70 88 50 50 Z\" fill=\"#f5b84a\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><rect x=\"42\" y=\"42\" width=\"16\" height=\"16\" rx=\"5\" fill=\"#e09a30\" stroke=\"#5b3b26\" stroke-width=\"3\"/></svg>" },
    { id: 'flower', label: "Yellow flower", slot: { x: 50, y: 88, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M24 84 Q40 72 50 84 Q60 72 76 84 Q60 98 50 90 Q40 98 24 84 Z\" fill=\"#8fbf8a\" stroke=\"#5b3b26\" stroke-width=\"2.5\"/><g fill=\"#f7d654\" stroke=\"#5b3b26\" stroke-width=\"3\"><circle cx=\"50\" cy=\"26\" r=\"15\"/><circle cx=\"72\" cy=\"42\" r=\"15\"/><circle cx=\"64\" cy=\"68\" r=\"15\"/><circle cx=\"36\" cy=\"68\" r=\"15\"/><circle cx=\"28\" cy=\"42\" r=\"15\"/></g><circle cx=\"50\" cy=\"50\" r=\"11\" fill=\"#e8a33a\" stroke=\"#5b3b26\" stroke-width=\"3\"/></svg>" },
    { id: 'acorn', label: "Acorn backpack", slot: { x: 84, y: 84, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M78 26 Q96 50 80 84\" fill=\"none\" stroke=\"#8a5a34\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M50 36 Q80 36 80 62 Q80 90 50 92 Q20 90 20 62 Q20 36 50 36 Z\" fill=\"#c9965e\" stroke=\"#5b3b26\" stroke-width=\"3\"/><path d=\"M20 40 Q50 22 80 40 Q76 52 50 50 Q24 52 20 40 Z\" fill=\"#8a5a34\" stroke=\"#5b3b26\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M34 40 L40 50 M50 38 L50 50 M66 40 L60 50\" stroke=\"#5b3b26\" stroke-width=\"2\"/><rect x=\"40\" y=\"62\" width=\"12\" height=\"12\" rx=\"2\" fill=\"#f5c542\" stroke=\"#5b3b26\" stroke-width=\"2.5\"/></svg>" }
  ]
};
