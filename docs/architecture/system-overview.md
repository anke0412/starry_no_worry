# System Overview

## Top-Level Shape

The project is a two-surface system:

- React + Vite frontend for profile input, chart views, tables, and reports
- FastAPI backend for chart calculation, validation, and structured chart responses

## Stable Architectural Direction

- calculation should stay in the backend
- frontend should consume structured chart results rather than reproduce chart math
- higher-order chart families should reuse the shared generation framework
- interpretation should stay downstream of chart calculation contracts

## Current Major Areas

- frontend input, rendering, and local state
- backend chart APIs and chart generation services
- shared request/response contract between frontend and backend

## Boundary Principle

Chart math and orchestration correctness are architecture-level concerns. Presentation polish and reading clarity are frontend concerns. They meet at the chart contract, not by sharing hidden assumptions.
