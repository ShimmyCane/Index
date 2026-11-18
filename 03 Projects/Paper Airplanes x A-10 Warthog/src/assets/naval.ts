// Ships on the sea and railway cars on the track.
namespace PA {
  // A warship seen from the side: a grey hull, a bridge and a mast.
  PAINT['ship'] = g => {
    g.r(0, 6, 26, 3, '#6b7480')
     .r(1, 5, 24, 1, '#8a9470')
     .r(16, 2, 6, 4, '#f5fbff')
     .p(18, 3, '#8fd3f0').p(20, 3, '#8fd3f0')
     .r(19, 0, 1, 2, '#4d5560');
  };

  // A railway wagon.
  PAINT['rail'] = g => {
    g.r(0, 2, 12, 4, '#8a6a4a')
     .r(0, 1, 12, 1, '#6b4a3a')
     .r(2, 6, 2, 2, '#4d5560').r(8, 6, 2, 2, '#4d5560');
  };
}
