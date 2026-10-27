# Adventure — To-do

## Next
- [ ] **Create the database tables.** Supabase's confirmation prompt went unanswered twice. Either approve it when Claude retries, or paste `supabase/001_adventure.sql`, then `003_world.sql`, then `002_seed.sql` into the Supabase SQL editor (Family project).
- [ ] **Set up the nightly heartbeat.** A scheduled Claude task, once a night (for example 2 a.m.), that says "Run the Adventure storyteller" and follows `storyteller.md`. It needs the Supabase connector granted to the scheduled task. Claude can create it on request.
- [ ] Try the page on the iPad: sign in, read aloud, the microphone, sending a scene.
- [ ] Publish on GitHub Pages so the microphone and the database work on the iPad.

## Later
- [ ] **Story-creation page.** Jimmy and Athena rebuild the old car-ride adventures. Feed in the saved ChatGPT chats (kept in a `private/` folder, never committed), and Claude fills the page with questions and confirmations to build the world bible.
- [ ] Rules engine for daytime play: moving between known places, items and keys, riddles with known answers, hints, and small scenes the storyteller prepares each night.
- [ ] Map: drawn paths between places, and a background picture per map.
- [ ] Record bedtime readings.
- [ ] A ping from the page to wake the storyteller early (optional).

## To research (Jimmy)
- **Twine** (twinery.org): branching stories as linked passages; exports one HTML file. Try Harlowe first, SugarCube for more control. Twee is its plain-text format.
- **Ink** (inklestudios.com/ink): a scripting language for branching stories, used in *80 Days* and *Heaven's Vault*. Good for seeing how pros structure choices and state.
- **Yarn Spinner**: dialogue-tree tool, good for characters talking to each other in order.
- **Emily Short's blog** (emshort.blog): essays on interactive fiction design, especially "storylets" and quality-based narrative.
- **Storylets / quality-based narrative** (Fallen London, *Sunless Sea*): content unlocked by story state, a good model for the rules engine.
- **"Play-by-post" and correspondence role-playing** forums: how human game masters pace slow, asynchronous games.
- **Web Speech API** on MDN: `speechSynthesis` (reading aloud) and `SpeechRecognition` (talking), and their Safari limits.
- **Supabase Row Level Security** guide: how the database decides who can read and write.
- **Claude Code scheduled tasks** docs at code.claude.com: how the nightly heartbeat runs.
- **Prompting for consistency**: keeping an AI storyteller consistent with a world bible and a facts list (Anthropic prompt engineering docs).
