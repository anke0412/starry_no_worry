# Testing Strategy

## Baseline Verification Matrix

- backend suite: `cd backend && ../.venv312/bin/python -m pytest tests`
- frontend tests: `npm test`
- frontend build: `npm run build`

## Current Testing Principles

- any behavior change must consider test changes at the same time
- contract changes require contract-test updates
- new chart-family work should include targeted tests around generator behavior and response structure

## Truth Maintenance Rule

Prefer recording reproducible verification commands and collection scale over stale fixed pass counts.
