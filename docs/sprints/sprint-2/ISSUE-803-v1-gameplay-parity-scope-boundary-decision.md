# ISSUE-803 Decision: Scope Boundary for v1 Gameplay Parity

## Decision
Define v1 as a playable vertical slice inspired by Centipede rules, not a full parity recreation.

## Context
The case-study objective prioritizes demonstrating Spec-Driven Development workflow quality over full arcade-complete feature parity.
A strict full-parity scope in early delivery would increase risk to traceable, iterative execution.

## Scope Boundary (v1)
### In Scope for v1
- Browser launch and stable game loop.
- Player movement constrained to playable region.
- Projectile firing with rate limiting.
- Pause and resume flow.
- Basic in-game HUD signals tied to current mechanics.
- SDD artifact completeness for implemented behavior.

### Out of Scope for v1
- Full classic enemy roster behavior parity.
- Full collision matrix and scoring parity.
- Multi-level progression tuning and arcade-accurate pacing.
- Audio fidelity and asset-level authenticity goals.

## Options Considered
1. Full gameplay parity in early milestones.
2. Vertical-slice parity with explicit expansion roadmap (selected).
3. Prototype-only code with minimal SDD artifact rigor.

## Decision Outcome
Option 2 selected: deliver a strong vertical slice with explicit boundary controls and defer full parity to later milestones.

## Consequences
### Positive
- Preserves delivery momentum and lowers risk of over-scope.
- Keeps acceptance criteria measurable and reviewable.
- Strengthens reproducibility for Frontier Data Club presentation.

### Negative
- Some stakeholders may expect more complete gameplay behavior immediately.
- Additional stories are required before claiming full gameplay completeness.

## Expansion Triggers for Revisit
Revisit this boundary when at least one of the following is true:
- Deterministic unit-test scaffold is active for mechanics.
- Collision and scoring core stories are implemented and stable.
- Sprint capacity supports broader behavior without weakening evidence quality.

## Follow-Up Actions
- [x] Publish v1 scope boundary decision in sprint artifacts.
- [x] Align sprint communication to vertical-slice definition.
- [ ] Re-assess parity expansion at start of M3 planning.

## Acceptance Criteria Status
- [x] Scope boundary for v1 explicitly documented.
- [x] Rationale and alternatives recorded.
- [x] Deferred scope and revisit conditions captured.
