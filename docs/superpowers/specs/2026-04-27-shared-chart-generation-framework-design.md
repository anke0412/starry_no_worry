# Shared Chart Generation Framework Design

## Goal

Phase 2 needs a reusable backend service layer that can generate relationship charts and derived charts without duplicating the same orchestration logic for every new chart type.

## Scope

This module only restructures the backend chart generation flow. It does not add new frontend entry points, and it does not expose new chart APIs in this branch.

The branch migrates the existing `synastry` and `transit` services onto a shared framework and introduces the abstraction points needed for future chart families:

- single-subject derived charts
- dual-subject comparison charts
- dual-subject fusion charts

## Problem

The current code already contains the right building blocks:

- `NatalChartService` generates a full natal chart
- `ChartOverlayService` generates house overlays and inter-chart aspects
- `SynastryChartService` and `TransitChartService` assemble higher-level results

The duplication is in the orchestration layer. Each higher-level service currently decides for itself:

- which source charts to generate
- how to derive the second or third chart
- how to assemble overlays
- how to build `relatedCharts`
- how to return the top-level `ChartResult`

That is manageable for `synastry` and `transit`, but it will become fragile once the backend adds `solar return`, `lunar return`, `composite`, `davison`, and other fusion-style charts.

## Design Approach

Add a shared chart generation framework in `backend/app/services/chart_generators.py`.

The framework should define three generator families:

### 1. Single-Subject Derived Generator

Use when one natal profile is the reference and a second chart is derived from a target time or rule set.

Examples:

- transit
- secondary progression
- solar return
- lunar return

Responsibilities:

- build the primary natal chart
- build the derived chart from the primary profile plus target context
- build one overlay from the derived chart into the natal chart
- assemble a top-level `ChartResult`

### 2. Dual-Subject Comparison Generator

Use when two independent natal charts are compared against each other.

Examples:

- synastry
- future comparison-style relationship charts that still keep both source nativities

Responsibilities:

- build the two natal charts
- build directional overlays in both directions
- decide which overlay feeds the top-level `aspects`
- assemble a top-level `ChartResult`

### 3. Dual-Subject Fusion Generator

Use when two source profiles produce a newly generated third chart.

Examples:

- composite chart
- Davison chart
- Ma chart and related fusion workflows

Responsibilities:

- build or normalize the two source nativities
- generate a fused chart input or fused chart result
- optionally generate overlays against the source charts
- assemble a top-level `ChartResult`

This branch only adds the abstraction and test skeleton for this family. It does not implement a fusion algorithm yet.

## Concrete Structure

The framework should stay lightweight and should reuse the current service objects instead of replacing them.

Recommended units:

- `ChartGenerationContext`
  - shared dependencies such as `EphemerisService`, `NatalChartService`, and `ChartOverlayService`
- `BaseChartGenerator`
  - common helper methods for calculation metadata and common placement filtering
- `SingleSubjectDerivedGenerator`
  - common flow for natal plus derived workflows
- `DualSubjectComparisonGenerator`
  - common flow for A/B comparison workflows
- `DualSubjectFusionGenerator`
  - abstract base for future fused workflows

The generator classes should not replace `NatalChartService`. Natal remains the atomic chart builder that all higher chart families depend on.

## Integration Plan

### Transit

`TransitChartService` becomes a thin adapter over `SingleSubjectDerivedGenerator`.

The transit-specific service should still own:

- how to convert `transitDate` and `transitTime` into a derived profile
- chart ids and labels specific to transit
- the outward API contract for `relatedCharts.transitSky`

Everything else should flow through the shared generator path.

### Synastry

`SynastryChartService` becomes a thin adapter over `DualSubjectComparisonGenerator`.

The synastry-specific service should still own:

- chart ids and labels
- overlay ids and user-facing overlay labels
- the outward API contract for `relatedCharts.primaryNatal`, `secondaryNatal`, `primaryOverlay`, and `secondaryOverlay`

Everything else should flow through the shared comparison path.

## API Compatibility

This module is an internal refactor. The public API shape stays the same:

- `POST /api/charts/synastry` remains unchanged
- `POST /api/charts/transit` remains unchanged
- `ChartResult` remains unchanged
- `ChartOverlay` remains unchanged

The frontend should not need any code change to consume this refactor.

## Data Flow

The common orchestration pipeline should become:

1. normalize request settings
2. build source natal chart or charts
3. build derived or comparison target chart when needed
4. build overlay objects through `ChartOverlayService`
5. assemble top-level `ChartResult`
6. attach backward-compatible `relatedCharts`

This keeps the framework centered on reusable chart generation instead of specialized endpoint logic.

## Error Handling

The shared generator layer should preserve the current error behavior:

- invalid birth profile data still raises `ValueError`
- API routers continue returning `422 invalid_chart_request`
- unsupported or incomplete chart settings continue to fail through the existing validation path

The framework should not swallow or reshape domain errors.

## Testing

Tests should cover both framework behavior and compatibility:

- generator-level tests for single-subject derived flow
- generator-level tests for dual-subject comparison flow
- an abstract contract test that proves the dual-subject fusion extension point can be subclassed safely
- existing transit endpoint tests still pass
- existing synastry endpoint tests still pass
- top-level `relatedCharts` keys remain unchanged
- top-level `aspects` still mirror the expected overlay output

## Out of Scope

This branch does not:

- add `solar return`, `lunar return`, `composite`, `davison`, or Ma chart endpoints
- change frontend forms or chart rendering
- redesign `ChartResult`
- change the current interpretation system

## Success Criteria

This module is successful if:

- `transit` and `synastry` both run through the new shared generation layer
- their API responses remain backward compatible
- the codebase has a clear extension point for derived, comparison, and fusion chart families
- future chart types can be added by implementing chart-specific generation rules instead of rewriting orchestration logic
