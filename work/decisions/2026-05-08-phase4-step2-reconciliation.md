# Phase 4 Step 2 Reconciliation

## Date

- 2026-05-08

## Scope

- reconcile the approved Phase 4 relationship-chart scope against the current frontend, backend, contracts, and interpretation surfaces
- identify what can be removed directly, what can be reused safely, and what requires new shared architecture

## Existing Overlap Confirmed

### Frontend catalog and request routing

- `src/data/chartCatalog.js` currently exposes:
  - `组合盘`
  - `时空中点盘`
  - `中点组合盘`
  - `关系流年盘`
  - single-person `次限推运盘`
  - single-person `三限推运盘`
- `src/lib/api/chartApi.js` currently routes:
  - `composite`
  - `davison`
  - `midpoint-composite`
  - `relationship-transit`
  - `progression`
  - `tertiary-progression`
- `src/lib/api/chartContracts.js` currently has payload builders for:
  - `buildCompositeChartPayload`
  - `buildDavisonChartPayload`
  - `buildMidpointCompositeChartPayload`
  - `buildRelationshipTransitChartPayload`
  - `buildProgressionChartPayload`
  - `buildTertiaryProgressionChartPayload`

### Backend chart services and contracts

- `backend/app/api/charts.py` currently publishes routes for:
  - `/api/charts/composite`
  - `/api/charts/davison`
  - `/api/charts/midpoint-composite`
  - `/api/charts/relationship-transit`
  - `/api/charts/progression`
  - `/api/charts/tertiary-progression`
- `backend/app/models/chart.py` currently defines request models for:
  - `CompositeChartRequest`
  - `DavisonChartRequest`
  - `MidpointCompositeChartRequest`
  - `RelationshipTransitChartRequest`
  - `ProgressionChartRequest`
  - `TertiaryProgressionChartRequest`
- backend services already source-complete for:
  - `backend/app/services/composite.py`
  - `backend/app/services/davison.py`
  - `backend/app/services/midpoint_composite.py`
  - `backend/app/services/relationship_transit.py`
  - `backend/app/services/progression.py`
  - `backend/app/services/tertiary_progression.py`

### Shared generation infrastructure

- `backend/app/services/chart_generators.py` already provides reusable patterns for:
  - `DualSubjectFusionGenerator`
  - `DualSubjectDerivedGenerator`
  - `SingleSubjectDerivedGenerator`
- `组合盘` and `时空中点盘` already sit on the fusion path
- `关系流年盘` already sits on the dual-subject-derived path
- single-person `次限` / `三限` already sit on the single-subject-derived path

### Interpretation surface

- `src/lib/interpretationAgent.js` is still a deterministic local report builder
- it already consumes structured chart results, but it does not yet have:
  - retrieval units
  - per-signal queryable library entries
  - partial reading actions for placements / houses / aspects
  - cross-chart context composition
- `src/App.jsx` still creates one full report immediately after chart generation and has no RAG or future Q&A state boundary yet

## Safe Removal Targets

- `中点组合盘` can be removed end-to-end from:
  - frontend catalog
  - frontend API endpoint map and result mapping
  - frontend payload builders/tests
  - backend route
  - backend request model
  - backend service
  - backend tests
  - `docs/api-contracts.md`
- `关系流年盘` can be removed end-to-end from the same layers above

## Safe Reuse Targets

- `组合盘` can remain on the existing fusion-generator path
- `时空中点盘` can remain on the existing fusion-generator path
- the existing contract pattern of:
  - top-level chart result
  - internal source charts in `relatedCharts`
  - overlay-like secondary reading surfaces
  can be reused for future relationship derivatives

## Confirmed Gaps

### Gap 1: no shared generator exists for “base relationship chart first, then progression”

- current `progression` and `tertiary_progression` services derive from a single natal `BirthProfile`
- current `DualSubjectDerivedGenerator` derives a third chart directly from two birth profiles plus a target context
- neither path expresses the new Phase 4 rule:
  - generate a base relationship chart first
  - then apply `次限` or `三限` to that base relationship chart

### Gap 2: no existing chart family implements `马克思盘`

- there is no current frontend category, backend request model, backend route, or backend service for `马克思盘`
- this must be added as a new relationship chart family before its derivatives can exist

### Gap 3: forecast-mode catalog currently only models single-person timing charts

- current `forecast` catalog entries are:
  - `transit`
  - `solar-return`
  - `lunar-return`
  - `solar-arc`
  - `progression`
  - `tertiary-progression`
- Phase 4 needs dual-person progression variants to live under `流年推运盘`, so the current category model is not expressive enough yet

### Gap 4: interpretation contract is not yet retrieval-backed

- the current interpretation layer is full-report-only
- it has no stable contract for:
  - chart context assembly by signal type
  - retrieval tagging
  - cross-chart linkage
  - future user question turns

## Primary Risks

### Risk 1: relationship derivatives cannot safely piggyback on the current single-person progression services

- `组合盘` and `时空中点盘` currently expose a fused chart plus internal source charts
- if the new derivatives are implemented by ad hoc profile reconstruction in each service, the codebase will drift away from the shared-generation rule
- the Phase 4 implementation should therefore introduce one reusable relationship-derivative generation path rather than duplicating custom orchestration per chart family

### Risk 2: deleting `中点组合盘` and `关系流年盘` will affect tests and API-contract docs broadly

- coverage currently exists in:
  - frontend contract tests
  - frontend API client tests
  - backend contract tests
  - backend endpoint/service tests
  - `docs/api-contracts.md`
- Step 3 must treat these removals as contract-affecting work, not just catalog cleanup

### Risk 3: `马克思盘` terminology must be pinned before UI and API naming spreads

- the Phase 4 business meaning is now clear in project memory and the active plan
- implementation should keep one internal identifier and one consistent Chinese display label to avoid repeating the earlier midpoint-composite drift

## Recommended Next Slice

- Step 3 should proceed with deletion of `中点组合盘` and `关系流年盘`
- that keeps the active catalog aligned with approved scope before new chart families and derivative generators are added
