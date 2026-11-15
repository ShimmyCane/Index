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

  // Well-known cities across the climates. "Skies right now" asks for the current weather of all of them in one call
  // and sorts them into groups, so the list always offers a storm, a clear sky, an overcast and so on when there is one.
  GC.CITIES = [
    ['Tokyo', 'Japan', 35.68, 139.65], ['Seoul', 'South Korea', 37.57, 126.98], ['Beijing', 'China', 39.90, 116.41], ['Shanghai', 'China', 31.23, 121.47],
    ['Hong Kong', 'China', 22.32, 114.17], ['Taipei', 'Taiwan', 25.03, 121.57], ['Manila', 'Philippines', 14.60, 120.98], ['Bangkok', 'Thailand', 13.76, 100.50],
    ['Singapore', 'Singapore', 1.35, 103.82], ['Kuala Lumpur', 'Malaysia', 3.14, 101.69], ['Jakarta', 'Indonesia', -6.21, 106.85], ['Darwin', 'Australia', -12.46, 130.84],
    ['Sydney', 'Australia', -33.87, 151.21], ['Perth', 'Australia', -31.95, 115.86], ['Wellington', 'New Zealand', -41.29, 174.78], ['Honolulu', 'United States', 21.31, -157.86],
    ['Delhi', 'India', 28.61, 77.21], ['Mumbai', 'India', 19.08, 72.88], ['Dhaka', 'Bangladesh', 23.81, 90.41], ['Kathmandu', 'Nepal', 27.72, 85.32],
    ['Dubai', 'United Arab Emirates', 25.20, 55.27], ['Riyadh', 'Saudi Arabia', 24.71, 46.68], ['Tehran', 'Iran', 35.69, 51.39], ['Istanbul', 'Türkiye', 41.01, 28.98],
    ['Cairo', 'Egypt', 30.04, 31.24], ['Nairobi', 'Kenya', -1.29, 36.82], ['Kampala', 'Uganda', 0.35, 32.58], ['Kinshasa', 'DR Congo', -4.44, 15.27],
    ['Lagos', 'Nigeria', 6.52, 3.38], ['Accra', 'Ghana', 5.60, -0.19], ['Dakar', 'Senegal', 14.72, -17.47], ['Casablanca', 'Morocco', 33.57, -7.59],
    ['Johannesburg', 'South Africa', -26.20, 28.05], ['Cape Town', 'South Africa', -33.92, 18.42], ['Antananarivo', 'Madagascar', -18.88, 47.51], ['Addis Ababa', 'Ethiopia', 9.03, 38.74],
    ['Moscow', 'Russia', 55.76, 37.62], ['Helsinki', 'Finland', 60.17, 24.94], ['Tromsø', 'Norway', 69.65, 18.96], ['Reykjavik', 'Iceland', 64.15, -21.94],
    ['London', 'United Kingdom', 51.51, -0.13], ['Paris', 'France', 48.86, 2.35], ['Berlin', 'Germany', 52.52, 13.40], ['Zurich', 'Switzerland', 47.37, 8.54],
    ['Rome', 'Italy', 41.90, 12.50], ['Madrid', 'Spain', 40.42, -3.70], ['Lisbon', 'Portugal', 38.72, -9.14], ['Athens', 'Greece', 37.98, 23.73],
    ['New York', 'United States', 40.71, -74.01], ['Miami', 'United States', 25.76, -80.19], ['Chicago', 'United States', 41.88, -87.63], ['Denver', 'United States', 39.74, -104.99],
    ['Seattle', 'United States', 47.61, -122.33], ['Los Angeles', 'United States', 34.05, -118.24], ['Anchorage', 'United States', 61.22, -149.90], ['Vancouver', 'Canada', 49.28, -123.12],
    ['Toronto', 'Canada', 43.65, -79.38], ['Mexico City', 'Mexico', 19.43, -99.13], ['Havana', 'Cuba', 23.11, -82.37], ['Panama City', 'Panama', 8.98, -79.52],
    ['Bogotá', 'Colombia', 4.71, -74.07], ['Quito', 'Ecuador', -0.18, -78.47], ['Lima', 'Peru', -12.05, -77.04], ['Cusco', 'Peru', -13.53, -71.97],
    ['Manaus', 'Brazil', -3.12, -60.02], ['Rio de Janeiro', 'Brazil', -22.91, -43.17], ['São Paulo', 'Brazil', -23.55, -46.63], ['Buenos Aires', 'Argentina', -34.60, -58.38],
    ['Santiago', 'Chile', -33.45, -70.67], ['Ushuaia', 'Argentina', -54.80, -68.30], ['La Paz', 'Bolivia', -16.49, -68.12], ['Ulaanbaatar', 'Mongolia', 47.89, 106.91]
  ].map(function (c) { return { name: c[0], region: c[1], lat: c[2], lon: c[3] }; });

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
