param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Assert-GhReady {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is not installed or not in PATH. Install from https://cli.github.com/"
    }

    if ($DryRun) {
        Write-Host "Dry run mode enabled. No GitHub changes will be made." -ForegroundColor Yellow
        return
    }

    try {
        gh auth status | Out-Null
    }
    catch {
        throw "GitHub CLI is not authenticated. Run: gh auth login"
    }
}

function Get-RepoArgs {
    return @('--repo', $Repo)
}

function Ensure-Label {
    param(
        [string]$Name,
        [string]$Color,
        [string]$Description
    )

    if ($DryRun) {
        Write-Host "[DRY RUN] Label: $Name"
        return
    }

    $repoArgs = Get-RepoArgs
    gh @repoArgs label create $Name --color $Color --description $Description --force | Out-Null
}

function Get-MilestoneMap {
    $milestones = gh api "repos/$Repo/milestones?state=all&per_page=100" | ConvertFrom-Json
    $map = @{}
    foreach ($m in $milestones) {
        $map[$m.title] = $m.number
    }
    return $map
}

function Ensure-Milestone {
    param(
        [string]$Title,
        [string]$Description,
        [hashtable]$MilestoneMap
    )

    if ($MilestoneMap.ContainsKey($Title)) {
        return $MilestoneMap[$Title]
    }

    if ($DryRun) {
        Write-Host "[DRY RUN] Milestone: $Title"
        return -1
    }

    $created = gh api "repos/$Repo/milestones" --method POST -f "title=$Title" -f "description=$Description"
    $obj = $created | ConvertFrom-Json
    $MilestoneMap[$Title] = $obj.number
    return $obj.number
}

function Get-ExistingIssueMap {
    $issues = gh api "repos/$Repo/issues?state=all&per_page=100" | ConvertFrom-Json
    $map = @{}
    foreach ($i in $issues) {
        # Skip pull requests from issues API response.
        if ($null -ne $i.pull_request) {
            continue
        }
        $map[$i.title] = $i.number
    }
    return $map
}

function New-Issue {
    param(
        [hashtable]$Issue,
        [hashtable]$IssueNumberByKey,
        [hashtable]$ExistingIssueMap,
        [hashtable]$MilestoneMap
    )

    $title = $Issue.Title
    if ($ExistingIssueMap.ContainsKey($title)) {
        $num = $ExistingIssueMap[$title]
        $IssueNumberByKey[$Issue.Key] = $num
        Write-Host "Skip existing: #$num $title" -ForegroundColor DarkYellow
        return
    }

    $bodyLines = @()
    $bodyLines += "Backlog Key: $($Issue.Key)"

    if ($Issue.ContainsKey('ParentKey') -and $Issue.ParentKey) {
        if ($IssueNumberByKey.ContainsKey($Issue.ParentKey)) {
            $bodyLines += "Parent Issue: #$($IssueNumberByKey[$Issue.ParentKey])"
        }
        else {
            $bodyLines += "Parent Issue Key: $($Issue.ParentKey)"
        }
    }

    $bodyLines += ""
    $bodyLines += $Issue.Body

    $tmpFile = Join-Path $env:TEMP ("gh-issue-body-" + [System.Guid]::NewGuid().ToString() + ".md")
    $bodyLines -join "`n" | Set-Content -Path $tmpFile -Encoding UTF8

    try {
        if ($DryRun) {
            Write-Host "[DRY RUN] Create issue: $title"
            if ($Issue.ContainsKey('ParentKey') -and $Issue.ParentKey) {
                Write-Host "          ParentKey: $($Issue.ParentKey)"
            }
            return
        }

        $repoArgs = Get-RepoArgs
        $cmd = @(
            $repoArgs[0], $repoArgs[1],
            'issue', 'create',
            '--title', $title,
            '--body-file', $tmpFile
        )

        if ($Issue.Milestone) {
            $cmd += @('--milestone', $Issue.Milestone)
        }

        if ($Issue.Labels.Count -gt 0) {
            foreach ($l in $Issue.Labels) {
                $cmd += @('--label', $l)
            }
        }

        $out = & gh @cmd
        # gh returns URL; parse issue number from trailing segment.
        $url = $out.Trim()
        $numText = $url.Split('/')[-1]
        $num = [int]$numText

        $IssueNumberByKey[$Issue.Key] = $num
        $ExistingIssueMap[$title] = $num
        Write-Host "Created: #$num $title" -ForegroundColor Green
    }
    finally {
        Remove-Item -Path $tmpFile -ErrorAction SilentlyContinue
    }
}

Assert-GhReady

Write-Step "Ensuring labels"
$labels = @(
    @{ Name = 'type:initiative'; Color = '5319E7'; Description = 'Initiative-level specification' },
    @{ Name = 'type:epic'; Color = '1D76DB'; Description = 'Epic-level specification' },
    @{ Name = 'type:story'; Color = '0E8A16'; Description = 'Story/specification issue' },
    @{ Name = 'type:task'; Color = 'FBCA04'; Description = 'Implementation task' },
    @{ Name = 'type:bug'; Color = 'D73A4A'; Description = 'Defect report' },
    @{ Name = 'type:decision'; Color = '0052CC'; Description = 'Architecture/product decision record' },
    @{ Name = 'type:learning'; Color = 'BFD4F2'; Description = 'Learning log for SDD case study' },
    @{ Name = 'priority:p0'; Color = 'B60205'; Description = 'Highest priority' },
    @{ Name = 'priority:p1'; Color = 'D93F0B'; Description = 'High priority' },
    @{ Name = 'priority:p2'; Color = 'FBCA04'; Description = 'Medium priority' },
    @{ Name = 'status:ready'; Color = '0E8A16'; Description = 'Ready to start' },
    @{ Name = 'status:in-progress'; Color = '1D76DB'; Description = 'Work in progress' },
    @{ Name = 'status:blocked'; Color = 'D93F0B'; Description = 'Blocked by dependency' },
    @{ Name = 'status:review'; Color = '5319E7'; Description = 'In review' },
    @{ Name = 'status:done'; Color = '0052CC'; Description = 'Completed' },
    @{ Name = 'qa:needed'; Color = 'F9D0C4'; Description = 'QA validation needed' },
    @{ Name = 'qa:passed'; Color = 'C2E0C6'; Description = 'QA validation passed' },
    @{ Name = 'area:engine'; Color = 'C5DEF5'; Description = 'Game engine and loop' },
    @{ Name = 'area:player'; Color = 'C5DEF5'; Description = 'Player movement and firing' },
    @{ Name = 'area:enemies'; Color = 'C5DEF5'; Description = 'Enemy behavior and interactions' },
    @{ Name = 'area:ui'; Color = 'C5DEF5'; Description = 'HUD and user interface' },
    @{ Name = 'area:testing'; Color = 'C5DEF5'; Description = 'Test strategy and automation' },
    @{ Name = 'area:docs'; Color = 'C5DEF5'; Description = 'Documentation and reporting' }
)

foreach ($label in $labels) {
    Ensure-Label -Name $label.Name -Color $label.Color -Description $label.Description
}

Write-Step "Ensuring milestones"
$milestones = @(
    @{ Title = 'M1 - SDD Setup & Specs Baseline'; Description = 'Create SDD standards, templates, decisions, and initial specs.' },
    @{ Title = 'M2 - Core Gameplay Vertical Slice'; Description = 'Deliver a playable vertical slice with core loop.' },
    @{ Title = 'M3 - Complete Gameplay Loop'; Description = 'Complete key gameplay systems and progression.' },
    @{ Title = 'M4 - Quality, Reporting, and Presentation'; Description = 'Finalize quality checks, findings synthesis, and presentation artifacts.' }
)

$milestoneMap = @{}
if (-not $DryRun) {
    $milestoneMap = Get-MilestoneMap
}

foreach ($m in $milestones) {
    [void](Ensure-Milestone -Title $m.Title -Description $m.Description -MilestoneMap $milestoneMap)
}

Write-Step "Creating initial backlog issues"
$issues = @(
    @{
        Key = 'ISSUE-001'
        Title = 'Initiative: SDD Case Study for Browser Centipede'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:initiative', 'priority:p0', 'area:docs')
        Body = @'
## Specification
- Goal: Deliver a playable browser Centipede game while evaluating GitHub Issues as living specs.
- Success metric: Complete M1-M4 milestones and publish Frontier Data Club findings.

## Acceptance Criteria
- [ ] Initiative has linked Epics for product, engineering, QA, and reporting.
- [ ] Governance model (DoR/DoD/workflow) is documented.
- [ ] Learning log cadence is established.
'@
    },
    @{
        Key = 'ISSUE-010'
        Title = 'Epic: SDD Setup and Governance'
        ParentKey = 'ISSUE-001'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:epic', 'priority:p0', 'area:docs')
        Body = "Epic scope: establish SDD standards, templates, and governance for the project."
    },
    @{
        Key = 'ISSUE-020'
        Title = 'Epic: Core Game Engine and Rendering'
        ParentKey = 'ISSUE-001'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:epic', 'priority:p0', 'area:engine')
        Body = "Epic scope: game loop, rendering pipeline, and deterministic state progression."
    },
    @{
        Key = 'ISSUE-030'
        Title = 'Epic: Player, Shooting, and Collision'
        ParentKey = 'ISSUE-001'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:epic', 'priority:p0', 'area:player')
        Body = "Epic scope: controls, firing behavior, and collision outcomes."
    },
    @{
        Key = 'ISSUE-040'
        Title = 'Epic: Centipede and Enemy Behaviors'
        ParentKey = 'ISSUE-001'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:epic', 'priority:p1', 'area:enemies')
        Body = "Epic scope: segmented centipede movement, obstacles, and secondary enemies."
    },
    @{
        Key = 'ISSUE-050'
        Title = 'Epic: Scoring, Lives, Progression, and UI States'
        ParentKey = 'ISSUE-001'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:epic', 'priority:p1', 'area:ui')
        Body = "Epic scope: scoring, lives, game over, restart, and level progression."
    },
    @{
        Key = 'ISSUE-060'
        Title = 'Epic: Quality Engineering and Test Automation'
        ParentKey = 'ISSUE-001'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:epic', 'priority:p1', 'area:testing')
        Body = "Epic scope: specification traceability through unit, integration, and smoke tests."
    },
    @{
        Key = 'ISSUE-070'
        Title = 'Epic: Findings Synthesis and Frontier Data Club Report'
        ParentKey = 'ISSUE-001'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:epic', 'priority:p1', 'area:docs')
        Body = "Epic scope: metrics, insights, and final findings package for Frontier Data Club."
    },
    @{
        Key = 'ISSUE-101'
        Title = 'Story: Establish repository standards for SDD'
        ParentKey = 'ISSUE-010'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:story', 'priority:p0', 'area:docs', 'qa:needed')
        Body = @'
## User Story
As a project maintainer, I want clear SDD standards in the repo so that all work follows consistent specification quality.

## Acceptance Criteria
- [ ] DoR and DoD are documented and approved.
- [ ] Label taxonomy and milestone plan are documented.
- [ ] Issue templates are available and usable.
- [ ] Workflow from spec to merge is documented.

## Test Plan
- Manual review checklist against README sections.
'@
    },
    @{
        Key = 'ISSUE-102'
        Title = 'Story: Create initial decision record for tech stack'
        ParentKey = 'ISSUE-010'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:story', 'priority:p1', 'area:docs', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Decision Issue created with options considered.
- [ ] Rendering approach selected (Canvas API or equivalent).
- [ ] Test framework selected.
- [ ] Consequences and follow-up actions documented.
'@
    },
    @{
        Key = 'ISSUE-201'
        Title = 'Story: Render game field and run main loop'
        ParentKey = 'ISSUE-020'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:story', 'priority:p0', 'area:engine', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Game field renders in browser without errors.
- [ ] Main update/render loop runs continuously.
- [ ] Delta-time handling exists for stable movement.
- [ ] Pause/resume toggles loop state.

## Test Plan
- Unit test for loop state transitions.
- Manual FPS sanity check.
'@
    },
    @{
        Key = 'ISSUE-202'
        Title = 'Story: Implement deterministic game state container'
        ParentKey = 'ISSUE-020'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:story', 'priority:p1', 'area:engine', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] State model defined for player, enemies, projectiles, score, lives.
- [ ] Reset operation restores initial state.
- [ ] State transition boundaries are documented.
'@
    },
    @{
        Key = 'ISSUE-301'
        Title = 'Story: Implement player movement constraints'
        ParentKey = 'ISSUE-030'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:story', 'priority:p0', 'area:player', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Keyboard input supports movement.
- [ ] Player cannot leave allowed movement zone.
- [ ] Movement speed is configurable.

## Test Plan
- Unit tests for boundary rules.
- Manual validation for control responsiveness.
'@
    },
    @{
        Key = 'ISSUE-302'
        Title = 'Story: Implement firing mechanics and projectile lifecycle'
        ParentKey = 'ISSUE-030'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:story', 'priority:p0', 'area:player', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Fire input spawns projectile.
- [ ] Fire rate limiter prevents spam.
- [ ] Projectile de-spawns out of bounds or on collision.
'@
    },
    @{
        Key = 'ISSUE-303'
        Title = 'Story: Implement collision system for projectiles and entities'
        ParentKey = 'ISSUE-030'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:story', 'priority:p0', 'area:player', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Collision detection exists for projectile-enemy and player-enemy.
- [ ] Collision outcomes update score/lives/state correctly.
- [ ] No duplicate collision processing in same frame.
'@
    },
    @{
        Key = 'ISSUE-401'
        Title = 'Story: Implement centipede segmented movement behavior'
        ParentKey = 'ISSUE-040'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p0', 'area:enemies', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Centipede spawns with multiple segments.
- [ ] Segments move horizontally and descend on obstacle/edge.
- [ ] Segment hit behavior aligns with game rules.
'@
    },
    @{
        Key = 'ISSUE-402'
        Title = 'Story: Implement mushroom obstacles and interactions'
        ParentKey = 'ISSUE-040'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p1', 'area:enemies', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Mushrooms spawn and persist on field.
- [ ] Projectile hit updates mushroom state.
- [ ] Centipede pathing reacts to mushrooms.
'@
    },
    @{
        Key = 'ISSUE-403'
        Title = 'Story: Add one secondary enemy behavior (spider or flea)'
        ParentKey = 'ISSUE-040'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p2', 'area:enemies', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Enemy spawn rule is defined.
- [ ] Enemy movement/interaction logic implemented.
- [ ] Balance settings are configurable.
'@
    },
    @{
        Key = 'ISSUE-501'
        Title = 'Story: Implement score, lives, and HUD display'
        ParentKey = 'ISSUE-050'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p0', 'area:ui', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Score updates in real time.
- [ ] Lives decrement on player hit.
- [ ] HUD always reflects authoritative state.
'@
    },
    @{
        Key = 'ISSUE-502'
        Title = 'Story: Implement game-over and restart flows'
        ParentKey = 'ISSUE-050'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p0', 'area:ui', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Game-over state triggers at zero lives.
- [ ] Restart command reinitializes game state.
- [ ] Restart requires no browser refresh.
'@
    },
    @{
        Key = 'ISSUE-503'
        Title = 'Story: Implement level progression and difficulty scaling'
        ParentKey = 'ISSUE-050'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:story', 'priority:p1', 'area:ui', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Level transition rule is defined and implemented.
- [ ] Difficulty parameters scale by level.
- [ ] Scaling parameters are documented.
'@
    },
    @{
        Key = 'ISSUE-601'
        Title = 'Story: Build unit test suite for core mechanics'
        ParentKey = 'ISSUE-060'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:story', 'priority:p1', 'area:testing', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Tests cover movement, collision, scoring, life-state transitions.
- [ ] Test runs are repeatable in CI/local.
- [ ] Coverage baseline is reported.
'@
    },
    @{
        Key = 'ISSUE-602'
        Title = 'Story: Add integration smoke tests for gameplay loop'
        ParentKey = 'ISSUE-060'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:story', 'priority:p2', 'area:testing', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Smoke tests validate start, play, hit, game over, restart.
- [ ] Failures provide actionable diagnostics.
'@
    },
    @{
        Key = 'ISSUE-701'
        Title = 'Story: Define metrics model for SDD effectiveness'
        ParentKey = 'ISSUE-070'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:story', 'priority:p1', 'area:docs', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Metrics list finalized (lead time, traceability, defect ratio, evidence completeness).
- [ ] Data collection method documented.
- [ ] Reporting cadence defined.
'@
    },
    @{
        Key = 'ISSUE-702'
        Title = 'Story: Produce Frontier Data Club findings report'
        ParentKey = 'ISSUE-070'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:story', 'priority:p1', 'area:docs', 'qa:needed')
        Body = @'
## Acceptance Criteria
- [ ] Findings report draft completed.
- [ ] Includes quantitative and qualitative analysis.
- [ ] Includes recommendations for SDD adoption.
'@
    },
    @{
        Key = 'ISSUE-801'
        Title = 'Decision: Rendering and game-loop architecture'
        ParentKey = 'ISSUE-010'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:decision', 'priority:p1', 'area:engine')
        Body = "Decision record: choose rendering strategy and loop architecture."
    },
    @{
        Key = 'ISSUE-802'
        Title = 'Decision: Test tooling and quality gates'
        ParentKey = 'ISSUE-010'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:decision', 'priority:p1', 'area:testing')
        Body = "Decision record: select testing stack and quality gate thresholds."
    },
    @{
        Key = 'ISSUE-803'
        Title = 'Decision: Scope boundary for v1 gameplay parity'
        ParentKey = 'ISSUE-010'
        Milestone = 'M2 - Core Gameplay Vertical Slice'
        Labels = @('type:decision', 'priority:p1', 'area:docs')
        Body = "Decision record: define and lock v1 parity scope and exclusions."
    },
    @{
        Key = 'ISSUE-901'
        Title = 'Learning Log: Week 1 SDD setup reflections'
        ParentKey = 'ISSUE-070'
        Milestone = 'M1 - SDD Setup & Specs Baseline'
        Labels = @('type:learning', 'priority:p1', 'area:docs')
        Body = "Capture initial SDD setup lessons, friction points, and adjustments."
    },
    @{
        Key = 'ISSUE-902'
        Title = 'Learning Log: Mid-project spec drift analysis'
        ParentKey = 'ISSUE-070'
        Milestone = 'M3 - Complete Gameplay Loop'
        Labels = @('type:learning', 'priority:p1', 'area:docs')
        Body = "Analyze divergence between issues-as-specs and implementation mid-project."
    },
    @{
        Key = 'ISSUE-903'
        Title = 'Learning Log: Final SDD effectiveness assessment'
        ParentKey = 'ISSUE-070'
        Milestone = 'M4 - Quality, Reporting, and Presentation'
        Labels = @('type:learning', 'priority:p1', 'area:docs')
        Body = "Summarize outcomes and recommendations for Frontier Data Club presentation."
    }
)

$existingIssueMap = @{}
if (-not $DryRun) {
    $existingIssueMap = Get-ExistingIssueMap
}

$issueNumberByKey = @{}
foreach ($issue in $issues) {
    New-Issue -Issue $issue -IssueNumberByKey $issueNumberByKey -ExistingIssueMap $existingIssueMap -MilestoneMap $milestoneMap
}

if ($DryRun) {
    Write-Step "Dry run complete"
    exit 0
}

Write-Step "Saving created issue map"
$mapPath = Join-Path (Get-Location) 'issue-map.json'
$issueNumberByKey.GetEnumerator() |
    Sort-Object Name |
    ForEach-Object { [PSCustomObject]@{ key = $_.Name; issueNumber = $_.Value } } |
    ConvertTo-Json -Depth 5 |
    Set-Content -Path $mapPath -Encoding UTF8

Write-Host "Backlog import complete. Issue map written to: $mapPath" -ForegroundColor Green
