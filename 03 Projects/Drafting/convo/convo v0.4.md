# Drafting — convo v0.4 (2026-11-18)

Jimmy, after the viewer review:

1. The drawing viewer is fine. He can open the viewer himself.
2. Line types and hatch patterns each need their own viewer.
3. Proceed with the increments, then merge.

## Choices made in increment 2 (without asking)

1. **Two viewers, two panels.** "Line types" shows each line type in the file as its dash pattern. "Hatch patterns" shows each pattern at real size (a 2-inch square), from the pattern lines in the file. Both are separate from the drawing viewer, which stays as it was. This answers the open questions in `convo v0.3.md`: the two are built together, and each has its own panel.
2. **Line types** are written as `.LIN` (plain text, Autodesk form) and in the DXF `LTYPE` table. A line type only appears when a drawing uses it.
3. **Hatch patterns** are written as `.PAT` (plain text, blank line after the last pattern) and as DXF pattern lines inside each `HATCH`. Only the patterns a drawing uses appear in the `.pat` file.
4. **Pattern library** (`js/libraries.js`) has three starting patterns: `diag`, `horiz`, `brick`. Quick Detail's own hatch library is not ported yet. A key that is not in ours is drawn as an outline and the linter warns, by name.
5. **Blocks.** A block item points at a source detail by id. The source becomes one `BLOCK` definition, and each use is an `INSERT` with its scale. Self-insert is refused, and nesting stops at five levels.
6. **Dimensions.** Only ortho dimensions (horizontal or vertical) are exported: extension lines, dimension line, and the length as text (for example `8"`). Aligned and angular dimensions are listed as not exported.
7. **New checks.** Validity: every block and line type used is defined, and every pattern hatch has its lines. Confidence: pattern in the library, hatch line spacing, dash and gap size.
8. **Samples.** The wall section now has a dashed centre line, a brick pattern, and a dimension. A block-use sample places it twice, at full and half scale. The small label sample is unchanged.

## Not done, and why

- AutoCAD and Revit have not opened the files. That is still Jimmy's test.
- Quick Detail's full hatch library is not ported. Only the three patterns above exist.
- Revit family import (the 3-D path) is increment 4.

## Open for Jimmy

- Which patterns from Quick Detail's library should be ported next? (The list of keys in use is in the app's hatch reference.)
- Is the 2-inch box the right real size for the pattern viewer, or should it show one real inch?
