# Phase 4 Step 5 Relationship Progression Path

## Date

- 2026-05-09

## Decision

Implement `组合盘` and `时空中点盘` `次限/三限` by reusing a shared “dual-subject fused-base derived” generator path instead of forcing the existing single-person or dual-natal-derived generators to fit.

## Approved Contract

- frontend exposes four new forecast categories:
  - `composite-progression`
  - `davison-progression`
  - `composite-tertiary-progression`
  - `davison-tertiary-progression`
- backend builds `primaryNatal` and `secondaryNatal` first
- backend builds the requested base relationship chart (`compositeChart` or `davisonChart`)
- backend derives the requested timing chart from that base relationship chart
- backend overlays the derived relationship chart back into the base relationship houses
- result shape keeps:
  - merged top-level placements for timing reading
  - top-level overlay aspects
  - source/reference charts in `relatedCharts`

## Why

- this matches the Phase 4 rule: generate the base relationship chart first, then apply progression
- it keeps Step 5 bounded while creating a reusable seam for Step 6 `马克思盘` derivatives
- it avoids the semantic mismatch in `DualSubjectDerivedGenerator`, which overlays a derived chart into each natal chart instead of the base relationship chart
