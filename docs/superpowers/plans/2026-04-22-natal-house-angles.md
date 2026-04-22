# Natal House Angles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Placidus houses, Ascendant, Midheaven, and planet house placement to natal chart responses.

**Architecture:** Add a focused house calculation service backed by `pyswisseph`, then compose it inside `NatalChartService` after existing planet longitude calculation. Preserve the existing public `ChartResult` contract by filling `houses`, appending angular placements, and setting each planet placement's `house`.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, `ephem`, `pyswisseph`, pytest.

---

## File Structure

- `backend/requirements.txt`: add the `pyswisseph` runtime dependency.
- `backend/app/models/chart.py`: tighten coordinate validation and house-system contract.
- `backend/app/services/houses.py`: create the Swiss Ephemeris backed house calculation unit.
- `backend/app/services/natal.py`: compose planet, house, angle, and aspect calculations.
- `backend/tests/test_houses.py`: unit tests for house calculation and coordinate validation.
- `backend/tests/test_natal_chart.py`: API-level regression tests for complete natal responses.
- `docs/api-contracts.md`: document Phase 2 natal response behavior.
- `src/lib/api/chartApi.js`: ensure frontend label mapping supports `Ascendant` and `Midheaven`.
- `tests/chartApiClient.test.js`: ensure angular placements map to Chinese labels.

## Tasks

### Task 1: Add failing backend API tests

- [ ] Add tests in `backend/tests/test_natal_chart.py` asserting 12 houses, `Ascendant`, `Midheaven`, and non-null planet house values.
- [ ] Add tests in `backend/tests/test_natal_chart.py` asserting missing and invalid coordinates return `422 invalid_chart_request`.
- [ ] Run `cd backend && ../.venv312/bin/python -m pytest tests/test_natal_chart.py -q` and confirm the new tests fail because houses and angles are not implemented yet.

### Task 2: Add house calculation unit

- [ ] Add `pyswisseph` to `backend/requirements.txt`.
- [ ] Create `backend/app/services/houses.py` with coordinate validation, Julian-day conversion, Placidus house calculation, and house-assignment helpers.
- [ ] Add `backend/tests/test_houses.py` for the calculation helper.
- [ ] Run `cd backend && ../.venv312/bin/python -m pytest tests/test_houses.py -q` and confirm the unit tests pass.

### Task 3: Compose houses into natal charts

- [ ] Update `NatalChartService` to calculate houses for the primary profile.
- [ ] Set the `house` field for each planet placement.
- [ ] Append `Ascendant` and `Midheaven` placements.
- [ ] Keep aspect calculation focused on planetary placements so angle aspects do not change Phase 1 interpretation output.
- [ ] Run `cd backend && ../.venv312/bin/python -m pytest tests/test_natal_chart.py -q` and confirm the API tests pass.

### Task 4: Frontend and docs compatibility

- [ ] Add Chinese labels for `Ascendant` and `Midheaven` in `src/lib/api/chartApi.js`.
- [ ] Add or update frontend mapping tests in `tests/chartApiClient.test.js`.
- [ ] Update `docs/api-contracts.md` to describe Phase 2 natal houses and angle placements.
- [ ] Run `npm test`.

### Task 5: Full verification and publish

- [ ] Run `cd backend && ../.venv312/bin/python -m pytest tests`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit the branch.
- [ ] Push `dev_add_natal_house_angles`.
