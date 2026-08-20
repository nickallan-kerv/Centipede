# ISSUE-302 Firing and Projectile Lifecycle

## Goal
Implement firing input, projectile creation, fire-rate limiting, and projectile cleanup.

## Implemented Behavior
- Fire input (`Space`) spawns projectiles from the player muzzle.
- Fire cooldown/rate limiter prevents projectile spam.
- Projectiles advance each frame and are removed when out of bounds.

## Acceptance Criteria Status
- [x] Fire input spawns projectile.
- [x] Fire rate limiter prevents spam.
- [x] Projectile de-spawns out of bounds or on collision.

## Evidence
- Runtime implementation: src/projectiles.js, src/player.js, src/game.js.
- Sprint board snapshot: docs/Sprint1Board.png.
