/* Our Family Compass: sample pieces. Placeholders drafted by Claude from the starting conversation and the framework,
   to show what each kind of piece looks like. None is the family's own story. Replace or rewrite them freely.
   Shape: id, kind (a name from OFC.kinds), room, level, forWhom, title, front, then one optional interactive part:
   choices [[label, what happens next]], steps [questions], ask (an open question the reader can answer), fill [prompts for the author].
   back: objective, lesson, ending, not. author, date. voice: path of a recording, when there is one. */
window.OFC_PIECES = [
  { id: 's-friend-cheated', kind: 'Moral game', room: 'workshop', level: 1, forWhom: 'One child', title: 'The friend who cheated',
    front: 'Your friend copied the answers on the quiz. Nobody else saw. Your friend looks at you and smiles. What now?',
    choices: [
      ['Say nothing', 'The day goes on. Your friend gets a good mark. That night it is still in your head. Was saying nothing kind, or just easy?'],
      ['Tell the teacher', 'The teacher thanks you. Your friend finds out and will not sit with you at lunch. You did something honest. Did you do it in the kindest way you could?'],
      ['Talk to your friend first', 'You say, quietly: "I saw. I do not like it. I think you should tell her." Your friend is angry, then quiet. This is the hard one, and you did it.']],
    back: { objective: 'The child can name two responsibilities that pull in different directions, and say one kind and courageous thing.',
      lesson: 'Loyalty and honesty can conflict. Courage can be gentle.', ending: 'What if you were wrong about what you saw?',
      not: 'A rule that you must always report a friend.' }, author: 'Sample', date: '2026-11-17' },

  { id: 's-promise', kind: 'Open question', room: 'workshop', level: 1, forWhom: 'The family', title: 'When is it right to break a promise?',
    front: 'You promised to keep a secret. Then you learn the secret could get someone hurt.',
    ask: 'When is it right to break a promise?',
    back: { objective: 'Everyone at the table gives one case where they would keep the promise and one where they would break it.',
      lesson: 'A promise matters a great deal, and a few things matter more. Good people draw that line in different places.',
      ending: 'Who disagreed with you, and what was their best reason?', not: 'Permission to break promises when they are inconvenient.' },
    author: 'Sample', date: '2026-11-17' },

  { id: 's-listen-twice', kind: 'Field note', room: 'principles', level: 2, forWhom: 'The children', title: 'Listen twice before answering once',
    front: 'Next time someone tells you something that makes you want to answer fast, try this. Say back what they said. Ask one question. Then answer.',
    ask: 'Try it once today. What happened?',
    back: { objective: 'The child tries the three steps once and reports what changed.',
      lesson: 'Curious, with judgment: understanding comes before the reply.', ending: 'When is answering fast the right thing?',
      not: 'A rule to stay quiet.' }, author: 'Sample', date: '2026-11-17' },

  { id: 's-difficult-dangerous', kind: 'Decision guide', room: 'workshop', level: 2, forWhom: 'The children', title: 'Difficult, or dangerous?',
    front: 'Some people are hard to be around. A few are not safe. These questions help tell which.',
    steps: ['Do they stop when you say stop?', 'Do they ask you to keep secrets from the grown-ups you trust?',
      'Do you feel annoyed, or do you feel scared?', 'Would you be fine if someone you trust were standing next to you?',
      'Which trusted adult will you tell today, either way?'],
    back: { objective: 'The child can say the difference between annoyed and unsafe, and name one adult to tell.',
      lesson: 'Kind, with boundaries. Being patient with difficult people is kind. Staying near unsafe people is not required.',
      ending: 'Who are your three trusted adults?', not: 'A test to pass alone. If unsure, tell a trusted adult.' },
    author: 'Sample', date: '2026-11-17' },

  { id: 's-boundary', kind: 'The hammer', room: 'principles', level: 1, forWhom: 'The children', title: 'What a boundary is',
    front: 'A boundary is a line about what YOU will do. It is not a rule for the other person.\n\n"Stop hitting me" is a request.\n"If you hit me again, I will leave the game" is a boundary.\n\nYou say it once, calmly. Then you do it.',
    ask: 'Say one boundary of your own, in the same shape: "If ..., I will ..."',
    back: { objective: 'The child can say one boundary in the form "If ..., I will ...".',
      lesson: 'Kind, with boundaries. A boundary protects the relationship; it is not a punishment.',
      ending: 'What is a boundary someone else has with you?', not: 'A way to control what other people do.' },
    author: 'Sample', date: '2026-11-17' },

  { id: 's-four-words', kind: 'The hammer', room: 'workshop', level: 1, forWhom: 'The family', title: 'Good, nice, strong, wise',
    front: 'Four words that are not the same.\n\nNice: people feel pleasant around you.\nGood: you do what is right, even when it is not pleasant.\nStrong: you can do the hard thing.\nWise: you know which hard thing to do, and when.\n\nYou can be nice and not good. You can be strong and not wise.',
    ask: 'Give one example of someone being nice but not good.',
    back: { objective: 'Each person gives one example where two of the four words come apart.',
      lesson: 'Morality is more than pleasantness or power. Wisdom chooses between goods.', ending: 'Which of the four is hardest for you?',
      not: 'A ranking of people.' }, author: 'Sample', date: '2026-11-17' },

  { id: 's-right-wise', kind: 'Story, with narration', room: 'library', level: 2, forWhom: 'The children', title: 'The time I learned that being right is not the same as being wise',
    front: 'This story is waiting for its teller. It is one to three minutes long, in your own words.',
    fill: ['Where I was, and how old.', 'What I was sure I was right about.', 'What I did with being right.', 'What it cost, and who paid.', 'What I would do now.'],
    back: { objective: 'The child can retell the story and say what the teller would do differently.',
      lesson: 'Capable, and humble. Being correct does not settle how to act.', ending: 'Have you ever been right and still made things worse?',
      not: 'A lesson that being right does not matter.' }, author: 'Waiting for its teller', date: '2026-11-17' },

  { id: 's-oak-reed', kind: 'Small reading', room: 'principles', level: 1, forWhom: 'One child', title: 'The oak and the reed',
    front: 'An old fable, retold. A great oak stood by a river and laughed at the thin reeds. "You bow to every breeze," it said. "I bow to nothing." That night a storm came. The reeds bent flat and let the wind pass. The oak stood straight, and by morning it lay in the river.',
    ask: 'Was the oak strong? Were the reeds weak?',
    back: { objective: 'The child can say one time bending was the strong choice, and one time it would be wrong to bend.',
      lesson: 'Strong and wise are different. Some things bend (level 2). A few do not (level 1).', ending: 'What should a person never bend on?',
      not: 'A lesson to always give in.' }, author: 'Sample, after Aesop', date: '2026-11-17' },

  { id: 's-hidden-battle', kind: 'Field note', room: 'principles', level: 1, forWhom: 'The children', title: 'The battle you cannot see',
    front: 'When someone is rude or cold, think of one thing that might be going on for them that you cannot see. You do not have to excuse it. You only have to wonder.',
    ask: 'Who was hard to be around this week? What might you not know?',
    back: { objective: 'The child offers one possible unseen reason for another person’s behaviour.',
      lesson: 'Everyone is fighting a battle you may not see. Wondering comes before judging.', ending: 'Does wondering change what you do next?',
      not: 'An excuse for someone who keeps hurting you. See "Difficult, or dangerous?"' }, author: 'Sample', date: '2026-11-17' },

  { id: 's-keep-change', kind: 'Open question', room: 'roots', level: 3, forWhom: 'The children', title: 'Keep one, change one',
    front: 'Think of the things our family does: the food, the holidays, the words, the ways we do things.',
    ask: 'What is one thing you want to keep when you are grown? What is one you would do differently?',
    back: { objective: 'The child names one tradition to keep and one to change, and is thanked for both answers.',
      lesson: 'Connected, not constrained. Roots are offered; what to keep is theirs.', ending: 'Ask a grandparent the same question about their own childhood.',
      not: 'A vote the parents must obey, or a test of loyalty.' }, author: 'Sample', date: '2026-11-17' },

  { id: 's-village-question', kind: 'Open question', room: 'village', level: 2, forWhom: 'The parents', title: 'One question for a trusted voice',
    front: 'Send this to one person in the village, by text or email. Their reply, written or recorded, becomes a piece under their name.',
    ask: 'What did you believe at my age that you no longer believe?',
    back: { objective: 'One trusted adult answers in their own words, and the answer is kept with their name and the date.',
      lesson: 'A parent is not the only authority. A thoughtful adult can change their mind and stay themselves.',
      ending: 'Where does their answer differ from ours?', not: 'An interview to be edited until it agrees with us.' },
    author: 'Sample', date: '2026-11-17' },

  { id: 's-object', kind: 'Archive item', room: 'library', level: 2, forWhom: 'The family', title: 'An object with a story',
    front: 'One object from the house: a bowl, a tool, a photograph, a letter. This piece is waiting for it.',
    fill: ['What it is, and where it sits now.', 'Whose it was first.', 'How it came to us.', 'What it has seen.', 'Who should have it next, and why.'],
    back: { objective: 'The children can tell the object’s story to someone outside the family.',
      lesson: 'Things carry the family’s ups and downs. A story that has both is the most useful kind.', ending: 'Which object of yours will have a story one day?',
      not: 'A list of valuables.' }, author: 'Waiting for its teller', date: '2026-11-17' }
];
