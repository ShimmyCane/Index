# Access requests (no open sign-up)

Purpose
Let a new person ask for access with an email, without opening sign-up. The owner reviews requests and invites people. Roles decide what each person can do.

When to use
- Any app that has sign-in on a Supabase project.
- When an app's sign-in page should say "user not found" and offer "Register".

Input
- The project (Architecture or Family), the app name, and whether it has its own sign-in screen.

Steps
1. Check the project has the request table and function. Architecture: `04 AI/Supabase/access/architecture_001_access_requests.sql`. Family roles: `family_001_roles.sql`. If not pasted yet, say so and stop.
2. Confirm sign-up is off in the dashboard (Authentication, sign-in or providers, Email, allow new users to sign up = off). This is a dashboard setting; say so if it is still on.
3. In the app's sign-in screen:
   - Email is typed. Sign-in is tried.
   - If the email has no account, show "user not found" and a "Register" button. Do not say whether the email exists in any other way.
   - Register asks for the email again, then calls `request_access` with it (Architecture). Show the reply text: "Thank you. The admin will get back to you."
   - Show a plain error if the reply is an error (bad email, too many today).
4. Never add a button that creates an account by itself.
5. Owner invites from the dashboard after reviewing `access_requests`, then sets the status to "invited".
6. Roles: owner, parent, kid, guest. Check the role with `family_role()` before any action that spends money or changes other people's data. Kids and guests may not approve.
7. Test in a rolled-back transaction: anon can request, a bad email is refused, anon cannot read requests, owner can. Same for roles.

Gotchas
- A password reset or invite email can land in spam. Tell the owner to check there.
- Do not put any real email in SQL, scripts or repos. Use `rolled-back-test@example.com` in tests.
- Keep the owner check on `platform_is_owner()` (Architecture) or `family_role()` (Family), never on an email.

Report
- What was checked, what passed, what was not done (dashboard settings, app screens).
