# ISSUE-402 Mushroom Obstacles and Interactions

## Goal
Implement mushroom obstacles that persist on the field, can be damaged by projectile hits, and influence centipede pathing.

## Implemented Scope
- Added a dedicated mushroom domain module for creation, lifecycle updates, collision consumption, and rendering.
- Spawned deterministic mushroom layouts bounded to the combat region above the player zone.
- Added multi-hit mushroom durability and removal behavior through projectile collision consumption.
- Wired live mushroom obstacles into centipede movement updates so obstacle contact triggers turn/descend behavior.
- Integrated mushroom count visibility into HUD state for runtime validation.

## SOLID Alignment
- Single Responsibility: mushroom rules were isolated in `src/mushroom-system.js` and kept out of core `Game` policy logic.
- Open/Closed: centipede pathing reused the existing obstacle extension point on `updateCentipede`.
- Dependency Inversion: deterministic mushroom behavior is unit-tested without canvas/game-loop dependencies.

## Acceptance Criteria Status
- [x] Mushrooms spawn and persist on field.
- [x] Projectile hit updates mushroom state.
- [x] Centipede pathing reacts to mushrooms.

## Evidence
- `src/mushroom-system.js`
- `src/game.js`
- `tests/mushroom-system.test.js`
- `tests/centipede-system.test.js`
- `npm run test`
- `npm run test:coverage`
