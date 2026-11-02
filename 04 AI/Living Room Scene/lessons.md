# Living Room Scene: lessons learned

## 2026-11-02: Process for building a scene from a photo (logged at the outset)

Process agreed with Jimmy before the first build:

1. Jimmy uploads a photo and describes it roughly (furniture, books, plants, windows, small items).
2. Build the scene as a single HTML page (inline SVG, no build step), using the photo's own pixel grid as the SVG `viewBox` so positions can be compared directly.
3. Render the page to PNG with the pre-installed Chromium (Playwright), then look at the render next to the photo.
4. Write down the differences in a short list (what is missing, misplaced, wrong size or wrong colour).
5. Save the next version as `living_room_v#.html` (V1 to V10). Keep every version. Do not overwrite.
6. Repeat for 10 iterations. Each version has its render in `03 Projects/Living Room Scene/renders/`.

Why this process:
- Rendering and looking at the output is the only real check. Code that "looks right" can still place a sofa in the wrong corner.
- Using the photo's pixel coordinates keeps the comparison simple: a point in the photo is the same point in the SVG.
- Keeping each version as its own file (not editing in place) lets Jimmy compare any two rounds.

## 2026-11-02: What the 10 rounds taught

- **Rendering and looking caught real faults.** The V2 floor read as bricks, which the code alone did not show. The fix came in V3 (long planks). Keep the render step even when the code looks right.
- **Compare with the photo's grid, not from memory.** Positions traced in photo pixels stayed correct through all ten rounds. Nothing had to be re-placed.
- **Change about five things per round.** Bigger changes made the next comparison harder to read.
- **Copy the previous version, then Edit it.** Each version stays a separate file, as asked. Copying with `cp` and making targeted Edits is quicker than rewriting the whole page.
- **Edit failures came from indentation, not from missing text.** Two edits (V3 ceiling line, V6 window sill) failed because the indent was 4 spaces, not 2. Match the indent of the line in the file before retrying.
- **Pastel style is a choice, not a likeness.** The photo has real shading and textures. The flat pastel style follows Jimmy's preferences, so the likeness is about layout, not look. Say so when showing the result.
- **Simplified parts (not matched well):** chair proportions, futon shape, exact positions of small items on the shelf tops, the speaker box.

Open for the next round:
- Confirm whether the next round should match the photo's colours more closely, or stay in the pastel style.
- Confirm which version Jimmy considers closest, so the next round starts from there.
