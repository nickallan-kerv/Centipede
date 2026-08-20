# ISSUE-401 Centipede Segmented Movement Behavior

## Goal
Implement segmented centipede gameplay behavior for the next gameplay expansion slice.

## Implemented Scope
- Added a dedicated centipede system module for segmented spawn, movement, and hit resolution.
- Centipede spawns as multiple connected segments with configurable segment count.
- Segments move horizontally and descend while reversing direction at field edges.
- Projectile hits consume and remove segments once per frame to avoid duplicate hit processing.
- Player collision with any segment applies life loss and respawn delay using existing game state rules.

## Acceptance Criteria Status
- [x] Centipede spawns with multiple segments.
- [x] Segments move horizontally and descend on obstacle/edge.
- [x] Segment hit behavior aligns with game rules.

## Evidence
- `src/centipede-system.js`
- `src/game.js`
- `tests/centipede-system.test.js`
- Existing regression suite in `tests/game-rules.test.js`, `tests/player.test.js`, and `tests/projectiles.test.js`
