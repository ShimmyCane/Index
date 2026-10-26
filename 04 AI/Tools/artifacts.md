# Artifact (claude.ai page host) — Lessons Learned

**Applies to:** any app published with the Artifact tool.
**Source:** attempt to publish the Speech Therapy MVP (October 2026).

1. **No microphone capability.** Recording in a published Artifact is refused without a declared device capability. The capability list has none for the microphone, so a mic-based app cannot run there.
2. **Outside database calls are blocked.** The page's content policy allows fetch only to the page's own files. A Supabase project URL is not allowed, so the app falls back to its bundled data.
3. **Download links are inert.** `<a download>` and script saves do nothing for viewers, so a Booth "Save" button has no effect there.
4. **Page content only.** The publish wrapper adds the doctype, html, head and body. Publishing a full HTML document nests them. Strip them from the main file; supporting HTML pages in `files` keep their own doctype.
5. **Supporting files work.** Extra `.js`, `.json` and extra `.html` pages publish alongside the main page with `files`.
6. **Use GitHub Pages for anything that needs the microphone, a database or downloads.** Pages serves the repo root or `/docs` over https.
