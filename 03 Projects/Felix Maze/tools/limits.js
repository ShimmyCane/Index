// Size limits shared by the generator and the planner.
// size = how big a square is on paper (1/100 in); zoom = how much of the page the maze fills (cell = size / zoom).
"use strict";
const MIN_CELL = 36, MAX_CELL = 110, MAX_ZOOM = 1.2;
// paper-square floor per level: 36 up to level 4 (pencil-friendly), 30 at level 5, then smaller for the long levels
// (Jimmy: smaller squares and less white space are fine for levels 6 and 7)
const floorOf = level => (level >= 7 ? 22 : level === 6 ? 26 : level === 5 ? 30 : MIN_CELL);
// zoom above 1.2 pushes the start and finish pictures off the page (measured on page templates at level 7)
const maxZoomOf = () => MAX_ZOOM;
module.exports = { MIN_CELL, MAX_CELL, MAX_ZOOM, floorOf, maxZoomOf };
