# Mind Palace — convo v0.4 (2026-11-17)

Jimmy asked for two things: start on the splat view by default, and add a fog of war, plus more life to the graphics (more trees, other things moving on a loop). Answer inline; anything left blank keeps the choice made.

## Choices made without asking

1. **The splat view is the default.** `index.html` is now the splat view; the Build page is `build.html`. The nursery tile opens the splat view, and its bottom bar links to the Build page.
2. **Fog of war as a radius around little-me.** Inside it the palace is lit; outside, the splats fade to black and their names go too. The radius is set by "How far you can see" (near, middle, far) and widens when you zoom out, so the whole palace can still be looked over.
3. **Moving things on loops:** windmill blades turn, three birds fly a wide circle, a balloon bobs, a walker goes round the plaza, and a gear turns. Each loop repeats exactly.
4. **Trees** (round, pine, blossom) stand on each island, away from the plaza and the rooms.
5. **Moving is a setting.** "Moving things" can be set to Still.

## Questions

1. **Fog as sight or memory?** Now the fog is only what little-me can see right now. Should a place she has been to stay dim (an "explored" memory), so you can see where you have already been?
   > **Jimmy, 2026-11-18:** Good as you have it. (Explored places stay dim, as built later.)

2. **How far should you see?** The default shows about the plaza and the nearest rooms. Is that the right default for Felix, or should he start with more in view?
   > **Jimmy, 2026-11-18:** Can you double it. (Done: the view is twice as wide by default.)

3. **More life.** What else would make it fun for you and Felix: animals on the islands, boats on water, cars on paths, fireworks, a night sky with stars, or a lantern glow around little-me?
   > **Jimmy, 2026-11-18:** I like more lighting and more glowing, maybe some animals, maybe trees, some elements. (Done in 0.3.1: a lantern that glows in little-me's hand, fireflies circling each island, the trees and birds from 0.3.0. Animals, boats and cars are next.)

4. **Moving things in Godot.** The moving things and the fog exist only on the web splat view. Should I add them to the Godot project too, or keep Godot for later?
   > **Jimmy, 2026-11-18:** I would like to use SDF and splat. Are you saying the web splat view is not using those? Tell me more about Godot, am I not using that right now? (Answered in convo v0.5.)
