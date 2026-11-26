# Massage Map: convo v0.2

Date: 2026-11-25. Round 2, after build 0.1.0. Jimmy answers inline under each question.

## What Jimmy asked

- The current figures do not look human or physically correct (the "shapes" in 0.1.0 are too simple).
- Use more references, and get the body right.
- A button that peels away the skin to show the muscles, nerves, and ligaments underneath.
- Identify body parts, the muscular system, the ligament and nerve system, and more than one toggle so the viewer can go into different layers.
- Purpose: to see what a massage is doing to the tissue underneath, not only where the press lands.

## Research so far (2026-11-25)

Licensing comes first, because this repo is public and GPL-3.0 (`LICENSE`).

- **Gray's Anatomy, 1918 (US 20th edition).** Public domain. Plates for the dorsal foot nerves (Gray836) and foot muscles (Gray444/445/446) appear on Wikimedia Commons and Radiopaedia. Check each file's Commons licence page before reuse.
  - Radiopaedia Gray's illustrations: https://www.radiopaedia.org/cases/foot-interossei-muscles-grays-illustrations?lang=us
  - Picryl (Gray 836): https://picryl.com/media/gray836-1107e2
- **BodyParts3D** (Database Center for Life Science, Japan). Creative Commons Attribution-ShareAlike. Its open 3D human model is on AnatomyTOOL. Unconfirmed: whether BodyParts3D includes the foot's muscles, nerves and ligaments. Share-alike would make any derived model CC BY-SA, which needs a decision against this repo's GPL-3.0 licence.
  - AnatomyTOOL open 3D model: https://anatomytool.org/node/63904
- **Primal's Leg, Ankle & Foot** (app, free with in-app purchases). Five layers for depth. Closest match to what Jimmy describes, but it is a commercial app: reference only, nothing copied.
  - https://apps.apple.com/ms/app/id1658755846
- **Open Anatomy Browser** (Harvard, open source). Web-based atlas viewer. Its own FAQ says it is a proof of concept and not suited to tablets.
  - https://openanatomy.org/
- **Human Atlas** (GitHub, open source). About 2,234 selectable BodyParts3D meshes with system layers, search and exploded views. General body, not foot-specific.
  - https://github.com/mhalle/taviewer (viewer source; Human Atlas is listed in the same search)

Not done yet: no drawings or viewer changes in this round. The current figure stays as it is until Jimmy picks a direction.

## Questions for Jimmy

1. **Form.** Which should the first version be?
   - A. Flat textbook-style drawings (SVG, like a Gray's plate), with layers toggled on and off. Light, runs on the iPad, close to the pastel look, but hand-drawn.
   - B. A 3-D foot that can be turned and peeled (needs a 3-D model and a little more code). Heavier, but a better look at depth.
   Recommendation: A first, so the layers and the massage marks can be checked, then B.
2. **Body scope.** Foot only for the first version (sole, top, side, ankle), then the lower leg? Or the whole body first?
3. **Layers.** Which layers do you want as toggles? My starting list: skin, fat and fascia, muscles, tendons and ligaments, nerves, arteries and veins. Anything to add or drop?
4. **Sources.** Are you happy for me to use the public-domain 1918 Gray's plates as the reference (trace-by-eye, not copied), and to leave BodyParts3D aside until we decide about the share-alike licence?
5. **Peel button.** One "peel" button that goes layer by layer, or separate toggles per layer that you can combine?
6. **Realism target.** Textbook accurate (Gray's style), or simplified and friendly (accurate shapes, softer colours, pastel)?
7. **Sex and age.** The earlier note asked for male and female bodies with Asian proportions. Start with the female foot, the male foot, or both? Children stay hidden behind the toggle.

## Answers

1. **Form:** A, flat textbook-style drawings with layers toggled on and off.
2. **Scope:** the whole body, not only the foot.
3. **Layers:** yes to the starting list (skin, fat and fascia, muscles, tendons and ligaments, nerves, arteries and veins, bones).
4. **Sources:** yes, the 1918 Gray's plates as the guide, traced by eye. No BodyParts3D for now.
5. **Peel:** yes to both: a peel button that goes layer by layer, and a toggle per layer that can be combined.
6. **Look:** textbook is fine.
7. **Sex:** a woman's figure first.

Build plan (increment 1): a female whole-body front figure with the six layers, a peel button, per-layer toggles and tap-to-name labels, in EN and 中文. Male figure and back view later. Accuracy: approximate shapes, checked against the Gray's plates before we call any part correct.
