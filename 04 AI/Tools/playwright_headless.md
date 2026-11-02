# Playwright, headless Chromium — Lessons Learned

**Applies to:** browser checks of the nursery's web apps (smoke runs, renders, touch tests).
**Source:** Make 3D animation and pinch zoom (November 2026).

1. **WebGL needs software GL.** Launch with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, or Three.js scenes render blank.
2. **Two-finger pinch can be tested.** Make a context with `hasTouch: true`, open a CDP session (`context.newCDPSession(page)`), and send `Input.dispatchTouchEvent` with two `touchPoints` that move apart or together. Read the result from a value the page exposes (Make 3D exposes `window.__m3dViewer.viewState()`).
3. **`selectOption` and `click` wait for visibility.** A control inside a closed drawer times out. Set the value with `page.evaluate`, or open the drawer first.
4. **Emoji symbols may not render.** Headless fonts show ⏸ as a box. Use small inline SVG icons for buttons that must read on every device.
5. **Save screenshots outside the repo** (the scratchpad), and look at them before calling a visual change done.
