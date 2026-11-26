/* Sheet: Thanksgiving Table Test 1. AI-generated picture (ChatGPT), confirmed free to publish (convo v0.1 Q10).
   Boxes are pixels of the picture (1536 x 1024). Pieces come from 02 Refs/Skills/scripts/sticker_cut.py (sheet mode). */
window.FS_EXTRA_SHEETS = (window.FS_EXTRA_SHEETS || []).concat([{
  ref: { w: 1536, h: 1024 },
  id: 'thanksgiving-table-test-1',
  key: 'thanksgiving',
  name: 'Thanksgiving Table Test 1',
  mainFirst: true,   // the tablecloth is drawn under the features, so a fork or cornucopia on its edge is still tappable
  native: {
    base: 'art/sheets/thanksgiving/base.png',
    art: {
      tablecloth: 'art/sheets/thanksgiving/pieces/p08.png',
      plate_blue: 'art/sheets/thanksgiving/pieces/p01.png',
      plate_wreath: 'art/sheets/thanksgiving/pieces/p02.png',
      turkey: 'art/sheets/thanksgiving/pieces/p03.png',
      pie: 'art/sheets/thanksgiving/pieces/p04.png',
      juice: 'art/sheets/thanksgiving/pieces/p05.png',
      bouquet: 'art/sheets/thanksgiving/pieces/p06.png',
      cornucopia: 'art/sheets/thanksgiving/pieces/p07.png',
      knife: 'art/sheets/thanksgiving/pieces/p09.png',
      hat: 'art/sheets/thanksgiving/pieces/p10.png',
      fork: 'art/sheets/thanksgiving/pieces/p11.png',
      napkin: 'art/sheets/thanksgiving/pieces/p12.png',
      leaf: 'art/sheets/thanksgiving/pieces/p13.png'
    },
    // Placed stickers use the same cutouts (the piece has no cream halo, so the sheet and the play look match).
    placed: {
      tablecloth: 'art/sheets/thanksgiving/pieces/p08.png',
      plate_blue: 'art/sheets/thanksgiving/pieces/p01.png',
      plate_wreath: 'art/sheets/thanksgiving/pieces/p02.png',
      turkey: 'art/sheets/thanksgiving/pieces/p03.png',
      pie: 'art/sheets/thanksgiving/pieces/p04.png',
      juice: 'art/sheets/thanksgiving/pieces/p05.png',
      bouquet: 'art/sheets/thanksgiving/pieces/p06.png',
      cornucopia: 'art/sheets/thanksgiving/pieces/p07.png',
      knife: 'art/sheets/thanksgiving/pieces/p09.png',
      hat: 'art/sheets/thanksgiving/pieces/p10.png',
      fork: 'art/sheets/thanksgiving/pieces/p11.png',
      napkin: 'art/sheets/thanksgiving/pieces/p12.png',
      leaf: 'art/sheets/thanksgiving/pieces/p13.png'
    }
  },
  main: {
    id: 'tablecloth', label: 'Gingham tablecloth',
    box: { x: 340, y: 308, w: 853, h: 534 }, svg: ''
  },
  stickers: [
    { id: 'plate_blue', label: 'Blue-ring plate', box: { x: 23, y: 45, w: 290, h: 225 }, svg: '' },
    { id: 'plate_wreath', label: 'Wreath plate', box: { x: 326, y: 46, w: 258, h: 207 }, svg: '' },
    { id: 'turkey', label: 'Roast turkey', box: { x: 608, y: 33, w: 379, h: 244 }, svg: '' },
    { id: 'pie', label: 'Pumpkin pie', box: { x: 1034, y: 45, w: 298, h: 220 }, svg: '' },
    { id: 'juice', label: 'Glass of juice', box: { x: 1373, y: 55, w: 133, h: 182 }, svg: '' },
    { id: 'bouquet', label: 'Autumn bouquet', box: { x: 22, y: 288, w: 335, h: 366 }, svg: '' },
    { id: 'cornucopia', label: 'Cornucopia', box: { x: 1154, y: 264, w: 359, h: 337 }, svg: '' },
    { id: 'knife', label: 'Knife', box: { x: 1289, y: 641, w: 72, h: 310 }, svg: '' },
    { id: 'hat', label: 'Pilgrim hat', box: { x: 20, y: 690, w: 345, h: 260 }, svg: '' },
    { id: 'fork', label: 'Fork', box: { x: 1193, y: 690, w: 99, h: 261 }, svg: '' },
    { id: 'napkin', label: 'Napkin', box: { x: 1373, y: 684, w: 153, h: 262 }, svg: '' },
    { id: 'leaf', label: 'Maple leaf', box: { x: 376, y: 860, w: 145, h: 130 }, svg: '' }
  ]
}]);
