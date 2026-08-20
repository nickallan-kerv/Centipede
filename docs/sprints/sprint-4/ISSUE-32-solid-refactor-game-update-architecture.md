# ISSUE-32 SOLID Refactor: Game Update Architecture

## Goal
Improve SOLID alignment by extracting deterministic gameplay rules from the monolithic game loop class.

## Implemented Scope
- Extracted pure gameplay rules into `src/game-rules.js`.
- Extracted enemy creation logic into `src/enemy-system.js`.
- Updated `src/game.js` to orchestrate extracted modules while keeping rendering concerns local.
- Preserved runtime behavior for collision outcomes, score/lives flow, restart, and progression.

## SOLID Alignment Notes
- **Single Responsibility**: pure rules and enemy generation are separated from rendering/orchestration.
- **Dependency Direction**: `Game` depends on focused rule modules rather than inlined state math.
- **Testability**: extracted pure functions are directly unit-tested.

## Acceptance Criteria Status
- [x] New pure rules module extracted from `src/game.js`.
- [x] Existing gameplay behavior retained.
- [x] New module(s) covered by unit tests.
- [x] Sprint documentation linked from README outcomes.

## Evidence
- `src/game-rules.js`
- `src/enemy-system.js`
- `src/game.js` integration changes
- `tests/game-rules.test.js`
