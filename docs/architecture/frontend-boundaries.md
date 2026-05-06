# Frontend Boundaries

## Frontend Owns

- chart mode and chart type selection
- profile input flows and advanced settings exposure
- local storage for lightweight browser-side persistence
- chart wheel rendering
- tables, labels, and interaction patterns
- frontend-side request assembly and response rendering

## Frontend Must Not Own

- ephemeris math
- hidden reinterpretation of backend chart data
- silent terminology drift away from the stable domain language

## Current Important Constraints

- the frontend already carries a mature chart wheel and detail surface
- new chart types should fit existing UI reading patterns where possible
- API response handling should stay contract-driven through the existing chart API client and contracts layer
