# Phase 4 Step 4 Marx Dual Definition

## Date

- 2026-05-09

## Decision

Implement `马克思盘` as a dual-result chart family rather than collapsing it into one synthetic chart.

## Approved Contract

- derive the pair's shared `davisonChart` first
- derive `primaryMarxChart` from `primaryNatal + davisonChart`
- derive `secondaryMarxChart` from `secondaryNatal + davisonChart`
- expose both charts together under one top-level `chartType: "marx"` result

## Why

- this matches the approved user direction for the dual-version implementation
- it avoids inventing a single merged marx chart that would lose the separate natal perspectives
- it keeps later `马克思盘-次限/三限` work aligned with an auditable base contract
