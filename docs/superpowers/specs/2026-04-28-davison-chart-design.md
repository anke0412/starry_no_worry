# Davison Chart Design

## Goal

Add `davison` as the next Phase 2 dual-subject fusion chart on top of the shared chart-generation framework.

The first version should let a user:

- enter two natal profiles
- generate a professional Davison relationship chart
- read it through the existing chart wheel and table-based result workspace
- clearly distinguish it from midpoint composite logic

This feature should establish the product and backend pattern for time-space-midpoint relationship charts while reusing the fusion infrastructure completed for `composite`.

## Product Definition

### User Mental Model

The Davison chart is not the midpoint of two natal planetary longitudes.

Instead, it is the chart cast for:

- the midpoint instant between two birth instants
- the midpoint location between two birth locations

Then the chart is calculated as a real chart for that midpoint time and place.

That means Davison should be positioned as a separate relationship technique from `composite`, not a variant label for the same result.

### Phase Placement

`davison` belongs under the existing `couple` mode as a chart category beside `synastry` and `composite`.

This preserves the current product architecture:

- `single` for natal
- `couple` for relationship charts
- `forecast` for timing and derived charts

## Scope

### In Scope

- new backend `POST /api/charts/davison` endpoint
- backend request model or reuse of the existing dual-profile request shape if it remains contract-compatible
- Davison time-space-midpoint calculation service logic
- Davison chart generation via the shared `DualSubjectFusionGenerator`
- frontend chart catalog entry under `couple`
- frontend API routing for `davison`
- frontend fused result mapping for Davison
- updated API contracts
- backend and frontend tests

### Out of Scope

- composite midpoint-longitude logic changes
- Ma chart implementation
- dedicated Davison interpretation copy
- overlay tables against the source natals in the first version
- alternative geographic midpoint algorithms beyond the current selected rule for this implementation

## Backend Design

### Endpoint

Add:

- `POST /api/charts/davison`

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

The first version should keep the request shape aligned with `synastry` and `composite` so the frontend can reuse the same dual-profile payload builder pattern.

### Core Calculation Flow

1. Calculate the natal chart for `primary`.
2. Calculate the natal chart for `secondary`.
3. Build a synthetic Davison profile from the midpoint instant and midpoint coordinates of the two source profiles.
4. Calculate a real chart for that synthetic profile through the existing natal chart service.
5. Return a `ChartResult` whose top-level placements, houses, and aspects describe the Davison chart itself.
6. Preserve both source natal charts and the internal Davison chart snapshot in `relatedCharts`.

### Davison Rules

The first version should follow standard Davison logic:

- midpoint instant is the arithmetic midpoint between the two UTC birth instants
- midpoint latitude is the arithmetic midpoint between the two natal latitudes
- midpoint longitude is the arithmetic midpoint between the two natal longitudes
- the resulting chart is a real chart calculated for that midpoint time and place

This is intentionally the inverse of `composite`:

- `composite`: midpoint planetary longitudes, synthetic houses/angles
- `davison`: midpoint time/place, real chart recalculation for all placements/houses/angles

### Synthetic Profile Rules

The synthetic Davison profile should:

- use the midpoint UTC instant as the true calculation moment
- use `"UTC"` as the stored timezone to avoid request-order leakage
- format `date` and `time` from that UTC instant for the synthetic profile handoff
- use a relationship-oriented synthetic name, not either individual natal name

### Generator Structure

Reuse the fusion infrastructure completed for `composite`.

Recommended files:

- `backend/app/services/davison.py`
- `backend/tests/test_davison_chart.py`

The generator should:

- subclass `DualSubjectFusionGenerator`
- reuse the existing shared context
- build a synthetic Davison `BirthProfile`
- calculate the Davison chart through `NatalChartService.calculate_from_profile`
- package the result into a `ChartResult`

### Response Shape

Top-level response should describe the Davison chart itself.

- `chartType: "davison"`
- `title: "{primary} × {secondary} Davison Chart"` at backend level
- `placements`: Davison placements
- `houses`: Davison houses
- `aspects`: Davison intra-chart aspects
- `relatedCharts`:
  - `primaryNatal`
  - `secondaryNatal`
  - `davisonChart`

`davisonChart` should be documented as the internal natal-style snapshot used to generate the top-level fused Davison response.

## Frontend Design

### Category Placement

Add a new chart category:

- `id: "davison"`
- `mode: "couple"`

Recommended Chinese label:

- `时空中点盘`

Recommended output title:

- `时空中点盘`

### Form UX

No new form fields are needed beyond the current couple-chart flow:

- primary person fields
- secondary person fields
- advanced settings

The user should choose Davison by category, not by unlocking extra parameters.

### Result UX

The first version should present Davison as a fused relationship chart, parallel to composite:

- one main wheel for the Davison chart
- one placement group for the Davison placements
- one aspect table for Davison internal aspects
- no overlay tables by default

Recommended placement group title:

- `时空中点盘星体`

Recommended result title:

- `{姓名A} × {姓名B} 的时空中点盘`

### Distinction From Composite

The UI should keep Davison and composite distinct in naming and routing, because they represent different relationship techniques even though they share the same high-level fused presentation style.

## Data Contract Alignment

Frontend helpers will need support for:

- routing `davison` to `/api/charts/davison`
- building a dual-profile payload
- mapping `relatedCharts.primaryNatal`
- mapping `relatedCharts.secondaryNatal`
- mapping `relatedCharts.davisonChart`

The frontend should treat Davison like a fused chart family, not an overlay family.

## Testing Strategy

### Backend

Add tests for:

- request contract and endpoint registration
- midpoint UTC instant behavior
- midpoint coordinate behavior
- service delegation
- endpoint response contract with `relatedCharts.davisonChart`
- clear behavioral distinction from composite

### Frontend

Add tests for:

- chart catalog entry under `couple`
- API helper routing `davison` to `/api/charts/davison`
- fused result mapping for Davison
- no overlay table mapping for Davison

## Non-Goals For This Step

This step does not yet solve:

- Davison overlays against source natals
- dedicated Davison interpretation
- advanced geographic midpoint handling near the antimeridian or poles beyond the selected first-version rule
- Ma chart implementation

## Success Criteria

This feature is successful when:

- a user can choose `时空中点盘` under `双人合盘`
- the frontend sends a real backend request to `/api/charts/davison`
- the backend returns a valid Davison fused chart result
- the result page shows a fused Davison relationship chart distinct from `composite`
- the implementation clearly separates midpoint-composite and time-space-midpoint chart semantics
