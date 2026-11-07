# Smoke Test (headless browser check)

Purpose
Check that a nursery web app actually runs in a real browser before anyone calls it done: every page loads, no JavaScript errors, the layout fits the screen, the main controls work (including touch), and the numbers on screen are right. Screenshots go to the scratchpad so they never reach the repo.

When to use
- After any change to a page, before a commit, and before saying "it works".
- For every new app, as its first check after the MVP.
- Anything that renders (3-D, SVG, canvas, printable sheets).

Input
- Project folder (under `03 Projects/`), and the pages to test (from its `CLAUDE.md` or `schematic.md`). If none is given, ask.
- Optional: the test hooks the page exposes (for example `window.__m3dViewer.viewState()` or `window.FishGame.debugSetSize`). Read them from the code; do not guess.

Setup
- Use the pre-installed Chromium and Playwright. `require('playwright')` works from any folder. Do not run `playwright install`.
- Launch with `chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })`. Without the GL flags, WebGL scenes render blank. Only if a project pins another Playwright version, add `executablePath: '/opt/pw-browsers/chromium'`.
- Write the test script in the scratchpad (not in the project). Run it from there.
- Screenshots go to the scratchpad, e.g. `<scratchpad>/shots/<project>/`. Never into the repo.

Steps
1. **Load every page from `file://` first.** A double-click is how Jimmy uses most of these. ES module imports fail there; use classic scripts (see the pool, "File-based pages").
2. **Three screen sizes per page:** 1180 × 820 (iPad landscape), 768 × 1024 (iPad portrait), 390 × 844 (phone). For each one:
   - collect `pageerror` and `console` errors; the page must have zero;
   - check no horizontal scroll: `document.documentElement.scrollWidth <= window.innerWidth`;
   - find the element that overflows if it fails (Growth: a long select widened a 390 px header to 478 px);
   - take a screenshot and look at it.
3. **Touch.** Make a context with `hasTouch: true`. Taps and drags use `page.touchscreen` or `Input.dispatchTouchEvent` over a CDP session (`context.newCDPSession(page)`). Two-finger pinch uses two `touchPoints` that move apart or together. Check the page does not scroll while drawing or dragging.
4. **Controls.** Click or drag each main control, then read the result from a value the page exposes, and assert the number (for example, dot count equals solution count). Visual checks alone are not enough.
5. **Settings and errors.** Open the ⚙️ drawer. Turn Show errors on and off. Check the error panel is at the bottom and that the gear does not cover a control.
6. **Reload.** Reload the page and check the saved state comes back (settings, the last item, drafts).
7. **Print**, if the app prints: `page.emulateMedia({ media: 'print' })`; the gear and answers must not appear.
8. **Cache-bust** when a change is not showing: add `?v=<timestamp>` to the page URL.

Gotchas (from the Playwright note and past runs)
- `selectOption` and `click` wait for visibility. A control inside a closed drawer times out: open the drawer first, or set the value with `page.evaluate`.
- Some emoji do not render headless (⏸ shows as a box). Use inline SVG for any icon that must read on every device.
- The Make 3D viewer orbits on pointer drag (about 0.008 rad per pixel): move in steps while the button is down, then screenshot.
- Software GL is slow: give 3-D pages a longer timeout, and do not time them against the 2-D pages.
- `net::ERR_TUNNEL_CONNECTION_FAILED` for a Supabase or other outside host is the sandbox proxy, not the app. Name the host in the report and classify it as environment. A real app error still blocks; an outside request the sandbox can't reach does not, provided the page works without it (Fishes: the proxy may block `supabase.co` from the browser).

First real run (Expansion Wars, latest `origin/main`): three sizes, no overflow, title screen rendered at phone width, only the proxy message above. The check ran in about a minute.

Report
- Pages tested and sizes; errors (with the message and file); overflows (with the element); screenshot paths in the scratchpad; the assertions and their results.
- What was not tested: real iPad, real finger or Apple Pencil, sound on device, real sign-in, print on paper. Say so every time.
- If a check failed, reproduce it first, fix only what it needs, and show the same check passing.

Rules
- Zero console errors is the bar. A try/catch that hides an error is a bug to report, not a pass (Fishes: an NPC draw error was hidden for a while).
- Never call a visual change done without looking at the screenshot.
- Keep test scripts out of the project unless the project keeps a `tests/` folder for them; then add the script there and say so.
