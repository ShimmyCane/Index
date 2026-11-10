# Bar Glide — lessons

- 2026-11-09: A request named after a real arcade game gets an original name and art; say so in the convo and keep the mechanics.
- 2026-11-09: In a lane game, let a customer standing in the doorway catch a mug that reaches the end. The first rule (must be past the door) broke glasses that looked caught.
- 2026-11-09: Test bots need care too: a bot that called release() before switching lanes threw extra mugs and looked like a game bug. Read the entity positions (`BarGlide.debug.peek()`) before blaming the game.
- 2026-11-09: Pixel art as text rows plus a tiny 3x5 font keeps a whole retro game in plain files, crisp at any size with `image-rendering: pixelated`.
- 2026-11-09: Voice-typed answers can garble a yes ("Old barb glide" for "OK, Bar Glide"). Record the words as written, act on the likely reading, and ask to confirm in the next convo.
- 2026-11-09: When a tap can mean two things (grab a tip or pour), let `BarGlide.tap()` decide first and fall back to pouring. The canvas handler stays simple.
- 2026-11-09: The pixel font needs every symbol a pop-up uses; "+150" showed as "?150" until '+' was added. Check pop-up text in a screenshot.
- 2026-11-09: On touch screens a timing game needs slack: Jimmy asked for a grace window (about 250 ms) on the last-moment catch. Build it as a visible wobble, so the player sees the chance.
- 2026-11-09: Shape difficulty as a story (a day at the bar: morning tutorial, lunch rush, quiet afternoon, dinner, night). It gives each level a name and a reason for the change in pace and bars.
- 2026-11-09: In a test, a round can end itself when the last customer leaves; park a customer before testing a mechanic, or the state changes under the assertion.
- 2026-11-09: Answers left as PR or file comments are not in the file: copy them into the convo word for word before acting.
