/* Art for the sheet: pictures generated with ChatGPT (see the ⚙️ panel). The sheet picture
   with its pieces erased is the background; each piece is a cutout from the same picture,
   shown on its box and used when peeled. Ids match js/sheet.js. */
window.FS_NATIVE_BASE = 'art/sheet_base.png';
window.FS_NATIVE_ART = {
  body: 'art/part04.png',
  eyes: 'art/part01.png',
  smile: 'art/part02.png',
  nose: 'art/part03.png',
  mushroom: 'art/part05.png',
  leaves: 'art/part06.png',
  acorn: 'art/part07.png',
  bow: 'art/part08.png',
  flower: 'art/part09.png'
};

// Placed stickers use the same pictures without the cream edge (the sheet keeps it).
window.FS_NATIVE_PLACED = {};
Object.keys(window.FS_NATIVE_ART).forEach(function (id) {
  window.FS_NATIVE_PLACED[id] = window.FS_NATIVE_ART[id].replace('art/', 'art/placed/');
});
