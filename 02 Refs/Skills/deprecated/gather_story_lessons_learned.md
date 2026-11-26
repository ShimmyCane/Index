# Gather story lessons learned (internal, Adventure storyteller)

**Purpose:** you are the dungeon master for a new family, and there is a lot to learn on both sides. This skill records what the family and the story teach, so that planning gets faster and better each time. It is **internal**: the family does not see it. It runs after `update-story`, and whenever `consider-actions` finds something new.

Learning goes both ways. Note what the family enjoys, what worries them, and what you guessed right or wrong. Then adapt. Do not reshape the family's story to fit a profile; use the profile to plan.

## 1. What to record each time

Go through these in order. Write only what you saw; do not guess.

**Pacing** (how the family is feeling)
- *Engaged:* many scenes, long beats, questions asked, the story picked up quickly. Next time: may go more intense, a bit more of a dark turn, bigger stakes.
- *Tough time:* short scenes, hesitation, stalled turns, a note that something was too scary or too hard, a tired tone. Next time: ease up on the difficulty, make the next chapter lighter and funnier, give an easy way forward.
- *Steady:* normal play. Keep the current level.

**Plot adherence** (how closely they stay on the line)
- *Keeps to the plan:* they follow the planned path. Next time: anticipate one main path; little side planning needed.
- *Wanders:* they go off the plan, or one role keeps pulling the story somewhere new. Next time: keep three paths open, check the plan points they are likely to skip, and adapt rather than resist.
- *Restrain:* a role's move would break a rule or the tone (How dark it gets; Light in the dark). Next time: steer with the world, not with a refusal. Note how it was handled.

**Roles** (one profile per role, built over time)
- What the role does: brave, clever, kind or loyal (Athena's values; see the puzzle rules).
- What they say and how they speak; what they ask about; what they ignore.
- What they have not yet tried; what would delight them next.
- Only *play* behaviour. Never personal details about the people behind the roles.

**The storyteller's own record**
- What you guessed right. What you guessed wrong, and why.
- Which prompts were answered quickly, and which were skipped or confusing.
- Which puzzles worked (more than one right answer; no dead ends) and which had no route.
- Anything Jimmy changed under the hood, and what it taught.

## 2. Where it is stored

Two places, chosen by privacy.

**Repo (public):** `04 AI/Adventure/story_lessons.md`. Process lessons only: pacing rules that worked, planning steps that saved time, mistakes and their fixes. Use role keys (`athena`, `bristle`, `old_lady`, `storyteller`), never scene text, never names of the people who play. Date every entry. Log it in `04 AI/ai_schematic.md` the first time the file is created.

**Supabase (private, `adv_`):** family-specific profiles.
- Each role's profile: an `adv_entries` row with `kind = 'character'`, title `Play profile: <role name>`, body with the points under "Roles" above. Update it in place as you learn; keep the date in the body.
- The family's pacing rule: an `adv_entries` row with `kind = 'rule'`, title `How this family plays`. Storyteller reads every rule first, so this is how the next run adapts. **Ask Jimmy before changing a rule entry**; propose the new wording in chat and save it when he agrees.
- Never delete a profile; change it, and say what changed.

## 3. Before planning next time (how to use it)

Read the `How this family plays` rule and the `Play profile` entries, then choose how far ahead to plan:

| Signal | Planning depth | Tone |
|---|---|---|
| Keeps to the plan | one main path, plan points only | as planned |
| Wanders | three paths; check every plan point they might skip | as planned, with more room for the side paths |
| Engaged | main path plus the bigger stakes | may go more intense, within the rules |
| Tough time | main path, one easy way forward | lighter, funnier, the Light in the dark moment bigger |
| A role is out there | plan for their moves; keep the world responsive | never refuse; steer with the world |

Pick the row, say which one you used in the run note, and check the result next time.

## 4. Write the lesson

Append to `04 AI/Adventure/story_lessons.md` (repo), one entry per run:

```
## YYYY-MM-DD: <chapter number and title>
- Pacing: <engaged | tough time | steady> because <evidence, no names>
- Plot: <keeps to the plan | wanders | restrain> because <evidence>
- Planning used: <row from the table>
- Right / wrong guesses: <one line each>
- Process change: <what to do differently next time>
```

Then, if a family profile or rule changed, update it in Supabase and say so in the run note.

## 5. Privacy

- Repo: no scene text, no names of the people who play, no personal details, no quotes from the family.
- Supabase: profiles describe play, not people.
- The report to Jimmy stays in chat.
