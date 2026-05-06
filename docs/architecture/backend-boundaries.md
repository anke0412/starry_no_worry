# Backend Boundaries

## Backend Owns

- request validation
- datetime, timezone, and coordinate normalization
- ephemeris-backed chart calculation
- house, angle, aspect, and point generation
- chart family orchestration
- structured API responses and error contracts

## Stable Backend Direction

- FastAPI remains the service boundary
- calculation correctness is preferred over convenience shortcuts
- new chart families should be added by extending the shared generator model, not by spawning disconnected flows

## Sensitive Areas

- chart generator orchestration
- chart models and API contracts
- ephemeris and supplemental point calculation behavior
- compatibility between backend output and frontend assumptions
