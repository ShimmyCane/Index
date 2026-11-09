// Little Red Riding Hood — a retelling of the original version (Charles Perrault, 1697),
// which ends with the wolf and a moral, like one of Aesop's fables. Written for Voice.
//
// A script story: every line has a speaker (`who`) from the cast. Optional fields:
//   tone   how the line is said (read by voice services that take directions; Kokoro uses `speed`)
//   speed  Kokoro speaking speed for this line (default 0.92)
//   notes  hidden director's notes, never spoken: motivation (why), acting (how), sound (a cue; `sfx` plays a
//          synthesized effect from js/sound.js), blocking (where they move), gesture, thought.
// Edit here, then run tools/make_kokoro.py red_hood to remake its audio.
window.VOICE_STORIES = window.VOICE_STORIES || [];
window.VOICE_STORIES.push({
  id: 'red_hood',
  title: 'Little Red Riding Hood',
  subtitle: 'The original version, with a moral',
  lang: 'en',
  cover: '🧺',
  color: '#ffc9c2',
  version: 2,
  group: 'red_hood',
  music: 'france',
  kokoroVoices: ['cast', 'bm_fable'],
  cast: {
    narrator: { name: 'Narrator', icon: '📖', voice: 'bm_fable' },
    mother: { name: 'Mother', icon: '👩', voice: 'af_sarah' },
    red: { name: 'Little Red', icon: '👧', voice: 'af_sky' },
    wolf: { name: 'Wolf', icon: '🐺', voice: 'am_onyx' },
    grandma: { name: 'Grandmother', icon: '👵', voice: 'bf_isabella' }
  },
  script: [
    {"who": "narrator", "text": "Once upon a time, in a village at the edge of a great forest, there lived a little girl. She was the prettiest girl anyone had ever seen.", "notes": [{"kind": "motivation", "text": "Narrator: set a warm, safe village before the danger comes"}, {"kind": "sound", "text": "birds in the morning", "sfx": "birds"}]},
    {"who": "narrator", "text": "Her grandmother loved her so much that she sewed her a little red hood. The girl wore it everywhere, so everyone called her Little Red Riding Hood.", "notes": [{"kind": "motivation", "text": "Narrator: show how loved she is; it makes the ending hurt"}]},
    {"who": "narrator", "text": "One morning her mother baked some cakes.", "notes": [{"kind": "sound", "text": "the oven door, cakes cooling"}, {"kind": "gesture", "text": "Mother wraps the cakes in a cloth"}]},
    {"who": "mother", "tone": "warm, a little worried", "speed": 0.9, "text": "Your grandmother is not well. Take her these cakes and this little pot of butter. Go straight there, and do not stop on the way.", "notes": [{"kind": "motivation", "text": "Mother: she cannot go herself, and she worries"}, {"kind": "acting", "text": "stress 'straight there'; a finger raised on 'do not stop'"}, {"kind": "blocking", "text": "walks her to the door"}, {"kind": "gesture", "text": "tucks a cloth over the basket"}]},
    {"who": "red", "tone": "cheerful", "speed": 1, "text": "Yes, Mother!", "notes": [{"kind": "motivation", "text": "Little Red: proud to be trusted with a grown-up job"}, {"kind": "acting", "text": "bright, quick, already halfway out the door"}, {"kind": "blocking", "text": "skips out of the gate, basket swinging"}]},
    {"who": "narrator", "text": "Grandmother lived in the next village, on the other side of the wood. As Little Red Riding Hood walked between the trees, she met a wolf.", "notes": [{"kind": "sound", "text": "footsteps on leaves", "sfx": "steps"}, {"kind": "blocking", "text": "the path narrows; the trees close in"}]},
    {"who": "narrator", "text": "The wolf wanted very much to eat her up. But he did not dare, because some woodcutters were working nearby, and he could hear their axes.", "notes": [{"kind": "motivation", "text": "Wolf: hungry but careful; he wants no witnesses"}, {"kind": "acting", "text": "Narrator drops the voice: we know more than she does"}, {"kind": "sound", "text": "axes in the distance", "sfx": "axe"}, {"kind": "thought", "text": "Wolf: Not here. Too many ears."}]},
    {"who": "wolf", "tone": "sly and sweet, too polite", "speed": 0.85, "text": "Good morning, little one. And where are you going today?", "notes": [{"kind": "motivation", "text": "Wolf: find out where she is going without scaring her"}, {"kind": "acting", "text": "too sweet, every word polished"}, {"kind": "blocking", "text": "steps out from behind an oak and bows low"}, {"kind": "gesture", "text": "smooths his whiskers"}, {"kind": "thought", "text": "Wolf: Easy. A child alone."}]},
    {"who": "narrator", "text": "The poor child did not know that it is dangerous to stop and talk to a wolf.", "notes": [{"kind": "acting", "text": "Narrator: a small warning to the listener, almost a whisper"}]},
    {"who": "red", "tone": "friendly, trusting", "speed": 0.98, "text": "I am going to see my grandmother. I am bringing her cakes and a little pot of butter from my mother.", "notes": [{"kind": "motivation", "text": "Little Red: she was taught to be polite to everyone"}, {"kind": "acting", "text": "chatty, happy to have company"}, {"kind": "gesture", "text": "lifts the cloth to show him"}]},
    {"who": "wolf", "tone": "interested, hiding it", "speed": 0.85, "text": "Does she live far away?", "notes": [{"kind": "motivation", "text": "Wolf: he needs the address"}, {"kind": "acting", "text": "casual, as if he hardly cares"}, {"kind": "thought", "text": "Wolf: Tell me, tell me."}]},
    {"who": "red", "tone": "helpful", "speed": 1, "text": "Oh yes. Past the mill you can see over there, in the first house of the village.", "notes": [{"kind": "acting", "text": "helpful, pointing proudly"}, {"kind": "gesture", "text": "points through the trees"}]},
    {"who": "wolf", "tone": "playful, a game", "speed": 0.88, "text": "Well then, I will go and see her too. I will take this path, and you take that one. Let us see who gets there first!", "notes": [{"kind": "motivation", "text": "Wolf: send her the long way so he arrives first"}, {"kind": "acting", "text": "turns it into a game; a wink on 'first'"}, {"kind": "thought", "text": "Wolf: Two dinners, if I am quick."}]},
    {"who": "narrator", "text": "The wolf ran off as fast as he could, by the shortest path.", "notes": [{"kind": "acting", "text": "Narrator speeds up with him"}, {"kind": "sound", "text": "running paws", "sfx": "steps"}]},
    {"who": "narrator", "text": "The little girl went the longest way. She stopped to gather nuts, she chased butterflies, and she picked a bunch of little flowers.", "notes": [{"kind": "motivation", "text": "Little Red: the forest is beautiful and she is in no hurry"}, {"kind": "acting", "text": "Narrator slows down, dreamy"}, {"kind": "sound", "text": "birdsong", "sfx": "birds"}, {"kind": "blocking", "text": "wanders off the path, then back"}, {"kind": "thought", "text": "Red: Grandmother will love these."}]},
    {"who": "narrator", "text": "The wolf soon came to the grandmother's house. He knocked.", "notes": [{"kind": "sound", "text": "knock, knock", "sfx": "knock"}]},
    {"who": "grandma", "tone": "old, weak, from her bed", "speed": 0.85, "text": "Who is there?", "notes": [{"kind": "motivation", "text": "Grandmother: tired and sick; she expects no danger"}, {"kind": "acting", "text": "thin and wavering, from far inside the house"}]},
    {"who": "wolf", "tone": "high and sweet, pretending to be a little girl", "speed": 0.9, "text": "It is your granddaughter, Little Red Riding Hood. I have brought you cakes and a little pot of butter from my mother.", "notes": [{"kind": "motivation", "text": "Wolf: get through the door"}, {"kind": "acting", "text": "a high, silly little-girl voice; he almost laughs"}]},
    {"who": "grandma", "tone": "kind", "speed": 0.85, "text": "Pull the bobbin, and the latch will go up.", "notes": [{"kind": "motivation", "text": "Grandmother: happy to have a visitor"}, {"kind": "acting", "text": "fond, a little out of breath"}, {"kind": "thought", "text": "Grandmother: What a good child."}]},
    {"who": "narrator", "text": "The wolf pulled the bobbin, and the door opened. He sprang at the old woman and gobbled her up in a moment, for he had not eaten in three days.", "notes": [{"kind": "acting", "text": "Narrator: quick and plain; do not linger on it"}, {"kind": "sound", "text": "the latch and a creaking door", "sfx": "door"}]},
    {"who": "narrator", "text": "Then he shut the door, put on her nightcap, and lay down in her bed to wait.", "notes": [{"kind": "blocking", "text": "the wolf pulls the nightcap low over his ears"}, {"kind": "blocking", "text": "pulls the covers up to his nose"}, {"kind": "thought", "text": "Wolf: Now the dessert."}]},
    {"who": "narrator", "text": "A little while later, Little Red Riding Hood knocked at the door.", "notes": [{"kind": "sound", "text": "knock, knock", "sfx": "knock"}]},
    {"who": "wolf", "tone": "gruff, trying to sound old", "speed": 0.85, "text": "Who is there?", "notes": [{"kind": "acting", "text": "gruff; he forgets to sound old"}, {"kind": "thought", "text": "Wolf: Careful, careful."}]},
    {"who": "narrator", "text": "When she heard the big, rough voice, she was frightened at first. Then she thought her grandmother must have a cold.", "notes": [{"kind": "motivation", "text": "Little Red: she wants everything to be all right, so she explains it away"}, {"kind": "thought", "text": "Red: Poor Grandmother. Her voice is all hoarse."}]},
    {"who": "red", "tone": "gentle", "speed": 0.98, "text": "It is your granddaughter, Little Red Riding Hood. I have brought you cakes and a little pot of butter.", "notes": [{"kind": "acting", "text": "gentle, a little worried for her grandmother"}]},
    {"who": "wolf", "tone": "softer now", "speed": 0.85, "text": "Pull the bobbin, and the latch will go up.", "notes": [{"kind": "acting", "text": "softer now, catching himself"}]},
    {"who": "narrator", "text": "She pulled the bobbin, and the door opened. The wolf hid under the blankets.", "notes": [{"kind": "sound", "text": "the door creaks", "sfx": "door"}, {"kind": "blocking", "text": "Little Red stands in the doorway; dim light"}]},
    {"who": "wolf", "tone": "muffled, from under the covers", "speed": 0.85, "text": "Put the cakes and the butter on the table, my dear, and come here to me.", "notes": [{"kind": "motivation", "text": "Wolf: bring her close"}, {"kind": "acting", "text": "muffled, honey-sweet"}, {"kind": "gesture", "text": "pats the bed"}]},
    {"who": "narrator", "text": "Little Red Riding Hood came close to the bed. She was amazed at how her grandmother looked.", "notes": [{"kind": "acting", "text": "Narrator slows; each word one step"}, {"kind": "sound", "text": "slow footsteps on the floor", "sfx": "steps"}, {"kind": "blocking", "text": "one slow step at a time"}]},
    {"who": "red", "tone": "curious", "speed": 0.95, "text": "Grandmother, what big arms you have!", "notes": [{"kind": "motivation", "text": "Little Red: curious, not yet afraid"}, {"kind": "acting", "text": "wide-eyed, almost a giggle"}]},
    {"who": "wolf", "tone": "sweet", "speed": 0.85, "text": "All the better to hug you with, my dear.", "notes": [{"kind": "acting", "text": "smooth; the wolf enjoys the game"}]},
    {"who": "red", "tone": "curious", "speed": 0.95, "text": "Grandmother, what big legs you have!", "notes": [{"kind": "acting", "text": "curious, a small frown"}]},
    {"who": "wolf", "tone": "sweet", "speed": 0.85, "text": "All the better to run with, my child.", "notes": [{"kind": "acting", "text": "a little faster; he is getting impatient"}]},
    {"who": "red", "tone": "unsure", "speed": 0.93, "text": "Grandmother, what big ears you have!", "notes": [{"kind": "motivation", "text": "Little Red: something is wrong and she starts to feel it"}, {"kind": "acting", "text": "unsure, quieter"}]},
    {"who": "wolf", "tone": "sweet", "speed": 0.85, "text": "All the better to hear you with, my child.", "notes": [{"kind": "acting", "text": "purring, ears twitching"}]},
    {"who": "red", "tone": "uneasy", "speed": 0.92, "text": "Grandmother, what big eyes you have!", "notes": [{"kind": "acting", "text": "uneasy; she takes half a step back"}]},
    {"who": "wolf", "tone": "low", "speed": 0.85, "text": "All the better to see you with, my child.", "notes": [{"kind": "acting", "text": "low, staring"}, {"kind": "gesture", "text": "the blanket slides down"}, {"kind": "thought", "text": "Wolf: One more question."}]},
    {"who": "red", "tone": "afraid, very quiet", "speed": 0.9, "text": "Grandmother, what big teeth you have!", "notes": [{"kind": "motivation", "text": "Little Red: she finally sees it"}, {"kind": "acting", "text": "a frightened whisper"}]},
    {"who": "wolf", "tone": "a sudden growl", "speed": 1, "text": "All the better to eat you with!", "notes": [{"kind": "acting", "text": "the sweet voice is gone; a sudden roar"}, {"kind": "sound", "text": "a growl", "sfx": "growl"}, {"kind": "blocking", "text": "leaps out of the bed"}]},
    {"who": "narrator", "text": "And with those words, the wicked wolf jumped on Little Red Riding Hood and gobbled her up.", "notes": [{"kind": "acting", "text": "Narrator: short and quiet; then a long pause"}, {"kind": "sound", "text": "a gulp", "sfx": "gulp"}]},
    {"who": "narrator", "tone": "slow, wise", "speed": 0.85, "text": "The moral of the story.", "notes": [{"kind": "acting", "text": "Narrator steps out of the story"}, {"kind": "sound", "text": "a soft bell", "sfx": "bell"}]},
    {"who": "narrator", "tone": "slow, wise", "speed": 0.85, "text": "Children, and pretty young girls most of all, should never stop to talk with strangers. Some wolves are sweet and gentle and polite. And those gentle wolves are the most dangerous of all.", "notes": [{"kind": "motivation", "text": "Narrator: the reason the story is told"}, {"kind": "acting", "text": "slow and wise; look at each listener on 'gentle wolves'"}]}
  ]
});
