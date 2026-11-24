/* Felix Continents: human history data (classic script).
 * Shapes are rough hand sketches, [longitude, latitude] on today's map. Dates are approximate.
 * Years: negative = BCE. Used by v3.html (regions over time) and v4.html (countries at milestones).
 * start/peak/end: the area grows from start to peak, then fades to end. */
(function () {
  var regions = [
    { id: 'egypt', name: 'Ancient Egypt', cap: [31.2, 30.0], start: -3100, peak: -1500, end: -30,
      poly: [[29.5,31.5],[32.5,31.2],[33.5,27.5],[32.5,24.0],[31.0,22.0],[29.5,22.0],[30.0,25.0],[29.2,28.5]],
      story: 'Along the Nile, farmers grew grain and built pyramids and temples for kings.' },
    { id: 'mesopotamia', name: 'Mesopotamia', cap: [44.4, 33.3], start: -3500, peak: -1800, end: -539,
      poly: [[42.5,36.5],[48.5,36.0],[48.5,30.0],[47.5,29.2],[45.0,30.0],[44.0,32.5],[42.0,34.0]],
      story: 'Between two rivers, the first cities were built, and writing was invented.' },
    { id: 'indus', name: 'Indus valley', cap: [72.8, 30.0], start: -2600, peak: -2000, end: -1900,
      poly: [[68.0,31.0],[72.5,31.5],[73.0,25.0],[70.0,23.5],[67.5,25.0]],
      story: 'Cities with wide streets and drains grew beside the Indus river.' },
    { id: 'china', name: 'Chinese dynasties', cap: [113.0, 34.5], start: -1600, peak: 100, end: 220,
      poly: [[104.0,35.0],[112.0,40.5],[118.0,41.0],[122.0,40.0],[121.0,31.0],[116.0,23.0],[108.0,21.5],[102.0,27.0]],
      story: 'Shang kings ruled the Yellow River plain; later Han emperors ruled a far larger land.' },
    { id: 'greece', name: 'Greek city-states', cap: [23.7, 37.9], start: -800, peak: -350, end: -146,
      poly: [[19.5,40.5],[26.5,41.5],[28.0,38.0],[26.0,35.2],[23.0,36.0],[20.0,38.5]],
      story: 'Independent cities such as Athens and Sparta shared a language and the Olympic Games.' },
    { id: 'rome', name: 'Roman Empire', cap: [12.5, 41.9], start: -27, peak: 117, end: 476,
      poly: [[-6.0,36.0],[-5.0,44.0],[3.0,47.0],[12.0,48.5],[17.0,46.5],[22.0,44.0],[29.0,41.0],[36.0,37.0],[35.0,31.0],[25.0,31.0],[20.0,33.0],[10.0,36.0],[0.0,36.0]],
      story: 'Roads and legions linked the Mediterranean from Spain to Syria.' },
    { id: 'aksum', name: 'Aksum', cap: [38.7, 14.1], start: 100, peak: 350, end: 940,
      poly: [[36.0,15.5],[40.0,16.0],[42.5,12.5],[39.5,8.0],[37.0,10.0]],
      story: 'A trading kingdom on the Red Sea that minted its own gold coins.' },
    { id: 'maya', name: 'Maya cities', cap: [-89.2, 17.2], start: -2000, peak: 800, end: 1500,
      poly: [[-92.5,19.5],[-88.0,20.0],[-88.5,16.0],[-91.0,14.5],[-92.5,16.5]],
      story: 'Maya cities built pyramids, kept a calendar and wrote in glyphs.' },
    { id: 'srivijaya', name: 'Srivijaya', cap: [104.8, -2.9], start: 650, peak: 900, end: 1400,
      poly: [[101.0,3.5],[105.0,-1.0],[106.5,-5.5],[103.0,-3.5],[100.5,0.0]],
      story: 'A sea kingdom that controlled trade through the straits between islands.' },
    { id: 'mongols', name: 'Mongol empire', cap: [102.8, 47.9], start: 1206, peak: 1270, end: 1368,
      poly: [[60.0,45.0],[75.0,50.0],[90.0,52.0],[110.0,52.0],[120.0,47.0],[115.0,42.0],[100.0,38.0],[85.0,35.0],[72.0,38.0],[60.0,40.0]],
      story: 'Horse riders united the steppe and linked lands from China to Europe.' },
    { id: 'mali', name: 'Mali empire', cap: [-8.0, 12.6], start: 1235, peak: 1350, end: 1600,
      poly: [[-12.0,16.0],[-4.0,18.0],[2.0,16.0],[-2.0,12.0],[-9.0,11.0]],
      story: 'Gold from the south made Mali rich, and its cities had famous libraries.' },
    { id: 'aztec', name: 'Aztec empire', cap: [-99.1, 19.4], start: 1325, peak: 1500, end: 1521,
      poly: [[-102.5,22.0],[-97.0,21.5],[-96.0,18.0],[-99.0,17.0],[-103.0,19.0]],
      story: 'Tenochtitlan was built on a lake, with canals and floating gardens.' },
    { id: 'inca', name: 'Inca empire', cap: [-71.5, -13.5], start: 1438, peak: 1525, end: 1533,
      poly: [[-78.0,-4.0],[-70.0,-2.0],[-70.0,-18.0],[-72.0,-30.0],[-70.0,-40.0],[-75.0,-36.0],[-76.0,-20.0],[-79.0,-10.0]],
      story: 'Roads ran along the Andes, linking mountain towns with terraced farms.' },
    { id: 'qing', name: 'Qing China', cap: [116.4, 39.9], start: 1644, peak: 1790, end: 1912,
      poly: [[98.0,40.0],[120.0,53.0],[134.0,48.0],[122.0,40.0],[122.0,30.0],[116.0,22.0],[108.0,21.0],[98.0,24.0],[97.0,30.0]],
      story: 'The last emperors ruled a large empire from Beijing.' },
    { id: 'aleutians', name: 'Aleutian people', cap: [-166.5, 53.9], start: -2500, peak: 1000, end: 2000,
      poly: [[-170.0,52.0],[-160.0,55.0],[-150.0,58.0],[-152.0,56.0],[-162.0,53.0],[-172.0,51.0]],
      story: 'Island people who fished and hunted sea animals along a chain of islands.' }
  ];

  /* V4: countries (and peoples) at the snap positions (milestones). from/to in years. */
  var countries = [
    { id: 'greece', name: 'Greek city-states', cap: [23.7, 37.9], from: -800, to: -146, poly: regions[4].poly,
      story: regions[4].story },
    { id: 'rome', name: 'Roman Empire', cap: [12.5, 41.9], from: -27, to: 476, poly: regions[5].poly, story: regions[5].story },
    { id: 'aksum', name: 'Aksum', cap: [38.7, 14.1], from: 100, to: 940, poly: regions[6].poly, story: regions[6].story },
    { id: 'maya', name: 'Maya cities', cap: [-89.2, 17.2], from: -2000, to: 1500, poly: regions[7].poly, story: regions[7].story },
    { id: 'srivijaya', name: 'Srivijaya', cap: [104.8, -2.9], from: 650, to: 1400, poly: regions[8].poly, story: regions[8].story },
    { id: 'mongols', name: 'Mongol empire', cap: [102.8, 47.9], from: 1206, to: 1368, poly: regions[9].poly, story: regions[9].story },
    { id: 'mali', name: 'Mali empire', cap: [-8.0, 12.6], from: 1235, to: 1600, poly: regions[10].poly, story: regions[10].story },
    { id: 'aztec', name: 'Aztec empire', cap: [-99.1, 19.4], from: 1325, to: 1521, poly: regions[11].poly, story: regions[11].story },
    { id: 'inca', name: 'Inca empire', cap: [-71.5, -13.5], from: 1438, to: 1533, poly: regions[12].poly, story: regions[12].story },
    { id: 'qing', name: 'Qing China', cap: [116.4, 39.9], from: 1644, to: 1912, poly: regions[13].poly, story: regions[13].story },
    { id: 'aleutians', name: 'Aleutian people', cap: [-166.5, 53.9], from: -2500, to: 2000, poly: regions[14].poly, story: regions[14].story }
  ];

  /* Snap positions for V4, oldest first. */
  var milestones = [
    { year: -500, label: 'Greek city-states' }, { year: 100, label: 'Roman Empire' },
    { year: 700, label: 'Maya, Aksum' }, { year: 900, label: 'Srivijaya' },
    { year: 1200, label: 'Medieval' }, { year: 1300, label: 'Mongol era' },
    { year: 1500, label: 'Aztec and Inca' }, { year: 1800, label: 'Qing China' },
    { year: 2000, label: 'Modern (continents)' }
  ];

  window.FCHistory = { regions: regions, countries: countries, milestones: milestones };
})();
