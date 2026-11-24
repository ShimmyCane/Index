/* Felix Continents: map data (classic script, works from file://).
 * Outlines are rough sketches of today's coastlines, drawn by hand as [longitude, latitude] pairs.
 * Moment offsets move each plate from today's place: [dLon, dLat, spin] in degrees.
 * Moments run oldest first, so the time slider goes from the past (left) to today (right).
 * Positions and dates are approximate. See the About section on the page. */
(function () {
  var plates = [
    { id: 'NA', name: 'North America', poly: [[-168,66],[-162,70],[-156,71],[-141,70],[-128,70],[-115,68],[-95,68],[-82,69],[-75,62],[-65,60],[-60,55],[-56,52],[-65,47],[-70,43],[-76,39],[-76,35],[-81,31],[-80,26],[-82,27],[-84,30],[-89,30],[-94,29],[-97,26],[-97,22],[-94,18],[-91,19],[-90,21],[-87,21],[-88,16],[-84,15],[-83,10],[-79,9],[-77,8],[-80,7],[-84,9],[-86,12],[-92,14],[-96,16],[-105,20],[-106,23],[-110,27],[-113,31],[-114,30],[-110,23],[-115,30],[-117,33],[-121,35],[-124,40],[-124,46],[-127,50],[-131,55],[-137,59],[-146,61],[-152,59],[-158,57],[-164,55],[-158,58],[-162,60],[-165,62],[-166,65]] },
    { id: 'GL', name: 'Greenland', poly: [[-73,78],[-60,82],[-30,83],[-20,81],[-18,76],[-22,70],[-32,68],[-42,60],[-50,64],[-54,70],[-60,76]] },
    { id: 'SA', name: 'South America', poly: [[-77,8],[-72,12],[-64,11],[-60,8],[-52,5],[-50,0],[-44,-2],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-63,-41],[-65,-45],[-68,-50],[-69,-55],[-74,-52],[-74,-45],[-73,-37],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-78,3]] },
    { id: 'AF', name: 'Africa', poly: [[-17,21],[-16,28],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[38,18],[43,12],[51,12],[48,6],[41,-2],[40,-10],[40,-16],[35,-22],[33,-27],[27,-34],[19,-35],[15,-27],[12,-17],[13,-10],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8],[-17,14]] },
    { id: 'MA', name: 'Madagascar', poly: [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]] },
    { id: 'EU', name: 'Eurasia', poly: [[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[5,53],[9,55],[8,57],[10,58],[5,59],[5,62],[14,68],[20,70],[28,71],[40,67],[44,68],[60,69],[70,73],[80,73],[100,78],[113,74],[130,71],[150,71],[160,70],[170,70],[180,68],[180,65],[178,62],[170,60],[163,60],[163,58],[156,51],[140,48],[136,43],[130,42],[129,35],[126,35],[127,40],[122,40],[118,38],[122,31],[120,25],[116,22],[110,21],[106,20],[108,15],[109,11],[105,9],[101,13],[100,8],[103,1],[100,4],[98,8],[98,16],[94,17],[92,22],[89,26],[80,30],[74,35],[70,28],[68,24],[67,25],[61,25],[57,25],[56,27],[50,30],[48,30],[51,25],[56,26],[59,22],[52,16],[43,13],[38,22],[35,28],[35,33],[36,36],[30,36],[27,37],[26,40],[23,40],[22,37],[20,40],[19,42],[13,45],[12,44],[16,41],[18,40],[16,38],[12,42],[8,44],[3,43],[-2,43]] },
    { id: 'IN', name: 'India', poly: [[68,24],[72,21],[73,17],[77,8],[80,15],[88,22],[92,22],[89,26],[80,30],[74,35],[70,28]] },
    { id: 'AU', name: 'Australia', poly: [[114,-22],[114,-34],[118,-35],[124,-34],[131,-31],[138,-35],[141,-38],[146,-39],[150,-37],[153,-31],[153,-25],[146,-19],[142,-11],[141,-17],[136,-15],[131,-12],[127,-14],[122,-18]] },
    { id: 'AN', name: 'Antarctica', poly: [[-180,-72],[-120,-74],[-60,-65],[-45,-75],[0,-72],[60,-67],[90,-67],[120,-70],[160,-72],[180,-72],[180,-90],[-180,-90]] }
  ];

  /* Oldest first. Offsets per moment (missing plate = no move). */
  var moments = [
    { id: 'pangaea', name: 'Pangaea', short: 'Pangaea', age: 250, when: 'about 250 million years ago',
      sentence: 'Nearly all the land was joined into one supercontinent, so the middle was far from any sea and very dry.', sea: 0, ice: false,
      plates: { NA: [55, -5, -20], GL: [45, 8, -20], EU: [-45, -5, 10], SA: [35, -5, 10], AF: [-10, 0, 5], MA: [-10, 0, 5], IN: [-30, -35, 10], AU: [-40, -14, 0], AN: [-30, 8, 0] } },
    { id: 'break', name: 'Pangaea starts to break', short: 'Breaking', age: 175, when: 'about 175 million years ago',
      sentence: 'The big land is splitting apart. The Atlantic Ocean is only just beginning to open.', sea: 2, ice: false,
      plates: { NA: [25, 5, -6], GL: [20, 8, -6], EU: [-20, 0, 0], SA: [20, -2, 0], AF: [-5, 0, 0], MA: [-5, 0, 0], IN: [-30, -22, 0], AU: [-35, -10, 0], AN: [-5, 5, 0] } },
    { id: 'dino', name: 'The end of the dinosaurs', short: 'Dinosaurs', age: 66, when: 'about 66 million years ago',
      sentence: 'India was still an island drifting north, and lava poured out where the Deccan traps are now.', sea: 1, ice: false,
      plates: { IN: [-4, -20, 0], SA: [-4, -2, 0] } },
    { id: 'ice', name: 'The last ice age', short: 'Ice age', age: 0.02, when: 'about 20,000 years ago',
      sentence: 'Ice covered much of the north. The sea was lower, so some seabed became dry land.', sea: -2, ice: true, plates: {} },
    { id: 'now', name: 'Today', short: 'Now', age: 0, when: 'now',
      sentence: 'These are the continents as they are today.', sea: 0, ice: false, plates: {} }
  ];

  /* Mountains and volcanoes sit on a plate (today's place). They show when age is between to and from. */
  var features = [
    { name: 'Appalachians', kind: 'mountain', plate: 'NA', lon: -80, lat: 37, from: 480, to: 0 },
    { name: 'Rockies', kind: 'mountain', plate: 'NA', lon: -110, lat: 45, from: 80, to: 0 },
    { name: 'Andes', kind: 'mountain', plate: 'SA', lon: -70, lat: -20, from: 100, to: 0 },
    { name: 'Alps', kind: 'mountain', plate: 'EU', lon: 10, lat: 46, from: 35, to: 0 },
    { name: 'Himalayas', kind: 'mountain', plate: 'IN', lon: 84, lat: 29, from: 50, to: 0 },
    { name: 'Old mountains (Variscan)', kind: 'mountain', plate: 'EU', lon: 2, lat: 46, from: 330, to: 200 },
    { name: 'Japan volcanoes', kind: 'volcano', plate: 'EU', lon: 138, lat: 36, from: 30, to: 0 },
    { name: 'Andes volcanoes', kind: 'volcano', plate: 'SA', lon: -68, lat: -22, from: 30, to: 0 },
    { name: 'Deccan traps', kind: 'volcano', plate: 'IN', lon: 75, lat: 19, from: 67, to: 64 }
  ];

  window.FC = { plates: plates, moments: moments, features: features };
})();
