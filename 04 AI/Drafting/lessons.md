# Drafting — lessons

Project-specific lessons, newest first. Generic ones go to `04 AI/lessons_pool.md`.

## 2026-11-18 — increment 2 (MVP 0.2)

1. **Group 100 subclass markers are not allowed in R12.** The first writer added them to every text and insert entity, which only matters for AC1009. The fix is a guard on the version, and the test for R12 would not have caught it. Check each version's group codes when a branch is shared by both.
2. **A rule that is never triggered is not a test.** The first version of the 80% test passed without any warning reaching it. A constructed case with four known deductions gives exactly 75%, and that is the only proof the rule works.
3. **Keep the fix close to the cause.** A line type stored as its key (`dashed`) instead of its DXF name (`DASHED`) would have written a table that did not match the entities. Storing the real name in the primitive kept the writer simple.
4. **Read what the viewer shows, not what the source says.** The block sample's note text overlaps in the drawing viewer at this size. That is the file as read back, so it is the right place to see it, and it is a size problem, not a parsing one.

## 2026-11-18 — increment 1 (MVP 0.1)

1. **A test that checks the wrong place fails for the wrong reason.** The "reader names unknown entities" test put an entity after the section's ENDSEC, so the reader correctly ignored it. Fix the test's insertion point, not the reader. Check where the probe lands before reading a failure as a bug.
2. **Read the file back, not the source.** The linter scores the DXF after it is parsed again, so a writer bug shows as a validity fail rather than a silent miss. The read-back count check (entities written = read) caught nothing here, but it is the cheap guard for the next writer change.
3. **Use an external validator for files you hand-write.** ezdxf audit reports 0 errors. It is test-only and does not need AutoCAD. Install it in the test run, not in the page.
4. **Know what a sample score proves.** Both samples scored 90%, so the 80% viewer rule was never tested live. A test builds a detail that scores 75% and checks the viewer flag. Say so when a number looks fine but the branch behind it did not run.
5. **Quick Detail's `size` is paper inches.** Note text height is `size × scale factor`. A converter that uses size as real inches would be four times too small at 3"=1'-0". Read the layout code before mapping any size field.
6. **Hand-written files need a quick browser check too.** The headless check found the download and the layout clean; it cannot prove AutoCAD opens the file. That gap is named in the brief and waits for Jimmy's test.

## 2026-11-18 — research and start

1. **Read the request's words as the user's words first.** Several words came through as sound-alikes: "cat" (AutoCAD), "rabbit" (Revit), "litter" (linter), and a garbled sentence about where the project sits. Put each reading in the convo and ask one short question, instead of guessing silently.
2. **Check what already exists in every sibling repo before saying "none".** A first search of Make-3D found no DXF code, and the note "nothing exists" was wrong for the nursery as a whole. Quick Detail's v1 folder has an R12 DXF writer, and the lessons pool records it as viable. Search all repos, `history/` folders included, before writing a "not built" claim.
3. **Mark each format claim as confirmed, partly confirmed or open.** Search snippets often give one example and not the rule. The research note says which is which, so the next session does not build on a guess.
4. **Real inches, not scaled inches.** Quick Detail draws in real inches and uses the scale only for paper size. An export that multiplies by the scale factor would be four times too big at 3"=1'-0". Write the unit rule into the schematic before any code.
5. **A Revit family is not a mesh.** An imported DXF is geometry, not a parametric family. Make-3D's own convo already asks Jimmy this, so the answer decides the 3-D path before any writer is built.
