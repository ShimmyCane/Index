# Growth: to-do

Planning mode works (the Growth page and `?world=` in the Increment Viewer). The rest, in the order Jimmy described it.

## Next: make it run

- [ ] **Run the rabbit world in 3-D.** Turn each step's state into a scene (hillside, river, bushes, grass height from plants %, rabbits and predators as counts). Decide how: the Make 3D viewer, or a standalone page like Paper Again. Waits for Jimmy's look at the planning page.
- [ ] **Animate.** Play the steps as moving scenes (rabbits multiplying, hawks arriving, the grass thinning), looping, autoplay twice then pause, per the 3-D preferences. Jimmy asked for this to be on the list.
- [ ] **Save to the cloud.** Create `grw_worlds` and `grw_world_versions` in the Architecture project (drafted in `supabase/001_grw_worlds.sql`, not applied). Test in a rolled-back transaction first, then apply with `/supabase-project`. Jimmy to say go.
- [ ] **Load from the cloud.** The Growth page saves and loads worlds after an owner sign-in (as Make 3D does), and the Increment Viewer opens `?world=<id>` from the database when there is no file for it.
- [ ] **Let the AI run it.** Today the loop is: copy the prompt, paste into Claude, paste the reply back. Later: call the model from a saved world, and keep each run as a new version.

## The rules (so any object, place or kind of change fits)

- [ ] A second computed time model besides the ecosystem one (a lake or a city) to see what the world format is missing. The model list is `MODELS` in `js/growth_model.js`.
- [ ] A shared "rules" vocabulary: per-step events with effects on named variables (not only text), so the AI can propose events and the model can apply them.
- [ ] Collaboration worlds: things that affect each other (two species, a plant and a pollinator). The rabbit world is the first one with a predator-prey link.
- [ ] A check that flags steps whose words no longer match the numbers after a variable changes.
- [ ] Link the `/simulate-decay` skill to this page (its questions and sign-off are sections 1 to 3 here). Needs Jimmy's go-ahead to edit `02 Refs/Skills/`.

## Smaller

- [ ] Reorder, add and remove single steps on the page (today the count comes from "Increments").
- [ ] Chart: a second axis, so one coyote and 134 rabbits are not both drawn to the top.
- [ ] Share a draft by link back into the Growth page (the viewer already accepts one).
- [ ] The river and the slope as numbers (water access, grass near the river), not only as words.
