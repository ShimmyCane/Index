# Better Parenting — convo v0.1 (2026-11-16)

## The request (summary)
A website of scenarios for a parent to practise and learn from, for children from kindergarten to grade 5. As many scenarios as fit. Researched content, with video links welcome. Structured so a scenario can be as specific as wanted, and also as general topics by age group or developmental stage. Linked to the family database.

## Decisions made to get to a first build (say if any is wrong)
1. **Three stages, six grades.** K, grades 1 to 2, grades 3 to 5. A grade chip filters to its stage.
2. **Your children's grades are a setting, not content.** ⚙️ → "My kids' grades" stays on the device and adds a ★ Mine filter. Nothing about them is in the repo.
3. **Practice means answer first, then compare.** You write or think your answer, see the coach card, and rate yourself. Missed ones come back sooner.
4. **"As specific as I want" is the My own scenario panel.** The plan is built from the topic and stage, and an AI chat can sharpen it by copy and paste. The page itself never talks to an AI.
5. **Videos.** 18 video links found by search, plus a YouTube search link on every scenario, skill and topic. The build machine cannot open YouTube, so no link has been watched.
6. **Patience.** A one-minute pause button sits in the lower left, and "You, the parent" is its own topic.
7. **The home page tile is not added.** `index.html` changes only when you ask.

## Questions for Jimmy
1. Is the tone right: short cards, one line to say, one line to avoid? Or do you want longer explanations?
2. Should practice be multiple choice (pick the best of three responses) as well as write-then-compare? It needs three written responses per scenario.
3. Which topics need more scenarios first? Each has 8 to 10 now.
4. Should a second parent's practice be kept apart from yours, or is one shared family record right?
5. Do you want the page to read scenarios aloud, or a daily "scenario of the day"?
6. Add the Better Parenting tile to the nursery home page?

Answers:
- Q6 (2026-11-17): yes. Tile added to the Nursery list; `/start-project` now adds it with the first build.
