# AI JSON Loop (AI editing without a server)

Purpose
Let Jimmy use any AI chat to draft or edit a structured item (a world, a level, a set of rules) without the app holding any key or server. The page builds a prompt from the current item, Jimmy copies it to the AI, pastes the reply back, and the page validates it before applying anything. Nothing is sent automatically.

When to use
- An app needs AI help to write structured content (Growth's worlds, a puzzle brief, a planning page).
- The browser must not hold an AI key, and no server is available.

Steps
1. **Define the schema** in one file (`js/<name>_schema.js`), with a version (for example `"schema": "grw/2"`), required fields, types, allowed ranges and allowed ids. The schema is the contract; the prompt and the validator both read it.
2. **The prompt builder.** It puts in: the current item as JSON, the schema rules in plain words, the list of allowed tokens (for example `{rabbits}`), and this instruction: "reply with one JSON object inside a ```json fence, and change nothing else." It must not include anything Jimmy has not typed or chosen for this item.
3. **The reply parser.** Accept a JSON object inside a fence, or the first balanced `{ ... }` among other words. If nothing parses, show the first 200 characters of the reply and say what was wrong. Do not guess at a fix.
4. **The validator.** Check the schema (types, required fields, ranges), then the domain rules (ids exist, tokens resolve, numbers within limits). Show every problem as a list. Apply only when the list is empty; warnings may be accepted with one tick.
5. **Apply and keep the old version.** Store the previous item so one click undoes the change. Record the source as "pasted reply" with the time.
6. **Draft links** (`#draft=<base64 JSON>`): a link can carry an unsaved draft. Treat it as untrusted. Render text with `textContent` only, drop images, and check any colour against an allow-list (for example a `#rrggbb` regex) before it reaches CSS.
7. **Tests.** Parse a fenced reply, parse a reply with words around it, reject a bad range, reject an unknown id, round-trip (apply then export gives the same JSON), and check the undo.

Rules
- The app never calls an AI service itself. Jimmy is the one who copies and pastes.
- Prompts contain only the item's own content. Do not paste private data (family, photos, real names) into an outside AI. Check with `privacy_check` first.
- The numbers come from the model or the record, never from the AI's prose. If the item has a computed result (for example a population model), the validator recomputes it and reports any mismatch.
- Keep the schema version in every saved item, so an old item can be migrated, not silently misread.

Lessons this comes from
- Growth: "The AI loop needs no server." Build the prompt, accept the reply as JSON in a fence or among words, validate before applying, keep recorded numbers by position.
- Growth: a link can carry a draft, but it is untrusted: text only, no images, checked colours.
