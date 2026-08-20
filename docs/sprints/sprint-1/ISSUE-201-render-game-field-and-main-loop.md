# ISSUE-201 Render Game Field and Main Loop

## Goal
Render a playable game field in the browser and run a stable continuous update/render loop.

## Implemented Behavior
- Canvas-based game field initializes on page load.
- Main loop runs with requestAnimationFrame.
- Delta time is clamped for stable runtime behavior on frame spikes.
- Pause/resume behavior is available in runtime.

## Acceptance Criteria Status
- [x] Game field renders in browser without errors.
- [x] Main update/render loop runs continuously.
- [x] Delta-time handling exists for stable movement.
- [x] Pause/resume toggles loop state.

## Evidence
- Runtime implementation: src/main.js, src/game.js.
- Sprint board snapshot: docs/Sprint1Board.png.
