# Solar Return Chart Design

## Goal

Add `solar-return` as the first Phase 2 chart-family expansion on top of the shared chart-generation framework.

The first version should let a user:

- enter a natal profile
- enter a target anchor date/time
- enter a dedicated solar-return location
- generate a professional solar return chart
- read it through the existing dual-wheel and table-based result experience

This feature should establish the reusable product and backend pattern for later `lunar return` and other single-subject derived charts.

## Product Definition

### User Mental Model

The solar return chart is not "the chart at the chosen time."

Instead, the chosen time is a **search anchor**. The backend uses it to find the exact moment near that anchor when the transiting Sun returns to the natal Sun longitude.

The resulting chart is then calculated for:

- the exact solar return moment
- the user-provided solar return location

### Phase Placement

`solar-return` belongs under the existing `forecast` mode as a new chart category, not as a new top-level mode.

This preserves the current product architecture:

- `single` for natal
- `couple` for relationship charts
- `forecast` for timing and derived charts

## Scope

### In Scope

- new backend `POST /api/charts/solar-return` endpoint
- new backend request model for anchor datetime + return location
- solar return time-search service logic
- solar return chart generation via the shared `SingleSubjectDerivedGenerator`
- frontend category entry under `forecast`
- frontend input fields for:
  - anchor date
  - anchor time
  - solar return location name
  - solar return latitude
  - solar return longitude
  - solar return timezone
- result-page mapping that reuses the current transit-style dual-wheel reading flow
- updated API contracts
- backend and frontend tests

### Out of Scope

- automatic geocoding or place lookup
- multiple possible return locations
- dedicated solar return interpretation logic
- a separate solar-return-specific visualization style
- advanced toggles between multiple aspect-table perspectives
- lunar return implementation

## Backend Design

### Endpoint

Add:

- `POST /api/charts/solar-return`

Request shape:

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
  "anchorDate": "2026-04-27",
  "anchorTime": "18:00",
  "returnLocation": {
    "locationName": "Tokyo",
    "latitude": 35.6762,
    "longitude": 139.6503,
    "timezone": "Asia/Tokyo"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

### Core Calculation Flow

1. Calculate the natal chart from `primary`.
2. Read the natal Sun longitude from the natal placements.
3. Interpret `anchorDate + anchorTime` in the `returnLocation.timezone`, then convert that local anchor into a concrete search instant.
4. Search near that anchor for the exact instant when the transiting Sun longitude equals the natal Sun longitude.
5. Build a derived birth-profile-like input using:
   - exact return instant
   - `returnLocation`
6. Calculate the solar return chart at that exact instant and location.
7. Build an overlay of solar return placements into natal houses.
8. Return a `ChartResult` compatible with the existing frontend result pipeline.

### Time and Location Rules

The anchor datetime is a search aid, not the final chart time.

The exact chart time used for the solar return chart must always be the computed solar return moment.

The chart location for the solar return chart must always come from `returnLocation`, not the natal location.

The natal chart remains calculated from the natal birth profile.

The anchor datetime should be interpreted in the solar return location timezone, because the user is selecting a local reference time for the place where the return chart is being cast.

### Service Structure

Reuse the shared derived-chart framework by adding a dedicated solar return generator on the same pattern as transit.

Recommended files:

- `backend/app/services/solar_return.py`
- `backend/tests/test_solar_return_chart.py`

Supporting logic may live in:

- `backend/app/services/ephemeris.py` if the Sun longitude search utilities belong there
- or a new focused helper module if search logic needs its own boundary

The generator should:

- subclass `SingleSubjectDerivedGenerator`
- define a typed target context containing:
  - `anchor_date`
  - `anchor_time`
  - `return_location`
- produce a derived chart of type `solarReturn`
- build a `solarReturnOverlay`

### Search Algorithm

The first version should prioritize correctness and testability over premature optimization.

Expected behavior:

- search in a bounded window around the anchor time
- detect a longitude crossing for the natal Sun longitude
- refine to a precise return instant

Recommended first-version search window:

- start with a symmetric window around the anchor, such as `+- 36 hours`
- return a calculation error if no valid solar return is found within that supported window

Implementation can use a practical iterative search strategy such as:

- coarse stepping to find a bracket around the return
- binary refinement or equivalent numeric narrowing to reach stable precision

The exact numeric method is an implementation detail, but the contract must guarantee:

- deterministic behavior for the same request
- failure if no return is found within the defined search window
- explicit, debuggable validation errors

### Response Shape

Top-level response should mirror the transit pattern as closely as possible.

- `chartType: "solarReturn"`
- `title: "{name} Solar Return Chart"` at backend level
- `placements`: combined readable list used by the current frontend result tables
- `aspects`: inter-chart aspects between solar return placements and natal placements
- `relatedCharts`:
  - `primaryNatal`
  - `solarReturn`
  - `solarReturnOverlay`

`solarReturn` should include its own houses, Ascendant, and Midheaven.

`solarReturnOverlay` should describe solar return placements flying into natal houses.

## Frontend Design

### Category Placement

Add a new chart category:

- `id: "solar-return"`
- `mode: "forecast"`
- Chinese label aligned with the existing catalog style

Recommended label:

- `日返盘`

Recommended output title:

- `日返推运盘`

### Form UX

The existing workspace form should remain the primary entry point.

For `solar-return`, show:

- primary person fields
- anchor datetime fields
- return location fields
- advanced settings

The return location must be visually separated from natal data so the user does not confuse:

- birth location
- solar return location

Recommended structure:

- `本人资料`
- `日返参考时间`
- `日返发生地`

### Result UX

The first version should intentionally reuse the transit reading model:

- inner wheel: natal placements
- outer wheel: solar return placements
- tables remain the precise reading surface

Naming should be explicit:

- natal group title: `{姓名} 的本命星体`
- derived group title: `日返星体`
- overlay title: `日返星体飞入 {姓名}`
- result title: `{姓名} 的日返盘`

This keeps the experience familiar while still distinguishing solar return from transit.

## Data Contract Alignment

Frontend helpers will need dedicated support for:

- payload building
- endpoint routing
- result mapping labels

The new chart family should fit the current frontend architecture without requiring a new rendering path.

That means:

- `calculateChart()` adds a solar-return route
- payload contracts add a solar return payload builder
- workspace request creation carries solar-return anchor and return-location fields
- API result mapping treats `solarReturn` similarly to `transitSky`, but with solar-return-specific labels

## Error Handling

The API should return a structured validation or calculation error when:

- required return location fields are missing
- anchor date/time is missing
- the return search fails within the supported search window
- the exact return instant cannot be resolved reliably

Frontend messaging should remain consistent with the existing form error area.

## Testing Strategy

### Backend

Add tests for:

- request validation
- search-anchor behavior
- solar return time resolution logic
- generator-level behavior through `SingleSubjectDerivedGenerator`
- endpoint response contract
- related chart structure
- overlay naming

Backend tests should prove:

- the derived chart uses the computed return instant, not the raw anchor time
- the derived chart uses `returnLocation`
- the overlay is solar-return-to-natal

### Frontend

Add tests for:

- chart catalog category visibility under `forecast`
- request creation for solar return
- payload building for `returnLocation`
- API routing to `/api/charts/solar-return`
- result mapping labels for solar return

The first version does not need custom visual snapshot testing beyond ensuring the result view renders correctly through the existing path.

## Implementation Notes

This should be the first real proof that the shared chart-generation framework can support chart-family expansion cleanly.

If this implementation requires awkward special cases in `transit`-oriented code, prefer small abstractions that make `solar-return` and future `lunar-return` symmetric, rather than adding one-off conditionals.

## Success Criteria

The feature is successful when:

- a user can choose `日返盘` under `推运排盘`
- a user can enter an anchor datetime and a separate return location
- the backend computes the exact solar return moment near the anchor
- the result renders as a natal-inner / solar-return-outer dual-wheel chart
- the tables and overlays remain readable and professionally labeled
- the implementation clearly establishes the reusable pattern for later `lunar return`
