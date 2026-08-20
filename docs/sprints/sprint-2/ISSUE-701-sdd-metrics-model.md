# ISSUE-701 Metrics Model for SDD Effectiveness

## Goal
Define a repeatable metrics model to evaluate whether issue-driven specs improve delivery transparency and quality.

## Finalized Metrics
1. Lead time per issue: ready to done elapsed time.
2. Traceability coverage: percentage of merged changes mapped to one or more issues.
3. Defect ratio: bug issues created per completed story issues.
4. Evidence completeness: percentage of done issues with required acceptance evidence attached.

## Data Collection Method
- Source systems: GitHub Issues, PR metadata, repository evidence artifacts.
- Collection method: weekly manual extraction using issue labels, timestamps, and linked references.
- Storage format: markdown summary in sprint report artifacts.

## Cadence
- Weekly snapshot during active delivery.
- Sprint-end summary for Frontier Data Club presentation.

## Minimum Data Fields
- Issue key/number
- Type, area, priority
- Status transition timestamps
- Linked PR(s) or commit reference(s)
- Evidence status (tests/screenshots/docs)

## Acceptance Criteria Status
- [x] Metrics list finalized.
- [x] Data collection method documented.
- [x] Reporting cadence defined.
