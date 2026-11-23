/* Sticker sheet data. One sheet = one main sticker + small stickers, all on the same sheet.
   Name follows the title rule: "Felix Stickers – <sheet name, 3 or more words>".
   Art is hand-drawn SVG (lookalike, not from any artist's sheet). Slots are % of the sheet card.
   Classic script so the page works from file:// and offline. */
window.FS_SHEET = {
  id: 'sheet-01',
  name: 'Little Monster Tea Party',
  main: {
    id: 'main', label: 'Big teapot',
    slot: { x: 50, y: 50, size: 46 },
    svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M27 52 Q11 46 11 30 Q11 22 18 27 Q25 38 33 44 Z\" fill=\"#cfeee0\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M73 46 Q96 42 94 66 Q92 80 72 76\" fill=\"none\" stroke=\"#2f3b4a\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M73 46 Q96 42 94 66 Q92 80 72 76\" fill=\"none\" stroke=\"#cfeee0\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M26 44 Q26 36 50 36 Q74 36 74 44 L74 68 Q74 86 50 86 Q26 86 26 68 Z\" fill=\"#cfeee0\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><ellipse cx=\"50\" cy=\"36\" rx=\"22\" ry=\"6\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"50\" cy=\"26\" r=\"5\" fill=\"#ff8a3d\" stroke=\"#2f3b4a\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"64\" r=\"8\" fill=\"#ff8fa3\" stroke=\"#2f3b4a\" stroke-width=\"2.5\"/><circle cx=\"36\" cy=\"72\" r=\"2.5\" fill=\"#fff\"/><circle cx=\"64\" cy=\"72\" r=\"2.5\" fill=\"#fff\"/><path d=\"M36 52 q4 -3 8 0 M56 52 q4 -3 8 0\" stroke=\"#2f3b4a\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\"/></svg>"
  },
  stickers: [
    { id: 's10', label: "Sprinkle cupcake", slot: { x: 16, y: 16, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M26 56 L74 56 L66 88 L34 88 Z\" fill=\"#f2b880\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M20 56 Q22 28 50 26 Q78 28 80 56 Z\" fill=\"#ff8fc7\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M34 40 l4 -2 M50 34 l4 -2 M64 42 l4 -2 M42 50 l4 -2 M60 50 l4 -2\" stroke=\"#3d8bff\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>" },
    { id: 's14', label: "Sunny flower", slot: { x: 50, y: 13, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><g fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\"><circle cx=\"50\" cy=\"26\" r=\"15\"/><circle cx=\"74\" cy=\"42\" r=\"15\"/><circle cx=\"66\" cy=\"70\" r=\"15\"/><circle cx=\"34\" cy=\"70\" r=\"15\"/><circle cx=\"26\" cy=\"42\" r=\"15\"/></g><circle cx=\"50\" cy=\"50\" r=\"13\" fill=\"#ff8a3d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/></svg>" },
    { id: 's13', label: "Pink heart", slot: { x: 84, y: 16, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 84 C14 60 10 40 22 28 C34 18 46 26 50 36 C54 26 66 18 78 28 C90 40 86 60 50 84 Z\" fill=\"#ff7aa8\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M28 36 Q32 28 40 28\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/></svg>" },
    { id: 's12', label: "Gold star", slot: { x: 14, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 10 L61 38 L91 40 L68 58 L76 88 L50 72 L24 88 L32 58 L9 40 L39 38 Z\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/></svg>" },
    { id: 's20', label: "Fluffy cloud", slot: { x: 86, y: 50, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M24 74 Q6 74 10 58 Q14 44 30 48 Q32 30 50 30 Q64 22 74 36 Q92 36 90 56 Q96 74 76 74 Z\" fill=\"#fff\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"38\" cy=\"56\" r=\"3\" fill=\"#2f3b4a\"/><circle cx=\"62\" cy=\"56\" r=\"3\" fill=\"#2f3b4a\"/><path d=\"M42 64 Q50 70 58 64\" stroke=\"#2f3b4a\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/></svg>" },
    { id: 's09', label: "Dotty bow tie", slot: { x: 18, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M48 50 L10 28 L10 72 Z M52 50 L90 28 L90 72 Z\" fill=\"#ffd84d\" stroke=\"#2f3b4a\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"50\" cy=\"50\" r=\"9\" fill=\"#ff8a3d\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><circle cx=\"24\" cy=\"42\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"24\" cy=\"60\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"76\" cy=\"42\" r=\"3\" fill=\"#ff8a3d\"/><circle cx=\"76\" cy=\"60\" r=\"3\" fill=\"#ff8a3d\"/></svg>" },
    { id: 's15', label: "Party balloon", slot: { x: 50, y: 87, size: 24 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M50 74 Q46 86 54 96\" stroke=\"#2f3b4a\" stroke-width=\"2.5\" fill=\"none\"/><path d=\"M50 8 C68 8 78 24 76 40 C74 56 58 66 50 68 C42 66 26 56 24 40 C22 24 32 8 50 8 Z\" fill=\"#8fd1c4\" stroke=\"#2f3b4a\" stroke-width=\"3\"/><path d=\"M36 26 Q40 18 48 18\" stroke=\"#fff\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/></svg>" },
    { id: 's11', label: "Cool shades", slot: { x: 82, y: 84, size: 22 },
      svg: "<svg viewBox=\"0 0 100 100\"><path d=\"M10 40 Q10 34 18 34 L44 34 L46 46 Q34 58 22 52 Q10 50 10 40 Z\" fill=\"#2f3b4a\"/><path d=\"M90 40 Q90 34 82 34 L56 34 L54 46 Q66 58 78 52 Q90 50 90 40 Z\" fill=\"#2f3b4a\"/><path d=\"M46 38 Q50 34 54 38\" stroke=\"#2f3b4a\" stroke-width=\"4\" fill=\"none\"/><path d=\"M16 42 l8 -4\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>" }
  ]
};
