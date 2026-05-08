# Phase 4 Relationship Derivatives And AI

## Header

- Task name: Phase 4 relationship derivatives and AI execution
- Date: 2026-05-08
- Status: active
- Phase: Phase 4

## 1. Task Brief

Turn the newly approved Phase 4 direction into one execution-ready ledger that corrects the relationship-chart family, adds the approved dual-chart progression variants, and evolves interpretation into a retrieval-backed AI pipeline without creating parallel plans.

## 2. Product Intent

The product should move from the closed Phase 3 bootstrap into a Phase 4 chart-reading system centered on relationship-chart depth. This phase should remove incorrect chart families, add Marx-chart-based derivatives, and establish an AI interpretation path that first lands on a bounded subset and then expands across all supported relationship charts.

## 3. Scope

### In Scope

- remove the incorrect `中点组合盘` chart family from backend, frontend, docs, and tests
- remove the incorrect `关系流年盘` chart family from backend, frontend, docs, and tests
- add `马克思盘` as a supported relationship chart family
- add the following relationship derivatives under the `流年推运盘` entry:
  - `时空中点盘-次限盘`
  - `时空中点盘-三限盘`
  - `组合盘-次限盘`
  - `组合盘-三限盘`
  - `马克思盘-次限盘`
  - `马克思盘-三限盘`
- keep the calculation rule explicit: generate the base relationship chart first, then apply the requested progression layer
- build a reusable AI interpretation pipeline around structured chart context, retrieval, and report composition
- land the full AI pipeline on a bounded first subset before promoting it to all in-scope relationship charts
- leave stable integration room for future chart Q&A

### Out Of Scope

- changing the approved Phase 4 chart list without human direction
- replacing chart calculation authority with free-form LLM output
- unrelated platform/account/payment/export work

## 4. Acceptance Criteria

- exactly one active Phase 4 plan exists in `work/plans/`
- `中点组合盘` and `关系流年盘` are removed from source, UI, and tests
- `马克思盘` is implemented as a supported relationship chart family
- all approved relationship `次限/三限` derivatives are implemented and exposed under `流年推运盘`
- the first bounded AI interpretation slice is live on a representative subset of charts
- the AI/RAG contract is reusable for later expansion across all in-scope charts
- plan, docs, decisions, and verification records let the next session continue without re-planning

## 5. Constraints

- preserve `plan.md` as the long-range roadmap
- preserve calculation-first boundaries between chart math and interpretation
- keep `docs/` for stable truth and `work/` for runtime state
- execute every bounded slice through `impl -> review -> verify`
- update plan status and close the git lifecycle before advancing to the next bounded slice

## 6. Ordered Step Queue

- [x] Step 1: Record the Phase 4 reframe, close the old Phase 3 bootstrap ledger, and align stable docs with the new active execution stage
- [x] Step 2: Reconcile the current codebase against the approved Phase 4 relationship-chart scope and capture any implementation gaps or contract risks
- [ ] Step 3: Remove `中点组合盘` and `关系流年盘` from backend, frontend, docs, and tests through `impl -> review -> verify`
- [ ] Step 4: Implement `马克思盘` as a supported relationship chart family through `impl -> review -> verify`
- [ ] Step 5: Implement `时空中点盘` and `组合盘` `次限/三限` derivatives and expose them under `流年推运盘`
- [ ] Step 6: Implement `马克思盘` `次限/三限` derivatives and expose them under `流年推运盘`
- [ ] Step 7: Establish the reusable AI/RAG interpretation contract, retrieval library structure, and frontend extension points through `impl -> review -> verify`
- [ ] Step 8: Connect the full AI interpretation pipeline for the first bounded subset of relationship charts through `impl -> review -> verify`
- [ ] Step 9: Expand the AI interpretation pipeline across the remaining in-scope relationship charts and add cross-chart linkage hooks for future Q&A
- [ ] Step 10: Close the Phase 4 milestone through final verification, plan updates, and git lifecycle completion

## 7. Step Notes

### Step 1

- completed on `2026-05-08`
- closure decision recorded in `work/decisions/2026-05-08-phase4-reframe.md`
- closure verification recorded in `work/runs/2026-05-08-phase4-reframe.md`
- this file is now the only active execution ledger in `work/plans/`

### Step 2

- completed on `2026-05-08`
- reconciliation decision recorded in `work/decisions/2026-05-08-phase4-step2-reconciliation.md`
- verification recorded in `work/runs/2026-05-08-phase4-step2-reconciliation.md`
- key conclusions:
  - `中点组合盘` and `关系流年盘` are broad contract removals touching frontend, backend, docs, and tests
  - `组合盘` and `时空中点盘` can stay on the existing fusion-generator path
  - the new relationship `次限/三限` scope needs a new reusable “base relationship chart first, then progression” generation path rather than ad hoc reuse of current single-person progression services

### Step 3

- removal must include category catalogs, form options, API request builders, backend services/routes if present, report labeling, docs, and tests

### Step 4

- `马克思盘` should be documented as a relationship chart derived from the `时空中点盘` base plus natal-chart combination logic for long-term relationship reading

### Step 5

- these derivatives belong to the `流年推运盘` entry in the frontend rather than the relationship-chart entry itself

### Step 6

- `马克思盘` derivatives depend on the base `马克思盘` implementation from Step 4 and the shared progression pattern validated in Step 5

### Step 7

- the first AI slice should define the stable contract for:
  - chart context assembly
  - retrieval units and tagging
  - sectioned report composition
  - frontend partial-reading entry points

### Step 8

- the first bounded subset should prioritize representative charts that exercise relationship reading and derivative reading without requiring every chart family to move at once

### Step 9

- expansion should reuse the Step 7 contract rather than spawning chart-specific one-off agent flows

## 8. Active Step Rule

The main agent must treat the first unfinished item in the ordered step queue as the current step unless a more specific active marker is written here later.
