// Buildings: farm houses and barns, town houses, city towers, barracks and a hangar.
namespace PA {
  // A farm house with a red roof, a door and a window.
  PAINT['farm'] = g => {
    g.r(2, 7, 12, 6, '#f5d7b0')
     .r(3, 5, 10, 2, '#c85b4a')
     .r(4, 3, 8, 2, '#c85b4a')
     .r(5, 1, 6, 2, '#c85b4a')
     .r(7, 10, 2, 3, '#6b4a3a')
     .p(4, 8, '#8fd3f0');
  };

  // A barn: tall red walls with a grey roof.
  PAINT['barn'] = g => {
    g.r(0, 6, 18, 7, '#c85b4a')
     .r(1, 3, 16, 3, '#6b7480')
     .r(2, 1, 14, 2, '#6b7480')
     .r(7, 8, 4, 5, '#f5d7b0');
  };

  // A city tower block with a grid of lit windows.
  PAINT['city'] = g => {
    g.r(2, 2, 10, 20, '#c9d2dc')
     .r(2, 2, 2, 20, '#b0bcc8');
    for (let y = 4; y < 20; y += 3) {
      for (let x = 5; x < 11; x += 3) g.p(x, y, '#8fd3f0');
    }
  };

  // Army barracks: a long low building with a door row.
  PAINT['barracks'] = g => {
    g.r(0, 4, 22, 6, '#8a9470')
     .r(0, 3, 22, 1, '#6b7480')
     .r(2, 6, 3, 2, '#4d5560').r(9, 6, 3, 2, '#4d5560').r(16, 6, 3, 2, '#4d5560')
     .p(5, 5, '#f5fbff').p(12, 5, '#f5fbff');
  };

  // Aircraft hangar: a curved roof over a large door.
  PAINT['hangar'] = g => {
    g.r(0, 6, 24, 6, '#b9c0c8')
     .r(2, 4, 20, 2, '#b9c0c8')
     .r(5, 2, 14, 2, '#b9c0c8')
     .r(7, 7, 10, 5, '#6b7480');
  };
}
