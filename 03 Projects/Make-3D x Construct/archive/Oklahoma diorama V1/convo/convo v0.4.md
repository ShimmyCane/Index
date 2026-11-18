# Make 3D x Construct — Convo v0.4

**Project:** Make 3D x Construct
**Round:** 4. Your notes on the page, the layout and the scene, then what was built, then new questions. Round 3 stays as it was.

## Your notes (round 4)

1. **Settings buttons and scrolling did not work.** → Cause: the drawer's items were squeezed into each other, so the taps landed on the wrong item and nothing scrolled. Fixed: the items keep their height, the drawer scrolls (including by touch), and there is room at the bottom so the ⚙️ button does not cover the last item. Checked in the browser: the drawer now scrolls (its content is about 2,850 px tall in an 800 px window).
2. **Three panels in the main body; move the selected-part panel left, so there are two.** → Done: the left column holds Selected part at the top, then the model checks. The 3-D view is the right-hand panel.
3. **The scene is poorly lit; make it more convincing, with 300 to 500 objects; use composition, detail and shading; the scene carries the narrative.** → Done: 388 parts, placed with a fixed seed so every build is the same. The scene has a warm late-afternoon sun from the west with soft shadows, a sky-blue painted backdrop, material colours with a little variation per part, a sky gradient, and a creek with cottonwoods. Narrative pieces are placed deliberately; the bones and skull on the terrace carry the message that the herds are gone.
4. **Refine the narrative as you see fit.** → Done: the story has six steps (morning and the bones; the horses; the lodges coming down; the loaded travois; the people and the cold fire; the crossing toward the bluff). It cites seven sources and marks two claims as scene choices. The title is now "The camp leaves the bones behind (draft for consultation)".
5. **Merge.** → Plan: commit, push, open a new pull request for this round, and merge it.

## What was built (round 4)

- The drawer scrolls and its buttons work. The earlier layout is fixed with a flex column.
- Two panels: the controls on the left (Selected part first), the 3-D view on the right.
- Viewer: shadows, a warm sun, a hemisphere light, tone mapping, a sky gradient. Three colour modes: material (default), certainty, paper and ink. The button cycles through them.
- Scene: 388 parts, 13 flags. Five consultation groups are open (the camp, the lodges, the travois, the horses, the people). The other groups have uncertain flags, so every warning is explained.
- Story: `exhibit/story.json`, schema m3dxc.story/0.2. Source S6 is the JSTOR Daily piece on the bison bone trade.
- Tests: all Node tests pass. The sample test now also checks the 300–500 range and the six steps.
- Summary page updated with the new line numbers.

## Limits

- The lighting is a stylised diorama, not a photograph. The people and horses are still placeholder silhouettes (and flagged).
- The creek and the cottonwoods are scene choices, not from a survey. The story says so.
- Sources differ on what caused the bison decline. The story says that.
- The device check and the iPad test are still to do.

## Questions

1. **The bones.** The skull and bone pieces are a scene choice that carries the story's first message. Do you want them kept, reduced, or moved to the background?
2. **Lighting.** Is the late-afternoon warm light what you wanted? I can make it dusk (lower sun, cooler shadows) or morning.
3. **Public repo.** This is the question from round 3, still open. The draft is now public on `main`. Keep it public until the tribes review it, or move the story and sample to `private/`?
4. **Next scene step.** If you want more detail, the next steps are a second camp group, a horse herd in the distance, and a path worn into the grass. Which should come first?
