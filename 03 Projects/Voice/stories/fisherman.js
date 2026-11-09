// The Fisherman and the Goldfish — a retelling of the old folk tale, written for Voice.
// Edit the text here, then run tools/make_kokoro.py to remake its audio.
// The page notices when the audio no longer matches the text and falls back to the iPad voice.
window.VOICE_STORIES = window.VOICE_STORIES || [];
window.VOICE_STORIES.push({
  id: 'fisherman',
  title: 'The Fisherman and the Goldfish',
  lang: 'en',
  cover: '🐟',
  color: '#ffe3a3',
  version: 1,
  group: 'fisherman',
  music: 'japan',
  kokoroVoices: ['af_heart', 'bm_fable'],
  // Director's notes per paragraph (hidden behind 🎬 in ⚙️; never spoken).
  paraNotes: [[{"kind": "sound", "text": "waves on the shore", "sfx": "waves"}, {"kind": "motivation", "text": "Narrator: a quiet, poor, happy life"}, {"kind": "acting", "text": "slow and calm, like the tide"}], [{"kind": "sound", "text": "a splash", "sfx": "splash"}, {"kind": "acting", "text": "Narrator: wonder on 'shone like the sun'"}, {"kind": "thought", "text": "Fisherman: What a beautiful creature."}], [{"kind": "sound", "text": "a magic sparkle", "sfx": "magic"}, {"kind": "motivation", "text": "Goldfish: it wants to live, and offers all it has"}, {"kind": "acting", "text": "small, clear, bell-like voice"}], [{"kind": "motivation", "text": "Fisherman: he is content; kindness costs him nothing"}, {"kind": "acting", "text": "a gentle smile in the voice"}, {"kind": "gesture", "text": "opens his hands over the water"}], [{"kind": "motivation", "text": "Wife: she is tired of being poor"}, {"kind": "acting", "text": "sharp and fast; hands thrown up"}, {"kind": "blocking", "text": "she stands in the doorway, he stays outside"}], [{"kind": "sound", "text": "waves", "sfx": "waves"}, {"kind": "motivation", "text": "Fisherman: he does not want to ask, but he wants peace at home"}, {"kind": "acting", "text": "shy when he calls; the goldfish kind"}], [{"kind": "motivation", "text": "Wife: each wish makes her want more"}, {"kind": "acting", "text": "Narrator delighted at the house, then flat on 'not happy for long'"}], [{"kind": "sound", "text": "wind rising", "sfx": "wind"}, {"kind": "acting", "text": "Narrator: the sea grows darker; the goldfish sighs"}], [{"kind": "motivation", "text": "Wife: now she wants power, not comfort"}, {"kind": "acting", "text": "grand and cold on 'rule the whole sea'"}], [{"kind": "sound", "text": "a storm", "sfx": "wind"}, {"kind": "motivation", "text": "Fisherman: he knows this is wrong"}, {"kind": "acting", "text": "very quietly, almost ashamed"}], [{"kind": "sound", "text": "a deep splash", "sfx": "splash"}, {"kind": "acting", "text": "Narrator: silence says more than words; pause after 'not a word'"}], [{"kind": "sound", "text": "waves, softly", "sfx": "waves"}, {"kind": "acting", "text": "Narrator: plain and sad; everything is back where it began"}], [{"kind": "motivation", "text": "Fisherman: he chooses love over riches"}, {"kind": "acting", "text": "warm and steady; the story's heart"}, {"kind": "gesture", "text": "takes her hand"}]],
  paragraphs: [
    'Once upon a time, an old fisherman and his wife lived in a little hut by the blue sea. Every morning he cast his net into the waves, and every evening he came home with a few small fish.',
    'One morning the net came up heavy. Inside it was a fish that shone like the sun. It was a goldfish, and it spoke to him.',
    '"Please, old man, let me go back into the sea," said the goldfish. "If you do, I will grant you three wishes."',
    'The kind old fisherman smiled. "Swim away, little fish. I do not need anything." And he let it go.',
    'When he got home, he told his wife. She threw up her hands. "Three wishes, and you asked for nothing? Go back and ask for a new house! Our hut is falling down."',
    'So the old man walked to the sea and called, "Goldfish, goldfish, please come here!" The goldfish swam up. "What do you wish, old man?" He asked for a new house. "Go home," said the goldfish. "It is done."',
    'At home stood a fine wooden house with a red roof and a garden full of flowers. But his wife was not happy for long. "Why a house," she said, "when I could live in a palace? Go back and ask for a palace, and make me a queen!"',
    'The sea was a little darker now. The old man called, "Goldfish, goldfish, please come here!" The goldfish listened, and sighed, and said, "Go home. It is done."',
    'At home stood a palace of white stone. His wife sat on a golden throne, with servants all around her. Still she was not happy. "A queen is not enough," she said. "I want to rule the whole sea, and the goldfish must be my servant!"',
    'The old man did not want to go. But he walked back to the shore. Now the sea was black, and the wind was howling, and big waves crashed on the rocks. "Goldfish, goldfish, please come here," he called, very quietly.',
    'The goldfish rose from the waves. This time it did not say a word. It only flicked its golden tail and swam away, down into the deep.',
    'The old man walked home. The palace was gone. The house was gone. There was the little hut by the sea, and there sat his wife on the old step, frowning at a broken bucket.',
    'The old fisherman sat down beside her. He took her hand. "We still have the sea," he said, "and we still have each other." And the next morning, he cast his net into the waves once more.'
  ]
});
