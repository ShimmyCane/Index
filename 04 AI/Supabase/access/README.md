# Access: how sign-in works now (plain words)

Updated 2026-11-23.

## The idea in one breath
Nobody can make an account by themselves. A person asks for access with their email. You see the request, you invite them, they set a password and sign in. Each person has one role, and the role decides what they may do.

## The roles
| Role | Who | What they can do |
|---|---|---|
| owner | you (the admin account) | everything, including approving requests and money |
| parent | grown-ups in the family | everything a kid can do, plus approve allowance withdrawals |
| kid | children | use the apps and their own things; cannot approve money |
| guest | visitors | look at what is shared with them; change nothing |

Today there is one account in each project (yours), so only the owner row exists. The roles table is ready for the others.

## Steps, in order
1. **Turn off open sign-up (Architecture, then Family).** In the Supabase dashboard: Authentication, then the sign-in or providers settings, then Email. Turn off "allow new users to sign up". Save. This is a dashboard setting, so it cannot be done from SQL.
2. **Turn on leaked-password protection (both projects).** Dashboard: Authentication, then password or attack protection settings. Turn on leaked-password protection. Save.
3. **Paste the Architecture SQL.** Open the SQL editor in the Architecture project and paste `architecture_001_access_requests.sql`. Run it. (Run `architecture_test_001.sql` first if you like; it changes nothing.)
4. **Paste the Family SQL.** Only after `family_test_001.sql` has passed. Paste `family_001_roles.sql` in the Family project's SQL editor and run it. It refuses to run if there is more than one account.
5. **Check.** Run the security advisor again in each project. The flagged items should be gone or listed as "later" in the monthly checkup.

## What happens when someone new asks
1. They type their email into the app's sign-in box.
2. If the email has no account, the app says "user not found" and offers "Register".
3. Register asks for the email again and calls `request_access`. The app then says: "Thank you. The admin will get back to you."
4. You see the request in the Architecture database table `access_requests` (status "new").
5. You invite them: Dashboard, Authentication, Users, Invite user. They get an email, click it, set a password, and sign in.
6. Set the request's status to "invited" so the list stays tidy.

Requests are capped at 50 in any 24 hours, so a bot cannot fill the list.

## Why the old version was a risk
The database let anyone create an account with the public key. Any account could then use the owner-only doors that are only protected by "signed in". The Family allowance approval checked only "signed in", so any new account could have approved a withdrawal. The steps above close both.

## Status
- Architecture request table and tests: test passed (4 of 4, rolled back, 2026-11-23).
- Family roles and approval check: test written; **the live test did not finish** (the server question timed out). Not yet pasted. Do not paste until the test passes.
- The sign-in screens in each app still need the "user not found" and "Register" steps. That is the next build step, one app at a time.
