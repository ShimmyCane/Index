# Our Family Compass — lessons

## 2026-11-17 (framework round)
1. **For a thinking project, the first build is the map plus a place to think,** not the content. Rooms with questions and dated thoughts let the framework be tested by use before anything is written for the children.
2. **A public repo and a personal project split cleanly at structure and content.** Structure (rooms, questions, formats, rules) is public; answers and stories stay on the device. Say this in the convo, so questions are asked there and answered elsewhere.
3. **Make the page obey the framework's own rule.** "A change of mind is kept with its date" became append-only thoughts with a `revises` pointer. The tool then teaches the idea.
4. **Give one thing one name.** The whole is the Compass, so the room is Principles.
5. **Map the abstract tiers to the section of a building** (ground, rooms, sky for levels 1, 2, 3). One drawing then carries two ideas.
6. **SVG map labels:** keep a room's one-line label under about 22 characters at 14 px in a 244-unit room, and hide the line on a phone. A longer one ran out of the Library.
7. **A source from an AI chat is unchecked until opened.** List it as unchecked and say what claim it must support.

## 2026-11-17 (round 2)
8. **Make a growing structure data from the start.** Rooms, map places and connections live in one object with a version stamp, and the page prefers a newer validated copy from the database. Redrawing or adding a room then needs no code change. Validate the shape before keeping it (id pattern, string lists, colour).
9. **Append-only tables fit "never overwrite".** Thoughts have no update grant, so even a bug cannot rewrite one. The test checks that an update is refused.
10. **One column leaves room for more voices.** `compass` (default `main`) on every table, and `entered_by` for something typed in for someone else, cost nothing now.
11. **Test a microphone feature headless.** Chromium with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` and the microphone permission records a real clip. This build records `audio/mp4`, so the upload path ends in `.m4a`; a test that assumed `.webm` was wrong, not the page.
12. **Mock the database in the browser test** with `context.route` on the project host: sign in, GET lists, POST rows, storage upload. It checks the row shape and the sync order (pull, then push) without a real account.
13. **Do not claim research you only saw in a search result.** Each research row says how strong the evidence looks and that the source was not opened. A null trial (Philosophy for Children) belongs next to the promising one.
14. **The Supabase tool can wait for a confirmation again (second project in a row).** Plan for paste-by-hand from the start.
15. **When a test tool covers part of the page, close the dialog first.** The room sheet covers the gear; clicks on it time out. That is the design, not a bug.
