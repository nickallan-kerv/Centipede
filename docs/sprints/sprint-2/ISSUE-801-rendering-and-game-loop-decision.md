# ISSUE-801 Decision: Rendering and Game-Loop Architecture

## Decision
Use a requestAnimationFrame-driven main loop with delta-time clamping and a clear update/draw separation.

## Context
The project target is smooth browser gameplay with deterministic enough behavior for SDD evidence.
Current implementation already follows this pattern and can be treated as the approved baseline.

## Evidence
- Main loop entry point and delta-time clamp: src/main.js
- Update/draw orchestration and pause behavior: src/game.js

## Options Considered
1. requestAnimationFrame with delta-time and update/draw separation (selected).
2. setInterval at fixed milliseconds.
3. Hybrid timer model with fixed-step simulation and variable render.

## Decision Outcome
Option 1 is selected for v1.

## Consequences
### Positive
- Aligned with browser rendering cadence.
- Better frame pacing than naive interval timers.
- Clear architectural boundary supports traceability and tests.

### Negative
- Full determinism is limited by runtime and frame jitter.
- Future fixed-step simulation may still be needed for advanced behaviors.

## Follow-Up Actions
- [x] Document architectural rationale for Frontier Data Club workflow narrative.
- [ ] Revisit fixed-step simulation if collision complexity increases.

## Acceptance Criteria Status
- [x] Decision Issue captured with alternatives and rationale.
- [x] Rendering/game-loop approach explicitly selected.
- [x] Consequences and follow-up actions documented.
