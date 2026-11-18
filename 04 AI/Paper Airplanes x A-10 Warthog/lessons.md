# Paper Airplanes × A-10 Warthog — Lessons

## 2026-11-18

- **A fetch can fail as a DNS error or a proxy 403.** The subagent saw ENOTFOUND; a direct curl got a CONNECT 403. Check the proxy status (`$HTTPS_PROXY/__agentproxy/status`) before writing a reference off, and say in the convo which source was not read.
- **Global `tsc` may be a newer major.** Pin the TypeScript version in the project and use `npx tsc`; v6 deprecated `module: none` and `outFile`.
- **A physics model with no lift at zero angle sinks with no input.** A stability term that pulls the nose to the flight path needs a camber (base) lift, or the plane never climbs.
- **Test a stall with the nose set after `start()`.** `start()` aims velocity along the nose, so the angle of attack starts at zero.
- **The drawer's button margins double** inside a group with side margins. Use a calc width, not 100% plus margin.
- **Node tests can load the compiled script in `vm`** if the page boot is guarded by `typeof document`.

## 2026-11-18 (round 2)

- **A class name on `<body>` can hide the whole page.** `body.stick` picked up the base `.stick { display:none }` rule meant for the joystick pad. Use names that no component uses (`joy`).
- **Ground squares under the camera vanish if they are dropped when a corner is behind the near plane.** Clamp the depth for ground corners instead.
- **Synthetic pointer events from a test can have no active pointer.** Guard `setPointerCapture` in a try/catch.
- **Drive drawer buttons with direct clicks in tests** when a gear is mid-fade; a real tap is needed only for the wake.
