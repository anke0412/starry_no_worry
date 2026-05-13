# Phase 4 Step 9 AI Expansion And Linkage Hooks

## Date

- 2026-05-13

## Decision

Expand the Step 8 AI interpretation pipeline across the remaining in-scope relationship charts by adding chart-specific blueprints and introduce one reusable `linkageHooks` contract for future cross-chart Q&A.

## Approved Shape

- keep the interpretation stack layered as:
  - `context`
  - `signals`
  - `retrieval`
  - `report`
- add the remaining relationship-chart behavior in `blueprints.js` rather than forking the report pipeline
- represent future cross-chart Q&A entry points as structured `linkageHooks` attached to the interpretation context/report
- expose those hooks in the frontend as `跨盘联动入口`

## Why

- the remaining relationship charts already share the same retrieval and context model; they only need chart-specific composition on top
- `linkageHooks` gives future Q&A a stable place to reuse “chart-to-chart” entry points without waiting for a full chat surface
- this keeps Step 9 additive to the Step 7 contract instead of introducing chart-family-specific agent paths that would be hard to audit
