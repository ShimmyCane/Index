# How to review a detail (for Claude in a session, or a person)

The script holds no AI key and calls no AI service. The reviewer reads the drawing and writes one JSON file. The script checks it and does the rest.

## Where details come from

- **A working file on this computer** (`inputs/`, ignored by git).
- **The cloud** (Architecture database). A session reaches it through the Supabase tools or the connected host:
  - Critique Detail's own: `dc_details` (image in bucket `dc-details`).
  - Quick Detail: `sketch_details` (name, tags, items) and `sketch_snapshots.image_path` (bucket `sketch-media`). Read only.
  - Detail library: not found in the database yet (see `convo/convo v0.2.md`).
  Download the image into `inputs/` and pass `--source-kind quick_detail --source-ref sketch_details:<id>` so the review links back to its source.

## Steps

1. `python3 run_review.py prepare <detail> --describe "<one line>"`
   Read `outputs/packets/<name>.packet.json`: the rulebook, the project context, and the QC list built for this detail on this project.
2. Look at the drawing itself. Judge only what is drawn. If something is not drawn or not legible, it is `not_shown`; do not assume it.
3. **Gate first.** If the drawing is slop (no material tags, shapes that do not close, nothing a rulebook can be checked against), set `"slop": true`, give the reasons in plain words, and stop. Do not review a drawing you would have to guess at.
4. Write `<detail>.review.json` in the shape the packet shows (`review_shape`):
   - one `results` entry for every QC id: `pass`, `fail`, `not_shown` or `na`. A `pass` needs an `evidence_box` on the drawing, or it only counts as claimed, not proven.
   - `findings` for what must change, each with a severity and a box. CRITICAL: water gets in or something fails structurally. MAJOR: code or project mandate. ADVISORY: lesson or best practice.
   - `control_layers` for envelope details (divisions 03 to 08): water, air, thermal, vapor, each `continuous`, `broken`, `not_shown` or `na`, with a `break_box` where it stops.
   - Boxes are `[ymin, xmin, ymax, xmax]`, whole numbers from 0 to 1000 from the top-left corner.
   - If the rulebook is a **stub**, also write `new_checklist`: exactly 6 items (`item`, `why`, `default_severity`, `tags`), and use ids `NEW-1` to `NEW-6` in `results`. The script saves them into the rulebook and makes it active.
5. `python3 run_review.py apply <detail> --describe "<same line>"`
   It lists every problem in the review file and writes nothing until there are none. Then it writes the report, the Markdown and the redline.
6. Look at the redline image. Move any box that misses.
7. Only when Jimmy asks: `--push` (owner sign-in in `DC_EMAIL` and `DC_PASSWORD`), or save from the page.

## Rules

- Say who reviewed it in `reviewer`. Never present a review as something it is not.
- Write for the person who will fix the drawing: plain, short, specific.
- Code references name the edition in the project context. Flag anything you could not check against that edition.
- Nothing from an office detail goes into the repo: not the image, not the report. It lives on the computer and in the cloud only.
