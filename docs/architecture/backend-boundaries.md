# Backend Boundaries

Backend owns:

- request validation
- datetime, timezone, and coordinate normalization
- ephemeris-backed calculation
- houses, angles, aspects, and point generation
- chart family orchestration
- structured response contracts

## Stable Rule

New chart families should extend shared generation flows rather than spawn disconnected orchestration.
