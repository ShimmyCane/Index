// The list of worlds. Add one line per world file in this folder (id = the file name without .js).
// The Growth page reads this to fill its world picker, and the Increment Viewer reads it for its Scene drop-down.
(function (root) {
  var list = [
    { id: 'rabbits_hillside', label: 'Rabbits on a hillside (planning)' },
    { id: 'paper_decay', label: 'Paper decay, outdoors (recorded from Paper Again)' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = list;
  else root.GROWTH_WORLD_LIST = list;
})(typeof window !== 'undefined' ? window : this);
