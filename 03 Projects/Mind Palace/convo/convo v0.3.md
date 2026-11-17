# Mind Palace — convo v0.3 (2026-11-17)

Jimmy answered `convo v0.2.md` (his words are recorded there) and asked to continue and merge so he can test. Answer inline; anything left blank keeps the choice made.

## What I understood

- **Individual palaces**, one per family member. Jimmy's comes first; the others walk through his and learn from it.
- **His first worlds are his childhood homes**: floor plans, starting from a simple rectangle, with a way to add a door to another room.
- **Gaussian splats are the point**, on the web, without three.js. Splats suit memories because they are fuzzy.
- **No scans.** The splats are modelled, or made with AI.
- **He tests Godot himself.** I do not run the engine here.
- **Tour = free walking.** Walk up to an object and a small pop-up shows a couple of lines, with "read more".
- **Childhood content lives in the family database**, never in this repo.

## What I built this round (all tested in a headless browser)

1. **`splat.html`: a Gaussian splat view of the palace, in the browser, with no three.js and no library.** I wrote the renderer in plain WebGL 2. Every surface becomes thousands of soft blobs (a middle, a spread, a colour). They are sorted far to near and blended each frame. It needs no account, no build step and no install; it is on the nursery site as soon as this merges.
2. **Fuzziness.** A slider in ⚙️ from crisp to vague. With "Sharper when practised" on, a memory you have practised is drawn sharper and one you have not is fuzzier.
3. **Walk-up pop-ups.** Walk (stick or keys), tap a memory, or search: when little-me is near a memory a pop-up shows its name and first line, with Read more (the rest, the question, where it lives, its connections).
4. **Wander.** Little-me visits every memory once, with the pop-up at each. A tap stops it.
5. **Individual palaces.** "Whose palace?" in Build (Save and open) and in the splat page's ⚙️. Each is saved apart on the device. A new one starts empty.
6. **Save the splats** as a `.ply` file, the usual Gaussian splat format.

The older Build page (three.js) is still where you add and change things. The splat page reads the same palace.

## What you need (your question 3)

- **For splats on the web: nothing.** No account. It is plain files on GitHub Pages, like the rest of the nursery.
- **For Godot on the web:** also free, but it needs a build each time. Either you install Godot 4.3 and its export templates and press Export (Web), or I add a GitHub Actions workflow that builds it on GitHub (free for a public repo). Neither is needed to see splats now.
- **For sync:** the family Supabase project you already have. No new account.
- **For AI-made shapes:** any AI chat you already use, by copy and paste.

## My recommendation

Make the browser splat renderer the main view, and park Godot until you have opened it and seen what it reports. Reasons: you asked for web access and for understanding splats; this renderer is short enough to read and change; I can test it here; and it runs on the iPad today. Godot stays in the repo, unrun, and can still become the desktop version later. Question 1 asks whether you agree.

## Choices made without asking

1. **The splats are made from shapes**, by scattering points over each surface. They are not trained from pictures.
2. **Memory objects get the most splats**, rooms the usual amount, the big islands fewer, so objects stay recognisable.
3. **The first palace keeps the name "My palace"** and holds what was there before. Rename it in Build.
4. **No walls in the way** on the splat page: little-me walks through them. Solid walls come with the floor plans.
5. **Floor plans are not built yet.** They change the data (a room becomes a rectangle with its own width and depth; a door joins two rooms), so I want your answers to questions 2 to 4 first.

## Questions

1. **Main renderer.** Do you agree to make the browser splat page the main view and park Godot? Or do you want the Godot web build set up now (then: do you install Godot and export, or do I add the GitHub workflow)?

2. **A home.** Is one home one world (an island), with its rooms on it? And a home with two floors: two levels on the same island?

3. **Entering a floor plan.** Which is closest to how you think: (a) type a room's width and depth and pick which wall the door is on; (b) drag the corners of a rectangle on a top-down plan; (c) describe the home to an AI and paste back its plan? I suggest (b) with (a) for exact numbers, and (c) later.

4. **Units and scale.** Feet or metres? And should the rooms be true to size (a 3 m by 4 m bedroom), with little-me the height of a child?

5. **Doors.** A door joins two rooms that touch. Should a door also be able to lead somewhere far (a memory of another home), like a portal?

6. **Visiting.** When Felix opens your palace, should he be able to change it, or only walk through and practise? I suggest only walk and practise, with his answers counted as his.

7. **AI-made objects.** The 29 objects will not cover a childhood (a certain sofa, a red bicycle). The plan: you describe a thing, the page writes a prompt, an AI answers with a list of simple shapes, and the page turns them into splats for you to accept or reject. Is that the right next step after floor plans, or before?

8. **How fuzzy?** After you have tried the slider: what should decide fuzziness, besides practice? Age of the memory (older is fuzzier), how sure you are (a setting per memory), or both?
