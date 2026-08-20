# ISSUE-502 Game-Over and Restart Flow

## Goal
Trigger game-over at zero lives and allow restart without browser refresh.

## Implemented Behavior
- Game state enters game-over when lives reach zero.
- Game-over overlay displays final score and restart guidance.
- Pressing `R` while in game-over performs an in-memory reset and resumes play.
- Restart path resets player, projectiles, enemy state, timers, score, lives, and level.

## Restart Constraints
- No page reload is required.
- Restart exits paused state and resumes the existing animation loop.
- Initial gameplay defaults are restored before play resumes.

## Acceptance Criteria Status
- [x] Game-over state triggers at zero lives.
- [x] Restart command reinitializes game state.
- [x] Restart requires no browser refresh.

## Evidence
- Runtime behavior implemented in src/game.js.
- Controls updated in index.html.
- Sprint 3 board snapshot captured in docs/Sprint3Board.png.
