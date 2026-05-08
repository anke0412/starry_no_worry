# Phase 3 Reconciliation

## Date

- 2026-05-08

## Context

`phase2-full-rollout` 已完成，仓库需要从 `plan.md` 的 Phase 3 additions 反向核对当前源码现状，避免重复实现已经落地的盘型能力，也避免在没有账本的情况下直接跳入平台型工作。

## Findings

### Already Source-Complete Or Clearly Present

- `solar return and lunar return charts`
  - frontend categories and request builders exist
  - backend routes and services exist
- `solar arc directions`
  - frontend category and request builder exist
  - backend route and service exist
- `midpoint charts`
  - `davison` and `midpoint-composite` are already source-complete
- `advanced relationship techniques`
  - `synastry`, `composite`, `davison`, `midpoint-composite`, and `relationship-transit` already exist
- `secondary progressions expansion`
  - `progression` and `tertiary-progression` already exist, so the expansion is partially present rather than empty

### Clearly Missing Or Still Platform-Level Gaps

- additional timing systems such as profections, zodiacal releasing, firdaria, or other selected systems
- expanded built-in location coverage beyond China and the United States
- user accounts
- cloud-saved birth profiles, chart history, and generated reports
- shareable chart and report links
- PDF or image export
- payment, credits, or membership
- admin and operations tools for prompt versions, report templates, and calculation settings
- privacy, consent, deletion, and data export flows

### Phase Boundary Interpretation

- Phase 3 does not start from an empty advanced-chart surface; several chart-family additions listed under Phase 3 in `plan.md` were already delivered during late Phase 2 rollout.
- The first safe Phase 3 execution slices should therefore bias toward platform gaps rather than re-implementing chart families that already exist.

## Evidence

- frontend categories: `src/data/chartCatalog.js`
- frontend request contracts: `src/lib/api/chartContracts.js`
- frontend API routing: `src/lib/api/chartApi.js`
- location preset catalog: `src/data/locationCatalog.js`
- backend chart routes: `backend/app/api/charts.py`
- backend services:
  - `backend/app/services/solar_return.py`
  - `backend/app/services/lunar_return.py`
  - `backend/app/services/solar_arc.py`
  - `backend/app/services/progression.py`
  - `backend/app/services/tertiary_progression.py`
  - `backend/app/services/davison.py`
  - `backend/app/services/midpoint_composite.py`
  - `backend/app/services/relationship_transit.py`
