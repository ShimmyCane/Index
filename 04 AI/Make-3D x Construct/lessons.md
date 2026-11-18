# Make-3D x Construct — Lessons

- **Test the page, not only the engine.** The engine tests passed while the viewer was blank: the render was never called after the model loaded. A headless screenshot after each change caught it.
- **HTML number inputs need `step="any"`** when values are not whole numbers (3.25 in). With `step="0.1"`, the browser blocked the form submit before any script ran, and no error appeared in the console.
- **Refuse, do not half-apply.** Each edit is replayed before it is saved. A refused edit shows its fix hint and changes nothing.
- **Flags explain warnings by name.** A flag on a group covers the parts inside it; the warning counts stay visible.
- **Keep the sample honest.** Placeholders carry certainty 15–20 and an open flag; the research file lists what is unsourced.
