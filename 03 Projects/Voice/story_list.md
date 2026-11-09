# Voice — Story list

Stories in the same vein: old public-domain tales with a clear lesson, written as **script stories** (a cast of voices, director's notes hidden behind 🎬). Every story has **English and 中文**, plus a **third language from the story's part of the world**, with a soft synthesized tune from that place.

Voice support for each third language:
- **Kokoro** (free, open, works offline once made): English (US and UK), Chinese, Japanese, French, Spanish, Italian, Portuguese (Brazil), Hindi.
- **iPad voice only** (Kokoro has no voice for these yet): Korean, Dutch, Danish, Australian English. Download a Premium or Enhanced voice for the language in the iPad's Settings first.

## On the shelf now

| # | Story | Source | Lesson | Third language | Tune | Status |
|---|---|---|---|---|---|---|
| 1 | 🐟 The Fisherman and the Goldfish | Russian folk tale (as in Pushkin, 1833) | Greed loses everything; love is enough | 日本語 Japanese (Kokoro `jm_kumo`) | Koto, *in* scale | ✅ EN · 中文 · 日本語 |
| 2 | 🐺 The Boy Who Cried Wolf | Aesop | A liar is not believed even when he tells the truth | Español Spanish (Kokoro `em_alex`) | Spanish guitar | ✅ EN · 中文 · ES |
| 3 | 🧺 Little Red Riding Hood | Perrault, 1697 (the original, with its moral) | Beware of sweet-talking strangers | Français French (Kokoro `ff_siwis`) | Musette accordion waltz | ✅ EN · 中文 · FR (cast in EN and 中文) |

## Ten more to write

| # | Story | Source | Lesson | Cast (Kokoro voices, English) | Third language | Tune | Sound cues |
|---|---|---|---|---|---|---|---|
| 4 | 🐢 The Tortoise and the Hare | Aesop | Slow and steady wins the race | Narrator, Hare (quick, boastful), Tortoise (slow, calm), Fox (referee) | Aussie English (iPad voice en-AU), told as a race across the outback | Didgeridoo and clapsticks | starting whistle, snoring, crowd cheer |
| 5 | 🐉 Urashima Tarō | Japanese folk tale (8th century) | Time and home are precious | Narrator, Tarō (kind young fisherman), the Turtle, Princess Otohime | 日本語 Japanese (Kokoro) | Koto | waves, bubbles, the box opening (smoke) |
| 6 | ☀️ The Sun and the Moon (해님 달님) | Korean folk tale | Brave, quick-thinking children; never open the door to a trick | Narrator, Brother, Sister, Mother, the Tiger (hungry, sly) | 한국어 Korean (iPad voice) | Gayageum pentatonic | knock, a rope creaking, tiger growl, wind |
| 7 | 🍲 Stone Soup (La soupe au caillou) | French folk tale | Sharing makes a feast out of nothing | Narrator, the Traveller (cheerful), villagers (each brings something) | Français French (Kokoro) | Accordion waltz | bubbling pot, door knocks, spoon clinks |
| 8 | 🌷 The Boy and the Dike | The "little Dutch boy", from *Hans Brinker* (1865) | Small courage can save a whole town | Narrator, Peter (brave, cold, tired), Mother, the Townsfolk | Nederlands Dutch (iPad voice) | Barrel organ | trickling water, wind, church bell |
| 9 | 🪵 Pinocchio and the Talking Cricket | Collodi, 1883 (one episode) | Listen to the voice that tells you the truth | Narrator, Pinocchio (cheeky), Geppetto (gentle), the Cricket (wise, tiny) | Italiano Italian (Kokoro `im_nicola`, `if_sara`) | Mandolin tremolo | wood carving, cricket chirps, a hammer |
| 10 | 🐜 The Ant and the Grasshopper | Aesop | Work now, rest later; and share with those in need | Narrator, Ant (busy), Grasshopper (sings), Queen Ant | Español Spanish (Kokoro `ef_dora`), set in a Spanish summer | Guitar | fiddle, wind, snow crunch |
| 11 | 🐒 The Monkey and the Crocodile | Panchatantra (India) | Quick wits beat strength | Narrator, Monkey (clever), Crocodile (greedy), Crocodile's wife | हिन्दी Hindi (Kokoro `hf_alpha`, `hm_omega`) | Sitar-style drone (to add) | river splash, jamun fruit falling, laughter |
| 12 | 🦁 The Lion and the Mouse | Aesop | No kindness is ever wasted; the small can help the great | Narrator, Lion (proud, then grateful), Mouse (tiny, brave), Hunters | Português Portuguese (Kokoro `pf_dora`, `pm_alex`), set in a Brazilian forest | Samba-style rhythm (to add) | roar, net rope, nibbling |
| 13 | 👑 The Emperor's New Clothes | Andersen (Danish), 1837 | Say what is true, even when everyone else won't | Narrator, Emperor (vain), two Swindlers (smooth), Minister, a Child | Dansk Danish (iPad voice) | Barrel organ (to adapt) | trumpet fanfare, crowd murmur, a child's laugh |

## How a story is added

1. Write the English script with a cast and director's notes (`stories/<id>.js`, see `red_hood.js`).
2. Write the 中文 and third-language files line by line, with `group` and `notesFrom` pointing at the English one.
3. Make the audio: `python3 -I tools/make_kokoro.py --model <dir> <ids>`. Languages Kokoro does not speak use the iPad voice, so they have no audio file.
4. Add the script tags to `index.html`.
5. A new tune style goes into `js/sound.js` (`STYLES`).
