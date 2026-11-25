/* Massage Map: data. Plain words, no build step.
   Two technique sets: EN (English, touch-based areas) and CN (Chinese: acupoints and Tui Na handling).
   Every marker is a point on a drawn foot view (viewBox 0 0 200 420). Positions are approximate
   placeholders until the drawings are replaced; check them against the WHO standard before use. */
var MM = {};

MM.VERSION = '0.1.0';

MM.views = {
  sole:  { en: 'Sole',       cn: '足底' },
  top:   { en: 'Top',        cn: '足背' },
  side:  { en: 'Outer side', cn: '外侧' },
  ankle: { en: 'Ankle',      cn: '踝部' }
};

/* Markers per language, per view. id -> {x, y, en, cn, where_en, where_cn} */
MM.markers = {
  en: {
    sole: {
      ball:  { x: 100, y: 150, en: 'Ball of foot', where_en: 'The pad under the toes, where the foot bends.' },
      arch:  { x: 62,  y: 240, en: 'Arch',         where_en: 'The soft inner curve under the middle of the foot.' },
      heel:  { x: 100, y: 355, en: 'Heel',         where_en: 'The back pad of the foot.' },
      toes:  { x: 100, y: 62,  en: 'Toes',         where_en: 'The underside of the toes.' }
    },
    top: {
      toes_top: { x: 100, y: 62,  en: 'Toes (top)',     where_en: 'The top of the toes.' },
      midfoot:  { x: 100, y: 200, en: 'Top of foot',    where_en: 'The middle of the top of the foot.' },
      ankle_top:{ x: 100, y: 320, en: 'Front of ankle', where_en: 'The top of the foot near the ankle.' }
    },
    side: {
      outer:    { x: 150, y: 220, en: 'Outer edge',    where_en: 'The outside edge of the foot.' },
      toe_side: { x: 150, y: 80,  en: 'Little toe',    where_en: 'The outside of the little toe.' }
    },
    ankle: {
      ankle_front: { x: 105, y: 200, en: 'Front of ankle', where_en: 'The front of the ankle.' },
      ankle_side:  { x: 140, y: 240, en: 'Outer ankle',    where_en: 'The bony bump on the outside of the ankle.' }
    }
  },
  cn: {
    sole: {
      KI1:  { x: 100, y: 175, en: 'KI1 涌泉 Yongquan', cn: '涌泉', where_en: 'On the sole, in the hollow that appears when the toes curl down, about a third of the way from the toes to the heel.' }
    },
    top: {
      LR1:  { x: 62,  y: 58,  en: 'LR1 大敦 Dadun',       cn: '大敦', where_en: 'Outer corner of the big toenail.' },
      SP1:  { x: 56,  y: 72,  en: 'SP1 隐白 Yinbai',       cn: '隐白', where_en: 'Inner corner of the big toenail.' },
      LR2:  { x: 72,  y: 95,  en: 'LR2 行间 Xingjian',     cn: '行间', where_en: 'In the web between the big toe and the second toe.' },
      ST44: { x: 100, y: 100, en: 'ST44 内庭 Neiting',     cn: '内庭', where_en: 'In the web between the second and third toes, at the edge of the skin.' },
      ST42: { x: 95,  y: 190, en: 'ST42 冲阳 Chongyang',   cn: '冲阳', where_en: 'On the top of the foot, between the second and third long foot bones, beside the pulse.' },
      LR3:  { x: 75,  y: 215, en: 'LR3 太冲 Taichong',     cn: '太冲', where_en: 'On the top of the foot, in the dip between the first and second long foot bones.' },
      GB41: { x: 130, y: 220, en: 'GB41 足临泣 Zulinqi',   cn: '足临泣', where_en: 'On the top of the foot, in the dip between the fourth and fifth long foot bones.' },
      ST41: { x: 100, y: 320, en: 'ST41 解溪 Jiexi',       cn: '解溪', where_en: 'Front of the ankle, in the dip between the tendons.' }
    },
    side: {
      BL65: { x: 150, y: 210, en: 'BL65 束骨 Shugu',       cn: '束骨', where_en: 'Outer foot, below the joint of the little toe, along the outside edge.' },
      BL66: { x: 150, y: 85,  en: 'BL66 足通谷 Zutonggu',  cn: '足通谷', where_en: 'Outer edge of the little toe, just behind its joint.' }
    },
    ankle: {
      SP6:  { x: 68,  y: 110, en: 'SP6 三阴交 Sanyinjiao', cn: '三阴交', where_en: 'Inner leg, about three finger-widths above the inner ankle bone, just behind the shin bone.' },
      KI3:  { x: 68,  y: 190, en: 'KI3 太溪 Taixi',        cn: '太溪', where_en: 'Behind the inner ankle bone, in the dip before the heel cord.' },
      KI6:  { x: 60,  y: 240, en: 'KI6 照海 Zhaohai',      cn: '照海', where_en: 'Just below the inner ankle bone.' },
      BL60: { x: 135, y: 200, en: 'BL60 昆仑 Kunlun',      cn: '昆仑', where_en: 'Behind the outer ankle bone, in the dip before the heel cord.' },
      BL62: { x: 142, y: 250, en: 'BL62 申脉 Shenmai',     cn: '申脉', where_en: 'Just below the outer ankle bone.' },
      GB40: { x: 140, y: 230, en: 'GB40 丘墟 Qiuxu',       cn: '丘墟', where_en: 'In front of and below the outer ankle bone.' },
      ST41: { x: 105, y: 200, en: 'ST41 解溪 Jiexi',       cn: '解溪', where_en: 'Front of the ankle, in the dip between the tendons.' }
    }
  }
};

/* Techniques. steps: [view, marker id, pressure 1-5, direction [dx, dy] (screen units, -1..1)]
   Each technique plays as a 20-second loop; steps share the time evenly. */
MM.techniques = {
  en: [
    { id: 'thumb-walk', color: '#f4a261', en: 'Thumb walking', how_en: 'Walk the thumb in small steps along the arch, one step at a time.',
      steps: [['sole','arch',2,[0,1]],['sole','arch',3,[0,1]],['sole','arch',3,[0,1]],['sole','arch',2,[0,1]]],
      sources: [] },
    { id: 'knuckle', color: '#e76f51', en: 'Knuckle press', how_en: 'Press slowly with a bent knuckle on the ball of the foot, then ease off.',
      steps: [['sole','ball',4,[0,1]],['sole','arch',3,[0,1]],['sole','heel',3,[0,-1]]],
      sources: [] },
    { id: 'palm-circles', color: '#e9c46a', en: 'Palm circles', how_en: 'Make slow circles with the heel of the hand over the middle of the sole.',
      steps: [['sole','arch',2,[1,0]],['sole','arch',2,[0,1]],['sole','heel',2,[-1,0]]],
      sources: [] },
    { id: 'heel-rotation', color: '#8ab17d', en: 'Heel rotation', how_en: 'Hold the heel and turn the foot gently, one way then the other.',
      steps: [['sole','heel',3,[1,0]],['ankle','ankle_front',2,[1,0]],['sole','heel',3,[-1,0]]],
      sources: [] },
    { id: 'toe-pull', color: '#2a9d8f', en: 'Toe pull', how_en: 'Hold each toe at its base and pull gently toward you.',
      steps: [['sole','toes',3,[0,-1]],['top','toes_top',3,[0,-1]],['side','toe_side',2,[0,-1]]],
      sources: [] },
    { id: 'ankle-circles', color: '#264653', en: 'Ankle circles', how_en: 'Hold the ankle and move it in slow circles, both directions.',
      steps: [['ankle','ankle_front',2,[1,0]],['ankle','ankle_side',2,[0,1]],['ankle','ankle_front',2,[-1,0]]],
      sources: [] },
    { id: 'sole-strip', color: '#c77dff', en: 'Sole stripping', how_en: 'Slide the thumb from the toes to the heel in one long stroke.',
      steps: [['sole','toes',2,[0,1]],['sole','arch',3,[0,1]],['sole','heel',2,[0,1]]],
      sources: [] },
    { id: 'side-squeeze', color: '#ff8fa3', en: 'Side squeeze', how_en: 'Squeeze the outer edge of the foot between the hands, then release.',
      steps: [['side','outer',3,[-1,0]],['sole','arch',2,[-1,0]],['side','outer',3,[-1,0]]],
      sources: [] }
  ],
  cn: [
    { id: 'an', color: '#f4a261', cn: '按法 àn', en: 'Press (按)', how_en: 'Press and hold the acupoint with a thumb for three to five seconds, then release.',
      steps: [['sole','KI1',4,[0,-1]],['top','LR3',4,[0,-1]],['top','ST44',3,[0,-1]],['ankle','SP6',3,[0,-1]]],
      sources: ['wiki_tui_na','trial_table'] },
    { id: 'rou', color: '#e76f51', cn: '揉法 róu', en: 'Knead (揉)', how_en: 'Small circles with the thumb or palm over the point, without lifting it.',
      steps: [['sole','KI1',2,[1,0]],['sole','KI1',2,[0,1]],['ankle','KI6',2,[1,0]]],
      sources: ['wiki_tui_na'] },
    { id: 'tui', color: '#e9c46a', cn: '推法 tuī', en: 'Push (推)', how_en: 'Push in one direction along the line from the toes toward the ankle.',
      steps: [['top','ST42',3,[0,1]],['top','LR3',3,[0,1]],['ankle','ST41',2,[0,1]]],
      sources: ['wiki_tui_na'] },
    { id: 'na', color: '#8ab17d', cn: '拿法 ná', en: 'Grasp (拿)', how_en: 'Lift and squeeze the soft part of the muscle or heel cord between finger and thumb.',
      steps: [['ankle','BL60',3,[0,-1]],['ankle','KI3',3,[0,-1]],['ankle','SP6',2,[0,-1]]],
      sources: ['wiki_tui_na'] },
    { id: 'nie', color: '#2a9d8f', cn: '捏法 niē', en: 'Pinch (捏)', how_en: 'Pinch the toe at its base between thumb and finger, then let go.',
      steps: [['top','SP1',3,[0,-1]],['top','LR1',3,[0,-1]],['top','ST44',2,[0,-1]]],
      sources: ['wiki_tui_na'] },
    { id: 'ca', color: '#264653', cn: '擦法 cā', en: 'Rub (擦)', how_en: 'Quick back-and-forth rubbing until the skin feels warm, not sore.',
      steps: [['sole','KI1',2,[1,0]],['top','GB41',2,[1,0]],['sole','KI1',2,[-1,0]]],
      sources: ['wiki_tui_na'] },
    { id: 'kou', color: '#c77dff', cn: '叩法 kòu', en: 'Tap (叩)', how_en: 'Light tapping with the fingertips, loose wrist, along the outside of the foot.',
      steps: [['side','BL65',2,[0,-1]],['side','BL66',2,[0,-1]],['ankle','GB40',2,[0,-1]]],
      sources: ['wiki_tui_na'] },
    { id: 'cuo', color: '#ff8fa3', cn: '搓法 cuō', en: 'Roll (搓)', how_en: 'Roll the ankle between the palms, back and forth.',
      steps: [['ankle','BL62',2,[1,0]],['ankle','SP6',2,[-1,0]],['ankle','BL62',2,[1,0]]],
      sources: ['wiki_tui_na'] }
  ]
};

/* Sources the app links to. Only well-known sites. Add more as they are checked. */
MM.sources = {
  wiki_tui_na: { label: 'Tui na (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Tui_na' },
  umn_tui_na:  { label: 'Tui na, UMN Taking Charge', url: 'https://www.takingcharge.csh.umn.edu/tui-na' },
  trial_table: { label: 'Acupuncture point locations (trial protocol table)', url: 'https://trialsjournal.biomedcentral.com/articles/10.1186/1745-6215-12-173/tables/1' },
  who_std:     { label: 'WHO standard acupuncture point locations (Western Pacific; mirror copy)', url: 'https://medbox.org/document/who-standard-acupuncture-point-locations-in-the-western-pacific-region' }
};

/* Interface words */
MM.ui = {
  en: {
    tag: 'This is massage, not medicine.',
    map: 'Body map', learn: 'Learn', anat: 'Body layers', favs: 'Favourites',
    view: 'View', technique: 'Technique', pick: 'Pick a technique', none: 'Tap a point to see where it is.',
    play: 'Play', back: 'Back to start', speed: 'Speed', compare: 'Compare two', colour: 'Colour by technique',
    heat: 'Heat', numbers: 'Show numbers 1 to 5', kids: 'Show children’s figures', kidsNote: 'Not drawn yet.',
    who: 'Who is rating', lang: 'Language', autoplay: 'Autoplay twice, then pause',
    errors: 'Show errors', noErrors: 'No problems so far.', notes: 'Notes for improvement',
    saveNote: 'Save note', open: 'Open', all: 'All', noteHint: 'What would make this better?',
    db: 'Family database', dbLocal: 'This device only.', close: 'Close', settings: 'Settings',
    howto: 'How to read this', stars: 'stars', average: 'Average', rated: 'Ratings saved on this device.',
    heatKey: 'Pale = light, deep red = firm. Numbers: 1 light, 5 firm.',
    loopNote: 'The film loops every 20 seconds.', pausedNote: 'Paused. Tap ▶ to play again.',
    sources: 'Sources', noSources: 'Sources not gathered yet.', hand: 'Hand'
  },
  cn: {
    tag: '这是按摩，不是医疗。',
    map: '身体图', learn: '学习', anat: '身体层次', favs: '喜好',
    view: '部位', technique: '手法', pick: '选一种手法', none: '点一个穴位看它在哪里。',
    play: '播放', back: '回到开头', speed: '速度', compare: '对比两种', colour: '按手法上色',
    heat: '热力', numbers: '显示 1 到 5 力度', kids: '显示小朋友的图', kidsNote: '尚未画。',
    who: '谁在打分', lang: '语言', autoplay: '自动播两次，再停',
    errors: '显示错误', noErrors: '目前没有问题。', notes: '改进意见',
    saveNote: '保存意见', open: '未完成', all: '全部', noteHint: '哪里可以更好？',
    db: '家庭数据库', dbLocal: '只在这台设备上。', close: '关闭', settings: '设置',
    howto: '怎么看', stars: '星', average: '平均', rated: '评分保存在这台设备上。',
    heatKey: '浅色 = 轻，深红 = 重。数字：1 轻，5 重。',
    loopNote: '动画每 20 秒循环一次。', pausedNote: '已停止。按 ▶ 再播。',
    sources: '资料来源', noSources: '资料尚未整理。', hand: '手'
  }
};
