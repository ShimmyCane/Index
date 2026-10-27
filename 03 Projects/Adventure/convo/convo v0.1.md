# Adventure — Convo v0.1

**Project:** Adventure
**Round:** 1 (started by `/start-project`)

## What we've agreed so far

- **Origin:** car-ride adventures with Athena using ChatGPT as dungeon master (the crypt, the Sun and Moon Chest, Bristle the dog). Now a game for the whole family.
- **Correspondence style:** everyone makes a move when they're available. A nightly AI run reads the moves in Supabase and writes the next page. No AI in the browser, no API key in the page.
- **Roles, not players:** Supabase keeps a list of roles. The family picks or swaps them freely. Playing as the dog is a goal.
- **Each role has its own view** of the story, with some secrets only that role knows.
- **The story keeps going** even if a role doesn't answer.
- **Puzzles with more than one right answer** can branch the story. Moral choices suited to a seven-year-old. Short books with real endings.
- **Dungeon master in parts:** the nightly storyteller does the heavy lifting. Jimmy steps under the hood to shape the larger story. A small rules engine can keep things moving during the day later. Jimmy can also run Claude by hand to update the story.
- **Mostly listening:** the game is text and read-aloud. A front end is optional. Bedtime reading and letting the kids imagine it is the heart of it.
- **Twine** is worth trying on the side for hand-written branching stories.

## Questions

Answer inline under each number.

1. **How do players listen and answer in the MVP?**
   - (a) A small player page per role: pick a role, tap to hear the page, tap an option or type an answer. *(recommended)*
   - (b) No page: you read the chapter at bedtime from a Claude chat or doc, and type the family's answers to Claude.
   - (c) Both.

2. **Nightly run: when, and does it publish on its own?**
   - What time should it run (for example 2 a.m.)?
   - Should each new chapter wait as a draft until you approve it under the hood, or publish straight away? *(recommended: drafts for Book 1, auto-publish once you trust it)*

3. **What do you want to control under the hood?** Tick what matters for the MVP:
   - edit the world bible (places, characters, objects, rules)
   - write or change the book outline (where Book 1 is heading)
   - leave notes for tonight's run ("Bristle finds a feather")
   - plant a secret for one role only
   - edit or reject a draft chapter
   - anything else?

4. **The first book and roles.**
   - Continue the crypt and the Sun and Moon Chest, or start a fresh world?
   - Which roles should Book 1 start with? (for example: the explorer, Bristle the dog, a third role?)
   - There is already a seed project called `Athena's world` with only a page holder. Should Adventure replace it, absorb it, or stay separate?

5. **Supabase.**
   - Use the existing family Supabase project, or a new one for the nursery?
   - The nightly run needs Claude's Supabase connection granted to its scheduled task. Is that OK?
   - Who can open the player page? (anyone with the link, or a simple family sign-in)

---

_Answers here, or in `convo v0.2.md`. Once answered, Claude builds the MVP._
