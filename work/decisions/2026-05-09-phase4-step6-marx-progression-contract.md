# Phase 4 Step 6 Marx Progression Contract

## Date

- 2026-05-09

## Decision

Implement `马克思盘` `次限/三限` as dual-perspective forecast families rather than collapsing them into one merged relationship progression chart.

## Approved Contract

- frontend exposes:
  - `marx-progression`
  - `marx-tertiary-progression`
- backend keeps the top-level `ChartResult` shell empty for these two families
- backend preserves `davisonChart`, `primaryMarxChart`, and `secondaryMarxChart`
- backend derives one progressed Marx chart per perspective
- backend derives one overlay per perspective back into the corresponding Marx base-chart houses
- frontend result pages show:
  - two visible placement groups, one progressed Marx chart per perspective
  - two overlay tables, one per perspective

## Why

- this preserves the Step 4 truth that Marx is inherently dual-result
- it avoids misleading merged placements/aspects across two different perspectives
- it fits the current wheel/UI capacity better than trying to render four placement groups at once
