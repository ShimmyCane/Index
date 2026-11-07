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

   **Answer: Yes** (option b now; (a) later).

2. **Blank passwords.** Right now anyone who knows a username can open its projects. For you and your own sketches that may be fine. Should blank passwords stay allowed, or should the app require at least 6 characters before anything real is saved?

3. **Where the project URL lives.** `js/config.js` needs the database URL and publishable key. The URL contains the project ref, and the Supabase skill keeps refs out of the repo. Options:
   - **(a)** Commit the filled-in file, so GitHub Pages shows cloud saving. Breaks the no-refs rule.
   - **(b)** Keep it out of git (add it to `.gitignore`). Keeps the rule; cloud saving works only on your computer, not on Pages or the iPad.
   - **(c)** Keep the placeholders in git and paste the values in on each device.

   **Answer:** the URL and key should not be hard-coded in the app's JavaScript. The only place for them is `index.html` in this sub-project, which moves to its own repository later. Done: the config block is now at the top of `index.html`, and `js/config.js` is removed. The values are still placeholders in git; Jimmy fills them in. (Supabase can't supply the URL to the app itself, because the app needs the URL before it can reach Supabase.)

4. **Sign-in creates accounts.** A new username creates an account on first sign-in, so anyone can make one. Is that OK, or do you want an invite list or a separate "create account" step?

   **Answer:** one account for now, Jimmy's sign-in email. The first sign-in sets the password. No reset feature. Built: only usernames on the `ss_allowed_users` list can sign in, and that list is filled in by hand in the database. The email is kept out of the repo because the repo is public.

5. **Wrong-password limits.** There is no limit on guesses yet. Add a short lockout after repeated failures? (Recommended before others use it.)

   **Answer:** "2. But once logged in, save it." Read as: a lockout is wanted, and once signed in, projects save to the account. Built: five wrong passwords lock the account for 15 minutes; signed-in projects save automatically. Tell me if "2" meant something else.

6. **Two devices at once.** Saves are last-write-wins. Is that OK for now?

   **Answer: Yes.**

## Next steps (Jimmy)

- Run `supabase/002_shimmy_specs_accounts.sql` in the Architecture project, then add your sign-in email to `ss_allowed_users` by hand (the snippet is at the top of that file).
- Run `supabase/002_test_rollback.sql` and tell Claude the message it prints.
- Fill in the two values in the `index.html` config block (URL and publishable key from the project's API settings).
- Then check the advisors after the SQL runs.
