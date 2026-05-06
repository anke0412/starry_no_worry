# Testing Strategy

## Default Verification Matrix

- backend: `cd backend && ../.venv312/bin/python -m pytest tests`
- frontend: `npm test`
- build: `npm run build`

## Rule

Behavior changes must update tests at the same time.
