# Initial GitHub Backlog (Issues as Specifications)

This backlog is organized for direct creation as GitHub Issues.

How to use:
1. Create labels and milestones from the README guidance.
2. Create Initiative and Epic Issues first.
3. Create Story Issues and link them to parent Epic using `Parent/Child` or explicit links.
4. Keep acceptance criteria and test plans inside each Issue body.

---

## Initiative

### ISSUE-001 - Initiative: SDD Case Study for Browser Centipede
- Type: `type:initiative`
- Priority: `priority:p0`
- Milestone: `M1 - SDD Setup & Specs Baseline`

**Specification**
- Goal: Deliver a playable browser Centipede game while evaluating GitHub Issues as living specs.
- Success metric: Complete M1-M4 milestones and publish Frontier Data Club findings.

**Acceptance Criteria**
- [ ] Initiative has linked Epics for product, engineering, QA, and reporting.
- [ ] Governance model (DoR/DoD/workflow) is documented.
- [ ] Learning log cadence is established.

---

## Epics

### ISSUE-010 - Epic: SDD Setup and Governance
- Type: `type:epic`
- Area: `area:docs`
- Priority: `priority:p0`
- Milestone: `M1 - SDD Setup & Specs Baseline`

### ISSUE-020 - Epic: Core Game Engine and Rendering
- Type: `type:epic`
- Area: `area:engine`
- Priority: `priority:p0`
- Milestone: `M2 - Core Gameplay Vertical Slice`

### ISSUE-030 - Epic: Player, Shooting, and Collision
- Type: `type:epic`
- Area: `area:player`
- Priority: `priority:p0`
- Milestone: `M2 - Core Gameplay Vertical Slice`

### ISSUE-040 - Epic: Centipede and Enemy Behaviors
- Type: `type:epic`
- Area: `area:enemies`
- Priority: `priority:p1`
- Milestone: `M3 - Complete Gameplay Loop`

### ISSUE-050 - Epic: Scoring, Lives, Progression, and UI States
- Type: `type:epic`
- Area: `area:ui`
- Priority: `priority:p1`
- Milestone: `M3 - Complete Gameplay Loop`

### ISSUE-060 - Epic: Quality Engineering and Test Automation
- Type: `type:epic`
- Area: `area:testing`
- Priority: `priority:p1`
- Milestone: `M4 - Quality, Reporting, and Presentation`

### ISSUE-070 - Epic: Findings Synthesis and Frontier Data Club Report
- Type: `type:epic`
- Area: `area:docs`
- Priority: `priority:p1`
- Milestone: `M4 - Quality, Reporting, and Presentation`

---

## Story Specifications

### ISSUE-101 - Story: Establish repository standards for SDD
- Parent: ISSUE-010
- Type: `type:story`
- Priority: `priority:p0`

**User Story**
As a project maintainer, I want clear SDD standards in the repo so that all work follows consistent specification quality.

**Acceptance Criteria**
- [ ] DoR and DoD are documented and approved.
- [ ] Label taxonomy and milestone plan are documented.
- [ ] Issue templates are available and usable.
- [ ] Workflow from spec to merge is documented.

**Test Plan**
- Manual review checklist against README sections.

### ISSUE-102 - Story: Create initial decision record for tech stack
- Parent: ISSUE-010
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Decision Issue created with options considered.
- [ ] Rendering approach selected (Canvas API or equivalent).
- [ ] Test framework selected.
- [ ] Consequences and follow-up actions documented.

### ISSUE-201 - Story: Render game field and run main loop
- Parent: ISSUE-020
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Game field renders in browser without errors.
- [ ] Main update/render loop runs continuously.
- [ ] Delta-time handling exists for stable movement.
- [ ] Pause/resume toggles loop state.

**Test Plan**
- Unit test for loop state transitions.
- Manual FPS sanity check.

### ISSUE-202 - Story: Implement deterministic game state container
- Parent: ISSUE-020
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] State model defined for player, enemies, projectiles, score, lives.
- [ ] Reset operation restores initial state.
- [ ] State transition boundaries are documented.

### ISSUE-301 - Story: Implement player movement constraints
- Parent: ISSUE-030
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Keyboard input supports movement.
- [ ] Player cannot leave allowed movement zone.
- [ ] Movement speed is configurable.

**Test Plan**
- Unit tests for boundary rules.
- Manual validation for control responsiveness.

### ISSUE-302 - Story: Implement firing mechanics and projectile lifecycle
- Parent: ISSUE-030
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Fire input spawns projectile.
- [ ] Fire rate limiter prevents spam.
- [ ] Projectile de-spawns out of bounds or on collision.

### ISSUE-303 - Story: Implement collision system for projectiles and entities
- Parent: ISSUE-030
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Collision detection exists for projectile-enemy and player-enemy.
- [ ] Collision outcomes update score/lives/state correctly.
- [ ] No duplicate collision processing in same frame.

### ISSUE-401 - Story: Implement centipede segmented movement behavior
- Parent: ISSUE-040
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Centipede spawns with multiple segments.
- [ ] Segments move horizontally and descend on obstacle/edge.
- [ ] Segment hit behavior aligns with game rules.

### ISSUE-402 - Story: Implement mushroom obstacles and interactions
- Parent: ISSUE-040
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Mushrooms spawn and persist on field.
- [ ] Projectile hit updates mushroom state.
- [ ] Centipede pathing reacts to mushrooms.

### ISSUE-403 - Story: Add one secondary enemy behavior (spider or flea)
- Parent: ISSUE-040
- Type: `type:story`
- Priority: `priority:p2`

**Acceptance Criteria**
- [ ] Enemy spawn rule is defined.
- [ ] Enemy movement/interaction logic implemented.
- [ ] Balance settings are configurable.

### ISSUE-501 - Story: Implement score, lives, and HUD display
- Parent: ISSUE-050
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Score updates in real time.
- [ ] Lives decrement on player hit.
- [ ] HUD always reflects authoritative state.

### ISSUE-502 - Story: Implement game-over and restart flows
- Parent: ISSUE-050
- Type: `type:story`
- Priority: `priority:p0`

**Acceptance Criteria**
- [ ] Game-over state triggers at zero lives.
- [ ] Restart command reinitializes game state.
- [ ] Restart requires no browser refresh.

### ISSUE-503 - Story: Implement level progression and difficulty scaling
- Parent: ISSUE-050
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Level transition rule is defined and implemented.
- [ ] Difficulty parameters scale by level.
- [ ] Scaling parameters are documented.

### ISSUE-601 - Story: Build unit test suite for core mechanics
- Parent: ISSUE-060
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Tests cover movement, collision, scoring, life-state transitions.
- [ ] Test runs are repeatable in CI/local.
- [ ] Coverage baseline is reported.

### ISSUE-602 - Story: Add integration smoke tests for gameplay loop
- Parent: ISSUE-060
- Type: `type:story`
- Priority: `priority:p2`

**Acceptance Criteria**
- [ ] Smoke tests validate start, play, hit, game over, restart.
- [ ] Failures provide actionable diagnostics.

### ISSUE-701 - Story: Define metrics model for SDD effectiveness
- Parent: ISSUE-070
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Metrics list finalized (lead time, traceability, defect ratio, evidence completeness).
- [ ] Data collection method documented.
- [ ] Reporting cadence defined.

### ISSUE-702 - Story: Produce Frontier Data Club findings report
- Parent: ISSUE-070
- Type: `type:story`
- Priority: `priority:p1`

**Acceptance Criteria**
- [ ] Findings report draft completed.
- [ ] Includes quantitative and qualitative analysis.
- [ ] Includes recommendations for SDD adoption.

---

## Decision Record Issues

### ISSUE-801 - Decision: Rendering and game-loop architecture
- Type: `type:decision`
- Milestone: `M1 - SDD Setup & Specs Baseline`

### ISSUE-802 - Decision: Test tooling and quality gates
- Type: `type:decision`
- Milestone: `M1 - SDD Setup & Specs Baseline`

### ISSUE-803 - Decision: Scope boundary for v1 gameplay parity
- Type: `type:decision`
- Milestone: `M2 - Core Gameplay Vertical Slice`

---

## Learning Log Issues

### ISSUE-901 - Learning Log: Week 1 SDD setup reflections
- Type: `type:learning`
- Milestone: `M1 - SDD Setup & Specs Baseline`

### ISSUE-902 - Learning Log: Mid-project spec drift analysis
- Type: `type:learning`
- Milestone: `M3 - Complete Gameplay Loop`

### ISSUE-903 - Learning Log: Final SDD effectiveness assessment
- Type: `type:learning`
- Milestone: `M4 - Quality, Reporting, and Presentation`

---

## Suggested Creation Order
1. ISSUE-001
2. ISSUE-010, ISSUE-020, ISSUE-030, ISSUE-040, ISSUE-050, ISSUE-060, ISSUE-070
3. ISSUE-101 through ISSUE-503
4. ISSUE-601, ISSUE-602
5. ISSUE-801 through ISSUE-803
6. ISSUE-701, ISSUE-702
7. ISSUE-901 through ISSUE-903

## Suggested First Sprint
- ISSUE-101
- ISSUE-102
- ISSUE-201
- ISSUE-301
- ISSUE-302
- ISSUE-501

This first sprint creates a playable vertical slice while establishing strict SDD discipline.
