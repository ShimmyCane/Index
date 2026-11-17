# Our Family Compass — convo v0.2 (2026-11-17)

Round 1 answers are at the bottom of `convo v0.1.md`. This round turns them into a build and asks what comes next.

## What I did with your answers
1. **Rooms and connections are data, not drawing code.** Each room now carries its place on the map and its connections to other rooms (and why). The palace can be saved as one JSON document in the family database (`ofc_framework`), and the page prefers a newer saved copy over its built-in one. So you can add a room or redraw the map later without changing the page. This round only reads a saved copy; there is no editor yet.
2. **Family database with sign-in.** The ⚙️ panel has the family sign-in. Thoughts and notes go up when signed in, and thoughts written on another device come down. One main compass for now (a `compass` column on each table, set to `main`), so many compasses or many voices can be added later without changing the tables.
3. **Voices and collaboration.** Every thought carries who wrote it. A piece has an author and an `entered_by` (for a voice that arrived by email or text and was typed in by you). Nothing in the tables favours one author, so the 90/10 start can move to an even share.
4. **Voice notes.** ⚙️ → Voice notes → On adds a record button to each thought. The recording stays on the device and is sent to a private bucket (`ofc-voice`) when signed in, with its path saved on the thought. The tables also have `voice_path` for pieces. Recordings are not in a saved copy.
5. **Who it is for.** Every piece now says who it is for: one child, the children, the parents, or the family. (This replaced "age band".)
6. **Twelve sample pieces** drafted from the earlier conversation and the framework, one or more of every kind. They are placeholders; none is a family story. Two are waiting for their teller (a story and an object).
7. **Research folder.** `research/best_practices.md`: what research says about family stories, caring and ethics, autonomy, heritage and identity, discussion programmes, ethical wills, and AI and feeds, each with how strong the evidence looks, links, and my thoughts.
8. **The palace is somewhere to walk.** I built the page as a map you tap through. Walking, mini games and reading inside rooms is the children's side; I have not started it. See question 3.

## "The hammer" (your question 2)
You said "Plain explanation" was somewhat right, but "this is a brute force approach". I read "over the hammer" as hammering a point home: say it straight, no story, no gentleness around it. I renamed the kind **The hammer**: one idea, said straight. Two samples: "What a boundary is" and "Good, nice, strong, wise". Is that the right kind of piece, or did you mean something else (longer? more repeated? an explanation said over and over until it sticks)?

## The two guards (your question 8, in plain words)
A guard is a rule that stops the project going wrong in a particular way. Two of them were my own proposals:
- **Seven values at most at level 1.** Level 1 is the few things that never change. If the list grows to twenty, it is no longer the few things, and it starts to include preferences. A short list stays something a child can carry.
- **A room opens to the children only when it holds pieces from two authors.** This stops the Compass becoming one person's voice. Early on it is mostly you; this rule would hold a room back until someone else has added to it. You said you want the project to become more shared. Does that look right, or too strict?

They are written as proposals only, nothing in the page enforces them. You said you would review after merge.

## Questions for Jimmy
1. The twelve samples: which feel closest to what you want? Which are wrong in tone? (Any of them can be deleted or rewritten. They are in `data/pieces.js`.)
2. The research suggests children disagree more freely with each other than with a parent. Should some moral games be played by the two children together, with the parents reading what they said afterwards?
3. The children's side: should it be this same map, with the wording and some rooms shown differently for a child, or its own page that opens from here? (My lean: the same palace, a child mode in ⚙️ with larger text, fewer words, and the sample games first.)
4. Voice: should a voice note sit on a thought (as built), on a piece, or both? A story that is a piece with your voice reading it is the main case.
5. Email and text from grandparents: you upload what they send. Do you want a form in the page for that (pick a person, add their words or audio, say who entered it), or do you prefer doing it from the database for now?
6. How should the palace show that a room has been used? Today a badge counts your thoughts. Should it show pieces and other authors too?
7. Which of the research findings surprised you or do you disagree with? That tells me where to look further.
8. What would you like me to look into next? Gaps listed at the end of `research/best_practices.md`: moral development by age, grief and hard family history, raising children between two cultures, siblings.
9. Round 3: the values sorting board (level 1, 2, 3), the village list, or the children's mode?

Answers:
