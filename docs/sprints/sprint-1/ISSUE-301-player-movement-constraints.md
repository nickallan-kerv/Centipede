# ISSUE-301 Player Movement Constraints

## Goal
Support responsive keyboard movement while enforcing the allowed movement zone.

## Implemented Behavior
- Keyboard movement supports Arrow keys and WASD.
- Player speed is configurable through player state.
- Player position is clamped to the configured playable bounds each frame.

## Acceptance Criteria Status
- [x] Keyboard input supports movement.
- [x] Player cannot leave allowed movement zone.
- [x] Movement speed is configurable.

## Evidence
- Runtime implementation: src/input.js, src/player.js, src/game.js.
- Sprint board snapshot: docs/Sprint1Board.png.
