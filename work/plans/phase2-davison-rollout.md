# Phase 2 Davison Rollout

## Header

- Task name: Davison chart rollout and fusion-family stabilization
- Date: 2026-04-29
- Status: completed
- Phase: Phase 2

## 1. Task Brief

Finish landing `davison` as the next dual-subject fusion chart family, while stabilizing the already-in-progress fusion-chart contract and frontend wiring so Phase 2 can continue from a clean, harness-driven task boundary.

## 2. Product Intent

Phase 2 is expanding advanced chart families. Davison is the next meaningful couple-chart capability after composite because it strengthens the platform's professional depth without changing the product's core interaction model. Finishing this slice also helps prove that the shared fusion generator path is reusable rather than one-off.

## 3. Scope

### In Scope

- complete backend Davison service wiring and tests
- complete frontend Davison catalog, payload, API routing, and workspace mapping
- verify the current composite and fusion-family contract behavior still holds
- update durable docs only where the actual stable contract or supported chart-family list changed

### Out Of Scope

- new analysis-interaction features
- AI interpretation upgrades
- unrelated UI redesign
- roadmap changes beyond the currently implied Phase 2 sequence

### Protected Areas

- existing unrelated in-progress implementation files
- `plan.md` as the authoritative roadmap
- Phase 2 runbook semantics in `docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md`

## 4. Acceptance Criteria

- `/api/charts/davison` returns a fused `ChartResult` backed by a real backend service
- frontend exposes `davison` as a real couple-mode chart category
- Davison requests route through the chart API client with contract-aligned payloads
- Davison results render as a fused relationship chart rather than a placeholder overlay flow
- backend and frontend tests cover Davison behavior
- no regression is introduced to the current composite or solar-return/fusion-related contract surface

## 5. Constraints

- preserve the shared chart generation framework as the implementation path
- keep terminology professional and Chinese labels consistent
- avoid shadow contracts between frontend and backend
- keep the task bounded to chart-family rollout and contract stabilization

## 6. Execution Graph

### Main-Agent Work

- reconcile current in-progress Davison/composite-related file state
- choose the exact task slice boundaries for `impl`, `review`, and `verify`
- integrate accepted results
- update plan state and stable docs where needed

### `impl` Subagent Work

- finish `backend/app/services/davison.py`
- complete any missing route/model integration required by the live Davison flow
- wire `davison` into `src/data/chartCatalog.js`, `src/lib/api/chartContracts.js`, and `src/lib/api/chartApi.js`
- update relevant backend and frontend tests

### `review` Subagent Work

- audit fusion-generator reuse
- check contract coherence between backend response shape and frontend mapping
- check for naming drift in user-facing labels and related-chart keys
- inspect regression risk for the composite flow

### `verify` Subagent Work

- run targeted backend Davison/composite/generator tests
- run frontend API/client contract tests
- run repo baseline verification commands unless a real exemption is documented

## 7. Verification Plan

### Targeted Backend

- `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_davison_chart.py tests/test_composite_chart.py tests/test_chart_generators.py tests/test_chart_contracts.py -q`

### Targeted Frontend

- `cd /Users/lianke/PycharmProjects/star && npm test -- tests/chartApiContracts.test.js tests/chartApiClient.test.js`

### Baseline Matrix

- `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests`
- `cd /Users/lianke/PycharmProjects/star && npm test`
- `cd /Users/lianke/PycharmProjects/star && npm run build`

## 8. Risks

### Product Risks

- Davison may surface professional distinctions that are not explained clearly in current UI copy

### Technical Risks

- frontend mapping may accidentally treat Davison like synastry or overlay-based charts
- fusion-family contracts may drift if related-chart keys differ between composite and Davison
- untracked in-progress code may have partial assumptions that no longer match the final contract

### Coordination Risks

- the repo already contains in-progress changes, so the main agent must carefully integrate rather than overwrite
- review and verify may be skipped if the task is mistaken as "almost already done"

## 9. Recovery Rules

- if Davison implementation reveals a contract mismatch, update the contract explicitly and adjust both sides together
- if current in-progress changes are internally inconsistent, stop and narrow the task to the smallest coherent rollout slice before redispatch
- if verify exposes wider fusion-framework issues, reopen the plan and split stabilization from feature rollout
- escalate only if finishing Davison would require changing the roadmap order or rethinking the shared generator architecture

## 10. Decision Capture

- stable supported-chart-family additions should be reflected in `docs/product/scope.md` and `docs/api-contracts.md` if needed
- durable fusion-family architecture learnings should be promoted into `docs/architecture/backend-boundaries.md` or `docs/architecture/data-contracts.md`
- temporary reconciliation notes about partial in-progress code belong in `work/decisions/` until confirmed

## 11. Implementation Context

The current repo state already suggests Davison rollout is the next coherent task boundary:

- `backend/app/api/charts.py` already imports `DavisonChartRequest` and exposes `/api/charts/davison`
- `backend/app/models/chart.py` already defines `DavisonChartRequest`
- `backend/app/services/davison.py` and `backend/tests/test_davison_chart.py` exist as in-progress files
- `src/data/chartCatalog.js` currently includes `composite` and `solar-return` but not `davison`
- `src/lib/api/chartContracts.js` currently supports `composite` payload building but not a Davison-specific helper

This plan should therefore treat Davison as the active feature rollout, not as a speculative future idea.

## Completion Note

Completed on 2026-04-29.

Delivered outcomes:

- Davison is exposed in the frontend chart catalog as a real couple-mode chart
- Davison payload building and API routing are wired through the frontend client layer
- Davison fused-chart mapping is covered by frontend tests
- targeted backend Davison/composite/generator/contract tests passed
- repo baseline verification passed, including backend pytest, frontend test suite, and frontend production build
