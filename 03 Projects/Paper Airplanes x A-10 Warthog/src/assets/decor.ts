// Things that are only to look at: trees. They have no hit box and cannot be shot.
namespace PA {
  // A round-topped tree with a trunk.
  PAINT['tree'] = g => {
    g.r(3, 8, 2, 4, '#6b4a3a')
     .r(1, 3, 6, 6, '#7bd389')
     .r(2, 1, 4, 3, '#8fe0bd')
     .p(2, 6, '#5fb870').p(6, 4, '#5fb870');
  };
}
