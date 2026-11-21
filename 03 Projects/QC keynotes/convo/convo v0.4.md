# QC keynotes — convo v0.4

Purpose: what the QC checks, after Jimmy's review comments in the database. Jimmy answers inline.

## What is being checked
The QC checks well-formed keynotes: whether the phrasing meets the standard. Numbers and CSI codes are not the point. The same keynote can be note 7 on one drawing and note 9 on another, so numbering and CSI are off by default.

Colours, as built now:
- **Green:** the text is exactly an approved phrase. The whole phrase is highlighted green.
- **Yellow:** scope problems (no scope word for the selected scopes), phrasing not in the approved list, or the same words with different case or punctuation. Yellow words are underlined.
- **Red:** the keynote breaks a rule: it does not open with an approved verb, FIRE without a rating word, or lower-case letters where upper case is required. The words that break the rule are underlined red.

## Questions for Jimmy
1. The LLM review you described (underlining the parts of a sentence that agree, question or disagree) is not built. The page is rule-based for now: the word colours come from the approved phrases and the rules. Do you want the LLM review built later, and if so, through which backend (it needs a server or a key; this page has neither)?
   - Answer:
2. The approved phrase list and the approved verbs are the standard. Which other opening verbs and phrases should be approved?
   - Answer:
3. Should numbering be checked against callouts in any drawing (off now), or only per drawing when the owner asks?
   - Answer:
