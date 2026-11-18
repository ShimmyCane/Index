# Make-3D x Construct — Lessons

- **Test the page, not only the engine.** The engine tests passed while the viewer was blank: the render was never called after the model loaded. A headless screenshot after each change caught it.
- **HTML number inputs need `step="any"`** when values are not whole numbers (3.25 in). With `step="0.1"`, the browser blocked the form submit before any script ran, and no error appeared in the console.
- **Refuse, do not half-apply.** Each edit is replayed before it is saved. A refused edit shows its fix hint and changes nothing.
- **Flags explain warnings by name.** A flag on a group covers the parts inside it; the warning counts stay visible.
- **Keep the sample honest.** Placeholders carry certainty 15–20 and an open flag; the research file lists what is unsourced.
- **A consultation gate is a flag kind, not a label.** A flag of kind `consultation` blocks display in both the header and ⚙️, so the block cannot be missed on a phone.
- **AI replies are untrusted until checked.** The critic's reply maps A or B through the packet's candidate labels; a bad choice, a missing score or an unknown claim id is refused with the reason, and nothing is applied.
- **Specific subjects need named sources and a consultation step.** Each claim cites a source or says it is a scene choice. The build refuses a story link to a missing object or an unlisted source.
- **Fix the fields the HTML validator blocks.** A number input with `step="0.1"` refused a value of 3.25 without a message; `step="any"` fixed it.
