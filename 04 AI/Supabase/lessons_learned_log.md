# Supabase lessons learned (log)

Dated entries, newest first. Each entry says what was seen, what was reproduced, and what to do next time. Generic lessons are also promoted to `lessons_pool.md`.

---

## 2026-11-06 — Browser requests refused with "Forbidden use of secret API key in browser"

**Symptom.** Pages that worked from a browser earlier (notes saved from a page, Family Habits, Adventure) now get HTTP 401 on every table with the message "Forbidden use of secret API key in browser", for the Family project (`twvqvutrcobedvuhnzxq`). The key in those pages is the project's publishable key, `sb_publishable_…`, listed as type `publishable`, not disabled. Command-line requests with the same key succeed.

**What was reproduced.**
1. `curl` against `/rest/v1/habits` with the publishable key:
   - plain curl, curl-style User-Agent, `Origin`, `Sec-Fetch-Mode`, `Accept` or `Bearer <key>` headers: HTTP 200.
   - the same request with a `User-Agent` containing `Mozilla/5.0`: HTTP 401, "Forbidden use of secret API key in browser".
   - so the trigger is the browser-style User-Agent, not the other headers.
2. Family Habits, unchanged code, loaded in headless Chromium with `@supabase/supabase-js` 2.45.4 from npm (the jsDelivr CDN is blocked in this container): every table returns 401 with the same message. The sign-in form is not reached.

**Conclusion.** The Family project now refuses the publishable key when a request looks like it comes from a browser. This is a project or key setting on the Supabase side. It is not caused by the What to Cook or Family Habits code. When it changed is unknown. Check the API keys page in the dashboard for the Family project. If the key shows as publishable and nothing else changed, open a Supabase support ticket.

**Why this matters.** The row-level rules also require a family sign-in for writes (`to authenticated`). A publishable key alone is the anonymous role. A secret key would skip both checks, which is why it must never appear in a page. Anyone who reads page source could read and change every row.

**Lessons (for next time).**
1. **Reproduce the working app first.** Before building a new browser page on a database, load the existing app that uses the same key in the same test browser. If it fails there, the problem is not the new page.
2. **Test writes end to end in a browser, not only with SQL.** The rolled-back SQL test and the table check passed while every browser request was refused. The sync claim was premature.
3. **Keep secret keys out of browser code.** Before any commit that touches a page, search for `sb_secret`, `service_role`, `service-role` and `secret` in the code. The current pages contain publishable keys only.
4. **Use the right sign-in for writes.** Publishable key plus a family sign-in gives the authenticated role; the publishable key alone does not allow writes.
5. **Read the error before changing code.** "Forbidden use of secret API key in browser" was the server refusing the key from the browser, not a bad table name or policy.
6. **Test environment limits.** This container blocks the jsDelivr CDN. Install the library from npm and serve a local copy in the test page, changing only the script tag. Do not edit the app code for the test.
7. **Panels and file:// limits.** Settings panels marked `data-open="false"` need explicit closed state on load. A page opened from `file://` cannot fetch local JSON, so keep a bundled fallback.

**Reproduction steps (kept here so they can be repeated).**
```
# 1. command-line check (expect 200 with plain curl)
curl -sS "https://<project>.supabase.co/rest/v1/<table>?select=id&limit=1" -H "apikey: <publishable key>"

# 2. browser-style check (expect 401 "Forbidden use of secret API key in browser" if affected)
curl -sS ... -H 'User-Agent: Mozilla/5.0 Chrome/120.0 Safari/537.36'

# 3. the working app, in headless Chromium (scratch copy; library from npm)
npm install @supabase/supabase-js@2.45.4   # outside the repo
# copy index.html, app.js and data files to a scratch folder; replace the CDN script tag with the local supabase.js
# load it and record console errors and HTTP status for supabase.co requests
```

**Status.** Open. Waiting on the dashboard check and, if needed, a Supabase support ticket.

---

## Entries from earlier

- Adventure: a migration call timed out without applying anything; checking `pg_class` and then pasting the SQL by hand worked. Keep the full SQL in the repo.
- Adventure: create tables with RLS enabled in the same step, and revoke anon grants.
- Allowances: empty results with no error usually mean row-level security.
- Make 3D and Felix Maze: a rolled-back test that ends in `raise exception 'RESULT: ...'` checks rules without leaving data behind.
