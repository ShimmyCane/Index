# Mind Palace — convo v0.1 (2026-11-17)

Jimmy asked to start the project and gave a concept (a mind palace as an architectural exploration game for Felix and himself) and a specification 0.1 (vision, hybrid organization, data structure, AI collaborator, renderer independence, a 12-point MVP, a five-phase roadmap). The specification asks for a browser prototype with three.js first, and names Godot and Gaussian splats as later renderers.

The MVP (0.1.0) is built on the choices below. Answer inline under each question; anything left blank keeps the choice made.

## Choices made without asking

1. **Browser and three.js first**, as the specification's section 7 says. Godot and splats are not started.
   > **Jimmy, 2026-11-17:** Please start Godot and splats. If this is a desktop application, then plan for schematics.
2. **Three layers:** database → scene description → renderer. Only the last one knows three.js.
3. **Worlds are floating islands, rooms are open-topped rooms, bridges join the worlds.** Not real architecture.
4. **The MVP's 12 points, plus practice and growth** from the spoken request (phase 4 basics). The AI collaborator (phase 3) is not built.
5. **Two kinds of practice, counted apart** (what, where), because the specification asks to tell knowing the place from knowing the thing.
6. **Device storage only.** No database, no sign-in.
7. **A sample palace of made-up school facts** (Space, Living Things, Making Things), so the first run shows something.
8. **No tile on the nursery home page yet.** `index.html` is yours; say the word and I add the link.

## Questions

1. **Whose palace is this first?** I chose track A (family play: pastel, large buttons, few words), with the denser tools in collapsed panels. If it is mainly your own working tool, track B (studio: denser, more options on screen) fits better. Which one?
   > **Jimmy, 2026-11-17:** Different ones for family.

2. **One palace or several?** Now there is one palace per device. Should Felix and you each have your own (a picker at the start), or share one?
   > **Jimmy, 2026-11-17:** One.

3. **Should it follow you between devices?** Now it stays on one device, with "Save a copy" to move it by hand. A family database table would keep it in step between the iPad and the computer, behind the family sign-in. Worth it now, or later?
   > **Jimmy, 2026-11-17:** Yes, sync with the family database. Plan ahead.

4. **What goes in first?** What does Felix want to remember (spelling, times tables, planets, Chinese characters)? And you? The answer decides the next objects and whether a memory needs a picture or a sound.
   > **Jimmy, 2026-11-17:** Don't know about Felix's, will ask him. For me, childhood.

5. **The AI architect.** The plan is the copy-and-paste loop: the page writes a prompt with your palace, you paste it into any AI chat, paste the reply back, and see a preview to accept in whole or in part. No key in the page. Is that the right first step, or do you want it to talk to an AI directly?
   > **Jimmy, 2026-11-17:** Sure.

6. **How should things look?** The MVP is pastel and toy-like. For your own palace, do you want a second look (more architectural, paper and ink)? If an art style is borrowed, it will be from a historical one.
   > **Jimmy, 2026-11-17:** Childish and grand. Memories are for the young and old.

7. **Godot and splats.** The data is ready for a second renderer. When do you want the Godot experiment: after the palace is useful day to day (my suggestion), or soon, as a side prototype? For splats, do you have a scene in mind (a scanned real room as a memory room)?
   > **Jimmy, 2026-11-17:** No, I want it now. Don't need three.js other than as a placeholder.

8. **Walking.** Now little-me walks through walls and floats across gaps. Should walls and doors be solid, with stairs to raised rooms? More game, slower to get around.
   > **Jimmy, 2026-11-17:** Yes.

9. **Growth.** Rooms grow by how much they hold (Nook to Tower). A stand gets a ring from practice. What else should grow: a world that changes with the number of rooms, a bridge that appears when two worlds get many connections, a landmark for the best-known memory?
   > **Jimmy, 2026-11-17:** Ok, I like this.

10. **Practice.** A round is five. Is that right for Felix? Should there be a tour mode (walk a saved route and recall each stop in order)?
   > **Jimmy, 2026-11-17:** Yes.

11. **Device.** iPad, phone or computer most of the time? It decides whether shadows start on.
   > **Jimmy, 2026-11-17:** All.

Also asked on 2026-11-17: add the link to the nursery home page, and make `/start-project` always add that link. Both done. Follow-up in `convo v0.2.md`.
