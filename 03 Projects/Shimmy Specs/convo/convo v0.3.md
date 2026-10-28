# Shimmy Specs — Convo v0.3

**Project:** Shimmy Specs
**Round:** accounts and cloud saving (after the MVP merge). Answer inline under each number.

## What was built this round

- Username and password accounts. Usernames can be any text (letters, numbers, `. _ + - @` and spaces). The password can be blank for now.
- Projects save to the Architecture database under your account. Each device keeps a copy, and the header shows whether you are saved to the account, saved on the device only, or offline.
- Minimize buttons for the menu and the notes panel; a drag handle to resize the notes panel; ▲▼ to reorder its panels. Works with touch.
- SQL file `supabase/002_shimmy_specs_accounts.sql` (run once by you) and a rollback test `supabase/002_test_rollback.sql` (run after it). `001` is superseded and must not be run.

## Questions that need your decision

1. **Google and Microsoft sign-in.** Two ways:
   - **(a)** Move accounts to Supabase Auth. That supports Google and Microsoft, but it needs an email-style login (usernames become emails) and an OAuth app set up in Google Cloud and Azure, with redirect addresses in Supabase.
   - **(b)** Keep username and password, and add Google and Microsoft later as a second way in, once the OAuth apps exist.
   My suggestion: **(b) now**, and (a) only when people outside the family need accounts. Which one?

2. **Blank passwords.** Right now anyone who knows a username can open its projects. For you and your own sketches that may be fine. Should blank passwords stay allowed, or should the app require at least 6 characters before anything real is saved?

3. **Where the project URL lives.** `js/config.js` needs the database URL and publishable key. The URL contains the project ref, and the Supabase skill keeps refs out of the repo. Options:
   - **(a)** Commit the filled-in file, so GitHub Pages shows cloud saving. Breaks the no-refs rule.
   - **(b)** Keep it out of git (add it to `.gitignore`). Keeps the rule; cloud saving works only on your computer, not on Pages or the iPad.
   - **(c)** Keep the placeholders in git and paste the values in on each device.

4. **Sign-in creates accounts.** A new username creates an account on first sign-in, so anyone can make one. Is that OK, or do you want an invite list or a separate "create account" step?

5. **Wrong-password limits.** There is no limit on guesses yet. Add a short lockout after repeated failures? (Recommended before others use it.)

6. **Two devices at once.** Saves are last-write-wins. Is that OK for now?

## Next steps once answered

- Fill in `js/config.js` (or tell me where to read the values), run `002_shimmy_specs_accounts.sql`, then `002_test_rollback.sql`, and tell me the message it prints.
- I'll check the advisors after you apply the SQL.
