# Athena's Piano Companion — Convo v0.3

**Project:** Athena's Piano Companion
**Round:** seven notes read from the family table on 2026-11-21 (all open, version 0.1.0). The database itself is live and working: six takes are in it, all six audio files uploaded. Nothing in this round is built; these are the questions and the plan. Note ids are kept so the table can be updated when you say.

## The seven notes

1. `n-1795204615897-b33u7` (Record, Take 3): "…for the music recordings that are stopped after waiting three seconds or having a stop command, where the intent of a pause is to wait until the music finishes. I want you to trim back so that you give it maybe two seconds at most and then the tracks can be very clean without any tail."
   - *Reading:* the end of a take should come at most about two seconds after the music, and sound clean.
   - *Cause I can see:* the page keeps a 0.45 s decay after the last sound that is above its quiet threshold. A piano's slow fade and the room noise keep the sound above that threshold for a while, so the take ends later than the music feels like it ended. A stop made by voice or notes ends at the cut point and does not have this problem.
   - *Plan:* end the take 2 seconds after the last note starts, or earlier where the sound has fallen to quiet, with a fade over the last 0.6 s. Tell me if you want the final held note allowed to ring out instead.
2. `n-1795204678403-6sb4m` (Record, Take 4): "Let's create a paddle just in front of stop recording for ways to start recording."
   - *Reading:* a ⚙️ panel called "Ways to start", placed just before "Ways to stop". ("Paddle" looks like "panel" from dictation.)
   - *Plan:* a panel with check marks: tap the circle (always on), voice phrases (moved here from the Voice panel), and optionally start notes taught like the stop notes. Same collapsible look.
3. `n-1795204706437-2egii` (Record, Take 4): "For stop recording let's also add the phrase stop and the phrase I'm done."
   - *Plan:* stop phrases become: stop recording, stop recording please, stop, I'm done. The words only count while recording, so a stray "stop" at other times does nothing. Devices that already saved the old list get the new phrases added.
4. `n-1795204900282-hodu3` (Library): "There should be a way to delete these as well. I think each session should be saved as well… it's possible that at the end of the day only one track is going to be really used… have another page that allows you to look into the entirety of the database and rank by stars and show only tracks of a certain quality and then I can rename it or do other things and promote it again… easily delete. Here there should be a function to delete one track and there'll be a pop-up: Do you want to delete? and then next to it another pop-up to remind me for the next five minutes. The deleted track should be marked as deleted so there is the ability to restore from the recycle bin, then every 30 days purge those really old files."
   - *This is three features:* (a) delete with a recycle bin, (b) each sitting saved as a session, (c) a page for looking through everything, ranked and filtered by stars, with rename and promote.
   - *Conflict with my earlier choice:* in v0.2 I made takes undeletable. This note replaces that with soft delete.
5. `n-1795204932898-9k5kb` (Library): "…we should have a homepage and a way to go back to the homepage from any of these pages."
6. `n-1795205143092-os9ix` (Compose, piece "My piece 1"): "Minor improvement: when I click on a piece of track on the layer, I should have a quick shortcut to split, to delete, to duplicate. I should also be able to use two fingers to zoom in."
   - *Reading:* "shouldn't" is a dictation slip for "should". A small bar of buttons appears at the picked clip; two fingers pinch the timeline.
7. `n-1795205665794-235l6` (Compose): "…create an ability for Jimmy and Ying and guest to have accounts on here too, instead of showing it all in the upper left corner just allow the user to click through the options. Start with Athena then Felix then Ying, then Jimmy and then guest in that order."
   - *Reading:* one player button that cycles through the five names in that order.

## What the database check showed (read-only, 2026-11-21)

Five `pc_` tables with row-level security on, the bucket private, five registry rows, none unregistered. Six takes, six uploaded. Seven notes. No playlists yet. So syncing from the iPad works.

## Questions (answer inline)

1. **The tail** (note 1). Is "two seconds after the last note starts, fading out over 0.6 s" right? Or should the take keep the natural ring-out of the last held chord (up to 2 s) and cut only silence? *(recommended: two seconds after the last note starts, quiet earlier if it fades sooner)*
   - Answer: Yes tail should be 2 sec. (Also, on the plan line: since the pause may come up to six or seven seconds after the last note, trim backwards until there is only two seconds of pause.)2. **Ways to start** (note 2). Is "paddle" a panel? And is this list right: tap the circle (always), voice phrases, optional start notes you teach? Anything else you want (a clap, a long hold)? *(recommended: circle, voice, start notes)*
   - Answer: Panel3. **Delete and the recycle bin** (note 4). I read it as: tap Delete, a pop-up asks "Delete this take?", and after yes a second message says it is in the recycle bin for 30 days with an Undo button that stays up for five minutes. Is that what the second pop-up is? And may takes older than 30 days in the recycle bin be removed for good by the page, the next time it is opened signed in (deleting the audio file too)? *(recommended: yes to both; purge only things already in the bin for 30 days)*
   - Answer: Your understanding above is correct.4. **Sessions and the browse page** (note 4). A session is one sitting: from waking the page until you leave (or a long quiet gap). Each take belongs to a session, and a session is a dated entry. The browse page lists every take, most stars first, with a "show only 3 stars and up" filter, rename, rate ("promote"), delete, and the recycle bin tab. Is "promote" just giving it more stars, or do you also want a "Keepers" album that holds your best? *(recommended: stars only, plus a Keepers shortcut that is every take with 4 or 5 stars)*
   - Answer: Yeah, when I load the page, let's say after another day, treat this all as take one from the new day; otherwise just continue with the previous takes.5. **Home** (note 5). Right now `index.html` is the Record page, and the nursery tile opens it. Which do you want: (a) `index.html` becomes the Home page with big buttons (Record, Listen, Library, Browse, Compose), and Record moves to `record.html`; or (b) Record stays first, and a 🏠 button on every page opens a new `home.html`? At the piano she needs Record in one tap. *(recommended: (a), with Record the biggest button, and the page remembering the last place she used)*
   - Answer: That sounds good.6. **Players** (notes 7). By "accounts", do you mean only the name a take is saved under (Athena, Felix, Ying, Jimmy, Guest), as now? Or separate sign-ins and separate libraries? And should Guest take a typed name each time? *(recommended: names only, one tap cycles through them in your order, Guest asks for a name the first time)*
   - Answer: Yes7. **Compose shortcuts** (note 6). A small bar over the picked clip: Split, Duplicate, Delete, Undo. Delete asks nothing, because Undo is one tap. Fine? *(recommended: yes)*
   - Answer: Fine
## Marking notes done

When you confirm which notes are handled, I will mark them in `pc_notes` (status `done`, text starting `Done- `). I have not changed any note yet.
