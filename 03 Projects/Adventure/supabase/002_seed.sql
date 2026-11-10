-- ============================================================================
-- Adventure — Book 1 seed: the world of Ondra, roles, places, the planned plot,
-- and chapter 1 ("Who? Who?"), voiced.
-- The full world bible is in the repo: 03 Projects/Adventure/world/*.md.
-- Made-up story content only. Re-runnable: skips rows that already exist.
-- Run order: 001_adventure.sql, 003_world.sql, 004_script.sql, 005_audio.sql, then this file.
-- ============================================================================

insert into public.adv_roles (key, name, emoji, color, blurb, voice, sort) values
('athena',      'Athena',        '🌱', '#CDEFE0', 'Woke in the roots of the World Tree with no memory. This is her story; her name is hers to choose.',
 'Athena, a Seedling. Starts unsure and curious. Chooses her own name at the Naming Bowl. Can see faint things the world has forgotten. Written in the second person ("you").', 1),
('bristle',     'Bristle',       '🐕', '#E3E3D8', 'A scruffy grey wild dog, one ear up, one flopped. Guarded your sleep. Never barks.',
 'Cannot talk. Shows feelings with growls, sniffs, wags and where he looks. Notices smells and sounds first. Growls at liars and at nightbloom.', 2),
('old_lady',    'Granny Wren',   '👵', '#E8DAF7', 'The old lady at the forest edge of Mossbrook. Remembers the old days and speaks in riddles.',
 'Warm, slow, a little sly, laughs at her own riddles. Old sayings ("Bread first, questions after"). Secretly the last Keeper of the Root in the village. Knows more than she says.', 3),
('storyteller', 'Storyteller',   '📜', '#FFE9A8', 'The dungeon master. Moves the world, its weather, its creatures and its surprises.',
 'The narrator''s own voice. Describes, never decides for the other characters.', 4)
on conflict (key) do nothing;

insert into public.adv_entries (kind, title, body, sort)
select * from (values
('rule', 'How the storyteller writes',
 'For children around seven and their family. Warm, exciting, full of wonder. Never scary in a way that keeps someone up at night.
Short sentences that read well aloud. This is Athena''s story: second person for her ("you").
Every chapter ends with a question or a puzzle, with 2 or 3 clear options, and room for any other idea.
Puzzles have more than one right answer. Brave, clever, kind and loyal answers each send the story a different way.
A wrong answer brings a hint, never a dead end.
If nobody answers, the story keeps going: the characters act on their own in a sensible way.
Use every beat the family sent, in the order they were said. What one character says, the others can react to.
Before writing, read the world bible in the repo (03 Projects/Adventure/world/), or at least these entries.', 1),
('rule', 'How dark it gets',
 'Terrible things are told, not shown: war, cruelty and loss are in the past, off stage or far away, and reach the children as a story, a ruin, a sad song.
Injustice is shown by what it does to ordinary people, and the children can always do something small that helps.
People can lie; reward noticing (a smell, a story that does not fit, Bristle growling).
Poison (nightbloom) brings the grey sleep, never death on the page, and there is always a cure to search for.
Nobody is only good or only bad.
For now, things are light: wonder, small mysteries, small injustices, a little danger that always works out.', 2),
('rule', 'Light in the dark',
 'Every chapter has at least one moment of levity, the dark ones most of all: Pip the crow stealing a button, Tobin''s boasts collapsing, a thornhog asleep where it should not be, the whisperfox repeating a pompous speech, Bristle''s eyebrows, Granny Wren laughing at her own riddles. In Ondra the Hush cannot hold a memory that people laughed at together.', 3),
('rule', 'The Reckoning switch',
 'The Reckoning never starts on its own. Read the setting entry "Reckoning". While it says off, keep the Bloom clock at 5/6 or less and give only teasers (at least six in the first 25 chapters; schedule in world/books.md). When Jimmy sets it to "on (from chapter N)", build toward the bloom over ten chapters; the Tree blooms in chapter N + 10.', 4),
('world', 'Ondra',
 'The world. At its centre stands Vael, the World Tree. Around it: the Greenhollow forest, the small village of Mossbrook, the ruined first village of Aun. Beyond: the Mirrorlakes (north), the Ashen Reach desert (east, once a forest), the cities of Solvane (gold domes, an old empire) and Ferrow (iron, canals, bankers), the Tallgrass clans, the Stairstep Mountains, the White North, the Scattered Isles. Three hundred years of peace under the Concord of Five Waters, now fraying. Year: the 3,112th Ring, the 300th summer of the Concord. Season: late Thaw.', 10),
('world', 'Vael, the World Tree, and the Giving Law',
 'Brother Sun and Sister Moon could never share the sky. The Sun gave warmth, the Moon gave a tear, and where they met a seed woke: Vael. Its crown holds up the sky; its roots drink from the Underlake. Its first seven leaves sang the seven Wardens (Dawn Stag, Great Heron, Salt Serpent, Wind Mare, Stone Bear, Aurora Owl, Deep Mother). Its first seeds became the Rootkin, the first people. The only law: "Take with one hand. Give with the other." Vael blooms once in a thousand years. It has just put out a single pale gold bud that only Athena has noticed.', 11),
('world', 'The Hush and the Seedlings',
 'The Hush is the eighth spirit, of rest and forgetting: soft grey snow with pale moths in it. Not evil, but wounded since the last Glass King, Orrin the Bright, bound it and used it to make the whole world forget the Rootkin (the Great Forgetting). Vael sometimes takes in people who are lost or dying and lays them asleep in its roots; the Hush takes their memories. When the Tree needs hands it wakes one: a Seedling. The linden bells in Mossbrook ring by themselves when one wakes. Athena is a Seedling. Who they were before is revealed slowly, by their choices (see world/bible.md section 5; storyteller decides only when the story has earned it).', 12),
('world', 'Mossbrook',
 'The small living village, an hour east of the Waking Hollow along the Singing Stream. Twenty-two stone and timber houses, mossy roofs, a sun and a moon carved over every door (and often the Rootkin seed-eye, though nobody remembers why). The green with the great linden hung with bronze bells. Mill, smithy, bee-garden, famous bakehouse. Customs: a hearth bowl of milk and a crust for each house''s hearthwisp; the Naming Bowl at the stream; Market Day each new moon. People: Granny Wren, Headwoman Marla Ash, Tobin the miller''s son (about ten, brags, loyal), Nettle the bee-girl (about nine, talks to bees), Old Pell the woodcutter (secretly selling ironwood to Ferrow to pay a debt), Smith Hadda (a runaway from Ferrow, grown up), Pip the crow. A sad secret: at the Breaking they turned away a boat of refugees, and leave a candle in the window every Night Without Moon.', 13),
('world', 'Aun, the Old Village',
 'West of the Waking Hollow, along the Carved Stones (each carved with the seed-eye, a circle with a dot). The first village in the world: houses grown, not built, from living roots, where Rootkin and humans lived together. Empty since the Great Forgetting, thick with the Hush. The Root Gate opens to a thank-you. Inside: the Wall of Hands, the Dry Well to the Underlake, and in the Grown Hall the Sun and Moon Chest (a sun lock and a moon lock).', 14),
('world', 'The Rootkin',
 'The first people, forgotten. Teapot-to-knee high, bark skin, moss hair, eyes like drops of honey. Speak in hums and creaks. Grew houses and bridges from living roots. Unremembered in the Great Forgetting, they faded; a few linger as glimmers only children, Seedlings and the very old can see, for a blink. Each time someone truly remembers one, it grows a little more solid. Their sign is the seed-eye.', 15),
('world', 'The key',
 'An old metal key no longer than a finger, a sun on one side of its head and a moon on the other. It hums, louder near Rootkin things and the Tree, and goes cold near nightbloom. The Tree''s heart has a door with a sun lock and a moon lock; this is the Sun Key, longing for its twin. The Moon Key is hidden by the Lantern Synod in the Mirrorlakes. The Ash Hand wants both. (From the family''s old car-ride story: the Sun and Moon Chest and its humming key.)', 16),
('world', 'Creatures of the Greenhollow',
 'Whisperfox: autumn-red, silver-tipped tail, repeats your last words in your own voice and laughs at lies. Grandmother Owl: the grey owl in the hollow oak who asks "Who?" and really wants to know; she gives names to those who earn them. Mossback deer, gentle giants with ferns on their backs. Thornhogs, grumpy dog-sized hedgehogs who love apples. Lanternmoths, which light up what the Hush has touched. Linden bees. Hearthwisps, kitten-sized flame-coloured house spirits who sulk when people quarrel. Grandfather Moss, the forest lord who leads the rude astray and the polite home. Mire-lights, lost memories glowing over the Mirefen.', 17),
('world', 'The war people make',
 'Around the bloom, people make their own reckoning: the War of the Broken Concord. Regent Cassian wants sun-glass (desert sand and fire); Ferrow wants the forest''s ironwood for warships. The Concord renewal on the Lantern Isle is the spark; the Caravan Houses side with whoever brings water; the Tallgrass Clans ride against the fences; the Ash Hand fans every flame. For children it looks like closed roads, dear bread, refugees, a spy, a cousin gone to the army, not battles. The bloom does not end the war: people must, and peasants become heroes by keeping the Giving Law when the great have broken it.', 18),
('world', 'Peoples and factions (short)',
 'Keepers of the Root: an old order guarding the Tree, now about seven. Tallenai: desert caravan Houses, guest-right, Rememberers who sing history; House Sahrune sells water. Lumai: lake people on floating islands, Lantern Night; the Lantern Synod keeps the Moon Key and an old shame, and casts out questioners (the Unlanterned). Solvane: the Sunward Court, eleven-year-old Queen Aurelie, smiling Regent Cassian Morrow, Ward-Children held as hostages. Ferrow: the Iron Compact of guilds, "No crown over us", debt-children at the bellows, wants the forest''s ironwood. Tallgrass Clans: horse people being fenced in. Hidden: the Ash Hand (wants both keys to free the sun-fire in the Tree''s heart; uses nightbloom, led by the masked Ember Mother), the Glass Remnant. Details in world/peoples.md.', 18),
('world', 'The Reckoning (storyteller only)',
 'When Vael blooms, the Tree remembers everything at once. The Hush breaks; everything forgotten returns (the Rootkin, names, songs); every promise made under the Tree comes due, so those who kept the Giving Law rise and those who broke it kneel; for a day the Sun and Moon share the sky; old dangers wake. Opened with both keys by people who keep the Giving Law, the heart heals the world. Opened by force, the sun-fire spills. Not before Book 4 or 5. Only hints in Book 1.', 19),
('history', 'What happened before Book 1',
 'Long ago the Glass Kings burned the Greenreach into the Ashen Reach for sun-glass, made the world forget the Rootkin, and fell on the Night Without Moon, when the Moon''s tears made the Mirrorlakes. Three hundred years ago the Concord of Five Waters brought peace and made the forest neutral: no army walks under Vael. This spring the Tree woke a Seedling, Athena, in the Waking Hollow, with a humming key and a dog called Bristle beside them. The linden bells of Mossbrook rang by themselves.', 20),
('theme', 'Book 1 themes',
 'Who am I? A name is chosen, not given. Belonging. Trust between Athena and Bristle. Noticing what others miss. Small injustices ordinary people can push against. Remembering the forgotten. Notice whether the player is mostly brave, clever, kind or loyal, and write it in Athena''s journal.', 30),
('plan', 'The ten books',
 '1 The Waking. 2 The Road (2·Lantern, 2·Salt or 2·Iron). 3 The Concord (3·Kept or 3·Broken). 4 The Unforgetting. 5 The Drums (the war begins; suggested moment to switch the Reckoning on). 6 The Bloom. 7 The World Upside Down. 8 The Glass King. 9 The Far Shore. 10 The Giving. Athena''s other lives (Aun in the Age of Roots, the Glassmaker''s Apprentice, the Night Without Moon, After) unlock along the way. Details in world/books.md.', 41),
('plan', 'Book 1 outline: The Waking',
 '1. Who? Who? Waking in the roots (written).
2. The Bells of Mossbrook: Granny Wren, a sulking hearthwisp, Tobin.
3. The Listening Root: the Tree, the creation story, the bud, the Naming Bowl.
4. The Village in the Roots: Aun, the Sun and Moon Chest, a Rootkin seed, the Giving Law.
5. Market Day: Ammaro the Rememberer, Ferrow''s red paint, a peddler with black flowers.
6. Lantern Night in the Forest: Sela the lake pilgrim, a stolen mirror carp, a first memory.
7. The Red Marks: woodcutters, Wick the runaway bellows-girl, Old Pell''s secret, a sick deer.
8. The First Bloom: the Reckoning is coming; three roads for Book 2 (lakes, desert, iron city).
Details in world/book1.md. Change freely.', 40),
('setting', 'Chapter lengths',
 'tiny: 2 sentences. short: about 150 words (one minute). long: about 700 words (about five minutes read aloud).', 50),
('setting', 'Reckoning',
 'off', 52),
('setting', 'Branch',
 '1 (Book 1, the trunk). Name branches after the book and the choice, e.g. 2·Lantern, 2·Salt, 2·Iron, 3·Kept. See world/books.md.', 53),
('setting', 'Voices',
 '{
  "cast": {
    "narrator": { "voice": "bm_fable", "speed": 0.92 },
    "you": { "voice": "af_river", "speed": 0.95 },
    "fox": { "voice": "af_nicole", "speed": 1.08 },
    "owl": { "voice": "bf_alice", "speed": 0.75 }
  }
}', 54),
('setting', 'World clocks',
 'Six segments each. Tick at each storyteller run by what the players did and what the factions would do.
Bloom (to the Reckoning): 1/6
War (Solvane and Ferrow): 2/6
Red Marks (Ferrow''s cutting reaches the forest): 1/6
Thirst (the desert wells): 3/6
Ash Hand (the secret plot): 1/6
Hush (forgetting spreading): 2/6', 51)
) as v(kind, title, body, sort)
where not exists (select 1 from public.adv_entries);

insert into public.adv_chapters (book, number, title, text_tiny, text_short, text_long, whispers, prompt, script) values
(1, 1, $t$Who? Who?$t$,
 $t$You wake on moss where roots run deep,
and cannot find your name to keep.
A key that hums, with sun and moon,
a grey dog and the bells in tune.$t$,
 $t$You open your eyes on a bed of soft green moss. Morning light, mist, birdsong. You try to remember your name, your home, yesterday. Nothing comes.

A fox with a silver-tipped tail says your words back to you, and vanishes. A scruffy grey dog with one ear up sits watching you, as if he has waited a very long time. In your hand is a small humming key, with a sun on one side and a moon on the other. An owl above you asks, "Who? Whooo?"

Then you see it: the grey cliff behind you is bark. You have been sleeping in the roots of the biggest tree in the world.

Bells ring to the east. Carved stones lead west. The great tree rises above.

What is your name? And where will you go first?$t$,
 $t$Far away, in a different place and a different time, there is a forest so old that the trees have forgotten how young they once were.

And in that forest, on a bed of soft green moss, you open your eyes.

Morning light comes down in long golden ribbons. Mist curls between the ferns. Somewhere a bird is singing the same three notes, over and over, as if it is practising.

You sit up. A single leaf slides off your chest, as big as your two hands together. It is shaped like a heart, and it smells of honey.

You try to remember how you got here. You try to remember where you were yesterday. You try to remember your own name.

Nothing comes. Not a name, not a home, not a face. It is like reaching into a pocket you were sure had something in it, and finding only air.

Hello? Is anybody there?

Hello? Is anybody there?

The words come back to you from behind a fern, in a voice that is almost yours, but a little bit sly. A pair of tufted ears pokes up. A fox with fur the colour of autumn leaves, and a tail tipped in silver, looks at you and grins.

Anybody there? Anybody there?

Then it is gone, with a flick of silver. A whisperfox. Somehow you know that word, even though you know nothing else.

Something else is watching you too.

Sitting very still, just beyond the edge of the moss, is a dog. A wild dog, scruffy and grey, with fur that sticks up in every direction, like a brush that has been used to sweep a chimney. One ear stands up. The other flops over. He does not bark. He does not move. He only watches you with deep brown eyes, the way you would watch a pot that is just about to boil.

When you look back at him, his tail sweeps the moss once. Swish. As if to say: there you are at last.

That is when you notice your hand. It is closed tight around something small and cool. You open your fingers. It is a key.

An old metal key, no longer than your finger. On one side of its round head is a sun. On the other side is a moon. And it is humming, very softly, like a bee asleep in a flower.

Who? Whooo?

High above you, on a branch, sits an owl as grey as a winter morning. Its round eyes blink slowly, first one, then the other.

Who are you? Whooo?

You open your mouth to answer, and close it again. You do not know.

So you stand up, a little wobbly, and you look around properly for the first time. And that is when you see it.

What you thought was a grey cliff behind you is not a cliff at all. It is bark. Bark in great ridges, each one as tall as a house. The moss you slept on is growing on a root, and the root is as wide as a road. You follow it with your eyes, up and up and up, past the mist, past the birds, until your neck aches. The trunk rises so high that its top is lost in the clouds.

It is a tree. The biggest tree in the world. And you have been sleeping in its arms.

A warm breeze moves through the leaves, far above. It sounds like a very large creature, breathing out slowly in its sleep.

For one moment, when the breeze touches the key in your hand, you hear something else. A woman singing, very far away. Then it is gone.

From somewhere to the east, through the trees, comes a sound. Bells. Small, bright bells, all ringing together, as though someone in a village has a very good reason to ring them this morning.

To the west, half hidden in the ferns, a line of old grey stones runs off into the shadows. Each stone has a picture carved on it. A circle with a dot in the middle. It looks like an eye. Or maybe a seed.

And just for a moment, on top of the nearest stone, you think you see someone. Someone very small, no taller than a teapot, with skin like bark and hair like moss and eyes that shine like drops of honey. It looks at you. It puts a tiny finger to its lips. Then you blink, and there is only the stone.

The dog stands up. He looks at you. He looks east, toward the bells. He looks west, toward the stones. He looks up, at the great tree. Then he looks back at you, and waits, as if he has been waiting a very long time, and can wait a little longer.

Who? Whooo?

The owl is still asking. The forest is still listening. And you will have to decide, together, who you are going to be.

What is your name? Say the first name that comes to you, or ask the forest to give you one. And where will you go first? East, toward the bells. West, along the carved stones. Or up, into the roots of the great tree.$t$,
 $j${"athena": "When the breeze touched the key, you heard a woman singing, far away. You almost knew the song.", "bristle": "You know this one's smell. You have guarded their sleep for longer than you can count. You will not leave them now.", "old_lady": "In Mossbrook, the linden bells began to ring all by themselves this morning. The last time that happened, you were a little girl. The Tree has woken someone."}$j$::jsonb,
 $t$What is your name? And where will you go first: east toward the bells, west along the carved stones, or up into the roots of the great tree?$t$,
 $j${"music": "forest", "cast": {"narrator": {"name": "Storyteller", "icon": "📜", "voice": "bm_fable", "speed": 0.92, "pitch": 1, "rate": 0.92}, "you": {"name": "You (Athena)", "icon": "🌱", "voice": "af_river", "speed": 0.95, "pitch": 1.15, "rate": 0.95}, "fox": {"name": "Whisperfox", "icon": "🦊", "voice": "af_nicole", "speed": 1.08, "pitch": 1.4, "rate": 1.1}, "owl": {"name": "Grandmother Owl", "icon": "🦉", "voice": "bf_alice", "speed": 0.75, "pitch": 0.7, "rate": 0.7}}, "script": [{"who": "narrator", "sfx": "birds", "text": "Far away, in a different place and a different time, there is a forest so old that the trees have forgotten how young they once were.", "notes": [{"kind": "motivation", "text": "Open a door into another world. Slow, warm, a bedtime voice."}, {"kind": "sound", "text": "morning birds", "sfx": "birds"}]}, {"who": "narrator", "text": "And in that forest, on a bed of soft green moss, you open your eyes.", "notes": [{"kind": "acting", "text": "a small pause before \"you open your eyes\""}]}, {"who": "narrator", "text": "Morning light comes down in long golden ribbons. Mist curls between the ferns. Somewhere a bird is singing the same three notes, over and over, as if it is practising."}, {"who": "narrator", "text": "You sit up. A single leaf slides off your chest, as big as your two hands together. It is shaped like a heart, and it smells of honey.", "notes": [{"kind": "gesture", "text": "the listener can pretend to brush a leaf off"}]}, {"who": "narrator", "text": "You try to remember how you got here. You try to remember where you were yesterday. You try to remember your own name.", "notes": [{"kind": "acting", "text": "three \"try to remember\"s, each a little slower"}]}, {"who": "narrator", "text": "Nothing comes. Not a name, not a home, not a face. It is like reaching into a pocket you were sure had something in it, and finding only air.", "notes": [{"kind": "motivation", "text": "Puzzling, not frightening. Curious, like a riddle."}]}, {"who": "you", "text": "Hello? Is anybody there?", "notes": [{"kind": "acting", "text": "small, unsure, then a little louder"}, {"kind": "thought", "text": "You: Where am I? Who am I?"}]}, {"who": "fox", "text": "Hello? Is anybody there?", "notes": [{"kind": "acting", "text": "the same words back, almost your voice but sly"}, {"kind": "blocking", "text": "from behind a fern"}]}, {"who": "narrator", "text": "The words come back to you from behind a fern, in a voice that is almost yours, but a little bit sly. A pair of tufted ears pokes up. A fox with fur the colour of autumn leaves, and a tail tipped in silver, looks at you and grins."}, {"who": "fox", "text": "Anybody there? Anybody there?", "notes": [{"kind": "acting", "text": "teasing, sing-song, a giggle at the end"}]}, {"who": "narrator", "text": "Then it is gone, with a flick of silver. A whisperfox. Somehow you know that word, even though you know nothing else.", "notes": [{"kind": "thought", "text": "Storyteller: the first thing the player remembers is a forest word. A clue."}]}, {"who": "narrator", "sfx": "growl", "text": "Something else is watching you too.", "notes": [{"kind": "sound", "text": "a very soft growl, more grumble than threat", "sfx": "growl"}]}, {"who": "narrator", "text": "Sitting very still, just beyond the edge of the moss, is a dog. A wild dog, scruffy and grey, with fur that sticks up in every direction, like a brush that has been used to sweep a chimney. One ear stands up. The other flops over. He does not bark. He does not move. He only watches you with deep brown eyes, the way you would watch a pot that is just about to boil.", "notes": [{"kind": "motivation", "text": "This is Bristle. Make him lovable at once."}, {"kind": "acting", "text": "smile on \"one ear stands up, the other flops over\""}]}, {"who": "narrator", "text": "When you look back at him, his tail sweeps the moss once. Swish. As if to say: there you are at last.", "notes": [{"kind": "thought", "text": "Bristle: There you are. I waited so long."}]}, {"who": "narrator", "sfx": "magic", "text": "That is when you notice your hand. It is closed tight around something small and cool. You open your fingers. It is a key.", "notes": [{"kind": "sound", "text": "a sparkle as the fingers open", "sfx": "magic"}, {"kind": "gesture", "text": "open a closed fist slowly"}]}, {"who": "narrator", "sfx": "hum", "text": "An old metal key, no longer than your finger. On one side of its round head is a sun. On the other side is a moon. And it is humming, very softly, like a bee asleep in a flower.", "notes": [{"kind": "sound", "text": "the key hums", "sfx": "hum"}, {"kind": "motivation", "text": "The Sun and Moon key from the old car-ride story."}]}, {"who": "owl", "sfx": "hoot", "text": "Who? Whooo?", "notes": [{"kind": "sound", "text": "an owl hoot", "sfx": "hoot"}, {"kind": "acting", "text": "slow, deep, a real question"}]}, {"who": "narrator", "text": "High above you, on a branch, sits an owl as grey as a winter morning. Its round eyes blink slowly, first one, then the other."}, {"who": "owl", "text": "Who are you? Whooo?", "notes": [{"kind": "motivation", "text": "Grandmother Owl knows every sleeper's name. She wants yours."}]}, {"who": "narrator", "text": "You open your mouth to answer, and close it again. You do not know."}, {"who": "narrator", "sfx": "steps", "text": "So you stand up, a little wobbly, and you look around properly for the first time. And that is when you see it.", "notes": [{"kind": "sound", "text": "footsteps on moss", "sfx": "steps"}, {"kind": "acting", "text": "build up to \"see it\""}]}, {"who": "narrator", "text": "What you thought was a grey cliff behind you is not a cliff at all. It is bark. Bark in great ridges, each one as tall as a house. The moss you slept on is growing on a root, and the root is as wide as a road. You follow it with your eyes, up and up and up, past the mist, past the birds, until your neck aches. The trunk rises so high that its top is lost in the clouds.", "notes": [{"kind": "acting", "text": "\"up and up and up\" rising in pitch"}, {"kind": "gesture", "text": "look up, higher, higher"}]}, {"who": "narrator", "text": "It is a tree. The biggest tree in the world. And you have been sleeping in its arms.", "notes": [{"kind": "motivation", "text": "Vael, the World Tree. Wonder, and safety: you were held."}]}, {"who": "narrator", "sfx": "wind", "text": "A warm breeze moves through the leaves, far above. It sounds like a very large creature, breathing out slowly in its sleep.", "notes": [{"kind": "sound", "text": "wind in high leaves", "sfx": "wind"}]}, {"who": "narrator", "text": "For one moment, when the breeze touches the key in your hand, you hear something else. A woman singing, very far away. Then it is gone.", "notes": [{"kind": "thought", "text": "Storyteller: the first thread of the true past. Do not explain it."}]}, {"who": "narrator", "sfx": "bell", "text": "From somewhere to the east, through the trees, comes a sound. Bells. Small, bright bells, all ringing together, as though someone in a village has a very good reason to ring them this morning.", "notes": [{"kind": "sound", "text": "distant bells", "sfx": "bell"}, {"kind": "motivation", "text": "The linden bells of Mossbrook are ringing by themselves."}]}, {"who": "narrator", "text": "To the west, half hidden in the ferns, a line of old grey stones runs off into the shadows. Each stone has a picture carved on it. A circle with a dot in the middle. It looks like an eye. Or maybe a seed.", "notes": [{"kind": "motivation", "text": "The Carved Stones to Aun, with the Rootkin seed-eye sign."}]}, {"who": "narrator", "text": "And just for a moment, on top of the nearest stone, you think you see someone. Someone very small, no taller than a teapot, with skin like bark and hair like moss and eyes that shine like drops of honey. It looks at you. It puts a tiny finger to its lips. Then you blink, and there is only the stone.", "notes": [{"kind": "acting", "text": "a whisper on \"puts a tiny finger to its lips\""}, {"kind": "gesture", "text": "finger to lips: shh"}, {"kind": "motivation", "text": "A Rootkin glimmer. Only the Seedling can see it."}]}, {"who": "narrator", "text": "The dog stands up. He looks at you. He looks east, toward the bells. He looks west, toward the stones. He looks up, at the great tree. Then he looks back at you, and waits, as if he has been waiting a very long time, and can wait a little longer.", "notes": [{"kind": "blocking", "text": "Bristle turns his head three ways: east, west, up"}]}, {"who": "owl", "sfx": "hoot", "text": "Who? Whooo?", "notes": [{"kind": "sound", "text": "owl", "sfx": "hoot"}]}, {"who": "narrator", "text": "The owl is still asking. The forest is still listening. And you will have to decide, together, who you are going to be."}, {"who": "narrator", "text": "What is your name? Say the first name that comes to you, or ask the forest to give you one. And where will you go first? East, toward the bells. West, along the carved stones. Or up, into the roots of the great tree.", "notes": [{"kind": "acting", "text": "slow and clear; leave space after each choice"}, {"kind": "motivation", "text": "Hand the story to the family."}]}]}$j$::jsonb)
on conflict (book, number) do nothing;

-- ---------------------------------------------------------------------------
-- Places: Ondra → regions → the Greenhollow's places → rooms.
-- ---------------------------------------------------------------------------
insert into public.adv_places (kind, name, emoji, color, summary, x, y, w, h, sort)
select 'world', 'Ondra', '🗺️', '#FFF1C9', 'The world. The World Tree stands at its centre.', 0, 0, 100, 100, 0
where not exists (select 1 from public.adv_places);

insert into public.adv_places (parent_id, kind, name, emoji, color, summary, x, y, w, h, sort)
select p.id, v.kind, v.name, v.emoji, v.color, v.summary, v.x, v.y, v.w, v.h, v.sort
from public.adv_places p,
(values
 ('wild',   'The Greenhollow',        '🌳', '#CDEFE0', 'The forest of the World Tree. Neutral ground: no army walks under Vael.',            38::real, 38::real, 24::real, 24::real, 1),
 ('region', 'The Mirrorlakes',        '🏮', '#D6ECF7', 'Nine lakes made by the Moon''s tears. Floating city of Velomar, the Lantern Isle.',    36::real,  6::real, 28::real, 22::real, 2),
 ('town',   'Solvane',                '🏰', '#FFE9A8', 'The City of Gold Domes, half drowned. The Sunward Court and a child queen.',           70::real,  6::real, 24::real, 20::real, 3),
 ('town',   'Ferrow',                 '⚒️', '#E3E3D8', 'The City of Iron and Canals. "No crown over us." Debt-children at the bellows.',     70::real, 38::real, 24::real, 20::real, 4),
 ('region', 'The Ashen Reach',        '🏜️', '#F9DDB0', 'The desert that was a forest. Caravans, singing dunes, Ibbasar the library oasis.',   36::real, 70::real, 30::real, 24::real, 5),
 ('region', 'The Tallgrass',          '🐎', '#E4F2C6', 'The sea of grass. Horse clans, eagles, and new fences.',                               4::real,  8::real, 26::real, 26::real, 6),
 ('region', 'The Stairstep Mountains','⛰️', '#E8DAF7', 'Terraced mountains, grass bridges, knot-records the Hush cannot erase.',                4::real, 64::real, 26::real, 28::real, 7),
 ('region', 'The Scattered Isles',    '🌊', '#C9E8F2', 'Wayfinders who cross the sea by stars and swells.',                                   72::real, 70::real, 24::real, 22::real, 8)
) as v(kind, name, emoji, color, summary, x, y, w, h, sort)
where p.kind = 'world' and p.parent_id is null
  and not exists (select 1 from public.adv_places where name = v.name);

insert into public.adv_places (parent_id, kind, name, emoji, color, summary, x, y, w, h, sort)
select p.id, v.kind, v.name, v.emoji, v.color, v.summary, v.x, v.y, v.w, v.h, v.sort
from public.adv_places p,
(values
 ('other',    'Vael, the World Tree', '🌳', '#B9E0C8', 'So big its roots are roads and its crown is lost in cloud. The Listening Root, the Rings, the Heart Door. A pale gold bud.', 36::real,  4::real, 28::real, 30::real, 1),
 ('wild',     'The Waking Hollow',    '🌱', '#CDEFE0', 'A bowl of moss inside a great root, where Seedlings sleep. Where the story begins.',                                   40::real, 42::real, 18::real, 18::real, 2),
 ('town',     'Mossbrook',            '🏘️', '#F9C8A8', 'The small village, an hour east along the Singing Stream. Linden bells, hearthwisps, famous bread.',                   68::real, 38::real, 28::real, 24::real, 3),
 ('town',     'Aun, the Old Village', '🏛️', '#E8DAF7', 'West along the Carved Stones. A village grown from living roots, empty since the Great Forgetting.',                  4::real, 38::real, 28::real, 24::real, 4),
 ('wild',     'The Ironwood Stand',   '🪵', '#D9CBB5', 'Trees with wood as hard as iron, only near Vael. Ferrow wants it.',                                                  66::real, 72::real, 28::real, 22::real, 5),
 ('wild',     'The Mirefen',          '🫧', '#D6ECF7', 'A boggy dell. Mire-lights at night. Rude travellers get lost.',                                                       6::real, 72::real, 24::real, 20::real, 6),
 ('building', 'Grandmother Owl''s Oak','🦉', '#E3E3D8', 'A dead oak, hollow as a tower. Home of the owl who asks "Who?"',                                                    38::real, 72::real, 22::real, 20::real, 7)
) as v(kind, name, emoji, color, summary, x, y, w, h, sort)
where p.name = 'The Greenhollow'
  and not exists (select 1 from public.adv_places where name = v.name);

insert into public.adv_places (parent_id, kind, name, emoji, color, summary, x, y, w, h, sort)
select p.id, v.kind, v.name, v.emoji, v.color, v.summary, v.x, v.y, v.w, v.h, v.sort
from public.adv_places p,
(values
 ('Mossbrook',            'room',     'The green and the linden bells', '🔔', '#FFE9A8', 'A great linden hung with small bronze bells. They ring by themselves when the Tree wakes someone.', 36::real, 34::real, 28::real, 28::real, 1),
 ('Mossbrook',            'building', 'Granny Wren''s cottage',          '🏠', '#E8DAF7', 'Crooked, at the forest edge. A tame crow and a sulky hearthwisp.',                                  4::real, 10::real, 26::real, 24::real, 2),
 ('Mossbrook',            'building', 'The mill',                        '🌾', '#F9C8A8', 'Tobin''s family mill on the Singing Stream.',                                                     70::real, 10::real, 26::real, 24::real, 3),
 ('Aun, the Old Village', 'room',     'The Grown Hall',                  '🧰', '#FFE9A8', 'A round room of living root. The Sun and Moon Chest stands in the middle.',                       34::real, 34::real, 32::real, 30::real, 1),
 ('Aun, the Old Village', 'room',     'The Wall of Hands',               '✋', '#CDEFE0', 'Hundreds of small hand-prints in the living wood, and a few bigger ones.',                         6::real, 10::real, 24::real, 22::real, 2)
) as v(parent, kind, name, emoji, color, summary, x, y, w, h, sort)
where p.name = v.parent
  and not exists (select 1 from public.adv_places where name = v.name);

insert into public.adv_notes (subject_type, subject_id, body, chapter_id)
select 'role', r.id, 'Guarded Athena''s sleep in the Waking Hollow. Swished his tail once when she woke: "there you are at last."', c.id
from public.adv_roles r, public.adv_chapters c
where r.key = 'bristle' and c.book = 1 and c.number = 1
  and not exists (select 1 from public.adv_notes);

insert into public.adv_chapters (book, number, title, status, plan) values
(1, 2, 'The Bells of Mossbrook',      'planned', 'The bells ring by themselves; Granny Wren ("Took your time"), calls the dog Bristle; bread first, questions after; a sulking hearthwisp after a quarrel; Tobin gawps at the Tree''s child. Puzzle: get the bread to rise (kind: make up the quarrel; clever: apology and honey; brave: reach behind the stove). See world/book1.md.'),
(1, 3, 'The Listening Root',          'planned', 'Climb the Listening Root with Granny Wren, Tobin and Bristle. Hear the Tree, touch a Ring (a flash of the green Greenreach), hear the Sun and Moon story. Athena alone sees the gold bud. The Naming Bowl at the Singing Stream.'),
(1, 4, 'The Village in the Roots',    'planned', 'Aun. The Root Gate opens to a thank-you. The Wall of Hands. The Sun and Moon Chest: sun lock and moon lock. Inside: a warm Rootkin seed, a bark-scroll with the Giving Law, the shape of a missing moon key. A Rootkin glimmer follows; Nettle sees it too.'),
(1, 5, 'Market Day',                  'planned', 'Ammaro the Rememberer sings the Song of the Green That Was. Surveyor Ilse Brand of Ferrow paints red marks on ironwood. A smiling peddler sells black flowers (nightbloom); Bristle growls.'),
(1, 6, 'Lantern Night in the Forest', 'planned', 'Sela Dawnreed, a lake pilgrim with a mirror carp. A first memory in its scales. A small Lantern Night. The carp is stolen; the stranger is blamed. Clues lead to a thornhog, an apple pie and Tobin. Sela is Unlanterned: keep her secret?'),
(1, 7, 'The Red Marks',               'planned', 'Ferrow''s woodcutters with a paper the Headwoman signed. Wick, a runaway debt-child. Old Pell''s secret. A mossback deer in the grey sleep from nightbloom. The family cannot do everything; what they leave has a cost.'),
(1, 8, 'The First Bloom',             'planned', 'Warden-Mother Ysolt at the Listening Root: the Tree will bloom, the Reckoning is coming, the Moon Key is in the lakes. The Dawn Stag looks at Bristle. A first true memory. Three roads for Book 2: the Lantern Road, the Salt Road, the Iron Road.')
on conflict (book, number) do nothing;
