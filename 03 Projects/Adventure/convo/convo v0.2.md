# Adventure — Convo v0.2

**Project:** Adventure
**Round:** Jimmy's answers to convo v0.1 (given as review comments, recorded here)

1. **Listening and answering**
   - The catch-up depends on how long it has been. After a whole day, about a five-minute read. After a couple of minutes, a couple of sentences. The goal is to entertain the kids.
   - Then a row of pictures of the characters. Tap a character to give its input.
   - Input is spoken: native transcription turns it into text, and you keep appending until satisfied. No editing, no takebacks.
   - Characters can interact in order, and time matters: the dog says something, then the old lady, then the dungeon master, then the dog reacts. It all builds into one scene that is packaged and sent at the end.

2. **Nightly run**
   - The storyteller writes straight into Supabase. No approval step.
   - When the page loads, it checks whether the storyteller is still "asleep" (moves are waiting, nothing new yet) and says so.
   - The heartbeat (a scheduled Claude task) goes on the to-do list to learn and set up.

3. **Under the hood**
   - Full control: everything editable as text.
   - The storyteller may also change the world, past history, the overarching narrative and planned progression, characters, introductions and themes.
   - Everything is logged so it can be rolled back by date or version.

4. **First book and roles**
   - A story-creation page comes later. Jimmy and Athena will rebuild their old adventures from the saved chats, and Claude will help fill it with questions and confirmations. On the to-do list for now.

5. **Supabase**
   - Use the existing family login that Supabase already accepts.

6. **Learning**
   - Add other insights and references to the to-do list for Jimmy to research.

## Choices Claude made for the MVP

- Supabase project: the Family project, tables prefixed `adv_`, signed-in users only.
- Starting roles: Athena, Bristle the dog, the Old Lady, and the Storyteller (the dungeon master's own voice in a scene).
- Book 1 starts from the crypt and the Sun and Moon Chest, so there is something to play tonight. The story-creation page can replace it later.
- If nobody sends a scene, the storyteller still writes a short page each night, so the story never stalls.
