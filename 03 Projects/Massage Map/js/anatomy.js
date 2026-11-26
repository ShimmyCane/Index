/* Massage Map: whole-body layers (female, front). Approximate textbook-style shapes.
   Coordinates are for the left side of the body (x < 150). side:'both' also draws a mirror image.
   Layers from outside in: 0 skin, 1 fat and fascia, 2 muscles, 3 arteries and veins,
   4 nerves, 5 tendons and ligaments, 6 bones. Peel removes layers from 0 upward. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var MIRROR = 'translate(300 0) scale(-1 1)';

  var LAYERS = [
    { key: 'skin',    en: 'Skin',                cn: '皮肤' },
    { key: 'fat',     en: 'Fat and fascia',      cn: '脂肪与筋膜' },
    { key: 'muscle',  en: 'Muscles',             cn: '肌肉' },
    { key: 'vessel',  en: 'Arteries and veins',  cn: '动脉与静脉' },
    { key: 'nerve',   en: 'Nerves',              cn: '神经' },
    { key: 'ligament',en: 'Tendons and ligaments', cn: '肌腱与韧带' },
    { key: 'bone',    en: 'Bones',               cn: '骨骼' }
  ];

  /* Items: {layer, type: 'path'|'ellipse'|'line', d | cx,cy,rx,ry, side, en, cn, what} */
  var ITEMS = [
    // Skin
    { layer: 0, type: 'ellipse', cx: 150, cy: 50, rx: 29, ry: 37, side: 'mid', en: 'Head and face', cn: '头面部', what: 'The outer skin of the head.' },
    { layer: 0, type: 'path', d: 'M138,80 L162,80 L162,112 L138,112 Z', side: 'mid', en: 'Neck', cn: '颈部', what: 'Skin of the neck.' },
    { layer: 0, type: 'path', d: 'M108,104 L192,104 C210,112 218,130 216,150 C214,190 196,230 190,262 C196,290 204,320 200,344 L110,344 C106,320 104,290 110,262 C104,230 86,190 84,150 C82,130 90,112 108,104 Z', side: 'mid', en: 'Trunk', cn: '躯干', what: 'Skin of the chest, belly and back.' },
    { layer: 0, type: 'path', d: 'M86,122 C72,130 66,160 62,200 L54,262 C52,300 48,330 52,362 L60,400 L72,400 C74,370 76,340 78,300 L82,250 C88,210 96,170 100,140 Z', side: 'both', en: 'Arm', cn: '手臂', what: 'Skin of the arm.' },
    { layer: 0, type: 'ellipse', cx: 56, cy: 412, rx: 11, ry: 15, side: 'both', en: 'Hand', cn: '手', what: 'Skin of the hand.' },
    { layer: 0, type: 'path', d: 'M110,344 C104,380 104,420 108,460 C110,490 112,500 116,520 C112,560 112,600 116,612 L100,616 L96,640 L124,640 L130,616 C136,600 140,560 142,520 C144,480 146,440 148,400 L150,344 Z', side: 'both', en: 'Leg and foot', cn: '腿与脚', what: 'Skin of the leg and foot.' },

    // Fat and fascia (skin shapes, inset)
    { layer: 1, type: 'path', d: 'M112,112 L188,112 C200,120 206,134 204,150 C202,186 186,226 182,260 C188,288 194,316 190,336 L120,336 C116,316 112,288 118,260 C114,226 98,186 96,150 C94,134 100,120 112,112 Z', side: 'mid', en: 'Trunk fat', cn: '躯干脂肪', what: 'Fat layer under the skin of the trunk.', inset: true },
    { layer: 1, type: 'path', d: 'M92,128 C80,136 74,164 70,200 L62,262 C60,300 56,330 60,358 L66,392 L70,392 C72,364 74,336 76,300 L80,250 C86,212 94,176 98,146 Z', side: 'both', en: 'Arm fat', cn: '手臂脂肪', what: 'Fat under the skin of the arm.', inset: true },
    { layer: 1, type: 'path', d: 'M114,350 C110,384 110,420 114,460 C116,490 118,502 120,520 C118,560 118,598 120,608 L108,610 L106,630 L122,630 L126,610 C130,596 134,560 136,520 C138,480 140,440 142,404 L144,352 Z', side: 'both', en: 'Leg fat', cn: '腿部脂肪', what: 'Fat under the skin of the leg.', inset: true },

    // Muscles
    { layer: 2, type: 'path', d: 'M150,116 C136,118 118,124 112,140 C110,160 124,176 150,180 Z', side: 'both', en: 'Pectoralis major', cn: '胸大肌', what: 'Chest muscle. Moves the arm across the body and forward.' },
    { layer: 2, type: 'ellipse', cx: 96, cy: 128, rx: 16, ry: 18, side: 'both', en: 'Deltoid', cn: '三角肌', what: 'Shoulder muscle. Lifts the arm to the side.' },
    { layer: 2, type: 'ellipse', cx: 80, cy: 196, rx: 9, ry: 28, side: 'both', en: 'Biceps brachii', cn: '肱二头肌', what: 'Front of the upper arm. Bends the elbow.' },
    { layer: 2, type: 'ellipse', cx: 62, cy: 300, rx: 9, ry: 40, side: 'both', en: 'Forearm flexors', cn: '前臂屈肌', what: 'Front of the forearm. Bends the wrist and fingers.' },
    { layer: 2, type: 'path', d: 'M128,186 L146,186 L146,298 L128,298 Z', side: 'both', en: 'Rectus abdominis', cn: '腹直肌', what: 'Belly muscle. Bends the trunk forward.' },
    { layer: 2, type: 'path', d: 'M112,200 C104,230 106,270 116,300 L124,296 C116,270 116,230 124,200 Z', side: 'both', en: 'External oblique', cn: '腹外斜肌', what: 'Side of the belly. Turns and bends the trunk.' },
    { layer: 2, type: 'ellipse', cx: 118, cy: 410, rx: 18, ry: 66, side: 'both', en: 'Quadriceps', cn: '股四头肌', what: 'Front of the thigh. Straightens the knee.' },
    { layer: 2, type: 'ellipse', cx: 118, cy: 556, rx: 9, ry: 40, side: 'both', en: 'Tibialis anterior', cn: '胫骨前肌', what: 'Front of the shin. Lifts the foot up at the ankle.' },
    { layer: 2, type: 'ellipse', cx: 136, cy: 556, rx: 8, ry: 30, side: 'both', en: 'Gastrocnemius (calf)', cn: '腓肠肌', what: 'Calf muscle. Points the foot and bends the knee.' },
    { layer: 2, type: 'path', d: 'M98,616 L124,616 L122,628 L100,628 Z', side: 'both', en: 'Extensor digitorum', cn: '趾长伸肌', what: 'Top of the foot. Lifts the toes.' },

    // Arteries and veins
    { layer: 3, type: 'line', d: 'M136,352 C134,400 132,440 130,480', side: 'both', stroke: '#d98a7e', width: 3, en: 'Femoral artery', cn: '股动脉', what: 'Main artery of the thigh. Carries blood to the leg.' },
    { layer: 3, type: 'line', d: 'M142,352 C140,400 138,440 136,480', side: 'both', stroke: '#7fa7c9', width: 3, en: 'Femoral vein', cn: '股静脉', what: 'Vein of the thigh. Carries blood back to the heart.' },
    { layer: 3, type: 'line', d: 'M120,502 C118,540 120,570 116,604', side: 'both', stroke: '#7fa7c9', width: 2.5, en: 'Great saphenous vein', cn: '大隐静脉', what: 'Long vein on the inside of the leg, close to the skin.' },
    { layer: 3, type: 'line', d: 'M128,512 C124,540 126,580 122,606', side: 'both', stroke: '#d98a7e', width: 2, en: 'Anterior tibial artery', cn: '胫前动脉', what: 'Artery at the front of the shin. Feeds the top of the foot.' },
    { layer: 3, type: 'line', d: 'M84,160 C76,200 70,230 68,260', side: 'both', stroke: '#d98a7e', width: 2.5, en: 'Brachial artery', cn: '肱动脉', what: 'Main artery of the upper arm.' },

    // Nerves
    { layer: 4, type: 'line', d: 'M120,352 C122,400 124,440 122,488', side: 'both', stroke: '#e6c46a', width: 2.5, en: 'Femoral nerve', cn: '股神经', what: 'Nerve of the front of the thigh. Powers the quadriceps.' },
    { layer: 4, type: 'line', d: 'M134,500 C130,530 126,560 124,600', side: 'both', stroke: '#e6c46a', width: 2.5, en: 'Common peroneal nerve', cn: '腓总神经', what: 'Nerve running down the outside of the knee and shin.' },
    { layer: 4, type: 'line', d: 'M122,540 C118,570 112,600 108,616', side: 'both', stroke: '#e6c46a', width: 2, en: 'Superficial peroneal nerve', cn: '腓浅神经', what: 'Nerve to the top of the foot and toes.' },
    { layer: 4, type: 'line', d: 'M84,170 C76,200 68,230 66,252', side: 'both', stroke: '#e6c46a', width: 2, en: 'Radial nerve', cn: '桡神经', what: 'Nerve of the back of the upper arm and forearm.' },
    { layer: 4, type: 'line', d: 'M68,262 C64,300 58,330 56,358', side: 'both', stroke: '#e6c46a', width: 2, en: 'Median nerve', cn: '正中神经', what: 'Nerve down the front of the forearm into the hand.' },

    // Tendons and ligaments
    { layer: 5, type: 'line', d: 'M122,498 L122,516', side: 'both', stroke: '#a79bcc', width: 4, en: 'Patellar tendon', cn: '髌韧带', what: 'Tendon from the kneecap to the shin. Passes the quadriceps pull to the leg.' },
    { layer: 5, type: 'line', d: 'M104,340 C122,350 140,352 150,350', side: 'both', stroke: '#a79bcc', width: 3, en: 'Inguinal ligament', cn: '腹股沟韧带', what: 'Band at the front of the hip, from the belly to the thigh.' },
    { layer: 5, type: 'line', d: 'M96,604 C104,608 118,608 128,604', side: 'both', stroke: '#a79bcc', width: 3, en: 'Extensor retinaculum', cn: '伸肌支持带', what: 'Band across the front of the ankle that holds the tendons in place.' },
    { layer: 5, type: 'line', d: 'M110,428 C118,424 124,424 130,428', side: 'both', stroke: '#a79bcc', width: 2, en: 'Knee joint capsule', cn: '膝关节囊', what: 'Tough band around the knee joint.' },

    // Bones
    { layer: 6, type: 'ellipse', cx: 150, cy: 48, rx: 24, ry: 30, side: 'mid', fill: '#f6f1e4', en: 'Skull', cn: '颅骨', what: 'Bones of the head.' },
    { layer: 6, type: 'line', d: 'M150,96 L150,300', side: 'mid', stroke: '#b7ad98', width: 6, en: 'Spine', cn: '脊柱', what: 'Column of vertebrae that carries the head and trunk.' },
    { layer: 6, type: 'line', d: 'M150,112 L112,106', side: 'both', stroke: '#b7ad98', width: 3, en: 'Clavicle', cn: '锁骨', what: 'Collar bone, joins the arm to the trunk.' },
    { layer: 6, type: 'ellipse', cx: 150, cy: 180, rx: 32, ry: 48, side: 'mid', fill: '#f6f1e4', en: 'Ribcage', cn: '胸廓', what: 'Ribs and breastbone. Protects the heart and lungs.' },
    { layer: 6, type: 'path', d: 'M108,300 C112,330 130,340 150,342 C170,340 188,330 192,300 L184,296 C176,318 164,324 150,324 C136,324 124,318 116,296 Z', side: 'mid', fill: '#f6f1e4', en: 'Pelvis', cn: '骨盆', what: 'Hip bones. Joins the legs to the trunk.' },
    { layer: 6, type: 'line', d: 'M110,340 C112,400 114,460 116,500', side: 'both', stroke: '#f6f1e4', width: 9, en: 'Femur', cn: '股骨', what: 'Thigh bone, the longest bone in the body.' },
    { layer: 6, type: 'line', d: 'M86,122 C78,160 70,210 64,250', side: 'both', stroke: '#f6f1e4', width: 7, en: 'Humerus', cn: '肱骨', what: 'Upper arm bone.' },
    { layer: 6, type: 'line', d: 'M64,256 C60,300 58,340 56,362', side: 'both', stroke: '#f6f1e4', width: 5, en: 'Radius and ulna', cn: '桡骨与尺骨', what: 'Forearm bones.' },
    { layer: 6, type: 'line', d: 'M116,520 C114,560 112,590 110,612', side: 'both', stroke: '#f6f1e4', width: 7, en: 'Tibia', cn: '胫骨', what: 'Shin bone, the weight-bearing bone of the lower leg.' },
    { layer: 6, type: 'line', d: 'M124,520 C122,560 122,590 120,606', side: 'both', stroke: '#f6f1e4', width: 3, en: 'Fibula', cn: '腓骨', what: 'Thin bone beside the shin bone.' },
    { layer: 6, type: 'ellipse', cx: 110, cy: 626, rx: 14, ry: 8, side: 'both', fill: '#f6f1e4', en: 'Foot bones', cn: '足骨', what: 'Ankle, heel and toe bones.' }
  ];


  /* Sole of the foot (right foot, sole view, toes at top), drawn from the 1918 Gray's plate 444
     (public domain) by eye. Positions approximate; viewBox 0 0 200 420. Medial (big toe) is on the left. */
  var FOOT_ITEMS = [
    { layer: 0, type: 'path', d: 'M100,20 C130,20 150,45 150,85 C150,130 145,160 150,230 C155,300 150,370 120,395 C100,410 70,410 55,390 C40,370 45,300 48,230 C50,160 50,130 50,85 C50,45 70,20 100,20 Z', side: 'mid', en: 'Skin of the sole', cn: '足底皮肤', what: 'Thick skin of the sole.' },
    { layer: 1, type: 'path', d: 'M100,30 C124,30 140,50 140,88 C140,130 136,160 140,230 C144,296 140,360 116,384 C100,398 74,398 62,382 C52,364 56,300 58,230 C60,160 60,130 60,88 C60,52 76,30 100,30 Z', side: 'mid', en: 'Plantar fat pad', cn: '足底脂肪垫', what: 'Fat pad that cushions the sole.' },
    { layer: 2, type: 'ellipse', cx: 70, cy: 250, rx: 9, ry: 58, side: 'mid', en: 'Abductor hallucis', cn: '拇展肌', what: 'Muscle of the inner sole. Moves the big toe away from the others.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 262, rx: 22, ry: 58, side: 'mid', en: 'Quadratus plantae', cn: '足底方肌', what: 'Large square muscle in the middle of the sole. Helps the long toe tendons pull straight.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 196, rx: 28, ry: 14, side: 'mid', en: 'Flexor digitorum brevis', cn: '趾短屈肌', what: 'Muscle of the front of the sole. Bends the middle toes.' },
    { layer: 2, type: 'ellipse', cx: 134, cy: 262, rx: 8, ry: 44, side: 'mid', en: 'Abductor digiti minimi', cn: '小趾展肌', what: 'Muscle of the outer sole. Moves the little toe.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 128, rx: 52, ry: 14, side: 'mid', en: 'Toe pads', cn: '趾腹', what: 'The fleshy pads under the toes.' },
    { layer: 3, type: 'line', d: 'M98,350 C94,300 92,250 90,120', side: 'mid', stroke: '#d98a7e', width: 2, en: 'Lateral plantar artery', cn: '足底外侧动脉', what: 'Artery running along the outer sole.' },
    { layer: 4, type: 'line', d: 'M72,340 C70,290 68,230 66,100', side: 'mid', stroke: '#e6c46a', width: 2.5, en: 'Medial plantar nerve', cn: '足底内侧神经', what: 'Nerve along the inner sole. Feels the big toe and the inner toes.' },
    { layer: 4, type: 'line', d: 'M124,340 C128,290 132,230 136,120', side: 'mid', stroke: '#e6c46a', width: 2.5, en: 'Lateral plantar nerve', cn: '足底外侧神经', what: 'Nerve along the outer sole. Feels the outer toes.' },
    { layer: 5, type: 'line', d: 'M62,356 C62,300 62,200 64,70', side: 'mid', stroke: '#a79bcc', width: 3, en: 'Tendon of flexor hallucis longus', cn: '拇长屈肌腱', what: 'Tendon that bends the big toe, running along the inner sole.' },
    { layer: 5, type: 'line', d: 'M98,340 C98,280 96,200 90,80', side: 'mid', stroke: '#a79bcc', width: 2.5, en: 'Tendons of flexor digitorum longus', cn: '趾长屈肌腱', what: 'Tendons that bend the toes.' },
    { layer: 5, type: 'line', d: 'M104,340 C112,280 124,200 132,80', side: 'mid', stroke: '#a79bcc', width: 2, en: 'Plantar fascia', cn: '足底筋膜', what: 'Tough sheet of tissue along the sole. Supports the arch.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 356, rx: 24, ry: 26, side: 'mid', fill: '#f6f1e4', en: 'Heel bone (calcaneus)', cn: '跟骨', what: 'The heel bone.' },
    { layer: 6, type: 'line', d: 'M76,236 L68,130', side: 'mid', stroke: '#f6f1e4', width: 6, en: 'First metatarsal', cn: '第一跖骨', what: 'Long bone behind the big toe.' },
    { layer: 6, type: 'line', d: 'M92,226 L92,120', side: 'mid', stroke: '#f6f1e4', width: 5, en: 'Second to fourth metatarsals', cn: '第二至第四跖骨', what: 'Long bones behind the middle toes.' },
    { layer: 6, type: 'line', d: 'M128,226 L136,128', side: 'mid', stroke: '#f6f1e4', width: 5, en: 'Fifth metatarsal', cn: '第五跖骨', what: 'Long bone behind the little toe.' },
    { layer: 6, type: 'ellipse', cx: 68, cy: 92, rx: 7, ry: 14, side: 'mid', fill: '#f6f1e4', en: 'Big toe bones', cn: '拇趾骨', what: 'Bones of the big toe.' },
    { layer: 6, type: 'ellipse', cx: 124, cy: 98, rx: 22, ry: 6, side: 'mid', fill: '#f6f1e4', en: 'Toe bones (phalanges)', cn: '趾骨', what: 'Bones of the toes.' }
  ];

  /* Sole: traced skin and muscle (traced_444.js) replace the hand-drawn ones; the rest stays. */
  var T444 = (window.MM_TRACED444 && window.MM_TRACED444.paths) || null;
  var SOLE_ITEMS = T444 ? [
    { layer: 0, type: 'path', d: T444.skin, evenodd: true, side: 'mid', en: 'Skin of the sole', cn: '足底皮肤', what: 'Thick skin of the sole, traced from the plate.' },
    { layer: 2, type: 'path', d: T444['Plantar muscles (traced together)'], evenodd: true, side: 'mid', en: 'Plantar muscles (traced together)', cn: '足底肌群（合并描绘）', what: 'The muscles of the sole, traced from the plate as one group: quadratus plantae, flexor digitorum brevis, abductor hallucis and abductor digiti minimi.' }
  ].concat(FOOT_ITEMS.filter(function (i) { return i.layer >= 3; })) : FOOT_ITEMS;
  var REGION_DEFS = [
    { id: 'body', en: 'Whole body', cn: '全身', vb: '0 0 300 650', mirrorW: 300, items: ITEMS },
    { id: 'foot', en: 'Sole of foot', cn: '足底', vb: '0 0 200 420', mirrorW: 200, items: SOLE_ITEMS }
  ].concat(window.MM_EXTRA_REGIONS || []);
  var REGION = 'body';
  function def() {
    for (var i = 0; i < REGION_DEFS.length; i++) if (REGION_DEFS[i].id === REGION) return REGION_DEFS[i];
    return REGION_DEFS[0];
  }
  function items() { return def().items; }

  var state = { toggles: {}, peel: 0, selected: null, plate: false };
  LAYERS.forEach(function (l, i) { state.toggles[i] = true; });

  function el(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  var COLOURS = {
    0: { fill: '#f8e6da', stroke: '#c9a492', w: 1.5 },
    1: { fill: '#fbeed0', stroke: 'none', w: 0 },
    2: { fill: '#e9b7ad', stroke: '#b98278', w: 1 },
    3: { fill: 'none', stroke: '#d98a7e', w: 2 },
    4: { fill: 'none', stroke: '#e6c46a', w: 2 },
    5: { fill: 'none', stroke: '#a79bcc', w: 2 },
    6: { fill: '#f6f1e4', stroke: '#b7ad98', w: 1.2 }
  };

  function itemNode(item, index, lang) {
    var c = COLOURS[item.layer];
    var attrs = { 'data-i': index, 'class': 'anItem', tabindex: 0 };
    var node;
    var fill = item.fill || (item.type === 'line' ? 'none' : c.fill);
    var stroke = item.stroke || c.stroke;
    var width = item.width || c.w;
    if (item.type === 'path') node = el('path', { d: item.d, fill: fill, stroke: stroke, 'stroke-width': width });
    else if (item.type === 'ellipse') node = el('ellipse', { cx: item.cx, cy: item.cy, rx: item.rx, ry: item.ry, fill: fill, stroke: stroke, 'stroke-width': width });
    else node = el('path', { d: item.d, fill: 'none', stroke: stroke, 'stroke-width': width, 'stroke-linecap': 'round' });
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (item.layer === 1) node.setAttribute('fill-opacity', '0.5');
    if (item.layer === 2) node.setAttribute('fill-opacity', '0.8');
    if (item.evenodd) node.setAttribute('fill-rule', 'evenodd');
    if (item.inset) node.setAttribute('transform', 'translate(150 330) scale(0.96) translate(-150 -330)');
    return node;
  }

  function visibleLayer(layer) {
    return state.toggles[layer] && layer >= state.peel;
  }

  // Gray's plates as the base picture. Foot regions also get the massage points, placed by the
  // affine maps in data.js (MM.plates). Regions without points show the picture only.
  function plateFor(regionId) {
    var view = regionId === 'foot' ? 'sole' : regionId === 'foot-top' ? 'top' : null;
    if (view && MM.plates[view]) return { view: view, p: MM.plates[view], overlay: true };
    if (MM.picturePlates[regionId]) return { view: null, p: MM.picturePlates[regionId], overlay: false };
    return null;
  }
  function drawPlate(svg) {
    var info = plateFor(REGION);
    if (!info) return false;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + info.p.w + ' ' + info.p.h);
    svg.appendChild(el('image', { href: info.p.href, x: 0, y: 0, width: info.p.w, height: info.p.h, preserveAspectRatio: 'none' }));
    if (info.overlay) {
      var sc = MM.plateScale(info.view);
      var ms = MM.markers[currentLang][info.view] || {};
      Object.keys(ms).forEach(function (id) {
        var c = MM.plateMap(info.view, ms[id].x, ms[id].y);
        svg.appendChild(el('circle', { cx: c[0], cy: c[1], r: 6 * sc, fill: '#fff8e8', stroke: '#2f2a3a', 'stroke-width': 1.6 * sc }));
        var t = el('text', { x: c[0] + 9 * sc, y: c[1] + 3 * sc, 'font-size': 9 * sc, 'font-weight': 700, fill: '#2f2a3a' });
        t.textContent = currentLang === 'cn' ? id : ms[id].en;
        svg.appendChild(t);
      });
    }
    return true;
  }

  function draw(svg, lang) {
    if (state.plate && drawPlate(svg)) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // Draw bottom layer first (bones), skin last.
    for (var layer = LAYERS.length - 1; layer >= 0; layer--) {
      if (!visibleLayer(layer)) continue;
      var g = el('g', { 'data-layer': layer });
      items().forEach(function (item, idx) {
        if (item.layer !== layer) return;
        g.appendChild(itemNode(item, idx, lang));
        if (item.side === 'both') {
          var mirrored = itemNode(item, idx, lang);
          mirrored.setAttribute('transform', 'translate(' + def().mirrorW + ' 0) scale(-1 1)' + (item.inset ? ' ' + mirrored.getAttribute('transform') : ''));
          g.appendChild(mirrored);
        }
      });
      svg.appendChild(g);
    }
  }

  function describe(lang) {
    var info = document.getElementById('anatInfo');
    if (!info) return;
    info.textContent = '';
    if (state.selected == null) {
      var p = document.createElement('p');
      p.textContent = lang === 'cn' ? '点一个部位，看它的名字。' : 'Tap a part to see its name.';
      info.appendChild(p);
    } else {
      var it = items()[state.selected];
      var strong = document.createElement('strong');
      strong.textContent = lang === 'cn' ? it.cn : it.en;
      info.appendChild(strong);
      var what = document.createElement('p');
      what.className = 'note';
      what.textContent = it.what;
      info.appendChild(what);
    }
    var lbl = document.getElementById('anatPeelLabel');
    if (lbl) {
      var shown = state.peel === 0 ? (lang === 'cn' ? '全部可见' : 'All layers visible')
        : (lang === 'cn' ? '已剥掉：' : 'Peeled away: ') + LAYERS.slice(0, state.peel).map(function (l) { return lang === 'cn' ? l.cn : l.en; }).join(', ');
      lbl.textContent = shown;
    }
  }

  function buildToggles(lang) {
    var box = document.getElementById('anatToggles');
    if (!box) return;
    box.textContent = '';
    LAYERS.forEach(function (l, i) {
      var label = document.createElement('label');
      label.className = 'inline layerRow';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!state.toggles[i];
      cb.addEventListener('change', function () { state.toggles[i] = cb.checked; render(lang); });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + (lang === 'cn' ? l.cn : l.en)));
      box.appendChild(label);
    });
  }

  var currentLang = 'en';

  function render(lang) {
    if (lang) currentLang = lang;
    var pt0 = document.getElementById('anatPlateToggle');
    if (pt0) pt0.checked = !!state.plate;
    var svg = document.getElementById('anatSvg');
    if (!svg) return;
    svg.setAttribute('viewBox', def().vb);
    buildRegionButtons(lang);
    draw(svg, currentLang);
    describe(currentLang);
    buildToggles(currentLang);
    var pb = document.getElementById('anatPeel');
    if (pb) pb.textContent = currentLang === 'cn' ? '剥一层' : 'Peel one layer';
    var rb = document.getElementById('anatReset');
    if (rb) rb.textContent = currentLang === 'cn' ? '全部放回' : 'Put all back';
  }

  function wire() {
    var svg = document.getElementById('anatSvg');
    if (!svg) return;
    svg.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-i]') : null;
      if (!t) return;
      state.selected = Number(t.getAttribute('data-i'));
      render();
    });
    var pt = document.getElementById('anatPlateToggle');
    if (pt) pt.addEventListener('change', function (e) { state.plate = e.target.checked; render(); });
    var peel = document.getElementById('anatPeel');
    if (peel) peel.addEventListener('click', function () {
      state.peel = Math.min(LAYERS.length - 1, state.peel + 1);
      render();
    });
    var reset = document.getElementById('anatReset');
    if (reset) reset.addEventListener('click', function () {
      state.peel = 0;
      LAYERS.forEach(function (l, i) { state.toggles[i] = true; });
      render();
    });
  }

  function setRegion(r) { REGION = r; state.selected = null; render(); }

  function buildRegionButtons(lang) {
    var box = document.getElementById('anatRegions');
    if (!box || box.getAttribute('data-built') === lang + ':' + REGION) return;
    box.setAttribute('data-built', lang + ':' + REGION);
    box.textContent = '';
    REGION_DEFS.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (r.id === REGION ? ' regionOn' : '');
      b.setAttribute('aria-pressed', String(r.id === REGION));
      b.textContent = lang === 'cn' ? r.cn : r.en;
      b.addEventListener('click', function () { setRegion(r.id); });
      box.appendChild(b);
    });
  }

  // Body parts for the Favourites tab: muscles, bones, tendons, nerves and vessels, one key per region.
  function slug(text) { return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function structures() {
    var out = [];
    REGION_DEFS.forEach(function (def) {
      var seen = {};
      def.items.forEach(function (item) {
        if (item.layer < 2) return;
        var base = def.id + '|' + slug(item.en);
        seen[base] = (seen[base] || 0) + 1;
        out.push({
          key: seen[base] > 1 ? base + '#' + seen[base] : base,
          en: item.en, cn: item.cn || item.en,
          region: def.en, regionCn: def.cn,
          kind: LAYERS[item.layer].en
        });
      });
    });
    return out;
  }

  window.MM_ANATOMY = {structures: structures,  render: render, wire: wire, state: state, layers: LAYERS, setRegion: setRegion };
  try { wire(); render('en'); }
  catch (err) {
    var list = document.getElementById('errorList');
    if (list) { var li = document.createElement('li'); li.textContent = 'anatomy: ' + err.message; list.appendChild(li); }
  }
})();
