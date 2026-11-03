// World: a pair of rabbits dropped on a hillside valley. Planning mode: the story, the rules and the
// numbers, no 3-D yet. The numbers come from the "ecosystem" time model (js/growth_model.js), so they
// follow from the variables below. The story text was written by Claude for the numbers as they stand;
// {names} in the text are replaced by the numbers, so the text stays true when a number changes
// (the words around them may need a revision if a variable is changed a lot: use the AI loop on the page).
(function (root) {
  var world = {
    schema: 2,
    id: 'rabbits_hillside',
    title: 'Rabbits on a hillside',
    kind: 'growth',
    seed: {
      prompt: 'A hillside valley with a river running through it, bushes, grass and small plants. We drop off a pair of rabbits, one male and one female, and watch them grow and spread.',
      scene: ['hillside valley', 'river running through the valley', 'bushes', 'grass and small plants'],
      entities: [
        { id: 'rabbits', name: 'Rabbits', start: 2, unit: 'rabbits', note: 'one male, one female' },
        { id: 'plants', name: 'Plants', start: 1100, unit: 'plant units', note: 'grass and small plants on the slopes' },
        { id: 'hawks', name: 'Hawks', start: 0, unit: 'hawks', note: 'none yet' },
        { id: 'coyotes', name: 'Coyotes', start: 0, unit: 'coyotes', note: 'none yet' }
      ]
    },
    environment: {
      prompt: 'A temperate valley with four seasons. Plants are the only food. Hawks and coyotes live beyond the valley and come when there are enough rabbits to hunt.',
      variables: [
        { id: 'carry_plants', name: 'Plants the hillside can hold', value: 1200, unit: 'plant units', note: 'The most grass and small plants the valley grows.' },
        { id: 'plant_regrow', name: 'Plant regrowth', value: 1.1, unit: 'per season', note: 'How fast plants grow back in a full growing season.' },
        { id: 'plant_seed_bank', name: 'New plants from seed', value: 25, unit: 'plant units per season', note: 'Seeds blown in or left over, so plants keep coming back.' },
        { id: 'plant_roots', name: 'Plants that survive grazing as roots', value: 0.12, unit: 'of the hillside', note: 'Rabbits cannot eat the roots, so plants regrow even when the grass is eaten short.' },
        { id: 'eat_per_rabbit', name: 'Food per rabbit', value: 4.5, unit: 'plant units per season', note: 'How much one rabbit eats in a season.' },
        { id: 'alt_food', name: 'Other food', value: 0.3, unit: 'of a rabbit\'s food', note: 'Bark, roots and dry stems found when the grass runs short.' },
        { id: 'litter_size', name: 'Kits per litter', value: 5, unit: 'kits', note: '' },
        { id: 'litters_per_season', name: 'Litters per female', value: 1.5, unit: 'per season', note: 'In the best season. The calendar scales it down through the year.' },
        { id: 'kit_survival', name: 'Kits that survive', value: 0.55, unit: 'of kits', note: '' },
        { id: 'adult_mortality', name: 'Natural deaths', value: 0.12, unit: 'of rabbits per season', note: 'Illness, accidents and old age.' },
        { id: 'starvation_rate', name: 'Starvation', value: 0.5, unit: 'of the unfed rabbits per season', note: 'Applies to the share of rabbits that cannot find food.' },
        { id: 'refuge', name: 'Rabbits safe in deep burrows', value: 4, unit: 'rabbits', note: 'A few always survive, out of reach of predators.' },
        { id: 'hawk_start', name: 'Hawks arrive above', value: 35, unit: 'rabbits', note: 'Hawks notice the valley when there are more rabbits than this.' },
        { id: 'hawk_per_rabbits', name: 'One more hawk for every', value: 25, unit: 'rabbits above that', note: '' },
        { id: 'hawk_max', name: 'Most hawks', value: 6, unit: 'hawks', note: '' },
        { id: 'hawk_eats', name: 'Rabbits a hawk takes', value: 12, unit: 'per season', note: '' },
        { id: 'coyote_start', name: 'Coyotes arrive above', value: 90, unit: 'rabbits', note: 'Bigger predators need a bigger meal.' },
        { id: 'coyote_per_rabbits', name: 'One more coyote for every', value: 45, unit: 'rabbits above that', note: '' },
        { id: 'coyote_max', name: 'Most coyotes', value: 4, unit: 'coyotes', note: '' },
        { id: 'coyote_eats', name: 'Rabbits a coyote takes', value: 30, unit: 'per season', note: '' }
      ]
    },
    time: {
      unit: 'season',
      increments: 10,
      perStep: 'One increment is one season. The story starts in spring and runs for ten seasons, two and a half years.',
      calendar: {
        start: 0,
        seasons: [
          { id: 'spring', name: 'Spring', breed: 1.0, grow: 1.0 },
          { id: 'summer', name: 'Summer', breed: 0.8, grow: 0.7 },
          { id: 'autumn', name: 'Autumn', breed: 0.3, grow: 0.3 },
          { id: 'winter', name: 'Winter', breed: 0.0, grow: 0.05 }
        ]
      },
      rules: [
        'Plants grow back every season: fastest in spring, slower in summer, a little in autumn, hardly at all in winter.',
        'Rabbits eat plants. When there is not enough to eat, fewer kits are born and some rabbits starve.',
        'Rabbits breed most in spring, less in summer, a little in autumn and not at all in winter. Half of them are females.',
        'A hawk settles on the hillside when there are more than {hawk_start} rabbits, and one more for every {hawk_per_rabbits} rabbits above that (up to {hawk_max}).',
        'Coyotes come when there are more than {coyote_start} rabbits, and one more for every {coyote_per_rabbits} above that (up to {coyote_max}).',
        'Predators follow the rabbits they saw last season, and leave when the rabbits thin out.'
      ],
      notModelled: [
        'The river and the slope are in the picture, not in the numbers yet.',
        'Weather: a hard winter or a dry summer is not modelled. Plant growth uses fixed season factors.',
        'Males and females are not tracked. Half of all rabbits count as females.'
      ],
      model: { type: 'ecosystem' }
    },
    chart: [
      { key: 'rabbits', name: 'Rabbits', color: '#d9822b' },
      { key: 'hawks', name: 'Hawks', color: '#4f74d6' },
      { key: 'coyotes', name: 'Coyotes', color: '#8a5cc2' },
      { key: 'plants_pct', name: 'Plants (% of full)', color: '#3f9b66' }
    ],
    steps: [
      { label: 'A pair settles in',
        narrative: 'The pair finds soft grass beside the river and digs a first burrow in the bank. They eat the young shoots, and the first litter arrives within weeks. By the end of spring there are {rabbits} rabbits.',
        landscape: 'The hillside is {landscape}, tall grass on both slopes and the river bank dotted with new shoots. Burrow entrances: {burrows}.',
        events: ['Pair released near the river', 'First litter born', 'First burrow dug'] },
      { label: 'The first full summer',
        narrative: 'More litters follow, and the young rabbits start litters of their own. They keep the grass short around the burrows, and paths worn between the bushes and the water begin to show. There are {rabbits} rabbits now.',
        landscape: 'Plants are at {plants_pct}% of full, so the hillside is still {landscape}. Burrow entrances: {burrows}.',
        events: ['More litters', 'Paths worn to the water'] },
      { label: 'Autumn: fat and busy',
        narrative: 'Breeding slows as the days shorten. The rabbits eat well and put on weight for winter, and {rabbits} of them now share the hillside.',
        landscape: 'Plants are at {plants_pct}% of full: the slopes are {landscape}, with grass cropped short near the warren.',
        events: ['Breeding slows', 'Rabbits fatten for winter'] },
      { label: 'The first winter',
        narrative: 'Cold keeps the plants from growing, and the rabbits live on dry stems, bark and roots. Some do not make it through, leaving {rabbits}. No hawk has come yet: there are not enough rabbits to make the trip worth it.',
        landscape: 'The grass is brown and flat but the roots are alive: plants are at {plants_pct}% of full.',
        events: ['Plants stop growing', 'Some rabbits die in the cold'] },
      { label: 'Spring: the population jumps',
        narrative: 'The survivors breed hard in spring. In a single season the population nearly triples to {rabbits}. Trails now cross the whole slope, and grass near the warren is eaten flat.',
        landscape: 'Plants recover quickly to {plants_pct}% of full: the hillside is {landscape}. Burrow entrances: {burrows}.',
        events: ['Large litters', 'Rabbit trails cross the slope'] },
      { label: 'A hawk takes notice',
        narrative: 'There are now {rabbits} rabbits in the open, and a hawk notices (hawks on the hillside: {hawks}). The rabbits near the burrows have eaten the grass short, and plants are at {plants_pct}% of full.',
        landscape: 'The slope is still {landscape} overall, but there is worn bare ground around the warren and short grass spreading outward.',
        events: ['First hawk arrives', 'Rabbits eating the grass short'] },
      { label: 'Autumn: predators gather',
        narrative: 'Word is out. Hawks on the hillside: {hawks}. A coyote has taken up the valley (coyotes: {coyotes}). There are still {rabbits} rabbits, but plants have dropped to {plants_pct}% of full and the slope is {landscape}.',
        landscape: 'Bare ground shows around the warren and along the trails. The river bank is the greenest place left.',
        events: ['More hawks', 'A coyote moves in', 'Overgrazed patches appear'] },
      { label: 'Winter: the crash',
        narrative: 'A thin larder and hungry predators cut the rabbits down to {rabbits}. The ground around the warren is bare. The plants will need a full spring to recover (plants: {plants_pct}% of full).',
        landscape: 'The hillside is {landscape}. Burrow entrances: {burrows}, most of them quiet.',
        events: ['Predators take many rabbits', 'Plants at their lowest'] },
      { label: 'Spring: the hillside recovers',
        narrative: 'With fewer mouths, the plants begin to come back (plants: {plants_pct}% of full). The remaining {rabbits} rabbits breed again. The hawks and coyotes have moved on for now (hawks: {hawks}, coyotes: {coyotes}).',
        landscape: 'Green shoots return to the bare patches, and the slope is {landscape}.',
        events: ['Plants regrow', 'Predators move on', 'Rabbits breed again'] },
      { label: 'A second wave begins',
        narrative: 'With the predators away, the rabbits are back to {rabbits}. The cycle is starting again, this time on a thinner hillside (plants: {plants_pct}% of full), and a hawk has come back (hawks: {hawks}).',
        landscape: 'The slope is {landscape}. The warren has grown to {burrows} burrow entrances.',
        events: ['Rabbits boom again', 'A hawk returns'],
        open: ['Does the cycle settle into a balance, or swing again? Ten steps is too short to tell.'] }
    ],
    outputs: {
      viewer: { world: 'rabbits_hillside' },
      model3d: null
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = world;
  else { root.GROWTH_WORLDS = root.GROWTH_WORLDS || {}; root.GROWTH_WORLDS[world.id] = world; }
})(typeof window !== 'undefined' ? window : this);
