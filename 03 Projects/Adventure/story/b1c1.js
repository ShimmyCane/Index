// Book 1, Chapter 1 — Who? Who?
// A voiced chapter, in the script-story format borrowed from 03 Projects/Voice (see Voice stories/red_hood.js):
//   cast    speaker → name, icon, Kokoro voice and speed (recorded audio), and pitch/rate for the iPad voice fallback
//   script  one line = one paragraph: { who, text, speed? (only to override the speaker's), sfx?, notes?: [{ kind, text }] }
//           sfx plays a synthesized sound (js/sound.js) when the reading reaches the line.
//           notes are hidden director's notes (motivation, acting, sound, blocking, gesture, thought), never spoken.
// After editing, remake the audio: python3 -I tools/make_voice.py --model <dir> b1c1
// The page notices when the audio no longer matches the text and uses the iPad voices instead.
window.ADV_SCRIPTS = window.ADV_SCRIPTS || {};
window.ADV_SCRIPTS['1.1'] = {
  id: 'b1c1',
  book: 1,
  number: 1,
  title: 'Who? Who?',
  music: 'forest',
  cast: {
    narrator: { name: 'Storyteller', icon: '📜', voice: 'bm_fable', speed: 0.92, pitch: 1, rate: 0.92 },
    you: { name: 'You (Athena)', icon: '🌱', voice: 'af_river', speed: 0.95, pitch: 1.15, rate: 0.95 },
    fox: { name: 'Whisperfox', icon: '🦊', voice: 'af_nicole', speed: 1.08, pitch: 1.4, rate: 1.1 },
    owl: { name: 'Grandmother Owl', icon: '🦉', voice: 'bf_alice', speed: 0.75, pitch: 0.7, rate: 0.7 }
  },
  script: [
    { who: 'narrator', sfx: 'birds', text: 'Far away, in a different place and a different time, there is a forest so old that the trees have forgotten how young they once were.',
      notes: [{ kind: 'motivation', text: 'Open a door into another world. Slow, warm, a bedtime voice.' }, { kind: 'sound', text: 'morning birds', sfx: 'birds' }] },
    { who: 'narrator', text: 'And in that forest, on a bed of soft green moss, you open your eyes.',
      notes: [{ kind: 'acting', text: 'a small pause before "you open your eyes"' }] },
    { who: 'narrator', text: 'Morning light comes down in long golden ribbons. Mist curls between the ferns. Somewhere a bird is singing the same three notes, over and over, as if it is practising.' },
    { who: 'narrator', text: 'You sit up. A single leaf slides off your chest, as big as your two hands together. It is shaped like a heart, and it smells of honey.',
      notes: [{ kind: 'gesture', text: 'the listener can pretend to brush a leaf off' }] },
    { who: 'narrator', text: 'You try to remember how you got here. You try to remember where you were yesterday. You try to remember your own name.',
      notes: [{ kind: 'acting', text: 'three "try to remember"s, each a little slower' }] },
    { who: 'narrator', text: 'Nothing comes. Not a name, not a home, not a face. It is like reaching into a pocket you were sure had something in it, and finding only air.',
      notes: [{ kind: 'motivation', text: 'Puzzling, not frightening. Curious, like a riddle.' }] },
    { who: 'you', text: 'Hello? Is anybody there?',
      notes: [{ kind: 'acting', text: 'small, unsure, then a little louder' }, { kind: 'thought', text: 'You: Where am I? Who am I?' }] },
    { who: 'fox', text: 'Hello? Is anybody there?',
      notes: [{ kind: 'acting', text: 'the same words back, almost your voice but sly' }, { kind: 'blocking', text: 'from behind a fern' }] },
    { who: 'narrator', text: 'The words come back to you from behind a fern, in a voice that is almost yours, but a little bit sly. A pair of tufted ears pokes up. A fox with fur the colour of autumn leaves, and a tail tipped in silver, looks at you and grins.' },
    { who: 'fox', text: 'Anybody there? Anybody there?',
      notes: [{ kind: 'acting', text: 'teasing, sing-song, a giggle at the end' }] },
    { who: 'narrator', text: 'Then it is gone, with a flick of silver. A whisperfox. Somehow you know that word, even though you know nothing else.',
      notes: [{ kind: 'thought', text: 'Storyteller: the first thing the player remembers is a forest word. A clue.' }] },
    { who: 'narrator', sfx: 'growl', text: 'Something else is watching you too.',
      notes: [{ kind: 'sound', text: 'a very soft growl, more grumble than threat', sfx: 'growl' }] },
    { who: 'narrator', text: 'Sitting very still, just beyond the edge of the moss, is a dog. A wild dog, scruffy and grey, with fur that sticks up in every direction, like a brush that has been used to sweep a chimney. One ear stands up. The other flops over. He does not bark. He does not move. He only watches you with deep brown eyes, the way you would watch a pot that is just about to boil.',
      notes: [{ kind: 'motivation', text: 'This is Bristle. Make him lovable at once.' }, { kind: 'acting', text: 'smile on "one ear stands up, the other flops over"' }] },
    { who: 'narrator', text: 'When you look back at him, his tail sweeps the moss once. Swish. As if to say: there you are at last.',
      notes: [{ kind: 'thought', text: 'Bristle: There you are. I waited so long.' }] },
    { who: 'narrator', sfx: 'magic', text: 'That is when you notice your hand. It is closed tight around something small and cool. You open your fingers. It is a key.',
      notes: [{ kind: 'sound', text: 'a sparkle as the fingers open', sfx: 'magic' }, { kind: 'gesture', text: 'open a closed fist slowly' }] },
    { who: 'narrator', sfx: 'hum', text: 'An old metal key, no longer than your finger. On one side of its round head is a sun. On the other side is a moon. And it is humming, very softly, like a bee asleep in a flower.',
      notes: [{ kind: 'sound', text: 'the key hums', sfx: 'hum' }, { kind: 'motivation', text: 'The Sun and Moon key from the old car-ride story.' }] },
    { who: 'owl', sfx: 'hoot', text: 'Who? Whooo?',
      notes: [{ kind: 'sound', text: 'an owl hoot', sfx: 'hoot' }, { kind: 'acting', text: 'slow, deep, a real question' }] },
    { who: 'narrator', text: 'High above you, on a branch, sits an owl as grey as a winter morning. Its round eyes blink slowly, first one, then the other.' },
    { who: 'owl', text: 'Who are you? Whooo?',
      notes: [{ kind: 'motivation', text: 'Grandmother Owl knows every sleeper\'s name. She wants yours.' }] },
    { who: 'narrator', text: 'You open your mouth to answer, and close it again. You do not know.' },
    { who: 'narrator', sfx: 'steps', text: 'So you stand up, a little wobbly, and you look around properly for the first time. And that is when you see it.',
      notes: [{ kind: 'sound', text: 'footsteps on moss', sfx: 'steps' }, { kind: 'acting', text: 'build up to "see it"' }] },
    { who: 'narrator', text: 'What you thought was a grey cliff behind you is not a cliff at all. It is bark. Bark in great ridges, each one as tall as a house. The moss you slept on is growing on a root, and the root is as wide as a road. You follow it with your eyes, up and up and up, past the mist, past the birds, until your neck aches. The trunk rises so high that its top is lost in the clouds.',
      notes: [{ kind: 'acting', text: '"up and up and up" rising in pitch' }, { kind: 'gesture', text: 'look up, higher, higher' }] },
    { who: 'narrator', text: 'It is a tree. The biggest tree in the world. And you have been sleeping in its arms.',
      notes: [{ kind: 'motivation', text: 'Vael, the World Tree. Wonder, and safety: you were held.' }] },
    { who: 'narrator', sfx: 'wind', text: 'A warm breeze moves through the leaves, far above. It sounds like a very large creature, breathing out slowly in its sleep.',
      notes: [{ kind: 'sound', text: 'wind in high leaves', sfx: 'wind' }] },
    { who: 'narrator', text: 'For one moment, when the breeze touches the key in your hand, you hear something else. A woman singing, very far away. Then it is gone.',
      notes: [{ kind: 'thought', text: 'Storyteller: the first thread of the true past. Do not explain it.' }] },
    { who: 'narrator', sfx: 'bell', text: 'From somewhere to the east, through the trees, comes a sound. Bells. Small, bright bells, all ringing together, as though someone in a village has a very good reason to ring them this morning.',
      notes: [{ kind: 'sound', text: 'distant bells', sfx: 'bell' }, { kind: 'motivation', text: 'The linden bells of Mossbrook are ringing by themselves.' }] },
    { who: 'narrator', text: 'To the west, half hidden in the ferns, a line of old grey stones runs off into the shadows. Each stone has a picture carved on it. A circle with a dot in the middle. It looks like an eye. Or maybe a seed.',
      notes: [{ kind: 'motivation', text: 'The Carved Stones to Aun, with the Rootkin seed-eye sign.' }] },
    { who: 'narrator', text: 'And just for a moment, on top of the nearest stone, you think you see someone. Someone very small, no taller than a teapot, with skin like bark and hair like moss and eyes that shine like drops of honey. It looks at you. It puts a tiny finger to its lips. Then you blink, and there is only the stone.',
      notes: [{ kind: 'acting', text: 'a whisper on "puts a tiny finger to its lips"' }, { kind: 'gesture', text: 'finger to lips: shh' }, { kind: 'motivation', text: 'A Rootkin glimmer. Only the Seedling can see it.' }] },
    { who: 'narrator', text: 'The dog stands up. He looks at you. He looks east, toward the bells. He looks west, toward the stones. He looks up, at the great tree. Then he looks back at you, and waits, as if he has been waiting a very long time, and can wait a little longer.',
      notes: [{ kind: 'blocking', text: 'Bristle turns his head three ways: east, west, up' }] },
    { who: 'owl', sfx: 'hoot', text: 'Who? Whooo?',
      notes: [{ kind: 'sound', text: 'owl', sfx: 'hoot' }] },
    { who: 'narrator', text: 'The owl is still asking. The forest is still listening. And you will have to decide, together, who you are going to be.' },
    { who: 'narrator', text: 'What is your name? Say the first name that comes to you, or ask the forest to give you one. And where will you go first? East, toward the bells. West, along the carved stones. Or up, into the roots of the great tree.',
      notes: [{ kind: 'acting', text: 'slow and clear; leave space after each choice' }, { kind: 'motivation', text: 'Hand the story to the family.' }] }
  ]
};
