-- ============================================================================
-- Adventure — Book 1 seed: roles, world bible, and chapter 1 (the crypt)
-- Made-up story content only. Re-runnable: skips rows that already exist.
-- ============================================================================

insert into public.adv_roles (key, name, emoji, color, blurb, voice, sort) values
('athena',      'Athena',        '🧭', '#F9C8A8', 'A brave explorer with the key from the Sun and Moon Chest.',
 'Curious and careful. Asks good questions. Speaks in short, bold sentences.', 1),
('bristle',     'Bristle',       '🐕', '#CDEFE0', 'A wild dog who follows Athena without a sound.',
 'Cannot talk. Shows feelings with growls, sniffs, wags and where he looks. Notices smells and sounds first.', 2),
('old_lady',    'The Old Lady',  '👵', '#E8DAF7', 'Lives at the edge of the village and remembers the old days.',
 'Warm, a little mysterious, speaks in riddles and old sayings. Knows more than she says.', 3),
('storyteller', 'Storyteller',   '📜', '#FFE9A8', 'The dungeon master. Moves the world and its weather, sounds and surprises.',
 'The narrator''s own voice. Describes, never decides for the other characters.', 4)
on conflict (key) do nothing;

insert into public.adv_entries (kind, title, body, sort)
select * from (values
('rule', 'How the storyteller writes',
 'For children around seven and their family. Warm, exciting, never scary in a way that keeps someone up at night.
Short sentences that read well aloud.
Every chapter ends with a question or a puzzle, with 2 or 3 clear options, and room for any other idea.
Puzzles can have more than one right answer. Clever, kind and brave answers send the story different ways.
A wrong answer brings a hint, never a dead end.
If nobody answers, the story keeps going: the characters act on their own in a sensible way.
Use every beat the family sent, in the order they were said. What one character says, the others can react to.', 1),
('world', 'The village',
 'A small village with stone houses and strange symbols carved over the doors. Something sad happened here long ago, and nobody likes to talk about it.', 10),
('world', 'The crypt',
 'An old stone crypt beyond the village. Dusty air, echoing walls, and a wind that seems to come from nowhere. At its heart stands an old wooden chest covered in the same symbols as the village doors.', 11),
('world', 'The Sun and Moon Chest',
 'Athena opened it earlier and found a cool metal key that almost hums with energy, as if it wants to go somewhere.', 12),
('history', 'What happened before Book 1',
 'Athena found the key in the Sun and Moon Chest. She meant to leave Bristle behind, but the dog followed her into the crypt. Now she stands at the chest in the heart of the crypt, key in hand.', 20),
('theme', 'Book 1 themes',
 'Trust between Athena and Bristle. Being brave and careful at the same time. Learning the village''s sad secret and helping to heal it.', 30),
('plan', 'Book 1 outline (draft)',
 '1. The crypt chest.
2. A hidden passage behind a carved stone.
3. The Old Lady''s riddle about the sun and the moon.
4. Bristle finds a trail no one else can.
5. The village''s sad secret.
6. A choice: keep the treasure or give it back.
7. The ending: the village remembers how to smile.
About 7 chapters. Change freely.', 40),
('setting', 'Chapter lengths',
 'tiny: 2 sentences. short: about 150 words (one minute). long: about 700 words (about five minutes read aloud).', 50)
) as v(kind, title, body, sort)
where not exists (select 1 from public.adv_entries);

insert into public.adv_chapters (book, number, title, text_tiny, text_short, text_long, whispers, prompt) values
(1, 1, 'The Chest in the Crypt',
 'Athena stands in the heart of the crypt with the humming key in her hand. An old chest waits in front of her, and Bristle growls softly behind her.',
 'Athena steps into the crypt. The air smells of ancient dust and earth, and every footstep echoes off the stone walls. In her hand, the key from the Sun and Moon Chest feels cool and almost hums, as if it wants her to keep going.

Behind her comes a soft pat-pat-pat. Bristle followed her after all. It''s strange, but she''s glad.

In the middle of the room stands an old wooden chest, covered in the same symbols she saw over the village doors. Its lid is open just a crack. A wind blows from nowhere. Bristle gives a low growl.

What will Athena do? Open the chest carefully, look around the room first, or ask Bristle what he knows?',
 'Athena steps cautiously into the crypt. The air is thick with the scent of ancient dust and earth. The stone walls echo softly with every step, and the faint light from outside barely reaches the dark corridors ahead.

She feels the weight of the key from the Sun and Moon Chest in her hand. Its cool metal almost vibrates, as if it is urging her forward. It wants to go somewhere. It wants to open something.

As she walks deeper, she hears it: pat-pat-pat. The soft sound of paws behind her. Bristle. She had meant to leave the wild dog behind, but here he is, keeping pace without a sound. Athena is surprised to find that she is glad. Maybe Bristle is more than just a wild creature after all.

The corridor opens into a round room. In the very middle stands a chest. Its old wood is covered in strange symbols, just like the ones carved over the doors in the village. Suns. Moons. A shape like an eye, or maybe a seed. The lid is open just a crack, as if the chest is inviting her to look inside.

A wind whispers through the room, though there is no window and no door except the one behind her. The dust on the floor swirls in a little circle and settles again.

Then, from behind her, a low growl. Bristle. He is not growling at her. He is standing very still, ears up, nose pointed somewhere in the shadows. Athena does not turn around. She keeps her eyes on the chest.

She steps forward. The key feels warmer now. Her fingers curl around the handle of the chest, and the metal is cold under her skin. This is it. Whatever is inside might tell her what really happened to the village, all those years ago.

But the room is so quiet. Too quiet. And Bristle is still growling.

What will Athena do?

She could open the chest carefully, right now. She could look around the room first, at the walls and the shadows, in case there are clues or hidden passages. Or she could kneel down and ask Bristle what he knows. He can''t talk, but the way he moves might tell her something.

Or maybe she has a different idea altogether.',
 '{"bristle": "You smell something no one else can: fresh flowers, deep under the dust, coming from the far corner of the room.", "old_lady": "Far away in the village, you wake up from a nap with a start. You know that feeling. Someone has found the crypt."}'::jsonb,
 'Open the chest carefully, look around the room first, or ask Bristle what he knows?')
on conflict (book, number) do nothing;
