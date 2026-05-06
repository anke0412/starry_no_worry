# Integration Rules

## External And Cross-Layer Rules

- frontend talks to backend through the chart API client layer
- backend integrates with ephemeris libraries and local ephemeris assets
- no new third-party dependency should be added casually in Phase 2

## Introduction Rules

- new chart-family behavior should first fit into the existing service contracts
- new integrations must preserve the current trust boundary where the backend is the calculation authority
- if a dependency affects calculation correctness or environment setup, document the operational impact in engineering docs
