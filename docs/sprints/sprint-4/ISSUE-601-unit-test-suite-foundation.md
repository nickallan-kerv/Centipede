# ISSUE-601 Unit Test Suite Foundation

## Goal
Establish an automated unit test suite for deterministic core mechanics.

## Implemented Scope
- Added Vitest test framework and npm scripts.
- Added deterministic unit tests for:
  - movement constraints (`Player`)
  - projectile lifecycle and cooldown (`ProjectileSystem`)
  - score/life/level transition rules (`game-rules`)
- Added workspace task `test-centipede` for VS Code execution.

## Acceptance Criteria Status
- [x] Tests cover movement, collision/scoring/life-state transition rules in deterministic units.
- [x] Test runs are repeatable in local workflow.
- [x] Coverage baseline command is available (`npm run test:coverage`).

## Evidence
- `tests/player.test.js`
- `tests/projectiles.test.js`
- `tests/game-rules.test.js`
- `package.json` test scripts
- `.vscode/tasks.json` task entry
