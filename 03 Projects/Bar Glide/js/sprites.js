/* Bar Glide — pixel sprites, the tiny 3x5 font and the two room themes.
 * Every sprite is a list of text rows; one letter is one pixel (see PAL). '.' is see-through.
 * Classic script, no build. Exposes window.BG.sprites, BG.drawText, BG.THEMES. */
window.BG = window.BG || {};
(function (BG) {
  'use strict';

  // Shared colours for the people and the glass. Each customer kind swaps h (hat), c (coat) and s (skin).
  const PAL = {
    k: '#1a1020', s: '#f2b98a', S: '#c98a5e', b: '#5a3420', w: '#f5efe0', r: '#c8463a',
    a: '#e8dcc0', B: '#34508f', f: '#fff8e6', y: '#f2b134', G: '#bfe3ea', R: '#e0786a',
    D: '#4a2e5c', h: '#8a5a2b', c: '#c8463a', W: '#ffffff'
  };

  // The bartender, facing left (toward the bar). 12 x 20.
  const BARTENDER = [
    '...kkkkkk...',
    '..kbbbbbbk..',
    '.kbbbbbbbbk.',
    '.kssssbbbbk.',
    'kssksssbbk..',
    'ksssssssk...',
    '.kkkkssssk..',
    '..ksssssk...',
    '..kwrrrwk...',
    '.kwwwrwwwk..',
    'kwwwwwwwwwk.',
    'ksskwwwwkssk',
    '.kkaaaaaakk.',
    '..kaaaaaak..',
    '..kaaaaaak..',
    '..kaaaaaak..',
    '..kkkkkkkk..',
    '...kBk.kBk..',
    '...kBk.kBk..',
    '..kkkk.kkkk.'
  ];

  // A customer, facing right (toward the bartender). 12 x 16; the bar hides the last rows.
  const CUSTOMER = [
    '...kkkkkk...',
    '..khhhhhhk..',
    '..khhhhhhk..',
    'kkkkkkkkkkkk',
    '..kssssssk..',
    '..ksssskssk.',
    '..ksssssssk.',
    '..ksssskkk..',
    '...kssssk...',
    '..kcccccck..',
    '.kccccccccck',
    '.kcccccckssk',
    '.kcccccck...',
    '.kcccccck...',
    '.kcccccck...',
    '.kkkkkkkk...'
  ];

  // The bar owner, facing left. 16 x 22. R is his red face.
  const BOSS = [
    '....kkkkkkk.....',
    '...kRRRRRRRk....',
    '..kRRRRRRRRRk...',
    '..kRkkRRRRRRk...',
    '..kRwkRRRRRRk...',
    '.kRRRRRRRRRRk...',
    '.kRkkkkkRRRRk...',
    '..kRRkkRRRRk....',
    '...kkRRRRkk.....',
    '..kDDDwwDDDk....',
    '.kDDDDwrDDDDk...',
    'kDDDDDwrDDDDDk..',
    'kDDDDDwrDDDDDk..',
    'kDDDDDDDDDDDDk..',
    'kRkDDDDDDDDkRk..',
    'kRkDDDDDDDDkRk..',
    '.k.kDDDDDDk.k...',
    '...kDDDDDDk.....',
    '...kDDkkDDk.....',
    '...kDDk.kDDk....',
    '...kDDk.kDDk....',
    '..kkkkk.kkkkk...'
  ];

  // The owner's swatting hand. 6 x 5.
  const HAND = [
    '.kkkk.',
    'kRRRRk',
    'kRRRRk',
    'kRRRRk',
    '.kkkk.'
  ];

  const KINDS = [
    { h: '#8a5a2b', c: '#c8463a', s: '#f2b98a' },   // cowboy
    { h: '#e8c25a', c: '#34508f', s: '#d9a066' },   // straw hat
    { h: '#e88aa0', c: '#3f8f5a', s: '#f5c9a0' },   // pink hat
    { h: '#8c8c9c', c: '#7a4a9c', s: '#a86b45' },   // grey hat
    { h: '#2d2d3a', c: '#d98a2b', s: '#f2b98a' }    // black hat
  ];

  function make(rows, swap) {
    const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '.') continue;
        const col = (swap && swap[ch]) || PAL[ch];
        if (!col) continue;
        x.fillStyle = col;
        x.fillRect(i, j, 1, 1);
      }
    });
    return c;
  }
  function flip(src) {
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const x = c.getContext('2d');
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0);
    return c;
  }
  // Turn a sprite a quarter turn counter-clockwise: the head ends up on the left, the face down.
  function turnLeft(src) {
    const c = document.createElement('canvas');
    c.width = src.height; c.height = src.width;
    const x = c.getContext('2d');
    x.translate(0, src.width); x.rotate(-Math.PI / 2); x.drawImage(src, 0, 0);
    return c;
  }

  let cache = null;
  BG.sprites = function () {
    if (cache) return cache;
    const btLeft = make(BARTENDER);
    cache = {
      btLeft,
      btRight: flip(btLeft),
      btBent: turnLeft(btLeft),
      customers: KINDS.map(k => make(CUSTOMER, k)),
      boss: make(BOSS),
      hand: make(HAND),
      PAL
    };
    return cache;
  };

  // ---- 3 x 5 pixel font ----
  const GLYPHS = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
    8: '111101111101111', 9: '111101111001110',
    '!': '010010010000010', '-': '000000111000000', '.': '000000000000010', '?': '110001010000010',
    "'": '010010000000000', ':': '000010000010000', ',': '000000000010100', '/': '001001010100100',
    ' ': '000000000000000'
  };
  BG.textWidth = (str, scale) => str.length * 4 * (scale || 1) - (scale || 1);
  // align: 'left' | 'center' | 'right'. Optional shadow colour drawn 1 px down-right.
  BG.drawText = function (ctx, str, x, y, color, scale, align, shadow) {
    scale = scale || 1;
    str = String(str).toUpperCase();
    const w = BG.textWidth(str, scale);
    if (align === 'center') x -= Math.floor(w / 2);
    else if (align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    const pass = (col, ox, oy) => {
      ctx.fillStyle = col;
      for (let n = 0; n < str.length; n++) {
        const g = GLYPHS[str[n]] || GLYPHS['?'];
        for (let p = 0; p < 15; p++) {
          if (g[p] === '1') ctx.fillRect(x + ox + n * 4 * scale + (p % 3) * scale, y + oy + Math.floor(p / 3) * scale, scale, scale);
        }
      }
    };
    if (shadow) pass(shadow, scale, scale);
    pass(color, 0, 0);
  };

  // ---- Room themes. 'saloon' is the late-night arcade mood; 'pastel' is the daytime family look. ----
  BG.THEMES = {
    saloon: {
      wall: '#3b2316', plank: '#452a1a', plankLine: '#2a170d', shelf: '#6b3f22', shelfHi: '#8a5530',
      floorA: '#24160f', floorB: '#2e1c14', barTop: '#c9884a', barTopHi: '#e9b070', barFront: '#7a4423',
      barPanel: '#5a2f17', rail: '#e6b84a', door: '#a8693a', doorDark: '#6b3f22', doorway: '#120a14',
      night: '#1c2448', star: '#fff2b0', lamp: '#ffd27a', glow: 'rgba(255, 186, 90, 0.16)', neon: '#ff5fa2',
      neonDim: '#5a2440', neonGlow: 'rgba(255, 95, 162, 0.25)', hud: '#ffe9a8', hudShadow: '#1a1020',
      brass: '#d9a441', brassDark: '#8a6020', bubble: '#fff8e6', ink: '#1a1020', dim: 'rgba(10, 4, 12, 0.45)'
    },
    pastel: {
      wall: '#fde6c8', plank: '#f8dcbc', plankLine: '#e8c3a2', shelf: '#c99a7a', shelfHi: '#ddb393',
      floorA: '#f3d7c4', floorB: '#ecc9b4', barTop: '#f0c08a', barTopHi: '#ffdcae', barFront: '#d99a6a',
      barPanel: '#c4865a', rail: '#86c9a8', door: '#9ad0c2', doorDark: '#6fb3a3', doorway: '#cfe8f5',
      night: '#bfe3f5', star: '#ffffff', lamp: '#fff3b0', glow: 'rgba(255, 255, 220, 0.25)', neon: '#e8708a',
      neonDim: '#f2c4cc', neonGlow: 'rgba(232, 112, 138, 0.18)', hud: '#4a2e3e', hudShadow: '#fff8ec',
      brass: '#e0b25a', brassDark: '#b08030', bubble: '#ffffff', ink: '#3a2a3a', dim: 'rgba(255, 248, 236, 0.5)'
    }
  };
})(window.BG);
