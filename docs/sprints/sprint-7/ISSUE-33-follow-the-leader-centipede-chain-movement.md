# ISSUE-33 Follow-the-Leader Centipede Chain Movement

## Goal
Improve centipede movement so segments follow the head path as a contiguous chain, reducing dislocated visuals during turns and descents.

## Implemented Scope
- Refactored body follow behavior to use axis-constrained follower updates with per-segment axis state.
- Enforced completion-before-switch behavior so a segment completes Y alignment with its followed neighbor before switching back to X movement.
- Added spacing stabilization with both minimum and maximum guardrails to prevent collapse and excessive separation.
- Added hard maximum separation constraint between each leader/follower pair to prevent wide gaps.
- Preserved head turn/descend logic for edge and mushroom obstacle interactions.

## Acceptance Criteria Status
- [x] AC-01: Segments follow the previous segment path with consistent spacing.
- [x] AC-02: Head still turns/descends at edges and mushroom obstacles.
- [x] AC-03: Chain remains contiguous during horizontal movement and vertical descent events.
- [x] AC-04: Deterministic unit tests cover straight-path following and turn/descend transitions.

## Evidence
- `src/centipede-system.js`
- `tests/centipede-system.test.js`
- `npm run test` (27 passing)
- `npm run test:coverage`

## Notes
- Gameplay visual review was used during tuning to confirm body alignment and gap behavior.
- Final behavior balances axis-constrained movement with gap constraints to avoid both collapse and drift.
