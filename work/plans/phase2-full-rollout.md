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

## 11. 2026-05-06 Gap Snapshot

Historical note: this section is the original 2026-05-06 reconciliation snapshot. Later slices in Section 12 supersede specific gap details as capabilities land.

- confirmed source-complete Phase 2 settings surfaces:
  - optional points
  - multiple house systems
  - configurable aspect sets and orb profiles
  - element / modality / polarity / hemisphere statistics
- confirmed source-complete chart families:
  - natal
  - synastry
  - transit
  - solar-return
- partially implemented or currently broken Phase 2 surfaces:
  - retrograde status is modeled but not calculated or rendered
  - point visibility toggles and linked wheel/table highlighting are wired in `src/App.jsx` but the helper modules are missing from `src/lib/`
  - the interpretation layer is still a deterministic frontend stub rather than a full AI interpretation agent
- chart families currently declared in catalog, contracts, or tests but not source-complete in backend services:
  - composite
  - davison
  - relationship-transit
  - progression
  - lunar-return
- chart-family work still not started in the current source tree:
  - midpoint composite workflows
  - solar arc directions
  - tertiary progression variants
- review is complete for Step 1
- verification snapshot is recorded in `work/runs/2026-05-06-step1-verification.md`

## 12. Slice History

### 2026-05-07 Slice A

- selected capability: restore the existing Phase 2 linked-reading and visibility surfaces so the frontend can build again
- branch: `codex/phase2-full-rollout-step-2-reading-helpers`
- bounded scope:
  - create `src/lib/chartSelection.js`
  - create `src/lib/chartVisibility.js`
  - keep the change limited to the already-declared frontend interaction flow in `src/App.jsx` and `src/components/chart/ChartWheel.jsx`
- outcome:
  - frontend build was restored
  - overlay hover matching was tightened so overlay rows no longer fan out to unrelated same-named bodies across multiple groups
- verification snapshot:
  - frontend `npm test`: pass
  - frontend `npm run build`: pass
  - backend `../.venv312/bin/python -m pytest tests`: remained blocked by the then-missing `app.services.lunar_return` import during collection
  - detailed record: `work/runs/2026-05-07-step2-verification.md`

### 2026-05-07 Slice B

- selected capability: restore the missing `lunar-return` backend service so the declared endpoint can run
- branch: `codex/phase2-full-rollout-step-2-lunar-return-service`
- bounded scope:
  - create `backend/app/services/lunar_return.py`
  - add focused backend coverage for the lunar-return service and endpoint path
  - restore importable backend service modules for `progression` and `relationship-transit` so the app can validate the `lunar-return` path without unrelated import-chain failures
- out of scope for this slice:
  - `composite`
  - `davison`
  - retrograde calculation
  - LLM-backed interpretation
- outcome so far:
  - `lunar-return` focused backend tests pass
  - backend full-suite blocker has moved forward from `lunar_return` / `progression` / `relationship_transit` to the still-missing `composite` / `davison` services
- verification snapshot:
  - focused backend `tests/test_solar_return_chart.py`: pass
  - full backend `../.venv312/bin/python -m pytest tests -q`: only `composite` and `davison` remain failing
  - detailed record: `work/runs/2026-05-07-step2b-verification.md`

### 2026-05-07 Slice C

- selected capability: restore the remaining missing fusion backend services so the backend matrix can pass again
- branch: `codex/phase2-full-rollout-step-2-fusion-services`
- bounded scope:
  - create `backend/app/services/composite.py`
  - create `backend/app/services/davison.py`
  - satisfy existing backend contract tests and frontend fused-chart result mapping
- out of scope for this slice:
  - deeper mathematical differentiation between composite midpoint-planet logic and Davison midpoint-event logic
  - retrograde calculation
  - LLM-backed interpretation
- outcome:
  - backend full test matrix is green again
  - the declared fusion chart endpoints are now backed by importable services
- verification snapshot:
  - backend `../.venv312/bin/python -m pytest tests -q`: pass
  - frontend `npm test`: pass
  - frontend `npm run build`: pass
  - detailed record: `work/runs/2026-05-07-step2c-verification.md`

### 2026-05-07 Slice D

- selected capability: restore retrograde status as a real calculation and readable result-surface field
- branch: `codex/phase2-full-rollout-step-2-retrograde-status`
- bounded scope:
  - populate `Placement.retrograde` from the backend ephemeris service
  - preserve retrograde flags through overlay mapping and frontend API adapters
  - render motion state in the result tables without changing interpretation-agent scope
- out of scope for this slice:
  - LLM-backed interpretation
  - deeper chart-family math changes
  - new chart categories
- outcome:
  - backend now returns real retrograde booleans for calculated placements
  - frontend placement and overlay tables now expose `顺行` / `逆行`
  - default verification matrix is green again after the retrograde rollout
- verification snapshot:
  - backend `../.venv312/bin/python -m pytest tests`: pass
  - frontend `npm test`: pass
  - frontend `npm run build`: pass
  - detailed record: `work/runs/2026-05-07-step2d-verification.md`

### 2026-05-08 Slice E

- selected capability: add a distinct midpoint composite workflow so Phase 2 relationship chart coverage expands beyond the existing composite / davison pair
- branch: `codex/phase2-full-rollout-step-2-midpoint-composite`
- bounded scope:
  - add backend request, route, and service for `/api/charts/midpoint-composite`
  - add frontend category, payload builder, endpoint mapping, and fused-chart result mapping
  - distinguish midpoint-composite planetary longitudes from the Davison midpoint-event chart
- out of scope for this slice:
  - solar arc directions
  - tertiary progression variants
  - LLM-backed interpretation
- outcome:
  - a new couple-mode `中点组合盘` category is now source-complete across backend, frontend, and tests
  - midpoint-composite fused placements are no longer aliases of the Davison event chart
  - default verification matrix remains green after adding the new chart family
- verification snapshot:
  - backend `../.venv312/bin/python -m pytest tests`: pass
  - frontend `npm test`: pass
  - frontend `npm run build`: pass
  - detailed record: `work/runs/2026-05-08-step2e-verification.md`

## 13. Ordered Step Queue

- [x] Step 1: Reconcile the current Phase 2 gap list against `plan.md` and current implemented chart families
- [x] Step 2: Choose the next highest-priority unfinished Phase 2 capability and create its bounded implementation slice
- [x] Step 3: Complete that bounded slice through `impl -> review -> verify`
- [x] Step 4: Close the git lifecycle for the completed slice
- [ ] Step 5: Repeat from Step 2 until all remaining Phase 2 capabilities are complete

## 14. Active Step Rule

The main agent must treat the first unfinished item in the ordered step queue as the current step unless a more specific active marker is written here later.
