# Peek: poem structure

**Project:** Adventure (Ondra, Athena's story)
**Status:** research and proposal, 2026-11-10. Not yet in `storyteller.md`.
**Sources:** see the end of this file.

## What a peek is

A peek is the shortest catch-up. Today the player shows `text_tiny` (two sentences) to a family member who was away for a few minutes. Jimmy wants the peek to be a **poem**, with a form chosen from the mood of the chapter. The whole page (about five minutes aloud) and the minute stay prose.

Length of a peek: **2 to 8 lines.** Long enough to carry the chapter's mood and one image, short enough to read on a glance.

## How to pick the form

The storyteller reads the chapter's mood first (the `prompt` and the strongest beat in the scenes), then picks one row.

| Chapter mood | Form | Meter | Rhyme | Lines | Why it fits |
|---|---|---|---|---|---|
| Wonder, calm, the Tree and its roots | Iambic tetrameter, rhymed couplets | iambic, 4 feet (8 syllables) | AABB | 2 or 4 | Steady, like a heartbeat. Sounds good read aloud by a grown-up. |
| Quiet mystery, one clear image | Haiku | none (count syllables) | unrhymed | 3 | One picture, nothing extra. Good for a closed door, a moss-lit path. |
| Funny beat (the "Light in the dark" rule) | Limerick | anapestic (da-da-DUM), trimeter then dimeter | AABBA | 5 | Bouncy and silly. Children remember it and say it back. |
| Spell, the Hush, the Twin Keys, the Moon | Trochaic tetrameter | trochaic (DUM-da), 4 feet | AABB | 2 or 4 | Falling rhythm, like a chant. Works for magic and warnings. |
| Memory, loss, the old world | Iambic pentameter, rhymed | iambic, 5 feet (10 syllables) | AABB, or ABAB | 4 | Slower and fuller. Use sparingly; the family is young. |
| A tale told by Granny Wren or the village | Common meter (hymn measure) or ballad stanza | alternating 4 and 3 feet (8-6-8-6 syllables) | ABAB (common) or ABCB (ballad) | 4 | Old songs and village sayings have this shape. |

Rules of thumb:
- **Never mix forms** in one peek. One form, one mood.
- **Default to iambic tetrameter** when the mood is unclear. It is the easiest to read aloud.
- **Haiku when the scene is still.** Never for a fight or a chase.
- **Light moment every chapter** (rule "Light in the dark"): if the chapter has no funny beat, the peek can still end on a small smile line.
- **Limerick only for a laugh** and only if the chapter really has one.

## Writing rules for a peek

1. **Read it aloud, in the voice of the storyteller.** If a line sounds awkward aloud, rewrite it, even if it scans.
2. **Stress first, then rhyme.** Mark the stresses (da-DUM) on paper before the rhymes. Then check each line against the chosen foot.
3. **Keep one image per line.** Mossbrook, the linden bells, the key, Bristle, the Tree.
4. **Use simple words.** Children read along. Avoid "therefore", "whilst", "ere".
5. **End on the question or the hook.** The last line should make the family want to tap through to the chapter. The prompt's options can echo in it, but never list them.
6. **Count the syllables** for haiku and common meter. Count the feet for the others.
7. **Keep it kind.** Exciting, not frightening (`world/bible.md`, section 8).
8. **Do not put names of real people or places** in a peek. Ondra only.

## Worked examples (drafts, scanned)

Stresses are capitalised. Use these as shape models, not as text to copy.

**Iambic tetrameter, couplets (wonder):**
> You WAKE where ROOTS hold UP the TREE,
> a SUN-and-MOON key ON your KNEE.

Eight syllables per line, stress on every second syllable.

**Haiku (quiet mystery), 5-7-5:**
> Moss cool at the roots (5)
> a bell hums through the grey wood (7)
> the key knows the way (5)

**Limerick (a laugh), AABBA:**
> Bristle the dog had grey HAIR
> who sneezed when he sniffed at the AIR.
> He sneezed till the moss flew up HIGH,
> and a wren said, "Bless you!" with a SIGH.
> Now he sneezes with greater CARE.

Scansion: lines 1, 2 and 5 are trimeter, lines 3 and 4 are dimeter. The rhyme sound is in the stressed word.

**Trochaic tetrameter (a spell or a chant):**
> MOON and SUN, the KEY is TURN-ing,
> TREE of ROOTS, the MOSS is LEARN-ing.

Stress on the first syllable of each foot, falling rhythm.

**Iambic pentameter, couplet (memory):**
> The names lie kept where the old roots run deep,
> and no one hums them, even in their sleep.

Ten syllables per line, stress on every second syllable.

## Terms to use (from the cheat sheet)

- **Feet.** Binary: iamb (unstressed, stressed), trochee (stressed, unstressed), spondee (two stresses), pyrrhic (two unstressed). Ternary: anapaest (weak, weak, stress), dactyl (stress, weak, weak), and others that are rarely needed here. Stress means strength, not length.
- **Line length.** Monometer (1 foot), dimeter (2), trimeter (3), tetrameter (4), pentameter (5), hexameter (6), heptameter (7), octameter (8).
- **Feminine ending.** A line ending on a weak syllable. "TURN-ing" in the trochaic example is one. Fine for spells and chants.
- **Substitution.** One foot swapped for another, for emphasis. "To BE or NOT to BE" opens with a trochee in an iambic line.
- **Acephalic.** A line missing its first unstressed syllable. Useful for a chant that starts hard.
- **Rhyme types.** End-rhyme (the default here), internal, assonantal (same vowel), consonantal (same consonants), eye-rhyme (looks like a rhyme: heard/beard, not a rhyme), rich-rhyme (same sound, different meaning: bard/barred, good for a laugh).
- **Stanza names.** Tercet (3 lines), quatrain (4), cinquain (5), sixain (6).

## Checklist before a peek goes into `adv_chapters.text_tiny`

- [ ] The form matches the mood (table above).
- [ ] Every line follows the foot (say it aloud).
- [ ] Rhyme scheme is right for the form.
- [ ] Two to eight lines.
- [ ] One image, simple words, no real names.
- [ ] Ends on the hook or a small smile.
- [ ] Full chapter text (`text_short` or `text_long`) is still prose; only `text_tiny` is the poem.

## How it is stored and shown (proposal)

- `adv_chapters.text_tiny` holds the poem, lines separated by a newline. Paragraphs in the poem are separated by a blank line.
- The player shows the poem with its line breaks kept (`white-space: pre-line`), and reads it aloud line by line.
- Needs: a `form` note in the chapter `plan` or a new optional `peek_form` field, so the next storyteller run can check it. Not yet built. Decide with Jimmy (question 1 in `minute structure.md`).

## Sources

- Reddit r/Poetry, "A cheat sheet/crash course in poetic meter and form" (`https://www.reddit.com/r/Poetry/comments/et2a0/a_cheat_sheetcrash_course_in_poetic_meter_and_form/`). The tool could not fetch it and search did not return it, so Jimmy pasted the text into the convo. It is the main source for the terms section below. It is one forum poster's crash course, not a textbook. Where it is loose (its Sapphic description, its rondel note), this file uses the standard form or says so.
- Feet and meter (iamb, trochee, anapest, dactyl; line length by Greek prefix): Poetic Feet, Literary Devices (`https://literarydevices.net/?p=16962`); Poetic Meter, J. Pellegrino (`https://www.jpellegrino.com/teaching/writing/meter.html`); Prosody cheat sheet, J. Pellegrino (`https://www.jpellegrino.com/cheatsheets/TheEnglishMajorsProsodyCheatSheet-6x9.pdf`).
- Haiku 5-7-5 unrhymed; quatrain, ballad and rhyme-scheme names: Types of Poems, Tutors.com (`https://tutors.com/lesson/poetic-forms`); Poetic forms study guide, Fiveable (`https://fiveable.me/english-12/unit-13/poetic-forms-structures/study-guide/TestEm8kHsGLk35o`).
- Limerick AABBA, anapestic trimeter and dimeter; villanelle 19 lines: Harvard, Key to Poetic Forms (`https://poetry.harvard.edu/key-to-poetic-forms.md`); Fiveable meter entry (`https://fiveable.me/english-11/key-terms/meter`).
- Common meter (8-6-8-6, alternating tetrameter and trimeter, ABAB) and ballad stanza (ABCB): the search summaries above. One tutoring site gives the limerick as AABA; the other sources say AABBA, which is used here.
- Where sources conflicted (haiku as aabba on one forum, the limerick as AABA on one tutor site), the common-form answer is used and noted.
