# ISSUE-802 Decision: Test Tooling and Quality Gates

## Decision
Adopt a two-phase quality strategy:
1. Immediate phase: scripted manual evidence and acceptance checklists per issue.
2. Next phase: add lightweight automated unit tests for deterministic mechanics.

## Context
The repository currently validates gameplay through implementation evidence and manual checks.
Sprint 2 prioritizes SDD reporting and governance while minimizing delivery risk in a one-day, light-capacity sprint.

## Options Considered
1. Manual evidence now, automation next sprint (selected).
2. Full test harness immediately before continuing gameplay features.
3. Continue without explicit quality gates.

## Decision Outcome
Option 1 is selected to keep momentum while formalizing a path to automation.

## Quality Gates (Interim)
- Every issue includes measurable acceptance criteria.
- Every completed issue includes evidence links in repo artifacts.
- README progress section reflects closed-loop outcome.

## Quality Gates (Next)
- Unit tests for movement constraints.
- Unit tests for projectile lifecycle and fire-rate limiter.
- Unit tests for collision outcomes and score/life transitions.

## Consequences
### Positive
- Preserves delivery flow while raising quality discipline.
- Avoids blocking on tooling setup during documentation sprint.

### Negative
- Defect detection remains partially manual until tests are added.
- Requires follow-through in the next sprint to avoid quality debt.

## Follow-Up Actions
- [x] Define explicit interim quality gates.
- [ ] Add initial automated unit test scaffold in next sprint.

## Acceptance Criteria Status
- [x] Test-tooling decision documented with alternatives.
- [x] Interim quality gate model defined.
- [x] Follow-up actions captured.
