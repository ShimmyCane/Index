# Supabase — Lessons Learned

Generic lessons from running a shared Supabase project for several small apps. Project names are sources only. Project references, keys and table state are not recorded here.

## Check before you change

1. **Read the live schema, not the repo's schema file.** A repo schema had drifted: a column name was different, a field was missing, and a check constraint blocked a feature the UI offered. Query `list_tables` and `pg_policies`, then diff.
2. **Look at what's already in the project before designing.** An existing shared table may already hold the data a new table would duplicate. Link to it rather than copying it.
3. **Re-list migrations and tables right before applying.** Another session may have changed the project. Never touch objects you did not create.

## Doing the change

4. **Generate insert values from the source** with a quoting function, such as `format('%L', …)`, instead of retyping them. It keeps unusual characters exact.
5. **Prove a copy with a checksum.** Compare `md5(string_agg(concat_ws('|', …), E'\n' order by id))` over the same fields in both places, plus row counts and balances. Matching checksums beat eyeballing.
6. **Keep the old id in a column** (unique) until sign-off. It makes an insert re-runnable with `on conflict … do nothing` and makes reconciliation possible. Drop it afterwards.
7. **Test security and logic inside a rolled-back transaction.** Use a `do $$ … raise exception 'RESULT: …' $$` block to run inserts, calls and assertions, and return results in the error message. Confirm with a count query that nothing persisted. Use `set local role anon` or `authenticated` to test RLS, and `set_config('request.jwt.claim.sub', …, true)` to fake the user.

## Tooling quirks

8. **A migration call can time out without applying anything.** One migration timed out 60 seconds after an idle database. Check what was created (`pg_class`, `pg_policies`, `list_migrations`) before retrying. Small migrations worked; larger ones went through `execute_sql`. Keep the full SQL in the repo, because the migration history can end up incomplete.
9. **Create tables with RLS enabled in the same step.** If a later step fails, a table with RLS on and no policies is locked, which is safe. A table with RLS off is open.
10. **Revoke default grants from `anon` explicitly.** New tables in `public` are granted to `anon` and `authenticated` by default. RLS is the only guard until you revoke.

## App-side

11. **A form option implies a database rule.** A field labelled "Adjustment (+/−)" needs negative amounts allowed. A rule of "amount > 0" would reject them. Read the UI for what it promises.
12. **Anything the browser creates needs a database guard against duplicates.** Client-side monthly work done by whichever device opened first raced. A partial unique index plus ignoring error `23505` in the app fixed the race.
13. **Test a changed front end with a stand-in client that enforces the real schema.** Use the real app code and real rows, in a headless browser, with a fake client that rejects unknown tables and columns. It cannot test a real login, so say so.
14. **Shared logins are a hidden dependency.** If a shared project has one auth user, two apps may sign in as the same person. Check the login before switching an app over.
15. **Register what you create.** A function or table that the app uses but that is not registered will not show up in the unregistered check. Register it in the migration.
