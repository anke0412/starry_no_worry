# Natal House Angles Design

## Goal

Phase 2 improves the natal chart calculation so the backend can return a more complete chart: 12 house cusps, Ascendant, Midheaven, and house placement for each planet.

## Scope

This module only changes the natal chart calculation path. Synastry and transit continue to use the existing natal output they already depend on, but this branch does not add new synastry or transit interpretation behavior.

## Calculation Approach

Use `pyswisseph` for Placidus house cusps, Ascendant, and Midheaven. Keep the current `ephem` planetary longitude service for this module so the existing planet golden tests and frontend assumptions remain stable.

The backend will require `timezone`, `latitude`, and `longitude` for natal calculations. Timezone remains an IANA timezone string and is normalized through Python `zoneinfo`. Latitude must be between `-90` and `90`; longitude must be between `-180` and `180`.

## API Shape

The existing `ChartResult` shape remains valid:

- `houses` contains 12 `HouseCusp` entries.
- `placements` still contains the 10 default planets.
- `placements` additionally contains `Ascendant` and `Midheaven`.
- Planet placements include a non-null `house`.
- `Ascendant` uses house `1`; `Midheaven` uses house `10`.

`ChartSettings.houseSystem` continues to support only `placidus` in this module.

## Errors

Invalid or incomplete birthplace data returns the existing structured `422 invalid_chart_request` response:

- missing timezone
- missing latitude
- missing longitude
- invalid latitude range
- invalid longitude range
- unsupported house system

## Testing

Tests should prove the new behavior through the public natal API and the new calculation unit:

- natal endpoint returns 12 houses
- natal endpoint includes Ascendant and Midheaven
- planet placements include house numbers
- missing coordinates return a structured error
- invalid coordinates return a structured error
- unsupported house systems return a structured error
