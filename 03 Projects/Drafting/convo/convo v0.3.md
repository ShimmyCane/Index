# Drafting — convo v0.3 (2026-11-18)

Jimmy, after the MVP 0.1 review:

1. The viewer is fine. He can open it himself.
2. Line types and hatch patterns each need their own viewer, separate from the drawing viewer.
3. Merge MVP 0.1.

## Done in this round

- Merge of MVP 0.1 (PR #194) requested.
- Viewer request recorded. It is planned for increment 2, alongside the line-type and hatch-pattern export it shows. A line-type viewer draws the dash pattern from the `.LIN` text and the `LTYPE` table. A hatch viewer draws the pattern from the `.PAT` text, at the scale set on the sheet, and shows spacing and angle.

## Open

- Which view comes first in increment 2: the line-type viewer, or the hatch-pattern viewer?
- Keep the drawing viewer as it is, or show the three side by side in the same panel?
