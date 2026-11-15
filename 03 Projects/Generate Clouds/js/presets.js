/* Generate Clouds — the cloud atlas: bundled sample skies, one per cloud type.
   They are also the last fallback when no weather data can be loaded.
   Content only: add a sky here and it appears in the atlas panel. */
(function () {
  'use strict';
  var GC = window.GC = window.GC || {};
  function wx(o) {
    var base = { t: 20, td: 11, rh: 55, precip: 0, code: 1, cover: 0.3, low: 0, mid: 0, high: 0, wind: { s: 4, d: 250 }, gust: 7,
      cape: 150, frz: 3.6, vis: 40, w850: { s: 7, d: 255 }, w500: { s: 16, d: 265 }, w300: { s: 30, d: 270 }, w100: null,
      pm25: 6, pm10: 12, aod: 0.08, dust: 0 };
    Object.keys(o).forEach(function (k) { base[k] = o[k]; });
    base.next = { low: base.low, mid: base.mid, high: base.high };
    return base;
  }
  GC.PRESETS = [
    { id: 'cumulus', icon: '⛅', name: 'Cumulus', level: 'Low', sun: 'day', cam: { alt: 0.002, pitch: 18 },
      text: 'Fair-weather heaps with flat bases. Warm air rises until it cools enough to condense; every base sits at that same height.',
      wx: wx({ low: 0.38, code: 2, cape: 300 }) },
    { id: 'stratocumulus', icon: '☁️', name: 'Stratocumulus', level: 'Low', sun: 'day', cam: { alt: 0.002, pitch: 22 },
      text: 'A lumpy grey-and-white sheet with gaps. The most common cloud on Earth, often over cool seas.',
      wx: wx({ low: 0.78, code: 3, td: 14, cape: 20, wind: { s: 6, d: 290 } }) },
    { id: 'stratus', icon: '🌫️', name: 'Stratus', level: 'Low', sun: 'day', cam: { alt: 0.002, pitch: 15 },
      text: 'A flat, featureless grey blanket, like fog that is not touching the ground.',
      wx: wx({ low: 1, code: 3, t: 12, td: 11, rh: 95, cape: 0, wind: { s: 2, d: 200 }, vis: 9 }) },
    { id: 'nimbostratus', icon: '🌧️', name: 'Nimbostratus', level: 'Low to mid', sun: 'day', cam: { alt: 0.002, pitch: 12 },
      text: 'A thick dark layer that rains or snows for hours. It hides the sun completely.',
      wx: wx({ low: 1, mid: 1, code: 63, precip: 3, t: 10, td: 9, rh: 96, cape: 0, vis: 6 }) },
    { id: 'congestus', icon: '🌥️', name: 'Cumulus congestus', level: 'Low, growing tall', sun: 'day', cam: { alt: 0.002, pitch: 20 },
      text: 'Towering cauliflower heaps. The air is unstable and the cloud keeps climbing; showers may follow.',
      wx: wx({ low: 0.45, code: 80, cape: 1100, t: 27, td: 19, precip: 0.3 }) },
    { id: 'cumulonimbus', icon: '⛈️', name: 'Cumulonimbus', level: 'Ground to the top of the weather', sun: 'day', cam: { alt: 0.002, pitch: 20 },
      text: 'The thunderstorm cloud. It grows until it hits the stratosphere and spreads into an anvil. Lightning flickers inside.',
      wx: wx({ low: 0.7, high: 0.5, code: 95, cape: 2600, t: 30, td: 23, precip: 6, gust: 20 }) },
    { id: 'altocumulus', icon: '🌤️', name: 'Altocumulus', level: 'Mid', sun: 'day', cam: { alt: 0.002, pitch: 35 },
      text: 'Rows or patches of small rounded clumps, a "mackerel sky". Each clump is about as wide as your thumb at arm\'s length.',
      wx: wx({ mid: 0.6, code: 2 }) },
    { id: 'altostratus', icon: '🌥️', name: 'Altostratus', level: 'Mid', sun: 'day', cam: { alt: 0.002, pitch: 25 },
      text: 'A grey-blue veil. The sun shows through as if behind frosted glass, with no shadows on the ground.',
      wx: wx({ mid: 0.95, code: 3 }) },
    { id: 'cirrus', icon: '🪶', name: 'Cirrus', level: 'High', sun: 'golden', cam: { alt: 0.002, pitch: 25, toward: 'sun' },
      text: 'Wispy streaks of ice crystals, combed by fast winds near 10 km. They catch sunset colours long after the ground is in shade.',
      wx: wx({ high: 0.55, code: 1, w300: { s: 38, d: 275 } }) },
    { id: 'cirrostratus', icon: '🌫️', name: 'Cirrostratus', level: 'High', sun: 'day', cam: { alt: 0.002, pitch: 35 },
      text: 'A thin milky veil of ice over the whole sky. It often arrives a day ahead of a warm front.',
      wx: wx({ high: 0.95, code: 2 }) },
    { id: 'cirrocumulus', icon: '🐟', name: 'Cirrocumulus', level: 'High', sun: 'day', cam: { alt: 0.002, pitch: 45 },
      text: 'Tiny white ripples, like grains of rice, very high up. Rare and short-lived.',
      wx: wx({ high: 0.65, code: 1, w300: { s: 9, d: 270 } }) },
    { id: 'sea', icon: '✈️', name: 'Sea of clouds', level: 'Seen from above', sun: 'golden', cam: { alt: 3.2, pitch: -8, toward: 'sun' },
      text: 'A stratocumulus deck from 3 km up, the way it looks from a mountain top or an aeroplane window.',
      wx: wx({ low: 0.9, high: 0.25, code: 3, td: 14, cape: 20 }) },
    { id: 'dusk', icon: '🌆', name: 'Hazy city dusk', level: 'Mixed', sun: 'dusk', cam: { alt: 0.002, pitch: 12, toward: 'sun' },
      text: 'Polluted air scatters more light, so the horizon glows orange and the blue above turns grey.',
      wx: wx({ low: 0.15, mid: 0.3, high: 0.5, code: 2, pm25: 85, pm10: 130, aod: 0.9, vis: 7 }) }
  ];
  GC.SAMPLE_WX = GC.PRESETS[0].wx;

  GC.PLACES = [
    { name: 'Tokyo', region: 'Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Reykjavik', region: 'Iceland', lat: 64.1466, lon: -21.9426 },
    { name: 'Singapore', region: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { name: 'Nairobi', region: 'Kenya', lat: -1.2921, lon: 36.8219 },
    { name: 'Denver', region: 'United States', lat: 39.7392, lon: -104.9903 },
    { name: 'Cusco', region: 'Peru', lat: -13.5320, lon: -71.9675 },
    { name: 'Delhi', region: 'India', lat: 28.6139, lon: 77.2090 },
    { name: 'Wellington', region: 'New Zealand', lat: -41.2866, lon: 174.7756 }
  ];
})();
