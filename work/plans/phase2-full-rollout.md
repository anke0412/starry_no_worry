# Phase 2 Full Rollout

## Header

- Task name: Phase 2 success-criteria rollout
- Date: 2026-05-06
- Status: active
- Phase: Phase 2

## 1. Task Brief

Advance the remaining Phase 2 roadmap through one ordered execution ledger so the main agent can keep moving without creating parallel task systems.

## 2. Product Intent

The product should move from a partially advanced astrology tool into a Phase 2-complete platform where advanced chart families, inspectable chart details, and stable interpretation inputs all work on the same calculation foundation.

## 3. Scope

### In Scope

- remaining Phase 2 work from `plan.md`
- one ordered queue inside this file
- one bounded step or slide at a time
- branch-based step lifecycle

### Out Of Scope

- Phase 3 work
- roadmap reprioritization
- broad platform features like accounts or payments

## 4. Acceptance Criteria

- one active plan covers the remaining Phase 2 path
- each bounded step is completed only after `impl`, `review`, and `verify`
- the main agent can move from one step to the next without waiting for a new start instruction
- each completed step is closed through the git lifecycle before the next step begins

## 5. Constraints

- preserve `plan.md` order
- use shared chart-generation infrastructure
- keep Chinese terminology and chart readability professional
- use the default verification matrix unless a real exemption is recorded

## 6. Execution Graph

### Main-Agent Work

- keep this file as the single Phase 2 execution ledger
- choose exactly one current step at a time
- dispatch bounded `impl`, `review`, and `verify`
- integrate results, update statuses, and advance the queue

### `impl` Subagent Work

- implement only the current step
- update the smallest necessary tests and contracts

### `review` Subagent Work

- independently audit correctness, regression risk, and plan compliance

### `verify` Subagent Work

- run targeted checks for the current step
- run the default matrix unless a documented exemption applies

## 7. Verification Plan

- backend: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests`
- frontend: `cd /Users/lianke/PycharmProjects/star && npm test`
- build: `cd /Users/lianke/PycharmProjects/star && npm run build`

## 8. Risks

- scope drift across too many Phase 2 capabilities at once
- chart-family contract drift
- stopping after local wins instead of finishing the rollout queue

## 9. Recovery Rules

- if a step is too broad, split it before implementation
- if verify fails, fix inside the current step or reopen the step boundary
- if git lifecycle fails, stop before starting the next step

## 10. Decision Capture

- stable product or architecture discoveries should be promoted into `docs/`
- temporary local execution decisions belong in `work/decisions/`

## 11. Ordered Step Queue

- [ ] Step 1: Reconcile the current Phase 2 gap list against `plan.md` and current implemented chart families
- [ ] Step 2: Choose the next highest-priority unfinished Phase 2 capability and create its bounded implementation slice
- [ ] Step 3: Complete that bounded slice through `impl -> review -> verify`
- [ ] Step 4: Close the git lifecycle for the completed slice
- [ ] Step 5: Repeat from Step 2 until all remaining Phase 2 capabilities are complete

## 12. Active Step Rule

The main agent must treat the first unfinished item in the ordered step queue as the current step unless a more specific active marker is written here later.
