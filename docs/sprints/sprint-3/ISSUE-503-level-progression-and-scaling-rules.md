# ISSUE-503 Level Progression and Difficulty Scaling Rules

## Goal
Define explicit level transition and scaling behavior for the Sprint 3 gameplay loop.

## Level Transition Rule
- Level starts at 1.
- The level increases every 1000 points.
- Formula: `level = 1 + floor(score / 1000)`.

## Scaling Parameters
### Enemy Speed
- Base enemy speed range at Level 1: 120 to 180.
- Speed multiplier by level: `1 + (level - 1) * 0.18`.
- Effective speed range:
  - `min = 120 * multiplier`
  - `max = 180 * multiplier`

### Fire Cooldown
- Level 1 fire cooldown: 0.17 seconds.
- Cooldown reduction per level: 0.01 seconds.
- Minimum cooldown cap: 0.09 seconds.
- Formula: `max(0.09, 0.17 - (level - 1) * 0.01)`.

### Enemy Respawn Delay After Defeat
- Level 1 respawn delay after projectile defeat: 0.28 seconds.
- Delay reduction per level: 0.015 seconds.
- Minimum delay cap: 0.12 seconds.
- Formula: `max(0.12, 0.28 - (level - 1) * 0.015)`.

## Acceptance Mapping
- AC: Level transition rule is defined and implemented.
  - Implemented in game runtime with score-threshold progression.
- AC: Difficulty parameters scale by level.
  - Enemy speed, fire cooldown, and respawn delay scale each level.
- AC: Scaling parameters are documented.
  - Captured in this Sprint 3 artifact.
