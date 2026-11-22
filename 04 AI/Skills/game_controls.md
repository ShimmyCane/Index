# Game controls

One control scheme for a kids' game played on an iPad (and a laptop with keys). Use it for any game that flies, drives, moves or aims. The rules are Jimmy's (2026-11-18); the game must keep them.

## Default: Felix control (drag relative to the centre)

- Hold a finger (or the mouse) anywhere on the play area. The distance from the centre of the screen sets the control: above the middle = nose up, below = nose down, left of the middle = turn left, right = turn right. The further from the middle, the stronger.
- Letting go returns to neutral (no input).
- Keys still work: arrows or WASD (nose and turn), so the same game plays on a laptop.

## Setting: joystick

- A setting in ⚙️ turns Felix control off and shows a joystick in the **lower left**.
- Size: a percentage of the screen width (about 22%, never below 120 px). Drag the knob; the knob's offset is the control.
- The joystick is the same control in the same directions, so the two are interchangeable.

## Actions

- Fire, boost, and any other actions are **buttons in the lower right**, stacked just above the settings button. Each button is at least 68 px high.
- Hold to keep the action going (fire, boost). Lift to stop.

## Settings button (⚙️)

- When there are action buttons, the ⚙️ **moves to the upper right corner** and **fades out after two seconds** of no touch.
- Tapping the upper right corner brings it back (it fades in), and the two-second timer starts again.
- With no action buttons on the screen, ⚙️ stays in the lower right as the usual rule (`settings-gear`).

## Checks before calling a game done

- Felix control: each direction moves the plane the right way; neutral holds still.
- Joystick: appears only with the setting on, lower left, scales with the width.
- Action buttons: lower right, above ⚙️, no overlap at 390×844, 768×1024 and 1180×820.
- ⚙️ fades after two seconds and returns on a tap in the upper right.
- Keyboard works the same.
- Headless browser run (`smoke-test`), zero errors, no horizontal scroll.

## Used by

- `03 Projects/Paper Airplanes x A-10 Warthog/` (chase mode).
