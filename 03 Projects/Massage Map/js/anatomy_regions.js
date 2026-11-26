/* Massage Map: extra body regions for the Body layers tab. Approximate textbook-style shapes.
   The top-of-foot figure is traced by eye from the public-domain 1918 Gray's plate 446. Back, face, neck,
   hand and leg are first drafts from standard anatomy and are NOT yet checked against plates. Each region: viewBox, mirrorW (width used to mirror 'both' items), items.
   Layers: 0 skin, 1 fat and fascia, 2 muscles, 3 arteries and veins, 4 nerves, 5 tendons and ligaments, 6 bones. */
(function () {
  'use strict';

  var BONE = '#f4efe1';

  var BACK_ITEMS = [
    // Skin
    { layer: 0, type: 'ellipse', cx: 150, cy: 50, rx: 29, ry: 37, side: 'mid', en: 'Head (back)', cn: '后脑', what: 'Skin of the back of the head.' },
    { layer: 0, type: 'path', d: 'M138,80 L162,80 L162,112 L138,112 Z', side: 'mid', en: 'Neck (back)', cn: '后颈', what: 'Skin of the back of the neck.' },
    { layer: 0, type: 'path', d: 'M108,104 L192,104 C210,112 218,130 216,150 C214,190 196,230 190,262 C196,290 204,320 200,344 L110,344 C106,320 104,290 110,262 C104,230 86,190 84,150 C82,130 90,112 108,104 Z', side: 'mid', en: 'Back', cn: '背部', what: 'Skin of the back.' },
    { layer: 0, type: 'path', d: 'M86,122 C72,130 66,160 62,200 L54,262 C52,300 48,330 52,362 L60,400 L72,400 C74,370 76,340 78,300 L82,250 C88,210 96,170 100,140 Z', side: 'both', en: 'Arm (back)', cn: '后臂', what: 'Skin of the back of the arm.' },
    { layer: 0, type: 'path', d: 'M110,344 C104,380 104,420 108,460 C110,490 112,500 116,520 C112,560 112,600 116,612 L100,616 L96,640 L124,640 L130,616 C136,600 140,560 142,520 C144,480 146,440 148,400 L150,344 Z', side: 'both', en: 'Leg and foot (back)', cn: '后腿与脚', what: 'Skin of the back of the leg and foot.' },
    // Fat
    { layer: 1, type: 'path', d: 'M112,112 L188,112 C200,120 206,134 204,150 C202,186 186,226 182,260 C188,288 194,316 190,336 L120,336 C116,316 112,288 118,260 C114,226 98,186 96,150 C94,134 100,120 112,112 Z', side: 'mid', en: 'Back fat', cn: '背部脂肪', what: 'Fat under the skin of the back.', inset: true },
    // Muscles
    { layer: 2, type: 'path', d: 'M150,104 C132,108 114,118 110,140 C118,176 130,200 150,236 Z', side: 'both', en: 'Trapezius', cn: '斜方肌', what: 'Large back muscle from the skull to the shoulder blade. Lifts and turns the shoulder blade.' },
    { layer: 2, type: 'path', d: 'M112,160 C124,200 132,240 146,268 L150,250 C140,220 132,190 124,150 Z', side: 'both', en: 'Latissimus dorsi', cn: '背阔肌', what: 'Broad muscle of the lower back. Pulls the arm down and back.' },
    { layer: 2, type: 'ellipse', cx: 136, cy: 220, rx: 8, ry: 70, side: 'both', en: 'Erector spinae', cn: '竖脊肌', what: 'Long muscles beside the spine. Keep the back upright.' },
    { layer: 2, type: 'ellipse', cx: 96, cy: 128, rx: 16, ry: 18, side: 'both', en: 'Deltoid (back)', cn: '三角肌后束', what: 'Back of the shoulder. Pulls the arm back.' },
    { layer: 2, type: 'ellipse', cx: 78, cy: 200, rx: 9, ry: 30, side: 'both', en: 'Triceps brachii', cn: '肱三头肌', what: 'Back of the upper arm. Straightens the elbow.' },
    { layer: 2, type: 'ellipse', cx: 124, cy: 330, rx: 26, ry: 22, side: 'both', en: 'Gluteus maximus', cn: '臀大肌', what: 'Buttock muscle. Extends the hip.' },
    { layer: 2, type: 'ellipse', cx: 120, cy: 430, rx: 16, ry: 58, side: 'both', en: 'Hamstrings', cn: '腘绳肌', what: 'Back of the thigh. Bends the knee and extends the hip.' },
    { layer: 2, type: 'ellipse', cx: 118, cy: 556, rx: 18, ry: 42, side: 'both', en: 'Gastrocnemius (calf, back)', cn: '腓肠肌', what: 'Calf muscle. Points the foot and bends the knee.' },
    // Arteries and veins
    { layer: 3, type: 'line', d: 'M122,470 C120,500 118,520 116,540', side: 'both', stroke: '#c0392b', width: 2.5, en: 'Popliteal artery', cn: '腘动脉', what: 'Artery behind the knee.' },
    // Nerves
    { layer: 4, type: 'line', d: 'M136,330 C132,400 126,450 122,500', side: 'both', stroke: '#e0a800', width: 3, en: 'Sciatic nerve', cn: '坐骨神经', what: 'Largest nerve of the body. Runs down the back of the leg.' },
    { layer: 4, type: 'line', d: 'M120,500 C118,540 116,580 116,612', side: 'both', stroke: '#e0a800', width: 2.5, en: 'Tibial nerve', cn: '胫神经', what: 'Nerve down the back of the lower leg, into the sole.' },
    // Tendons and ligaments
    { layer: 5, type: 'line', d: 'M140,240 C128,262 120,300 116,330', side: 'both', stroke: '#6d5fa3', width: 3, en: 'Thoracolumbar fascia', cn: '胸腰筋膜', what: 'Tough sheet of tissue over the lower back muscles.' },
    { layer: 5, type: 'line', d: 'M118,572 L116,608', side: 'both', stroke: '#6d5fa3', width: 4, en: 'Achilles tendon', cn: '跟腱', what: 'Strong tendon from the calf to the heel bone.' },
    // Bones
    { layer: 6, type: 'line', d: 'M150,96 L150,300', side: 'mid', stroke: '#8a8070', width: 6, en: 'Spine', cn: '脊柱', what: 'Column of vertebrae that carries the head and trunk.' },
    { layer: 6, type: 'path', d: 'M120,130 L140,128 L138,190 L118,176 Z', side: 'both', fill: BONE, en: 'Shoulder blade (scapula)', cn: '肩胛骨', what: 'Flat bone of the upper back.' },
    { layer: 6, type: 'ellipse', cx: 150, cy: 320, rx: 42, ry: 22, side: 'mid', fill: BONE, en: 'Pelvis (back)', cn: '骨盆', what: 'Hip bones seen from behind.' },
    { layer: 6, type: 'line', d: 'M110,340 C112,400 114,460 116,500', side: 'both', stroke: BONE, width: 9, en: 'Femur', cn: '股骨', what: 'Thigh bone.' },
    { layer: 6, type: 'line', d: 'M116,520 C114,560 112,590 110,612', side: 'both', stroke: BONE, width: 7, en: 'Tibia', cn: '胫骨', what: 'Shin bone.' }
  ];

  var FACE_ITEMS = [
    { layer: 0, type: 'path', d: 'M100,10 C140,10 160,40 160,100 C160,150 146,200 124,222 C114,232 86,232 76,222 C54,200 40,150 40,100 C40,40 60,10 100,10 Z', side: 'mid', en: 'Face skin', cn: '面部皮肤', what: 'Skin of the face.' },
    { layer: 1, type: 'ellipse', cx: 70, cy: 130, rx: 14, ry: 18, side: 'both', fill: '#f9e7a0', en: 'Cheek fat', cn: '颊部脂肪', what: 'Fat of the cheek.' },
    { layer: 2, type: 'ellipse', cx: 64, cy: 170, rx: 14, ry: 22, side: 'both', en: 'Masseter', cn: '咬肌', what: 'Chewing muscle at the jaw. Strongest muscle for closing the mouth.' },
    { layer: 2, type: 'path', d: 'M60,60 C52,90 56,120 66,128 C72,110 74,80 70,60 Z', side: 'both', en: 'Temporalis', cn: '颞肌', what: 'Fan-shaped chewing muscle over the temple.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 190, rx: 18, ry: 6, side: 'mid', en: 'Orbicularis oris', cn: '口轮匝肌', what: 'Ring muscle around the mouth.' },
    { layer: 2, type: 'line', d: 'M70,150 C82,170 88,176 96,180', side: 'both', stroke: '#d86b6b', width: 4, en: 'Zygomaticus', cn: '颧肌', what: 'Muscle from the cheekbone to the mouth corner. Lifts the mouth for a smile.' },
    { layer: 2, type: 'ellipse', cx: 74, cy: 186, rx: 10, ry: 14, side: 'both', en: 'Buccinator', cn: '颊肌', what: 'Cheek muscle that holds food between the teeth.' },
    { layer: 3, type: 'line', d: 'M70,204 C80,190 86,170 96,182', side: 'both', stroke: '#c0392b', width: 2.5, en: 'Facial artery', cn: '面动脉', what: 'Artery of the lower face.' },
    { layer: 3, type: 'line', d: 'M62,40 C58,70 60,100 64,128', side: 'both', stroke: '#c0392b', width: 2, en: 'Superficial temporal artery', cn: '颞浅动脉', what: 'Artery over the temple. Can be felt just in front of the ear.' },
    { layer: 4, type: 'line', d: 'M58,160 C74,172 84,180 100,192', side: 'both', stroke: '#e0a800', width: 2, en: 'Facial nerve branches', cn: '面神经分支', what: 'Nerves that move the face.' },
    { layer: 4, type: 'line', d: 'M80,120 C86,140 90,150 100,160', side: 'both', stroke: '#e0a800', width: 2, en: 'Infraorbital nerve', cn: '眶下神经', what: 'Sensory nerve under the eye.' },
    { layer: 5, type: 'line', d: 'M56,146 C62,144 68,146 74,150', side: 'both', stroke: '#6d5fa3', width: 2.5, en: 'Jaw joint ligament', cn: '颞下颌韧带', what: 'Ligament of the jaw joint, just in front of the ear.' },
    { layer: 6, type: 'path', d: 'M100,14 C134,14 150,40 150,96 C150,140 138,176 120,196 L80,196 C62,176 50,140 50,96 C50,40 66,14 100,14 Z', side: 'mid', fill: BONE, en: 'Skull', cn: '颅骨', what: 'Bones of the head.' },
    { layer: 6, type: 'path', d: 'M70,196 C70,214 84,226 100,226 C116,226 130,214 130,196', side: 'mid', stroke: BONE, width: 5, en: 'Jaw bone (mandible)', cn: '下颌骨', what: 'Lower jaw bone.' },
    { layer: 6, type: 'line', d: 'M56,108 C66,104 74,110 82,118', side: 'both', stroke: BONE, width: 4, en: 'Cheekbone (zygomatic)', cn: '颧骨', what: 'Cheekbone.' }
  ];

  var NECK_ITEMS = [
    { layer: 0, type: 'path', d: 'M70,20 C80,60 70,80 60,110 C48,140 40,170 40,240 L160,240 C160,170 152,140 140,110 C130,80 120,60 130,20 Z', side: 'mid', en: 'Neck skin', cn: '颈部皮肤', what: 'Skin of the neck.' },
    { layer: 2, type: 'path', d: 'M96,60 C80,80 64,110 60,150 L70,152 C78,118 92,88 104,66 Z', side: 'both', en: 'Sternocleidomastoid', cn: '胸锁乳突肌', what: 'Strap muscle of the neck. Turns the head and tilts it sideways.' },
    { layer: 2, type: 'path', d: 'M70,150 C90,160 110,170 124,180 L118,196 C100,186 84,176 66,166 Z', side: 'both', en: 'Trapezius (neck)', cn: '斜方肌（颈）', what: 'Upper back and neck muscle. Lifts the shoulder.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 180, rx: 10, ry: 40, side: 'mid', en: 'Neck strap muscles', cn: '颈带状肌', what: 'Muscles in front of the windpipe. Help the jaw and voice box move.' },
    { layer: 3, type: 'line', d: 'M96,100 C88,130 84,170 84,220', side: 'both', stroke: '#c0392b', width: 4, en: 'Common carotid artery', cn: '颈总动脉', what: 'Main artery to the head and face. Can be felt beside the windpipe.' },
    { layer: 3, type: 'line', d: 'M104,100 C98,130 96,170 96,220', side: 'both', stroke: '#2e6fb0', width: 3, en: 'Internal jugular vein', cn: '颈内静脉', what: 'Vein that drains blood from the head.' },
    { layer: 4, type: 'line', d: 'M90,100 C84,130 82,170 84,224', side: 'both', stroke: '#e0a800', width: 1.8, en: 'Vagus nerve', cn: '迷走神经', what: 'Long nerve from the brain to the chest and belly.' },
    { layer: 5, type: 'line', d: 'M100,140 L100,220', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Anterior longitudinal ligament', cn: '前纵韧带', what: 'Ligament along the front of the spine.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 92, rx: 12, ry: 4, side: 'mid', fill: BONE, en: 'Hyoid bone', cn: '舌骨', what: 'U-shaped bone above the voice box. Holds the tongue base.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 110, rx: 10, ry: 14, side: 'mid', fill: '#e8e0cc', en: 'Voice box (larynx)', cn: '喉', what: 'Cartilage that houses the vocal cords.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 150, rx: 14, ry: 8, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 172, rx: 14, ry: 8, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 194, rx: 14, ry: 8, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 216, rx: 14, ry: 8, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' }
  ];

  var HAND_ITEMS = [
    { layer: 0, type: 'ellipse', cx: 70, cy: 110, rx: 30, ry: 44, side: 'mid', en: 'Palm skin', cn: '掌部皮肤', what: 'Skin of the palm.' },
    { layer: 0, type: 'ellipse', cx: 46, cy: 40, rx: 8, ry: 24, side: 'mid', en: 'Finger skin', cn: '手指皮肤', what: 'Skin of the fingers.' },
    { layer: 0, type: 'ellipse', cx: 60, cy: 22, rx: 7, ry: 22, side: 'mid', en: 'Finger skin', cn: '手指皮肤', what: 'Skin of the fingers.' },
    { layer: 0, type: 'ellipse', cx: 74, cy: 16, rx: 7, ry: 22, side: 'mid', en: 'Finger skin', cn: '手指皮肤', what: 'Skin of the fingers.' },
    { layer: 0, type: 'ellipse', cx: 88, cy: 22, rx: 7, ry: 20, side: 'mid', en: 'Finger skin', cn: '手指皮肤', what: 'Skin of the fingers.' },
    { layer: 0, type: 'ellipse', cx: 28, cy: 96, rx: 9, ry: 24, side: 'mid', en: 'Thumb skin', cn: '拇指皮肤', what: 'Skin of the thumb.' },
    { layer: 2, type: 'ellipse', cx: 40, cy: 104, rx: 10, ry: 20, side: 'mid', en: 'Thenar muscles', cn: '鱼际肌', what: 'Muscles at the base of the thumb. Move the thumb.' },
    { layer: 2, type: 'ellipse', cx: 98, cy: 112, rx: 8, ry: 20, side: 'mid', en: 'Hypothenar muscles', cn: '小鱼际肌', what: 'Muscles of the little finger side of the palm.' },
    { layer: 2, type: 'ellipse', cx: 70, cy: 96, rx: 14, ry: 26, side: 'mid', en: 'Palm muscles (lumbricals and interossei)', cn: '蚓状肌与骨间肌', what: 'Small muscles between the bones of the hand. Bend the knuckles and straighten the fingers.' },
    { layer: 3, type: 'line', d: 'M46,170 C48,140 50,120 52,100', side: 'mid', stroke: '#c0392b', width: 2.5, en: 'Radial artery', cn: '桡动脉', what: 'Artery of the thumb side of the wrist. Felt for a pulse at the wrist.' },
    { layer: 3, type: 'line', d: 'M90,170 C92,140 94,120 94,96', side: 'mid', stroke: '#c0392b', width: 2.5, en: 'Ulnar artery', cn: '尺动脉', what: 'Artery of the little finger side of the wrist.' },
    { layer: 4, type: 'line', d: 'M52,160 C56,130 58,100 60,70', side: 'mid', stroke: '#e0a800', width: 2.2, en: 'Median nerve', cn: '正中神经', what: 'Nerve into the hand. Feels the thumb and first fingers.' },
    { layer: 4, type: 'line', d: 'M96,160 C94,130 92,100 88,70', side: 'mid', stroke: '#e0a800', width: 2.2, en: 'Ulnar nerve', cn: '尺神经', what: 'Nerve into the hand. Feels the little and ring fingers.' },
    { layer: 5, type: 'line', d: 'M58,60 C60,100 62,120 62,130', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Flexor tendons', cn: '屈肌腱', what: 'Tendons that bend the fingers. Run from the forearm into the fingers.' },
    { layer: 5, type: 'line', d: 'M70,60 C70,100 70,120 70,130', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Flexor tendons', cn: '屈肌腱', what: 'Tendons that bend the fingers.' },
    { layer: 5, type: 'line', d: 'M80,60 C78,100 76,120 76,130', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Flexor tendons', cn: '屈肌腱', what: 'Tendons that bend the fingers.' },
    { layer: 6, type: 'ellipse', cx: 70, cy: 150, rx: 24, ry: 14, side: 'mid', fill: BONE, en: 'Wrist bones (carpals)', cn: '腕骨', what: 'Small bones of the wrist.' },
    { layer: 6, type: 'line', d: 'M60,140 L58,96', side: 'mid', stroke: BONE, width: 4, en: 'Metacarpals', cn: '掌骨', what: 'Long bones of the palm.' },
    { layer: 6, type: 'line', d: 'M70,140 L70,92', side: 'mid', stroke: BONE, width: 4, en: 'Metacarpals', cn: '掌骨', what: 'Long bones of the palm.' },
    { layer: 6, type: 'line', d: 'M80,140 L82,96', side: 'mid', stroke: BONE, width: 4, en: 'Metacarpals', cn: '掌骨', what: 'Long bones of the palm.' },
    { layer: 6, type: 'line', d: 'M90,140 L94,100', side: 'mid', stroke: BONE, width: 4, en: 'Metacarpals', cn: '掌骨', what: 'Long bones of the palm.' }
  ];

  var LEG_ITEMS = [
    { layer: 0, type: 'path', d: 'M80,0 L120,0 L124,60 C126,120 128,160 130,220 C132,280 130,330 126,360 C124,380 124,396 126,410 L104,410 C102,390 100,370 98,340 C94,300 88,260 84,220 C80,170 76,120 78,60 Z', side: 'mid', en: 'Leg skin', cn: '腿部皮肤', what: 'Skin of the front of the leg.' },
    { layer: 2, type: 'ellipse', cx: 100, cy: 120, rx: 22, ry: 66, side: 'mid', en: 'Quadriceps', cn: '股四头肌', what: 'Front of the thigh. Straightens the knee.' },
    { layer: 2, type: 'line', d: 'M116,70 C112,120 108,160 102,200', side: 'mid', stroke: '#d86b6b', width: 6, en: 'Sartorius', cn: '缝匠肌', what: 'Long thin muscle across the front of the thigh. Bends the hip and knee.' },
    { layer: 2, type: 'ellipse', cx: 88, cy: 110, rx: 9, ry: 46, side: 'mid', en: 'Adductor muscles', cn: '内收肌群', what: 'Inner thigh muscles. Pull the legs together.' },
    { layer: 2, type: 'ellipse', cx: 96, cy: 300, rx: 9, ry: 40, side: 'mid', en: 'Tibialis anterior', cn: '胫骨前肌', what: 'Front of the shin. Lifts the foot up at the ankle.' },
    { layer: 2, type: 'ellipse', cx: 110, cy: 310, rx: 7, ry: 34, side: 'mid', en: 'Peroneus longus', cn: '腓骨长肌', what: 'Outer shin muscle. Turns the foot outward.' },
    { layer: 2, type: 'ellipse', cx: 122, cy: 340, rx: 9, ry: 32, side: 'mid', en: 'Gastrocnemius (medial head)', cn: '腓肠肌内侧头', what: 'Calf muscle. Points the foot and bends the knee.' },
    { layer: 3, type: 'line', d: 'M92,30 C90,80 90,120 92,200', side: 'mid', stroke: '#c0392b', width: 3, en: 'Femoral artery', cn: '股动脉', what: 'Main artery of the thigh.' },
    { layer: 3, type: 'line', d: 'M98,30 C96,80 96,120 98,200', side: 'mid', stroke: '#2e6fb0', width: 3, en: 'Femoral vein', cn: '股静脉', what: 'Vein of the thigh.' },
    { layer: 3, type: 'line', d: 'M116,240 C114,290 112,330 112,400', side: 'mid', stroke: '#2e6fb0', width: 2.5, en: 'Great saphenous vein', cn: '大隐静脉', what: 'Long vein on the inside of the leg, close to the skin.' },
    { layer: 3, type: 'line', d: 'M100,220 C98,260 98,300 98,380', side: 'mid', stroke: '#c0392b', width: 2, en: 'Anterior tibial artery', cn: '胫前动脉', what: 'Artery at the front of the shin.' },
    { layer: 4, type: 'line', d: 'M106,40 C106,90 108,140 110,180', side: 'mid', stroke: '#e0a800', width: 2.5, en: 'Femoral nerve', cn: '股神经', what: 'Nerve of the front of the thigh.' },
    { layer: 4, type: 'line', d: 'M112,250 C110,290 108,330 104,370', side: 'mid', stroke: '#e0a800', width: 2.5, en: 'Common peroneal nerve', cn: '腓总神经', what: 'Nerve down the outside of the knee and shin.' },
    { layer: 5, type: 'line', d: 'M100,200 L100,228', side: 'mid', stroke: '#6d5fa3', width: 5, en: 'Patellar tendon', cn: '髌韧带', what: 'Tendon from the kneecap to the shin.' },
    { layer: 5, type: 'line', d: 'M82,50 C84,100 86,160 88,200', side: 'mid', stroke: '#6d5fa3', width: 3, en: 'Iliotibial band', cn: '髂胫束', what: 'Thick band on the outside of the thigh.' },
    { layer: 5, type: 'line', d: 'M86,214 C94,206 106,206 114,214', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Knee joint capsule', cn: '膝关节囊', what: 'Tough band around the knee joint.' },
    { layer: 6, type: 'line', d: 'M92,20 C94,80 96,140 98,200', side: 'mid', stroke: BONE, width: 9, en: 'Femur', cn: '股骨', what: 'Thigh bone.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 214, rx: 9, ry: 10, side: 'mid', fill: BONE, en: 'Kneecap (patella)', cn: '髌骨', what: 'Kneecap, sits in front of the knee joint.' },
    { layer: 6, type: 'line', d: 'M100,236 C100,290 100,340 100,396', side: 'mid', stroke: BONE, width: 8, en: 'Tibia', cn: '胫骨', what: 'Shin bone, the weight-bearing bone of the lower leg.' },
    { layer: 6, type: 'line', d: 'M110,240 C110,290 110,340 108,380', side: 'mid', stroke: BONE, width: 3, en: 'Fibula', cn: '腓骨', what: 'Thin bone beside the shin bone.' }
  ];

  var FOOT_TOP_ITEMS = [
    { layer: 0, type: 'path', d: 'M100,20 C130,20 150,45 150,85 C150,130 145,160 150,230 C155,300 150,370 120,395 C100,410 70,410 55,390 C40,370 45,300 48,230 C50,160 50,130 50,85 C50,45 70,20 100,20 Z', side: 'mid', en: 'Skin of the top of the foot', cn: '足背皮肤', what: 'Thin skin on top of the foot.' },
    { layer: 1, type: 'path', d: 'M100,30 C124,30 140,50 140,88 C140,130 136,160 140,230 C144,296 140,360 116,384 C100,398 74,398 62,382 C52,364 56,300 58,230 C60,160 60,130 60,88 C60,52 76,30 100,30 Z', side: 'mid', en: 'Fat on top of the foot', cn: '足背脂肪', what: 'Fat under the skin of the foot top.', inset: true },
    { layer: 2, type: 'ellipse', cx: 100, cy: 250, rx: 26, ry: 44, side: 'mid', en: 'Extensor digitorum brevis', cn: '趾短伸肌', what: 'Short muscle on top of the foot. Helps lift the toes.' },
    { layer: 2, type: 'ellipse', cx: 84, cy: 180, rx: 6, ry: 36, side: 'mid', en: 'Dorsal interosseous (1st)', cn: '第一背侧骨间肌', what: 'Small muscle between the first and second metatarsals.' },
    { layer: 2, type: 'ellipse', cx: 98, cy: 180, rx: 6, ry: 36, side: 'mid', en: 'Dorsal interosseous (2nd)', cn: '第二背侧骨间肌', what: 'Small muscle between the second and third metatarsals.' },
    { layer: 2, type: 'ellipse', cx: 112, cy: 180, rx: 6, ry: 34, side: 'mid', en: 'Dorsal interosseous (3rd)', cn: '第三背侧骨间肌', what: 'Small muscle between the third and fourth metatarsals.' },
    { layer: 2, type: 'ellipse', cx: 126, cy: 182, rx: 5, ry: 30, side: 'mid', en: 'Dorsal interosseous (4th)', cn: '第四背侧骨间肌', what: 'Small muscle between the fourth and fifth metatarsals.' },
    { layer: 3, type: 'line', d: 'M100,330 C100,290 100,260 100,160', side: 'mid', stroke: '#c0392b', width: 2.5, en: 'Dorsalis pedis artery', cn: '足背动脉', what: 'Artery on top of the foot. Felt for a pulse here.' },
    { layer: 4, type: 'line', d: 'M92,330 C92,290 94,260 94,160', side: 'mid', stroke: '#e0a800', width: 2, en: 'Deep peroneal nerve', cn: '腓深神经', what: 'Nerve on top of the foot, between the big toe and second toe.' },
    { layer: 5, type: 'line', d: 'M100,120 L100,236', side: 'mid', stroke: '#6d5fa3', width: 2, en: 'Extensor tendons', cn: '伸肌腱', what: 'Tendons that lift the toes. Run from the shin to the toes.' },
    { layer: 5, type: 'line', d: 'M60,330 C90,340 120,340 150,330', side: 'mid', stroke: '#6d5fa3', width: 3, en: 'Extensor retinaculum', cn: '伸肌支持带', what: 'Band across the front of the ankle that holds the tendons in place.' },
    { layer: 6, type: 'ellipse', cx: 100, cy: 300, rx: 40, ry: 30, side: 'mid', fill: BONE, en: 'Ankle and midfoot bones', cn: '踝与足中部骨', what: 'Small bones of the ankle and midfoot.' },
    { layer: 6, type: 'line', d: 'M76,240 L76,150', side: 'mid', stroke: BONE, width: 5, en: 'Metatarsals', cn: '跖骨', what: 'Long bones of the foot.' },
    { layer: 6, type: 'line', d: 'M92,240 L92,140', side: 'mid', stroke: BONE, width: 5, en: 'Metatarsals', cn: '跖骨', what: 'Long bones of the foot.' },
    { layer: 6, type: 'line', d: 'M108,240 L108,140', side: 'mid', stroke: BONE, width: 5, en: 'Metatarsals', cn: '跖骨', what: 'Long bones of the foot.' },
    { layer: 6, type: 'line', d: 'M124,240 L124,146', side: 'mid', stroke: BONE, width: 5, en: 'Metatarsals', cn: '跖骨', what: 'Long bones of the foot.' },
    { layer: 6, type: 'ellipse', cx: 124, cy: 98, rx: 22, ry: 6, side: 'mid', fill: BONE, en: 'Toe bones (phalanges)', cn: '趾骨', what: 'Bones of the toes.' }
  ];

  /* Head and neck in side profile, in the coordinates of Gray's plate 378 (public domain, 1918).
     viewBox 0 0 627 700 so the traced points can be used as drawn. Traced by eye; approximate. */
  var SIDE_ITEMS = [
    { layer: 0, type: 'path', d: 'M330,14 C420,14 500,70 520,170 C530,230 522,260 500,300 C480,340 440,370 430,400 C420,430 430,460 470,500 C520,540 540,570 560,600 L600,700 L240,700 C235,640 230,600 228,560 C228,500 222,460 210,430 C195,400 180,380 170,355 C160,340 158,320 160,300 C150,290 140,270 140,250 C130,240 128,230 130,220 C120,200 130,190 140,180 C150,150 160,120 170,100 C200,50 250,14 330,14 Z', side: 'mid', en: 'Head and neck skin (side)', cn: '头颈皮肤（侧）', what: 'Skin of the side of the head and neck.' },
    { layer: 2, type: 'ellipse', cx: 330, cy: 170, rx: 70, ry: 100, side: 'mid', en: 'Temporalis', cn: '颞肌', what: 'Fan-shaped chewing muscle over the side of the head. Closes the jaw.' },
    { layer: 2, type: 'ellipse', cx: 280, cy: 290, rx: 42, ry: 32, side: 'mid', en: 'Masseter', cn: '咬肌', what: 'Chewing muscle at the jaw corner. Strongest muscle for closing the mouth.' },
    { layer: 2, type: 'ellipse', cx: 160, cy: 292, rx: 20, ry: 10, side: 'mid', en: 'Orbicularis oris', cn: '口轮匝肌', what: 'Ring muscle around the mouth.' },
    { layer: 2, type: 'ellipse', cx: 200, cy: 300, rx: 26, ry: 20, side: 'mid', en: 'Buccinator', cn: '颊肌', what: 'Cheek muscle that holds food between the teeth.' },
    { layer: 2, type: 'line', d: 'M190,240 C180,262 176,276 170,288', side: 'mid', stroke: '#d86b6b', width: 6, en: 'Zygomaticus', cn: '颧肌', what: 'Muscle from the cheekbone to the mouth corner. Lifts the mouth for a smile.' },
    { layer: 2, type: 'line', d: 'M380,280 C340,360 300,440 262,540', side: 'mid', stroke: '#d86b6b', width: 34, en: 'Sternocleidomastoid', cn: '胸锁乳突肌', what: 'Strap muscle of the neck, from behind the ear to the collarbone. Turns and tilts the head.' },
    { layer: 2, type: 'path', d: 'M240,420 C300,470 330,560 320,700 L230,700 C220,600 226,480 240,420 Z', side: 'mid', en: 'Platysma', cn: '颈阔肌', what: 'Thin sheet of muscle over the front and side of the neck.' },
    { layer: 2, type: 'line', d: 'M520,300 C540,400 550,500 560,600', side: 'mid', stroke: '#d86b6b', width: 30, en: 'Trapezius (side)', cn: '斜方肌（侧）', what: 'Large muscle of the back of the neck and shoulder.' },
    { layer: 3, type: 'line', d: 'M360,320 C350,400 350,470 340,560', side: 'mid', stroke: '#2e6fb0', width: 8, en: 'External jugular vein', cn: '颈外静脉', what: 'Vein running down the side of the neck. Visible under the skin.' },
    { layer: 3, type: 'line', d: 'M170,300 C180,270 200,250 220,240', side: 'mid', stroke: '#c0392b', width: 3, en: 'Facial artery', cn: '面动脉', what: 'Artery of the lower face.' },
    { layer: 4, type: 'line', d: 'M180,240 C230,260 250,280 280,300', side: 'mid', stroke: '#e0a800', width: 3, en: 'Facial nerve branches', cn: '面神经分支', what: 'Nerves that move the face.' },
    { layer: 4, type: 'line', d: 'M170,200 C200,220 220,230 240,240', side: 'mid', stroke: '#e0a800', width: 2, en: 'Infraorbital nerve', cn: '眶下神经', what: 'Sensory nerve under the eye.' },
    { layer: 5, type: 'line', d: 'M320,260 L342,250', side: 'mid', stroke: '#6d5fa3', width: 4, en: 'Jaw joint ligament', cn: '颞下颌韧带', what: 'Ligament of the jaw joint, just in front of the ear.' },
    { layer: 6, type: 'path', d: 'M300,40 C400,30 490,100 500,190 C505,240 495,260 470,280 L330,280 C300,260 280,240 260,220 C240,190 240,120 300,40 Z', side: 'mid', fill: BONE, en: 'Skull (side)', cn: '颅骨（侧）', what: 'Bones of the head seen from the side.' },
    { layer: 6, type: 'line', d: 'M170,350 C200,384 240,380 280,330', side: 'mid', stroke: BONE, width: 14, en: 'Jaw bone (mandible)', cn: '下颌骨', what: 'Lower jaw bone.' },
    { layer: 6, type: 'line', d: 'M220,220 C260,210 300,220 340,240', side: 'mid', stroke: BONE, width: 10, en: 'Cheekbone arch (zygomatic)', cn: '颧弓', what: 'Bony arch of the cheek, a landmark for the temple.' },
    { layer: 6, type: 'ellipse', cx: 380, cy: 520, rx: 26, ry: 16, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' },
    { layer: 6, type: 'ellipse', cx: 400, cy: 580, rx: 26, ry: 16, side: 'mid', fill: BONE, en: 'Neck vertebrae', cn: '颈椎', what: 'Stacked vertebrae of the neck.' }
  ];

  window.MM_EXTRA_REGIONS = [
    { id: 'back', en: 'Back', cn: '背部', vb: '0 0 300 650', mirrorW: 300, items: BACK_ITEMS },
    { id: 'head-side', en: 'Head and neck (side)', cn: '头颈（侧）', vb: '0 0 627 700', mirrorW: 627, items: SIDE_ITEMS },
    { id: 'face', en: 'Face', cn: '面部', vb: '0 0 200 240', mirrorW: 200, items: FACE_ITEMS },
    { id: 'neck', en: 'Neck', cn: '颈部', vb: '0 0 200 260', mirrorW: 200, items: NECK_ITEMS },
    { id: 'hand', en: 'Hand (palm)', cn: '手掌', vb: '0 0 140 180', mirrorW: 140, items: HAND_ITEMS },
    { id: 'legs', en: 'Leg (front)', cn: '腿部（前）', vb: '0 0 200 420', mirrorW: 200, items: LEG_ITEMS },
    { id: 'foot-top', en: 'Top of foot', cn: '足背', vb: '0 0 200 420', mirrorW: 200, items: FOOT_TOP_ITEMS }
  ];
})();
