# ISSUE-303 Collision System Implementation

## Goal
Implement projectile-enemy and player-enemy collision handling with correct state outcomes and no duplicate processing in the same frame.

## Implemented Behavior
- Projectile-enemy collisions are resolved through projectile hit consumption, removing intersecting projectiles from active state.
- Enemy hits by projectiles increment authoritative score state.
- Player-enemy collision decrements lives, resets player position, and applies a short invulnerability window.
- Enemy lifecycle is gated with respawn delay controls to prevent repeated same-frame collision side effects.

## Technical Notes
- Collision overlap checks use axis-aligned rectangle intersection.
- Projectile hit handling consumes matching projectiles in one pass.
- Enemy object is cleared before respawn after a collision outcome, preventing duplicate processing.

## Acceptance Criteria Status
- [x] Collision detection exists for projectile-enemy and player-enemy.
- [x] Collision outcomes update score/lives/state correctly.
- [x] No duplicate collision processing in same frame.

## Evidence
- Runtime behavior implemented in src/game.js and src/projectiles.js.
- Sprint 3 board snapshot captured in docs/Sprint3Board.png.
