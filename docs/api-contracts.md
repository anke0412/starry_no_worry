# Starry No Worry API Contracts

This document records the chart API contract shared by the React frontend and FastAPI backend.

## Current Status

This document mixes stable current contracts with incremental Phase 2 target contracts.

Use `work/plans/phase2-full-rollout.md` and the latest `work/decisions/` note to determine which higher-order chart families are source-complete in the current repository before relying on them operationally.

Natal charts include house cusps, Ascendant, Midheaven, supplemental points, and planet house placement.

## Base URL

Local backend:

```text
http://localhost:8000
```

## Health

### GET /api/health

Returns service metadata.

```json
{
  "status": "ok",
  "service": "astrology-calculation-api",
  "version": "0.1.0",
  "environment": "development"
}
```

## Shared Request Shapes

### BirthProfile

```json
{
  "id": "optional-local-id",
  "name": "Luna",
  "date": "1996-04-12",
  "time": "08:30",
  "locationName": "Shanghai",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "timezone": "Asia/Shanghai"
}
```

Required fields:

- `name`
- `date`
- `time`
- `locationName`

Optional fields:

- `id`

Required for calculated natal charts, synastry source natal charts, and transit source natal charts:

- `latitude`
- `longitude`
- `timezone`

### ChartSettings

```json
{
  "houseSystem": "placidus",
  "zodiac": "tropical",
  "aspectSet": "major",
  "orbProfile": "default"
}
```

The backend currently supports:

- house systems: `placidus`, `whole-sign`, `equal`
- zodiac: `tropical`
- aspect sets: `major`, `major_extended`
- orb profiles: `tight`, `default`, `wide`

Unsupported setting values return `422 invalid_chart_request`.

## Shared Generation Layer

Phase 2 introduces a shared backend generation framework for higher-order chart families, including composite and davison fusion charts.
This is an internal orchestration change only.

- `/api/charts/transit` response shape is unchanged
- `/api/charts/synastry` response shape is unchanged
- `/api/charts/composite` is a fused chart response whose top-level placements, houses, and aspects come from the composite chart itself
- `/api/charts/davison` is a fused chart response whose top-level placements, houses, and aspects come from the midpoint event chart rather than midpoint planetary longitudes
- future derived and fusion chart families should reuse the same service layer

## Chart Endpoints

### POST /api/charts/natal

Request:

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
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The natal response includes real planet placements, supplemental calculated points, mean lunar nodes, major aspects, 12 Placidus house cusps, Ascendant, Midheaven, and the house number for each placement.

Every `ChartResult` now also returns a `statistics` object for result-surface summaries and later AI interpretation inputs:

```json
{
  "statistics": {
    "elementCounts": { "fire": 4, "earth": 2, "air": 3, "water": 3 },
    "modalityCounts": { "cardinal": 4, "fixed": 5, "mutable": 3 },
    "polarityCounts": { "yang": 7, "yin": 5 },
    "hemisphereCounts": { "northern": 6, "southern": 6, "eastern": 5, "western": 7 },
    "totalBodies": 12
  }
}
```

`statistics` is calculated from the 10 classical / modern planets plus `Ascendant` and `Midheaven`. Related chart snapshots inside `relatedCharts` carry their own `statistics` as well.

`placements` includes the core planets plus calculated points including:

- `Chiron`
- `Lilith`
- `North Node`
- `South Node`
- `Part of Fortune`
- `Vertex`
- `Ascendant`
- `Midheaven`

Planetary and point placements now populate `retrograde` when the ephemeris motion at the calculated moment is backward in geocentric longitude.

Missing `timezone`, `latitude`, or `longitude` returns `422 invalid_chart_request`.

The backend currently uses the mean lunar node for `North Node`; `South Node` is returned as the exact opposite point.

### POST /api/charts/synastry

Request:

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

Response: `ChartResult`.

The synastry response includes both planetary placement sets, inter-chart major aspects, and both source natal charts in `relatedCharts`. Each related natal chart includes its own houses, Ascendant, and Midheaven.

### POST /api/charts/composite

Request:

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

Response: `ChartResult`.

The composite response is a fused chart result. The top-level `placements`, `houses`, and `aspects` are calculated from the composite chart itself, not copied from either source natal chart.

The top-level composite `chartId` is pair-order-invariant and should change when either source profile identity changes in a way that would change the fused chart input.

`relatedCharts` includes:

- `primaryNatal`
- `secondaryNatal`
- `compositeChart`

`primaryNatal` and `secondaryNatal` are the source natal charts. `compositeChart` is the internal natal snapshot used to generate the top-level fused response; it is not a separate `chartType: "composite"` related chart.

### POST /api/charts/davison

Request:

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

Response: `ChartResult`.

The Davison response is a fused chart result. The top-level `placements`, `houses`, and `aspects` are calculated from the midpoint event chart rather than by averaging the source planets directly.

The top-level Davison `chartId` is pair-order-invariant and should change when either source profile identity changes in a way that would change the fused chart input.

`relatedCharts` includes:

- `primaryNatal`
- `secondaryNatal`
- `davisonChart`

`primaryNatal` and `secondaryNatal` are the source natal charts. `davisonChart` is the internal natal snapshot generated from the midpoint instant and midpoint coordinates that powers the top-level fused response.

### POST /api/charts/transit

Request:

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
  "transitDate": "2026-05-01",
  "transitTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The transit response includes the primary natal planetary placements, transit-sky placements for `transitDate` and `transitTime`, transit-to-natal major aspects, and two source charts in `relatedCharts`:

- `primaryNatal`
- `transitSky`

`primaryNatal` includes houses, Ascendant, and Midheaven. `transitSky` remains a sky snapshot without houses.

### POST /api/charts/progression

Request:

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
  "progressionDate": "2026-05-01",
  "progressionTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The progression response includes the primary natal placements, a progressed-chart placement set derived from the requested forecast instant, and inter-chart aspects between progressed and natal placements.

`relatedCharts` includes:

- `primaryNatal`
- `progressedChart`
- `progressedOverlay`

`progressionDate` and `progressionTime` are interpreted in the source profile timezone and used as the progression target instant.

### POST /api/charts/solar-arc

Request:

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
  "solarArcDate": "2026-05-01",
  "solarArcTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The solar-arc response includes the primary natal placements, a solar-arc directed chart generated by shifting the natal chart through the target solar arc, and inter-chart aspects between directed and natal placements.

`relatedCharts` includes:

- `primaryNatal`
- `solarArcChart`
- `solarArcOverlay`

`solarArcDate` and `solarArcTime` are interpreted in the source profile timezone and used to determine the target Sun longitude whose difference from the natal Sun becomes the shared directing arc.

### POST /api/charts/tertiary-progression

Request:

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
  "tertiaryDate": "2026-05-01",
  "tertiaryTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The tertiary progression response includes the primary natal placements, a tertiary-progressed chart derived from the target instant through a lunar-month scaling rule, and inter-chart aspects between tertiary-progressed and natal placements.

`relatedCharts` includes:

- `primaryNatal`
- `tertiaryProgressedChart`
- `tertiaryProgressedOverlay`

`tertiaryDate` and `tertiaryTime` are interpreted in the source profile timezone and converted into a tertiary-progressed datetime by scaling elapsed life days against the lunar month length.

`progressedChart` includes its own houses, Ascendant, and Midheaven. `progressedOverlay` describes progressed placements flying into natal houses.

### POST /api/charts/solar-return

Request:

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

Response: `ChartResult`.

The solar return response includes the primary natal placements, solar return placements calculated for the exact return moment near the requested anchor, and inter-chart aspects between the solar return and natal placements.

`relatedCharts` includes:

- `primaryNatal`
- `solarReturn`
- `solarReturnOverlay`

`anchorDate` and `anchorTime` are interpreted in `returnLocation.timezone`, then used as a search anchor for the exact solar return instant.

`solarReturn` includes its own houses, Ascendant, and Midheaven. `solarReturnOverlay` describes solar return placements flying into natal houses.

### POST /api/charts/lunar-return

Request:

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
  "anchorDate": "2026-05-16",
  "anchorTime": "06:30",
  "returnLocation": {
    "locationName": "Seoul",
    "latitude": 37.5665,
    "longitude": 126.978,
    "timezone": "Asia/Seoul"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

The lunar return response includes the primary natal placements, lunar return placements calculated for the exact moon-return moment nearest the requested anchor, and inter-chart aspects between the lunar return and natal placements.

`relatedCharts` includes:

- `primaryNatal`
- `lunarReturn`
- `lunarReturnOverlay`

`anchorDate` and `anchorTime` are interpreted in `returnLocation.timezone`, then used as a search anchor for the nearest exact lunar return instant.

`lunarReturn` includes its own houses, Ascendant, and Midheaven. `lunarReturnOverlay` describes lunar return placements flying into natal houses.

## Temporary Not Implemented Response

There are no Phase 1 chart endpoints using the temporary not implemented response. Future placeholder chart endpoints should use:

```json
{
  "error": {
    "code": "not_implemented",
    "message": "Chart calculation endpoint is not implemented yet."
  }
}
```

## Frontend Helper

Frontend payload builders live in `src/lib/api/chartContracts.js`.

They map the current UI profile shape to the backend API contract:

- `location` or `locationName` becomes `locationName`
- empty optional fields are omitted
- default chart settings are attached automatically

## Backend Models

Backend Pydantic models live in `backend/app/models/chart.py`.

The models use Python snake_case internally and JSON aliases externally, for example:

- `chart_type` serializes as `chartType`
- `location_name` serializes as `locationName`
- `house_system` serializes as `houseSystem`
