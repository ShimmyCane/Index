// Ground vehicles and guns: tanks, armoured carriers, trucks, a fuel tanker, a SAM launcher, flak.
namespace PA {
  // Main battle tank, side view, facing right.
  PAINT['tank_mbt'] = g => {
    g.r(0, 8, 20, 2, '#4d5560')                              // tracks
     .p(2, 9, '#f5fbff').p(6, 9, '#f5fbff').p(10, 9, '#f5fbff').p(14, 9, '#f5fbff')
     .r(1, 5, 18, 3, '#8a9470')                              // hull
     .r(6, 2, 8, 3, '#9aa77a')                               // turret
     .p(9, 1, '#9aa77a')                                     // hatch
     .r(13, 3, 9, 1, '#4d5560');                             // long gun
  };

  // Light tank or scout vehicle.
  PAINT['tank_light'] = g => {
    g.r(0, 6, 14, 2, '#4d5560')
     .p(2, 7, '#f5fbff').p(8, 7, '#f5fbff')
     .r(1, 3, 12, 3, '#b9c79a')
     .r(4, 1, 5, 2, '#c9d4a8')
     .r(8, 2, 5, 1, '#4d5560');
  };

  // Armoured personnel carrier: a boxy hull with wheels.
  PAINT['apc'] = g => {
    g.r(0, 6, 16, 2, '#4d5560')
     .p(2, 7, '#f5fbff').p(12, 7, '#f5fbff')
     .r(0, 2, 16, 4, '#9aa77a')
     .r(2, 1, 5, 1, '#9aa77a')
     .r(10, 3, 3, 1, '#8fd3f0');
  };

  // Cargo truck, facing right.
  PAINT['truck'] = g => {
    g.r(0, 1, 9, 4, '#e6c48a')
     .r(9, 2, 5, 3, '#e6c48a')
     .p(11, 3, '#8fd3f0')
     .r(2, 5, 2, 2, '#6b7480').r(10, 5, 2, 2, '#6b7480');
  };

  // Fuel tanker: a cab and a red tank trailer.
  PAINT['fuel'] = g => {
    g.r(0, 3, 4, 4, '#e6c48a')
     .p(2, 4, '#8fd3f0')
     .r(4, 3, 12, 4, '#f5fbff')
     .r(4, 5, 12, 1, '#ff6b6b')
     .r(2, 6, 2, 2, '#6b7480').r(9, 6, 2, 2, '#6b7480').r(14, 6, 2, 2, '#6b7480');
  };

  // Surface-to-air missile launcher with a radar dish and four tubes.
  PAINT['sam'] = g => {
    g.r(0, 9, 22, 3, '#8a9470')                              // carrier
     .r(2, 10, 3, 2, '#4d5560').r(15, 10, 3, 2, '#4d5560')   // wheels
     .r(4, 5, 10, 4, '#b9c79a')                              // launcher body
     .p(5, 4, '#f5fbff').p(8, 4, '#f5fbff').p(11, 4, '#f5fbff').p(14, 4, '#f5fbff')
     .r(16, 1, 1, 8, '#4d5560')                              // radar mast
     .r(13, 0, 7, 2, '#f5fbff');                             // dish
  };

  // Anti-aircraft gun on a mount.
  PAINT['flak'] = g => {
    g.r(0, 5, 6, 3, '#e89a9a')
     .r(1, 0, 1, 6, '#6b7480').r(3, 0, 1, 6, '#6b7480');
  };
}
