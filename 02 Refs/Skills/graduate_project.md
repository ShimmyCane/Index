# Graduate Project

Move a project out of the nursery (`03 Projects/<Project>/` in `ShimmyCane/Index`) into its own public repo, served by GitHub Pages, with every link and database pointer updated, and nothing left behind in Index to drift apart.

Some steps are **manual** (Jimmy does them on GitHub or his computer); Claude prepares everything around them, checks each one, and keeps the checklist.

## Input

- The project folder name under `03 Projects/`. Do not guess it; ask if unclear.
- The new repo name. Default: the folder name with spaces and apostrophes turned into hyphens (`What to Cook` → `What-to-Cook`, `Athena's world` → `Athena-s-world`). Confirm with Jimmy.
- Which home-page section the tile moves to: Games, Learning, Family or Architecture. Ask.
- Derived: Pages URL `https://shimmycane.github.io/<Repo>/`.

## The checklist

Keep one section per graduation in `04 AI/graduations.md` (create it if missing), copied from this template and ticked as each step is done. Manual steps are ticked only when Jimmy confirms or Claude has checked the result.

```
## <Project> → ShimmyCane/<Repo>   (started YYYY-MM-DD)
- [ ] 1 Ready check (Claude)
- [ ] 2 Prepare the folder (Claude)
- [ ] 3 Copy into its own folder (manual)
- [ ] 4 Create the public repo and push (manual)
- [ ] 5 Turn on GitHub Pages (manual) — live at https://shimmycane.github.io/<Repo>/
- [ ] 6 Database pointers (Claude)
- [ ] 7 Home page link (Claude)
- [ ] 8 Other places that point at the old folder (Claude)
- [ ] 9 Remove from the nursery (Claude)
- [ ] 10 Record (Claude)
```

## Steps

### 1. Ready check (Claude)
- Read the project's `schematic.md`, `CLAUDE.md`, latest convo, and `04 AI/<Project>/brief.md`. Note open questions and unapplied SQL; they travel with the project.
- **Runtime independence:** grep the project for paths that leave its folder (`../`, `03 Projects/`, `03%20Projects`, `04 AI/`). Every file the page loads must be inside the folder. Copy shared files in (vendored libraries with their licences) rather than linking out.
- **Privacy:** the new repo is public too. Run `02 Refs/Skills/scripts/privacy_scan.sh` and check its findings for this folder; read convo and notes files for private details. A `private/` folder never travels; say so if one exists.
- **Smoke test** (`02 Refs/Skills/smoke_test.md`) from the project folder as if it were a site root.
- Report blockers to Jimmy before going on.

### 2. Prepare the folder (Claude, in Index, one PR)
- **Entry page at the root:** GitHub Pages serves `index.html` from the repo root. If the main page has another name (for example `living_room_v10.html`), add an `index.html` that is the app (preferred) or redirects to it.
- **`.nojekyll`** (empty file) at the root, so Pages serves every file as is (folders starting with `_`, no Jekyll build delay).
- **`README.md`** for the repo: one paragraph on what it is, the live link, how to run it, and "Graduated from `ShimmyCane/Index`, `03 Projects/<Project>`, on YYYY-MM-DD."
- **AI notes travel:** copy `04 AI/<Project>/brief.md` and `lessons.md` into the project as `ai/brief.md` and `ai/lessons.md`. Promote anything reusable to `04 AI/lessons_pool.md` first (it stays in Index).
- **Project `CLAUDE.md`:** make it stand alone. It must not depend on Index's root `CLAUDE.md` or `04 AI/`. Point at `ai/brief.md`, `ai/lessons.md`, its own convo, todo and SQL. Copy in the few Index rules it needs (public repo, privacy, no secret keys, Supabase publishable key only, the table prefix).
- **Device storage:** the old and new pages share one origin (`shimmycane.github.io`), so `localStorage` carries over. Check the keys have a project prefix so two apps never collide.
- Merge this PR when Jimmy asks, so `main` has the ready folder.

### 3. Copy into its own folder (manual, Jimmy)
- Copy the **contents** of `03 Projects/<Project>/` (not the folder itself) into a new local folder named `<Repo>`, so `index.html` sits at its top level.
- Do not copy `private/`.

### 4. Create the public repo (manual, Jimmy)
- On GitHub: New repository → owner `ShimmyCane`, name `<Repo>`, **Public**, no README or licence (the folder has its own).
- Push the folder: `git init`, `git add .`, `git commit -m "Graduate from Index"`, `git branch -M main`, `git remote add origin https://github.com/ShimmyCane/<Repo>.git`, `git push -u origin main`.
- If Claude should work on it later: install or extend the Claude GitHub App to the new repo (github.com/apps/claude).
- Claude does not create repos unless Jimmy asks for it in so many words.

### 5. Turn on GitHub Pages (manual, Jimmy)
- Repo Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch **main**, folder **/ (root)** → Save.
- Wait a minute or two, then open `https://shimmycane.github.io/<Repo>/`.
- **Claude checks:** the URL answers 200 and the smoke test passes against it (if the network allows; otherwise Jimmy confirms on the iPad). Microphone, database sign-in and downloads need the real Pages site, not a preview.

### 6. Database pointers (Claude)
Only if the project uses Supabase (Family project `twvqvutrcobedvuhnzxq` unless the brief says otherwise).
- **Registry:** point every row of the app at the new repo, and check nothing is unregistered:
  ```sql
  update public.app_table_registry set repo = 'ShimmyCane/<Repo>'
   where app = '<app-slug>' and repo = 'ShimmyCane/Index' returning object_name, repo;
  select * from public.app_table_unregistered where object_name like '<prefix>%';
  ```
  This only changes a pointer, so Claude may run it directly. Descriptions keep their "<App>: …" start.
- **Tables, data, policies and buckets stay as they are.** Nothing is renamed or moved; the new site uses the same publishable key and family sign-in.
- **Auth:** the origin is still `shimmycane.github.io`. If the app uses magic links or OAuth redirects to a full path, add the new path to Supabase Auth → URL Configuration → Redirect URLs (manual, Jimmy).
- **Server pieces:** Edge Functions, storage buckets and scheduled jobs that mention the project keep working; update any comment or path that names the old folder.
- Update `04 AI/Supabase/brief.md`: SQL paths now name the repo (`the ShimmyCane/<Repo> repo, supabase/`).

### 7. Home page link (Claude)
Running this skill counts as Jimmy asking for this `index.html` change, and only this one.
- Move the project's tile from the **Nursery** section to the section Jimmy chose.
- Change its `href` from `03%20Projects/<Project>/…` to `https://shimmycane.github.io/<Repo>/`.
- Keep its shape class, colour and size; change nothing else on the page.

### 8. Other places that point at the old folder (Claude)
Grep Index for the folder name (plain and URL-encoded) and fix live pointers; leave history alone.
- **Fix:** other projects that link to it or copied from it (say "copied from `ShimmyCane/<Repo>`"); `03 Projects/03 projects_schematic.md`; `04 AI/04 ai_schematic.md`; `04 AI/ai_task_tracker.md`; `04 AI/Supabase/brief.md`.
- **Leave:** `04 AI/lessons_pool.md`, `patterns.md`, old project reviews and lesson logs: they record where a lesson came from.
- **Skills in `02 Refs/Skills/`** that use the project as an example: list them for Jimmy; edit only if he asks.
- **Scheduled tasks** (list them) whose prompt names the old path, for example a nightly storyteller: tell Jimmy and update the prompt when he agrees.
- **Cloud environments or setup scripts** that set up the old folder: tell Jimmy.
- **People:** iPad home-screen icons and bookmarks point at the old URL. Tell Jimmy to re-add them from the new site.

### 9. Remove from the nursery (Claude)
Only after step 5 is checked live and step 7 is merged.
- `git rm -r "03 Projects/<Project>" "04 AI/<Project>"`.
- In both schematics, drop the project's line and add it to the "Graduated to their own repos" note, with the repo.
- Re-run the grep from step 8: no live pointer to the old folder may remain.
- Privacy scan, one PR, merge when Jimmy asks. History stays in git.

### 10. Record (Claude)
- Tick the checklist in `04 AI/graduations.md` and add the date it finished.
- Add anything learned to `04 AI/lessons_pool.md` (`/update-lessons-learned`).
- Tell Jimmy: the live URL, the repo, what was removed, and anything still manual.

## Rules
- Never create a repo, change Pages settings or touch Auth settings unless Jimmy asks in so many words; give him the exact clicks instead.
- Never delete the nursery copy before the new site is checked live.
- Never move or rename database tables to graduate a project.
- Never edit `readme.md`. Edit `index.html` only as step 7 says.
- Ask when the repo name, section or entry page is unclear.
