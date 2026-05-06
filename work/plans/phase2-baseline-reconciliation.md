# Phase 2 Baseline Reconciliation

## Header

- Task name: Phase 2 baseline reconciliation and branch stabilization
- Date: 2026-04-29
- Status: completed
- Phase: Phase 2

## 1. Task Brief

Create one execution-ready recovery task that turns the current dirty Phase 2 worktree into a harness-controlled, auditable baseline on a dedicated branch.

Why now:

- both existing `work/plans/` task files are already marked `completed`
- the current worktree still contains uncommitted harness, composite, and Davison changes
- Phase 2 cannot safely continue to the next chart-family task until this baseline is reconciled

## 2. Product Intent

The user should be able to resume Phase 2 from one trustworthy branch and one trustworthy active plan, without losing the already-landed composite, Davison, and harness work or re-litigating what is supposed to be in scope.

## 3. Scope

### In Scope

- adopt `codex/phase2-baseline-reconciliation` as the task branch for the current dirty worktree
- reconcile the current composite, Davison, and harness changes against the documented Phase 2 direction
- make only the minimal code or runtime-doc updates needed to bring the current dirty worktree to a reviewable baseline
- run the required `impl -> review -> verify` flow on this reconciliation task
- update `work/plans/` runtime status so the next session can recover cleanly

### Out Of Scope

- reordering `plan.md`
- starting the next new chart family before the current baseline is verified
- unrelated UI redesign or speculative feature expansion
- rewriting stable docs unless the code already changed a durable truth

### Protected Areas

- `plan.md`
- unrelated user changes outside the current composite/Davison/harness slice
- any future Phase 2 feature scope not already represented in the current dirty worktree

## 4. Acceptance Criteria

- one active execution-ready task exists in `work/plans/`
- the current branch for this task is `codex/phase2-baseline-reconciliation`
- the current dirty changes are classified into the bounded reconciliation scope instead of remaining as untracked drift
- any missing fixes required for composite/Davison/harness coherence are applied
- independent `review` and `verify` conclusions are recorded before this task is marked complete
- runtime plan state is updated by the main agent at the end of the task

## 5. Constraints

- preserve the current Phase 2 priority: new chart-family expansion before analysis interaction and AI interpretation
- respect the shared chart generation framework as the architecture path
- keep Chinese terminology precise and consistent
- do not treat previous `completed` plans as still-active tasks
- use the default verification matrix unless a real exemption is documented

## 6. Execution Graph

### Main-Agent Work

- restore context from stable docs and current worktree state
- create the new active runtime plan and align `work/plans/README.md`
- choose the smallest reconciliation slice that can produce a clean Phase 2 baseline
- integrate subagent outputs, update plan status, and decide completion

### `impl` Subagent Work

- inspect the current composite, Davison, and harness diff
- make minimal fixes needed for contract, tests, docs, or runtime-plan coherence
- call out any risky or out-of-scope changes discovered in the dirty worktree

### `review` Subagent Work

- independently review the reconciled baseline for regression risk, contract drift, and scope creep
- confirm the task still matches the Phase 2 roadmap order and harness rules

### `verify` Subagent Work

- run targeted composite/Davison tests and contract tests
- run the baseline backend, frontend, and build verification matrix
- report actual pass/fail/blocker status for each command

## 7. Verification Plan

### Targeted Backend

- `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_composite_chart.py tests/test_davison_chart.py tests/test_chart_generators.py tests/test_chart_contracts.py -q`

### Targeted Frontend

- `cd /Users/lianke/PycharmProjects/star && npm test -- tests/chartApiContracts.test.js tests/chartApiClient.test.js`

### Baseline Matrix

- `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests`
- `cd /Users/lianke/PycharmProjects/star && npm test`
- `cd /Users/lianke/PycharmProjects/star && npm run build`

## 8. Risks

### Product Risks

- a baseline-only task could accidentally be mistaken for approval to start the next chart family without explicit planning

### Technical Risks

- the dirty worktree may contain partially integrated contract changes
- completed plan notes may overstate verification relative to the current local state
- harness runtime docs may drift if the new active plan is not updated at completion

### Coordination Risks

- review and verify could be skipped if the current changes look “already done”
- untracked files may hide assumptions that are not obvious from the staged diff alone

## 9. Recovery Rules

- if reconciliation reveals a larger feature gap, stop and create a new dedicated Phase 2 feature plan before expanding scope
- if verification fails because the current worktree is internally inconsistent, return to `impl` and keep the task bounded to the smallest fixing slice
- if durable truth changed, update the corresponding stable docs in `docs/`
- escalate to the human if finishing the baseline would require roadmap reprioritization, destructive cleanup, or broad scope reset

## 10. Decision Capture

- temporary reasoning about which dirty files belong to this reconciliation scope should go to `work/decisions/` only if that reasoning needs to survive this session
- durable contract truth should be promoted to `docs/api-contracts.md` and relevant `docs/architecture/` files if confirmed
- completion status, residual risks, and next-task handoff belong in this plan file

## Completion Note

Completed on 2026-04-29.

Delivered outcomes:

- created the dedicated branch `codex/phase2-baseline-reconciliation`
- restored `work/plans/` to a valid harness entrypoint with a reconciliation task instead of relying on already-completed plans
- ran an independent `impl -> review -> verify` flow across the current composite, Davison, and harness baseline
- fixed a real fusion-chart contract risk by making composite and Davison top-level `chartId` generation sensitive to full source profile identity and invariant to primary/secondary order
- updated `docs/api-contracts.md` to reflect the durable `chartId` rule for fusion charts

Evidence summary:

- `impl`: initial bounded inspection found no broad coherence gap; follow-up TDD repair added failing tests for `chartId` collision/order sensitivity and then fixed the backend id builders
- `review`: first review found the `chartId` collision risk; second review reported no remaining findings after the fix
- `verify`: targeted backend `36 passed`, targeted frontend `42 passed`, backend suite `85 passed`, frontend suite `42 passed`, and `npm run build` completed successfully

Residual risks:

- API-level tests still focus more on payload and related-chart structure than on asserting the top-level `chartId` directly
- the next Phase 2 feature task still needs a new execution-ready plan before additional implementation work starts
