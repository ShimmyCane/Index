// Aircraft: the player's plane, the paper glider, the pilot under a parachute, and parked jets.
namespace PA {
  PAINT['plane'] = g => {
    // A-10 Warthog seen from behind: wide wing, twin tails, the cockpit up top, two engines.
    g.r(0, 7, 22, 2, '#c8cfd6')                              // wing
     .r(0, 8, 3, 1, '#6b7480').r(19, 8, 3, 1, '#6b7480')     // wing tips
     .r(9, 2, 4, 9, '#c8cfd6')                               // fuselage
     .r(9, 2, 1, 9, '#f5fbff')                               // light side
     .r(10, 1, 2, 2, '#8fd3f0')                              // canopy
     .r(5, 1, 2, 7, '#c8cfd6').r(15, 1, 2, 7, '#c8cfd6')     // twin tails
     .r(5, 0, 2, 1, '#6b7480').r(15, 0, 2, 1, '#6b7480')
     .r(7, 9, 2, 3, '#6b7480').r(13, 9, 2, 3, '#6b7480')     // engines
     .r(7, 12, 2, 1, '#ffb02e').r(13, 12, 2, 1, '#ffb02e');  // exhaust glow
  };

  PAINT['glider'] = g => {
    // Classic paper dart seen from behind: a flat sheet with a folded nose.
    g.r(0, 6, 20, 2, '#fffdfa')
     .r(0, 6, 20, 1, '#f5fbff')
     .r(9, 2, 2, 9, '#fffdfa')
     .p(10, 1, '#fffdfa')
     .r(0, 8, 20, 1, '#d6d0f0');
  };

  PAINT['pilot'] = g => {
    // A pilot under a parachute canopy.
    g.r(1, 0, 9, 3, '#ffb3a7')
     .r(1, 0, 9, 1, '#ff9e8a')
     .p(2, 3, '#6b7480').p(8, 3, '#6b7480')
     .r(4, 4, 3, 3, '#f5d7b0')
     .r(4, 7, 3, 2, '#3d8bff');
  };

  // A parked fighter on the airfield, seen from the side and slightly from above.
  PAINT['jet'] = g => {
    g.r(0, 4, 16, 2, '#e8eef2')
     .r(12, 2, 3, 2, '#e8eef2')
     .r(6, 5, 5, 2, '#b9c0c8')
     .r(3, 1, 2, 3, '#8fd3f0')
     .r(4, 6, 2, 1, '#6b7480')
     .r(14, 3, 2, 1, '#6b7480');
  };
}

namespace PA {
  // An enemy fighter, seen from the side: dark red, swept wings, a nose cone.
  PAINT['fighter'] = g => {
    g.r(0, 4, 16, 2, '#7a3b44')
     .r(9, 2, 4, 3, '#a85560')
     .r(4, 5, 6, 2, '#c97080')
     .r(12, 3, 4, 1, '#7a3b44')
     .p(15, 4, '#2f2d3d')
     .r(2, 2, 2, 2, '#7a3b44')
     .p(12, 2, '#8fd3f0');
  };

  // An allied fighter: blue with a white star on the tail.
  PAINT['ally'] = g => {
    g.r(0, 4, 16, 2, '#3d8bff')
     .r(9, 2, 4, 3, '#8fb8f5')
     .r(4, 5, 6, 2, '#5b9fff')
     .r(12, 3, 4, 1, '#3d8bff')
     .p(15, 4, '#2f2d3d')
     .r(2, 2, 2, 2, '#3d8bff')
     .p(3, 2, '#fffdfa');
  };
}
