# Our Family Compass — convo v0.1 (2026-11-17)

## The request (summary)
Create the framework for a long project. The end products will be a collection of small things for the children: short stories on the web with a parent's narration, open-ended questions, small readings, little lessons and precise explanations, each with a fun and approachable front end and a clear objective and lesson behind it. Before any of those, the framework has to be in place and analysed in depth, with the AI's help and in the way the other nursery projects were approached. It should be visualised like a mind palace: not a set of facts or memories, but the parts of the compass.

The starting material was a long conversation that proposed: a Family Compass with four parts (principles, library, village, workshop), three levels of values (foundational, adaptive, personal), small dated pieces with an author, two layers (knowledge and experience), four questions to answer first (identity, success, morality, freedom), and a living record written with the children and the village.

## Decisions made to get to a first build (say if any is wrong)
1. **This round is the framework only.** No stories, no values list, no pieces yet. The framework is in `framework.md`; the page draws it.
2. **Nine rooms.** Courtyard (the one idea), Principles, Library, Village, Workshop, Gate (the four questions), Roots, Foundation (level 1) and Open sky (level 3). The three levels are the section of the building: ground, rooms, sky.
3. **The north room is called Principles.** The whole thing is the Compass; two things with one name would confuse a child.
4. **You think inside the palace.** Each room has questions. A thought is saved with the room, the question, who wrote it and the date. A change of mind adds a new dated thought and keeps the old one.
5. **Your answers are not in this file.** This repo is public and so is this convo. Personal answers stay on the device (with a "save a copy" file). This file records decisions only.
6. **No family content in the repo.** No names, no family history. The Roots room holds general words for generations, not the family's own story.
7. **Every piece will have a front and a back** (objective, lesson, room, level, age band, author, date, ending, what it is not). One worked example is on the page.
8. **Ten risks, one guard each** (`framework.md` §6). Two are my proposals and need your view: level 1 stays at seven values at most, and a room opens to the children only when it holds pieces from two authors.
9. **Track A, family look,** with more words than a child's game because you are the first reader.
10. **The reading list is not checked.** The books and the paper come from the earlier conversation. `research/reading.md` marks them unchecked.
11. **The home page tile is added** (the start-project rule).

## Questions for Jimmy
1. Do the nine rooms feel right as a palace? Is anything missing, or is any room two rooms?
2. "Over the hammer explanations": I took this to mean one idea said exactly, and named the kind "Plain explanation". Is that what you meant?
3. Where should personal answers live across devices: the family database (my suggestion: append-only `ofc_thoughts`, family sign-in), or files in a `private/` folder on your computer?
4. Who writes first: you alone, or both parents answering the Gate questions separately and then comparing?
5. Ages: should the first test pieces be written for one child, or one objective with two fronts for two ages?
6. Narration: your recorded voice (as Adventure records its storyteller), and in which language or languages?
7. The village: how would a grandparent or a mentor add a voice? A recording made on a visit, a phone call you record, a written note?
8. Are the two proposed guards right (seven level 1 values at most; two authors before a room opens)?
9. Should the palace later become a place the children walk through (the experience layer), or should their side look different from yours?
10. Which should round 2 be: the values sorting board, the village list, or three test pieces?

Answers:

Answers (2026-11-17, from Jimmy's comments on the questions; kept close to his words):
1. Nine rooms are fine for now. They will grow. As long as the structure is tracked and kept as JSON in the database, it can be expanded, and the rooms and their connections can be drawn differently over time.
2. "Plain explanation" is somewhat right, but "this is a brute force approach." (Claude's reading is in `convo v0.2.md`.)
3. Family database with sign-in. Right now one main compass, but a database for many different voices is imaginable.
4. The MVP is about 90% Jimmy's voice and 10% Ying's. Once it is open, the hope is for an even share, or at least that someone reads it and everyone participates. It should be collaborative.
5. The output is aimed at the kids. It could be the children, the parents, one child, or the family.
6. Written words are fine, but leave the option open: the SQL should allow a voice note to be linked. Maybe an option in the settings button to record directly on the page.
7. A grandparent or mentor could also email or text it, and Jimmy uploads it.
8. Did not understand what the guards are. Happy to review after merge. (Plain explanation in `convo v0.2.md`.)
9. The palace is something the children walk through, play mini games in, read in, and interact with ideas in.
10. Round 2: develop placeholder or sample scenarios and questions from the earlier conversation and the schematic. Also a research folder with best practices for today's world (articles, questions, Claude's thoughts, Claude's understanding of the family) so Jimmy can learn too.
