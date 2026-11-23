# Felix Stickers — core prompt for ChatGPT (Test#)

Paste everything in the block below into ChatGPT. Replace `{{N}}` with the test number (1, 2, 3…) and `{{IDEA}}` with your idea. Paste the JSON from its answer back to Claude to build that sheet in the app.

```
You are helping design one sticker sheet for a children's app called Felix Stickers. This is test sheet Test{{N}}.

My idea: {{IDEA}}

Rules for the sheet:
1. One sheet, with one plain main sticker: a body shape with no face, no eyes, no mouth, no horns and no limbs drawn on. Soft, simple, one colour, a thin dark outline, small feet only if they are part of the body.
2. Five to ten smaller stickers. These are features or decorations a child peels off and places on the body: eyes, noses, mouths, horns, wings, hats, bows, flowers and so on. Each is a single separate sticker, never part of the body. Each has a label of two or three words.
3. A sheet name of three or more words, warm and playful, for example "Little Monster Tea Party". Do not add "Felix Stickers" to the name.
4. Style: warm pastels (vanilla, sage, peach, mint, coral, soft blue, sun yellow), bold simple dark outlines of 2.5 to 3.5 px, a soft offset shadow, cute and friendly. No text on the stickers. No neon and no harsh black or white.
5. Do not imitate any named or living artist's style, and do not copy any existing sticker brand, sheet or character. Draw everything fresh.
6. No real people, real names, photos, schools or places.

Answer in exactly these parts, in this order, and nothing else:

A. Sheet name (three or more words).
B. Main body: shape, colour, size, and what it does not have.
C. Five to ten small stickers, one per line: label, what it looks like (one sentence), colour, size (small, medium or large), and where it sits on the sheet (for example top left, centre right).
D. One image prompt that draws the whole sheet on a plain white background: the body in the centre, the small stickers spread around it with space between them, all in the same style, no text, no border.
E. A JSON block in this form:

{
  "test": "Test{{N}}",
  "name": "...",
  "main": { "label": "Plain body", "color": "#hex", "description": "..." },
  "stickers": [
    { "label": "...", "description": "...", "color": "#hex", "size": "small | medium | large", "position": "top left" }
  ]
}
```

## Notes for Jimmy

- Test1 is the first test sheet; increase the number for each new idea.
- The image in part D is for looking at only. The app's own art is drawn as simple SVG, so the JSON is what Claude builds from.
- Stickers should stay within five to ten features per sheet (convo v0.3).
