// The Boy Who Cried Wolf — Aesop's fable, retold for Voice (English twin of wolf_zh.js, paragraph by paragraph).
// Edit here, then run tools/make_kokoro.py wolf_en to remake its audio.
window.VOICE_STORIES = window.VOICE_STORIES || [];
window.VOICE_STORIES.push({
  id: 'wolf_en',
  title: "The Boy Who Cried Wolf",
  subtitle: "Aesop's fable",
  lang: 'en',
  cover: '🐺',
  color: '#cfe8d5',
  version: 1,
  group: 'wolf',
  music: 'spain',
  kokoroVoices: ['bm_george'],
  // Director's notes per paragraph (hidden behind 🎬 in ⚙️; never spoken).
  paraNotes: [[{"kind": "sound", "text": "a sheep bell", "sfx": "bell"}, {"kind": "acting", "text": "Narrator: a sleepy village; calm"}], [{"kind": "motivation", "text": "Boy: he is bored and lonely on the hill"}, {"kind": "acting", "text": "a long sigh on 'nothing to do'"}], [{"kind": "motivation", "text": "Boy: he wants excitement and attention"}, {"kind": "acting", "text": "the shout is loud and fake; a grin underneath"}, {"kind": "thought", "text": "Boy: This will be fun."}], [{"kind": "sound", "text": "running footsteps", "sfx": "steps"}, {"kind": "motivation", "text": "Farmers: they care about the boy and the sheep"}, {"kind": "acting", "text": "Narrator: breathless, then puzzled"}], [{"kind": "motivation", "text": "Farmers: tricked and cross"}, {"kind": "acting", "text": "the boy laughs; the farmers grumble"}, {"kind": "gesture", "text": "shaking heads"}], [{"kind": "sound", "text": "running footsteps", "sfx": "steps"}, {"kind": "acting", "text": "Narrator: the same scene again, a little more tired"}], [{"kind": "sound", "text": "a wolf howls", "sfx": "howl"}, {"kind": "acting", "text": "Narrator: suddenly serious and fast"}], [{"kind": "motivation", "text": "Boy: real fear this time"}, {"kind": "acting", "text": "a true cry, high and shaking"}], [{"kind": "motivation", "text": "Farmers: they will not be fooled again"}, {"kind": "acting", "text": "flat, unbothered"}, {"kind": "thought", "text": "Farmer: Not this time."}], [{"kind": "sound", "text": "a growl", "sfx": "growl"}, {"kind": "acting", "text": "Narrator: quiet and sad; let it land"}], [{"kind": "acting", "text": "Narrator: the lesson, slow and kind"}, {"kind": "motivation", "text": "Narrator: the reason the story is told"}]],
  paragraphs: [
    "Once upon a time, a little village sat at the foot of a mountain. In the village lived a boy who looked after the sheep.",
    "Every day, the boy took the sheep up the mountain to eat grass. It was very quiet up there, and he thought there was nothing to do.",
    "One day, he thought of a fun trick. He stood on the mountain and shouted, \"Wolf! Wolf! Come quickly and save my sheep!\"",
    "The farmers down below heard him. They grabbed their hoes and sticks and ran up the mountain. But when they looked around, where was the wolf?",
    "The boy laughed and laughed. \"You fell for it!\" The farmers were very cross. They shook their heads and went home.",
    "A few days later, the boy shouted again, \"Wolf! Wolf!\" Again the farmers ran up the mountain, and again there was no wolf. The boy laughed again.",
    "A few days after that, a wolf really came! A big grey wolf ran out of the forest and leapt at the sheep.",
    "The boy was terrified. He shouted as loud as he could, \"Wolf! A real wolf! Please come and help me!\"",
    "But this time, the farmers all said, \"He is telling lies again.\" Not one person came up the mountain.",
    "The big grey wolf ate many of the sheep. The boy sat on the mountain and cried.",
    "From that day on, the boy understood: when someone tells lies, nobody believes him, even when he tells the truth."
  ]
});
