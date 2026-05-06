# Composite Chart Design

## Goal

Add `composite` as the next Phase 2 chart-family expansion on top of the shared chart-generation framework.

The first version should let a user:

- enter two natal profiles
- generate a professional midpoint composite chart
- read the result through the existing chart wheel and table-based result workspace
- inspect the relationship chart as its own fused chart instead of a directional overlay

This feature should establish the reusable backend and product pattern for later `davison`, Ma chart variants, and other dual-subject fusion charts.

## Product Definition

### User Mental Model

The composite chart is the relationship chart created from the midpoint positions between two natal charts.

It is not:

- a synastry overlay
- a transit-style derived chart
- one person's planets flying into the other person's houses

Instead, it is a third chart built from the two natal charts and then read as the chart of the relationship itself.

### Phase Placement

`composite` belongs under the existing `couple` mode as a chart category beside `synastry`.

This preserves the current product architecture:

- `single` for natal
- `couple` for relationship charts
- `forecast` for timing and derived charts

## Scope

### In Scope

- new backend `POST /api/charts/composite` endpoint
- new backend request model or reuse of the current dual-profile request shape if it remains contract-compatible
- midpoint composite calculation service logic
- composite chart generation via the shared `DualSubjectFusionGenerator`
- frontend API routing for `composite`
- frontend result mapping for a fused relationship chart
- reuse of the existing chart wheel and result table layout
- updated API contracts
- backend and frontend tests

### Out of Scope

- Davison chart implementation
- midpoint composite workflow variants beyond the core midpoint chart
- dedicated composite-only interpretation copy
- alternative house-system rules beyond the same configurable chart settings already supported elsewhere
- dual directional overlays on the first version
- a separate relationship visualization style

## Backend Design

### Endpoint

Add:

- `POST /api/charts/composite`

Recommended request shape:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "latitude": 31.2304,
    "longitude": 121.4737,
    "timezone": "Asia/Shanghai"
  },
  "secondary": {
    "name": "Sol",
    "date": "1993-09-07",
    "time": "21:10",
    "locationName": "Beijing",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "timezone": "Asia/Shanghai"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

The first version should reuse the same payload shape as `synastry` where possible so the frontend can add the new category with minimal request branching.

### Core Calculation Flow

1. Calculate the natal chart for `primary`.
2. Calculate the natal chart for `secondary`.
3. Build a composite chart input from midpoint positions between the two natal charts.
4. Calculate composite houses and angles using a deterministic composite chart profile.
5. Return a `ChartResult` whose top-level placements, houses, and aspects describe the fused relationship chart.
6. Preserve both source natal charts in `relatedCharts` so the frontend can still present supporting context.

### Midpoint Rules

The first version should use standard shortest-arc midpoint logic for ecliptic longitudes.

Expected behavior:

- each composite placement is the midpoint between the two natal longitudes
- wraparound across `0° Aries` must be handled correctly
- the same supported bodies already exposed by the current chart settings should participate
- houses and angles should be recalculated for the composite profile rather than copied from either natal chart

The first version should keep the chart mathematically deterministic and testable; it does not need extra interpretive weighting rules.

### Composite Chart Profile

The composite chart needs a synthetic profile so the existing natal calculation path can still own:

- house calculation
- angle calculation
- chart packaging shape

Recommended first-version rule:

- chart datetime uses the midpoint instant between the two birth instants after timezone normalization
- chart coordinates use the arithmetic midpoint between the two natal coordinates
- chart timezone uses `"UTC"` internally for the synthetic profile id and calculation handoff, because the computed instant is already absolute
- the synthetic profile name should reflect that this is the relationship chart, not either individual natal

This keeps the service internally consistent and lets the existing natal chart service remain the calculator of record.

### Generator Structure

Extend the shared fusion layer instead of building a one-off orchestration service.

Recommended files:

- `backend/app/services/composite.py`
- `backend/tests/test_composite_chart.py`

The generator should:

- subclass `DualSubjectFusionGenerator`
- calculate source natal charts through the shared context
- build a fused composite profile from the two source charts
- calculate the composite chart through `NatalChartService`
- package the result into a `ChartResult`

### Fusion Generator Contract

`DualSubjectFusionGenerator` currently has no reusable implementation.

The composite work should turn it into a real base flow that owns:

1. build primary natal
2. build secondary natal
3. build fused chart
4. package result

Required subclass extension points:

- how to build the fused chart or fused profile
- how to label the result
- how to package `relatedCharts`

The base class should stay narrow and only absorb behavior that later `davison` can also reuse.

### Response Shape

Top-level response should describe the composite chart itself.

- `chartType: "composite"`
- `title: "{primary} × {secondary} Composite Chart"` at backend level
- `placements`: composite placements
- `houses`: composite houses
- `aspects`: composite intra-chart aspects
- `relatedCharts`:
  - `primaryNatal`
  - `secondaryNatal`
  - `compositeChart`

The first version should not add `primaryOverlay` or `secondaryOverlay`, because that would blur the distinction between `synastry` and `composite`.

## Frontend Design

### Category Placement

The existing catalog already includes:

- `id: "composite"`
- `mode: "couple"`

This feature should keep that placement and switch the category from unsupported placeholder to live backend integration.

### Form UX

No new form fields are needed beyond the current couple-chart flow:

- primary person fields
- secondary person fields
- advanced settings

This is intentionally simpler than `solar-return`, because composite does not need a third time or location input.

### Result UX

The first version should present the composite chart as a single fused chart.

Recommended result structure:

- main wheel shows the composite placements
- placement group title: `组合盘星体`
- aspect table reads composite internal aspects
- no overlay house tables by default

Supporting context can still be preserved in `rawResult.relatedCharts` for future interaction work, but the first version should optimize for a clean relationship-chart reading surface.

### Naming

Recommended labels:

- category label: keep `组合盘`
- frontend result title: `{姓名A} × {姓名B} 的关系组合盘`
- placement group title: `组合盘星体`

The user-facing copy should make it obvious this is the chart of the relationship, not one person against the other.

## Data Contract Alignment

Frontend helpers will need support for:

- routing `composite` to `/api/charts/composite`
- building a synastry-style dual-profile payload
- mapping `relatedCharts.primaryNatal`
- mapping `relatedCharts.secondaryNatal`
- mapping `relatedCharts.compositeChart`

The frontend should stop throwing the current "not yet connected" error for `composite`.

## Testing Strategy

### Backend

Add tests for:

- request contract and endpoint registration
- midpoint longitude wraparound behavior
- fused generator/service delegation
- response contract for `relatedCharts`
- composite chart result returning composite placements and houses

### Frontend

Add tests for:

- API helper routing `composite` to the new backend endpoint
- result mapping that treats composite as a fused chart instead of an unsupported category
- result page behavior that does not render overlay tables for composite unless overlay data is explicitly added later

## Non-Goals for This Step

This step does not yet solve:

- Davison chart
- comparative relationship reading overlays
- interaction-level highlighting between source natal charts and the composite chart
- composite-specific AI interpretation

Those should come after the composite baseline contract is stable.

## Success Criteria

This feature is successful when:

- a user can choose `组合盘` under `双人合盘`
- the frontend sends a real backend request instead of rejecting the category
- the backend returns a valid composite chart result
- the result page shows a professional fused relationship chart
- the implementation clearly establishes the reusable pattern for later dual-subject fusion chart families
