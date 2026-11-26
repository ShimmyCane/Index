# Deprecated: read-notes-and-update

**Status:** deprecated on 2026-11-18. Use `/review-notes-and-update` instead.

**Replaced by:** `/review-notes-and-update`, the same skill under a new name. Since 2026-11-25 its instructions are section 3 of `02 Refs/Skills/feedback_loop.md`.

**Why it was renamed:** the old name said "read" first, but the skill reviews the notes, turns them into project work and marks them done. "Review … and update" says what it does.

**What to do if you find the old name in a past project:**
- Run `/review-notes-and-update` instead. Nothing else changes: the same database table, the same "Done- " prefix, the same owner confirmation before marking notes done.
- Past mentions of `/read-notes-and-update` in convo files, briefs and to-do lists are records of what was run at the time. They are left as they were.

**Where the old name still resolves:** `.claude/skills/read-notes-and-update/SKILL.md` is kept as a stub. It points to this file and to the new skill, so an old command gives a clear pointer instead of "unknown skill".
