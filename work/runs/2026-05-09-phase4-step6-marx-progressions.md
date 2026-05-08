# Phase 4 Step 6 Verification

## Date

- 2026-05-09

## Scope

- verify `马克思盘` `次限/三限` are available under the frontend `流年推运盘` entry
- verify the backend preserves the dual-perspective Marx contract while adding per-perspective progression layers
- verify the frontend renders these families as two progressed placement groups plus two overlay tables without breaking current wheel behavior
- verify the default matrix still passes after adding the new Marx timing variants

## Targeted Checks

- `node --test tests/chartApiContracts.test.js tests/chartApiClient.test.js tests/chartEngine.test.js`
- `cd backend && ../.venv312/bin/python -m pytest tests/test_chart_contracts.py tests/test_marx_progression_chart.py`

## Default Matrix

- backend: `cd backend && ../.venv312/bin/python -m pytest tests`
- frontend: `npm test`
- build: `npm run build`

## Result

- frontend forecast catalog now also includes:
  - `马克思盘次限盘`
  - `马克思盘三限盘`
- backend now exposes:
  - `POST /api/charts/marx-progression`
  - `POST /api/charts/marx-tertiary-progression`
- targeted frontend tests passed: `70 pass`
- targeted backend tests passed: `43 passed`
- backend full suite passed: `110 passed`
- frontend full suite passed: `107 pass`
- production build passed

## Notes

- the frontend intentionally renders only the two progressed Marx perspectives as visible wheel/table groups; the base Marx perspectives remain available through `relatedCharts` and the two overlay sections, which keeps the UI readable without discarding the dual-result contract
